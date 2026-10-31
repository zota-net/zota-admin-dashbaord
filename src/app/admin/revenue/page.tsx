'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CircleDollarSign, TrendingUp, Landmark, ArrowDownLeft, Loader2 } from 'lucide-react';
import {
  Area,
  AreaChart,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, StatsCard, ErrorState, EmptyState, DataTable, CardSkeleton, type Column } from '@/components/admin';
import { withdrawalsService, adminStatsService } from '@/lib/api';
import type { AdminWithdrawal, Transaction, Wallet } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatDateTime, timeAgo, statusVariant } from '@/lib/format';

export default function RevenuePage() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const wallet = useAsync<Wallet | null>(() => adminStatsService.getAdminWallet(), []);
  const txns = useAsync<Transaction[]>(
    () => (wallet.data ? adminStatsService.getWalletTransactions(wallet.data.id, 200) : Promise.resolve([])),
    [wallet.data?.id]
  );
  const withdrawals = useAsync<AdminWithdrawal[]>(
    () => withdrawalsService.getAdminWithdrawals().catch(() => [] as AdminWithdrawal[]),
    []
  );

  const totals = useMemo(() => {
    const list = txns.data ?? [];
    const inflow = list.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
    const withdrawn = (withdrawals.data ?? [])
      .filter((w) => String(w.status).toLowerCase() === 'completed')
      .reduce((s, w) => s + Number(w.amount), 0);
    return { inflow, withdrawn };
  }, [txns.data, withdrawals.data]);

  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    (txns.data ?? [])
      .filter((t) => Number(t.amount) > 0)
      .forEach((t) => {
        const day = new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        byDay.set(day, (byDay.get(day) ?? 0) + Number(t.amount));
      });
    return Array.from(byDay.entries()).slice(-14).map(([day, total]) => ({ day, total }));
  }, [txns.data]);

  const txnColumns: Column<Transaction>[] = [
    { key: 'createdAt', header: 'Date', render: (r) => <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span>, sortValue: (r) => r.createdAt },
    { key: 'type', header: 'Type', render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
    { key: 'description', header: 'Description', hideOnMobile: true },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (r) => Number(r.amount),
      render: (r) => (
        <span className={Number(r.amount) >= 0 ? 'text-green-500 tabular-nums font-medium' : 'tabular-nums'}>
          {formatMoney(Number(r.amount))}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge> },
  ];

  const withdrawalColumns: Column<AdminWithdrawal>[] = [
    { key: 'createdAt', header: 'Date', sortValue: (r) => r.createdAt, render: (r) => <span className="text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
    { key: 'phone', header: 'Phone', render: (r) => <span className="font-mono text-xs">{r.phone}</span> },
    { key: 'provider', header: 'Provider', render: (r) => <Badge variant="secondary" className="text-[10px]">{r.provider}</Badge> },
    { key: 'amount', header: 'Amount', sortValue: (r) => r.amount, render: (r) => <span className="tabular-nums font-medium">{formatMoney(r.amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge> },
    { key: 'failureReason', header: 'Note', hideOnMobile: true, render: (r) => <span className="text-xs text-muted-foreground">{r.failureReason ?? '—'}</span> },
  ];

  return (
    <>
      <PageHeader title="Revenue Control" description="Platform earnings, admin wallet and withdrawals">
        <Button size="sm" onClick={() => setWithdrawOpen(true)} disabled={!wallet.data || wallet.data.balance <= 0}>
          <ArrowDownLeft className="h-4 w-4 mr-2" />
          Withdraw Funds
        </Button>
      </PageHeader>

      {wallet.error ? (
        <ErrorState message={wallet.error} onRetry={wallet.refresh} />
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {wallet.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
            <StatsCard
              title="Admin Wallet"
              value={wallet.data ? formatMoney(wallet.data.balance) : '—'}
              description="Available balance"
              icon={CircleDollarSign}
              variant="primary"
              animated={false}
            />
            <StatsCard
              title="Platform Income"
              value={txns.data ? formatMoney(totals.inflow) : '—'}
              description="Recorded inflow (recent history)"
              icon={TrendingUp}
              variant="success"
              animated={false}
            />
            <StatsCard
              title="Total Withdrawn"
              value={withdrawals.data ? formatMoney(totals.withdrawn) : '—'}
              description="Completed withdrawals"
              icon={Landmark}
              animated={false}
            />
            <StatsCard
              title="Withdrawals"
              value={withdrawals.data?.length ?? 0}
              description="Requests processed"
              icon={ArrowDownLeft}
            />
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Income Trend</CardTitle>
              <CardDescription>Daily inflow into the admin wallet (last recorded days)</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {txns.isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : chartData.length === 0 ? (
                <EmptyState message="No income recorded yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" />
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
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#revFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold px-1">Wallet Transactions</h2>
              <DataTable
                columns={txnColumns}
                rows={wallet.data ? txns.data : null}
                rowKey={(r) => r.id}
                isLoading={wallet.isLoading || txns.isLoading}
                error={wallet.data ? txns.error : 'Admin wallet not found'}
                onRetry={txns.refresh}
                searchPlaceholder="Search transactions..."
                pageSize={8}
                emptyMessage="No transactions"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold px-1">Withdrawal History</h2>
              <DataTable
                columns={withdrawalColumns}
                rows={withdrawals.data}
                rowKey={(r) => String(r.id)}
                isLoading={withdrawals.isLoading}
                error={withdrawals.error}
                onRetry={withdrawals.refresh}
                searchPlaceholder="Search withdrawals..."
                pageSize={8}
                emptyMessage="No withdrawals"
              />
            </div>
          </div>
        </>
      )}

      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        balance={wallet.data?.balance ?? 0}
        onDone={() => {
          wallet.refresh();
          txns.refresh();
          withdrawals.refresh();
        }}
      />
    </>
  );
}

function WithdrawDialog({
  open,
  onOpenChange,
  balance,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  balance: number;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > balance) return toast.error('Amount exceeds wallet balance');
    if (!phone) return toast.error('Enter a mobile money phone number');
    setSaving(true);
    try {
      const res = await withdrawalsService.initiateAdminWithdrawal({ amount: amt, phone, provider });
      toast.success(`Withdrawal initiated — new balance ${formatMoney(Number(res.newBalance ?? balance - amt))}`);
      setAmount('');
      setPhone('');
      onOpenChange(false);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw from Admin Wallet</DialogTitle>
          <DialogDescription>Available balance: {formatMoney(balance)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Amount (UGX)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="077..." />
            </div>
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as 'MTN' | 'Airtel')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTN">MTN MoMo</SelectItem>
                  <SelectItem value="Airtel">Airtel Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Withdraw
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
