'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { LoadingOverlay } from '@/components/common';
import { useAdminStore } from '@/lib/store/admin-store';
import { useAppStore } from '@/lib/store/app-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkSession } = useAdminStore();
  const { settings } = useAppStore();
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
    const valid = checkSession();
    if (!isAuthenticated && !valid) {
      router.push('/login');
    }
  }, [isAuthenticated, checkSession, router]);

  if (!isMountedSafe(mounted) || (!isAuthenticated && !checkSession())) {
    return <LoadingOverlay show={true} text="Verifying session..." />;
  }

  const sidebarWidth = settings.sidebarCollapsed ? 72 : 280;
  const mainMargin = mounted && !isMobile ? sidebarWidth : 0;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AdminSidebar />
      <AdminHeader />
      <main
        className="pt-14 sm:pt-16 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: mainMargin }}
      >
        <div className="p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

function isMountedSafe(mounted: boolean) {
  return mounted;
}
