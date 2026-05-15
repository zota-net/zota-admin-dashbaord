'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, Package, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientsService, packagesService } from '@/lib/api';
import type { Client, Package as Pkg } from '@/lib/api/types';
import { toast } from 'sonner';

type TaggedPkg = Pkg & { clientName: string };

const PERIOD_OPTIONS = [
  { label: '1 Hour', value: 3600 },
  { label: '3 Hours', value: 10800 },
  { label: '6 Hours', value: 21600 },
  { label: '12 Hours', value: 43200 },
  { label: '1 Day', value: 86400 },
  { label: '3 Days', value: 259200 },
  { label: '7 Days', value: 604800 },
  { label: '14 Days', value: 1209600 },
  { label: '30 Days', value: 2592000 },
];

const fmtPeriod = (s: number) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  if (d >= 1) return `${d} day${d > 1 ? 's' : ''}`;
  if (h >= 1) return `${h} hour${h > 1 ? 's' : ''}`;
  return `${Math.floor(s / 60)} min`;
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString();

const emptyForm = { client_id: '', title: '', period: 86400, price: 0, agentComissionPercentage: 5 };

export default function PackagesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<TaggedPkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const clientList = await clientsService.getAll();
      setClients(clientList);
      const clientMap = Object.fromEntries(clientList.map(c => [c.id, c.businessName]));
      const pkgs = await packagesService.getAll();
      setPackages((pkgs ?? []).map(p => ({ ...p, clientName: clientMap[p.client_id ?? ''] ?? 'Unknown' })));
    } catch { toast.error('Failed to load packages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Pkg) => {
    setEditing(p);
    setForm({ client_id: p.client_id ?? '', title: p.title, period: p.period, price: p.price, agentComissionPercentage: p.agentComissionPercentage });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await packagesService.update(editing.id, { title: form.title, period: form.period, price: form.price, agentComissionPercentage: form.agentComissionPercentage });
        toast.success('Package updated');
      } else {
        await packagesService.create({ clientId: form.client_id, title: form.title, period: form.period, price: form.price, agentComissionPercentage: form.agentComissionPercentage });
        toast.success('Package created');
      }
      setDialogOpen(false);
      load();
    } catch { toast.error('Failed to save package'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    try { await packagesService.delete(id); toast.success('Package deleted'); load(); }
    catch { toast.error('Failed to delete package'); }
  };

  const filtered = packages.filter(p =>
    (clientFilter === 'all' || p.client_id === clientFilter) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
          <p className="text-muted-foreground mt-1">Internet access packages across all clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Package</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Packages', value: packages.length },
          { label: 'Active Clients', value: new Set(packages.map(p => p.client_id)).size },
          { label: 'Avg Price (UGX)', value: packages.length ? Math.round(packages.reduce((s, p) => s + p.price, 0) / packages.length).toLocaleString() : '0' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search package…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"><Package className="w-8 h-8" /><p>No packages found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead><TableHead>Period</TableHead><TableHead>Price (UGX)</TableHead>
                    <TableHead>Commission</TableHead><TableHead>Client</TableHead><TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold">{p.title}</TableCell>
                      <TableCell className="text-sm">{fmtPeriod(p.period)}</TableCell>
                      <TableCell className="font-semibold text-green-600">{p.price.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{p.agentComissionPercentage}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.clientName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Package' : 'New Package'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {!editing && (
              <div>
                <Label>Client</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 1-Hour Basic" required />
            </div>
            <div>
              <Label>Period</Label>
              <Select value={String(form.period)} onValueChange={v => setForm(f => ({ ...f, period: +v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (UGX)</Label>
                <Input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} required />
              </div>
              <div>
                <Label>Agent Commission (%)</Label>
                <Input type="number" min={0} max={100} value={form.agentComissionPercentage} onChange={e => setForm(f => ({ ...f, agentComissionPercentage: +e.target.value }))} required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving || (!editing && !form.client_id)}>
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
