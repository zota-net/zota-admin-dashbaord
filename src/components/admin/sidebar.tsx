'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronLeft,
  CreditCard,
  FileText,
  Headphones,
  Home,
  Image as ImageIcon,
  MessageSquare,
  Package,
  Settings,
  Terminal,
  Ticket,
  Users,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/common';
import { useAppStore } from '@/lib/store/admin-store';

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
    title: 'Management',
    items: [
      { label: 'Vouchers', href: '/admin/vouchers', icon: Ticket },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Packages', href: '/admin/packages', icon: Package },
      { label: 'SMS Float', href: '/admin/sms', icon: MessageSquare },
      { label: 'Devices', href: '/admin/devices', icon: BarChart3 },
      { label: 'Router Scripts', href: '/admin/routers', icon: Terminal },
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
    title: 'Content',
    items: [
      { label: 'Adverts', href: '/admin/adverts', icon: ImageIcon },
      { label: 'Alerts', href: '/admin/alerts', icon: AlertCircle },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Logs', href: '/admin/logs', icon: FileText },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = sidebarCollapsed && !isMobile;
  const sidebarWidth = collapsed ? 72 : 280;

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [pathname, isMobile]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/dashboard';
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border flex-shrink-0">
        <motion.div initial={false} animate={{ opacity: 1 }} className="flex items-center">
          <Logo size={collapsed ? 'sm' : 'md'} showText={!collapsed} />
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => isMobile ? setMobileOpen(false) : toggleSidebar()}
          className="h-8 w-8 shrink-0"
        >
          <motion.div
            initial={false}
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6 pr-2">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {group.title}
                </motion.p>
              )}

              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      'hover:bg-accent/50 active:bg-accent/70 select-none min-h-[2.75rem]',
                      active
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                      collapsed && 'justify-center px-0'
                    )}
                  >
                    {/* Active left border indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <Icon className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-200',
                      'group-hover:scale-110 group-active:scale-95',
                      active && 'text-primary'
                    )} />

                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}

                    {!collapsed && item.badge && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}

                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        •
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-4 flex-shrink-0">
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-xs text-muted-foreground"
          >
            <span>v1.0.0</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </span>
          </motion.div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="System Online" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-30 h-screen hidden lg:block border-r border-border bg-card/95 backdrop-blur-xl overflow-hidden"
      >
        <NavContent />
      </motion.aside>

      {/* Mobile FAB */}
      <button
        className="fixed bottom-5 right-5 z-40 lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <Building2 className="h-5 w-5" />
      </button>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden cursor-pointer"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 z-40 h-screen w-[280px] border-r border-border bg-card/95 backdrop-blur-xl lg:hidden"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
