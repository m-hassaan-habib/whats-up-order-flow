
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { OrderData, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, FileSpreadsheet, Phone, User, Package, MapPin, Calendar } from 'lucide-react';
import { OrderListPagination } from '@/components/OrderListPagination';
import { 
  formatDistanceToNow, 
  subDays, 
  subMonths, 
  subYears, 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  isAfter,
  parse,
  parseISO
} from 'date-fns';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Date filter options
const dateFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: '15days', label: 'Last 15 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'This Year' },
];

const Orders = () => {
  const { orders } = useAppContext();
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper function to safely parse dates
  const parseOrderDate = (order: OrderData): Date => {
    try {
      // First, try to use the orderDate if available
      if (order.orderDate) {
        return parseISO(order.orderDate);
      }
      
      // Fall back to lastMessageSent if orderDate isn't available
      if (order.lastMessageSent) {
        return new Date(order.lastMessageSent);
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }
    
    // Default to current date if no valid date is available
    return new Date();
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...orders];
    const now = new Date();
    
    // Apply search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.name.toLowerCase().includes(lowerSearch) ||
        order.orderNumber.toLowerCase().includes(lowerSearch) ||
        order.phone.toLowerCase().includes(lowerSearch) ||
        order.product.toLowerCase().includes(lowerSearch) ||
        order.address.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      result = result.filter(order => {
        // Parse the order date
        const orderDate = parseOrderDate(order);
        
        switch (dateFilter) {
          case 'today':
            return isAfter(orderDate, startOfDay(now));
          case 'yesterday':
            return isAfter(orderDate, startOfDay(subDays(now, 1))) && 
                  !isAfter(orderDate, startOfDay(now));
          case 'week':
            return isAfter(orderDate, startOfWeek(now));
          case '15days':
            return isAfter(orderDate, subDays(now, 15));
          case 'month':
            return isAfter(orderDate, startOfMonth(now));
          case 'lastMonth':
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const thisMonthStart = startOfMonth(now);
            return isAfter(orderDate, lastMonthStart) && 
                  !isAfter(orderDate, thisMonthStart);
          case '3months':
            return isAfter(orderDate, subMonths(now, 3));
          case '6months':
            return isAfter(orderDate, subMonths(now, 6));
          case 'year':
            return isAfter(orderDate, startOfYear(now));
          default:
            return true;
        }
      });
    }
    
    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
        <ThemeToggle />
          <span className="text-sm text-muted-foreground">
            {filteredOrders.length} orders found
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Search, filter, and manage your customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by name, order #, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-1/5">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="To Process">To Process</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Not Responding">Not Responding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/5">
              <Select
                value={dateFilter}
                onValueChange={(value) => setDateFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilters.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/5">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Order Date</TableHead>
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
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                        {order.address}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order.orderDate || (order.lastMessageSent && 
                          formatDistanceToNow(new Date(order.lastMessageSent)) + ' ago')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found matching your criteria
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
    </div>
  );
};

export default Orders;
