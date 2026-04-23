"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type User = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  joinDate?: string;
  devices?: number;
};

export const userColumns: Array<{
  header: string;
  accessor?: keyof User;
  render?: (row: User) => React.ReactNode;
  width?: string;
}> = [
  {
    header: 'Name',
    render: (row: User) => (
      <div className="flex items-center gap-2">
        <Avatar>
          {row.name ? (
            <AvatarImage src={"/"} alt={row.name} />
          ) : (
            <AvatarFallback>{row.name?.[0]}</AvatarFallback>
          )}
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
    header: 'Role',
    render: (row: User) => <Badge variant="secondary">{row.role}</Badge>,
  },
  {
    header: 'Status',
    render: (row: User) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'destructive'}>
        {row.status}
      </Badge>
    ),
  },
  {
    header: 'Devices',
    accessor: 'devices',
  },
  {
    header: 'Joined',
    accessor: 'joinDate',
  },
];

export type { User };
