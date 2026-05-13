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
import { useAdminStore } from '@/lib/store/admin-store';
import { GlobalSearch } from '@/components/global-search';
import { useState } from 'react';

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
      <header className="fixed inset-x-0 top-0 z-20 border-b border-border/70 bg-white/88 backdrop-blur lg:left-72 dark:bg-slate-950/88">
        <div className="mx-auto flex h-24 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Admin workspace
              </Badge>
            </div>
            <h1 className="mt-2 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {meta.title}
            </h1>
            <p className="mt-1 hidden text-sm text-muted-foreground md:block">
              {meta.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" className="hidden md:flex" onClick={() => setIsSearchOpen(true)}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 gap-3 rounded-xl px-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-foreground">
                      {session?.admin?.fullname || 'Admin'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.admin?.email || 'admin@zota.com'}
                    </p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex flex-col gap-1 px-2 py-1.5">
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
