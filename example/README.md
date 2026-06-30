# Haraka test mail examples

Quick scripts to exercise the local Haraka SMTP server.

## Setup

```bash
cd example
npm install
```

Make sure Haraka is running from the project root first:

```bash
# from the repo root (e:\haraka\haraka)
node node_modules/Haraka/bin/haraka -c .
```

## Run

```bash
# (optional) start the local SMTP sink so inbound mail has somewhere to land
# leave this running in its own terminal
npm run sink

# Authenticated submission on port 587 (test user from config/auth_flat_file.ini)
npm run auth

# Unauthenticated inbound on port 25 (delivered to the sink via smtp_forward)
npm run noauth
```

Inbound mail for local domains is forwarded by `queue/smtp_forward`
([../config/smtp_forward.ini](../config/smtp_forward.ini)) to `127.0.0.1:2525`,
which is where `sink.ts` listens. Point that config at your real backend for
production.

## Test account

| Field    | Value                       |
| -------- | --------------------------- |
| Username | `testuser@airsend.in` |
| Password | `TestPass123!`              |

Defined in [../config/auth_flat_file.ini](../config/auth_flat_file.ini). The
`auth/flat_file` plugin compares the value as **plaintext**, so this is a plain
entry (the other `test@` user uses a SHA512-CRYPT hash which `auth/flat_file`
does not verify as a hash).

## Overrides

Both scripts read env vars: `HOST`, `PORT`, `FROM`, `TO`, and (auth only)
`USER`, `PASS`. Example:

```bash
TO=someone@airsend.in npm run auth
```

## Notes

- On `127.0.0.1` Haraka marks the connection "private", so AUTH is offered even
  without STARTTLS.
- The TLS cert is self-signed, so the scripts set `rejectUnauthorized: false`.
- Final delivery depends on `queue/smtp_forward` config; a `250` acceptance from
  the server means the SMTP transaction succeeded.
