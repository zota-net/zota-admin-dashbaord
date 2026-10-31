'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Terminal,
  Wifi,
  WifiOff,
  Loader2,
  Play,
  RefreshCw,
  Plug,
  Unplug,
  Ban,
  Cpu,
  MemoryStick,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, ErrorState, EmptyState } from '@/components/admin';
import { routersService } from '@/lib/api';
import type { Router, RouterSession, RouterStatus } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { cn } from '@/lib/utils';

interface Line {
  id: number;
  kind: 'cmd' | 'out' | 'err' | 'info';
  text: string;
}

let lineId = 0;

export default function RouterConsolePage() {
  const routers = useAsync<Router[]>(() => routersService.getAll(), []);
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const selectedId = requestedId ?? routers.data?.[0]?.id ?? null;

  const router = routers.data?.find((r) => r.id === selectedId) ?? null;

  const connection = useAsync(
    () => (selectedId ? routersService.getConnection(selectedId).catch(() => ({ routerId: selectedId, connected: !!router?.isConnected })) : Promise.resolve(null)),
    [selectedId]
  );

  const status = useAsync(
    () => (selectedId && connection.data?.connected ? routersService.getStatus(selectedId).catch(() => null) : Promise.resolve(null)),
    [selectedId, connection.data?.connected]
  );

  const sessions = useAsync(
    () => (selectedId && connection.data?.connected ? routersService.getActiveSessions(selectedId) : Promise.resolve([] as RouterSession[])),
    [selectedId, connection.data?.connected]
  );

  const connect = async () => {
    if (!selectedId) return;
    setConnecting(true);
    try {
      await routersService.connect(selectedId);
      toast.success('Router connected');
      connection.refresh();
      routers.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect to router');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!selectedId) return;
    setConnecting(true);
    try {
      await routersService.disconnect(selectedId);
      toast.info('Router disconnected');
      connection.refresh();
      routers.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setConnecting(false);
    }
  };

  const kick = async (mac: string) => {
    if (!selectedId) return;
    try {
      await routersService.kickSessionByMac(selectedId, mac);
      toast.success(`Kicked ${mac}`);
      sessions.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to kick session');
    }
  };

  return (
    <>
      <PageHeader title="Router Console" description="Remote diagnostics and command execution against connected Mikrotik routers" />

      {routers.error ? (
        <ErrorState
          message={`${routers.error} — the MikroTik service may be offline.`}
          onRetry={routers.refresh}
        />
      ) : routers.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-4">
          <Skeleton className="h-[480px] lg:col-span-1" />
          <Skeleton className="h-[480px] lg:col-span-3" />
        </div>
      ) : !routers.data || routers.data.length === 0 ? (
        <EmptyState message="No routers registered on the platform" icon={WifiOff} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Router picker */}
          <Card className="lg:col-span-1 py-0">
            <div className="border-b border-border px-4 py-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Routers</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">{routers.data.length}</Badge>
            </div>
            <ScrollArea className="h-[420px]">
              <div className="p-2 space-y-1">
                {routers.data.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRequestedId(r.id)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      selectedId === r.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent/50 text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate text-foreground">{r.name}</span>
                      <span className={cn('h-2 w-2 rounded-full shrink-0', r.isConnected ? 'bg-green-500' : 'bg-muted-foreground/40')} />
                    </div>
                    <p className="text-xs mt-0.5 font-mono">{r.ipAddress}</p>
                    <p className="text-xs text-muted-foreground">Client #{r.client_id}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Console panel */}
          <div className="lg:col-span-3 space-y-4">
            {router && (
              <Card className="py-0">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Terminal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{router.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{router.ipAddress}:{router.apiPort}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {connection.data?.connected ? (
                      <>
                        <Badge className="bg-green-500/10 text-green-500 border-transparent hover:bg-green-500/10">Connected</Badge>
                        <Button variant="outline" size="sm" onClick={disconnect} disabled={connecting}>
                          {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Unplug className="h-4 w-4 mr-2" />}
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline">Offline</Badge>
                        <Button size="sm" onClick={connect} disabled={connecting}>
                          {connecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plug className="h-4 w-4 mr-2" />}
                          Connect
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {connection.data?.connected && status.data && <SystemBar status={status.data} />}
              </Card>
            )}

            <Tabs defaultValue="terminal" className="space-y-3">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="terminal">Script Terminal</TabsTrigger>
                <TabsTrigger value="sessions">
                  Active Sessions
                  {sessions.data && sessions.data.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">{sessions.data.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="terminal">
                <ScriptTerminal
                  routerId={selectedId}
                  connected={!!connection.data?.connected}
                  onConnected={() => connection.refresh()}
                />
              </TabsContent>

              <TabsContent value="sessions">
                <Card className="py-0">
                  {connection.data?.connected ? (
                    sessions.isLoading ? (
                      <div className="p-4 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                      </div>
                    ) : sessions.error ? (
                      <ErrorState message={sessions.error} onRetry={sessions.refresh} compact />
                    ) : (sessions.data?.length ?? 0) === 0 ? (
                      <EmptyState message="No active hotspot sessions" />
                    ) : (
                      <>
                        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                          <p className="text-sm text-muted-foreground">{sessions.data!.length} connected users</p>
                          <Button variant="ghost" size="sm" onClick={sessions.refresh}>
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                          </Button>
                        </div>
                        <ScrollArea className="max-h-[420px]">
                          <div className="divide-y divide-border">
                            {sessions.data!.map((s, i) => (
                              <div key={`${s.macAddress}-${i}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
                                <span className="font-mono text-xs w-32 truncate">{s.username ?? '—'}</span>
                                <span className="font-mono text-xs text-muted-foreground w-40">{s.macAddress}</span>
                                <span className="font-mono text-xs text-muted-foreground w-28">{s.ipAddress}</span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" /> {s.uptime}
                                </span>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  ↓ {formatBytes(s.bytesIn)} ↑ {formatBytes(s.bytesOut)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
                                  onClick={() => kick(s.macAddress)}
                                >
                                  <Ban className="h-3.5 w-3.5 mr-1.5" /> Kick
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    )
                  ) : (
                    <EmptyState message="Connect to a router to view its sessions" icon={Plug} />
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}

function SystemBar({ status }: { status: RouterStatus }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-border px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">CPU</span>
        <span className="ml-auto tabular-nums font-medium">{status.cpuLoad}%</span>
      </div>
      <div className="flex items-center gap-2">
        <MemoryStick className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Memory</span>
        <span className="ml-auto tabular-nums font-medium">
          {Math.round((status.memoryUsed / (status.memoryUsed + status.memoryFree || 1)) * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Uptime</span>
        <span className="ml-auto font-medium truncate max-w-[120px]">{status.uptime}</span>
      </div>
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">RouterOS</span>
        <span className="ml-auto font-medium">{status.version ?? '—'}</span>
      </div>
    </div>
  );
}

function ScriptTerminal({
  routerId,
  connected,
  onConnected,
}: {
  routerId: string | null;
  connected: boolean;
  onConnected: () => void;
}) {
  const [command, setCommand] = useState('/system resource print');
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const push = (kind: Line['kind'], text: string) =>
    setLines((prev) => [...prev, { id: lineId++, kind, text }]);

  const run = async () => {
    if (!routerId || !command.trim()) return;
    push('cmd', command.trim());
    setBusy(true);
    try {
      if (!connected && autoConnect) {
        push('info', 'Connecting to router…');
        await routersService.connect(routerId);
        onConnected();
      }
      const result = await routersService.runScript(routerId, command.trim());
      const payload = (result as { data?: { output?: string; success?: boolean }; output?: string; success?: boolean });
      const output = payload.data?.output ?? payload.output ?? JSON.stringify(result, null, 2);
      push('out', typeof output === 'string' ? output : JSON.stringify(output, null, 2));
    } catch (err) {
      push('err', err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="py-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          RouterOS API — scripts execute on the connected router
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
          <input type="checkbox" checked={autoConnect} onChange={(e) => setAutoConnect(e.target.checked)} className="accent-[hsl(var(--primary))]" />
          Connect if required
        </label>
      </div>

      <div className="bg-[#0b0e14] dark:bg-[#0b0e14] p-4 font-mono text-xs leading-relaxed min-h-[260px] max-h-[360px] overflow-y-auto">
        {lines.length === 0 && (
          <p className="text-[#3d4450]">
            {connected ? 'Ready. Enter a RouterOS command below.' : 'Router is offline. Tick "Connect if required" or connect from the header.'}
          </p>
        )}
        {lines.map((l) => (
          <pre
            key={l.id}
            className={cn(
              'whitespace-pre-wrap break-all',
              l.kind === 'cmd' && 'text-[#7dd3fc] before:content-["›_"] before:text-[#3d4450] before:mr-2',
              l.kind === 'out' && 'text-[#a7f3a0]',
              l.kind === 'err' && 'text-[#f87171]',
              l.kind === 'info' && 'text-[#fbbf24]'
            )}
          >
            {l.text}
          </pre>
        ))}
        {busy && <p className="text-[#3d4450] animate-pulse">executing…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-border p-3">
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="/interface print  •  /ip hotspot active print  •  /system script run <name>"
          className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 font-mono text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button size="sm" onClick={run} disabled={busy || !routerId} className="shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">Run</span>
        </Button>
      </div>
    </Card>
  );
}

function formatBytes(n: number): string {
  if (!n) return '0B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / Math.pow(1024, i)).toFixed(1)}${units[i]}`;
}
