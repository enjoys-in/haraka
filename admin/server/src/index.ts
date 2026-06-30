// Haraka admin API — mounts each domain router and serves the built UI.
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORT, HOST, CONFIG_DIR } from './config';
import { statusRouter } from './domains/status/status.routes';
import { pluginsRouter } from './domains/plugins/plugins.routes';
import { customPluginsRouter } from './domains/custom-plugins/customPlugins.routes';
import { smtpRouter } from './domains/smtp/smtp.routes';
import { authRouter } from './domains/auth/auth.routes';
import { mailDomainsRouter } from './domains/mail-domains/mailDomains.routes';
import { spamRouter } from './domains/spam/spam.routes';
import { dkimRouter } from './domains/dkim/dkim.routes';
import { tlsRouter } from './domains/tls/tls.routes';
import { mailRouter } from './domains/mail/mail.routes';
import { bannerRouter } from './domains/banner/banner.routes';
import { logsRouter } from './domains/logs/logs.routes';
import { aliasesRouter } from './domains/aliases/aliases.routes';
import { routingRouter } from './domains/routing/routing.routes';
import { queueRouter } from './domains/queue/queue.routes';
import { mailHistoryRouter } from './domains/mail-history/mailHistory.routes';
import { settingsRouter } from './domains/settings/settings.routes';
import { monitoringRouter } from './domains/monitoring/monitoring.routes';
import { quarantineRouter } from './domains/quarantine/quarantine.routes';
import { attachMailEventWs } from './domains/mail/mail-events-ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/status', statusRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/custom-plugins', customPluginsRouter);
app.use('/api/smtp', smtpRouter);
app.use('/api/auth/users', authRouter);
app.use('/api/domains', mailDomainsRouter);
app.use('/api/spam', spamRouter);
app.use('/api/dkim', dkimRouter);
app.use('/api/tls', tlsRouter);
app.use('/api/mail', mailRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/logs', logsRouter);
app.use('/api/aliases', aliasesRouter);
app.use('/api/routing', routingRouter);
app.use('/api/queue', queueRouter);
app.use('/api/mail-history', mailHistoryRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/quarantine', quarantineRouter);

// Serve the built frontend (admin/web/dist) in production.
const dist = path.join(__dirname, '..', '..', 'web', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const server = http.createServer(app);
attachMailEventWs(server);

server.listen(PORT, HOST, () => {
  console.log(`[haraka-admin] API on http://${HOST}:${PORT}`);
  console.log(`[haraka-admin] config dir: ${CONFIG_DIR}`);
});
