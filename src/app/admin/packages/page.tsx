'use client';

import { useState } from 'react';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { packageColumns } from '@/components/admin/tables/columns/package-columns';
import { PackageManagementDialog } from '@/components/admin/dialogs/package-management-dialog';

export default function PackagesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState([
    {
      id: 'PKG001',
      name: 'Basic Plan',
      price: '$9.99',
      bandwidth: '50 Mbps',
      devices: 3,
      subscribers: 234,
      status: 'Active',
    },
    {
      id: 'PKG002',
      name: 'Professional Plan',
      price: '$29.99',
      bandwidth: '200 Mbps',
      devices: 10,
      subscribers: 89,
      status: 'Active',
    },
  ]);

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Packages Management</h1>
        <p className="text-muted-foreground mt-2">
          Create, edit, and manage service packages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search packages..."
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
              Create Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={packageColumns} data={filteredPackages} />
        </CardContent>
      </Card>

      <PackageManagementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
