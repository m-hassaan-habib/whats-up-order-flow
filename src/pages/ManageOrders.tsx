
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { OrderData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrashIcon } from 'lucide-react';
import { OrderListPagination } from '@/components/OrderListPagination';
import { usePermissions } from '@/hooks/usePermissions';
import { AuthRequiredAlert } from '@/components/AuthRequiredAlert';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import our new components
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderDeleteDialog } from '@/components/orders/OrderDeleteDialog';
import { DeleteAllOrdersDialog } from '@/components/orders/DeleteAllOrdersDialog';
import { EditOrderDialog } from '@/components/orders/EditOrderDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const ManageOrders = () => {
  const { orders, setOrders } = useAppContext();
  const { canEdit, canDelete } = usePermissions();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Orders</h1>
          <p className="text-muted-foreground">
            Edit and delete customer orders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canDelete && orders.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteAll}
              className="flex items-center gap-2"
              size={isMobile ? "sm" : "default"}
            >
              <TrashIcon className="h-4 w-4" />
              {!isMobile && "Delete All Orders"}
              {isMobile && "Delete All"}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/orders')}
            size={isMobile ? "sm" : "default"}
          >
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
          <OrderTable 
            orders={paginatedOrders}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="mt-4">
              <OrderListPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDeleteDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        orderId={orderToDelete || undefined}
      />

      <DeleteAllOrdersDialog 
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
        onConfirm={confirmDeleteAll}
        orderCount={orders.length}
      />

      <EditOrderDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onConfirm={confirmEdit}
        order={editingOrder}
        onOrderChange={handleEditChange}
      />
    </div>
  );
};

export default ManageOrders;
