"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Package = {
  id?: string | number;
  name?: string;
  price?: string;
  duration?: string;
  status?: string;
};

export const packageColumns: Array<{
  header: string;
  accessor?: keyof Package;
  render?: (row: Package) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Name', accessor: 'name' },
  { header: 'Price', accessor: 'price' },
  { header: 'Duration', accessor: 'duration' },
  {
    header: 'Status',
    render: (row: Package) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];

export type { Package };
