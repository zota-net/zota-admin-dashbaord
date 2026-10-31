'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Ticket,
  Package,
  CreditCard,
  Megaphone,
  Smartphone,
  Terminal,
  MessageSquare,
  Headphones,
  AlertTriangle,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/common';
import { useAppStore } from '@/lib/store/app-store';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Revenue', href: '/admin/revenue', icon: BarChart3 },
    ],
  },
  {
    title: 'Platform',
    items: [
      { title: 'Clients', href: '/admin/clients', icon: Users },
      { title: 'Vouchers', href: '/admin/vouchers', icon: Ticket },
      { title: 'Packages', href: '/admin/packages', icon: Package },
      { title: 'Payments', href: '/admin/payments', icon: CreditCard },
      { title: 'Adverts', href: '/admin/adverts', icon: Megaphone },
      { title: 'Agents', href: '/admin/agents', icon: UserCheck },
    ],
  },
  {
    title: 'Network',
    items: [
      { title: 'Devices', href: '/admin/devices', icon: Smartphone },
      { title: 'Router Console', href: '/admin/console', icon: Terminal },
      { title: 'SMS Float', href: '/admin/sms', icon: MessageSquare },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Support Tickets', href: '/admin/support', icon: Headphones, badge: 'Live', badgeVariant: 'outline' },
      { title: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
      { title: 'Logs', href: '/admin/logs', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: Settings },
      { title: 'Help Library', href: '/admin/help', icon: HelpCircle },
    ],
  },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { settings, setSetting, setMobileMenuOpen, mobileMenuOpen } = useAppStore();
  const collapsed = settings.sidebarCollapsed;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleCollapse = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSetting('sidebarCollapsed', !collapsed);
    }
  };

  const sidebarWidth = isMobile ? 280 : collapsed ? 72 : 280;

  return (
    <TooltipProvider delayDuration={0}>
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden cursor-pointer"
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (mobileMenuOpen ? 0 : -280) : 0,
          width: sidebarWidth,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn('fixed left-0 top-0 z-50 h-screen border-r border-border bg-card/95 backdrop-blur-xl', className)}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center">
              <Logo
                size={collapsed ? 'sm' : 'md'}
                showText={!collapsed}
                variant={collapsed ? 'icon' : 'full'}
              />
            </div>

            <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8 shrink-0">
              <motion.div initial={false} animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronLeft className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>

          <ScrollArea className="flex-1 h-[calc(100vh-200px)] px-3 py-4">
            <nav className="space-y-6 pr-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  {!collapsed && (
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </h4>
                  )}

                  {group.items.map((item) => {
                    const isActive =
                      item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                    const NavLink = (
                      <Link
                        href={item.href}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          'hover:bg-accent/50 active:bg-accent/70 cursor-pointer select-none min-h-[2.75rem]',
                          isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
                          collapsed && 'justify-center px-0'
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeAdminNav"
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}

                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 group-active:scale-95',
                            isActive && 'text-primary'
                          )}
                        />

                        {!collapsed && <span className="flex-1">{item.title}</span>}

                        {!collapsed && item.badge && (
                          <Badge
                            variant={item.badgeVariant || 'secondary'}
                            className="h-5 min-w-5 px-1.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                          <TooltipContent side="right">{item.title}</TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.href}>{NavLink}</div>;
                  })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          <div className="border-t border-border p-4">
            {!collapsed ? (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Admin Panel</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Online
                </span>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">System Online</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
