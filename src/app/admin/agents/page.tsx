'use client';

import { useMemo, useState } from 'react';
import { UserCheck, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { toast } from 'sonner';
import { PageHeader, DataTable, type Column } from '@/components/admin';
import { clientsService, accountsService } from '@/lib/api';
import type { AgentAccount } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatDate } from '@/lib/format';

interface Row extends AgentAccount {
  clientName: string;
}

export default function AgentsPage() {
  const [clientFilter, setClientFilter] = useState('all');
  const [adjusting, setAdjusting] = useState<Row | null>(null);

  const data = useAsync<Row[]>(async () => {
    const list = await clientsService.getAll();
    const settled = await Promise.allSettled(
      list.map((c) =>
        accountsService.getAgentsByClient(c.id).then((accs) =>
          accs.map((a) => ({ ...a, clientName: c.businessName }))
        )
      )
    );
    return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  }, []);

  const rows = useMemo(() => {
    const all = data.data ?? [];
    return clientFilter === 'all' ? all : all.filter((r) => String(r.clientId) === clientFilter);
  }, [data.data, clientFilter]);

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    (data.data ?? []).forEach((r) => map.set(String(r.clientId), r.clientName));
    return map;
  }, [data.data]);

  const columns: Column<Row>[] = [
    {
      key: 'agentFullname',
      header: 'Agent',
      sortValue: (r) => r.agentFullname,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{r.agentFullname}</p>
            <p className="text-xs text-muted-foreground">{r.agentEmail}</p>
          </div>
        </div>
      ),
    },
    { key: 'clientName', header: 'Client', sortValue: (r) => r.clientName },
    {
      key: 'balance',
      header: 'Float Balance',
      sortValue: (r) => Number(r.balance),
      render: (r) => <span className="tabular-nums font-medium">{formatMoney(Number(r.balance))}</span>,
    },
    { key: 'createdAt', header: 'Since', hideOnMobile: true, sortValue: (r) => r.createdAt, render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-20 text-right',
      render: (r) => (
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setAdjusting(r); }}>
          <Coins className="h-3.5 w-3.5 mr-1.5" />
          Adjust
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Agents" description="Reseller accounts and float balances across all clients" />

      <DataTable
        columns={columns}
        rows={data.data ? rows : null}
        rowKey={(r) => String(r.id)}
        isLoading={data.isLoading}
        error={data.error}
        onRetry={data.refresh}
        searchPlaceholder="Search agents..."
        searchFn={(r, q) => r.agentFullname.toLowerCase().includes(q) || r.agentEmail.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)}
        emptyMessage="No agent accounts found"
        toolbar={
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {Array.from(clients.entries()).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <AdjustDialog account={adjusting} onClose={() => setAdjusting(null)} onDone={() => data.refresh()} />
    </>
  );
}

function AdjustDialog({ account, onClose, onDone }: { account: Row | null; onClose: () => void; onDone: () => void }) {
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!account) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await accountsService.updateBalance(account.id, amt, operation);
      toast.success(`${operation === 'add' ? 'Credited' : 'Debited'} ${formatMoney(amt)} ${operation === 'add' ? 'to' : 'from'} ${account.agentFullname}`);
      setAmount('');
      onClose();
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update balance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!account} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Agent Float</DialogTitle>
          <DialogDescription>
            {account?.agentFullname} · {account?.clientName} · current balance {formatMoney(Number(account?.balance ?? 0))}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Operation</Label>
            <div className="flex gap-2">
              <Button type="button" variant={operation === 'add' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setOperation('add')}>
                Credit
              </Button>
              <Button type="button" variant={operation === 'subtract' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setOperation('subtract')}>
                Debit
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Amount (UGX)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
