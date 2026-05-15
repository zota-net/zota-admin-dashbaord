'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Tag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientsService, vouchersService, packagesService } from '@/lib/api';
import type { Client, Voucher, Package } from '@/lib/api/types';
import { toast } from 'sonner';

type TaggedVoucher = Voucher & { clientName: string };

const statusVariant = (s: string): 'default' | 'secondary' | 'outline' | 'destructive' =>
  s === 'active' ? 'default' : s === 'used' ? 'secondary' : s === 'revoked' ? 'destructive' : 'outline';

const StatusIcon = ({ status }: { status: string }) =>
  status === 'active' ? <CheckCircle className="w-3 h-3" /> :
  status === 'used' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;

const fmtDate = (d: string) => new Date(d).toLocaleDateString();

export default function VouchersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [vouchers, setVouchers] = useState<TaggedVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    client_id: '', package_id: '', count: 10, length: 8,
    prefix: '', charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  });

  const load = async () => {
    setLoading(true);
    try {
      const clientList = await clientsService.getAll();
      setClients(clientList);
      const [allVouchers, allPkgs] = await Promise.all([
        Promise.allSettled(
          clientList.map(c =>
            vouchersService.getByClient(c.id).then(vs => vs.map(v => ({ ...v, clientName: c.businessName })))
          )
        ).then(rs => rs.flatMap(r => r.status === 'fulfilled' ? r.value : [])),
        packagesService.getAll(),
      ]);
      setVouchers(allVouchers);
      setPackages(allPkgs ?? []);
    } catch { toast.error('Failed to load vouchers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await vouchersService.create({ count: form.count, length: form.length, prefix: form.prefix, package_id: form.package_id, client_id: form.client_id, charset: form.charset });
      toast.success(`${form.count} vouchers generated`);
      setCreateOpen(false);
      setForm({ client_id: '', package_id: '', count: 10, length: 8, prefix: '', charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' });
      load();
    } catch { toast.error('Failed to generate vouchers'); }
    finally { setCreating(false); }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this voucher?')) return;
    try { await vouchersService.updateStatus(id, 'revoked'); toast.success('Revoked'); load(); }
    catch { toast.error('Failed to revoke'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voucher permanently?')) return;
    try { await vouchersService.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const clientPackages = packages.filter(p => !form.client_id || p.client_id === form.client_id);
  const filtered = vouchers.filter(v =>
    (clientFilter === 'all' || v.client_id === clientFilter) &&
    (statusFilter === 'all' || v.status === statusFilter) &&
    (!search || v.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground mt-1">Internet access vouchers across all clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Generate Vouchers</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Generate Vouchers</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Client</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v, package_id: '' }))}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Package</Label>
                  <Select value={form.package_id} onValueChange={v => setForm(f => ({ ...f, package_id: v }))} disabled={!form.client_id}>
                    <SelectTrigger><SelectValue placeholder={form.client_id ? 'Select package' : 'Select client first'} /></SelectTrigger>
                    <SelectContent>
                      {clientPackages.map(p => <SelectItem key={p.id} value={p.id}>{p.title} — UGX {p.price.toLocaleString()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Count (1–1000)</Label><Input type="number" min={1} max={1000} value={form.count} onChange={e => setForm(f => ({ ...f, count: +e.target.value }))} /></div>
                  <div><Label>Code Length</Label><Input type="number" min={4} max={20} value={form.length} onChange={e => setForm(f => ({ ...f, length: +e.target.value }))} /></div>
                </div>
                <div>
                  <Label>Prefix <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value }))} placeholder="e.g. CAFE-" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating || !form.client_id || !form.package_id}>
                    {creating ? 'Generating…' : `Generate ${form.count} Vouchers`}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: vouchers.length, color: '' },
          { label: 'Active', value: vouchers.filter(v => v.status === 'active').length, color: 'text-green-600' },
          { label: 'Used', value: vouchers.filter(v => v.status === 'used').length, color: 'text-blue-600' },
          { label: 'Expired', value: vouchers.filter(v => v.status === 'expired').length, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search code…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"><Tag className="w-8 h-8" /><p>No vouchers found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead><TableHead>Status</TableHead><TableHead>Client</TableHead>
                    <TableHead>Expires</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono font-semibold text-sm">{v.code}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(v.status)} className="gap-1 text-xs">
                          <StatusIcon status={v.status} />{v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{v.clientName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.expiresAt ? fmtDate(v.expiresAt) : '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(v.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {v.status === 'active' && (
                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 text-xs h-7 px-2" onClick={() => handleRevoke(v.id)}>Revoke</Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs h-7 px-2" onClick={() => handleDelete(v.id)}>Delete</Button>
                        </div>
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
  );
}
