#!/usr/bin/env tsx
/*
 * Authenticated submission test (port 587).
 *
 * Connects to the local Haraka server, logs in as the plaintext test user
 * defined in config/auth_flat_file.ini, and submits a message.
 *
 * On 127.0.0.1 Haraka treats the connection as "private", so AUTH is offered
 * even without STARTTLS. We still try STARTTLS opportunistically.
 *
 * Usage:  npm run auth
 * Env overrides: HOST, PORT, USER, PASS, FROM, TO
 */
import nodemailer from 'nodemailer';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 587);
const USER = process.env.USER || 'testuser@airsend.in';
const PASS = process.env.PASS || 'TestPass123!';
const FROM = process.env.FROM || 'testuser@airsend.in';
const TO = process.env.TO || 'test@airsend.in';

async function main(): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: false, // STARTTLS upgrade (not implicit TLS)
    requireTLS: false, // allow plain on localhost; set true to force STARTTLS
    auth: { user: USER, pass: PASS },
    tls: { rejectUnauthorized: false }, // self-signed cert in config/tls_cert.pem
    logger: true,
    debug: true,
  });

  console.log(`\n=> Connecting (AUTH) to ${HOST}:${PORT} as ${USER}\n`);
  const info = await transporter.sendMail({
    from: FROM,
    to: TO,
    subject: 'Haraka AUTH test ' + new Date().toISOString(),
    text: 'Hello from send-auth.ts — authenticated submission worked.',
  });

  console.log('\n=> Accepted:', info.accepted);
  console.log('=> Response:', info.response);
  console.log('=> Message-Id:', info.messageId);
}

main().catch((err: unknown) => {
  console.error('\n!! Send failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
