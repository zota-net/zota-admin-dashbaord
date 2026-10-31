'use client';

import { useMemo } from 'react';
import { MessageSquare, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PageHeader, DataTable, StatsCard, CardSkeleton, type Column } from '@/components/admin';
import { clientsService, smsService } from '@/lib/api';
import { useAsync } from '@/lib/use-async';
import { formatMoney } from '@/lib/format';

interface Row {
  id: string;
  clientId: string;
  clientName: string;
  balance: number;
  phone?: string;
}

export default function SmsPage() {
  const clients = useAsync(() => clientsService.getAll(), []);
  const floats = useAsync(() => smsService.getAllFloats(), []);

  const rows = useMemo<Row[]>(() => {
    const fd = floats.data as unknown;
    const raw = Array.isArray(fd) ? fd : (fd as { floats?: unknown[] })?.floats ?? [];
    const nameById = new Map((clients.data ?? []).map((c) => [String(c.id), c.businessName]));
    return (raw as Record<string, unknown>[])
      .map((f, i) => {
        const clientId = String(f.client_id ?? f.clientId ?? '');
        return {
          id: String(f.id ?? i),
          clientId,
          clientName: nameById.get(clientId) ?? `Client #${clientId}`,
          balance: Number(f.balance ?? f.currentBalance ?? 0),
          phone: String(f.phone ?? ''),
        };
      })
      .filter((r) => r.clientId || r.balance);
  }, [floats.data, clients.data]);

  const totalFloat = rows.reduce((s, r) => s + r.balance, 0);
  const withFloat = rows.filter((r) => r.balance > 0).length;

  const columns: Column<Row>[] = [
    {
      key: 'clientName',
      header: 'Client',
      sortValue: (r) => r.clientName,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{r.clientName}</p>
            {r.phone && <p className="text-xs text-muted-foreground font-mono">{r.phone}</p>}
          </div>
        </div>
      ),
    },
    { key: 'clientId', header: 'Client ID', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">#{r.clientId}</span> },
    {
      key: 'balance',
      header: 'SMS Float',
      sortValue: (r) => r.balance,
      render: (r) => (
        <span className={r.balance > 0 ? 'tabular-nums font-medium' : 'tabular-nums text-destructive font-medium'}>
          {formatMoney(r.balance)}
        </span>
      ),
    },
    {
      key: 'state',
      header: 'Status',
      render: (r) =>
        r.balance > 0 ? (
          <Badge variant="default" className="text-[10px]">Funded</Badge>
        ) : (
          <Badge variant="destructive" className="text-[10px]">Depleted</Badge>
        ),
      sortValue: (r) => (r.balance > 0 ? 1 : 0),
    },
  ];

  return (
    <>
      <PageHeader title="SMS Float" description="Messaging balances available to clients for SMS notifications" />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {floats.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
        <StatsCard title="Total Float Held" value={formatMoney(totalFloat)} icon={Coins} variant="primary" animated={false} />
        <StatsCard title="Clients With Float" value={withFloat} icon={MessageSquare} description={`of ${rows.length} accounts`} />
        <StatsCard title="Depleted Accounts" value={rows.length - withFloat} icon={MessageSquare} variant="danger" />
          </>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={floats.isLoading || clients.isLoading ? null : rows}
        rowKey={(r) => r.id}
        isLoading={floats.isLoading || clients.isLoading}
        error={floats.error}
        onRetry={floats.refresh}
        searchPlaceholder="Search clients..."
        searchFn={(r, q) => r.clientName.toLowerCase().includes(q)}
        emptyMessage="No SMS float records"
        pageSize={20}
      />
    </>
  );
}
