
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { OrderData, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, AlertTriangle, TrashIcon } from 'lucide-react';
import { OrderListPagination } from '@/components/OrderListPagination';
import { usePermissions } from '@/hooks/usePermissions';
import { AuthRequiredAlert } from '@/components/AuthRequiredAlert';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ManageOrders = () => {
  const { orders, setOrders } = useAppContext();
  const { canEdit, canDelete } = usePermissions();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  // Badge color based on status
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'Confirmed': return 'bg-green-500';
      case 'Cancelled': return 'bg-red-500';
      case 'Not Responding': return 'bg-yellow-500';
      case 'To Process': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDelete = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (orderToDelete) {
      setOrders(orders.filter(order => order.id !== orderToDelete));
      toast.success('Order deleted successfully');
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleEdit = (order: OrderData) => {
    setEditingOrder({ ...order });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof OrderData, value: string) => {
    if (editingOrder) {
      setEditingOrder({
        ...editingOrder,
        [field]: value,
      });
    }
  };

  const confirmEdit = () => {
    if (editingOrder) {
      setOrders(orders.map(order => 
        order.id === editingOrder.id ? editingOrder : order
      ));
      toast.success('Order updated successfully');
      setEditDialogOpen(false);
      setEditingOrder(null);
    }
  };

  const handleDeleteAll = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAll = () => {
    setOrders([]);
    toast.success('All orders deleted successfully');
    setDeleteAllDialogOpen(false);
  };

  if (!canEdit && !canDelete) {
    return (
      <div className="container mx-auto p-4">
        <AuthRequiredAlert action="manage orders" />
        <Button onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">
            Edit and delete customer orders
          </p>
        </div>
        <div className="flex gap-2">
          {canDelete && orders.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteAll}
              className="flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete All Orders
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Edit or delete existing orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>{order.name}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(order.id)}
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

          {totalPages > 1 && (
            <OrderListPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center text-amber-500 my-4">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Orders Confirmation Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Orders</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL orders? This action cannot be undone and will remove {orders.length} orders from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center text-amber-500 my-4">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAllDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteAll}>Delete All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Make changes to the order details below.
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={editingOrder.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input
                  id="phone"
                  value={editingOrder.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">Product</Label>
                <Input
                  id="product"
                  value={editingOrder.product}
                  onChange={(e) => handleEditChange('product', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Address</Label>
                <Input
                  id="address"
                  value={editingOrder.address}
                  onChange={(e) => handleEditChange('address', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select 
                  value={editingOrder.status}
                  onValueChange={(value) => handleEditChange('status', value as OrderStatus)}
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageOrders;
