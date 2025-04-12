
import React from 'react';
import { MoreHorizontal, Edit, Trash2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderStatus } from '@/types';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface OrderActionsDropdownProps {
  orderId: string;
  orderStatus: OrderStatus;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onStatusChange: (status: OrderStatus) => void;
}

export const OrderActionsDropdown: React.FC<OrderActionsDropdownProps> = ({
  orderId,
  orderStatus,
  onEditClick,
  onDeleteClick,
  onStatusChange,
}) => {
  const { canEdit, canDelete } = usePermissions();
  const { isAuthenticated } = useAuth();

  const handleEditClick = () => {
    if (!isAuthenticated) {
      toast.error('You need to be logged in to edit orders');
      return;
    }
    onEditClick();
  };

  const handleDeleteClick = () => {
    if (!isAuthenticated) {
      toast.error('You need to be logged in to delete orders');
      return;
    }
    onDeleteClick();
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (!isAuthenticated) {
      toast.error('You need to be logged in to change order status');
      return;
    }
    onStatusChange(status);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleEditClick}
          className={!canEdit ? "text-muted-foreground" : ""}
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDeleteClick}
          className={!canDelete ? "text-muted-foreground" : ""}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('To Process')}
          disabled={orderStatus === 'To Process' || !canEdit}
        >
          <span className="flex items-center">
            Set to "To Process"
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('Confirmed')}
          disabled={orderStatus === 'Confirmed' || !canEdit}
        >
          <span className="flex items-center">
            Set to "Confirmed"
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('Cancelled')}
          disabled={orderStatus === 'Cancelled' || !canEdit}
        >
          <span className="flex items-center">
            <Ban className="mr-2 h-4 w-4" />
            Set to "Cancelled"
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
