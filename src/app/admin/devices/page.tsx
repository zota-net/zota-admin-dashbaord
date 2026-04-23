'use client';

import { useState } from 'react';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { deviceColumns } from '@/components/admin/tables/columns/device-columns';
import { DeviceManagementDialog } from '@/components/admin/dialogs/device-management-dialog';

export default function DevicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState([
    {
      id: 'DEV001',
      name: 'Router-01',
      type: 'Network Device',
      owner: 'John Doe',
      status: 'Online',
      lastSeen: '2024-04-20 10:30',
      bandwidth: '250 Mbps',
    },
    {
      id: 'DEV002',
      name: 'Router-02',
      type: 'Network Device',
      owner: 'Jane Smith',
      status: 'Offline',
      lastSeen: '2024-04-19 15:45',
      bandwidth: '100 Mbps',
    },
  ]);

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Devices Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor, block, and manage network devices
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Devices</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search devices..."
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
              Add Device
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={deviceColumns} data={filteredDevices} />
        </CardContent>
      </Card>

      <DeviceManagementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
