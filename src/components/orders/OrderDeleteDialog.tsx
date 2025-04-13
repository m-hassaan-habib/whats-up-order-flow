
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orderId?: string;
}

export const OrderDeleteDialog: React.FC<OrderDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  orderId
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center text-amber-500 my-4">
          <AlertTriangle className="h-16 w-16" />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:w-auto w-full">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="sm:w-auto w-full">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
