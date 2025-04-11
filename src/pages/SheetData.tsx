
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { OrderData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, FileSpreadsheet, CalendarDays } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { formatDistanceToNow, format } from 'date-fns';

interface SheetGroup {
  name: string;
  date: string;
  orders: OrderData[];
}

const SheetData = () => {
  const { orders } = useAppContext();
  const [sheetGroups, setSheetGroups] = useState<SheetGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  
  // Group orders by sheet (for this demo, we'll use upload date as a proxy for sheet)
  useEffect(() => {
    const groups: { [key: string]: OrderData[] } = {};
    
    // Group orders by the day they were added (simulating sheet uploads)
    orders.forEach(order => {
      // Create a unique identifier based on current date as placeholder
      // In a real implementation, you'd use actual sheet identifiers
      const dateKey = order.lastMessageSent ? 
        format(new Date(order.lastMessageSent), 'yyyy-MM-dd') : 
        'unknown-date';
        
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(order);
    });
    
    // Convert to array format for rendering
    const groupArray: SheetGroup[] = Object.keys(groups).map(key => ({
      name: `Sheet ${key}`,
      date: key,
      orders: groups[key]
    }));
    
    setSheetGroups(groupArray);
    
    // Select the first sheet by default if available
    if (groupArray.length > 0 && !selectedSheet) {
      setSelectedSheet(groupArray[0].name);
    }
  }, [orders]);
  
  // Get the currently selected sheet's orders
  const selectedSheetData = selectedSheet 
    ? sheetGroups.find(group => group.name === selectedSheet)?.orders || []
    : [];
    
  // Apply search to selected sheet data
  const filteredOrders = selectedSheetData.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.name.toLowerCase().includes(searchLower) ||
      order.phone.toLowerCase().includes(searchLower) ||
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.product.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)
    );
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get status badge color
  const getStatusColor = (status: string): string => {
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
          <h1 className="text-2xl md:text-3xl font-bold">Sheet Data</h1>
          <p className="text-muted-foreground">
            View and manage order data by uploaded sheets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{sheetGroups.length} Sheets</span>
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sheet Explorer</CardTitle>
          <CardDescription>Browse orders categorized by sheet uploads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sheetGroups.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sheets found</h3>
              <p className="text-muted-foreground">Upload CSV files to see data categorized by sheets</p>
            </div>
          ) : (
            <>
              <Tabs value={selectedSheet || ''} onValueChange={setSelectedSheet} className="w-full">
                <ScrollableTabsList>
                  {sheetGroups.map(group => (
                    <TabsTrigger 
                      key={group.name} 
                      value={group.name}
                      className="flex items-center gap-2"
                    >
                      <CalendarDays className="h-4 w-4" />
                      <div className="flex flex-col items-start text-left">
                        <span>{group.name}</span>
                        <span className="text-xs text-muted-foreground">{group.orders.length} orders</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </ScrollableTabsList>
                
                {sheetGroups.map(group => (
                  <TabsContent key={group.name} value={group.name} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          placeholder="Search orders in this sheet..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="w-full md:w-1/4">
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
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
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
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">
                                No orders found matching your criteria
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {totalPages > 1 && (
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink 
                                  isActive={currentPage === pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <span className="px-2">...</span>
                            </PaginationItem>
                          )}
                          
                          {totalPages > 5 && (
                            <PaginationItem>
                              <PaginationLink
                                isActive={currentPage === totalPages}
                                onClick={() => handlePageChange(totalPages)}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          )}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for scrollable tabs
const ScrollableTabsList: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="relative w-full overflow-auto pb-1">
      <TabsList className="w-max flex space-x-2">
        {children}
      </TabsList>
    </div>
  );
};

export default SheetData;
