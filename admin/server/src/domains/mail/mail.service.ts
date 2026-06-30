// Send mail via the OUTBOUND submission instance (587) using SMTP AUTH.
// The admin acts as an authenticated client of Haraka's MSA, so messages go
// through the real outbound pipeline (DKIM signing + MX delivery).
import nodemailer, { type Transporter } from 'nodemailer';
import { OUTBOUND_SMTP } from '../../config';

export interface SendMailInput {
  from?: string;
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
}

export interface SendMailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

let transporter: Transporter | null = null;
function getTransport(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: OUTBOUND_SMTP.host,
    port: OUTBOUND_SMTP.port,
    secure: OUTBOUND_SMTP.secure, // false on 587 -> STARTTLS
    requireTLS: !OUTBOUND_SMTP.secure,
    auth: { user: OUTBOUND_SMTP.user, pass: OUTBOUND_SMTP.pass },
    tls: { rejectUnauthorized: false }, // dev self-signed cert
  });
  return transporter;
}

function addr(a: string | { address?: string }): string {
  return typeof a === 'string' ? a : a.address || '';
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const to = Array.isArray(input.to) ? input.to : input.to ? [input.to] : [];
  if (to.length === 0 || to.some((t) => !EMAIL_RE.test(t.trim()))) {
    throw new Error('Invalid or missing "to" address');
  }
  if (!input.text && !input.html) throw new Error('Provide a "text" or "html" body');
  const from = input.from?.trim() || OUTBOUND_SMTP.user;

  const info = await getTransport().sendMail({
    from,
    to: to.map((t) => t.trim()),
    subject: input.subject || '(no subject)',
    text: input.text,
    html: input.html,
  });

  return {
    messageId: info.messageId,
    accepted: (info.accepted || []).map(addr),
    rejected: (info.rejected || []).map(addr),
    response: info.response || '',
  };
}

/** Re-inject a complete raw RFC822 message through the MSA with an explicit
 *  envelope. Used to release a quarantined message back into delivery. */
export async function sendRaw(
  envelope: { from?: string; to: string[] },
  raw: string | Buffer,
): Promise<SendMailResult> {
  if (!envelope.to.length) throw new Error('No recipients to release to');
  const from = envelope.from?.trim() || OUTBOUND_SMTP.user;

  const info = await getTransport().sendMail({
    envelope: { from, to: envelope.to },
    raw,
  });

  return {
    messageId: info.messageId,
    accepted: (info.accepted || []).map(addr),
    rejected: (info.rejected || []).map(addr),
    response: info.response || '',
  };
}
