'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTransition } from '@/components/common';
import { StatsCard } from '@/components/admin/cards/stat-card';
import { clientsService, purchasesService, reportsService } from '@/lib/api';
import type { Client, VoucherSale, SalesReport } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

import { cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

interface Payment {
  id: string;
  transactionId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  provider: string;
  createdAt: Date;
}

const statusConfig = {
  completed: {
    label: 'Completed',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: Clock,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: XCircle,
  },
};

export default function ClientPaymentsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        const [clientData, salesData] = await Promise.allSettled([
          clientsService.getById(clientId),
          purchasesService.getVoucherSales(clientId),
        ]);

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (salesData.status === 'fulfilled' && Array.isArray(salesData.value)) {
          const mapped: Payment[] = salesData.value.map((sale) => ({
            id: String(sale.id),
            transactionId: sale.voucherCode || String(sale.id),
            customerName: sale.phone || 'Unknown',
            customerPhone: sale.phone || '',
            amount: sale.amount,
            status: 'completed',
            provider: sale.provider,
            createdAt: new Date(sale.createdAt),
          }));
          setPayments(mapped);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
        setError('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/admin/clients" className="hover:text-primary transition-colors">
              Users
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/admin/clients/${clientId}`} className="hover:text-primary transition-colors">
              {client?.businessName || 'Client'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Payments</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              Payments
            </h1>
            <p className="text-muted-foreground">
              All transactions for {client?.businessName || 'this client'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-3xl font-bold mt-2">
                {payments.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {payments.filter((p) => p.status === 'completed').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No payments found</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const StatusIcon = statusConfig[payment.status]?.icon || Clock;
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <code className="font-mono text-sm">{payment.transactionId}</code>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{payment.customerName}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {payment.customerPhone}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-500">
                              {formatCurrency(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell>{payment.provider}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusConfig[payment.status]?.color}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[payment.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {format(parseISO(payment.createdAt.toISOString()), 'MMM d, h:mm a')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}