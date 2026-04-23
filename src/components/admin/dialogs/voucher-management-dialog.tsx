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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VoucherManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoucherManagementDialog({
  open,
  onOpenChange,
}: VoucherManagementDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discount: '',
    limit: '',
  });

  const handleSubmit = () => {
    onOpenChange(false);
    setFormData({ code: '', discountType: 'Percentage', discount: '', limit: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Voucher</DialogTitle>
          <DialogDescription>
            Create a new promotional voucher
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Voucher Code</Label>
            <Input
              id="code"
              placeholder="SUMMER2024"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select value={formData.discountType} onValueChange={(type) =>
              setFormData({ ...formData, discountType: type })
            }>
              <SelectTrigger id="discountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Percentage">Percentage (%)</SelectItem>
                <SelectItem value="Fixed">Fixed Amount ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discount">Discount Value</Label>
            <Input
              id="discount"
              placeholder="20"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="limit">Usage Limit</Label>
            <Input
              id="limit"
              type="number"
              placeholder="500"
              value={formData.limit}
              onChange={(e) =>
                setFormData({ ...formData, limit: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Voucher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
