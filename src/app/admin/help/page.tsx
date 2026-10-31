'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Video, PlayCircle, Pencil, Trash2, Plus, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, EmptyState, ErrorState } from '@/components/admin';
import { tutorialsService, type Tutorial } from '@/lib/api';
import { useAsync } from '@/lib/use-async';
import { formatDate } from '@/lib/format';

function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  if (url.includes('/embed/')) return url;
  return null;
}

export default function HelpPage() {
  const tutorials = useAsync<Tutorial[]>(() => tutorialsService.getAll(), []);
  const [playing, setPlaying] = useState<Tutorial | null>(null);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const list = useMemo(
    () => [...(tutorials.data ?? [])].filter((t) => t.isActive !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tutorials.data]
  );

  const remove = async (id: number) => {
    try {
      await tutorialsService.remove(id);
      toast.success('Tutorial removed');
      tutorials.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove tutorial');
    }
  };

  return (
    <>
      <PageHeader title="Self-Help Library" description="Video tutorials available to clients on the platform">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tutorial
        </Button>
      </PageHeader>

      {tutorials.error ? (
        <ErrorState message={tutorials.error} onRetry={tutorials.refresh} />
      ) : tutorials.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="aspect-video rounded-lg bg-muted animate-pulse mb-3" />
                <div className="h-5 w-2/3 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState message="No tutorials published yet — add the first one" icon={BookOpen} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <Card key={t.id} className="group py-0 overflow-hidden">
              <button className="relative block w-full" onClick={() => setPlaying(t)}>
                <div className="aspect-video w-full bg-[#0b0e14] flex items-center justify-center">
                  {toEmbedUrl(t.videoUrl) ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${(toEmbedUrl(t.videoUrl) ?? '').split('/embed/')[1]}/hqdefault.jpg`}
                        alt={t.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                      />
                      <PlayCircle className="relative z-10 h-12 w-12 text-white/90 drop-shadow-lg" />
                    </>
                  ) : (
                    <Video className="h-10 w-10 text-muted-foreground/50" />
                  )}
                </div>
              </button>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{t.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDate(t.createdAt as unknown as string)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(t)} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(t.id)} title="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Player */}
      <Dialog open={!!playing} onOpenChange={() => setPlaying(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{playing?.title}</DialogTitle>
            <DialogDescription>{playing?.description}</DialogDescription>
          </DialogHeader>
          {playing && toEmbedUrl(playing.videoUrl) ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={toEmbedUrl(playing.videoUrl) ?? ''}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            playing && (
              <a href={playing.videoUrl} target="_blank" rel="noreferrer" className="text-primary underline text-sm">
                Open video link
              </a>
            )
          )}
        </DialogContent>
      </Dialog>

      <TutorialFormDialog
        open={createOpen || !!editing}
        initial={editing}
        onOpenChange={(v) => {
          if (!v) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
        onSaved={() => tutorials.refresh()}
      />
    </>
  );
}

function TutorialFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Tutorial | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', order: '0', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sync = () => { if (!initial) return;
      setForm({
        title: initial.title,
        description: initial.description,
        videoUrl: initial.videoUrl,
        order: String(initial.order ?? 0),
        isActive: initial.isActive !== false,
      });
    };
    queueMicrotask(sync);
  }, [initial, open]);

  const submit = async () => {
    if (!form.title || !form.videoUrl) {
      toast.error('Title and video URL are required');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      videoUrl: form.videoUrl,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    try {
      if (initial) {
        await tutorialsService.update(initial.id, payload);
        toast.success('Tutorial updated');
      } else {
        await tutorialsService.create(payload);
        toast.success('Tutorial added');
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save tutorial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Tutorial' : 'Add Tutorial'}</DialogTitle>
          <DialogDescription>YouTube links are embedded automatically</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. How to create vouchers" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
            <Button
              type="button"
              variant={form.isActive ? 'default' : 'outline'}
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
            >
              {form.isActive ? 'Visible' : 'Hidden'}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
