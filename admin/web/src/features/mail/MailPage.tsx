import { useState } from 'react';
import { Send, Radio, Inbox, Loader2, Trash2, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useInboundWs } from '@/lib/use-inbound-ws';
import type { InboundEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Page, PageScroll } from '@/components/page';

export function MailPage() {
  return (
    <Page className="gap-6">
      <div>
        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Mail
        </h1>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Send via the outbound API (587) and watch inbound mail arrive live (:25).
        </p>
      </div>
      <PageScroll>
        <div className="grid gap-4 lg:grid-cols-2">
          <SendCard />
          <InboundCard />
        </div>
      </PageScroll>
    </Page>
  );
}

function SendCard() {
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      const { result } = await api.mail.send({ to, from: from || undefined, subject, text });
      toast.success(`Sent: ${result.messageId}`);
      setText('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Send className="h-4 w-4 text-[#FFA724]" /> Send mail (API)
        </CardTitle>
        <CardDescription>POST /api/mail/send → authenticated submission on 587</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="to">To</Label>
          <Input id="to" placeholder="user@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">From (optional)</Label>
          <Input id="from" placeholder="testuser@airsend.in" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="body">Body</Label>
          <textarea
            id="body"
            rows={5}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <Button onClick={() => void send()} disabled={sending || !to} className="gap-1.5">
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </Button>
      </CardContent>
    </Card>
  );
}

function InboundCard() {
  const { events, connected, clear } = useInboundWs();
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Inbox className="h-4 w-4 text-[#FFA724]" /> Live inbound
            </CardTitle>
            <CardDescription>Streamed from :25 over WebSocket</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                connected
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-border/50 text-muted-foreground'
              }`}
            >
              <Radio className={`h-3 w-3 ${connected ? 'animate-pulse' : ''}`} />
              {connected ? 'live' : 'offline'}
            </span>
            <Button variant="ghost" size="sm" className="h-7 w-7 px-0" onClick={clear} title="Clear">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[360px] space-y-1.5 overflow-auto">
          {events.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              <div>
                <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p>Waiting for inbound mail…</p>
              </div>
            </div>
          ) : (
            events.map((e) => <InboundRow key={e.uuid} evt={e} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InboundRow({ evt }: { evt: InboundEvent }) {
  const [showRaw, setShowRaw] = useState(false);
  return (
    <div className="rounded-lg border border-border/40 bg-accent/20 p-2.5 transition-colors hover:bg-accent/40">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs font-medium">{evt.from || '(empty)'}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground/70">
          {new Date(evt.ts).toLocaleTimeString()}
        </span>
      </div>
      <div className="mt-0.5 truncate text-sm">{evt.subject || '(no subject)'}</div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground/70">
        <span className="truncate">→ {evt.to.join(', ')}</span>
        <span>{evt.remote_ip}</span>
        {evt.spam_score !== null && <span>spam {evt.spam_score}</span>}
        <span>{evt.bytes} B</span>
        {evt.raw && (
          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-1 font-medium text-[#FFA724] hover:underline"
          >
            <Code2 className="h-3 w-3" /> {showRaw ? 'hide raw' : 'view raw'}
          </button>
        )}
      </div>
      {showRaw && evt.raw && (
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border/40 bg-background/60 p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
          {evt.raw}
        </pre>
      )}
    </div>
  );
}
