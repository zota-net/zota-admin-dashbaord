'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { clientsService, reportsService, walletsService } from '@/lib/api';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

type TimeRange = '7d' | '30d' | '90d' | '12m';

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalFees: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    growth: 0,
  });
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const loadRevenueData = async () => {
      setIsLoading(true);
      try {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        const clientsData = await clientsService.getAll();

        const dailyData: Record<string, { revenue: number; transactions: number }> = {};
        
        for (let i = days; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          dailyData[date] = { revenue: 0, transactions: 0 };
        }

        let totalRev = 0;
        let totalFees = 0;
        let totalTrans = 0;

        for (const client of clientsData) {
          try {
            const salesReport = await reportsService.getSalesReport(client.id, {
              startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
              endDate: format(new Date(), 'yyyy-MM-dd'),
            });

            totalRev += salesReport.summary.totalRevenue ?? 0;
            totalFees += salesReport.summary.totalFees ?? 0;
            totalTrans += salesReport.sales.length;

            for (const sale of salesReport.sales) {
              const date = format(parseISO(sale.createdAt), 'yyyy-MM-dd');
              if (dailyData[date]) {
                dailyData[date].revenue += sale.amount;
                dailyData[date].transactions += 1;
              }
            }
          } catch (e) {
            // Skip clients with no data
          }
        }

        const chartData = Object.entries(dailyData).map(([date, data]) => ({
          date: format(parseISO(date), 'MMM dd'),
          revenue: data.revenue,
          transactions: data.transactions,
        }));

        setRevenueData(chartData);
        
        const avgTrans = totalTrans > 0 ? totalRev / totalTrans : 0;
        const growth = 0;

        setSummary({
          totalRevenue: totalRev,
          totalFees: totalFees,
          totalTransactions: totalTrans,
          averageTransaction: avgTrans,
          growth,
        });

        setRecentWithdrawals([]);
      } catch (err) {
        console.error('Failed to load revenue data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRevenueData();
  }, [timeRange]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  const paymentMethodData = useMemo(() => {
    return [
      { name: 'Mobile Money', value: 45, color: '#22c55e' },
      { name: 'Bank Transfer', value: 30, color: '#3b82f6' },
      { name: 'Cash', value: 15, color: '#f59e0b' },
      { name: 'Other', value: 10, color: '#6b7280' },
    ];
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
            <p className="text-muted-foreground">Track your platform revenue and withdrawals</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {summary.growth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={summary.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(summary.growth)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Fees</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalFees)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Your revenue share</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{summary.totalTransactions}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Voucher redemptions</p>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Transaction</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.averageTransaction)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Per transaction</p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Over Time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : revenueData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No revenue data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {paymentMethodData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Transaction Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Transactions']}
                  />
                  <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Withdrawals Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Withdrawals & Disbursements
            </CardTitle>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="grid grid-cols-4 gap-4 p-3 text-sm font-medium text-muted-foreground bg-muted/50">
                <div>Date</div>
                <div>Amount</div>
                <div>Method</div>
                <div>Status</div>
              </div>
              {recentWithdrawals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No withdrawals yet. Request your first withdrawal above.
                </div>
              ) : (
                recentWithdrawals.map((withdrawal, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 text-sm border-t">
                    <div>{withdrawal.date}</div>
                    <div className="font-medium">{formatCurrency(withdrawal.amount)}</div>
                    <div>{withdrawal.method}</div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          withdrawal.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : withdrawal.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}