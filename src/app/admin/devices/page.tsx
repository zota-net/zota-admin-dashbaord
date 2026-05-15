'use client';

import { useEffect, useState } from 'react';
import { Search, RefreshCw, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { clientsService, bopDevicesService } from '@/lib/api';
import type { Client, BopDevice } from '@/lib/api/types';
import { toast } from 'sonner';

type TaggedDevice = BopDevice & { clientName: string };

const fmtDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString() : '—';

export default function DevicesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [devices, setDevices] = useState<TaggedDevice[]>([]);
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
          bopDevicesService.getByClient(c.id).then(devs => devs.map(d => ({ ...d, clientName: c.businessName })))
        )
      ).then(rs => rs.flatMap(r => r.status === 'fulfilled' ? r.value : []));
      setDevices(all.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()));
    } catch { toast.error('Failed to load devices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const isExpired = (d: BopDevice) => new Date(d.expiresAt) < new Date();

  const filtered = devices.filter(d =>
    (clientFilter === 'all' || d.clientName === clients.find(c => c.id === clientFilter)?.businessName) &&
    (!search || d.macAddress.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: devices.length,
    active: devices.filter(d => !isExpired(d)).length,
    expired: devices.filter(isExpired).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connected Devices</h1>
          <p className="text-muted-foreground mt-1">Hotspot-connected customer devices across all clients</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Devices', value: stats.total },
          { label: 'Active Sessions', value: stats.active },
          { label: 'Expired Sessions', value: stats.expired },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search MAC address…" value={search} onChange={e => setSearch(e.target.value)} />
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
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"><Smartphone className="w-8 h-8" /><p>No devices found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MAC Address</TableHead><TableHead>Status</TableHead><TableHead>Client</TableHead>
                    <TableHead>Joined</TableHead><TableHead>Expires</TableHead>
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
                        <TableCell className="text-sm">{d.clientName}</TableCell>
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
  );
}
