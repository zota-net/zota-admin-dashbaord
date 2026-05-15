'use client';

import { useEffect, useState } from 'react';
import { Search, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { clientsService, accountsService } from '@/lib/api';
import type { Client, AgentAccount } from '@/lib/api/types';
import { toast } from 'sonner';

type TaggedAgent = AgentAccount & { clientName: string };

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString();

export default function AgentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [agents, setAgents] = useState<TaggedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const clientList = await clientsService.getAll();
      setClients(clientList);
      const all = await Promise.allSettled(
        clientList.map(c =>
          accountsService.getAgentsByClient(c.id).then(accs =>
            (accs ?? []).map(a => ({ ...a, clientName: c.businessName }))
          )
        )
      ).then(rs => rs.flatMap(r => r.status === 'fulfilled' ? r.value : []));
      setAgents(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { toast.error('Failed to load agents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = agents.filter(a =>
    (clientFilter === 'all' || a.clientId === clientFilter) &&
    (!search ||
      a.agentFullname.toLowerCase().includes(search.toLowerCase()) ||
      a.agentEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBalance = filtered.reduce((s, a) => s + (a.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-1">All agents and their wallet accounts across clients</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Agents', value: agents.length.toLocaleString() },
          { label: 'Clients with Agents', value: new Set(agents.map(a => a.clientId)).size.toLocaleString() },
          { label: 'Combined Balance', value: fmtCurrency(agents.reduce((s, a) => s + (a.balance ?? 0), 0)) },
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
              <Input className="pl-9" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
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
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"><Users className="w-8 h-8" /><p>No agents found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead>
                    <TableHead>Client</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-semibold">{a.agentFullname}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.agentEmail}</TableCell>
                      <TableCell className="text-sm">{a.clientName}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">{fmtCurrency(a.balance ?? 0)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(a.createdAt)}</TableCell>
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
