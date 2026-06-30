'use strict'

// local_policy_guard
// A local/custom policy plugin for cases where no npm plugin exists.
// Defaults to passive mode (enabled=false) so wiring is safe immediately.

exports.register = function () {
  this.load_cfg()
  this.register_hook('mail', 'check_mail_from')
  this.register_hook('rcpt', 'check_rcpt_to')
}

exports.load_cfg = function () {
  const cfg = this.config.get('local_policy_guard.ini', () => this.load_cfg())
  const main = cfg.main || {}

  this.enabled = toBool(main.enabled)
  this.reject_code = Number(main.reject_code) || 550
  this.reject_message = main.reject_message || 'Message rejected by local policy guard'

  this.sender_list = main.sender_list || 'local_policy_guard.senders'
  this.recipient_list = main.recipient_list || 'local_policy_guard.recipients'
}

exports.check_mail_from = function (next, connection, params) {
  if (!this.enabled) return next()

  const from = params?.[0]?.address?.() || params?.[0]?.address || ''
  if (!from) return next()

  const blockedSenders = this.config.get(this.sender_list, 'list') || []
  if (includesAddress(blockedSenders, from)) {
    return next(DENY, this.reject_message)
  }

  next()
}

exports.check_rcpt_to = function (next, connection, params) {
  if (!this.enabled) return next()

  const rcpt = params?.[0]?.address?.() || params?.[0]?.address || ''
  if (!rcpt) return next()

  const blockedRecipients = this.config.get(this.recipient_list, 'list') || []
  if (includesAddress(blockedRecipients, rcpt)) {
    return next(DENY, this.reject_message)
  }

  next()
}

function includesAddress(list, address) {
  const target = String(address).trim().toLowerCase()
  return list.some((x) => String(x).trim().toLowerCase() === target)
}

function toBool(v) {
  if (typeof v === 'boolean') return v
  const s = String(v || '').trim().toLowerCase()
  return s === '1' || s === 'true' || s === 'yes' || s === 'on'
}
