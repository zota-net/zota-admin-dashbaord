'use client';

import { AlertCircle, Inbox, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  compact,
}: {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <Card
      className={
        compact
          ? 'flex flex-row items-center justify-between gap-3 p-4 border-destructive/30 bg-destructive/5'
          : 'flex flex-col items-center justify-center gap-3 p-10 border-destructive/30 bg-destructive/5'
      }
    >
      <div className={compact ? 'flex items-center gap-3 min-w-0' : 'flex flex-col items-center gap-2'}>
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <p className={compact ? 'text-sm truncate' : 'text-sm font-medium'}>
          {message || 'Failed to load data. The service may be unreachable.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
          <RotateCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({ message, icon: Icon = Inbox }: { message: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 p-4">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
