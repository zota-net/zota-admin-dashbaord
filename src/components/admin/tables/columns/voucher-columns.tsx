"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Voucher = {
  id?: string | number;
  code?: string;
  name?: string;
  amount?: string;
  expiry?: string;
  status?: string;
};

export const voucherColumns: Array<{
  header: string;
  accessor?: keyof Voucher;
  render?: (row: Voucher) => React.ReactNode;
  width?: string;
}> = [
  { header: 'Code', accessor: 'code' },
  { header: 'Name', accessor: 'name' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Expiry', accessor: 'expiry' },
  {
    header: 'Status',
    render: (row: Voucher) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];

export type { Voucher };
