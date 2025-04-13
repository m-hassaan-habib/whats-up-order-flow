
import React from 'react';
import { OrderData, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  order: OrderData | null;
  onOrderChange: (field: keyof OrderData, value: string) => void;
}

export const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  order,
  onOrderChange
}) => {
  if (!order) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Make changes to the order details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right md:text-right text-left">Name</Label>
            <Input
              id="name"
              value={order.name}
              onChange={(e) => onOrderChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right md:text-right text-left">Phone</Label>
            <Input
              id="phone"
              value={order.phone}
              onChange={(e) => onOrderChange('phone', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right md:text-right text-left">Product</Label>
            <Input
              id="product"
              value={order.product}
              onChange={(e) => onOrderChange('product', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right md:text-right text-left">Address</Label>
            <Input
              id="address"
              value={order.address}
              onChange={(e) => onOrderChange('address', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right md:text-right text-left">Status</Label>
            <Select 
              value={order.status}
              onValueChange={(value) => onOrderChange('status', value as OrderStatus)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Process">To Process</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Not Responding">Not Responding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:w-auto w-full">Cancel</Button>
          <Button onClick={onConfirm} className="sm:w-auto w-full">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
