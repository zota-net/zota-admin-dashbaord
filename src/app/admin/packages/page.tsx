'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PackagePlus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable, type Column } from '@/components/admin';
import { packagesService, adminStatsService } from '@/lib/api';
import type { Client, Package } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatMoney } from '@/lib/format';

interface Row extends Package {
  clientName: string;
}

interface Enriched {
  clients: Client[];
  packages: Row[];
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hrs`;
  return `${Math.round(seconds / 86400)} days`;
}

export default function PackagesPage() {
  const [clientFilter, setClientFilter] = useState('all');
  const [editing, setEditing] = useState<Row | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const data = useAsync<Enriched>(async () => {
    const overview = await adminStatsService.getPlatformOverview();
    const pkgs = await packagesService.getAll();
    const nameById = new Map(overview.map((o) => [String(o.client.id), o.client.businessName]));
    return {
      clients: overview.map((o) => o.client),
      packages: pkgs.map((p) => ({ ...p, clientName: nameById.get(String(p.client_id)) ?? `Client #${p.client_id ?? '—'}` })),
    };
  }, []);

  const rows = useMemo(() => {
    const all = data.data?.packages ?? [];
    return clientFilter === 'all' ? all : all.filter((p) => String(p.client_id) === clientFilter);
  }, [data.data, clientFilter]);

  const remove = async (id: string) => {
    try {
      await packagesService.delete(id);
      toast.success('Package deleted');
      data.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete package');
    }
  };

  const columns: Column<Row>[] = [
    { key: 'title', header: 'Package', sortValue: (r) => r.title, render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'clientName', header: 'Client', sortValue: (r) => r.clientName },
    {
      key: 'price',
      header: 'Price',
      sortValue: (r) => r.price,
      render: (r) => <span className="tabular-nums font-medium">{formatMoney(r.price)}</span>,
    },
    { key: 'period', header: 'Validity', sortValue: (r) => r.period, render: (r) => <Badge variant="outline" className="text-[10px] font-normal">{formatDuration(r.period)}</Badge> },
    { key: 'agentComissionPercentage', header: 'Commission', hideOnMobile: true, sortValue: (r) => r.agentComissionPercentage, render: (r) => <span>{r.agentComissionPercentage}%</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-16 text-right',
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(r)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Packages" description="Internet packages across all clients">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PackagePlus className="h-4 w-4 mr-2" />
          New Package
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={data.data ? rows : null}
        rowKey={(r) => String(r.id)}
        isLoading={data.isLoading}
        error={data.error}
        onRetry={data.refresh}
        searchPlaceholder="Search packages..."
        searchFn={(r, q) => r.title.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)}
        emptyMessage="No packages on the platform"
        toolbar={
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {(data.data?.clients ?? []).map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.businessName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <PackageFormDialog
        open={createOpen || !!editing}
        onOpenChange={(v) => {
          if (!v) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
        clients={data.data?.clients ?? []}
        initial={editing}
        onSaved={() => data.refresh()}
      />
    </>
  );
}

function PackageFormDialog({
  open,
  onOpenChange,
  clients,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clients: Client[];
  initial: Row | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ client_id: '', title: '', price: '', hours: '', commission: '10' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sync = () => { if (!initial) { setForm({ client_id: '', title: '', price: '', hours: '', commission: '10' }); return; }
      setForm({
        client_id: String(initial.client_id ?? ''),
        title: initial.title,
        price: String(initial.price),
        hours: String((initial.period / 3600).toFixed(2)),
        commission: String(initial.agentComissionPercentage),
      });
    };
    queueMicrotask(sync);
  }, [initial, open]);

  const submit = async () => {
    if (!form.client_id || !form.title || !form.price || !form.hours) {
      toast.error('Fill in all required fields');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      price: Number(form.price),
      period: Math.round(Number(form.hours) * 3600),
      agentComissionPercentage: Number(form.commission),
    };
    try {
      if (initial) {
        await packagesService.update(initial.id, payload);
        toast.success('Package updated');
      } else {
        await packagesService.create({ clientId: form.client_id, ...payload });
        toast.success('Package created');
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Package' : 'New Package'}</DialogTitle>
          <DialogDescription>{initial ? `Updating "${initial.title}"` : 'Create a package for a client'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })} disabled={!!initial}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.businessName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 24 Hours" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Price (UGX)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Validity (hrs)</Label>
              <Input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Commission %</Label>
              <Input type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {initial ? 'Save Changes' : 'Create Package'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
