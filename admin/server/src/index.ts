// Haraka admin API — mounts each domain router and serves the built UI.
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PORT, HOST, CONFIG_DIR } from './config';
import { statusRouter } from './domains/status/status.routes';
import { pluginsRouter } from './domains/plugins/plugins.routes';
import { smtpRouter } from './domains/smtp/smtp.routes';
import { authRouter } from './domains/auth/auth.routes';
import { mailDomainsRouter } from './domains/mail-domains/mailDomains.routes';
import { spamRouter } from './domains/spam/spam.routes';
import { dkimRouter } from './domains/dkim/dkim.routes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/status', statusRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/smtp', smtpRouter);
app.use('/api/auth/users', authRouter);
app.use('/api/domains', mailDomainsRouter);
app.use('/api/spam', spamRouter);
app.use('/api/dkim', dkimRouter);

// Serve the built frontend (admin/web/dist) in production.
const dist = path.join(__dirname, '..', '..', 'web', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, HOST, () => {
  console.log(`[haraka-admin] API on http://${HOST}:${PORT}`);
  console.log(`[haraka-admin] config dir: ${CONFIG_DIR}`);
});
