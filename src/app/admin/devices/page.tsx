'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Smartphone, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable, StatsCard, type Column } from '@/components/admin';
import { clientsService, bopDevicesService } from '@/lib/api';
import type { BopDevice } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatDateTime, formatDate } from '@/lib/format';

interface Row extends BopDevice {
  clientName: string;
  active: boolean;
}

export default function DevicesPage() {
  const [clientFilter, setClientFilter] = useState('all');

  const data = useAsync<Row[]>(async () => {
    const list = await clientsService.getAll();
    const settled = await Promise.allSettled(
      list.map((c) =>
        bopDevicesService.getByClient(c.id).then((devs) => {
          const now = Date.now();
          return devs.map((d) => ({
            ...d,
            clientName: c.businessName,
            active: d.expiresAt ? new Date(d.expiresAt).getTime() > now : false,
          }));
        })
      )
    );
    return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  }, []);

  const rows = useMemo(() => {
    const all = data.data ?? [];
    return clientFilter === 'all' ? all : all.filter((r) => r.clientName === clientFilter);
  }, [data.data, clientFilter]);

  const clients = useMemo(() => {
    const names = new Set((data.data ?? []).map((r) => r.clientName));
    return Array.from(names).sort();
  }, [data.data]);

  const isOnline = (d: Row) => d.active;

  const onlineCount = useMemo(() => (data.data ?? []).filter(isOnline).length, [data.data]);

  const remove = async (id: string) => {
    try {
      await bopDevicesService.delete(id);
      toast.success('Device removed');
      data.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove device');
    }
  };

  const columns: Column<Row>[] = [
    {
      key: 'macAddress',
      header: 'Device',
      sortValue: (r) => r.macAddress,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isOnline(r) ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-xs font-medium">{r.macAddress}</p>
            <p className="text-xs text-muted-foreground">{r.clientName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (r) =>
        isOnline(r) ? (
          <Badge className="bg-green-500/10 text-green-500 border-transparent hover:bg-green-500/10 text-[10px]">
            <Wifi className="h-3 w-3 mr-1" />Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">
            <WifiOff className="h-3 w-3 mr-1" />Expired
          </Badge>
        ),
      sortValue: (r) => (isOnline(r) ? 1 : 0),
    },
    { key: 'voucher_id', header: 'Voucher', hideOnMobile: true, render: (r) => <span className="font-mono text-xs">{String(r.voucher_id)}</span> },
    { key: 'JoinedAt', header: 'Joined', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{formatDate(r.JoinedAt)}</span> },
    { key: 'expiresAt', header: 'Expires', sortValue: (r) => r.expiresAt, render: (r) => <span className="text-muted-foreground">{formatDateTime(r.expiresAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (r) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          title="Remove device"
          onClick={(e) => {
            e.stopPropagation();
            remove(String(r.id));
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Devices" description="All client devices connected through the platform" />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Devices" value={(data.data ?? []).length} icon={Smartphone} />
        <StatsCard title="Active Sessions" value={onlineCount} icon={Wifi} variant="success" />
        <StatsCard title="Expired" value={(data.data ?? []).length - onlineCount} icon={WifiOff} variant="warning" />
      </div>

      <DataTable
        columns={columns}
        rows={data.data ? rows : null}
        rowKey={(r) => String(r.id)}
        isLoading={data.isLoading}
        error={data.error}
        onRetry={data.refresh}
        searchPlaceholder="Search by MAC..."
        searchFn={(r, q) => r.macAddress.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)}
        emptyMessage="No devices found"
        pageSize={20}
        toolbar={
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </>
  );
}
