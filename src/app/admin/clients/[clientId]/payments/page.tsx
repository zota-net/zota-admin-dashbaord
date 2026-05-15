'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Search, ChevronRight, CheckCircle, Clock, XCircle, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageTransition } from '@/components/common';
import { clientsService, reportsService } from '@/lib/api';
import type { Client, VoucherSale } from '@/lib/api/types';
import { toast } from 'sonner';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

export default function ClientPaymentsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sales, setSales] = useState<VoucherSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const [clientData, salesData] = await Promise.allSettled([
          clientsService.getById(clientId),
          reportsService.getSalesReport(clientId),
        ]);
        if (clientData.status === 'fulfilled' && clientData.value) setClient(clientData.value);
        if (salesData.status === 'fulfilled' && salesData.value) {
          setSales([...salesData.value.sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch {
        toast.error('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  const providers = useMemo(() => [...new Set(sales.map(s => s.provider))], [sales]);

  const filtered = useMemo(() => sales.filter(s =>
    (providerFilter === 'all' || s.provider === providerFilter) &&
    (!search || (s.voucherCode ?? s.id).toLowerCase().includes(search.toLowerCase()) || s.phone.toLowerCase().includes(search.toLowerCase()))
  ), [sales, providerFilter, search]);

  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + s.amount, 0), [sales]);
  const totalFees = useMemo(() => sales.reduce((sum, s) => sum + s.fee, 0), [sales]);

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
          <Link href="/admin/clients" className="hover:text-primary transition-colors">Clients</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/admin/clients/${clientId}`} className="hover:text-primary transition-colors">
            {client?.businessName || 'Client'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Payments</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Payments
          </h1>
          <p className="text-muted-foreground">All transactions for {client?.businessName || 'this client'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-green-500 mt-2">{fmtCurrency(totalRevenue)}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Service Fees</p>
            <p className="text-3xl font-bold mt-2">{fmtCurrency(totalFees)}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-3xl font-bold mt-2">{sales.length}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <CardTitle>Transactions</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search code or phone…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[200px]" />
                </div>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="All providers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <CreditCard className="h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.voucherCode || s.id}</TableCell>
                        <TableCell className="text-sm">{s.phone}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{s.provider}</Badge></TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{fmtCurrency(s.amount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{fmtCurrency(s.fee)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(s.createdAt), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
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
