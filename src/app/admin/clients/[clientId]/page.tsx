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
  Power,
  PowerOff,
  AlertCircle,
  RotateCcw,
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
import { clientsService, reportsService, vouchersService, routersService, walletsService } from '@/lib/api';
import { ClientResetDialog } from '@/components/admin/dialogs/client-reset-dialog';
import type { Client, ClientReport, SalesReport, VoucherSale, Voucher, Router } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [report, setReport] = useState<ClientReport | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [recentVouchers, setRecentVouchers] = useState<Voucher[]>([]);
  const [routers, setRouters] = useState<Router[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    const loadClientData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        setError(null);

        const [clientData, reportData, salesData, vouchersData, routersData, walletData] = await Promise.allSettled([
          clientsService.getById(clientId),
          clientsService.getReport(clientId),
          reportsService.getSalesReport(clientId),
          vouchersService.getByClient(clientId),
          routersService.getByClient(clientId),
          walletsService.getByClient(clientId),
        ]);

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (reportData.status === 'fulfilled' && reportData.value) {
          const report = reportData.value as ClientReport;
          if ('status' in report) {
            setReport((reportData.value as { data?: ClientReport })?.data ?? null);
          } else {
            setReport(reportData.value as ClientReport);
          }
        }

        if (salesData.status === 'fulfilled' && salesData.value) {
          setSalesReport(salesData.value);
        }

        if (vouchersData.status === 'fulfilled' && vouchersData.value) {
          setRecentVouchers(vouchersData.value.slice(0, 5));
        }

        if (routersData.status === 'fulfilled' && Array.isArray(routersData.value)) {
          setRouters(routersData.value);
        }

        if (walletData.status === 'fulfilled' && walletData.value) {
          setWalletBalance(walletData.value.balance ?? 0);
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

  const handleStatusChange = async (newStatus: string) => {
    try {
      await clientsService.updateStatus(clientId, newStatus);
      setClient(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Client status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

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
      case 'InActive':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
        <p className="text-lg font-medium text-destructive">{error || 'Client not found'}</p>
        <Link href="/admin/clients">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
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
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Link href="/admin/clients" className="hover:text-primary transition-colors">
              Clients
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{client.businessName}</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
            
            {/* Action Levers */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-md border flex-wrap">
              {client.status !== 'Active' && (
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700" onClick={() => handleStatusChange('Active')}>
                  <Power className="w-4 h-4 mr-1" /> Activate
                </Button>
              )}
              {client.status !== 'Suspended' && (
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleStatusChange('Suspended')}>
                  <AlertCircle className="w-4 h-4 mr-1" /> Suspend
                </Button>
              )}
              {client.status !== 'InActive' && (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => handleStatusChange('InActive')}>
                  <PowerOff className="w-4 h-4 mr-1" /> Deactivate
                </Button>
              )}
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" onClick={() => setResetDialogOpen(true)}>
                <RotateCcw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions (Moved below header for better emphasis) */}
        <StaggerContainer className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <StaggerItem>
            <Link
              href={`/admin/clients/${client.id}/payments`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-primary/5 hover:border-primary/50 transition-colors bg-card"
            >
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-sm">Revenue Links</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={`/admin/clients/${client.id}/vouchers`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-primary/5 hover:border-primary/50 transition-colors bg-card"
            >
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold text-sm">Vouchers</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={`/admin/clients/${client.id}/packages`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-primary/5 hover:border-primary/50 transition-colors bg-card"
            >
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-sm">Packages</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href={`/admin/clients/${client.id}/agents`}
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-primary/5 hover:border-primary/50 transition-colors bg-card"
            >
              <Users className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="font-semibold text-sm">Agents</p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerContainer>

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
              title="Connected Routers"
              value={routers.length}
              suffix=""
              decimals={0}
              description="Active devices"
              icon={Wifi}
              variant="default"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Tables Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Linked Routers */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex flex-row items-center gap-2"><HardDrive className="h-5 w-5 text-purple-500"/> Connected Routers</CardTitle>
                <div className="text-sm font-medium text-muted-foreground">{routers.length} Routers</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {routers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">No routers attached yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hostname</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routers.map((rt) => (
                        <TableRow key={rt.id}>
                          <TableCell className="font-semibold">{rt.name}</TableCell>
                          <TableCell className="font-mono text-sm">{rt.ipAddress}</TableCell>
                          <TableCell>
                            {rt.isConnected ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none"><Wifi className="w-3 h-3 mr-1"/> Online</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-none"><AlertCircle className="w-3 h-3 mr-1"/> Offline</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Sales Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentSales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">No sales recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Transaction</TableHead>
                         <TableHead>Customer</TableHead>
                         <TableHead className="text-right">Amount</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                        {recentSales.map((sale) => (
                          <TableRow key={`${sale.id}-${sale.createdAt}`}>
                             <TableCell className="font-mono text-xs">{sale.voucherCode || sale.id}</TableCell>
                             <TableCell className="text-xs text-muted-foreground">{sale.phone} - {sale.provider}</TableCell>
                             <TableCell className="text-right font-bold text-green-500">{formatCurrency(sale.amount)}</TableCell>
                          </TableRow>
                        ))}
                     </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ClientResetDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        clientId={clientId}
        clientName={client.businessName}
        walletBalance={walletBalance}
        onResetComplete={() => {
          setWalletBalance(0);
        }}
      />
    </PageTransition>
  );
}