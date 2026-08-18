'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Check, CheckCheck, UserPlus, UserMinus, Shield } from 'lucide-react';
import { notificationsService } from '@/lib/api';
import { useAdminStore, useAppStore } from '@/lib/store/admin-store';
import type { AdminNotification } from '@/lib/api/types';

const notificationIcons: Record<string, typeof Bell> = {
  admin_added: UserPlus,
  admin_removed: UserMinus,
  role_changed: Shield,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsPanel() {
  const { session } = useAdminStore();
  const { notifications, unreadCount, setNotifications, setUnreadCount } = useAppStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.admin?.id ? Number(session.admin.id) : 0;

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const [notifs, count] = await Promise.all([
        notificationsService.getAll(userId),
        notificationsService.getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationsService.markAllAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = notificationIcons[notif.type] || Bell;
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                      !notif.read ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      notif.type === 'admin_added' ? 'bg-green-500/10 text-green-600' :
                      notif.type === 'admin_removed' ? 'bg-red-500/10 text-red-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-none">{notif.title}</p>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="shrink-0 rounded-full p-1 hover:bg-muted"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
