'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Megaphone, Eye, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, DataTable, type Column } from '@/components/admin';
import { advertsService, clientsService } from '@/lib/api';
import type { Advert } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { formatDate, formatDateTime, statusVariant } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Row extends Advert {
  clientName: string;
  status?: string;
}

export default function AdvertsPage() {
  const [clientFilter, setClientFilter] = useState('all');
  const [preview, setPreview] = useState<Row | null>(null);

  const data = useAsync<Row[]>(async () => {
    const list = await clientsService.getAll();
    const settled = await Promise.allSettled(
      list.map((c) =>
        advertsService.getByClient(c.id).then((ads) => ads.map((a) => ({ ...a, clientName: c.businessName })))
      )
    );
    return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  }, []);

  const rows = useMemo(() => {
    const all = data.data ?? [];
    return clientFilter === 'all' ? all : all.filter((r) => String(r.client_id) === clientFilter);
  }, [data.data, clientFilter]);

  const setStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await advertsService.updateStatus(id, status);
      toast.success(`Advert set to ${status}`);
      data.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update advert');
    }
  };

  const remove = async (id: string) => {
    try {
      await advertsService.delete(id);
      toast.success('Advert deleted');
      data.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete advert');
    }
  };

  const columns: Column<Row>[] = [
    {
      key: 'mediaType',
      header: '',
      className: 'w-14',
      render: (r) => (
        <button onClick={() => setPreview(r)} className="flex h-9 w-12 items-center justify-center rounded-md bg-muted/60 border border-border/60 hover:border-primary/50 transition-colors">
          {r.mediaType === 'video' ? <PlayIcon /> : <PreviewImage src={r.media} />}
        </button>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      sortValue: (r) => r.description,
      render: (r) => (
        <div className="min-w-0 max-w-[300px]">
          <p className="truncate font-medium">{r.description || 'Untitled advert'}</p>
          <p className="text-xs text-muted-foreground truncate">{r.clientName}</p>
        </div>
      ),
    },
    { key: 'duration', header: 'Duration', hideOnMobile: true, sortValue: (r) => r.duration, render: (r) => <span>{r.duration}s</span> },
    { key: 'endsIn', header: 'Ends', hideOnMobile: true, render: (r) => <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDate(r.endsIn)}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (r) => r.status ?? 'unknown',
      render: (r) => <Badge variant={statusVariant(r.status ?? 'unknown')} className="text-[10px]">{r.status ?? '—'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24 text-right',
      render: (r) => {
        const st = r.status;
        return (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {st === 'active' ? (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500" title="Deactivate" onClick={() => setStatus(r.id, 'inactive')}>
                <XCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500" title="Approve / activate" onClick={() => setStatus(r.id, 'active')}>
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => remove(r.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    (data.data ?? []).forEach((r) => map.set(String(r.client_id), r.clientName));
    return map;
  }, [data.data]);

  return (
    <>
      <PageHeader title="Adverts" description="Hotspot advertisements uploaded by clients — moderate and control" />

      <DataTable
        columns={columns}
        rows={data.data ? rows : null}
        rowKey={(r) => `${r.client_id}-${r.id}`}
        isLoading={data.isLoading}
        error={data.error}
        onRetry={data.refresh}
        searchPlaceholder="Search adverts..."
        searchFn={(r, q) => r.description.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q)}
        emptyMessage="No adverts on the platform"
        toolbar={
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {Array.from(clients.entries()).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {preview?.description || 'Advert preview'}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <MediaView advert={preview} large />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Info label="Client" value={preview.clientName} />
                <Info label="Duration" value={`${preview.duration}s`} />
                <Info label="Ends" value={formatDateTime(preview.endsIn)} />
                <Info label="Created" value={formatDateTime(preview.createdAt)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium truncate">{value}</p>
    </div>
  );
}

function MediaView({ advert, large }: { advert: Advert; large?: boolean }) {
  const url = resolveMediaUrl(advert.media);
  if (!url) return <div className={cn('flex items-center justify-center rounded-lg bg-muted/50 text-muted-foreground text-xs', large ? 'h-64' : 'h-9 w-12')}>No media</div>;
  if (advert.mediaType === 'video') {
    return (
      <video
        src={url}
        controls={large}
        muted={!large}
        loop
        className={cn('rounded-lg object-contain bg-black', large ? 'max-h-[420px] w-full' : 'h-9 w-12')}
      />
    );
  }
  return <PreviewImage src={url} large={large} />;
}

function PreviewImage({ src, large }: { src: string; large?: boolean }) {
  const url = src.startsWith('http') ? src : src;
  if (!url || url === 'null' || url === 'undefined') {
    return <div className={cn('flex items-center justify-center rounded-lg bg-muted/50', large ? 'h-64' : 'h-9 w-12')}><Eye className="h-4 w-4 text-muted-foreground" /></div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Advert media"
      className={cn('rounded-lg object-cover', large ? 'max-h-[420px] w-full object-contain bg-black' : 'h-9 w-12')}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function PlayIcon() {
  return (
    <div className="flex h-9 w-12 items-center justify-center rounded-md bg-black/80">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M8 5v14l11-7z" /></svg>
    </div>
  );
}

function resolveMediaUrl(media: string): string | null {
  if (!media || media === 'null' || media === 'undefined') return null;
  if (media.startsWith('http')) return media;
  if (media.startsWith('/uploads')) return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}${media}`;
  return media;
}
