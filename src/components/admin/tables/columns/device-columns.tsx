"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Device = {
  id: string;
  name: string;
  type: string;
  owner: string;
  status: string;
  lastSeen: string;
  bandwidth: string;
};

export const deviceColumns: Array<{
  header: string;
  accessor?: keyof Device;
  render?: (row: Device) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Name', accessor: 'name' },
  { header: 'Type', accessor: 'type' },
  { header: 'Owner', accessor: 'owner' },
  {
    header: 'Status',
    accessor: 'status',
    render: (row: Device) => (
      <Badge variant={row.status === 'Online' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  { header: 'Last Seen', accessor: 'lastSeen' },
  { header: 'Bandwidth', accessor: 'bandwidth' },
];

export type { Device };