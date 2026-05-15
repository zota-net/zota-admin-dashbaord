'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Search, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageTransition } from '@/components/common';
import { clientsService, accountsService } from '@/lib/api';
import type { Client, AgentAccount } from '@/lib/api/types';
import { toast } from 'sonner';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

export default function ClientAgentsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [agents, setAgents] = useState<AgentAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const [clientData, agentsData] = await Promise.allSettled([
          clientsService.getById(clientId),
          accountsService.getAgentsByClient(clientId),
        ]);
        if (clientData.status === 'fulfilled' && clientData.value) setClient(clientData.value);
        if (agentsData.status === 'fulfilled' && Array.isArray(agentsData.value)) {
          setAgents(agentsData.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch {
        toast.error('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  const filtered = agents.filter(a =>
    !search || a.agentFullname.toLowerCase().includes(search.toLowerCase()) || a.agentEmail.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = agents.reduce((s, a) => s + (a.balance ?? 0), 0);

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
          <span className="text-foreground">Agents</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Agents
          </h1>
          <p className="text-muted-foreground">All agents for {client?.businessName || 'this client'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Agents</p>
            <p className="text-3xl font-bold mt-2">{agents.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Combined Balance</p>
            <p className="text-3xl font-bold text-green-500 mt-2">{fmtCurrency(totalBalance)}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="text-xl font-bold mt-2 truncate">{client?.businessName || '—'}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <CardTitle>All Agents</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-[220px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Users className="h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No agents found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-semibold">{a.agentFullname}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.agentEmail}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{fmtCurrency(a.balance ?? 0)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
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
