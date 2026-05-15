'use client';

import { useEffect, useState } from 'react';
import { Search, RefreshCw, Image as ImageIcon, Video, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { clientsService, advertsService } from '@/lib/api';
import type { Client, Advert } from '@/lib/api/types';
import { toast } from 'sonner';

type TaggedAdvert = Advert & { clientName: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';

function resolveMediaUrl(media: string) {
  if (!media) return '';
  if (media.startsWith('http://') || media.startsWith('https://')) return media;
  return `${API_BASE_URL}/bop${media}`;
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString();

export default function AdminAdvertsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [adverts, setAdverts] = useState<TaggedAdvert[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientFilter, setClientFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const clientList = await clientsService.getAll();
      setClients(clientList);
      const all = await Promise.allSettled(
        clientList.map(c => advertsService.getByClient(c.id).then(ads => ads.map(a => ({ ...a, clientName: c.businessName }))))
      ).then(rs => rs.flatMap(r => r.status === 'fulfilled' ? r.value : []));
      setAdverts(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { toast.error('Failed to load adverts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this advert?')) return;
    try { await advertsService.delete(id); toast.success('Advert deleted'); load(); }
    catch { toast.error('Failed to delete advert'); }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'inactive' : 'active';
    try { await advertsService.updateStatus(id, next as 'active' | 'inactive' | 'pending'); toast.success(`Advert ${next}`); load(); }
    catch { toast.error('Failed to update advert status'); }
  };

  const isExpired = (a: Advert) => new Date(a.endsIn) < new Date();

  const filtered = adverts.filter(a =>
    (clientFilter === 'all' || a.client_id === clientFilter) &&
    (!search || a.description.toLowerCase().includes(search.toLowerCase()) || a.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: adverts.length,
    active: adverts.filter(a => !isExpired(a)).length,
    expired: adverts.filter(isExpired).length,
    clients: new Set(adverts.map(a => a.client_id)).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adverts</h1>
          <p className="text-muted-foreground mt-1">All advertisements across all clients</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Adverts', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Expired', value: stats.expired },
          { label: 'Client Campaigns', value: stats.clients },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search adverts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2"><ImageIcon className="w-8 h-8" /><p>No adverts found</p></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(advert => {
            const expired = isExpired(advert);
            return (
              <Card key={advert.id} className={expired ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold line-clamp-2">{advert.description}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{advert.clientName}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Badge variant={expired ? 'secondary' : 'default'} className="text-xs">{expired ? 'Expired' : 'Active'}</Badge>
                      {advert.mediaType && (
                        <Badge variant="outline" className="text-xs gap-1">
                          {advert.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {advert.mediaType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {advert.media && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {advert.mediaType === 'video' ? (
                        <video src={resolveMediaUrl(advert.media)} className="w-full h-full object-cover" muted loop playsInline
                          onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                          onMouseLeave={e => (e.currentTarget as HTMLVideoElement).pause()} />
                      ) : (
                        <img src={resolveMediaUrl(advert.media)} alt={advert.description} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Expires {fmtDate(advert.endsIn)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => handleToggleStatus(advert.id, expired ? 'inactive' : 'active')}>
                      {expired ? 'Reactivate' : 'Deactivate'}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(advert.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
