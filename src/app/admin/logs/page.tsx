'use client';

import { useMemo, useState } from 'react';
import { Activity, Ticket, UserPlus, Landmark, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable, type Column } from '@/components/admin';
import { adminStatsService, withdrawalsService } from '@/lib/api';
import type { ClientOverview, AdminWithdrawal } from '@/lib/api';
import type { VoucherSale } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatDateTime, statusVariant } from '@/lib/format';

interface LogRow {
  id: string;
  time: string;
  type: 'voucher_sale' | 'client' | 'withdrawal';
  actor: string;
  action: string;
  reference: string;
  amount: number | null;
  status: string;
}

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  voucher_sale: Ticket,
  client: UserPlus,
  withdrawal: Landmark,
};

export default function LogsPage() {
  const [typeFilter, setTypeFilter] = useState('all');

  const overview = useAsync<ClientOverview[]>(() => adminStatsService.getPlatformOverview(), []);
  const withdrawals = useAsync<AdminWithdrawal[]>(
    () => withdrawalsService.getAdminWithdrawals().catch(() => [] as AdminWithdrawal[]),
    []
  );

  const rows = useMemo<LogRow[]>(() => {
    const events: LogRow[] = [];

    (overview.data ?? []).forEach((d) => {
      events.push({
        id: `client-${d.client.id}`,
        time: d.client.createdAt,
        type: 'client',
        actor: 'System',
        action: `Client registered: ${d.client.businessName}`,
        reference: `client/${d.client.id}`,
        amount: null,
        status: d.client.status,
      });
      d.sales.forEach((s: VoucherSale, i) => {
        events.push({
          id: `sale-${d.client.id}-${s.id ?? i}`,
          time: s.createdAt,
          type: 'voucher_sale',
          actor: d.client.businessName,
          action: `Voucher sold (${s.voucherCode ?? '—'}) via ${s.provider ?? 'unknown'}`,
          reference: `sale/${s.id ?? ''}`,
          amount: Number(s.amount ?? 0),
          status: 'completed',
        });
      });
    });

    (withdrawals.data ?? []).forEach((w) => {
      events.push({
        id: `wd-${w.id}`,
        time: w.createdAt,
        type: 'withdrawal',
        actor: `Admin wallet`,
        action: `Withdrawal ${w.provider} → ${w.phone}`,
        reference: `withdrawal/${w.id}`,
        amount: Number(w.amount),
        status: String(w.status),
      });
    });

    return events
      .filter((e) => e.time)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [overview.data, withdrawals.data]);

  const filtered = typeFilter === 'all' ? rows : rows.filter((r) => r.type === typeFilter);

  const columns: Column<LogRow>[] = [
    { key: 'time', header: 'Timestamp', sortValue: (r) => r.time, render: (r) => <span className="font-mono text-xs text-muted-foreground">{formatDateTime(r.time)}</span> },
    {
      key: 'type',
      header: 'Event',
      sortValue: (r) => r.type,
      render: (r) => {
        const Icon = typeIcon[r.type] ?? Activity;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            {r.type.replace('_', ' ')}
          </span>
        );
      },
    },
    { key: 'action', header: 'Action', render: (r) => <span className="text-sm">{r.action}</span> },
    { key: 'actor', header: 'Scope', hideOnMobile: true, sortValue: (r) => r.actor, render: (r) => <span className="text-sm text-muted-foreground">{r.actor}</span> },
    { key: 'reference', header: 'Reference', hideOnMobile: true, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.reference}</span> },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (r) => r.amount ?? 0,
      render: (r) => (r.amount == null ? <span className="text-muted-foreground">—</span> : <span className="tabular-nums font-medium">{formatMoney(r.amount)}</span>),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge> },
  ];

  return (
    <>
      <PageHeader title="Activity Logs" description="Chronological record of platform events — registrations, sales and withdrawals" />

      <DataTable
        columns={columns}
        rows={overview.data ? filtered : null}
        rowKey={(r) => r.id}
        isLoading={overview.isLoading}
        error={overview.error}
        onRetry={() => {
          overview.refresh();
          withdrawals.refresh();
        }}
        searchPlaceholder="Search logs..."
        searchFn={(r, q) => r.action.toLowerCase().includes(q) || r.actor.toLowerCase().includes(q) || r.reference.includes(q)}
        emptyMessage="No activity recorded"
        pageSize={25}
        toolbar={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="voucher_sale">Voucher sales</SelectItem>
              <SelectItem value="client">Client events</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <CreditCard className="h-4 w-4" />
        {filtered.length} events shown, newest first
      </div>
    </>
  );
}
