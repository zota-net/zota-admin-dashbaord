'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { withdrawalsService } from '@/lib/api';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';

interface WithdrawAdminFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onWithdrawalSuccess: (newBalance: number) => void;
}

export function WithdrawAdminFundsDialog({ open, onOpenChange, currentBalance, onWithdrawalSuccess }: WithdrawAdminFundsDialogProps) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }
    if (numAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await withdrawalsService.initiateAdminWithdrawal({
        amount: numAmount,
        phone,
        provider,
      });
      toast.success(`Withdrawal of ${new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(numAmount)} initiated`);
      setAmount('');
      setPhone('');
      onOpenChange(false);
      onWithdrawalSuccess(result?.newBalance ?? currentBalance - numAmount);
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || 'Failed to process withdrawal';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-500" />
            Withdraw Admin Funds
          </DialogTitle>
          <DialogDescription>
            Withdraw earnings from the admin wallet. Current balance: <strong>{formatCurrency(currentBalance)}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (UGX) *</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={currentBalance}
            />
            <p className="text-xs text-muted-foreground">
              Available: {formatCurrency(currentBalance)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-phone">Mobile Money Number *</Label>
            <Input
              id="withdraw-phone"
              placeholder="0700 000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Provider *</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as 'MTN' | 'Airtel')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                <SelectItem value="Airtel">Airtel Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !amount || !phone}>
              {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
