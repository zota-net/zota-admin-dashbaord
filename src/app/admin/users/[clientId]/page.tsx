'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  Server,
  Wifi,
  Zap,
  Clock,
  HardDrive,
  Users,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Building,
  Mail,
  Phone,
  CreditCard,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { StatsCard } from '@/components/admin/cards/stat-card';
import { clientsService, reportsService, walletsService, purchasesService, vouchersService } from '@/lib/api';
import type { Client, ClientReport, SalesReport, VoucherSale, Voucher } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [report, setReport] = useState<ClientReport | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [recentVouchers, setRecentVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClientData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        setError(null);

        const [clientData, reportData, salesData, vouchersData] = await Promise.allSettled([
          clientsService.getById(clientId),
          clientsService.getReport(clientId),
          reportsService.getSalesReport(clientId),
          vouchersService.getByClient(clientId),
        ]);

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (reportData.status === 'fulfilled' && reportData.value) {
          setReport(reportData.value);
        }

        if (salesData.status === 'fulfilled' && salesData.value) {
          setSalesReport(salesData.value);
        }

        if (vouchersData.status === 'fulfilled' && vouchersData.value) {
          setRecentVouchers(vouchersData.value.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load client data:', err);
        setError('Failed to load client data');
        toast.error('Failed to load client data');
      } finally {
        setIsLoading(false);
      }
    };

    loadClientData();
  }, [clientId]);

  const recentSales = useMemo(() => {
    if (!salesReport?.sales) return [];
    return [...salesReport.sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [salesReport]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Suspended':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getVoucherStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'used':
        return 'bg-blue-500/10 text-blue-500';
      case 'expired':
        return 'bg-gray-500/10 text-gray-500';
      case 'revoked':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg font-medium text-red-500">{error || 'Client not found'}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/admin/users" className="hover:text-primary transition-colors">
              Users
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{client.businessName}</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{client.businessName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {client.adminEmail}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {client.contact}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/admin/users/${client.id}/payments`}>
                  View Payments
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/users/${client.id}/vouchers`}>
                  View Vouchers
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Total Revenue"
              value={salesReport?.summary.totalRevenue ?? report?.totalRevenue ?? 0}
              description="From all sales"
              icon={Server}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Voucher Sales"
              value={salesReport?.summary.totalSales ?? report?.totalVouchers ?? 0}
              suffix=""
              decimals={0}
              description="Total sold"
              icon={Activity}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Wallet Balance"
              value={walletBalance}
              prefix="UGX "
              decimals={0}
              description="Current balance"
              icon={Clock}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Active Vouchers"
              value={report?.activeVouchers ?? 0}
              suffix=""
              decimals={0}
              description="Currently active"
              icon={Zap}
              variant="success"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Charts and Info Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Sales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">No sales recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div
                      key={`${sale.id}-${sale.createdAt}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold truncate">{sale.voucherCode || sale.id}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {sale.phone} - {sale.provider}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-500">
                          {formatCurrency(sale.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(sale.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Admin Name</p>
                  <p className="font-medium">{client.adminFullName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{client.adminEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{client.contact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {format(parseISO(client.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Vouchers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Vouchers</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/users/${client.id}/vouchers`}>
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentVouchers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">No vouchers created yet</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVouchers.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell>
                          <code className="font-mono text-sm">{voucher.code}</code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getVoucherStatusColor(voucher.status)}
                          >
                            {voucher.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(parseISO(voucher.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {voucher.expiresAt
                            ? format(parseISO(voucher.expiresAt), 'MMM d, yyyy')
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Link
              href={`/admin/users/${client.id}/payments`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold">Payments</p>
                <p className="text-xs text-muted-foreground">View all transactions</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={`/admin/users/${client.id}/vouchers`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">Vouchers</p>
                <p className="text-xs text-muted-foreground">Manage vouchers</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={`/admin/users/${client.id}/devices`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Wifi className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-semibold">Devices</p>
                <p className="text-xs text-muted-foreground">Connected devices</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={`/admin/users/${client.id}/packages`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold">Packages</p>
                <p className="text-xs text-muted-foreground">View packages</p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}