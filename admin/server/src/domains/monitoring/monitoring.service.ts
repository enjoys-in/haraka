// Monitoring domain: a REAL live overview composed from existing data sources.
// No per-connection live data is fabricated (that requires the watch plugin +
// Redis); instead we aggregate genuine signals: service port probes, outbound
// queue depth, recent delivery outcomes, and the admin monitor's uptime.
import { getStatus, type ServiceStatus } from '../status/status.service';
import { readQueue } from '../queue/queue.service';
import { listMailHistory } from '../mail-history/mailHistory.service';

export interface MonitoringSnapshot {
  services: ServiceStatus[];
  queue: {
    total: number;
    deferred: number;
    oldestAgeSeconds: number;
  };
  delivery: {
    total: number;
    delivered: number;
    deferred: number;
    bounced: number;
  };
  uptimeSeconds: number;
  timestamp: number;
}

export async function getMonitoring(): Promise<MonitoringSnapshot> {
  const [{ services }, queue] = await Promise.all([getStatus(), Promise.resolve(readQueue())]);
  const records = listMailHistory(500);

  return {
    services,
    queue: {
      total: queue.summary.total,
      deferred: queue.summary.deferred,
      oldestAgeSeconds: queue.summary.oldestAgeSeconds,
    },
    delivery: {
      total: records.length,
      delivered: records.filter((r) => r.status === 'delivered').length,
      deferred: records.filter((r) => r.status === 'deferred').length,
      bounced: records.filter((r) => r.status === 'bounced').length,
    },
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: Date.now(),
  };
}
