'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState, ErrorState, TableSkeleton } from './page-header';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | null;
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  emptyMessage?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  error,
  onRetry,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchFn,
  emptyMessage = 'No records found',
  pageSize = 15,
  toolbar,
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!rows) return null;
    let data = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (row) =>
          searchFn?.(row, q) ??
          columns.some((col) => {
            const v = col.sortValue?.(row);
            return String(v ?? '').toLowerCase().includes(q);
          })
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        data = [...data].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
          return sort.dir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return data;
  }, [rows, query, sort, columns, searchFn]);

  const pageCount = filtered ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const pageRows = filtered ? filtered.slice(page * pageSize, (page + 1) * pageSize) : [];

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return (
    <Card className="overflow-hidden py-0">
      {(searchable || toolbar) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-border p-3">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                className="pl-8 h-9"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2 sm:ml-auto">{toolbar}</div>}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton cols={Math.min(columns.length, 5)} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      'text-xs uppercase tracking-wide text-muted-foreground font-semibold',
                      col.hideOnMobile && 'hidden md:table-cell',
                      col.sortValue && 'cursor-pointer select-none'
                    )}
                    onClick={() => {
                      if (!col.sortValue) return;
                      setSort((prev) =>
                        prev?.key === col.key
                          ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
                          : { key: col.key, dir: 'asc' }
                      );
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sort?.key === col.key &&
                        (sort.dir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ))}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <EmptyState message={query ? 'No matching records' : emptyMessage} />
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow
                    key={rowKey(row)}
                    className={cn(onRowClick && 'cursor-pointer')}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn(col.hideOnMobile && 'hidden md:table-cell', col.className)}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filtered && filtered.length > pageSize && (
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-sm text-muted-foreground">
              <span>
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
