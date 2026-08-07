'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Search,
  MessageSquare,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  Users,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { StatsCard } from '@/components/admin/cards/stat-card';
import {
  clientsService,
  walletsService,
  withdrawalsService,
  purchasesService,
  accountsService,
  reportsService,
  smsService,
} from '@/lib/api';
import type {
  Client,
  Wallet,
  Transaction,
  Withdrawal,
  VoucherSale,
  AgentAccount,
  SalesReport,
} from '@/lib/api/types';
import { toast } from 'sonner';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'success') {
    return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">{status}</Badge>;
  }
  if (normalized === 'pending') {
    return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">{status}</Badge>;
  }
  if (normalized === 'failed' || normalized === 'rejected') {
    return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">{status}</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

export default function ClientFinancialsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [agents, setAgents] = useState<AgentAccount[]>([]);
  const [smsBalance, setSmsBalance] = useState<{
    balance: number;
    smsRemaining: number;
    smsPricePerUnit: number;
    totalSmsSent: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [txSearch, setTxSearch] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          clientsService.getById(clientId),
          walletsService.getByClient(clientId),
          reportsService.getSalesReport(clientId),
          accountsService.getAgentsByClient(clientId),
          smsService.getBalance(clientId),
        ]);

        if (results[0].status === 'fulfilled' && results[0].value) setClient(results[0].value);

        if (results[1].status === 'fulfilled' && results[1].value) {
          const w = results[1].value;
          setWallet(w);

          const [txData, wdData] = await Promise.allSettled([
            walletsService.getTransactions(w.id, 100),
            withdrawalsService.getByWallet(w.id),
          ]);

          if (txData.status === 'fulfilled' && Array.isArray(txData.value)) {
            setTransactions(txData.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
          if (wdData.status === 'fulfilled' && Array.isArray(wdData.value)) {
            setWithdrawals(wdData.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        }

        if (results[2].status === 'fulfilled' && results[2].value) setSalesReport(results[2].value);
        if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) setAgents(results[3].value);
        if (results[4].status === 'fulfilled' && results[4].value) setSmsBalance(results[4].value);
      } catch {
        toast.error('Failed to load financial data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  const filteredTx = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (txTypeFilter === 'all' || t.type.toLowerCase() === txTypeFilter.toLowerCase()) &&
          (!txSearch ||
            (t.description || '').toLowerCase().includes(txSearch.toLowerCase()) ||
            (t.reference || '').toLowerCase().includes(txSearch.toLowerCase()))
      ),
    [transactions, txTypeFilter, txSearch]
  );

  const filteredSales = useMemo(() => {
    if (!salesReport?.sales) return [];
    return salesReport.sales
      .filter(
        (s) =>
          !salesSearch ||
          (s.voucherCode || '').toLowerCase().includes(salesSearch.toLowerCase()) ||
          s.phone.toLowerCase().includes(salesSearch.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [salesReport, salesSearch]);

  const txTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      const key = (t.type || 'Unknown').toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [transactions]);

  const totalDeposits = useMemo(
    () => transactions.filter((t) => (t.type || '').toLowerCase().includes('deposit')).reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const totalWithdrawals = useMemo(
    () =>
      transactions
        .filter((t) => (t.type || '').toLowerCase().includes('withdraw'))
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Link href="/admin/clients" className="hover:text-primary transition-colors">
            Clients
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/admin/clients/${clientId}`} className="hover:text-primary transition-colors">
            {client?.businessName || 'Client'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Financials</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Financial Details
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial overview for {client?.businessName || 'this client'}
          </p>
        </div>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Wallet Balance"
              value={wallet?.balance ?? 0}
              prefix="UGX "
              description="Current wallet balance"
              icon={WalletIcon}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Total Revenue"
              value={salesReport?.summary.totalRevenue ?? 0}
              prefix="UGX "
              description="Gross sales revenue"
              icon={TrendingUp}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Service Fees"
              value={salesReport?.summary.totalServiceFees ?? salesReport?.summary.totalFees ?? 0}
              prefix="UGX "
              description="Total fees collected"
              icon={ArrowUpFromLine}
              variant="warning"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Net Revenue"
              value={salesReport?.summary.netRevenue ?? 0}
              prefix="UGX "
              description="Revenue after fees"
              icon={DollarSign}
              variant="default"
            />
          </StaggerItem>
        </StaggerContainer>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Total Deposits"
              value={totalDeposits}
              prefix="UGX "
              description="All incoming funds"
              icon={ArrowDownToLine}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Total Withdrawals"
              value={totalWithdrawals}
              prefix="UGX "
              description="All outgoing funds"
              icon={TrendingDown}
              variant="warning"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Transactions"
              value={transactions.length}
              description={`${Object.keys(txTypeCounts).length} unique types`}
              icon={Receipt}
              variant="default"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Voucher Sales"
              value={salesReport?.sales?.length ?? 0}
              suffix=""
              description="Total voucher transactions"
              icon={ShoppingCart}
              variant="default"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <WalletIcon className="h-5 w-5 text-primary" />
                Wallet Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallet ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Wallet ID</p>
                      <p className="font-mono text-sm font-medium">{wallet.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Owner Type</p>
                      <Badge variant="outline" className="mt-0.5">{wallet.ownerType}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                      <p className="font-mono text-sm font-medium">{wallet.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
                      <p className="text-sm">{format(new Date(wallet.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Available Balance</p>
                    <p className="text-3xl font-bold text-primary">{fmtCurrency(wallet.balance)}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <WalletIcon className="h-12 w-12 opacity-50 mb-2" />
                  <p className="text-sm">No wallet found for this client</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                SMS Float Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {smsBalance ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Float Balance</p>
                      <p className="font-semibold text-lg">{fmtCurrency(smsBalance.balance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">SMS Remaining</p>
                      <p className="font-semibold text-lg">{smsBalance.smsRemaining.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Per SMS</p>
                      <p className="font-semibold">{fmtCurrency(smsBalance.smsPricePerUnit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total SMS Sent</p>
                      <p className="font-semibold text-lg">{smsBalance.totalSmsSent.toLocaleString()}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 opacity-50 mb-2" />
                  <p className="text-sm">No SMS float data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-indigo-500" />
                Agent Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 opacity-50 mb-2" />
                  <p className="text-sm">No agent accounts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.agentFullname}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.agentEmail}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {fmtCurrency(a.balance)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(a.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownToLine className="h-5 w-5 text-orange-500" />
                Withdrawal History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ArrowDownToLine className="h-12 w-12 opacity-50 mb-2" />
                  <p className="text-sm">No withdrawals recorded</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="text-right font-semibold text-red-600">
                            {fmtCurrency(w.amount)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{w.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{w.provider}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(w.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(w.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="transactions" className="flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              Wallet Transactions
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              Voucher Sales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <CardTitle className="text-base">Transaction History</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search description or ref…"
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="pl-9 w-[220px]"
                      />
                    </div>
                    <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.keys(txTypeCounts).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)} ({txTypeCounts[t]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTx.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Receipt className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm">Wallet transactions will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTx.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">{t.type}</Badge>
                            </TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">
                              {t.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              <span
                                className={
                                  (t.type || '').toLowerCase().includes('deposit') ||
                                  (t.type || '').toLowerCase().includes('credit')
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {(t.type || '').toLowerCase().includes('deposit') ||
                                (t.type || '').toLowerCase().includes('credit')
                                  ? '+'
                                  : '-'}
                                {fmtCurrency(t.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground max-w-[150px] truncate">
                              {t.reference || '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(t.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(t.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <CardTitle className="text-base">Voucher Sales History</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search code or phone…"
                      value={salesSearch}
                      onChange={(e) => setSalesSearch(e.target.value)}
                      className="pl-9 w-[220px]"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredSales.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <CreditCard className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">No voucher sales found</p>
                    <p className="text-sm">Voucher sales will appear here when customers purchase</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Voucher Code</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSales.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono text-xs">{s.voucherCode || s.id}</TableCell>
                            <TableCell className="text-sm">{s.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{s.provider}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {fmtCurrency(s.amount)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {fmtCurrency(s.fee)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {fmtCurrency(s.netAmount)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(s.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
