#!/usr/bin/env tsx
/*
 * Unauthenticated inbound test (port 25).
 *
 * Submits a message without logging in. The recipient domain must be in
 * config/host_list (e.g. airsend.in) so rcpt_to.in_host_list accepts it.
 * Note: mail_from.is_resolvable + spf run on inbound, so use a real resolvable
 * MAIL FROM domain (override with FROM=...).
 *
 * Usage:  npm run noauth
 * Env overrides: HOST, PORT, FROM, TO
 */
import nodemailer from 'nodemailer';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 25);
const FROM = process.env.FROM || 'sender@gmail.com';
const TO = process.env.TO || 'test@airsend.in';

async function main(): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: false,
    ignoreTLS: true, // skip STARTTLS for this plain inbound test
    logger: true,
    debug: true,
  });

  console.log(`\n=> Connecting (no auth) to ${HOST}:${PORT}\n`);
  const info = await transporter.sendMail({
    from: FROM,
    to: TO,
    subject: 'Haraka no-auth inbound test ' + new Date().toISOString(),
    text: 'Hello from send-noauth.ts — unauthenticated inbound delivery.',
  });

  console.log('\n=> Accepted:', info.accepted);
  console.log('=> Rejected:', info.rejected);
  console.log('=> Response:', info.response);
}

main().catch((err: unknown) => {
  console.error('\n!! Send failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
