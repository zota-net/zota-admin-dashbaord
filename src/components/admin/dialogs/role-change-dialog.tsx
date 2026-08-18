'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminsService } from '@/lib/api';
import { toast } from 'sonner';

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminId: number;
  adminName: string;
  currentRole: string;
  onRoleChanged: () => void;
}

export function RoleChangeDialog({ open, onOpenChange, adminId, adminName, currentRole, onRoleChanged }: RoleChangeDialogProps) {
  const [role, setRole] = useState<'Admin' | 'SuperAdmin'>(currentRole as 'Admin' | 'SuperAdmin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (role === currentRole) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await adminsService.updateRole(adminId, role);
      toast.success(`${adminName}'s role updated to ${role}`);
      onOpenChange(false);
      onRoleChanged();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || 'Failed to update role';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Admin Role</DialogTitle>
          <DialogDescription>
            Update the role for <strong>{adminName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'Admin' | 'SuperAdmin')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
