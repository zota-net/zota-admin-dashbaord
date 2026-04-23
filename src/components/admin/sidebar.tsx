'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Activity,
  Package,
  Ticket,
  CreditCard,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  Settings,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Home,
  ChevronDown,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    children: [
      { label: 'All Clients', href: '/admin/users', icon: Users },
      { label: 'Agents', href: '/admin/agents', icon: Activity },
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

function NavLink({
  item,
  isActive,
  pathname,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  pathname: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const [expanded, setExpanded] = useState(false);

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm w-full text-left',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          )}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
        {expanded && (
          <div className="ml-4 space-y-1">
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                    childActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <ChildIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-foreground'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      {isActive && <ChevronRight className="w-4 h-4" />}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 fixed h-screen',
          isOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ZOTA</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex"
          >
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              pathname={pathname}
            />
          ))}
        </nav>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full shadow-lg"
          size="icon"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50">
          <div className="bg-card w-72 h-full shadow-lg overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ZOTA Admin</span>
              </div>
            </div>
            <nav className="p-2 space-y-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  pathname={pathname}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}