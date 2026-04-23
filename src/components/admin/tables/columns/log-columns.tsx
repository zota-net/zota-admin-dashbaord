"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Log = {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  resource: string;
  status: string;
};

export const logColumns: Array<{
  header: string;
  accessor?: keyof Log;
  render?: (row: Log) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Timestamp', accessor: 'timestamp' },
  { header: 'Action', accessor: 'action' },
  { header: 'User', accessor: 'user' },
  { header: 'Resource', accessor: 'resource' },
  {
    header: 'Status',
    accessor: 'status',
    render: (row: Log) => (
      <Badge variant={row.status === 'Success' ? 'default' : 'destructive'}>
        {row.status}
      </Badge>
    ),
  },
];

export type { Log };