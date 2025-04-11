
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { 
  Smartphone, CheckSquare, Send, Filter, InfoIcon, Search, 
  MoreHorizontal, AlertTriangle, CheckCircle, XCircle, Clock, 
  Loader2, Moon, Sun 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { OrderData, OrderStatus } from '@/types';
import { toast } from 'sonner';
import { OrderListPagination } from '@/components/OrderListPagination';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MessagePreviewProps {
  orderId: string;
  orderNumber: string; // Added orderNumber
  customerName: string;
  product: string;
  message: string;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ 
  orderId, 
  orderNumber, // Added orderNumber
  customerName, 
  product, 
  message 
}) => {
  const [showFullMessage, setShowFullMessage] = useState(false);
  
  const displayedMessage = showFullMessage ? message : message.substring(0, 100) + (message.length > 100 ? '...' : '');
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 text-left w-full">
          <div className="message-bubble received w-full my-1">
            <div className="text-xs text-muted-foreground">To: {customerName}</div>
            <div className="whitespace-pre-line break-words">{displayedMessage}</div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message Preview</DialogTitle>
          <DialogDescription>
            Preview the message that will be sent to {customerName} for {product} (Order #{orderNumber})
          </DialogDescription>
        </DialogHeader>
        <div className="message-bubble received w-full my-2">
          <div className="text-xs text-muted-foreground">To: {customerName}</div>
          <div className="whitespace-pre-line break-words">{message}</div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Messages = () => {
  const { 
    orders, 
    updateOrderStatus, 
    templates, 
    settings, 
    isWhatsappReady, 
    selectedOrders, 
    toggleOrderSelection, 
    selectAllOrders,
    processingStatus,
    setProcessingStatus
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || '');
  const [customMessage, setCustomMessage] = useState('');
  const [messageMode, setMessageMode] = useState<'template' | 'custom'>('template');
  const [showCustomMessageDialog, setShowCustomMessageDialog] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Check if all orders are selected
  const allSelected = orders.length > 0 && selectedOrders.length === orders.length;
  
  // Filter orders based on search query and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const matchesSearch = 
        searchQuery === '' || 
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        order.orderNumber.includes(searchQuery); // Added order number to search
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  
  // Get current page orders
  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage, itemsPerPage]);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);
  
  // Make sure current page is valid when total pages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Handle sending messages
  const sendWhatsAppMessages = async () => {
    if (!isWhatsappReady) {
      toast.error("WhatsApp is not connected. Please go to settings to connect WhatsApp first.");
      return;
    }
    
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order to send messages");
      return;
    }
    
    // Get the message content
    let messageToSend;
    if (messageMode === 'template') {
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
      if (!selectedTemplateData) {
        toast.error("Please select a valid message template");
        return;
      }
      messageToSend = selectedTemplateData.content;
    } else {
      if (!customMessage.trim()) {
        toast.error("Please enter a custom message");
        return;
      }
      messageToSend = customMessage;
    }
    
    // Initialize processingStatus for selected orders
    const newProcessingStatus = { ...processingStatus };
    selectedOrders.forEach(id => {
      newProcessingStatus[id] = 'processing';
    });
    setProcessingStatus(newProcessingStatus);
    
    // Simulate sending messages with a slight delay to show the processing UI
    const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
    
    for (const order of selectedOrdersData) {
      try {
        // In a real implementation, this would connect to your Python backend
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Format the message with order data
        let formattedMessage = messageToSend
          .replace(/{name}/g, order.name)
          .replace(/{businessName}/g, settings.businessName)
          .replace(/{product}/g, order.product)
          .replace(/{orderNumber}/g, order.orderNumber || order.id.substring(0, 8))
          .replace(/{websiteUrl}/g, settings.websiteUrl);
        
        console.log(`Sending message to ${order.name} (${order.phone}): ${formattedMessage}`);
        
        // Simulate successful message sending
        newProcessingStatus[order.id] = 'success';
        setProcessingStatus({ ...newProcessingStatus });
        
        // In a real application, we would update the order with the timestamp
        const now = new Date().toISOString();
        // updateOrder logic would go here
      } catch (error) {
        console.error(`Error sending message to ${order.phone}:`, error);
        newProcessingStatus[order.id] = 'error';
        setProcessingStatus({ ...newProcessingStatus });
      }
    }
    
    toast.success(`Messages sent to ${selectedOrdersData.length} customers`);
  };
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Not Responding':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'To Process':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">{status}</Badge>;
      case 'Not Responding':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">{status}</Badge>;
      case 'To Process':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getProcessingStatusIcon = (id: string) => {
    const status = processingStatus[id];
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Format a message with customer data for preview
  const formatMessageWithData = (messageTemplate: string, order: OrderData) => {
    return messageTemplate
      .replace(/{name}/g, order.name)
      .replace(/{businessName}/g, settings.businessName)
      .replace(/{product}/g, order.product)
      .replace(/{orderNumber}/g, order.orderNumber || order.id.substring(0, 8))
      .replace(/{websiteUrl}/g, settings.websiteUrl);
  };
  
  // Get the current message template for previews
  const getCurrentMessageTemplate = () => {
    if (messageMode === 'custom') {
      return customMessage;
    } else {
      const template = templates.find(t => t.id === selectedTemplate);
      return template ? template.content : '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Send and manage WhatsApp messages to your customers
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          
          {!isWhatsappReady && (
            <Link to="/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Connect WhatsApp
              </Button>
            </Link>
          )}
          
          <Button 
            onClick={() => sendWhatsAppMessages()}
            disabled={!isWhatsappReady || selectedOrders.length === 0}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Messages
          </Button>
        </div>
      </div>
      
      {!isWhatsappReady && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>WhatsApp not connected</AlertTitle>
          <AlertDescription>
            You need to connect WhatsApp to send messages. Go to Settings to connect.
          </AlertDescription>
        </Alert>
      )}
      
      {orders.length === 0 && (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <InfoIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to import order data before you can send messages
            </p>
            <Link to="/csv-upload">
              <Button>Upload CSV</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      {orders.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Order List</h2>
                <span className="text-sm text-muted-foreground">
                  {filteredOrders.length} of {orders.length} orders
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, product, order #, or phone"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="To Process">To Process</SelectItem>
                      <SelectItem value="Not Responding">Not Responding</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left p-3">
                          <Checkbox 
                            checked={allSelected} 
                            onCheckedChange={selectAllOrders}
                            disabled={orders.length === 0}
                          />
                        </th>
                        <th className="text-left p-3 font-medium text-sm">Order #</th>
                        <th className="text-left p-3 font-medium text-sm">Customer</th>
                        <th className="text-left p-3 font-medium text-sm">Product</th>
                        <th className="text-left p-3 font-medium text-sm">Status</th>
                        <th className="text-left p-3 font-medium text-sm w-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/20">
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Checkbox 
                                  checked={selectedOrders.includes(order.id)} 
                                  onCheckedChange={() => toggleOrderSelection(order.id)}
                                />
                                {getProcessingStatusIcon(order.id)}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">#{order.orderNumber || order.id.substring(0, 8)}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{order.name}</div>
                              <div className="text-sm text-muted-foreground">{order.phone}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">{order.product}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {getStatusBadge(order.status)}
                              </div>
                            </td>
                            <td className="p-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => toggleOrderSelection(order.id)}
                                  >
                                    {selectedOrders.includes(order.id) ? 'Unselect' : 'Select'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                                    className="text-green-600 dark:text-green-400"
                                  >
                                    Mark as Confirmed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, 'Not Responding')}
                                    className="text-amber-600 dark:text-amber-400"
                                  >
                                    Mark as Not Responding
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, 'To Process')}
                                    className="text-blue-600 dark:text-blue-400"
                                  >
                                    Mark as To Process
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    Mark as Cancelled
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground">
                            No orders match your search criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {filteredOrders.length > 0 && (
                  <div className="p-3 border-t">
                    <OrderListPagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Message Template</h2>
              
              <Tabs value={messageMode} onValueChange={(value) => setMessageMode(value as 'template' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template">Template</TabsTrigger>
                  <TabsTrigger value="custom">Custom Message</TabsTrigger>
                </TabsList>
                
                <TabsContent value="template" className="space-y-4 pt-4">
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="border rounded-md p-4 bg-background">
                    <h3 className="text-sm font-medium mb-2">Message Preview</h3>
                    {selectedTemplate && (
                      <div className="whitespace-pre-line text-sm">
                        {templates.find(t => t.id === selectedTemplate)?.content}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-3">
                      <p>Available variables:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>{'{name}'} - Customer name</li>
                        <li>{'{businessName}'} - Your business name</li>
                        <li>{'{product}'} - Product name</li>
                        <li>{'{orderNumber}'} - Order number</li>
                        <li>{'{websiteUrl}'} - Your website URL</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Type your custom message here..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="min-h-[200px]"
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Available variables:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>{'{name}'} - Customer name</li>
                      <li>{'{businessName}'} - Your business name</li>
                      <li>{'{product}'} - Product name</li>
                      <li>{'{orderNumber}'} - Order number</li>
                      <li>{'{websiteUrl}'} - Your website URL</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="text-sm font-medium mb-2">Customer Message Preview</h3>
                {selectedOrders.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {orders
                      .filter(order => selectedOrders.includes(order.id))
                      .slice(0, 5)
                      .map(order => (
                        <MessagePreview
                          key={order.id}
                          orderId={order.id}
                          orderNumber={order.orderNumber || order.id.substring(0, 8)}
                          customerName={order.name}
                          product={order.product}
                          message={formatMessageWithData(getCurrentMessageTemplate(), order)}
                        />
                      ))
                    }
                    {selectedOrders.length > 5 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{selectedOrders.length - 5} more customers selected
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Select customers to preview messages</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => sendWhatsAppMessages()}
                disabled={!isWhatsappReady || selectedOrders.length === 0}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedOrders.length} Customer{selectedOrders.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Message Dialog */}
      <Dialog open={showCustomMessageDialog} onOpenChange={setShowCustomMessageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compose Custom Message</DialogTitle>
            <DialogDescription>
              Write a custom message to send to selected customers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-message">Message</Label>
              <Textarea
                id="custom-message"
                placeholder="Type your message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs font-medium mb-1">Available variables:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-mono">{'{name}'}</span> - Customer name</p>
                <p><span className="font-mono">{'{businessName}'}</span> - Your business name</p>
                <p><span className="font-mono">{'{product}'}</span> - Product name</p>
                <p><span className="font-mono">{'{orderNumber}'}</span> - Order number</p>
                <p><span className="font-mono">{'{websiteUrl}'}</span> - Website URL</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (customMessage.trim()) {
                setMessageMode('custom');
                setShowCustomMessageDialog(false);
              } else {
                toast.error("Please enter a message");
              }
            }}>
              Save Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
