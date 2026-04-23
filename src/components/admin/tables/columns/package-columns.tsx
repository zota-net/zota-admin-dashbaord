"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Package = {
  id: string;
  name: string;
  price: string;
  bandwidth: string;
  devices: number;
  subscribers: number;
  status: string;
};

export const packageColumns: Array<{
  header: string;
  accessor?: keyof Package;
  render?: (row: Package) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Name', accessor: 'name' },
  { header: 'Price', accessor: 'price' },
  { header: 'Bandwidth', accessor: 'bandwidth' },
  { header: 'Devices', accessor: 'devices' },
  { header: 'Subscribers', accessor: 'subscribers' },
  {
    header: 'Status',
    accessor: 'status',
    render: (row: Package) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];

export type { Package };