'use strict'
// bounce_notify — publishes bounce events to the haraka:bounce Redis channel so
// the admin can stream outbound delivery failures over its own /ws/bounce socket.
//
// Config: config/inbound_notify.ini
//   [main]
//   url=redis://127.0.0.1:6379
//   bounce_channel=haraka:bounce

const { createClient } = require('redis')

exports.register = function () {
  this.load_cfg()
  this.register_hook('bounce', 'notify')
}

exports.load_cfg = function () {
  const cfg = this.config.get('inbound_notify.ini', () => this.load_cfg())
  this.redis_url = cfg.main?.url || 'redis://127.0.0.1:6379'
  this.channel = cfg.main?.bounce_channel || 'haraka:bounce'
}

exports.init_redis = async function () {
  if (this.client) return
  this.client = createClient({ url: this.redis_url })
  this.client.on('error', (e) => this.logerror(`redis: ${e.message}`))
  try {
    await this.client.connect()
    this.loginfo(`publishing bounce events to ${this.redis_url} (${this.channel})`)
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

function rcpts(todo) {
  return (todo?.rcpt_to || []).map((x) => x.original || x.address || String(x))
}

exports.notify = function (next, hmail, err) {
  try {
    const todo = hmail?.todo || {}
    const fromAddr = todo?.mail_from?.original || todo?.mail_from?.address || ''
    const evt = {
      event_type: 'bounce',
      uuid: hmail?.uuid || `bounce-${Date.now()}`,
      ts: Date.now(),
      from: fromAddr,
      to: rcpts(todo),
      subject: '',
      bytes: Number(hmail?.size || 0),
      remote_ip: '',
      helo: '',
      spam_score: null,
      raw: '',
      bounce_error: err ? String(err.message || err) : '',
    }

    if (this.client?.isReady) {
      this.client.publish(this.channel, JSON.stringify(evt)).catch((e) => {
        this.logerror(`publish failed: ${e.message}`)
      })
    }
  } catch (e) {
    this.logerror(`bounce_notify error: ${e.message}`)
  }

  next()
}
