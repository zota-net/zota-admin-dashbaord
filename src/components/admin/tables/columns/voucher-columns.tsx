"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Voucher = {
  id: string;
  code: string;
  discountType: string;
  discount: string;
  validFrom: string;
  validUntil: string;
  usages: number;
  limit: number;
  status: string;
};

export const voucherColumns: Array<{
  header: string;
  accessor?: keyof Voucher;
  render?: (row: Voucher) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Code', accessor: 'code' },
  { header: 'Discount Type', accessor: 'discountType' },
  { header: 'Discount', accessor: 'discount' },
  { header: 'Valid From', accessor: 'validFrom' },
  { header: 'Valid Until', accessor: 'validUntil' },
  { header: 'Usages', accessor: 'usages' },
  { header: 'Limit', accessor: 'limit' },
  {
    header: 'Status',
    accessor: 'status',
    render: (row: Voucher) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];

export type { Voucher };