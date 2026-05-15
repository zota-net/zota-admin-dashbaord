'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Search, TrendingUp, Wallet, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { smsService } from '@/lib/api/services/wallet';
import { clientsService } from '@/lib/api/services/base-operations';
import type { Client } from '@/lib/api/types';

interface FloatRow {
  client_id:    number;
  clientName:   string;
  balance:      number;
  smsRemaining: number;
  totalSmsSent: number;
  updatedAt:    string;
}

interface LogEntry {
  id:                number;
  recipient:         string;
  voucherCode:       string;
  message:           string;
  cost:              number;
  status:            'sent' | 'failed';
  providerReference: string | null;
  sentAt:            string;
}

export default function AdminSmsPage() {
  const [rows, setRows] = useState<FloatRow[]>([]);
  const [filtered, setFiltered] = useState<FloatRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<FloatRow | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [floatData, clientsData] = await Promise.allSettled([
        smsService.getAllFloats(),
        clientsService.getAll(),
      ]);

      const floats: any[] = floatData.status === 'fulfilled' ? (floatData.value ?? []) : [];
      const clients: Client[] = clientsData.status === 'fulfilled' ? (clientsData.value ?? []) : [];

      const clientMap = new Map(clients.map((c) => [Number(c.id), c.businessName]));

      const mapped: FloatRow[] = floats.map((f: any) => ({
        client_id:    f.client_id,
        clientName:   clientMap.get(f.client_id) ?? `Client #${f.client_id}`,
        balance:      Number(f.balance ?? 0),
        smsRemaining: f.smsRemaining ?? 0,
        totalSmsSent: f.totalSmsSent ?? 0,
        updatedAt:    f.updatedAt ?? '',
      }));

      setRows(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error('Failed to load SMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(rows.filter((r) => r.clientName.toLowerCase().includes(q) || String(r.client_id).includes(q)));
  }, [search, rows]);

  const openLogs = async (row: FloatRow) => {
    setSelectedRow(row);
    setLogsLoading(true);
    setLogs([]);
    setTopups([]);
    try {
      const [logsResult, topupsResult] = await Promise.allSettled([
        smsService.getLogs(row.client_id),
        smsService.getTopupHistory(row.client_id),
      ]);
      if (logsResult.status === 'fulfilled')   setLogs(logsResult.value?.logs   ?? []);
      if (topupsResult.status === 'fulfilled') setTopups(topupsResult.value?.topups ?? []);
    } catch { /* ignore */ } finally {
      setLogsLoading(false);
    }
  };

  const totalBalance    = rows.reduce((s, r) => s + r.balance, 0);
  const totalSmsSent    = rows.reduce((s, r) => s + r.totalSmsSent, 0);
  const activeClients   = rows.filter((r) => r.balance > 0).length;

  const fmt = (n: number) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', notation: 'compact', maximumFractionDigits: 1 }).format(n);
  const fmtFull = (n: number) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }).format(n);
  const fmtDate = (s: string) => s ? new Date(s).toLocaleString() : '—';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            SMS Float Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor client SMS float balances and OTP delivery history</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Float Held</p>
              <Wallet className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500 mt-1">{fmt(totalBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total SMS Sent</p>
              <Send className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-1">{totalSmsSent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{activeClients}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Float Balances</CardTitle>
              <CardDescription>Clients who have purchased SMS float</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Float Balance</TableHead>
                  <TableHead>SMS Remaining</TableHead>
                  <TableHead>Total Sent</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No SMS float records found</TableCell>
                  </TableRow>
                )}
                {filtered.map((row) => (
                  <TableRow key={row.client_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{row.clientName}</p>
                        <p className="text-xs text-muted-foreground">ID: {row.client_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${row.balance > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {fmtFull(row.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.smsRemaining > 10 ? 'default' : row.smsRemaining > 0 ? 'secondary' : 'destructive'}>
                        {row.smsRemaining} SMS
                      </Badge>
                    </TableCell>
                    <TableCell>{row.totalSmsSent.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(row.updatedAt)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openLogs(row)}>
                        View Logs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Client logs dialog */}
      <Dialog open={!!selectedRow} onOpenChange={(open) => { if (!open) setSelectedRow(null); }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRow?.clientName} — SMS Activity</DialogTitle>
            <DialogDescription>
              Balance: {fmtFull(selectedRow?.balance ?? 0)} · {selectedRow?.smsRemaining ?? 0} SMS remaining
            </DialogDescription>
          </DialogHeader>

          {logsLoading && <p className="text-center text-muted-foreground py-6">Loading...</p>}

          {!logsLoading && (
            <div className="space-y-4">
              {/* Topup history */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Float Topup History</h3>
                {topups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topups yet</p>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>SMS Credits</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topups.map((t: any) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-semibold text-green-500">{fmtFull(Number(t.amount))}</TableCell>
                            <TableCell>{t.smsCredits}</TableCell>
                            <TableCell>{t.phone}</TableCell>
                            <TableCell>{t.provider}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Sent logs */}
              <div>
                <h3 className="text-sm font-semibold mb-2">SMS Sent Log</h3>
                {logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No SMS sent yet</p>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Voucher</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell>{l.recipient}</TableCell>
                            <TableCell className="font-mono text-sm">{l.voucherCode}</TableCell>
                            <TableCell>{fmtFull(Number(l.cost))}</TableCell>
                            <TableCell>
                              <Badge variant={l.status === 'sent' ? 'default' : 'destructive'}>
                                {l.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{fmtDate(l.sentAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
