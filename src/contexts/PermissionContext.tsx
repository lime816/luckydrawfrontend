import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminService, Admin, PagePermissions } from '../services/adminService';

interface PermissionContextType {
  currentAdmin: Admin | null;
  permissions: PagePermissions;
  isLoading: boolean;
  isSuperAdmin: boolean;
  hasPagePermission: (page: keyof PagePermissions, level: 'read' | 'write' | 'update') => boolean;
  refreshPermissions: () => Promise<void>;
  setCurrentAdmin: (admin: Admin | null) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [permissions, setPermissions] = useState<PagePermissions>({});
  const [isLoading, setIsLoading] = useState(true);

  const isSuperAdmin = currentAdmin?.role === 'SUPERADMIN';

  const hasPagePermission = (page: keyof PagePermissions, level: 'read' | 'write' | 'update'): boolean => {
    if (isSuperAdmin) return true;
    
    const pagePermissions = permissions[page] || [];
    return pagePermissions.includes(level);
  };

  const refreshPermissions = async () => {
    if (!currentAdmin) {
      setPermissions({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Super admins have all permissions by default
      if (currentAdmin.role === 'SUPERADMIN') {
        setPermissions({
          dashboard: ['read', 'write', 'update'],
          contests: ['read', 'write', 'update'],
          participants: ['read', 'write', 'update'],
          draw: ['read', 'write', 'update'],
          winners: ['read', 'write', 'update'],
          communication: ['read', 'write', 'update'],
          analytics: ['read', 'write', 'update'],
          settings: ['read', 'write', 'update'],
        });
      } else {
        const perms = await AdminService.getAdminPermissions(currentAdmin.admin_id);
        setPermissions(perms);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPermissions();
  }, [currentAdmin]);

  return (
    <PermissionContext.Provider
      value={{
        currentAdmin,
        permissions,
        isLoading,
        isSuperAdmin,
        hasPagePermission,
        refreshPermissions,
        setCurrentAdmin,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Higher-order component to protect routes based on page permissions
export const withPagePermission = <P extends object>(
  Component: React.ComponentType<P>,
  page: keyof PagePermissions,
  requiredLevel: 'read' | 'write' | 'update'
) => {
  return (props: P) => {
    const { hasPagePermission, isLoading } = usePermissions();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      );
    }

    if (!hasPagePermission(page, requiredLevel)) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required: {page} - {requiredLevel}</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
