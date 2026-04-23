'use client';

import React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  Search,
  ChevronRight,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  RotateCcw,
  MoreHorizontal,
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
import { clientsService, vouchersService } from '@/lib/api';
import type { Client, Voucher } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: {
    label: 'Active',
    color: 'bg-green-500/10 text-green-500',
    icon: CheckCircle,
  },
  used: {
    label: 'Used',
    color: 'bg-blue-500/10 text-blue-500',
    icon: Clock,
  },
  expired: {
    label: 'Expired',
    color: 'bg-yellow-500/10 text-yellow-500',
    icon: Ban,
  },
  revoked: {
    label: 'Revoked',
    color: 'bg-red-500/10 text-red-500',
    icon: XCircle,
  },
};

export default function ClientVouchersPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        const [clientData, vouchersData] = await Promise.allSettled([
          clientsService.getById(clientId),
          vouchersService.getByClient(clientId),
        ]);

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (vouchersData.status === 'fulfilled' && vouchersData.value) {
          setVouchers(vouchersData.value);
        }
      } catch (err) {
        console.error('Failed to load vouchers:', err);
        setError('Failed to load vouchers');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const handleStatusChange = async (voucherId: string, newStatus: string) => {
    try {
      await vouchersService.updateStatus(voucherId, newStatus);
      setVouchers(
        vouchers.map((v) =>
          v.id === voucherId ? { ...v, status: newStatus as Voucher['status'] } : v
        )
      );
      toast.success(`Voucher status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update voucher:', err);
      toast.error('Failed to update voucher status');
    }
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchesSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchQuery, statusFilter]);

  const vouchersByStatus = useMemo(() => {
    const counts = { active: 0, used: 0, expired: 0, revoked: 0 };
    vouchers.forEach((v) => {
      if (v.status in counts) counts[v.status as keyof typeof counts]++;
    });
    return counts;
  }, [vouchers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/admin/users" className="hover:text-primary transition-colors">
              Users
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/admin/users/${clientId}`} className="hover:text-primary transition-colors">
              {client?.businessName || 'Client'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Vouchers</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              Vouchers
            </h1>
            <p className="text-muted-foreground">
              All vouchers for {client?.businessName || 'this client'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Vouchers</p>
              <p className="text-3xl font-bold mt-2">{vouchers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-3xl font-bold text-green-500 mt-2">{vouchersByStatus.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Used</p>
              <p className="text-3xl font-bold text-blue-500 mt-2">{vouchersByStatus.used}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Expired</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{vouchersByStatus.expired}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Vouchers</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredVouchers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No vouchers found</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="hidden lg:table-cell">Expires</TableHead>
                      <TableHead className="hidden lg:table-cell">Used At</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.map((voucher) => {
                      const StatusIcon = statusConfig[voucher.status]?.icon || Clock;
                      return (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            <code className="font-mono text-sm font-semibold">
                              {voucher.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusConfig[voucher.status]?.color}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[voucher.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {format(parseISO(voucher.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {voucher.expiresAt
                              ? format(parseISO(voucher.expiresAt), 'MMM d, yyyy')
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {voucher.usedAt
                              ? format(parseISO(voucher.usedAt), 'MMM d, yyyy')
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
                                {voucher.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(voucher.id, 'revoked')}
                                  >
                                    <Ban className="h-4 w-4 mr-2 text-red-500" />
                                    Revoke
                                  </DropdownMenuItem>
                                )}
                                {voucher.status === 'revoked' && (
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(voucher.id, 'active')}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2 text-green-500" />
                                    Restore
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
      </div>
    </PageTransition>
  );
}