
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Check, Clock, MessageSquare, X, BarChart3, FileSpreadsheet, Send, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { OrderData } from '@/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';

const Dashboard = () => {
  const { orders, isWhatsappReady, settings } = useAppContext();
  const isMobile = useIsMobile();
  
  // Calculate summary stats
  const totalOrders = orders.length;
  const confirmed = orders.filter(order => order.status === 'Confirmed').length;
  const notResponding = orders.filter(order => order.status === 'Not Responding').length;
  const toProcess = orders.filter(order => order.status === 'To Process').length;
  const cancelled = orders.filter(order => order.status === 'Cancelled').length;
  
  // Calculate confirmation rate
  const confirmationRate = totalOrders > 0 
    ? Math.round((confirmed / totalOrders) * 100) 
    : 0;
  
  // Get recent orders (max 5)
  const recentOrders = [...orders]
    .sort((a, b) => {
      const dateA = a.lastMessageSent ? new Date(a.lastMessageSent).getTime() : 0;
      const dateB = b.lastMessageSent ? new Date(b.lastMessageSent).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp order follow-ups
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <ThemeToggle />
          
          <Link to="/csv-upload">
            <Button 
              className="flex items-center gap-2"
              size={isMobile ? "sm" : "default"}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {!isMobile ? "Upload CSV" : "CSV"}
            </Button>
          </Link>
          <Link to="/messages">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              size={isMobile ? "sm" : "default"}
            >
              <Send className="h-4 w-4" />
              {!isMobile ? "Send Messages" : "Send"}
            </Button>
          </Link>
        </div>
      </div>
      
      {!isWhatsappReady && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-200" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100">WhatsApp Connection Required</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You need to connect to WhatsApp to send messages. Go to Settings to set up your WhatsApp connection.
                </p>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="mt-2">
                    Go to Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmed}</div>
            <Progress value={confirmationRate} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {confirmationRate}% confirmed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Not Responding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{notResponding}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              To Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{toProcess}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/messages">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: OrderData) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                      {order.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{order.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[150px] md:max-w-full">{order.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium">No orders yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV file to get started
              </p>
              <Link to="/csv-upload">
                <Button variant="outline" size="sm" className="mt-4">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground truncate w-full">
            <strong>Business:</strong> {settings.businessName} | 
            <strong> Website:</strong> {settings.websiteUrl}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
