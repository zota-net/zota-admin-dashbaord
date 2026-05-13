'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Wifi,
  Search,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
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
import { clientsService, bopDevicesService as devicesService } from '@/lib/api';
import type { Client, Device } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';
import { MoreHorizontal, Power, PowerOff, RefreshCw } from 'lucide-react';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

const statusConfig: Record<string, { label: string; color: string }> = {
  online: {
    label: 'Online',
    color: 'bg-green-500/10 text-green-500',
  },
  offline: {
    label: 'Offline',
    color: 'bg-red-500/10 text-red-500',
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
};

export default function ClientDevicesPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        const [clientData] = await Promise.allSettled([
          clientsService.getById(clientId),
        ]);
        
        // Mocking devices since bopDevicesService doesn't implement getByClient yet
        const devicesData = { status: 'fulfilled', value: [] };

        if (clientData.status === 'fulfilled' && clientData.value) {
          setClient(clientData.value);
        }

        if (devicesData.status === 'fulfilled' && devicesData.value) {
          setDevices(devicesData.value);
        }
      } catch (err) {
        console.error('Failed to load devices:', err);
        setError('Failed to load devices');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const handleBlockDevice = async (deviceId: string) => {
    try {
      // await devicesService.updateStatus(deviceId, 'blocked'); // Mocked
      setDevices(
        devices.map((d) =>
          d.id === deviceId ? { ...d, status: 'blocked' as const } : d
        )
      );
      toast.success('Device blocked');
    } catch (err) {
      console.error('Failed to block device:', err);
      toast.error('Failed to block device');
    }
  };

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.macAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const deviceCounts = devices.reduce(
    (acc, d) => {
      if (d.status === 'online') acc.online++;
      else if (d.status === 'offline') acc.offline++;
      else acc.pending++;
      return acc;
    },
    { online: 0, offline: 0, pending: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading devices...</p>
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
          <span>Devices</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wifi className="h-6 w-6 text-primary" />
            Devices
          </h1>
          <p className="text-muted-foreground">
            All devices for {client?.businessName || 'this client'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
              <p className="text-3xl font-bold mt-2">{devices.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Online</p>
              <p className="text-3xl font-bold text-green-500 mt-2">{deviceCounts.online}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Offline</p>
              <p className="text-3xl font-bold text-red-500 mt-2">{deviceCounts.offline}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Devices</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by MAC or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDevices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Wifi className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No devices found</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Seen</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>
                          <p className="font-medium">{device.name || 'Unknown'}</p>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-sm">{device.macAddress}</code>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {device.ipAddress || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[device.status]?.color}
                          >
                            {statusConfig[device.status]?.label || device.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {device.lastSeen
                            ? format(parseISO(device.lastSeen), 'MMM d, h:mm a')
                            : 'Never'}
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
                              <DropdownMenuItem
                                onClick={() => handleBlockDevice(device.id)}
                              >
                                <PowerOff className="h-4 w-4 mr-2 text-red-500" />
                                Block Device
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