"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Advert = {
  id: string;
  title: string;
  advertiser: string;
  status: string;
  createdDate: string;
  views: number;
  clicks: number;
};

export const advertColumns: Array<{
  header: string;
  accessor?: keyof Advert;
  render?: (row: Advert) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Title', accessor: 'title' },
  { header: 'Advertiser', accessor: 'advertiser' },
  { header: 'Status', accessor: 'status', render: (row: Advert) => (
    <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
      {row.status}
    </Badge>
  )},
  { header: 'Views', accessor: 'views' },
  { header: 'Clicks', accessor: 'clicks' },
];

export type { Advert };