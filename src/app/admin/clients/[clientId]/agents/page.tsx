'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Star,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTransition } from '@/components/common';
import { clientsService, accountsService as agentsService } from '@/lib/api';
import type { Client } from '@/lib/api/types';

interface Agent {
  id: string;
  name: string;
  email: string;
  clients: number;
  revenue: number;
  status: string;
  joinedAt?: string;
}
import { format, parseISO } from 'date-fns';
import { MoreHorizontal, Mail, Phone, Ban, CheckCircle2 } from 'lucide-react';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

const statusConfig: Record<string, { label: string; color: string }> = {
  Approved: {
    label: 'Approved',
    color: 'bg-green-500/10 text-green-500',
  },
  Pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
  Suspended: {
    label: 'Suspended',
    color: 'bg-red-500/10 text-red-500',
  },
};

export default function ClientAgentsPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        const [clientData, agentsData] = await Promise.allSettled([
          clientsService.getById(clientId),
          agentsService.getAgentsByClient(clientId),
        ]);

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (agentsData.status === 'fulfilled' && agentsData.value) {
          setAgents(agentsData.value.map((a: any) => ({
            id: a.id,
            name: a.agentFullname || 'Unknown',
            email: a.agentEmail || 'N/A',
            clients: 0,
            revenue: a.balance || 0,
            status: 'Approved',
            joinedAt: a.createdAt,
          })));
        }
      } catch (err) {
        console.error('Failed to load agents:', err);
        setError('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const handleApproveAgent = async (agentId: string) => {
    try {
      // await agentsService.updateStatus(agentId, 'Approved'); // Not available in current mock
      setAgents(
        agents.map((a) =>
          a.id === agentId ? { ...a, status: 'Approved' as const } : a
        )
      );
      toast.success('Agent approved');
    } catch (err) {
      console.error('Failed to approve agent:', err);
      toast.error('Failed to approve agent');
    }
  };

  const handleSuspendAgent = async (agentId: string) => {
    try {
      // await agentsService.updateStatus(agentId, 'Suspended'); // Not available in current mock
      setAgents(
        agents.map((a) =>
          a.id === agentId ? { ...a, status: 'Suspended' as const } : a
        )
      );
      toast.success('Agent suspended');
    } catch (err) {
      console.error('Failed to suspend agent:', err);
      toast.error('Failed to suspend agent');
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const agentCounts = agents.reduce(
    (acc, a) => {
      if (a.status === 'Approved') acc.Approved++;
      else if (a.status === 'Pending') acc.Pending++;
      else if (a.status === 'Suspended') acc.Suspended++;
      return acc;
    },
    { Approved: 0, Pending: 0, Suspended: 0 }
  );

  const totalRevenue = agents.reduce((sum, a) => sum + (a.revenue || 0), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Link href="/admin/clients" className="hover:text-primary transition-colors">
            Users
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/admin/clients/${clientId}`} className="hover:text-primary transition-colors">
            {client?.businessName || 'Client'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Agents</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Agents
          </h1>
          <p className="text-muted-foreground">
            All agents for {client?.businessName || 'this client'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
              <p className="text-3xl font-bold mt-2">{agents.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold text-green-500 mt-2">{agentCounts.Approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{agentCounts.Pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Agents</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No agents found</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Clients</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Joined</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {agent.email}
                          </p>
                        </TableCell>
                        <TableCell>{agent.clients || 0}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-500">
                            {formatCurrency(agent.revenue || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[agent.status]?.color}
                          >
                            {statusConfig[agent.status]?.label || agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {agent.joinedAt
                            ? format(parseISO(agent.joinedAt), 'MMM d, yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {agent.status === 'Pending' && (
                                <DropdownMenuItem
                                  onClick={() => handleApproveAgent(agent.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {agent.status === 'Approved' && (
                                <DropdownMenuItem
                                  onClick={() => handleSuspendAgent(agent.id)}
                                >
                                  <Ban className="h-4 w-4 mr-2 text-red-500" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </PageTransition>
  );
}