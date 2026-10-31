'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Headphones,
  MessageSquare,
  Send,
  Loader2,
  User as UserIcon,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable, EmptyState, type Column } from '@/components/admin';
import { supportService } from '@/lib/api';
import type { SupportTicket, TicketMessage } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatDateTime, timeAgo, statusVariant } from '@/lib/format';

const STATUSES = ['open', 'in-progress', 'waiting', 'resolved', 'closed'] as const;

const priorityClass: Record<string, string> = {
  urgent: 'text-destructive font-semibold',
  high: 'text-orange-500 font-medium',
  medium: '',
  low: 'text-muted-foreground',
};

export default function SupportPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const selected = useAsyncState<SupportTicket | null>(null);
  const tickets = useAsync(
    () =>
      supportService
        .getAll({ limit: 500, status: statusFilter === 'all' ? undefined : statusFilter })
        .then((r) => {
          const data = r?.data ?? r;
          return Array.isArray(data) ? (data as SupportTicket[]) : data?.tickets ?? [];
        }),
    [statusFilter]
  );

  const rows = tickets.data ?? [];

  const columns: Column<SupportTicket>[] = [
    {
      key: 'subject',
      header: 'Ticket',
      sortValue: (r) => r.subject,
      render: (r) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="font-medium truncate">{r.subject}</p>
          <p className="text-xs text-muted-foreground truncate">{r.description}</p>
        </div>
      ),
    },
    { key: 'clientId', header: 'Client', sortValue: (r) => r.clientId, render: (r) => <span className="text-muted-foreground">#{r.clientId}</span> },
    { key: 'category', header: 'Category', hideOnMobile: true, render: (r) => <Badge variant="outline" className="text-[10px]">{r.category}</Badge> },
    {
      key: 'priority',
      header: 'Priority',
      sortValue: (r) => r.priority,
      render: (r) => <span className={priorityClass[r.priority] ?? ''}>{r.priority}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge>,
    },
    { key: 'messages', header: 'Msgs', hideOnMobile: true, render: (r) => <span className="tabular-nums text-muted-foreground">{r.messages?.length ?? 0}</span> },
    { key: 'createdAt', header: 'Opened', sortValue: (r) => r.createdAt, render: (r) => <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Support Tickets" description="Client support conversations across the platform" />

      <DataTable
        columns={columns}
        rows={tickets.data ? rows : null}
        rowKey={(r) => String(r.id)}
        isLoading={tickets.isLoading}
        error={tickets.error}
        onRetry={tickets.refresh}
        searchPlaceholder="Search tickets..."
        searchFn={(r, q) => r.subject.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)}
        emptyMessage="No support tickets"
        onRowClick={(r) => selected.setValue(r)}
        toolbar={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <TicketDialog ticket={selected.value} onClose={() => selected.setValue(null)} onChanged={() => tickets.refresh()} />
    </>
  );
}

// tiny local state helper to avoid useState import juggling in one line
function useAsyncState<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  return { value, setValue };
}

function TicketDialog({ ticket, onClose, onChanged }: { ticket: SupportTicket | null; onClose: () => void; onChanged: () => void }) {
  const full = useAsync<SupportTicket | null>(
    () => (ticket ? supportService.getById(String(ticket.id)).catch(() => ticket) : Promise.resolve(null)),
    [ticket?.id]
  );
  const t = full.data ?? ticket;
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const send = async () => {
    if (!t || !reply.trim()) return;
    setSending(true);
    try {
      await supportService.addMessage(t.id, reply.trim(), 'ZOTA Support', 'agent');
      setReply('');
      toast.success('Reply sent');
      full.refresh();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!t) return;
    setUpdating(true);
    try {
      await supportService.updateStatus(t.id, status);
      toast.success(`Ticket set to ${status}`);
      full.refresh();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const messages: TicketMessage[] = t?.messages ?? [];

  return (
    <Dialog open={!!ticket} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        {t && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                {t.subject}
              </DialogTitle>
              <DialogDescription>
                Client #{t.clientId} · {t.category} · opened {formatDateTime(t.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
              <span className={`text-xs ${priorityClass[t.priority] ?? ''}`}>{t.priority} priority</span>
              <div className="ml-auto flex items-center gap-1.5">
                <Select value={t.status} onValueChange={updateStatus} disabled={updating}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-72 rounded-lg border border-border bg-muted/30 p-3">
              {messages.length === 0 ? (
                <EmptyState message="No messages yet" icon={MessageSquare} />
              ) : (
                <div className="space-y-3 pr-3">
                  {messages.map((m, i) => {
                    const isAgent = (m as { sender?: string }).sender !== 'user';
                    return (
                      <div key={`${m.id ?? i}`} className={`flex gap-2.5 ${isAgent ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isAgent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {isAgent ? <ShieldCheck className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${isAgent ? 'bg-primary/10 rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'}`}>
                          <p className="mb-1 text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground">{m.senderName ?? (isAgent ? 'Support' : 'Client')}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {(() => {
                                const ts = m.timestamp ? new Date(m.timestamp) : null;
                                return ts && !Number.isNaN(ts.getTime()) ? timeAgo(ts.toISOString()) : '—';
                              })()}
                            </span>
                          </p>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply to the client..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
                }}
              />
              <Button onClick={send} disabled={sending || !reply.trim()} className="shrink-0 self-end">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
