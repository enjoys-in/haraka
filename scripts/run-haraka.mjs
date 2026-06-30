// Runs Haraka and tees its stdout/stderr to logs/haraka.log so the admin API
// can stream the live system log to the UI (GET /api/logs/system/stream).
//
// Spawning with piped stdio (rather than a shell `> file` redirect) avoids the
// winpty "stdout is not a tty" failure on Git Bash/Windows and still shows the
// output in this terminal.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(root, '..');
const logFile = process.env.HARAKA_LOG_FILE || path.join(repoRoot, 'logs', 'haraka.log');
const harakaBin = path.join(repoRoot, 'node_modules', 'Haraka', 'bin', 'haraka');

fs.mkdirSync(path.dirname(logFile), { recursive: true });
// Truncate on start so each run begins with a fresh log.
const out = fs.createWriteStream(logFile, { flags: 'w' });

const child = spawn(process.execPath, [harakaBin, '-c', '.'], {
  cwd: repoRoot,
  env: process.env,
});

child.stdout.pipe(out);
child.stdout.pipe(process.stdout);
child.stderr.pipe(out);
child.stderr.pipe(process.stderr);

const stop = () => {
  if (!child.killed) child.kill('SIGTERM');
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', (code) => process.exit(code ?? 0));
