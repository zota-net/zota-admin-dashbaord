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

interface UpdateAdminBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onBalanceUpdated: (newBalance: number) => void;
}

export function UpdateAdminBalanceDialog({ open, onOpenChange, currentBalance, onBalanceUpdated }: UpdateAdminBalanceDialogProps) {
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    const change = type === 'credit' ? numericAmount : -numericAmount;

    setIsSubmitting(true);
    try {
      const result = await withdrawalsService.updateAdminBalance({
        amount: change,
        description: description || undefined,
      });
      toast.success(`Admin wallet ${type === 'credit' ? 'topped up' : 'deducted'} successfully`);
      setAmount('');
      setDescription('');
      onOpenChange(false);
      if (result && typeof result === 'object' && 'newBalance' in result) {
        onBalanceUpdated((result as any).newBalance);
      } else {
        onBalanceUpdated(currentBalance + change);
      }
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || 'Failed to update balance';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Admin Wallet Balance</DialogTitle>
          <DialogDescription>
            Current balance: <span className="font-semibold">UGX {currentBalance.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'credit' | 'debit')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit (Add funds)</SelectItem>
                <SelectItem value="debit">Debit (Deduct funds)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance-amount">Amount (UGX) *</Label>
            <Input
              id="balance-amount"
              type="number"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount && (
              <p className="text-xs text-muted-foreground">
                New balance: UGX {(currentBalance + (type === 'credit' ? parseFloat(amount) || 0 : -(parseFloat(amount) || 0))).toLocaleString()}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance-description">Description (optional)</Label>
            <Input
              id="balance-description"
              placeholder={type === 'credit' ? 'e.g. Initial funding' : 'e.g. Expense deduction'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : type === 'credit' ? 'Add Funds' : 'Deduct Funds'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
