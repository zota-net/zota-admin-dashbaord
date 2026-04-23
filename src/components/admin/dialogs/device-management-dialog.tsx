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

interface DeviceManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceManagementDialog({
  open,
  onOpenChange,
}: DeviceManagementDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Network Device',
    owner: '',
  });

  const handleSubmit = () => {
    onOpenChange(false);
    setFormData({ name: '', type: 'Network Device', owner: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Device</DialogTitle>
          <DialogDescription>
            Register a new device in the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              placeholder="Router-01"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="type">Device Type</Label>
            <Select value={formData.type} onValueChange={(type) =>
              setFormData({ ...formData, type })
            }>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Network Device">Network Device</SelectItem>
                <SelectItem value="Access Point">Access Point</SelectItem>
                <SelectItem value="Switch">Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              placeholder="User email or ID"
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Device</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
