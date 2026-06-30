// Small, dependency-free formatting helpers shared across feature pages so the
// page/component files never need to declare their own one-off formatters.

/** 12345 -> "12,345". */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/** 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exp;
  return `${value.toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`;
}

/** 3725 -> "1h 2m". Compact human duration from seconds. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Epoch millis -> "3m ago" / "just now". */
export function timeAgo(epochMs: number): string {
  const diff = Math.max(0, Date.now() - epochMs);
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Epoch millis -> locale date+time string. */
export function formatDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString();
}
