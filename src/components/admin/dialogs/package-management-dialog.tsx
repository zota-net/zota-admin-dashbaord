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

interface PackageManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageManagementDialog({
  open,
  onOpenChange,
}: PackageManagementDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    bandwidth: '',
    devices: '',
  });

  const handleSubmit = () => {
    onOpenChange(false);
    setFormData({ name: '', price: '', bandwidth: '', devices: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>
          <DialogDescription>
            Create a new service package
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Package Name</Label>
            <Input
              id="name"
              placeholder="Professional Plan"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              placeholder="29.99"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="bandwidth">Bandwidth (Mbps)</Label>
            <Input
              id="bandwidth"
              placeholder="200"
              value={formData.bandwidth}
              onChange={(e) =>
                setFormData({ ...formData, bandwidth: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="devices">Max Devices</Label>
            <Input
              id="devices"
              type="number"
              placeholder="10"
              value={formData.devices}
              onChange={(e) =>
                setFormData({ ...formData, devices: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Package</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
