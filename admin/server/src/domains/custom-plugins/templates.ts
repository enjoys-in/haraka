// Starter templates for user-authored Haraka plugins, surfaced in the admin UI
// (Custom Plugins tab). Each `code` block is a complete, runnable Haraka plugin.
// The token `__PLUGIN_NAME__` is replaced with the plugin's actual name when the
// file is created. Hooks/globals (next, DENY, OK, connection, transaction) match
// the Haraka plugin API: https://haraka.github.io/core/Plugins

export interface PluginTemplate {
  /** Stable id used by the create endpoint. */
  id: string;
  /** Human friendly title for the picker. */
  label: string;
  /** The SMTP stage / hook this template demonstrates. */
  hook: string;
  /** Short explanation shown under the picker. */
  description: string;
  /** Full plugin source with `__PLUGIN_NAME__` placeholders. */
  code: string;
}

export const CUSTOM_PLUGIN_TEMPLATES: PluginTemplate[] = [
  {
    id: 'minimal',
    label: 'Minimal (logging)',
    hook: 'hook_rcpt',
    description: 'The smallest working plugin — logs every recipient and accepts it.',
    code: `'use strict';
// __PLUGIN_NAME__ — Haraka plugin
// Docs: https://haraka.github.io/core/Plugins

exports.hook_rcpt = function (next, connection, params) {
    const rcpt = params[0];
    this.loginfo('Got recipient: ' + rcpt);
    next();
};
`,
  },
  {
    id: 'register',
    label: 'register() + config skeleton',
    hook: 'register',
    description:
      'Loads config/__PLUGIN_NAME__.ini, re-loads it on change, and wires a hook explicitly with register_hook().',
    code: `'use strict';
// __PLUGIN_NAME__ — Haraka plugin
// Docs: https://haraka.github.io/core/Plugins

exports.register = function () {
    // Load config/__PLUGIN_NAME__.ini (optional) and re-run register() on change.
    this.cfg = this.config.get('__PLUGIN_NAME__.ini', () => this.register());
    this.loginfo('__PLUGIN_NAME__ registered');

    // Wire hooks explicitly (alternative to the exports.hook_* style).
    this.register_hook('connect', 'on_connect');
};

exports.on_connect = function (next, connection) {
    connection.loginfo(this, 'connect from ' + connection.remote.ip);
    next();
};
`,
  },
  {
    id: 'connect',
    label: 'Connection filter (hook_connect)',
    hook: 'hook_connect',
    description: 'Inspect or block connecting clients by IP / reverse DNS.',
    code: `'use strict';
// __PLUGIN_NAME__ — allow or deny based on the connecting client.

exports.hook_connect = function (next, connection) {
    const ip = connection.remote.ip;
    this.loginfo('Connection from ' + ip);

    // Example: block a specific network.
    // if (ip.startsWith('203.0.113.')) return next(DENY, 'Blocked network');

    next();
};
`,
  },
  {
    id: 'helo',
    label: 'HELO check (hook_helo)',
    hook: 'hook_helo',
    description: 'Validate the HELO / EHLO hostname the client announces.',
    code: `'use strict';
// __PLUGIN_NAME__ — validate the HELO / EHLO hostname.

exports.hook_helo = exports.hook_ehlo = function (next, connection, helo) {
    this.loginfo('HELO: ' + helo);

    // Example: reject HELOs with no dot (bare hostnames / IPs).
    // if (!/\\./.test(helo)) return next(DENY, 'Invalid HELO hostname');

    next();
};
`,
  },
  {
    id: 'mail_from',
    label: 'Sender filter (hook_mail)',
    hook: 'hook_mail',
    description: 'Inspect or block the MAIL FROM (envelope sender) address.',
    code: `'use strict';
// __PLUGIN_NAME__ — inspect or block the envelope sender.

exports.hook_mail = function (next, connection, params) {
    const from = params[0];
    this.loginfo('MAIL FROM: ' + from.address());

    // Example: block a specific sender domain.
    // if (from.host === 'spam.example') return next(DENY, 'Sender not allowed');

    next();
};
`,
  },
  {
    id: 'rcpt',
    label: 'Recipient filter (hook_rcpt)',
    hook: 'hook_rcpt',
    description: 'Accept or deny recipients — e.g. an allow-list of local domains.',
    code: `'use strict';
// __PLUGIN_NAME__ — accept or deny recipients.

exports.hook_rcpt = function (next, connection, params) {
    const rcpt = params[0];
    this.loginfo('RCPT TO: ' + rcpt.address());

    // Example allow-list: only accept your own domain, reject the rest.
    // if (rcpt.host !== 'example.com') return next(DENY, 'Relaying denied');

    next();
};
`,
  },
  {
    id: 'data_headers',
    label: 'Add / read headers (hook_data_post)',
    hook: 'hook_data_post',
    description: 'Read the parsed message and add a custom header after DATA.',
    code: `'use strict';
// __PLUGIN_NAME__ — inspect the message and add a header after DATA.

exports.hook_data_post = function (next, connection) {
    const txn = connection.transaction;
    if (!txn) return next();

    const subject = (txn.header.get('Subject') || '').trim();
    this.loginfo('Subject: ' + subject);

    // Stamp every message with a custom header.
    txn.add_header('X-Processed-By', '__PLUGIN_NAME__');

    next();
};
`,
  },
  {
    id: 'queue',
    label: 'Custom queue (hook_queue)',
    hook: 'hook_queue',
    description: 'Decide what happens to an accepted message at queue time.',
    code: `'use strict';
// __PLUGIN_NAME__ — custom queue handler.

exports.hook_queue = function (next, connection) {
    const txn = connection.transaction;
    this.loginfo('Queuing message ' + (txn && txn.uuid));

    // next(OK) accepts/finishes; plain next() passes to the next queue plugin.
    next(OK);
};
`,
  },
  {
    id: 'disposable',
    label: 'Tutorial: dated disposable addresses',
    hook: 'hook_rcpt',
    description:
      'Full example from the Haraka tutorial: user-YYYYMMDD@domain addresses that expire, then rewrite back to user@domain.',
    code: `'use strict';
// __PLUGIN_NAME__ — dated disposable addresses (Haraka tutorial).
// Accepts user-YYYYMMDD@domain, rejects after that date, and rewrites valid
// ones back to user@domain before delivery.
// https://haraka.github.io/tutorials/tutorial#writing-haraka-plugins

exports.hook_rcpt = function (next, connection, params) {
    const rcpt = params[0];
    this.loginfo('Got recipient: ' + rcpt);

    // Check the user part matches 'user-YYYYMMDD'.
    const match = /^(.*)-(\\d{4})(\\d{2})(\\d{2})$/.exec(rcpt.user);
    if (!match) return next();

    // Date constructor takes month-1 (December === 11).
    const expiry = new Date(match[2], match[3] - 1, match[4]);
    this.loginfo('Email expires on: ' + expiry);

    if (expiry < new Date()) {
        return next(DENY, 'Expired email address');
    }

    // Not expired — strip the -YYYYMMDD extension before onward delivery.
    rcpt.user = match[1];
    this.loginfo('Email address now: ' + rcpt);
    next();
};
`,
  },
];
