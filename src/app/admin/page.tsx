'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownRight, ArrowUpRight, CreditCard, Download, Headphones,
  Server, ShieldAlert, TrendingUp, Users, Wallet,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { clientsService, reportsService, supportService, walletsService } from '@/lib/api';
import type { Client, VoucherSale, SupportTicket } from '@/lib/api/types';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { StatsCard } from '@/components/admin/cards/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allSales, setAllSales] = useState<(VoucherSale & { clientName: string })[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [adminBalance, setAdminBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [clientList, ticketData] = await Promise.all([
          clientsService.getAll(),
          supportService.getAll({ limit: 500 }).catch(() => ({ data: [] })),
        ]);
        setClients(clientList);

        const ticketArr: SupportTicket[] = Array.isArray(ticketData?.data) ? ticketData.data :
          Array.isArray(ticketData) ? ticketData as SupportTicket[] : [];
        setTickets(ticketArr);

        // Fetch sales for all clients in parallel
        const salesResults = await Promise.allSettled(
          clientList.map(c =>
            reportsService.getSalesReport(c.id).then(r => r.sales.map(s => ({ ...s, clientName: c.businessName })))
          )
        );
        const sales = salesResults.flatMap(r => r.status === 'fulfilled' ? r.value : []);
        setAllSales(sales);

        // Try admin wallet balance
        try {
          const wallet = await walletsService.getAdminWallet();
          setAdminBalance(wallet.balance ?? 0);
        } catch { /* not critical */ }
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const totalRevenue = useMemo(() => allSales.reduce((s, sale) => s + sale.amount, 0), [allSales]);
  const totalFees = useMemo(() => allSales.reduce((s, sale) => s + sale.fee, 0), [allSales]);

  const chartData = useMemo(() => {
    const byMonth: Record<string, { revenue: number; fees: number }> = {};
    allSales.forEach(sale => {
      const m = MONTHS[new Date(sale.createdAt).getMonth()]!;
      if (!byMonth[m]) byMonth[m] = { revenue: 0, fees: 0 };
      byMonth[m]!.revenue += sale.amount;
      byMonth[m]!.fees += sale.fee;
    });
    return MONTHS.filter(m => byMonth[m]).map(m => ({ month: m, revenue: byMonth[m]!.revenue, fees: byMonth[m]!.fees }));
  }, [allSales]);

  const recentSales = useMemo(() =>
    [...allSales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [allSales]
  );

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const urgentTickets = tickets.filter(t => t.status === 'open' && (t.priority === 'urgent' || t.priority === 'high')).length;
  const pendingClients = clients.filter(c => c.status === 'Pending').length;

  const activeClients = useMemo(
    () => clients.filter(c => c.status === 'Active').slice(0, 5),
    [clients]
  );

  const riskQueue = [
    { label: 'Open support tickets', value: String(openTickets), tone: urgentTickets > 0 ? 'warning' : 'default' },
    { label: 'High-priority escalations', value: String(urgentTickets), tone: urgentTickets > 0 ? 'warning' : 'default' },
    { label: 'Clients pending activation', value: String(pendingClients), tone: pendingClients > 0 ? 'warning' : 'default' },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm"
        >
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.5fr_1fr] lg:px-8 lg:py-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-primary/10 text-primary">Live overview</Badge>
                <Badge variant="outline">Updated from live client data</Badge>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Run operations from one place without losing the signal.
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Revenue, client health, and support flow — consolidated so you can move from monitoring to action faster.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="h-11 rounded-xl"><Download className="mr-2 h-4 w-4" />Export executive report</Button>
                <Link href="/admin/support">
                  <Button variant="outline" className="h-11 rounded-xl"><Headphones className="mr-2 h-4 w-4" />Review support queue</Button>
                </Link>
              </div>
            </div>

            <Card className="rounded-[24px] border-border/70 bg-secondary/50 shadow-none">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">Risk Snapshot</CardDescription>
                <CardTitle className="text-xl">Items needing attention</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground text-center py-4">Loading…</div>
                ) : riskQueue.map(item => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                    </div>
                    <Badge variant={item.tone === 'warning' ? 'default' : 'secondary'}>{item.value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <StatsCard title="Platform Revenue" value={totalRevenue} description="Total gross revenue across all clients." icon={Server} variant="primary" />
          </StaggerItem>
          <StaggerItem>
            <StatsCard title="Service Fees" value={totalFees} description="Net admin fees collected from all sales." icon={TrendingUp} variant="success" />
          </StaggerItem>
          <StaggerItem>
            <StatsCard title="Active Clients" value={clients.filter(c => c.status === 'Active').length} description="Businesses running on the platform." icon={Users} suffix="" decimals={0} />
          </StaggerItem>
          <StaggerItem>
            <StatsCard title="Admin Balance" value={adminBalance} description="Withdrawable admin wallet balance." icon={Wallet} variant="warning" />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="rounded-[24px] border-border/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">Performance Trend</CardDescription>
                <CardTitle className="text-2xl">Revenue and fee capture</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">By month</Badge>
                <Badge variant="outline">Live data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
              ) : chartData.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '16px' }} formatter={(v: number) => [fmtCurrency(v)]} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} name="Revenue" />
                      <Line type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={2} dot={false} name="Fees" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/70">
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">Active Accounts</CardDescription>
              <CardTitle className="text-2xl">Client portfolio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isLoading ? (
                <div className="rounded-2xl border bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : activeClients.length === 0 ? (
                <div className="rounded-2xl border bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">No active clients yet.</div>
              ) : (
                activeClients.map(client => (
                  <Link key={client.id} href={`/admin/clients/${client.id}`}>
                    <div className="flex items-center justify-between rounded-2xl border bg-secondary/30 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{client.businessName}</p>
                        <p className="truncate text-sm text-muted-foreground">{client.adminEmail}</p>
                      </div>
                      <Badge variant="outline">{client.status}</Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-[24px] border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">Revenue Ledger</CardDescription>
                <CardTitle className="text-2xl">Recent sales</CardTitle>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center text-sm text-muted-foreground py-8">Loading…</div>
              ) : recentSales.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">No sales recorded yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher</TableHead><TableHead>Client</TableHead>
                      <TableHead>Provider</TableHead><TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales.map((s, i) => (
                      <TableRow key={`${s.id}-${i}`}>
                        <TableCell className="font-mono text-xs">{s.voucherCode || s.id}</TableCell>
                        <TableCell className="text-sm">{s.clientName}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{s.provider}</Badge></TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">+{fmtCurrency(s.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">Action Queue</CardDescription>
                <CardTitle className="text-2xl">What needs moving today</CardTitle>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/admin/support">
                <div className="rounded-2xl border bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Support queue</p>
                      <p className="text-sm text-muted-foreground">Tickets awaiting response.</p>
                    </div>
                    <Badge>{openTickets} open</Badge>
                  </div>
                </div>
              </Link>
              <Link href="/admin/clients">
                <div className="rounded-2xl border bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Client approvals</p>
                      <p className="text-sm text-muted-foreground">New registrations pending review.</p>
                    </div>
                    <Badge variant="outline"><Users className="mr-1 h-3.5 w-3.5" />{pendingClients} pending</Badge>
                  </div>
                </div>
              </Link>
              <Link href="/admin/payments">
                <div className="rounded-2xl border bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Payment ledger</p>
                      <p className="text-sm text-muted-foreground">Review all recent transactions.</p>
                    </div>
                    <Badge variant="secondary"><CreditCard className="mr-1 h-3.5 w-3.5" />{allSales.length} total</Badge>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
