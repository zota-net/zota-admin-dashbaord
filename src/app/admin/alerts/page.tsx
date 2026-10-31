'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, Headphones, CircleAlert, ShieldAlert, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, StatsCard, ErrorState } from '@/components/admin';
import { clientsService, supportService } from '@/lib/api';
import type { Client, SupportTicket } from '@/lib/api/types';
import { useAsync } from '@/lib/use-async';
import { cn } from '@/lib/utils';

interface DerivedAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  href?: string;
}

const severityStyle: Record<DerivedAlert['severity'], string> = {
  critical: 'border-destructive/30 bg-destructive/5',
  warning: 'border-yellow-500/30 bg-yellow-500/5',
  info: 'border-border bg-card',
};

const severityIcon: Record<DerivedAlert['severity'], React.ComponentType<{ className?: string }>> = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

export default function AlertsPage() {
  const clients = useAsync<Client[]>(() => clientsService.getAll(), []);
  const tickets = useAsync<SupportTicket[]>(
    () =>
      supportService
        .getAll({ limit: 500 })
        .then((r) => {
          const data = r?.data ?? r;
          return Array.isArray(data) ? (data as SupportTicket[]) : data?.tickets ?? [];
        })
        .catch(() => [] as SupportTicket[]),
    []
  );

  const alerts = useMemo<DerivedAlert[]>(() => {
    const list: DerivedAlert[] = [];
    const cs = clients.data ?? [];
    const ts = tickets.data ?? [];

    const pending = cs.filter((c) => c.status === 'Pending');
    if (pending.length > 0) {
      list.push({
        id: 'pending-clients',
        severity: 'warning',
        title: `${pending.length} client${pending.length > 1 ? 's' : ''} awaiting activation`,
        description: pending.map((c) => c.businessName).join(', '),
        href: '/admin/clients',
      });
    }

    const suspended = cs.filter((c) => c.status === 'Suspended' || c.status === 'InActive');
    if (suspended.length > 0) {
      list.push({
        id: 'suspended-clients',
        severity: 'info',
        title: `${suspended.length} suspended/inactive client account${suspended.length > 1 ? 's' : ''}`,
        description: suspended.map((c) => c.businessName).join(', '),
        href: '/admin/clients',
      });
    }

    const urgent = ts.filter((t) => ['open', 'in-progress'].includes(t.status) && ['urgent', 'high'].includes(t.priority));
    if (urgent.length > 0) {
      list.push({
        id: 'urgent-tickets',
        severity: 'critical',
        title: `${urgent.length} urgent/high priority open ticket${urgent.length > 1 ? 's' : ''}`,
        description: urgent.slice(0, 5).map((t) => t.subject).join(' · '),
        href: '/admin/support',
      });
    }

    const open = ts.filter((t) => t.status === 'open');
    if (open.length > 0) {
      list.push({
        id: 'open-tickets',
        severity: 'warning',
        title: `${open.length} unhandled support ticket${open.length > 1 ? 's' : ''}`,
        description: 'Open tickets awaiting first response from the support team.',
        href: '/admin/support',
      });
    }

    return list;
  }, [clients.data, tickets.data]);

  const criticals = alerts.filter((a) => a.severity === 'critical').length;
  const warnings = alerts.filter((a) => a.severity === 'warning').length;

  if (clients.error) {
    return (
      <>
        <PageHeader title="Alerts" description="Derived platform health signals" />
        <ErrorState message={clients.error} onRetry={clients.refresh} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Alerts" description="Live platform signals derived from client and ticket state" />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Critical" value={criticals} icon={ShieldAlert} variant={criticals > 0 ? 'danger' : 'default'} />
        <StatsCard title="Warnings" value={warnings} icon={AlertTriangle} variant={warnings > 0 ? 'warning' : 'default'} />
        <StatsCard title="Signals" value={alerts.length} icon={CircleAlert} variant="primary" />
      </div>

      {alerts.length === 0 && !clients.isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground">
            <CircleAlert className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">All clear — no active alerts on the platform</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((a) => {
            const Icon = severityIcon[a.severity];
            return (
              <Card key={a.id} className={cn('py-0', severityStyle[a.severity])}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">
                    <Icon className={cn('h-5 w-5', a.severity === 'critical' ? 'text-destructive' : a.severity === 'warning' ? 'text-yellow-500' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <Badge variant={a.severity === 'critical' ? 'destructive' : 'outline'} className="text-[10px] ml-auto shrink-0">
                        {a.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                    {a.href && (
                      <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                        <Link href={a.href}>Take action</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-4 w-4" />
        Alerts refresh automatically on page load and retry actions.
        <Button variant="ghost" size="sm" className="h-7 ml-auto" onClick={() => { clients.refresh(); tickets.refresh(); }}>
          <Headphones className="h-3.5 w-3.5 mr-1" />Refresh signals
        </Button>
      </div>
    </>
  );
}
