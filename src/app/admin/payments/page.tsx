'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, RefreshCw, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { clientsService, reportsService } from '@/lib/api';
import type { Client, VoucherSale } from '@/lib/api/types';
import { toast } from 'sonner';

type TaggedSale = VoucherSale & { clientName: string };

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleString();

export default function PaymentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<TaggedSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const clientList = await clientsService.getAll();
      setClients(clientList);
      const allSales = await Promise.allSettled(
        clientList.map(c =>
          reportsService.getSalesReport(c.id).then(r => r.sales.map(s => ({ ...s, clientName: c.businessName })))
        )
      ).then(rs => rs.flatMap(r => r.status === 'fulfilled' ? r.value : []));
      setSales(allSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const providers = useMemo(() => [...new Set(sales.map(s => s.provider).filter(Boolean))], [sales]);

  const filtered = useMemo(() => sales.filter(s =>
    (clientFilter === 'all' || s.clientId === clientFilter) &&
    (providerFilter === 'all' || s.provider === providerFilter) &&
    (!search || (s.voucherCode ?? '').toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search))
  ), [sales, clientFilter, providerFilter, search]);

  const totals = useMemo(() => ({
    revenue: filtered.reduce((a, s) => a + s.amount, 0),
    fees: filtered.reduce((a, s) => a + s.fee, 0),
    net: filtered.reduce((a, s) => a + s.netAmount, 0),
  }), [filtered]);

  const handleExport = () => {
    const rows = [
      ['Date', 'Voucher Code', 'Phone', 'Provider', 'Amount', 'Fee', 'Net', 'Client'],
      ...filtered.map(s => [s.createdAt, s.voucherCode, s.phone, s.provider, s.amount, s.fee, s.netAmount, s.clientName]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">All voucher sales and transactions across clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Transactions', value: filtered.length.toLocaleString(), prefix: '' },
          { label: 'Gross Revenue', value: fmtCurrency(totals.revenue), prefix: '' },
          { label: 'Service Fees', value: fmtCurrency(totals.fees), prefix: '' },
          { label: 'Net Revenue', value: fmtCurrency(totals.net), prefix: '' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search code or phone…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="All providers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"><TrendingUp className="w-8 h-8" /><p>No transactions found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Voucher</TableHead><TableHead>Phone</TableHead>
                    <TableHead>Provider</TableHead><TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Fee</TableHead><TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={`${s.id}-${s.createdAt}`}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(s.createdAt)}</TableCell>
                      <TableCell className="font-mono text-xs">{s.voucherCode || '—'}</TableCell>
                      <TableCell className="text-sm">{s.phone}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{s.provider}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.clientName}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{fmtCurrency(s.amount)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{fmtCurrency(s.fee)}</TableCell>
                      <TableCell className="text-right font-semibold">{fmtCurrency(s.netAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
