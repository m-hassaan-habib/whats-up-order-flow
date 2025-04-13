
import React from 'react';
import { OrderData } from '@/types';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderTableProps {
  orders: OrderData[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (order: OrderData) => void;
  onDelete: (orderId: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  canEdit,
  canDelete,
  onEdit,
  onDelete
}) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Order #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden md:table-cell">Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell className="hidden md:table-cell">{order.phone}</TableCell>
                <TableCell className="hidden md:table-cell">{order.product}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
