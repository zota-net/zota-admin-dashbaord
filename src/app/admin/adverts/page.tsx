'use client';

import { useState } from 'react';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { advertColumns } from '@/components/admin/tables/columns/advert-columns';
import { AdvertModerationDialog } from '@/components/admin/dialogs/advert-moderation-dialog';

export default function AdvertsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adverts, setAdverts] = useState([
    {
      id: 'AD001',
      title: 'Summer Promotion',
      advertiser: 'Agent Alpha',
      status: 'Pending Review',
      createdDate: '2024-04-18',
      views: 1234,
      clicks: 89,
    },
    {
      id: 'AD002',
      title: 'Network Upgrade',
      advertiser: 'Agent Beta',
      status: 'Approved',
      createdDate: '2024-04-15',
      views: 5234,
      clicks: 324,
    },
  ]);

  const filteredAdverts = adverts.filter(
    (advert) =>
      advert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advert.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adverts Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review, approve, and manage advertisements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Adverts</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search adverts..."
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
          <DataTable columns={advertColumns} data={filteredAdverts} />
        </CardContent>
      </Card>

      <AdvertModerationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
