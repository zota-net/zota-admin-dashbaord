'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Headphones,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  Tag,
  Inbox,
  TicketIcon,
  Send,
  ArrowLeft,
  MoreHorizontal,
  RefreshCw,
  Loader2,
  Settings,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTransition } from '@/components/common';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supportService } from '@/lib/api/services/base-operations';
import { useAdminStore } from '@/lib/store/admin-store';
import type { SupportTicket, TicketMessage } from '@/lib/api/types';

// ─── Local display types ──────────────────────────────────────────────────────

interface Ticket {
  id: string;
  subject: string;
  description: string;
  clientId: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  messages: TicketMessage[];
  createdAt: number;
  updatedAt: number;
}

function normalizeTicket(t: SupportTicket): Ticket {
  return {
    id: String(t.id),
    subject: t.subject,
    description: t.description,
    clientId: String(t.clientId),
    status: t.status,
    priority: t.priority,
    category: t.category,
    assignedTo: t.assignedTo,
    messages: t.messages ?? [],
    createdAt: new Date(t.createdAt).getTime(),
    updatedAt: new Date(t.updatedAt).getTime(),
  };
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Inbox },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  waiting: { label: 'Waiting', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportTicketsPage() {
  const { admin } = useAdminStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await supportService.getAll({ limit: 100 });
      const raw: SupportTicket[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res as unknown as SupportTicket[] : [];
      setTickets(raw.map(normalizeTicket));
    } catch {
      toast.error('Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = searchQuery === '' ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.includes(searchQuery) ||
        t.clientId.includes(searchQuery);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in-progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  }), [tickets]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    const senderName = (admin as any)?.name || (admin as any)?.fullname || 'Admin';
    setIsSendingMessage(true);
    try {
      const updated = await supportService.addMessage(selectedTicket.id, newMessage, senderName, 'agent');
      const normalized = normalizeTicket(updated);
      setTickets((prev) => prev.map((t) => t.id === selectedTicket.id ? normalized : t));
      setSelectedTicket(normalized);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      const updated = await supportService.updateStatus(ticketId, status);
      const normalized = normalizeTicket(updated);
      setTickets((prev) => prev.map((t) => t.id === ticketId ? normalized : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket(normalized);
      toast.success(`Status → ${statusConfig[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return format(new Date(ts), 'MMM d');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground mt-1">Manage all client support requests</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchTickets} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted', Icon: TicketIcon },
            { label: 'Open', value: stats.open, color: 'text-blue-500', bg: 'bg-blue-500/10', Icon: Inbox },
            { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-500', bg: 'bg-yellow-500/10', Icon: Clock },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-500', bg: 'bg-green-500/10', Icon: CheckCircle2 },
            { label: 'Closed', value: stats.closed, color: 'text-gray-500', bg: 'bg-gray-500/10', Icon: XCircle },
          ].map(({ label, value, color, bg, Icon }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', bg)}>
                    <Icon className={cn('h-4 w-4', color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Ticket List */}
          <Card className={cn('lg:col-span-4 flex flex-col h-[540px]', selectedTicket && isMobile && 'hidden')}>
            <CardHeader className="pb-3 shrink-0">
              <CardTitle className="text-base">All Tickets</CardTitle>
              <div className="space-y-2 mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {filteredTickets.map((ticket) => {
                      const si = statusConfig[ticket.status];
                      const pi = priorityConfig[ticket.priority];
                      const unread = ticket.messages.filter((m) => !m.read && m.sender !== 'agent').length;

                      return (
                        <motion.button
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={cn(
                            'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                            selectedTicket?.id === ticket.id && 'bg-primary/5 border-l-2 border-primary'
                          )}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="text-xs bg-muted">
                                {ticket.clientId.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{ticket.subject}</span>
                                {unread > 0 && (
                                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
                                    {unread}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">Client {ticket.clientId}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', si.color)}>
                                  {si.label}
                                </Badge>
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', pi.color)}>
                                  {pi.label}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {formatTime(ticket.updatedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                    {filteredTickets.length === 0 && !isLoading && (
                      <div className="p-8 text-center text-muted-foreground">
                        <TicketIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No tickets found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Chat / Detail */}
          <Card className={cn('lg:col-span-8 flex flex-col h-[540px]', !selectedTicket && isMobile && 'hidden')}>
            {selectedTicket ? (
              <>
                {/* Header */}
                <CardHeader className="pb-3 shrink-0 border-b">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {selectedTicket.clientId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{selectedTicket.subject}</h3>
                        <Badge variant="outline" className={cn('text-xs shrink-0', statusConfig[selectedTicket.status].color)}>
                          {statusConfig[selectedTicket.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>#{selectedTicket.id}</span>
                        <span>•</span>
                        <span>Client {selectedTicket.clientId}</span>
                        <span>•</span>
                        <span>{selectedTicket.category}</span>
                        {selectedTicket.assignedTo && (
                          <>
                            <span>•</span>
                            <span>Assigned to {selectedTicket.assignedTo}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8">
                            <Tag className="h-4 w-4 mr-1" />
                            Status
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleUpdateStatus(selectedTicket.id, key as Ticket['status'])}
                            >
                              <config.icon className="h-4 w-4 mr-2" />
                              {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Chat
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                      {selectedTicket.messages.map((message) => {
                        const isOwn = message.sender === 'agent';

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              {message.sender === 'system' ? (
                                <AvatarFallback className="bg-muted">
                                  <Settings className="h-4 w-4" />
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback className={cn('text-xs', isOwn ? 'bg-primary/10 text-primary' : 'bg-muted')}>
                                  {message.senderName.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className={cn('max-w-[70%] space-y-1', isOwn && 'items-end')}>
                              <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
                                <span className="text-xs font-medium">{message.senderName}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(message.timestamp), 'h:mm a')}
                                </span>
                              </div>
                              <div className={cn(
                                'rounded-2xl px-4 py-2.5 text-sm',
                                isOwn ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                              )}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      {selectedTicket.messages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No messages yet
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Reply */}
                {selectedTicket.status !== 'closed' ? (
                  <div className="p-4 border-t shrink-0">
                    <div className="flex items-end gap-2">
                      <Textarea
                        placeholder="Reply as admin..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                        disabled={isSendingMessage}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSendingMessage}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      >
                        {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Enter to send · Shift+Enter for new line
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border-t shrink-0 text-center text-sm text-muted-foreground">
                    This ticket is closed.
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Select a Ticket</h3>
                <p className="text-sm text-center max-w-sm">
                  Choose a ticket from the list to view the conversation and respond.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

