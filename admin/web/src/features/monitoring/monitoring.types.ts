// Live monitoring shapes. Composed from real signals (service probes, queue
// depth, delivery outcomes) — the canonical definitions live in lib/types.
export type { MonitoringSnapshot, ServiceStatus } from '@/lib/types';

export interface LiveStats {
	inboundActive: number;
	inboundTotal: number;
	outboundActive: number;
	mailSent: number;
	mailReceived: number;
	rejected: number;
	deferred: number;
	uptimeSeconds: number;
	throughputPerMin: number;
}

export interface LiveConnection {
	id: string;
	direction: 'inbound' | 'outbound';
	remoteIp: string;
	remoteHost: string | null;
	helo: string | null;
	mailFrom: string | null;
	rcptCount: number;
	state: string;
	tls: boolean;
	bytes: number;
	startedAt: number;
}
