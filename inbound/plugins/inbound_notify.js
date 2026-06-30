'use strict'
// inbound_notify — publishes a compact JSON event to Redis for every accepted
// INBOUND message, so the admin API can stream them to users over WebSocket.
//
// INBOUND ONLY: authenticated/relaying (outbound submission) traffic is skipped,
// so even if this plugin is loaded on a combined instance it never leaks
// outbound mail onto the inbound channel.
//
// Config: config/inbound_notify.ini
//   [main]
//   url=redis://127.0.0.1:6379
//   channel=haraka:inbound
//
// Event payload includes `raw`: the full unparsed email (headers + body).

const { createClient } = require('redis')

exports.register = function () {
  this.load_cfg()
  this.register_hook('queue', 'notify')
}

exports.load_cfg = function () {
  const cfg = this.config.get('inbound_notify.ini', () => this.load_cfg())
  this.redis_url = cfg.main?.url || 'redis://127.0.0.1:6379'
  this.channel = cfg.main?.channel || 'haraka:inbound'
}

exports.init_redis = async function () {
  if (this.client) return
  this.client = createClient({ url: this.redis_url })
  this.client.on('error', (e) => this.logerror(`redis: ${e.message}`))
  try {
    await this.client.connect()
    this.loginfo(`publishing inbound mail to ${this.redis_url} (${this.channel})`)
  } catch (e) {
    this.logerror(`redis connect failed: ${e.message}`)
  }
}

exports.hook_init_master = function (next) {
  this.init_redis().finally(next)
}

exports.hook_init_child = function (next) {
  this.init_redis().finally(next)
}

exports.notify = function (next, connection) {
  const txn = connection?.transaction
  // skip when no transaction or when this is authenticated/relaying (outbound)
  if (!txn || connection.relaying) return next()

  const publish = (raw) => {
    try {
      const r = txn.results?.get?.('spamassassin') || {}
      const evt = {
        uuid: txn.uuid,
        ts: Date.now(),
        from: txn.mail_from?.address || '',
        to: (txn.rcpt_to || []).map((x) => x.address || String(x)),
        subject: (txn.header?.get('subject') || '').trim(),
        bytes: txn.data_bytes || 0,
        remote_ip: connection.remote?.ip || '',
        helo: connection.hello?.host || '',
        spam_score: typeof r.hits === 'number' ? r.hits : null,
        raw: raw || '',
      }
      if (this.client?.isReady) {
        this.client.publish(this.channel, JSON.stringify(evt)).catch((e) => {
          this.logerror(`publish failed: ${e.message}`)
        })
      }
    } catch (e) {
      this.logerror(`notify error: ${e.message}`)
    }
  }

  // Read the FULL raw message (headers + body) from the spooled stream so the
  // event carries the unparsed email. get_data is local/fast; a safety timer
  // guarantees we never block the queue hook into a plugin timeout.
  let done = false
  let timer = null
  const complete = (raw) => {
    if (done) return
    done = true
    if (timer) clearTimeout(timer)
    publish(raw)
    next()
  }

  try {
    timer = setTimeout(() => {
      this.logerror('get_data timed out; publishing without raw')
      complete('')
    }, 5000)
    txn.message_stream.get_data((buf) => complete(buf ? buf.toString('utf8') : ''))
  } catch (e) {
    this.logerror(`notify get_data error: ${e.message}`)
    complete('')
  }
}
