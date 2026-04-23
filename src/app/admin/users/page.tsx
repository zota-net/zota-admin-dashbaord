'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Download,
  Filter,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { clientsService, reportsService } from '@/lib/api';
import type { Client, ClientReport } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

// Simple toast replacement
const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

const statusConfig = {
  Active: {
    label: 'Active',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle,
  },
  Pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: Clock,
  },
  InActive: {
    label: 'InActive',
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    icon: AlertCircle,
  },
  Suspended: {
    label: 'Suspended',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: XCircle,
  },
};

export default function UsersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await clientsService.getAll();
        setClients(data);
      } catch (err) {
        console.error('Failed to load clients:', err);
        setError('Failed to load clients');
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleViewDetails = async (client: Client) => {
    setSelectedClient(client);
    setDetailsDialogOpen(true);

    try {
      const reportRaw = await clientsService.getReport(client.id);
      const report = (reportRaw && 'status' in reportRaw ? (reportRaw as { data?: ClientReport })?.data : reportRaw as ClientReport) ?? null;
      setClientReport(report);
    } catch (err) {
      console.error('Failed to load client report:', err);
      setClientReport(null);
    }
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      await clientsService.updateStatus(clientId, newStatus);
      setClients(clients.map((c) => (c.id === clientId ? { ...c, status: newStatus as Client['status'] } : c)));
      toast.success(`Client status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update client status:', err);
      toast.error('Failed to update client status');
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.adminFullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Users Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all clients on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name, email, or admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <p>{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No clients found</p>
                <p className="text-sm">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'Clients will appear here once they register'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => {
                      const StatusIcon = statusConfig[client.status as keyof typeof statusConfig]?.icon || AlertCircle;
                      return (
                        <TableRow key={client.id}>
                          <TableCell>
                            <Link
                              href={`/admin/users/${client.id}`}
                              className="flex items-center gap-3 hover:text-primary transition-colors"
                            >
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{client.businessName}</p>
                                <p className="text-xs text-muted-foreground">ID: {client.id}</p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{client.adminFullName}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.adminEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {client.contact}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusConfig[client.status as keyof typeof statusConfig]?.color}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[client.status as keyof typeof statusConfig]?.label || client.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {format(parseISO(client.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                                  <Search className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${client.id}`}>
                                    <ChevronRight className="h-4 w-4 mr-2" />
                                    Open Dashboard
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {client.status !== 'Active' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'Active')}>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                {client.status !== 'Suspended' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'Suspended')}>
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
              <DialogDescription>
                {selectedClient?.businessName}
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Admin Name</p>
                    <p className="font-medium">{selectedClient.adminFullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={statusConfig[selectedClient.status as keyof typeof statusConfig]?.color}
                    >
                      {selectedClient.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedClient.adminEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="font-medium">{selectedClient.contact}</p>
                  </div>
                </div>
                {clientReport && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                      <p className="font-medium text-green-500">
                        {formatCurrency(clientReport.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Vouchers</p>
                      <p className="font-medium">{clientReport.totalVouchers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Vouchers</p>
                      <p className="font-medium">{clientReport.activeVouchers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Devices</p>
                      <p className="font-medium">{clientReport.totalDevices}</p>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <Link href={`/admin/users/${selectedClient.id}`}>
                    <Button className="w-full">
                      <ChevronRight className="h-4 w-4 mr-2" />
                      View Full Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}