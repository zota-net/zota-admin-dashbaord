'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Menu, Search, Settings, LogOut, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/lib/store/admin-store';
import { useAppStore } from '@/lib/store/app-store';
import { clientsService } from '@/lib/api';
import type { Client } from '@/lib/api/types';

export function AdminHeader({ className }: { className?: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { session, logout } = useAdminStore();
  const { settings, setSetting, setMobileMenuOpen, mobileMenuOpen } = useAppStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<Client[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => {
      setMounted(true);
      setIsMobile(window.innerWidth < 1024);
    };
    queueMicrotask(sync);
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (searchOpen && clients === null) {
      clientsService.getAll().then(setClients).catch(() => setClients([]));
    }
  }, [searchOpen, clients]);

  const results = useMemo(() => {
    if (!clients || !query.trim()) return [];
    const q = query.toLowerCase();
    return clients
      .filter(
        (c) =>
          c.businessName.toLowerCase().includes(q) ||
          c.adminEmail.toLowerCase().includes(q) ||
          c.adminFullName.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [clients, query]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSetting('sidebarCollapsed', !settings.sidebarCollapsed);
    }
  };

  const sidebarWidth = settings.sidebarCollapsed ? 72 : 280;
  const headerLeft = mounted && !isMobile ? sidebarWidth : 0;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur-xl transition-all duration-300',
        className
      )}
      style={{ left: headerLeft }}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0 lg:hidden h-8 w-8 sm:h-9 sm:w-9"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="hidden sm:flex justify-start gap-2 w-full max-w-md h-9 rounded-lg bg-muted/50 border-border/60 font-normal text-muted-foreground hover:bg-muted"
              >
                <Search className="h-4 w-4" />
                <span>Search clients...</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[24rem] p-0">
              <div className="p-2 border-b border-border">
                <Input
                  autoFocus
                  placeholder="Search clients by name, email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
              <ScrollArea className="max-h-72">
                {results.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {query ? 'No clients found' : 'Type to search platform clients'}
                  </div>
                ) : (
                  <div className="p-1">
                    {results.map((c) => (
                      <button
                        key={c.id}
                        className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/50 text-left"
                        onClick={() => {
                          setSearchOpen(false);
                          router.push(`/admin/clients/${c.id}`);
                        }}
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.businessName}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.adminEmail}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{c.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative" onClick={() => router.push('/admin/alerts')}>
            <Bell className="h-5 w-5" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 gap-2 pl-2 pr-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {session?.admin.fullname?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block text-sm font-medium">
                  {session?.admin.fullname || 'Admin'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.admin.fullname}</p>
                  <p className="text-xs text-muted-foreground">{session?.admin.email}</p>
                  <Badge variant="secondary" className="w-fit mt-1 text-[10px]">{session?.admin.role}</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
