'use client';

import { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { logColumns } from '@/components/admin/tables/columns/log-columns';

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([
    {
      id: 'LOG001',
      timestamp: '2024-04-20 15:42:30',
      action: 'User Login',
      user: 'john@example.com',
      resource: 'User Dashboard',
      status: 'Success',
    },
    {
      id: 'LOG002',
      timestamp: '2024-04-20 15:40:15',
      action: 'Package Updated',
      user: 'admin@example.com',
      resource: 'Professional Plan',
      status: 'Success',
    },
  ]);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground mt-2">
          View audit trail and system activity logs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search logs..."
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
          <DataTable columns={logColumns} data={filteredLogs} />
        </CardContent>
      </Card>
    </div>
  );
}
