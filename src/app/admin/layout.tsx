'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useAdminStore } from '@/lib/store/admin-store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkSession } = useAdminStore();
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecked(true);
      return;
    }

    const isValid = checkSession();
    if (!isAuthenticated && !isValid) {
      router.replace('/admin/login');
    } else {
      setChecked(true);
    }
  }, [pathname, isAuthenticated, checkSession, router]);

  if (!checked || pathname === '/admin/login') {
    return <>{children}</>;
  }

  const sidebarWidth = 280;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AdminSidebar />
      <AdminHeader />
      <main
        className="pt-14 sm:pt-16 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-3 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}