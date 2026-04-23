'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/header';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useAdminStore } from '@/lib/store/admin-store';
import { LoadingOverlay } from '@/components/common';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, checkSession } = useAdminStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const isValid = checkSession();
    if (!isAuthenticated && !isValid) {
      router.push('/login');
    }
  }, [isAuthenticated, checkSession, router]);

  if (!isAuthenticated) {
    return <LoadingOverlay show={true} text="Verifying session..." />;
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