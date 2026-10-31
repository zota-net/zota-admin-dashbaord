'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TicketPlus, Ban, Trash2, Loader2 } from 'lucide-react';
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
import { vouchersService, packagesService, adminStatsService } from '@/lib/api';
import type { Client, Package, Voucher } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatDateTime, statusVariant } from '@/lib/format';

interface Row extends Voucher {
  clientName: string;
}

interface Enriched {
  clients: Client[];
  vouchers: Row[];
}

export default function VouchersPage() {
  const [clientFilter, setClientFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const data = useAsync<Enriched>(async () => {
    const overview = await adminStatsService.getPlatformOverview();
    const clients = overview.map((o) => o.client);
    const settled = await Promise.allSettled(
      clients.map((c) =>
        vouchersService.getByClient(c.id).then((vs) => vs.map((v) => ({ ...v, clientName: c.businessName })))
      )
    );
    return {
      clients,
      vouchers: settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    };
  }, []);

  const packages = useAsync<Package[]>(() => packagesService.getAll().catch(() => [] as Package[]), []);

  const rows = useMemo(() => {
    const all = data.data?.vouchers ?? [];
    return clientFilter === 'all' ? all : all.filter((v) => String(v.client_id) === clientFilter);
  }, [data.data, clientFilter]);

  const reload = () => data.refresh();

  const revoke = async (id: string) => {
    try {
      await vouchersService.updateStatus(id, 'revoked');
      toast.success('Voucher revoked');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke voucher');
    }
  };

  const remove = async (id: string) => {
    try {
      await vouchersService.delete(id);
      toast.success('Voucher deleted');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete voucher');
    }
  };

  const columns: Column<Row>[] = [
    { key: 'code', header: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs font-medium">{r.code}</span> },
    { key: 'clientName', header: 'Client', sortValue: (r) => r.clientName },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge> },
    { key: 'createdAt', header: 'Created', hideOnMobile: true, sortValue: (r) => r.createdAt, render: (r) => <span className="text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
    { key: 'expiresAt', header: 'Expires', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{formatDateTime(r.expiresAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-16 text-right',
      render: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {r.status !== 'revoked' && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => revoke(r.id)} title="Revoke">
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Vouchers" description="All voucher codes generated across the platform">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <TicketPlus className="h-4 w-4 mr-2" />
          Generate Vouchers
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={data.data ? rows : null}
        rowKey={(r) => `${r.id}`}
        isLoading={data.isLoading}
        error={data.error}
        onRetry={data.refresh}
        searchPlaceholder="Search codes..."
        searchFn={(r, q) => r.code.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)}
        emptyMessage="No vouchers found"
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

      <GenerateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clients={data.data?.clients ?? []}
        packages={packages.data ?? []}
        onDone={reload}
      />
    </>
  );
}

function GenerateDialog({
  open,
  onOpenChange,
  clients,
  packages,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clients: Client[];
  packages: Package[];
  onDone: () => void;
}) {
  const [form, setForm] = useState({ client_id: '', package_id: '', count: '10', length: '8', prefix: 'ZT' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) return;
    const reset = () => setForm({ client_id: '', package_id: '', count: '10', length: '8', prefix: 'ZT' });
    queueMicrotask(reset);
  }, [open]);

  const clientPkgs = packages.filter((p) => String(p.client_id) === form.client_id);

  const submit = async () => {
    if (!form.client_id || !form.package_id) {
      toast.error('Select a client and package');
      return;
    }
    setSaving(true);
    try {
      const created = await vouchersService.create({
        client_id: form.client_id,
        package_id: form.package_id,
        count: Number(form.count),
        length: Number(form.length),
        prefix: form.prefix,
        charset: 'alphanumeric',
      });
      toast.success(`Generated ${created.length ?? form.count} vouchers`);
      onOpenChange(false);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate vouchers');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Vouchers</DialogTitle>
          <DialogDescription>Create a batch of voucher codes for a client package</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v, package_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.businessName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Package</Label>
              <Select value={form.package_id} onValueChange={(v) => setForm({ ...form, package_id: v })} disabled={!form.client_id}>
                <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>
                  {clientPkgs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>)}
                  {clientPkgs.length === 0 && form.client_id && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No packages for this client</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Count</Label>
              <Input type="number" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Code Length</Label>
              <Input type="number" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Prefix</Label>
              <Input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
