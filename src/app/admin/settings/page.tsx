'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  ArrowUpDown,
  Loader2,
  Moon,
  Sun,
  Palette,
  HardDriveDownload,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader, ErrorState } from '@/components/admin';
import { adminsService, clientsService } from '@/lib/api';
import type { AdminUser, Client } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { useAdminStore } from '@/lib/store/admin-store';
import { useThemeStore, defaultThemes } from '@/lib/store/theme-store';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const isSuper = useAdminStore((s) => s.isSuperAdmin());
  const admins = useAsync<AdminUser[]>(() => adminsService.getAll(), []);
  const clients = useAsync<Client[]>(() => clientsService.getAll(), []);

  return (
    <>
      <PageHeader title="Settings" description="Administration, appearance and platform maintenance" />

      <AppearanceCard />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <CardTitle>Administrators</CardTitle>
              <CardDescription>Accounts with access to this control panel</CardDescription>
            </div>
            <AddAdminDialog onAdded={() => admins.refresh()} disabled={!isSuper} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {admins.error ? (
            <div className="p-4"><ErrorState message={admins.error} onRetry={admins.refresh} compact /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Verified</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading administrators…
                    </TableCell>
                  </TableRow>
                ) : (
                  (admins.data ?? []).map((a) => (
                    <AdminRow key={a.id} admin={a} canManage={isSuper} onChanged={() => admins.refresh()} />
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MaintenanceCard clients={clients.data ?? []} />
    </>
  );
}

function AdminRow({ admin, canManage, onChanged }: { admin: AdminUser; canManage: boolean; onChanged: () => void }) {
  const me = useAdminStore((s) => s.session?.admin);
  const isMe = String(me?.id) === String(admin.id);
  const [roleOpen, setRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const changeRole = async (role: 'Admin' | 'SuperAdmin') => {
    setBusy(true);
    try {
      await adminsService.updateRole(admin.id, role);
      toast.success(`${admin.fullname} is now ${role}`);
      setRoleOpen(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminsService.remove(admin.id);
      toast.success('Admin removed');
      setRemoveOpen(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove admin');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{admin.fullname} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}</p>
        <p className="text-xs text-muted-foreground md:hidden">{admin.email}</p>
      </TableCell>
      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{admin.email}</TableCell>
      <TableCell>
        <Badge variant={admin.role === 'SuperAdmin' ? 'default' : 'secondary'} className="text-[10px]">{admin.role}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {admin.emailVerified ? <Badge variant="outline" className="text-[10px]">Verified</Badge> : <Badge variant="outline" className="text-[10px] text-muted-foreground">Pending</Badge>}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!canManage || isMe} title="Change role" onClick={() => setRoleOpen(true)}>
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={!canManage || isMe} title="Remove" onClick={() => setRemoveOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
              <DialogDescription>{admin.fullname} — currently {admin.role}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={admin.role === 'Admin' ? 'secondary' : 'outline'} onClick={() => changeRole('Admin')} disabled={busy}>Admin</Button>
              <Button variant={admin.role === 'SuperAdmin' ? 'secondary' : 'outline'} onClick={() => changeRole('SuperAdmin')} disabled={busy}>SuperAdmin</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-5 w-5" /> Remove Admin
              </DialogTitle>
              <DialogDescription>
                Revoke platform access for {admin.fullname}? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={remove} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Remove Access
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

function AddAdminDialog({ onAdded, disabled }: { onAdded: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullname: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.fullname || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    setSaving(true);
    try {
      await adminsService.create({ ...form, role: 'Admin' });
      toast.success('Admin invited');
      setForm({ fullname: '', email: '', password: '', phone: '' });
      setOpen(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={disabled} title={disabled ? 'SuperAdmin required' : undefined}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add Admin
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
            <DialogDescription>Grant platform control-panel access to another account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone (optional)</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const { activeThemeId, setActiveTheme } = useThemeStore();
  const allThemes = [...defaultThemes, ...useThemeStore((s) => s.customThemes)];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Shared theming with the XETIHUB platform</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
        </div>
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                activeThemeId === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 bg-card'
              )}
            >
              <span className="flex -space-x-1.5">
                <span className="h-5 w-5 rounded-full border-2 border-background" style={{ background: t.primary }} />
                <span className="h-5 w-5 rounded-full border-2 border-background" style={{ background: t.accent }} />
              </span>
              <span className="text-sm font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MaintenanceCard({ clients }: { clients: Client[] }) {
  const [target, setTarget] = useState('');
  const [opts, setOpts] = useState({ clearVouchers: false, clearPackages: false, clearDevices: false, clearAdverts: false, clearBalance: false });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const client = clients.find((c) => String(c.id) === target);

  const runReset = async () => {
    if (!client) return;
    setBusy(true);
    try {
      await clientsService.reset(client.id, opts);
      toast.success(`Client "${client.businessName}" reset completed`);
      setOpen(false);
      setTarget('');
      setOpts({ clearVouchers: false, clearPackages: false, clearDevices: false, clearAdverts: false, clearBalance: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HardDriveDownload className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <CardTitle className="text-destructive">Maintenance — Client Data Reset</CardTitle>
            <CardDescription>Wipe a client&apos;s platform data for onboarding or recovery</CardDescription>
          </div>
          <Button variant="destructive" size="sm" disabled={!target} onClick={() => setOpen(true)}>
            Reset Client Data
          </Button>
        </div>
        <div className="pt-2 max-w-sm">
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.businessName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertOctagon className="h-5 w-5" /> Reset {client?.businessName}?
            </DialogTitle>
            <DialogDescription>Irreversible. Choose the data scopes to clear:</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-2">
            {(Object.keys(opts) as (keyof typeof opts)[]).map((k) => (
              <button
                key={k}
                onClick={() => setOpts((prev) => ({ ...prev, [k]: !prev[k] }))}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm text-left transition-colors',
                  opts[k] ? 'border-destructive bg-destructive/10 text-destructive font-medium' : 'border-border hover:bg-accent/40'
                )}
              >
                {k.replace('clear', '')}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={runReset}
              disabled={busy || !Object.values(opts).some(Boolean)}
            >
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
