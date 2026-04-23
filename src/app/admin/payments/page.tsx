'use client';

import { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { paymentColumns } from '@/components/admin/tables/columns/payment-columns';

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState([
    {
      id: 'PAY001',
      date: '2024-04-20',
      user: 'John Doe',
      amount: '$99.99',
      package: 'Professional Plan',
      status: 'Completed',
      method: 'Credit Card',
    },
    {
      id: 'PAY002',
      date: '2024-04-19',
      user: 'Jane Smith',
      amount: '$29.99',
      package: 'Basic Plan',
      status: 'Completed',
      method: 'Bank Transfer',
    },
  ]);

  const filteredPayments = payments.filter(
    (payment) =>
      payment.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor, track, and reconcile payments and transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={paymentColumns} data={filteredPayments} />
        </CardContent>
      </Card>
    </div>
  );
}
