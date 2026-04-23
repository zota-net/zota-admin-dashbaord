'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Search,
  Play,
  Clock,
  Eye,
  ThumbsUp,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { format, parseISO } from 'date-fns';

interface HelpVideo {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnail: string;
  category: string;
  duration: number;
  views: number;
  likes: number;
  createdAt: string;
}

export default function SelfHelpPage() {
  const [videos, setVideos] = useState<HelpVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    const mockVideos: HelpVideo[] = [
      {
        id: 'VID-001',
        title: 'Getting Started with Xetihub',
        description: 'Learn how to set up your account and create your first vouchers',
        youtubeUrl: 'https://youtube.com/watch?v=example1',
        thumbnail: '',
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
        youtubeUrl: 'https://youtube.com/watch?v=example2',
        thumbnail: '',
        category: 'Vouchers',
        duration: 480,
        views: 892,
        likes: 67,
        createdAt: '2024-01-12T14:00:00Z',
      },
      {
        id: 'VID-003',
        title: 'Connecting Your MikroTik Router',
        description: 'Step-by-step guide to connecting your router',
        youtubeUrl: 'https://youtube.com/watch?v=example3',
        thumbnail: '',
        category: 'Devices',
        duration: 720,
        views: 654,
        likes: 45,
        createdAt: '2024-01-14T09:00:00Z',
      },
      {
        id: 'VID-004',
        title: 'Setting Up Packages',
        description: 'How to create and configure internet packages',
        youtubeUrl: 'https://youtube.com/watch?v=example4',
        thumbnail: '',
        category: 'Packages',
        duration: 360,
        views: 423,
        likes: 34,
        createdAt: '2024-01-15T11:00:00Z',
      },
      {
        id: 'VID-005',
        title: 'Understanding Reports',
        description: 'How to read and export sales reports',
        youtubeUrl: 'https://youtube.com/watch?v=example5',
        thumbnail: '',
        category: 'Reports',
        duration: 420,
        views: 312,
        likes: 28,
        createdAt: '2024-01-16T15:00:00Z',
      },
    ];

    setVideos(mockVideos);
    setIsLoading(false);
  }, []);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      searchQuery === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(videos.map((v) => v.category))];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Self-Help Videos</h1>
            <p className="text-muted-foreground">Educational videos for clients</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </motion.div>

        {/* Stats */}
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Videos</p>
                    <p className="text-2xl font-bold">{videos.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">
                      {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                    <p className="text-2xl font-bold">
                      {videos.reduce((sum, v) => sum + v.likes, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="h-10 w-[150px] rounded-md border border-input bg-background px-3 py-2"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <StaggerItem key={video.id}>
              <Card className="overflow-hidden">
                <div className="aspect-video bg-muted relative flex items-center justify-center">
                  <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{video.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {video.likes}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {video.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>

        {filteredVideos.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No videos found</p>
            </CardContent>
          </Card>
        )}

        {/* Add Video Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>
                Add a YouTube video to the self-help library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Video title" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Short description" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input id="youtubeUrl" placeholder="https://youtube.com/watch?v=..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g., Getting Started" className="mt-1" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>Add Video</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}