'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Play,
  Plus,
  Search,
  ThumbsUp,
  Edit,
  Trash2,
  Youtube,
  Video,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

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

const STORAGE_KEY = 'zota-admin-help-videos';

const DEFAULT_VIDEOS: HelpVideo[] = [
  {
    id: 'VID-001',
    title: 'Getting Started with Xetihub',
    description: 'Learn how to set up your account and create your first vouchers',
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Getting Started',
    duration: 300,
    views: 1250,
    likes: 89,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'VID-002',
    title: 'Creating and Managing Vouchers',
    description: 'Complete guide to creating, editing, and managing vouchers',
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Vouchers',
    duration: 480,
    views: 892,
    likes: 67,
    createdAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'VID-003',
    title: 'Connecting Your MikroTik Router',
    description: 'Step-by-step guide to connecting your router to the platform',
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Devices',
    duration: 720,
    views: 654,
    likes: 45,
    createdAt: '2024-01-14T09:00:00Z',
  },
  {
    id: 'VID-004',
    title: 'Setting Up Internet Packages',
    description: 'How to create and configure internet packages for your customers',
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Packages',
    duration: 360,
    views: 423,
    likes: 34,
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'VID-005',
    title: 'Understanding Reports & Analytics',
    description: 'How to read and export sales reports and analytics data',
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Reports',
    duration: 420,
    views: 312,
    likes: 28,
    createdAt: '2024-01-16T15:00:00Z',
  },
  {
    id: 'VID-006',
    title: 'Mobile Money & Payment Setup',
    description: 'Configure mobile money payments and understand gateway fees',
    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Payments',
    duration: 540,
    views: 198,
    likes: 19,
    createdAt: '2024-01-18T13:00:00Z',
  },
];

const CATEGORIES = ['Getting Started', 'Vouchers', 'Devices', 'Packages', 'Reports', 'Payments', 'Billing', 'General'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1] ?? null;
  }
  return null;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BLANK_FORM = {
  title: '',
  description: '',
  youtubeUrl: '',
  category: 'General',
  duration: 0,
};

export default function SelfHelpPage() {
  const [videos, setVideos] = useState<HelpVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HelpVideo | null>(null);
  const [previewVideo, setPreviewVideo] = useState<HelpVideo | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setVideos(stored ? JSON.parse(stored) : DEFAULT_VIDEOS);
    } catch {
      setVideos(DEFAULT_VIDEOS);
    }
  }, []);

  const persist = (updated: HelpVideo[]) => {
    setVideos(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const openAdd = () => {
    setEditingVideo(null);
    setForm(BLANK_FORM);
    setShowDialog(true);
  };

  const openEdit = (video: HelpVideo) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      category: video.category,
      duration: video.duration,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.youtubeUrl.trim()) {
      toast.error('Title and YouTube URL are required');
      return;
    }
    if (!extractYouTubeId(form.youtubeUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      if (editingVideo) {
        persist(videos.map((v) => v.id === editingVideo.id ? { ...v, ...form } : v));
        toast.success('Video updated');
      } else {
        const newVideo: HelpVideo = {
          id: `VID-${Date.now()}`,
          ...form,
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString(),
        };
        persist([newVideo, ...videos]);
        toast.success('Video added');
      }
      setShowDialog(false);
      setIsSaving(false);
    }, 300);
  };

  const handleDelete = (id: string) => {
    persist(videos.filter((v) => v.id !== id));
    toast.success('Video removed');
  };

  const filteredVideos = videos.filter((v) => {
    const matchSearch = searchQuery === '' ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'all' || v.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const allCategories = [...new Set(videos.map((v) => v.category))];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              Self-Help Videos
            </h1>
            <p className="text-muted-foreground">Manage educational videos shown to clients</p>
          </div>
          <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videos.length}</p>
                <p className="text-xs text-muted-foreground">Total Videos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videos.reduce((s, v) => s + v.views, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <ThumbsUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videos.reduce((s, v) => s + v.likes, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos, workflows, or categories..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No videos found. Add your first video.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => {
              const ytId = extractYouTubeId(video.youtubeUrl);
              const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

              return (
                <Card key={video.id} className="overflow-hidden group">
                  <div
                    className="aspect-video bg-muted relative flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => setPreviewVideo(video)}
                  >
                    {thumbnail ? (
                      <img src={thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <Youtube className="h-12 w-12 text-muted-foreground opacity-40" />
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-black ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{video.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{video.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-1">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{video.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{video.likes}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{video.category}</Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(video)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add / Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
              <DialogDescription>
                {editingVideo ? 'Update the video details.' : 'Add a YouTube video to the self-help library for clients.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="e.g., Getting Started with Xetihub"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube URL *</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                />
                {form.youtubeUrl && !extractYouTubeId(form.youtubeUrl) && (
                  <p className="text-xs text-destructive">Please enter a valid YouTube URL</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Short description of the video content..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="300"
                    value={form.duration || ''}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? 'Saving...' : (editingVideo ? 'Save Changes' : 'Add Video')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
            {previewVideo && (() => {
              const ytId = extractYouTubeId(previewVideo.youtubeUrl);
              return (
                <>
                  <div className="aspect-video bg-black">
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title={previewVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        Unable to load video
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{previewVideo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{previewVideo.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{previewVideo.category}</Badge>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{previewVideo.views.toLocaleString()} views</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(previewVideo.duration)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

