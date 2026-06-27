'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Search,
  ChevronRight,
  Zap,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTransition } from '@/components/common';
import { clientsService, packagesService } from '@/lib/api';
import type { Client } from '@/lib/api/types';
import type { Package as PackageType } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

export default function ClientPackagesPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        const [clientData, packagesData] = await Promise.allSettled([
          clientsService.getById(clientId),
          packagesService.getByClient(clientId),
        ]);

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (packagesData.status === 'fulfilled' && packagesData.value) {
          setPackages(packagesData.value);
        }
      } catch (err) {
        console.error('Failed to load packages:', err);
        setError('Failed to load packages');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const filteredPackages = packages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDuration = (seconds: number) => {
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
    return `${Math.round(seconds / 86400)}d`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading packages...</p>
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
          <span>Packages</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Packages
          </h1>
          <p className="text-muted-foreground">
            All service packages for {client?.businessName || 'this client'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Packages</p>
              <p className="text-3xl font-bold mt-2">{packages.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {formatCurrency(packages.length > 0 ? packages.reduce((sum, p) => sum + p.price, 0) / packages.length : 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Packages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPackages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No packages found</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Data Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <p className="font-medium">{pkg.title}</p>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-500">
                            {formatCurrency(pkg.price)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDuration(pkg.period)}</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500"
                          >
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {format(parseISO(pkg.createdAt), 'MMM d, yyyy')}
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
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