'use client';

import { useMemo, useState } from 'react';
import { CreditCard, TrendingUp, Landmark, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable, StatsCard, CardSkeleton, type Column } from '@/components/admin';
import { clientsService, reportsService } from '@/lib/api';
import type { VoucherSale } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatNumber, timeAgo } from '@/lib/format';

interface Row extends VoucherSale {
  clientName: string;
}

interface Enriched {
  rows: Row[];
  clientNames: Map<string, string>;
}

export default function PaymentsPage() {
  const [clientFilter, setClientFilter] = useState('all');

  const data = useAsync<Enriched>(async () => {
    const list = await clientsService.getAll();
    const settled = await Promise.allSettled(
      list.map((c) =>
        reportsService.getSalesReport(c.id).then((r) => r.sales.map((s) => ({ ...s, clientName: c.businessName })))
      )
    );
    return {
      rows: settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
      clientNames: new Map(list.map((c) => [String(c.id), c.businessName])),
    };
  }, []);

  const rows = useMemo(() => {
    const all = data.data?.rows ?? [];
    return clientFilter === 'all' ? all : all.filter((r) => String(r.clientId) === clientFilter);
  }, [data.data, clientFilter]);

  const totals = useMemo(() => {
    const gross = rows.reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const fees = rows.reduce((s, r) => s + Number(r.fee ?? 0), 0);
    return { gross, fees, net: gross - fees };
  }, [rows]);

  const columns: Column<Row>[] = [
    { key: 'createdAt', header: 'When', sortValue: (r) => r.createdAt, render: (r) => <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span> },
    { key: 'clientName', header: 'Client', sortValue: (r) => r.clientName },
    { key: 'voucherCode', header: 'Voucher', render: (r) => <span className="font-mono text-xs">{r.voucherCode || '—'}</span> },
    { key: 'phone', header: 'Paid By', hideOnMobile: true, render: (r) => <span className="font-mono text-xs">{r.phone || '—'}</span> },
    {
      key: 'provider',
      header: 'Method',
      hideOnMobile: true,
      sortValue: (r) => r.provider,
      render: (r) => <Badge variant="outline" className="text-[10px]">{r.provider || '—'}</Badge>,
    },
    {
      key: 'fee',
      header: 'Fee',
      hideOnMobile: true,
      sortValue: (r) => Number(r.fee ?? 0),
      render: (r) => <span className="tabular-nums text-muted-foreground">{formatMoney(Number(r.fee ?? 0))}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (r) => Number(r.amount),
      render: (r) => <span className="tabular-nums font-medium">{formatMoney(Number(r.amount))}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Payments" description="Every voucher purchase made across the platform" />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {data.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
        <StatsCard title="Transactions" value={formatNumber(rows.length)} icon={CreditCard} description="Voucher sales" />
        <StatsCard title="Gross Volume" value={formatMoney(totals.gross)} icon={TrendingUp} variant="primary" animated={false} description="Total sale value" />
        <StatsCard title="Service Fees" value={formatMoney(totals.fees)} icon={Landmark} variant="warning" animated={false} description="Platform take" />
        <StatsCard title="Net to Clients" value={formatMoney(totals.net)} icon={Wallet} variant="success" animated={false} description="After fees" />
          </>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={data.data ? rows : null}
        rowKey={(r) => `${r.clientId}-${r.id}`}
        isLoading={data.isLoading}
        error={data.error}
        onRetry={data.refresh}
        searchPlaceholder="Search sales..."
        searchFn={(r, q) => r.clientName.toLowerCase().includes(q) || (r.voucherCode ?? '').toLowerCase().includes(q) || (r.phone ?? '').includes(q)}
        emptyMessage="No payment records"
        pageSize={20}
        toolbar={
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {Array.from((data.data?.clientNames ?? new Map()).entries()).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </>
  );
}
