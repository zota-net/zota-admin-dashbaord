import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zota Admin Dashboard',
  description: 'System administration and control panel for Zota network operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
