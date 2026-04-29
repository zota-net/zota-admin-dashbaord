'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  description?: string;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const toneStyles = {
  default: {
    iconWrap: 'bg-secondary text-foreground',
    value: 'text-foreground',
  },
  primary: {
    iconWrap: 'bg-primary/10 text-primary',
    value: 'text-primary',
  },
  success: {
    iconWrap: 'bg-emerald-500/12 text-emerald-600',
    value: 'text-emerald-600',
  },
  warning: {
    iconWrap: 'bg-amber-500/12 text-amber-600',
    value: 'text-amber-600',
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  prefix = '',
  suffix = '',
  decimals = 0,
  variant = 'default',
  className,
}: StatsCardProps) {
  const formatValue = (currentValue: number) => {
    if (currentValue >= 1000000) {
      return `${prefix}${(currentValue / 1000000).toFixed(1)}M${suffix}`;
    }

    if (currentValue >= 1000) {
      return `${prefix}${(currentValue / 1000).toFixed(1)}k${suffix}`;
    }

    return `${prefix}${currentValue.toFixed(decimals)}${suffix}`;
  };

  return (
    <Card className={cn('h-full rounded-2xl border-border/80 shadow-sm', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex min-w-0 flex-col gap-1">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
            {title}
          </CardDescription>
          <CardTitle className={cn('text-3xl font-semibold tracking-tight', toneStyles[variant].value)}>
            {formatValue(value)}
          </CardTitle>
        </div>
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', toneStyles[variant].iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">
          {description || 'No additional context provided.'}
        </p>
      </CardContent>
    </Card>
  );
}
