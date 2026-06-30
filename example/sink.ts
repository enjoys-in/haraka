#!/usr/bin/env tsx
/*
 * Minimal SMTP "sink" for local testing (no runtime dependencies).
 *
 * Listens on 127.0.0.1:2525 and accepts any message, printing a short summary.
 * Haraka's queue/smtp_forward (config/smtp_forward.ini) delivers inbound mail
 * for local domains here, so the no-auth inbound test can complete end-to-end.
 *
 * Usage:  npm run sink   (leave running in its own terminal)
 * Env:    PORT (default 2525), HOST (default 127.0.0.1)
 */
import net from 'node:net';

const PORT = Number(process.env.PORT || 2525);
const HOST = process.env.HOST || '127.0.0.1';

const server = net.createServer((sock: net.Socket) => {
  let inData = false;
  let from = '';
  const rcpts: string[] = [];
  let bytes = 0;

  const send = (line: string): boolean => sock.write(line + '\r\n');
  send('220 sink.local ESMTP test sink ready');

  let buf = '';
  sock.on('data', (chunk: Buffer) => {
    if (inData) {
      bytes += chunk.length;
      buf += chunk.toString('latin1');
      const end = buf.indexOf('\r\n.\r\n');
      if (end !== -1) {
        inData = false;
        buf = '';
        console.log(
          `\n[sink] message received  from=${from}  to=${rcpts.join(',')}  bytes=${bytes}`
        );
        send('250 OK: message accepted by sink');
      }
      return;
    }

    buf += chunk.toString('latin1');
    let idx: number;
    while ((idx = buf.indexOf('\r\n')) !== -1) {
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const cmd = line.slice(0, 4).toUpperCase();

      if (cmd === 'EHLO' || cmd === 'HELO') {
        send('250-sink.local Hello');
        send('250 8BITMIME');
      } else if (cmd === 'MAIL') {
        from = line.replace(/^MAIL FROM:\s*/i, '');
        send('250 OK');
      } else if (cmd === 'RCPT') {
        rcpts.push(line.replace(/^RCPT TO:\s*/i, ''));
        send('250 OK');
      } else if (cmd === 'DATA') {
        inData = true;
        bytes = 0;
        send('354 End data with <CR><LF>.<CR><LF>');
        buf = ''; // body starts fresh
      } else if (cmd === 'RSET') {
        from = '';
        rcpts.length = 0;
        send('250 OK');
      } else if (cmd === 'NOOP') {
        send('250 OK');
      } else if (cmd === 'QUIT') {
        send('221 Bye');
        sock.end();
      } else {
        send('250 OK');
      }
    }
  });

  sock.on('error', () => {});
});

server.listen(PORT, HOST, () => {
  console.log(`[sink] SMTP test sink listening on ${HOST}:${PORT}`);
});
