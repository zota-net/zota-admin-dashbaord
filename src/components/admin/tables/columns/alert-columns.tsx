"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  status: string;
};

export const alertColumns: Array<{
  header: string;
  accessor?: keyof Alert;
  render?: (row: Alert) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Type', accessor: 'type' },
  {
    header: 'Severity',
    accessor: 'severity',
    render: (row: Alert) => (
      <Badge variant={row.severity === 'critical' ? 'destructive' : 'secondary'}>
        {row.severity}
      </Badge>
    ),
  },
  {
    header: 'Message',
    render: (row: Alert) => (
      <div className="truncate max-w-xs">{row.message}</div>
    ),
  },
  { header: 'Timestamp', accessor: 'timestamp' },
  {
    header: 'Status',
    accessor: 'status',
    render: (row: Alert) => (
      <Badge variant={row.status === 'Open' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];

export type { Alert };