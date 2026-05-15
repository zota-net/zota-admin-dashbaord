'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Wifi, WifiOff, Search, ChevronRight, Smartphone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/common';
import { clientsService, bopDevicesService } from '@/lib/api';
import type { Client, BopDevice } from '@/lib/api/types';

const fmtDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString() : '—';

export default function ClientDevicesPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [devices, setDevices] = useState<BopDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const [clientData, devicesData] = await Promise.allSettled([
          clientsService.getById(clientId),
          bopDevicesService.getByClient(clientId),
        ]);
        if (clientData.status === 'fulfilled' && clientData.value) setClient(clientData.value);
        if (devicesData.status === 'fulfilled' && Array.isArray(devicesData.value)) {
          setDevices(devicesData.value.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()));
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  const isExpired = (d: BopDevice) => new Date(d.expiresAt) < new Date();

  const filtered = devices.filter(d =>
    !search || d.macAddress.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: devices.length,
    active: devices.filter(d => !isExpired(d)).length,
    expired: devices.filter(isExpired).length,
  };

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
          <span className="text-foreground">Devices</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wifi className="h-6 w-6 text-primary" />
            Connected Devices
          </h1>
          <p className="text-muted-foreground">Hotspot devices for {client?.businessName || 'this client'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Total Devices', value: stats.total, color: '' },
            { label: 'Active Sessions', value: stats.active, color: 'text-green-500' },
            { label: 'Expired Sessions', value: stats.expired, color: 'text-muted-foreground' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <CardTitle>All Devices</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9 w-[220px]" placeholder="Search MAC address…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Smartphone className="h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No devices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MAC Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(d => {
                      const expired = isExpired(d);
                      return (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-sm">{d.macAddress}</TableCell>
                          <TableCell>
                            {expired ? (
                              <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                                <WifiOff className="w-3 h-3" />Expired
                              </Badge>
                            ) : (
                              <Badge variant="default" className="gap-1 text-xs">
                                <Wifi className="w-3 h-3" />Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(d.JoinedAt ?? d.createdAt)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(d.expiresAt)}</TableCell>
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
