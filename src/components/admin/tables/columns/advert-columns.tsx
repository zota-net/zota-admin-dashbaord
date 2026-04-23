"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Advert = {
  id?: string | number;
  title?: string;
  owner?: string;
  impressions?: number;
  status?: string;
  createdAt?: string;
};

export const advertColumns: Array<{
  header: string;
  accessor?: keyof Advert;
  render?: (row: Advert) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Title', accessor: 'title' },
  { header: 'Owner', accessor: 'owner' },
  { header: 'Impressions', accessor: 'impressions' },
  {
    header: 'Status',
    render: (row: Advert) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  { header: 'Created', accessor: 'createdAt' },
];

export type { Advert };
