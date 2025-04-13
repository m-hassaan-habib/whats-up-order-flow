
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, FileSpreadsheet, Home, MessageSquareText, Settings, ListOrdered, Database, Edit, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthStatus } from '@/components/AuthStatus';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/csv-upload', label: 'CSV Upload', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { path: '/orders', label: 'Orders', icon: <ListOrdered className="h-5 w-5" /> },
    ...(isAuthenticated ? [{ path: '/manage-orders', label: 'Manage Orders', icon: <Edit className="h-5 w-5" /> }] : []),
    { path: '/sheets', label: 'Sheet Data', icon: <Database className="h-5 w-5" /> },
    { path: '/messages', label: 'Messages', icon: <MessageSquareText className="h-5 w-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            location.pathname === item.path 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar">
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <div className="h-8 w-8 rounded-full bg-whatsapp flex items-center justify-center">
            <MessageSquareText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">WhatsBot</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium">MV</span>
            </div>
            <span className="text-sm font-medium">Mihraaj Ventures</span>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <header className="md:hidden border-b p-4 sticky top-0 bg-background z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-2 py-4 border-b">
                  <div className="h-8 w-8 rounded-full bg-whatsapp flex items-center justify-center">
                    <MessageSquareText className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold">WhatsBot</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  <NavLinks />
                </nav>
                <div className="p-4 border-t">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">MV</span>
                    </div>
                    <span className="text-sm font-medium">Mihraaj Ventures</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="h-8 w-8 rounded-full bg-whatsapp flex items-center justify-center">
            <MessageSquareText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">WhatsBot</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Current page indicator for mobile */}
          <span className="text-sm font-medium">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </header>
      
      {/* Main content with auth status */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
        <div className="flex justify-end mb-4">
          <AuthStatus />
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
