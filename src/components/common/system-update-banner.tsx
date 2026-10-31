'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemUpdateBannerProps {
  className?: string;
  storageKey?: string;
}

export function SystemUpdateBanner({
  className,
  storageKey = 'system-update-banner-dismissed',
}: SystemUpdateBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(storageKey) === '1');
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // ignore storage errors
    }
  };

  if (dismissed) return null;

  return (
    <div
      role="status"
      className={cn(
        'relative flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-4 text-amber-950 dark:text-amber-100',
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Ongoing System Updates</p>
        <p className="mt-0.5 text-xs sm:text-sm text-amber-900/80 dark:text-amber-100/80">
          We&apos;re currently performing scheduled updates. Some system functionalities may not work
          as expected. Please bear with us and wait within{' '}
          <span className="font-medium">24&ndash;48 hours</span> for everything to be fully restored.
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-700 dark:text-amber-200">
          <Clock className="h-3 w-3" />
          Estimated restoration: within 24&ndash;48 hours
        </p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss update notice"
        className="shrink-0 rounded-md p-1 text-amber-700/70 transition-colors hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-200/70 dark:hover:text-amber-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
