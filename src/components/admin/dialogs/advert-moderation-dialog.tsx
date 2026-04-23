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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdvertModerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvertModerationDialog({
  open,
  onOpenChange,
}: AdvertModerationDialogProps) {
  const [decision, setDecision] = useState('approved');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onOpenChange(false);
    setDecision('approved');
    setFeedback('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advert Moderation</DialogTitle>
          <DialogDescription>
            Review and approve or reject an advertisement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="decision">Decision</Label>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger id="decision">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approve</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Add feedback or reason for rejection..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-32"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Decision</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
