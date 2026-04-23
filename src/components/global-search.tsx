'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { clientsService } from '@/lib/api';
import type { Client } from '@/lib/api/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchClients = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const clients = await clientsService.getAll();
        const filtered = clients.filter(
          (c) =>
            c.businessName.toLowerCase().includes(query.toLowerCase()) ||
            c.adminEmail.toLowerCase().includes(query.toLowerCase()) ||
            c.adminFullName.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 5));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (client: Client) => {
    onOpenChange(false);
    setQuery('');
    router.push(`/admin/users/${client.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search clients, vouchers, payments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-4 h-14 border-0 rounded-none text-lg focus-visible:ring-0"
            autoFocus
          />
        </div>
        {results.length > 0 && (
          <div className="border-t">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Clients
              </p>
              <div className="space-y-1">
                {results.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(client)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2 rounded-lg text-left hover:bg-muted transition-colors'
                    )}
                  >
                    <div>
                      <p className="font-medium">{client.businessName}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.adminEmail}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {query.length >= 2 && results.length === 0 && !isSearching && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No results found for "{query}"</p>
          </div>
        )}
        <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-muted">
              <Command className="h-3 w-3" />
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 rounded bg-muted">K</kbd>
            <span>to search</span>
          </div>
          <Link
            href="/admin/users"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            View all clients
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}