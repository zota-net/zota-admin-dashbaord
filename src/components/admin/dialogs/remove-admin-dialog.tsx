'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminsService } from '@/lib/api';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface RemoveAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminId: number;
  adminName: string;
  adminEmail: string;
  onAdminRemoved: () => void;
}

export function RemoveAdminDialog({ open, onOpenChange, adminId, adminName, adminEmail, onAdminRemoved }: RemoveAdminDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemove = async () => {
    setIsSubmitting(true);
    try {
      await adminsService.remove(adminId);
      toast.success(`${adminName} has been removed as admin`);
      onOpenChange(false);
      onAdminRemoved();
    } catch (error: any) {
      const message = error?.message || error?.response?.data?.message || 'Failed to remove admin';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remove Admin
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{adminName}</strong> ({adminEmail}) as an admin?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={isSubmitting}>
            {isSubmitting ? 'Removing...' : 'Remove Admin'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
