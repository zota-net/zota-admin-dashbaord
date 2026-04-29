'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Play,
  Plus,
  Search,
  ThumbsUp,
  Video,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HelpVideo {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
}

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : null;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SelfHelpPage() {
  const [videos, setVideos] = useState<HelpVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);

  useEffect(() => {
    setVideos([
      {
        id: 'VID-001',
        title: 'Getting Started with Zota',
        description: 'Account onboarding, first client setup, and voucher generation basics.',
        youtubeUrl: 'https://youtube.com/watch?v=example1',
        category: 'Getting Started',
        duration: 300,
        views: 1250,
        likes: 89,
        createdAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'VID-002',
        title: 'Creating and Managing Vouchers',
        description: 'How operators create, review, and monitor voucher inventory.',
        youtubeUrl: 'https://youtube.com/watch?v=example2',
        category: 'Vouchers',
        duration: 480,
        views: 892,
        likes: 67,
        createdAt: '2024-01-12T14:00:00Z',
      },
      {
        id: 'VID-003',
        title: 'Connecting Your MikroTik Router',
        description: 'Device onboarding flow and what to verify when a router is linked.',
        youtubeUrl: 'https://youtube.com/watch?v=example3',
        category: 'Devices',
        duration: 720,
        views: 654,
        likes: 45,
        createdAt: '2024-01-14T09:00:00Z',
      },
      {
        id: 'VID-004',
        title: 'Setting Up Packages',
        description: 'A practical walkthrough for package configuration and pricing strategy.',
        youtubeUrl: 'https://youtube.com/watch?v=example4',
        category: 'Packages',
        duration: 360,
        views: 423,
        likes: 34,
        createdAt: '2024-01-15T11:00:00Z',
      },
    ]);
    setIsLoading(false);
  }, []);

  const filteredVideos = useMemo(
    () =>
      videos.filter((video) => {
        const matchesSearch =
          searchQuery === '' ||
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
    [categoryFilter, searchQuery, videos]
  );

  const categories = [...new Set(videos.map((video) => video.category))];

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm"
        >
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.35fr_1fr] lg:px-8 lg:py-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-primary/10 text-primary">Knowledge base</Badge>
                <Badge variant="outline">Client enablement</Badge>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight">Make support lighter by giving clients sharper self-service paths.</h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Curate the tutorials, setup walkthroughs, and troubleshooting guides that reduce repetitive support load and improve onboarding quality.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-xl" onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add new tutorial
                </Button>
              </div>
            </div>

            <Card className="rounded-[24px] border-border/70 bg-secondary/40 shadow-none">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                  Library Health
                </CardDescription>
                <CardTitle className="text-xl">Current content reach</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <p className="text-sm font-medium">Most useful category</p>
                  <p className="mt-1 text-sm text-muted-foreground">Voucher tutorials are still the most frequently accessed.</p>
                </div>
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <p className="text-sm font-medium">Content gap</p>
                  <p className="mt-1 text-sm text-muted-foreground">Payments and support-room walkthroughs should be added next.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Total videos</p>
                  <p className="mt-2 text-3xl font-semibold">{videos.length}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Video className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Total views</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {videos.reduce((sum, video) => sum + video.views, 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                  <Eye className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Likes</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {videos.reduce((sum, video) => sum + video.likes, 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-[24px] border-border/70">
          <CardHeader>
            <CardTitle className="text-2xl">Help content library</CardTitle>
            <CardDescription>
              Search existing tutorials and open a video in place to review the end-user experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search videos, workflows, or categories..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center rounded-2xl border py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border py-16 text-muted-foreground">
                <Video className="mb-4 h-12 w-12 opacity-50" />
                <p>No tutorials match the current filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredVideos.map((video) => (
                  <StaggerItem key={video.id}>
                    <Card className="h-full cursor-pointer overflow-hidden rounded-2xl transition-shadow hover:shadow-md" onClick={() => setSelectedVideo(video)}>
                      <div className="group relative aspect-video overflow-hidden bg-secondary">
                        {getYoutubeId(video.youtubeUrl) ? (
                          <img
                            src={`https://img.youtube.com/vi/${getYoutubeId(video.youtubeUrl)}/hqdefault.jpg`}
                            alt={video.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-slate-950/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex size-14 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg">
                            <Play className="ml-1 h-6 w-6" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs text-white">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <CardContent className="flex h-full flex-col gap-4 p-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-6">{video.title}</h3>
                            <Badge variant="outline">{video.category}</Badge>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{video.description}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {video.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {video.likes}
                          </span>
                          <span>{format(parseISO(video.createdAt), 'MMM d')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Tutorial</DialogTitle>
              <DialogDescription>
                Add a new self-help video entry for operators and clients.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Video title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Short description" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input id="youtubeUrl" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Getting Started" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddDialog(false)}>Add Tutorial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
          <DialogContent className="overflow-hidden p-0 sm:max-w-4xl">
            {selectedVideo ? (
              <>
                <div className="aspect-video bg-slate-950">
                  {getYoutubeId(selectedVideo.youtubeUrl) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.youtubeUrl)}?autoplay=1`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/70">
                      Invalid video URL
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{selectedVideo.category}</Badge>
                    <Badge variant="outline">{formatDuration(selectedVideo.duration)}</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedVideo.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedVideo.description}</p>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
