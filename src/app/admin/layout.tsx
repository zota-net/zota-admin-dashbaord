'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useAdminStore, useAppStore } from '@/lib/store/admin-store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkSession, session } = useAdminStore();
  const { sidebarCollapsed } = useAppStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/login') {
      setChecked(true);
      return;
    }

    const isValid = checkSession();
    if (!isAuthenticated && !isValid) {
      router.replace('/login');
      return;
    }

    if (session?.admin?.role !== 'SuperAdmin') {
      router.replace('/login');
      return;
    }

    setChecked(true);
  }, [pathname, isAuthenticated, checkSession, router, session]);

  if (!checked || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <AdminSidebar />
      <AdminHeader />
      <main
        className={`min-h-screen pt-20 transition-[padding-left] duration-300 ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[280px]'}`}
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
