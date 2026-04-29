'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Headphones,
  MessageSquare,
  Search,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';

interface TicketMessage {
  id: string;
  sender: 'client' | 'agent' | 'system';
  senderName: string;
  content: string;
  sentAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  tags: string[];
  messages: TicketMessage[];
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketTab, setSelectedTicketTab] = useState('overview');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: 'TKT-1000',
        subject: 'Unable to create vouchers',
        description: 'The client can access the voucher page but every create action fails after filling in quantity and package details.',
        clientId: 'client-001',
        clientName: 'TechNet Solutions',
        clientEmail: 'admin@technet.com',
        status: 'open',
        priority: 'high',
        category: 'Vouchers',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T11:05:00Z',
        assignedAgent: 'Sarah Chen',
        tags: ['voucher', 'creation'],
        messages: [
          {
            id: 'msg-1000-1',
            sender: 'client',
            senderName: 'TechNet Solutions',
            content: 'We are unable to generate vouchers for today. The page loads, but the submit button keeps failing.',
            sentAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 'msg-1000-2',
            sender: 'agent',
            senderName: 'Sarah Chen',
            content: 'Thanks, we are checking the voucher workflow now. Please keep the affected package selected for us.',
            sentAt: '2024-01-15T11:05:00Z',
          },
        ],
      },
      {
        id: 'TKT-1001',
        subject: 'Router offline for 2 days',
        description: 'The customer says the router has been offline since the weekend and remote checks are timing out.',
        clientId: 'client-002',
        clientName: 'FastConnect Cafe',
        clientEmail: 'info@fastconnect.ug',
        status: 'pending',
        priority: 'urgent',
        category: 'Devices',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
        assignedAgent: 'Mike Johnson',
        tags: ['router', 'outage'],
        messages: [
          {
            id: 'msg-1001-1',
            sender: 'client',
            senderName: 'FastConnect Cafe',
            content: 'The router has been unreachable for two days and users cannot connect.',
            sentAt: '2024-01-14T14:20:00Z',
          },
          {
            id: 'msg-1001-2',
            sender: 'agent',
            senderName: 'Mike Johnson',
            content: 'We need a quick power-cycle confirmation from your side while we review logs.',
            sentAt: '2024-01-15T09:00:00Z',
          },
        ],
      },
      {
        id: 'TKT-1002',
        subject: 'Payment not received',
        description: 'A payment was initiated by the client but it has not shown up in wallet transactions.',
        clientId: 'client-003',
        clientName: 'SkyNet Wireless',
        clientEmail: 'support@skynet.ug',
        status: 'resolved',
        priority: 'medium',
        category: 'Payments',
        createdAt: '2024-01-13T08:15:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        assignedAgent: 'Emily Davis',
        tags: ['payment', 'wallet'],
        messages: [
          {
            id: 'msg-1002-1',
            sender: 'client',
            senderName: 'SkyNet Wireless',
            content: 'We have a missing wallet deposit from this morning.',
            sentAt: '2024-01-13T08:15:00Z',
          },
          {
            id: 'msg-1002-2',
            sender: 'agent',
            senderName: 'Emily Davis',
            content: 'The transaction has now been reconciled and the wallet balance is updated.',
            sentAt: '2024-01-14T16:45:00Z',
          },
        ],
      },
      {
        id: 'TKT-1003',
        subject: 'How to set up hotspot?',
        description: 'Client wants guidance on hotspot onboarding and package assignment for a new location.',
        clientId: 'client-004',
        clientName: 'GuestHouse Plus',
        clientEmail: 'manager@guesthouse.com',
        status: 'closed',
        priority: 'low',
        category: 'General',
        createdAt: '2024-01-12T11:00:00Z',
        updatedAt: '2024-01-13T10:30:00Z',
        assignedAgent: 'Support Team',
        tags: ['setup', 'hotspot'],
        messages: [
          {
            id: 'msg-1003-1',
            sender: 'client',
            senderName: 'GuestHouse Plus',
            content: 'Please guide us on setting up hotspot access for guests.',
            sentAt: '2024-01-12T11:00:00Z',
          },
          {
            id: 'msg-1003-2',
            sender: 'agent',
            senderName: 'Support Team',
            content: 'We shared the setup flow and walkthrough video. Reaching back out if anything else is needed.',
            sentAt: '2024-01-13T10:30:00Z',
          },
        ],
      },
    ];

    setTickets(mockTickets);
    setIsLoading(false);
  }, []);

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const matchesSearch =
          searchQuery === '' ||
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [priorityFilter, searchQuery, statusFilter, tickets]
  );

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600';
      case 'resolved':
        return 'bg-primary/10 text-primary';
      case 'closed':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-600';
      case 'high':
        return 'bg-orange-500/10 text-orange-600';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const statusCounts = {
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    pending: tickets.filter((ticket) => ticket.status === 'pending').length,
    resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
    closed: tickets.filter((ticket) => ticket.status === 'closed').length,
  };

  const openTicket = (ticket: Ticket, tab: 'overview' | 'chat' = 'overview') => {
    setSelectedTicket(ticket);
    setSelectedTicketTab(tab);
    setReplyMessage('');
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) {
      return;
    }

    const sentAt = new Date().toISOString();
    const message: TicketMessage = {
      id: `msg-${selectedTicket.id}-${Date.now()}`,
      sender: 'agent',
      senderName: selectedTicket.assignedAgent || 'Support Team',
      content: replyMessage.trim(),
      sentAt,
    };

    const updatedTicket = {
      ...selectedTicket,
      updatedAt: sentAt,
      messages: [...selectedTicket.messages, message],
    };

    setTickets((currentTickets) =>
      currentTickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
    );
    setSelectedTicket(updatedTicket);
    setReplyMessage('');
  };

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
                <Badge className="border-0 bg-primary/10 text-primary">Support desk</Badge>
                <Badge variant="outline">In-app chat workflow</Badge>
              </div>
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold tracking-tight">Move from ticket intake to response without leaving the workspace.</h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Support tickets, account context, and the active chat room now live together so operators can triage faster and reply with less friction.
                </p>
              </div>
            </div>

            <Card className="rounded-[24px] border-border/70 bg-secondary/40 shadow-none">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
                  Triage Focus
                </CardDescription>
                <CardTitle className="text-xl">Current workload signal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <p className="text-sm font-medium">Urgent network incidents</p>
                  <p className="mt-1 text-sm text-muted-foreground">2 tickets are tagged for same-day action.</p>
                </div>
                <div className="rounded-2xl border bg-card px-4 py-3">
                  <p className="text-sm font-medium">Client waiting responses</p>
                  <p className="mt-1 text-sm text-muted-foreground">Pending tickets need outbound updates before close.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Open</p>
                  <p className="mt-2 text-3xl font-semibold">{statusCounts.open}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Pending</p>
                  <p className="mt-2 text-3xl font-semibold">{statusCounts.pending}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Resolved</p>
                  <p className="mt-2 text-3xl font-semibold">{statusCounts.resolved}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Closed</p>
                  <p className="mt-2 text-3xl font-semibold">{statusCounts.closed}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <XCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        <Card className="rounded-[24px] border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Headphones className="h-5 w-5" />
              Ticket Queue
            </CardTitle>
            <CardDescription>
              Search, filter, and jump directly into ticket details or the support chat room.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket, client, or subject..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center rounded-2xl border py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border py-16 text-muted-foreground">
                <MessageSquare className="mb-4 h-12 w-12 opacity-50" />
                <p>No tickets match the current filters.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/40" onClick={() => openTicket(ticket)}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{ticket.subject}</span>
                            <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{ticket.clientName}</span>
                            <span className="text-xs text-muted-foreground">{ticket.clientEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(parseISO(ticket.updatedAt), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                Actions
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  openTicket(ticket, 'overview');
                                }}
                              >
                                <Search className="mr-2 h-4 w-4" />
                                View Ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  openTicket(ticket, 'chat');
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Open Chat Room
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedTicket}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTicket(null);
              setSelectedTicketTab('overview');
              setReplyMessage('');
            }
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            {selectedTicket ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex flex-wrap items-center gap-2">
                    <span>{selectedTicket.subject}</span>
                    <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTicket.id} for {selectedTicket.clientName}
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={selectedTicketTab} onValueChange={setSelectedTicketTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Ticket Details</TabsTrigger>
                    <TabsTrigger value="chat">Support Chat</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                      <Card className="rounded-2xl">
                        <CardContent className="flex flex-col gap-5 p-5">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Client</p>
                            <div className="mt-3 flex items-start gap-3">
                              <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{selectedTicket.clientName}</p>
                                <p className="text-sm text-muted-foreground">{selectedTicket.clientEmail}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Description</p>
                            <p className="mt-3 text-sm leading-6 text-foreground/90">{selectedTicket.description}</p>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Category</p>
                              <p className="mt-2 font-medium">{selectedTicket.category}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Assigned</p>
                              <p className="mt-2 font-medium">{selectedTicket.assignedAgent || 'Unassigned'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Created</p>
                              <p className="mt-2 font-medium">{format(parseISO(selectedTicket.createdAt), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
                              <p className="mt-2 font-medium">{format(parseISO(selectedTicket.updatedAt), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {selectedTicket.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl">
                        <CardHeader>
                          <CardTitle className="text-lg">Conversation Preview</CardTitle>
                          <CardDescription>{selectedTicket.messages.length} messages on record</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                          {selectedTicket.messages.map((message) => (
                            <div key={message.id} className="rounded-2xl border bg-secondary/30 p-4">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">{message.senderName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(message.sentAt), 'MMM d, h:mm a')}
                                </p>
                              </div>
                              <p className="text-sm text-foreground/90">{message.content}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="chat" className="mt-4">
                    <Card className="rounded-2xl">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Support Chat Room</CardTitle>
                          <CardDescription>Reply directly inside the ticket workspace.</CardDescription>
                        </div>
                        <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border bg-secondary/20 p-4">
                          {selectedTicket.messages.map((message) => {
                            const isAgent = message.sender === 'agent';

                            return (
                              <div key={message.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    isAgent
                                      ? 'bg-primary text-primary-foreground'
                                      : message.sender === 'system'
                                        ? 'bg-secondary text-secondary-foreground'
                                        : 'bg-card text-foreground'
                                  }`}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3 text-xs opacity-80">
                                    <span>{message.senderName}</span>
                                    <span>{format(parseISO(message.sentAt), 'MMM d, h:mm a')}</span>
                                  </div>
                                  <p className="leading-6">{message.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="rounded-2xl border bg-secondary/20 p-4">
                          <div className="flex flex-col gap-3">
                            <Textarea
                              value={replyMessage}
                              onChange={(event) => setReplyMessage(event.target.value)}
                              placeholder="Reply to this client from the in-app support room..."
                              className="min-h-[120px]"
                            />
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs text-muted-foreground">
                                Replies stay attached to this ticket so the full history remains visible to operators.
                              </p>
                              <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                                Send Reply
                                <Send className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedTicketTab('overview')}>
                    Ticket Details
                  </Button>
                  <Button onClick={() => setSelectedTicketTab('chat')}>
                    Open Chat Room
                    <MessageSquare className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
