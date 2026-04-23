'use client';

import { useState } from 'react';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { agentColumns } from '@/components/admin/tables/columns/agent-columns';
import { AgentManagementDialog } from '@/components/admin/dialogs/agent-management-dialog';

export default function AgentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Agent Alpha',
      email: 'agent1@example.com',
      status: 'Approved',
      revenue: '$4,500',
      clients: 23,
      joinDate: '2024-01-10',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Agent Beta',
      email: 'agent2@example.com',
      status: 'Pending',
      revenue: '$2,300',
      clients: 12,
      joinDate: '2024-03-05',
      rating: 4.5,
    },
  ]);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agents Management</h1>
        <p className="text-muted-foreground mt-2">
          Approve, monitor, and manage agent accounts and performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <Input
                placeholder="Search agents..."
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
              Add Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={agentColumns} data={filteredAgents} />
        </CardContent>
      </Card>

      <AgentManagementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
