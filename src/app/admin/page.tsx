'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Wifi,
  Wallet,
  TrendingUp,
  CircleDollarSign,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard, PageHeader, ErrorState, EmptyState, DataTable, type Column } from '@/components/admin';
import { adminStatsService, type ClientOverview } from '@/lib/api';
import { supportService } from '@/lib/api';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatNumber, timeAgo, statusVariant } from '@/lib/format';

interface SaleRow {
  id: string;
  clientName: string;
  voucherCode: string;
  amount: number;
  provider: string;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const overview = useAsync<ClientOverview[]>(() => adminStatsService.getPlatformOverview(), []);
  const adminWallet = useAsync(() => adminStatsService.getAdminWallet(), []);
  const tickets = useAsync(() => supportService.getAll({ limit: 500 }).catch(() => null), []);

  const stats = useMemo(() => {
    const data = overview.data ?? [];
    const totalClients = data.length;
    const activeClients = data.filter((d) => d.client.status === 'Active').length;
    const totalDevices = data.reduce((s, d) => s + (d.report?.totalDevices ?? 0), 0);
    const totalBalances = data.reduce((s, d) => s + (d.wallet?.balance ?? 0), 0);
    const totalSales = data.reduce((s, d) => s + d.sales.reduce((a, v) => a + Number(v.amount ?? 0), 0), 0);
    return { data, totalClients, activeClients, totalDevices, totalBalances, totalSales };
  }, [overview.data]);

  const ticketList = tickets.data?.data ?? tickets.data ?? [];
  const openTickets = Array.isArray(ticketList)
    ? ticketList.filter((t: { status?: string }) => ['open', 'in-progress', 'waiting'].includes((t.status ?? '').toLowerCase())).length
    : 0;

  const chartData = useMemo(
    () =>
      stats.data
        .map((d) => ({
          name: d.client.businessName.length > 12 ? `${d.client.businessName.slice(0, 11)}…` : d.client.businessName,
          revenue: d.sales.reduce((a, v) => a + Number(v.amount ?? 0), 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
    [stats.data]
  );

  const recentSales = useMemo<SaleRow[]>(() => {
    const rows = stats.data.flatMap((d) =>
      d.sales.map((s) => ({
        id: `${d.client.id}-${s.id ?? s.voucherCode ?? Math.random()}`,
        clientName: d.client.businessName,
        voucherCode: s.voucherCode ?? '—',
        amount: Number(s.amount ?? 0),
        provider: s.provider ?? '—',
        createdAt: s.createdAt ?? '',
      }))
    );
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  }, [stats.data]);

  const saleColumns: Column<SaleRow>[] = [
    { key: 'clientName', header: 'Client', sortValue: (r) => r.clientName },
    { key: 'voucherCode', header: 'Voucher', hideOnMobile: true },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (r) => r.amount,
      render: (r) => <span className="font-medium tabular-nums">{formatMoney(r.amount)}</span>,
    },
    { key: 'provider', header: 'Provider', hideOnMobile: true },
    { key: 'createdAt', header: 'When', render: (r) => <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span> },
  ];

  const isLoading = overview.isLoading;

  return (
    <>
      <PageHeader title="Executive Dashboard" description="Platform-wide oversight across all clients">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/support">
            <Headphones className="h-4 w-4 mr-2" />
            Support
            {openTickets > 0 && (
              <Badge variant="destructive" className="ml-2">{openTickets}</Badge>
            )}
          </Link>
        </Button>
      </PageHeader>

      {overview.error ? (
        <ErrorState message={overview.error} onRetry={overview.refresh} />
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[120px]" />)
            ) : (
              <>
                <StatsCard
                  title="Clients"
                  value={stats.totalClients}
                  description={`${stats.activeClients} active`}
                  icon={Users}
                  variant="primary"
                />
                <StatsCard
                  title="Connected Devices"
                  value={stats.totalDevices}
                  description="Across all routers"
                  icon={Wifi}
                />
                <StatsCard
                  title="Client Wallets"
                  value={formatMoney(stats.totalBalances)}
                  description="Held balance"
                  icon={Wallet}
                  animated={false}
                />
                <StatsCard
                  title="Voucher Sales"
                  value={formatMoney(stats.totalSales)}
                  description="All-time through platform"
                  icon={TrendingUp}
                  variant="success"
                  animated={false}
                />
                <StatsCard
                  title="Platform Revenue"
                  value={adminWallet.data ? formatMoney(adminWallet.data.balance) : '—'}
                  description="Admin wallet balance"
                  icon={CircleDollarSign}
                  variant="warning"
                  animated={false}
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Client</CardTitle>
                <CardDescription>Voucher sales value per client (all-time)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : chartData.length === 0 ? (
                  <EmptyState message="No sales data yet" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                      />
                      <RechartsTooltip
                        formatter={(value) => formatMoney(Number(value))}
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Voucher Sales</CardTitle>
                    <CardDescription>Latest transactions across the platform</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/payments">
                      All payments <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={saleColumns}
                  rows={overview.data ? recentSales : null}
                  rowKey={(r) => r.id}
                  isLoading={isLoading}
                  searchable={false}
                  pageSize={10}
                  emptyMessage="No voucher sales yet"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Fleet</CardTitle>
                  <CardDescription>Balances, devices and sales at a glance</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/clients">
                    Manage clients <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {stats.data.slice(0, 6).map((d, i) => (
                    <motion.div
                      key={d.client.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link href={`/admin/clients/${d.client.id}`}>
                        <Card className="hover:border-primary/40 hover:bg-accent/30 transition-colors py-4">
                          <CardContent className="px-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold truncate">{d.client.businessName}</p>
                              <Badge variant={statusVariant(d.client.status)} className="text-[10px] shrink-0">
                                {d.client.status}
                              </Badge>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Wifi className="h-3.5 w-3.5" />
                                {formatNumber(d.report?.totalDevices ?? 0)} devices
                              </span>
                              <span className="tabular-nums">{formatMoney(d.wallet?.balance ?? 0)}</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {formatNumber(d.sales.length)} sales
                              </span>
                              <span className="tabular-nums font-medium">
                                {formatMoney(d.sales.reduce((a, v) => a + Number(v.amount ?? 0), 0))}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
