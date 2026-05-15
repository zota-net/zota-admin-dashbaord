'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, Info, CheckCircle, XCircle, Users, Headphones, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clientsService, supportService } from '@/lib/api';
import type { Client, SupportTicket } from '@/lib/api/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface AlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
  timestamp: string;
}

const severityConfig = {
  critical: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', badge: 'destructive' as const },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-500/10 border-yellow-500/20', badge: 'default' as const },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20', badge: 'secondary' as const },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const [clientList, ticketData] = await Promise.all([
        clientsService.getAll(),
        supportService.getAll({ limit: 200 }).catch(() => ({ data: [] })),
      ]);

      const tickets: SupportTicket[] = Array.isArray(ticketData?.data) ? ticketData.data :
        Array.isArray(ticketData) ? ticketData as SupportTicket[] : [];

      const derived: AlertItem[] = [];

      // Suspended clients
      const suspended = clientList.filter(c => c.status === 'Suspended');
      if (suspended.length > 0) {
        derived.push({
          id: 'suspended-clients',
          severity: 'critical',
          category: 'Clients',
          title: `${suspended.length} client${suspended.length > 1 ? 's' : ''} suspended`,
          description: suspended.map(c => c.businessName).join(', '),
          action: { label: 'View Clients', href: '/admin/clients' },
          timestamp: new Date().toISOString(),
        });
      }

      // Pending (new) clients awaiting review
      const pending = clientList.filter(c => c.status === 'Pending');
      if (pending.length > 0) {
        derived.push({
          id: 'pending-clients',
          severity: 'warning',
          category: 'Clients',
          title: `${pending.length} client${pending.length > 1 ? 's' : ''} pending activation`,
          description: `New registrations awaiting review: ${pending.map(c => c.businessName).join(', ')}`,
          action: { label: 'Review Clients', href: '/admin/clients' },
          timestamp: new Date().toISOString(),
        });
      }

      // Inactive clients
      const inactive = clientList.filter(c => c.status === 'InActive');
      if (inactive.length > 0) {
        derived.push({
          id: 'inactive-clients',
          severity: 'info',
          category: 'Clients',
          title: `${inactive.length} inactive client${inactive.length > 1 ? 's' : ''}`,
          description: `These accounts are deactivated: ${inactive.map(c => c.businessName).join(', ')}`,
          action: { label: 'View Clients', href: '/admin/clients' },
          timestamp: new Date().toISOString(),
        });
      }

      // Open high/urgent tickets
      const urgentTickets = tickets.filter(t => t.status === 'open' && (t.priority === 'urgent' || t.priority === 'high'));
      if (urgentTickets.length > 0) {
        derived.push({
          id: 'urgent-tickets',
          severity: 'critical',
          category: 'Support',
          title: `${urgentTickets.length} high-priority ticket${urgentTickets.length > 1 ? 's' : ''} open`,
          description: `Subjects: ${urgentTickets.slice(0, 3).map(t => t.subject).join(' · ')}${urgentTickets.length > 3 ? ` and ${urgentTickets.length - 3} more` : ''}`,
          action: { label: 'Open Support', href: '/admin/support' },
          timestamp: urgentTickets[0]?.updatedAt ?? new Date().toISOString(),
        });
      }

      // Open medium/low tickets
      const openTickets = tickets.filter(t => t.status === 'open' && (t.priority === 'medium' || t.priority === 'low'));
      if (openTickets.length > 0) {
        derived.push({
          id: 'open-tickets',
          severity: 'warning',
          category: 'Support',
          title: `${openTickets.length} open support ticket${openTickets.length > 1 ? 's' : ''}`,
          description: 'Standard priority tickets awaiting first response.',
          action: { label: 'View Support Queue', href: '/admin/support' },
          timestamp: new Date().toISOString(),
        });
      }

      // In-progress tickets
      const inProgress = tickets.filter(t => t.status === 'in-progress');
      if (inProgress.length > 0) {
        derived.push({
          id: 'inprogress-tickets',
          severity: 'info',
          category: 'Support',
          title: `${inProgress.length} ticket${inProgress.length > 1 ? 's' : ''} in progress`,
          description: 'These tickets are currently being handled.',
          action: { label: 'View Support', href: '/admin/support' },
          timestamp: new Date().toISOString(),
        });
      }

      // All clear
      if (derived.length === 0) {
        derived.push({
          id: 'all-clear',
          severity: 'info',
          category: 'System',
          title: 'All systems nominal',
          description: `Platform is operating normally. ${clientList.filter(c => c.status === 'Active').length} active clients, ${tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length} open support threads.`,
          timestamp: new Date().toISOString(),
        });
      }

      setAlerts(derived);
    } catch { toast.error('Failed to derive alerts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = alerts.filter(a => !dismissed.has(a.id));

  const counts = {
    critical: visible.filter(a => a.severity === 'critical').length,
    warning: visible.filter(a => a.severity === 'warning').length,
    info: visible.filter(a => a.severity === 'info').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground mt-1">Platform alerts derived from live client and support data</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Critical', value: counts.critical, color: 'text-destructive' },
          { label: 'Warnings', value: counts.warning, color: 'text-yellow-600' },
          { label: 'Info', value: counts.info, color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <CheckCircle className="w-10 h-10 text-green-500" />
          <p className="font-medium">All alerts dismissed</p>
          <Button variant="outline" size="sm" onClick={() => setDismissed(new Set())}>Reset</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {['critical', 'warning', 'info'].map(sev =>
            visible.filter(a => a.severity === sev).map(alert => {
              const cfg = severityConfig[alert.severity];
              const Icon = cfg.icon;
              return (
                <Card key={alert.id} className={`border ${cfg.bg}`}>
                  <CardContent className="flex items-start gap-4 pt-5 pb-5">
                    <div className="shrink-0 mt-0.5">
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={cfg.badge} className="text-xs">{alert.severity.toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-xs">{alert.category}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                      <div className="flex gap-2 mt-3">
                        {alert.action && (
                          <Link href={alert.action.href}>
                            <Button size="sm" variant="outline" className="h-7 text-xs">{alert.action.label}</Button>
                          </Link>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setDismissed(d => new Set([...d, alert.id]))}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
