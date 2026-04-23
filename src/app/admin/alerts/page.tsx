'use client';

import { useState } from 'react';
import { Search, Download, Filter, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { alertColumns } from '@/components/admin/tables/columns/alert-columns';

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([
    {
      id: 'ALERT001',
      type: 'Security',
      severity: 'High',
      message: 'Suspicious login activity detected',
      timestamp: '2024-04-20 14:30',
      status: 'Unresolved',
    },
    {
      id: 'ALERT002',
      type: 'System',
      severity: 'Medium',
      message: 'Database backup failed',
      timestamp: '2024-04-20 12:15',
      status: 'Resolved',
    },
  ]);

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage system-wide alerts and notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Alerts
          </CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search alerts..."
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
          <DataTable columns={alertColumns} data={filteredAlerts} />
        </CardContent>
      </Card>
    </div>
  );
}
