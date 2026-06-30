# syntax=docker/dockerfile:1
#
# One image that runs the whole Haraka stack:
#   - Haraka SMTP server        (Node runtime)
#   - Admin config API          (Bun runtime)
#   - Admin web UI (static)     (built with Bun/Vite, served by the API)
#
# Build:  docker build -t haraka-mail .
# Run:    docker run --rm -p 25:25 -p 587:587 -p 3001:3001 haraka-mail
# (or use the `haraka` service in docker-compose.yml)

# ---------------------------------------------------------------------------
# Stage 1 — build the admin web UI with Bun + Vite -> admin/web/dist
# ---------------------------------------------------------------------------
FROM oven/bun:1 AS web
WORKDIR /web
COPY admin/web/package.json admin/web/package-lock.json ./
RUN bun install
COPY admin/web/ ./
RUN bun run build

# ---------------------------------------------------------------------------
# Stage 2 — install the admin API runtime dependencies with Bun
# ---------------------------------------------------------------------------
FROM oven/bun:1 AS server
WORKDIR /server
COPY admin/server/package.json admin/server/package-lock.json ./
RUN bun install --production

# ---------------------------------------------------------------------------
# Stage 3 — install Haraka (and its plugins) with Node
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS haraka
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# ---------------------------------------------------------------------------
# Stage 4 — runtime image: Node (for Haraka) + Bun (for the admin API)
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runtime

# Bring in the Bun binary from the official image (both are Debian/glibc).
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

# bash drives the entrypoint supervisor; ca-certificates for outbound TLS.
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Haraka runtime dependencies.
COPY --from=haraka /app/node_modules ./node_modules

# Admin API source + its Bun-installed dependencies.
COPY admin/server/ ./admin/server/
COPY --from=server /server/node_modules ./admin/server/node_modules

# Pre-built admin web UI (served by the API from admin/web/dist).
COPY --from=web /web/dist ./admin/web/dist

# Haraka config, custom plugins and the root manifest.
COPY config/ ./config/
COPY inbound/ ./inbound/
COPY outbound/ ./outbound/
COPY plugins/ ./plugins/
COPY package.json ./

# Writable runtime directories Haraka expects to exist (spool, queue, plugins, docs).
RUN mkdir -p spool queue plugins docs

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

# 25 = SMTP, 587 = submission, 3001 = admin API/UI
EXPOSE 25 587 3001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
