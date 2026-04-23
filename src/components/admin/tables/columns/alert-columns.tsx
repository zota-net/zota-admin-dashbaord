"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Alert = {
  id?: string | number;
  message?: string;
  level?: string;
  status?: string;
  createdAt?: string;
};

export const alertColumns: Array<{
  header: string;
  accessor?: keyof Alert;
  render?: (row: Alert) => React.ReactNode;
  width?: string;
}> = [
  {
    header: 'Message',
    render: (row: Alert) => (
      <div className="truncate max-w-xs">{row.message}</div>
    ),
  },
  {
    header: 'Level',
    render: (row: Alert) => (
      <Badge variant={row.level === 'critical' ? 'destructive' : 'secondary'}>
        {row.level}
      </Badge>
    ),
  },
  {
    header: 'Status',
    render: (row: Alert) => (
      <Badge variant={row.status === 'Open' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  { header: 'Created', accessor: 'createdAt' },
];

export type { Alert };
