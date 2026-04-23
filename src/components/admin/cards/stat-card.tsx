'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const variantStyles = {
    default: '',
    primary: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${prefix}${(val / 1000000).toFixed(1)}M${suffix}`;
    }
    if (val >= 1000) {
      return `${prefix}${(val / 1000).toFixed(1)}k${suffix}`;
    }
    return `${prefix}${val.toFixed(decimals)}${suffix}`;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className={cn('h-4 w-4', variantStyles[variant])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', variantStyles[variant])}>
          {formatValue(value)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}