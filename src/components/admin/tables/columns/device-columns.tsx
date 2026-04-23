"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Device = {
  id?: string | number;
  name?: string;
  mac?: string;
  ip?: string;
  owner?: string;
  status?: string;
  lastSeen?: string;
};

export const deviceColumns: Array<{
  header: string;
  accessor?: keyof Device;
  render?: (row: Device) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Name', accessor: 'name' },
  { header: 'MAC', accessor: 'mac' },
  { header: 'IP', accessor: 'ip' },
  { header: 'Owner', accessor: 'owner' },
  {
    header: 'Status',
    render: (row: Device) => (
      <Badge variant={row.status === 'Online' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  { header: 'Last Seen', accessor: 'lastSeen' },
];

export type { Device };
