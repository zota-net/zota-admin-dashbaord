'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAdminStore, useAppStore } from '@/lib/store/admin-store';
import { GlobalSearch } from '@/components/global-search';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/admin': {
    title: 'Executive Dashboard',
    subtitle: 'Revenue, client activity, and system posture in one place.',
  },
  '/admin/revenue': {
    title: 'Revenue Control',
    subtitle: 'Track earnings, withdrawals, and fee performance.',
  },
  '/admin/clients': {
    title: 'Client Portfolio',
    subtitle: 'Monitor business accounts, package usage, and account health.',
  },
  '/admin/support': {
    title: 'Support Operations',
    subtitle: 'Handle tickets, live conversations, and follow-up work.',
  },
  '/admin/help': {
    title: 'Help Library',
    subtitle: 'Maintain the self-help content your clients rely on.',
  },
  '/admin/payments': {
    title: 'Payments',
    subtitle: 'Review transactions, exceptions, and settlement flows.',
  },
  '/admin/adverts': {
    title: 'Advert Control',
    subtitle: 'Moderate campaigns and keep the content queue moving.',
  },
  '/admin/alerts': {
    title: 'Alerts',
    subtitle: 'Surface the issues that need operator attention first.',
  },
  '/admin/logs': {
    title: 'System Logs',
    subtitle: 'Audit actions, events, and platform behavior.',
  },
  '/admin/settings': {
    title: 'Settings',
    subtitle: 'Adjust operator, notification, and platform preferences.',
  },
};

export function AdminHeader() {
  const pathname = usePathname();
  const { session, logout } = useAdminStore();
  const { sidebarCollapsed } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const metaEntry = Object.entries(pageMeta).find(([key]) =>
    key === '/admin' ? pathname === '/admin' : pathname.startsWith(key)
  );
  const meta = metaEntry?.[1] ?? {
    title: 'Executive Dashboard',
    subtitle: 'Revenue, client activity, and system posture in one place.',
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-20 border-b border-border/50 bg-background/95 backdrop-blur-md transition-[left] duration-300',
          sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-[280px]'
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex text-xs text-muted-foreground">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Admin workspace
              </Badge>
            </div>
            <h1 className="mt-1.5 truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {meta.title}
            </h1>
            <p className="mt-0.5 hidden text-xs text-muted-foreground md:block">
              {meta.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex h-9 text-muted-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="mr-2 h-3.5 w-3.5" />
              Search
            </Button>

            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 rounded-lg px-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-medium text-foreground leading-none">
                      {session?.admin?.fullname || 'Admin'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                      {session?.admin?.email || 'admin@zota.com'}
                    </p>
                  </div>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col gap-0.5 px-2 py-1.5">
                  <p className="text-sm font-medium">{session?.admin?.fullname || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">
                    {session?.admin?.email || 'admin@zota.com'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
