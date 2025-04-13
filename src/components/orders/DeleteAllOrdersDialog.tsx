
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

interface DeleteAllOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orderCount: number;
}

export const DeleteAllOrdersDialog: React.FC<DeleteAllOrdersDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  orderCount
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete All Orders</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete ALL orders? This action cannot be undone and will remove {orderCount} orders from the system.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center text-amber-500 my-4">
          <AlertTriangle className="h-16 w-16" />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:w-auto w-full">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="sm:w-auto w-full">Delete All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
