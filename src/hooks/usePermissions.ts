
import { useAuth } from '@/context/AuthContext';

export const usePermissions = () => {
  const { isAuthenticated } = useAuth();
  
  return {
    canEdit: isAuthenticated,
    canDelete: isAuthenticated
  };
};
