'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';
import { clientsService } from '@/lib/api';

interface ClientResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  walletBalance: number;
  onResetComplete?: () => void;
}

const RESET_OPTIONS = [
  { key: 'clearBalance',  label: 'Wallet Balance',  description: 'Zero out the client\'s account balance' },
  { key: 'clearVouchers', label: 'Vouchers',         description: 'Delete all generated vouchers' },
  { key: 'clearDevices',  label: 'Connected Devices',description: 'Remove all hotspot device sessions' },
  { key: 'clearPackages', label: 'Packages',         description: 'Delete all internet packages' },
  { key: 'clearAdverts',  label: 'Advertisements',   description: 'Remove all uploaded adverts' },
] as const;

type OptionKey = (typeof RESET_OPTIONS)[number]['key'];

export function ClientResetDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  walletBalance,
  onResetComplete,
}: ClientResetDialogProps) {
  const [selected, setSelected] = useState<Record<OptionKey, boolean>>({
    clearBalance: false,
    clearVouchers: false,
    clearDevices: false,
    clearPackages: false,
    clearAdverts: false,
  });
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Record<string, any> | null>(null);

  const hasNegativeBalance = walletBalance < 0;
  const willClearBalance = selected.clearBalance;
  const anySelected = Object.values(selected).some(Boolean);

  const toggle = (key: OptionKey) =>
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await clientsService.reset(clientId, selected);
      setReport(result?.data?.report ?? {});
      setStep('done');
      onResetComplete?.();
    } catch {
      // stay on confirm step so user can retry
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setStep('select');
    setSelected({ clearBalance: false, clearVouchers: false, clearDevices: false, clearPackages: false, clearAdverts: false });
    setReport(null);
    onOpenChange(false);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-destructive" />
                Reset Client Account
              </DialogTitle>
              <DialogDescription>
                Select what to clear for <strong>{clientName}</strong>. This cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              {RESET_OPTIONS.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selected[key]
                      ? 'border-destructive/60 bg-destructive/5'
                      : 'border-border hover:border-muted-foreground/40 bg-card'
                  }`}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected[key] ? 'bg-destructive border-destructive' : 'border-muted-foreground/50'
                  }`}>
                    {selected[key] && (
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                </button>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={!anySelected}
                onClick={() => setStep('confirm')}
              >
                Review &amp; Confirm
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirm Reset
              </DialogTitle>
              <DialogDescription>
                You are about to reset the following for <strong>{clientName}</strong>:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              {RESET_OPTIONS.filter(o => selected[o.key]).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                  {label}
                </div>
              ))}

              {/* Negative balance warning */}
              {willClearBalance && hasNegativeBalance && (
                <div className="mt-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/8">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-600">Negative Balance Detected</p>
                      <p className="text-xs text-amber-600/80 mt-0.5">
                        This client has a balance of{' '}
                        <span className="font-bold">{formatCurrency(walletBalance)}</span>.
                        Clearing it will deduct{' '}
                        <span className="font-bold">{formatCurrency(Math.abs(walletBalance))}</span>{' '}
                        from platform earnings to absorb the debt.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('select')} disabled={loading}>Back</Button>
              <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Yes, Reset Now'
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'done' && report && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Reset Complete
              </DialogTitle>
              <DialogDescription>
                The following data was cleared for <strong>{clientName}</strong>:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              {Object.entries(report).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {typeof val === 'object' && val !== null
                      ? JSON.stringify(val)
                      : String(val)}
                  </Badge>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
