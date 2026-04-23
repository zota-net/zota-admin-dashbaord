'use client';

import { useState } from 'react';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { voucherColumns } from '@/components/admin/tables/columns/voucher-columns';
import { VoucherManagementDialog } from '@/components/admin/dialogs/voucher-management-dialog';

export default function VouchersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vouchers, setVouchers] = useState([
    {
      id: 'VOUCH001',
      code: 'SUMMER2024',
      discountType: 'Percentage',
      discount: '20%',
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      usages: 234,
      limit: 500,
      status: 'Active',
    },
    {
      id: 'VOUCH002',
      code: 'WELCOME50',
      discountType: 'Fixed',
      discount: '$50',
      validFrom: '2024-04-01',
      validUntil: '2024-06-30',
      usages: 45,
      limit: 100,
      status: 'Active',
    },
  ]);

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vouchers Management</h1>
        <p className="text-muted-foreground mt-2">
          Create, manage, and track promotional vouchers and redemptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vouchers</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search vouchers..."
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Voucher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={voucherColumns} data={filteredVouchers} />
        </CardContent>
      </Card>

      <VoucherManagementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
