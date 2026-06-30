# Haraka Mail Server + Admin Console

A self-hosted, production-oriented mail stack built on
[Haraka](https://haraka.github.io/) (a high-performance SMTP server written in
Node.js), bundled with a **TypeScript admin API** and a **React admin UI** so the
whole server can be configured, monitored and operated from the browser instead of
editing config files by hand.

Default domain: **airsend.in** (everything is dynamic — the domain, accepted
recipients, users, DKIM keys, TLS and plugins are all editable from the UI).

**Source:** <https://github.com/enjoys-in/haraka>

---

## What's in the box

| Layer | Tech | Purpose |
| ----- | ---- | ------- |
| **MTA / MSA** | Haraka 3.3.x (Node 20) | Inbound mail on `:25`, authenticated submission on `:587` |
| **Admin API** | Express + TypeScript (Bun/tsx), port `3001` | Reads/writes `config/*` preserving comments, sends mail, streams events |
| **Admin UI** | Vite + React 18 + Tailwind + shadcn (react-router SPA) | Code-split pages for dashboard, logs, mail, domains, users, SMTP, banner, DKIM, TLS, spam and inbound/outbound/custom plugins — lazy-loaded with a custom error boundary |
| **Filtering** | SpamAssassin, Rspamd, ClamAV, Redis (Docker) | Spam scoring + virus scanning, reputation/rate-limit backing store |
| **Live feed** | Custom `inbound_notify` + `bounce_notify` plugins → Redis pub/sub → WebSocket | Real-time stream of `inbound`, `outbound`, and `bounce` events in one socket |

```
┌────────────┐   :25    ┌─────────────┐  spam/AV  ┌────────────────────────┐
│  Internet  │ ───────► │  Haraka IN  │ ────────► │ SpamAssassin / Rspamd  │
└────────────┘          │  (MTA)      │           │ ClamAV / Redis (Docker)│
                        └──────┬──────┘           └────────────────────────┘
   clients :587 (AUTH)        │ publish inbound events (Redis)
┌────────────┐         ┌──────▼──────┐   WebSocket   ┌──────────────────────┐
│  MUA / app │ ──────► │ Haraka OUT  │               │  Admin API  :3001     │
└────────────┘  DKIM   │  (MSA)      │ ◄──────────►  │  + React UI (dist)    │
                       └─────────────┘   /api, /ws   └──────────────────────┘
```

---

## Repository layout

```
config/        Active Haraka config (combined mode) — *.ini, host_list, dkim/
inbound/       Config + plugins for the INBOUND role  (-c inbound)
outbound/      Config + plugins for the OUTBOUND role (-c outbound)
plugins/       Custom plugins (e.g. inbound_notify.js, bounce_notify.js)
admin/server/  TypeScript config API (domain-driven: src/domains/<feature>)
admin/web/     React admin UI (src/features/<feature>)
docker/        Service config (rspamd local.d, etc.)
example/       Dependency-free SMTP send/sink scripts for end-to-end tests
Dockerfile     One image, role-aware entrypoint (combined|admin|inbound|outbound)
docker-compose.yml  Spam/AV stack + admin + haraka-in + haraka-out
```

---

## Quick start (local)

**1. Start the spam/AV/Redis stack** (published on `127.0.0.1`):

```bash
docker compose up -d spamassassin rspamd clamav redis
```

**2. Run Haraka** against the repo config (binds `0.0.0.0:25` and `:587`):

```bash
npm install
node node_modules/Haraka/bin/haraka -c .
```

> The npm package is **`Haraka`** (capital H). The lowercase `haraka` package is a
> dead placeholder — `package.json` depends on `Haraka`.

**3. Start the admin API + UI:**

```bash
cd admin/server && npm install && npm run dev   # API on :3001
cd admin/web    && npm install && npm run dev   # UI on :5173 (proxies /api → 3001)
```

Open <http://localhost:5173>. When everything is up, `/api/status` reports all six
services healthy: SMTP `25`, submission `587`, SpamAssassin `783`, Rspamd `11333`,
ClamAV `3310`, Redis `6379`.

Test login (flat-file auth): `testuser@airsend.in` / `TestPass123!`

---

## Run with Docker

A single image still supports `HARAKA_ROLE` (`combined` · `admin` · `inbound` ·
`outbound`), but the default `docker-compose.yml` is now a **scaled HAProxy
topology**.

```bash
docker build -t haraka-mail .
docker run --rm -p 25:25 -p 587:587 -p 3001:3001 haraka-mail   # combined
```

### Scaled topology (HAProxy + multiple Haraka instances)

Public port mapping is user-editable through environment variables:

- `SMTP_PUBLIC_PORT` (default `2525` for local testing)
- `SUBMISSION_PUBLIC_PORT` (default `2587`)
- `ADMIN_PUBLIC_PORT` (default `3001`)

Create `.env` (optional):

```bash
cp .env.example .env
```

Start stack:

```bash
docker compose up -d
```

This starts SpamAssassin, Rspamd, ClamAV, Redis, HAProxy, `admin` (API/UI), two
inbound MTAs (`haraka-in-1`, `haraka-in-2`) and two outbound MSAs
(`haraka-out-1`, `haraka-out-2`).

### Local test checklist

```bash
docker compose ps
docker compose logs -f haproxy
```

Check SMTP banner through HAProxy:

```bash
nc 127.0.0.1 ${SMTP_PUBLIC_PORT:-2525}
```

Check submission (STARTTLS capable endpoint):

```bash
openssl s_client -starttls smtp -crlf -connect 127.0.0.1:${SUBMISSION_PUBLIC_PORT:-2587}
```

Admin API/UI:

```bash
curl http://127.0.0.1:${ADMIN_PUBLIC_PORT:-3001}/api/status
```

For production, set `SMTP_PUBLIC_PORT=25` and `SUBMISSION_PUBLIC_PORT=587`.

---

## Admin API surface

| Route | Manages |
| ----- | ------- |
| `GET /api/status` | Live health of SMTP + spam/AV services |
| `/api/plugins` | Toggle plugins, edit per-plugin config (from a trusted catalog); each plugin is tagged `inbound`/`outbound`/`both` |
| `/api/plugins/access/rules` | Manage `access` plugin ACLs (allow/deny by recipient, host, etc.) |
| `/api/smtp` | `smtp.ini` listeners and core settings |
| `/api/auth/users` | Mailbox users + aliases (`auth_flat_file.ini`, `aliases`) |
| `/api/domains` | Accepted recipient domains (`host_list`) |
| `/api/banner` | Connection banner shown on the SMTP greeting |
| `/api/spam` | SpamAssassin / Rspamd / ClamAV config |
| `/api/dkim` | Generate / verify / delete DKIM keys per domain |
| `/api/tls` | STARTTLS certificates and settings |
| `/api/mail` | Send a test message; `GET /ws/inbound` streams accepted mail |
| `/api/logs` + `/api/logs/stream` | Outbound logger records (JSON logs + SSE stream) |

The config editor only writes files derived from a **server-side catalog**, never
from client-supplied paths, and domains are regex-validated before use (no path
traversal).

---

## Configuration notes

- **`config/connection.ini` is required** on Haraka 3.3.x — without it every
  connection throws and clients hang waiting for the `220` greeting.
- **`watch`, `karma`, `limit`** plugins need Redis at init; leave them off until
  Redis is running or Haraka aborts startup.
- Haraka 3.x renames: `dnsbl` → `dns-list`, `dkim_sign` → `dkim` (the `dkim`
  plugin still reads `config/dkim_sign.ini`).
- Aliases are managed in JSON file `config/aliases` and require the `aliases`
  plugin in `config/plugins` (must run before other `hook_rcpt` handlers that
  depend on rewritten recipients).
- `block_me` uses `config/block_me.recipient` (dropbox address) and
  `config/block_me.senders` (allowed forwarders) to populate `mail_from.blocklist`
  via forwarded spam reports.
- Custom `inbound_notify` and `bounce_notify` plugins publish unified mail events
  (`inbound` / `outbound` / `bounce`) to Redis and the admin WebSocket.
- `outbound-logger` can log delivered/deferred/bounced outbound traffic in JSON
  (`outbound_logger.ini`), and the admin Logs page consumes this via SSE.
- HAProxy PROXY protocol is enabled in `inbound/config/connection.ini` and
  `outbound/config/connection.ini`. The trusted proxy host is the HAProxy
  container IP (`172.30.0.10`) on the compose `mailnet` subnet.
- DKIM keys live in `config/dkim/<domain>/{private,public,selector,dns}`; generate
  with `cd config/dkim && sh dkim_key_gen.sh <domain>` or from the DKIM page in the UI.
- `config/smtp.ini` paths are relative to the working directory (`spool_dir=spool`).

---

## Documentation

Haraka ships extensive docs. From the repo:

```bash
haraka -h Plugins          # how to write a plugin
haraka -h <plugin-name>    # docs for a specific plugin (no .js extension)
haraka -h Connection       # core module docs
haraka -l                  # list available plugins
haraka -o -c .             # show plugin/hook run order
```

See also the official site: <https://haraka.github.io/>.
Project source: <https://github.com/enjoys-in/haraka>.

---

## License

MIT
