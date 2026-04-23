'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function SystemHealthCard() {
  const services = [
    { name: 'API Server', status: 'healthy' },
    { name: 'Database', status: 'healthy' },
    { name: 'Cache Service', status: 'healthy' },
    { name: 'Email Service', status: 'warning' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between">
            <span className="text-sm font-medium">{service.name}</span>
            <div className="flex items-center gap-2">
              {service.status === 'healthy' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Healthy</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-600">Warning</span>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
