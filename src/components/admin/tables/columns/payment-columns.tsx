"use client";

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

type Payment = {
  id?: string | number;
  user?: string;
  amount?: string;
  method?: string;
  status?: string;
  date?: string;
};

export const paymentColumns: Array<{
  header: string;
  accessor?: keyof Payment;
  render?: (row: Payment) => React.ReactNode;
  width?: string;
}> = [
  { header: 'User', accessor: 'user' },
  { header: 'Amount', accessor: 'amount' },
  { header: 'Method', accessor: 'method' },
  {
    header: 'Status',
    render: (row: Payment) => (
      <Badge variant={row.status === 'Completed' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
  { header: 'Date', accessor: 'date' },
];

export type { Payment };
