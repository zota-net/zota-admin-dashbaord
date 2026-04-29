'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Download,
  Headphones,
  Server,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { clientsService, reportsService } from '@/lib/api';
import type { Client } from '@/lib/api/types';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { StatsCard } from '@/components/admin/cards/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const revenueData = [
  { month: 'Jan', revenue: 450000, fees: 32000 },
  { month: 'Feb', revenue: 520000, fees: 41000 },
  { month: 'Mar', revenue: 610000, fees: 47000 },
  { month: 'Apr', revenue: 780000, fees: 59000 },
  { month: 'May', revenue: 950000, fees: 68000 },
  { month: 'Jun', revenue: 1200000, fees: 87000 },
];

const serviceFeeTransactions = [
  { id: 'TRX-001', client: 'Alpha Cafe', date: '2026-04-26', amount: 15000, status: 'Completed' },
  { id: 'TRX-002', client: 'Velocity Gaming', date: '2026-04-25', amount: 25000, status: 'Completed' },
  { id: 'TRX-003', client: 'CyberNet Hub', date: '2026-04-24', amount: 12000, status: 'Completed' },
  { id: 'TRX-004', client: 'Starlight Internet', date: '2026-04-22', amount: 35000, status: 'Completed' },
];

const riskQueue = [
  { label: 'Pending support escalations', value: '18', tone: 'warning' },
  { label: 'Payment exceptions to review', value: '6', tone: 'default' },
  { label: 'Sites with offline devices', value: '4', tone: 'default' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount);

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(1200000);
  const [totalServiceFees] = useState(87000);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const clientsData = await clientsService.getAll();
        setClients(clientsData);
        setTotalClients(clientsData.length);

        let totalRevenueValue = 0;
        for (const client of clientsData) {
          try {
            const salesReport = await reportsService.getSalesReport(client.id);
            totalRevenueValue += salesReport.summary.totalRevenue ?? 0;
          } catch {}
        }

        if (totalRevenueValue > 0) {
          setTotalRevenue(totalRevenueValue);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activeClients = useMemo(
    () => clients.filter((client) => client.status?.toLowerCase() !== 'inactive').slice(0, 5),
    [clients]
  );

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
                <Badge className="border-0 bg-primary/10 text-primary">Today&apos;s overview</Badge>
                <Badge variant="outline">Updated from live client data</Badge>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Run operations from one place without losing the signal.
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  The admin dashboard is now organized around revenue, client health, and support flow so operators can move from monitoring to action faster.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="h-11 rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export executive report
                </Button>
                <Button variant="outline" className="h-11 rounded-xl">
                  <Headphones className="mr-2 h-4 w-4" />
                  Review support queue
                </Button>
              </div>
            </div>

            <Card className="rounded-[24px] border-border/70 bg-secondary/50 shadow-none">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                  Risk Snapshot
                </CardDescription>
                <CardTitle className="text-xl">Items worth operator attention</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {riskQueue.map((item) => (
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
            <StatsCard
              title="Platform Revenue"
              value={totalRevenue}
              description="Total revenue processed across all client businesses."
              icon={Server}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Service Fees"
              value={totalServiceFees}
              description="Net admin-side earnings captured from active usage."
              icon={TrendingUp}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Active Clients"
              value={totalClients}
              description="Businesses currently being managed in the platform."
              icon={Users}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Available Balance"
              value={totalServiceFees}
              description="Withdrawable operating balance at the current close."
              icon={Wallet}
              variant="warning"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <Card className="rounded-[24px] border-border/70">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                  Performance Trend
                </CardDescription>
                <CardTitle className="text-2xl">Revenue and fee capture</CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">Last 6 months</Badge>
                <Badge variant="outline">Finance view</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '16px',
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="fees" stroke="hsl(var(--brand-orange))" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/70">
            <CardHeader>
              <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                Active Accounts
              </CardDescription>
              <CardTitle className="text-2xl">Client portfolio at a glance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {isLoading ? (
                <div className="rounded-2xl border bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading client portfolio...
                </div>
              ) : activeClients.length === 0 ? (
                <div className="rounded-2xl border bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  No client records available yet.
                </div>
              ) : (
                activeClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between rounded-2xl border bg-secondary/30 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{client.businessName}</p>
                      <p className="truncate text-sm text-muted-foreground">{client.adminEmail || 'No email on file'}</p>
                    </div>
                    <Badge variant="outline">{client.status || 'Active'}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-[24px] border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                  Revenue Ledger
                </CardDescription>
                <CardTitle className="text-2xl">Recent service fees</CardTitle>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceFeeTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell>{transaction.client}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transaction.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        +{formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/70">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                  Action Queue
                </CardDescription>
                <CardTitle className="text-2xl">What needs moving today</CardTitle>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-2xl border bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Support queue</p>
                    <p className="text-sm text-muted-foreground">New tickets are waiting for first response.</p>
                  </div>
                  <Badge>12 open</Badge>
                </div>
              </div>
              <div className="rounded-2xl border bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Payment reviews</p>
                    <p className="text-sm text-muted-foreground">Unmatched wallet entries need operator confirmation.</p>
                  </div>
                  <Badge variant="outline">
                    <CreditCard className="mr-1 h-3.5 w-3.5" />
                    6 items
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl border bg-secondary/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Withdrawal approvals</p>
                    <p className="text-sm text-muted-foreground">Finance requests queued for end-of-day release.</p>
                  </div>
                  <Badge variant="secondary">3 pending</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
