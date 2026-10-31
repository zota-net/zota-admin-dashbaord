'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Ban,
  Loader2,
  PauseCircle,
  PlayCircle,
  Wifi,
  Ticket,
  Wallet,
  TrendingUp,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, DataTable, ErrorState, EmptyState, StatsCard, CardSkeleton, type Column } from '@/components/admin';
import { clientsService, bopDevicesService, walletsService, reportsService } from '@/lib/api';
import type {
  Client,
  ClientReport,
  Voucher,
  Package,
  Advert,
  BopDevice,
  Wallet as WalletType,
  Transaction,
  VoucherSale,
} from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatMoney, formatNumber, formatDate, formatDateTime, timeAgo, statusVariant } from '@/lib/format';

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const client = useAsync<Client | null>(() => clientsService.getById(clientId).then((c) => c ?? null), [clientId]);
  const report = useAsync<ClientReport | null>(
    () => clientsService.getReport(clientId).then((r) => r as ClientReport).catch(() => null),
    [clientId]
  );
  const wallet = useAsync<WalletType | null>(
    () => walletsService.getByClient(clientId).catch(() => null),
    [clientId]
  );

  const data = client.data;

  const changeStatus = async (status: 'Active' | 'Suspended' | 'InActive') => {
    if (!data) return;
    setBusy(true);
    try {
      await clientsService.updateStatus(clientId, status);
      toast.success(`${data.businessName} set to ${status}`);
      client.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  if (client.error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to clients
        </Button>
        <ErrorState message={client.error} onRetry={client.refresh} />
      </div>
    );
  }

  if (client.isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Card className="py-0">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-8 w-96 max-w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading client…
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/clients')} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <PageHeader title={data.businessName} description={`${data.adminFullName} · ${data.adminEmail} · ${data.contact}`}>
            <Badge variant={statusVariant(data.status)} className="mr-2">{data.status}</Badge>
            {data.status === 'Active' ? (
              <>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => changeStatus('Suspended')}>
                  {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PauseCircle className="h-4 w-4 mr-2" />}
                  Suspend
                </Button>
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => changeStatus('InActive')}>
                  <Ban className="h-4 w-4 mr-2" />
                  Ban
                </Button>
              </>
            ) : (
              <Button size="sm" disabled={busy} onClick={() => changeStatus('Active')}>
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                Activate
              </Button>
            )}
          </PageHeader>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatsCard title="Wallet Balance" value={formatMoney(wallet.data?.balance ?? 0)} icon={Wallet} animated={false} />
        <StatsCard title="Connected Devices" value={formatNumber(report.data?.totalDevices ?? 0)} icon={Wifi} />
        <StatsCard title="Total Vouchers" value={formatNumber(report.data?.totalVouchers ?? 0)} description={`${report.data?.activeVouchers ?? 0} active`} icon={Ticket} />
        <StatsCard title="Total Revenue" value={formatMoney(report.data?.totalRevenue ?? 0)} icon={TrendingUp} variant="success" animated={false} />
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="adverts">Adverts</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <WalletTab walletId={wallet.data?.id ?? null} walletLoading={wallet.isLoading} clientId={clientId} />
        </TabsContent>

        <TabsContent value="devices">
          <DevicesTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="vouchers">
          <VouchersTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="adverts">
          <AdvertsTab clientId={clientId} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function WalletTab({ walletId, walletLoading, clientId }: { walletId: string | null; walletLoading: boolean; clientId: string }) {
  const txns = useAsync<Transaction[]>(
    () => (walletId ? walletsService.getTransactions(walletId, 100) : Promise.resolve([])),
    [walletId]
  );
  const sales = useAsync<VoucherSale[]>(
    () => reportsService.getSalesReport(clientId).then((r) => r.sales),
    [clientId]
  );

  const columns: Column<Transaction>[] = [
    { key: 'createdAt', header: 'Date', render: (r) => <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span> },
    { key: 'type', header: 'Type', sortValue: (r) => r.type, render: (r) => <Badge variant="outline" className="text-[10px]">{r.type}</Badge> },
    {
      key: 'amount',
      header: 'Amount',
      sortValue: (r) => Number(r.amount),
      render: (r) => (
        <span className={Number(r.amount) >= 0 ? 'text-green-500 tabular-nums' : 'tabular-nums'}>
          {formatMoney(Number(r.amount))}
        </span>
      ),
    },
    { key: 'description', header: 'Description', hideOnMobile: true },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        rows={walletLoading ? null : walletId ? txns.data : []}
        rowKey={(r) => r.id}
        isLoading={walletLoading || txns.isLoading}
        error={!walletLoading && !walletId ? 'No wallet found for this client' : null}
        onRetry={walletId ? txns.refresh : undefined}
        searchPlaceholder="Search transactions..."
        emptyMessage="No wallet transactions"
      />
      {sales.isLoading && (
        <Card className="py-0">
          <div className="border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>
      )}
      {sales.data && sales.data.length > 0 && (
        <Card className="py-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Voucher sales by this client</h3>
            <Badge variant="secondary" className="ml-auto text-[10px]">{sales.data.length}</Badge>
          </div>
          <div className="divide-y divide-border">
            {sales.data.slice(0, 8).map((s, i) => (
              <div key={`${s.id}-${i}`} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs truncate">{s.voucherCode ?? '—'}</span>
                  <span className="text-muted-foreground">{s.provider ?? ''}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="tabular-nums font-medium">{formatMoney(Number(s.amount ?? 0))}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(s.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function DevicesTab({ clientId }: { clientId: string }) {
  const devices = useAsync<BopDevice[]>(() => bopDevicesService.getByClient(clientId), [clientId]);

  const columns: Column<BopDevice>[] = [
    { key: 'macAddress', header: 'MAC Address', sortValue: (r) => r.macAddress, render: (r) => <span className="font-mono text-xs">{r.macAddress}</span> },
    { key: 'voucher_id', header: 'Voucher', sortValue: (r) => String(r.voucher_id), render: (r) => <span className="font-mono text-xs">{String(r.voucher_id)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant(r.status ?? 'unknown')} className="text-[10px]">{r.status ?? '—'}</Badge> },
    { key: 'expiresAt', header: 'Expires', sortValue: (r) => r.expiresAt, render: (r) => <span className="text-muted-foreground">{formatDateTime(r.expiresAt)}</span> },
    { key: 'JoinedAt', header: 'Joined', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{formatDate(r.JoinedAt)}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={devices.data}
      rowKey={(r) => String(r.id)}
      isLoading={devices.isLoading}
      error={devices.error}
      onRetry={devices.refresh}
      searchPlaceholder="Search devices by MAC..."
      emptyMessage="No devices connected by this client"
    />
  );
}

function VouchersTab({ clientId }: { clientId: string }) {
  const vouchers = useAsync<Voucher[]>(() => clientsService.getVouchers(clientId), [clientId]);

  const columns: Column<Voucher>[] = [
    { key: 'code', header: 'Code', sortValue: (r) => r.code, render: (r) => <span className="font-mono text-xs font-medium">{r.code}</span> },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <Badge variant={statusVariant(r.status)} className="text-[10px]">{r.status}</Badge> },
    { key: 'package_id', header: 'Package', hideOnMobile: true },
    { key: 'createdAt', header: 'Created', sortValue: (r) => r.createdAt, render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span> },
    { key: 'usedAt', header: 'Used', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{r.usedAt ? formatDateTime(r.usedAt) : '—'}</span> },
    { key: 'expiresAt', header: 'Expires', render: (r) => <span className="text-muted-foreground">{formatDateTime(r.expiresAt)}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={vouchers.data}
      rowKey={(r) => r.id}
      isLoading={vouchers.isLoading}
      error={vouchers.error}
      onRetry={vouchers.refresh}
      searchPlaceholder="Search voucher codes..."
      emptyMessage="No vouchers for this client"
    />
  );
}

function PackagesTab({ clientId }: { clientId: string }) {
  const packages = useAsync<Package[]>(() => clientsService.getPackages(clientId), [clientId]);

  const columns: Column<Package>[] = [
    { key: 'title', header: 'Package', sortValue: (r) => r.title },
    {
      key: 'price',
      header: 'Price',
      sortValue: (r) => r.price,
      render: (r) => <span className="tabular-nums font-medium">{formatMoney(r.price)}</span>,
    },
    {
      key: 'period',
      header: 'Validity',
      render: (r) => <span>{formatDuration(r.period)}</span>,
      sortValue: (r) => r.period,
    },
    { key: 'commission', header: 'Agent Commission', hideOnMobile: true, render: (r) => <span>{r.agentComissionPercentage}%</span>, sortValue: (r) => r.agentComissionPercentage },
    { key: 'createdAt', header: 'Created', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={packages.data}
      rowKey={(r) => r.id}
      isLoading={packages.isLoading}
      error={packages.error}
      onRetry={packages.refresh}
      searchPlaceholder="Search packages..."
      emptyMessage="No packages configured"
    />
  );
}

function AdvertsTab({ clientId }: { clientId: string }) {
  const adverts = useAsync<Advert[]>(() => clientsService.getAdverts(clientId), [clientId]);

  const columns: Column<Advert>[] = [
    { key: 'mediaType', header: 'Type', render: (r) => (
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className="text-[10px]">{r.mediaType}</Badge>
      </div>
    ) },
    { key: 'description', header: 'Description', sortValue: (r) => r.description },
    { key: 'duration', header: 'Duration', render: (r) => <span>{r.duration}s</span>, sortValue: (r) => r.duration },
    { key: 'endsIn', header: 'Ends In', render: (r) => <span className="text-muted-foreground">{formatDateTime(r.endsIn)}</span> },
    { key: 'createdAt', header: 'Created', hideOnMobile: true, render: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={adverts.data}
      rowKey={(r) => r.id}
      isLoading={adverts.isLoading}
      error={adverts.error}
      onRetry={adverts.refresh}
      emptyMessage="No adverts uploaded by this client"
    />
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hrs`;
  return `${Math.round(seconds / 86400)} days`;
}
