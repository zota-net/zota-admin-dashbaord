'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, MoreHorizontal, PauseCircle, PlayCircle, Ban, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, DataTable, type Column } from '@/components/admin';
import { clientsService, adminStatsService, type ClientOverview } from '@/lib/api';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatNumber, formatDate, statusVariant } from '@/lib/format';

type StatusAction = { label: string; status: 'Active' | 'Suspended' | 'InActive'; icon: React.ComponentType<{ className?: string }> };

export default function ClientsPage() {
  const router = useRouter();
  const overview = useAsync<ClientOverview[]>(() => adminStatsService.getPlatformOverview(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const rows = overview.data ?? [];

  const changeStatus = async (id: string, name: string, action: StatusAction) => {
    setBusy(id);
    try {
      await clientsService.updateStatus(id, action.status);
      toast.success(`${name} set to ${action.status}`);
      overview.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusy(null);
    }
  };

  const actionsFor = (status: string): StatusAction[] => {
    if (status === 'Active')
      return [
        { label: 'Suspend', status: 'Suspended', icon: PauseCircle },
        { label: 'Ban (deactivate)', status: 'InActive', icon: Ban },
      ];
    return [{ label: 'Activate', status: 'Active', icon: PlayCircle }];
  };

  const columns: Column<ClientOverview>[] = [
    {
      key: 'businessName',
      header: 'Client',
      sortValue: (r) => r.client.businessName,
      render: (r) => (
        <div>
          <p className="font-medium">{r.client.businessName}</p>
          <p className="text-xs text-muted-foreground">{r.client.adminFullName}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email', hideOnMobile: true, sortValue: (r) => r.client.adminEmail, render: (r) => <span className="text-muted-foreground text-sm">{r.client.adminEmail}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.client.status,
      render: (r) => (
        <Badge variant={statusVariant(r.client.status)} className="text-[10px]">
          {r.client.status}
        </Badge>
      ),
    },
    {
      key: 'balance',
      header: 'Wallet Balance',
      sortValue: (r) => r.wallet?.balance ?? 0,
      render: (r) => <span className="tabular-nums">{formatMoney(r.wallet?.balance ?? 0)}</span>,
    },
    {
      key: 'devices',
      header: 'Devices',
      hideOnMobile: true,
      sortValue: (r) => r.report?.totalDevices ?? 0,
      render: (r) => <span className="tabular-nums">{formatNumber(r.report?.totalDevices ?? 0)}</span>,
    },
    {
      key: 'sales',
      header: 'Voucher Sales',
      hideOnMobile: true,
      sortValue: (r) => r.sales.length,
      render: (r) => (
        <span className="tabular-nums">
          {formatNumber(r.sales.length)} · {formatMoney(r.sales.reduce((a, v) => a + Number(v.amount ?? 0), 0))}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Joined', hideOnMobile: true, sortValue: (r) => r.client.createdAt, render: (r) => <span className="text-muted-foreground text-sm">{formatDate(r.client.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={busy === r.client.id}
              onClick={(e) => e.stopPropagation()}
            >
              {busy === r.client.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => router.push(`/admin/clients/${r.client.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {actionsFor(r.client.status).map((a) => (
              <DropdownMenuItem
                key={a.status}
                className={a.status !== 'Active' ? 'text-destructive' : ''}
                onClick={() => changeStatus(r.client.id, r.client.businessName, a)}
              >
                <a.icon className="mr-2 h-4 w-4" />
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Clients" description="All businesses on the platform — balances, devices and account control">
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        rows={overview.data ? rows : null}
        rowKey={(r) => r.client.id}
        isLoading={overview.isLoading}
        error={overview.error}
        onRetry={overview.refresh}
        searchFn={(r, q) =>
          r.client.businessName.toLowerCase().includes(q) ||
          r.client.adminEmail.toLowerCase().includes(q) ||
          r.client.adminFullName.toLowerCase().includes(q)
        }
        searchPlaceholder="Search clients..."
        emptyMessage="No clients on the platform yet"
        onRowClick={(r) => router.push(`/admin/clients/${r.client.id}`)}
      />

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => overview.refresh()} />
    </>
  );
}

function AddClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ businessName: '', adminFullName: '', adminEmail: '', adminPassword: '', contact: '' });

  const submit = async () => {
    if (!form.businessName || !form.adminFullName || !form.adminEmail || !form.adminPassword || !form.contact) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await clientsService.create(form);
      toast.success('Client created');
      setForm({ businessName: '', adminFullName: '', adminEmail: '', adminPassword: '', contact: '' });
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
          <DialogDescription>Create a new business account on the platform</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Business Name</Label>
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Sunrise Cyber Cafe" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Admin Name</Label>
              <Input value={form.adminFullName} onChange={(e) => setForm({ ...form, adminFullName: e.target.value })} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Admin Email</Label>
              <Input type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} placeholder="Initial password" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact (phone)</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="0770000000" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
