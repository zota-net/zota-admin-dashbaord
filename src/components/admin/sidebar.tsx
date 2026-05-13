'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  Headphones,
  Home,
  Image as ImageIcon,
  Menu,
  Settings,
  Users,
  Video,
  Wallet,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Executive Dashboard', href: '/admin', icon: Home },
      { label: 'Revenue Control', href: '/admin/revenue', icon: ArrowUpRight },
      { label: 'Clients', href: '/admin/clients', icon: Users },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Support & Tickets', href: '/admin/support', icon: Headphones, badge: 'Live' },
      { label: 'Self-Help Library', href: '/admin/help', icon: Video },
    ],
  },
  {
    label: 'Vouchers',
    href: '/admin/vouchers',
    icon: Ticket,
  },
  {
    label: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    label: 'Packages',
    href: '/admin/packages',
    icon: Package,
  },
  {
    label: 'Devices',
    href: '/admin/devices',
    icon: BarChart3,
  },
  {
    label: 'Router Scripts',
    href: '/admin/routers',
    icon: Terminal,
  },
  {
    label: 'Support Tickets',
    href: '/admin/support',
    icon: Headphones,
  },
  {
    label: 'Self-Help',
    href: '/admin/help',
    icon: Video,
  },
  {
    label: 'Adverts',
    href: '/admin/adverts',
    icon: ImageIcon,
  },
  {
    label: 'Alerts',
    href: '/admin/alerts',
    icon: AlertCircle,
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: FileText,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[hsl(var(--sidebar-border))] px-5 py-5">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">
              Zota Admin
            </p>
            <p className="truncate text-xs text-slate-400">
              Operations control center
            </p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4">
        <div className="rounded-2xl border border-[hsl(var(--sidebar-border))] bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Workspace
              </p>
              <p className="mt-1 text-sm font-medium text-[hsl(var(--sidebar-foreground))]">
                Kampala Region
              </p>
            </div>
            <Badge className="border-0 bg-emerald-500/15 text-emerald-300">Healthy</Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {group.title}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all',
                        active
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:bg-white/8 hover:text-white'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg transition-colors',
                          active ? 'bg-slate-100 text-slate-900' : 'bg-white/5 text-slate-300'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate font-medium">{item.label}</span>
                        {item.badge ? (
                          <Badge className="border-0 bg-blue-500/15 text-blue-300">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </div>
                      {active ? (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="fixed bottom-5 right-5 z-40 lg:hidden">
        <Button
          size="icon"
          className="size-12 rounded-full shadow-lg"
          onClick={() => setMobileOpen((current) => !current)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden">
          <aside className="h-full w-80 max-w-[88vw] border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] shadow-2xl">
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
