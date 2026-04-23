"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Log = {
  id?: string | number;
  level?: string;
  message?: string;
  timestamp?: string;
};

export const logColumns: Array<{
  header: string;
  accessor?: keyof Log;
  render?: (row: Log) => React.ReactNode;
  width?: string;
}> = [
  {
    header: 'Level',
    render: (row: Log) => (
      <Badge variant={row.level === 'error' ? 'destructive' : 'secondary'}>
        {row.level}
      </Badge>
    ),
  },
  {
    header: 'Message',
    render: (row: Log) => <div className="truncate max-w-xs">{row.message}</div>,
  },
  { header: 'Time', accessor: 'timestamp' },
];

export type { Log };
