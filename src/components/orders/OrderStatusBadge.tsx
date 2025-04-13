
import React from 'react';
import { Calendar, Check, Clock, MessageSquare, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return { 
          icon: <Check className="h-4 w-4" />, 
          bgColor: 'bg-green-500' 
        };
      case 'Cancelled':
        return { 
          icon: <X className="h-4 w-4" />, 
          bgColor: 'bg-red-500' 
        };
      case 'Not Responding':
        return { 
          icon: <Clock className="h-4 w-4" />, 
          bgColor: 'bg-yellow-500' 
        };
      case 'To Process':
        return { 
          icon: <MessageSquare className="h-4 w-4" />, 
          bgColor: 'bg-blue-500' 
        };
      default:
        return { 
          icon: <Calendar className="h-4 w-4" />, 
          bgColor: 'bg-gray-500' 
        };
    }
  };

  const { icon, bgColor } = getStatusConfig(status);

  return (
    <Badge className={bgColor}>
      <span className="flex items-center gap-1">
        {icon}
        <span className="hidden md:inline">{status}</span>
      </span>
    </Badge>
  );
};
