'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Image as ImageIcon, Video, Eye, MousePointerClick, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { AdvertModerationDialog } from '@/components/admin/dialogs/advert-moderation-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';

interface Advert {
  id: string;
  title: string;
  advertiser: string;
  status: 'Active' | 'Pending Review' | 'Rejected' | 'Expired';
  mediaType: 'image' | 'video';
  mediaUrl: string;
  createdDate: string;
  duration: number; // in seconds
  views: number;
  clicks: number;
  targetLink?: string;
  isGlobal?: boolean;
}

export default function AdvertsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAdvertId, setSelectedAdvertId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [adverts, setAdverts] = useState<Advert[]>([
    {
      id: 'AD-GL-001',
      title: 'Zota Network Upgrade Notification',
      advertiser: 'System Admin (Global)',
      status: 'Active',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      createdDate: '2024-04-18T10:00:00Z',
      duration: 10,
      views: 15234,
      clicks: 890,
      isGlobal: true,
    },
    {
      id: 'AD-CA-002',
      title: 'Summer Drink Specials',
      advertiser: 'FastConnect Cafe',
      status: 'Pending Review',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e',
      createdDate: '2024-04-20T14:30:00Z',
      duration: 5,
      views: 0,
      clicks: 0,
      isGlobal: false,
    },
    {
      id: 'AD-CA-003',
      title: 'Local Supermarket Deals',
      advertiser: 'SkyNet Wireless',
      status: 'Active',
      mediaType: 'video',
      mediaUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      createdDate: '2024-04-15T09:15:00Z',
      duration: 15,
      views: 5234,
      clicks: 324,
      isGlobal: false,
    },
  ]);

  const handleModerate = (advertId: string) => {
     setSelectedAdvertId(advertId);
     setIsDialogOpen(true);
  };

  const filteredAdverts = adverts.filter(
    (advert) =>
      advert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advert.advertiser.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const globalAdverts = filteredAdverts.filter((a) => a.isGlobal);
  const clientAdverts = filteredAdverts.filter((a) => !a.isGlobal);

  const getStatusColor = (status: Advert['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Pending Review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Expired': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const AdvertCard = ({ advert }: { advert: Advert }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full border-muted text-sm relative">
      {advert.status === 'Pending Review' && (
        <div className="absolute top-2 right-2 z-10 animate-pulse">
           <Badge className="bg-yellow-500 text-black border-none pointer-events-none">Requires Moderation</Badge>
        </div>
      )}
      <div className="aspect-video bg-muted relative overflow-hidden group-hover:opacity-90 transition-opacity">
         <img src={advert.mediaUrl} alt={advert.title} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              {advert.mediaType === 'image' ? <ImageIcon className="w-4 h-4"/> : <Video className="w-4 h-4"/>}
              <span className="truncate">{advert.title}</span>
            </h3>
            <p className="text-gray-300 text-xs truncate">{advert.advertiser}</p>
         </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
         <div className="flex justify-between items-center">
            <Badge variant="outline" className={getStatusColor(advert.status)}>
              {advert.status}
            </Badge>
            <span className="text-muted-foreground text-xs flex items-center gap-1 font-mono">
               <Clock className="w-3 h-3"/> {advert.duration}s
            </span>
         </div>
         
         <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-muted/50 p-2 rounded-md flex flex-col">
               <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3"/> Impressions</span>
               <span className="font-semibold text-foreground">{advert.views.toLocaleString()}</span>
            </div>
            <div className="bg-muted/50 p-2 rounded-md flex flex-col">
               <span className="text-xs text-muted-foreground flex items-center gap-1"><MousePointerClick className="w-3 h-3"/> Clicks</span>
               <span className="font-semibold text-foreground">{advert.clicks.toLocaleString()}</span>
            </div>
         </div>

         <div className="mt-auto pt-4 flex gap-2 w-full justify-between items-center border-t border-muted">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
               <Calendar className="w-3 h-3"/> {format(parseISO(advert.createdDate), 'MMM d, yyyy')}
            </div>
            {advert.status === 'Pending Review' ? (
              <Button size="sm" onClick={() => handleModerate(advert.id)}>Review</Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => handleModerate(advert.id)}>Manage</Button>
            )}
         </div>
      </CardContent>
    </Card>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advert Control Panel</h1>
            <p className="text-muted-foreground mt-2">
              Oversee and deploy advertisements across all client networks globally
            </p>
          </div>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Upload Global Advert
          </Button>
        </div>

        <div className="flex gap-4 items-center">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input placeholder="Search adverts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
           </div>
           <Button variant="outline" size="icon"><Filter className="w-4 h-4"/></Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 border border-border">
             <TabsTrigger value="all">All Adverts</TabsTrigger>
             <TabsTrigger value="global">Global Deployments</TabsTrigger>
             <TabsTrigger value="client">Client Uploads</TabsTrigger>
             <TabsTrigger value="review" className="relative">
                Needs Review
                {adverts.some(a => a.status === 'Pending Review') && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500 animate-pulse"/>
                )}
             </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
             <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
               {filteredAdverts.map(advert => <StaggerItem key={advert.id}><AdvertCard advert={advert} /></StaggerItem>)}
               {filteredAdverts.length === 0 && <p className="text-muted-foreground col-span-full">No adverts found.</p>}
             </StaggerContainer>
          </TabsContent>

          <TabsContent value="global" className="mt-6">
             <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
               {globalAdverts.map(advert => <StaggerItem key={advert.id}><AdvertCard advert={advert} /></StaggerItem>)}
               {globalAdverts.length === 0 && <p className="text-muted-foreground col-span-full">No global adverts found.</p>}
             </StaggerContainer>
          </TabsContent>

          <TabsContent value="client" className="mt-6">
             <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
               {clientAdverts.map(advert => <StaggerItem key={advert.id}><AdvertCard advert={advert} /></StaggerItem>)}
               {clientAdverts.length === 0 && <p className="text-muted-foreground col-span-full">No client adverts found.</p>}
             </StaggerContainer>
          </TabsContent>

          <TabsContent value="review" className="mt-6">
             <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
               {filteredAdverts.filter(a => a.status === 'Pending Review').map(advert => <StaggerItem key={advert.id}><AdvertCard advert={advert} /></StaggerItem>)}
               {filteredAdverts.filter(a => a.status === 'Pending Review').length === 0 && <p className="text-muted-foreground col-span-full">No adverts pending review.</p>}
             </StaggerContainer>
          </TabsContent>

        </Tabs>

        <AdvertModerationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </PageTransition>
  );
}
