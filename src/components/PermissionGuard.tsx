
import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};
