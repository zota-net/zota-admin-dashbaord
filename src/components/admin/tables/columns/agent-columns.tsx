"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Agent = {
  id?: string | number;
  name?: string;
  email?: string;
  status?: string;
  revenue?: string;
  clients?: number;
  joinDate?: string;
  rating?: number;
};

export const agentColumns: Array<{
  header: string;
  accessor?: keyof Agent;
  render?: (row: Agent) => React.ReactNode;
  width?: string;
}> = [
  {
    header: 'Name',
    render: (row: Agent) => (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>{row.name?.[0] ?? 'A'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.name}</span>
          <span className="text-sm text-muted-foreground">{row.email}</span>
        </div>
      </div>
    ),
  },
  {
    header: 'Email',
    accessor: 'email',
  },
  {
    header: 'Revenue',
    accessor: 'revenue',
  },
  {
    header: 'Clients',
    accessor: 'clients',
  },
  {
    header: 'Rating',
    render: (row: Agent) => (
      <span className="font-medium">{row.rating ?? '-'}</span>
    ),
  },
  {
    header: 'Status',
    render: (row: Agent) => (
      <Badge variant={row.status === 'Approved' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Joined',
    accessor: 'joinDate',
  },
];

export type { Agent };
