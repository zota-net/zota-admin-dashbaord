'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

const recentActivities: Activity[] = [
  {
    id: '1',
    action: 'User Registered',
    user: 'John Doe',
    timestamp: '2 hours ago',
    details: 'New user account created',
  },
  {
    id: '2',
    action: 'Payment Processed',
    user: 'Jane Smith',
    timestamp: '5 hours ago',
    details: '$99.99 Professional Plan',
  },
  {
    id: '3',
    action: 'Agent Approved',
    user: 'Agent Alpha',
    timestamp: '1 day ago',
    details: 'Agent account verified and approved',
  },
  {
    id: '4',
    action: 'System Alert',
    user: 'System',
    timestamp: '2 days ago',
    details: 'Database backup completed successfully',
  },
];

export function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.user}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.details}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp}
                </p>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
