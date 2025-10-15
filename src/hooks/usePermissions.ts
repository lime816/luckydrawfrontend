import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export type PermissionLevel = 'read' | 'write' | 'update';

export type PagePermissions = {
  dashboard?: PermissionLevel[];
  contests?: PermissionLevel[];
  participants?: PermissionLevel[];
  draw?: PermissionLevel[];
  winners?: PermissionLevel[];
  communication?: PermissionLevel[];
  analytics?: PermissionLevel[];
  settings?: PermissionLevel[];
  user_management?: PermissionLevel[];
  admin_management?: PermissionLevel[];
};

export type PageKey = keyof PagePermissions;

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  const permissions: PagePermissions = useMemo(() => {
    // Super Admin has all permissions
    if (user?.role === 'SUPER_ADMIN') {
      return {
        dashboard: ['read', 'write', 'update'],
        contests: ['read', 'write', 'update'],
        participants: ['read', 'write', 'update'],
        draw: ['read', 'write', 'update'],
        winners: ['read', 'write', 'update'],
        communication: ['read', 'write', 'update'],
        analytics: ['read', 'write', 'update'],
        settings: ['read', 'write', 'update'],
        user_management: ['read', 'write', 'update'],
        admin_management: ['read', 'write', 'update'],
      };
    }

    // Return user's specific permissions from database
    // This will be populated when the user logs in
    return (user as any)?.permissions || {};
  }, [user]);

  /**
   * Check if user has access to a specific page
   */
  const hasPageAccess = (page: PageKey): boolean => {
    const pagePerms = permissions[page];
    return pagePerms !== undefined && pagePerms.length > 0;
  };

  /**
   * Check if user has a specific permission level for a page
   */
  const hasPermission = (page: PageKey, level: PermissionLevel): boolean => {
    const pagePerms = permissions[page];
    return pagePerms !== undefined && pagePerms.includes(level);
  };

  /**
   * Check if user can read (view) a page
   */
  const canRead = (page: PageKey): boolean => {
    return hasPermission(page, 'read');
  };

  /**
   * Check if user can write (create) on a page
   */
  const canWrite = (page: PageKey): boolean => {
    return hasPermission(page, 'write');
  };

  /**
   * Check if user can update (edit/delete) on a page
   */
  const canUpdate = (page: PageKey): boolean => {
    return hasPermission(page, 'update');
  };

  /**
   * Get all accessible pages for the user
   */
  const getAccessiblePages = (): PageKey[] => {
    return Object.keys(permissions).filter(
      (page) => hasPageAccess(page as PageKey)
    ) as PageKey[];
  };

  /**
   * Check if user is Super Admin
   */
  const isSuperAdmin = (): boolean => {
    return user?.role === 'SUPER_ADMIN';
  };

  /**
   * Check if user is Admin
   */
  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN';
  };

  /**
   * Check if user is Moderator
   */
  const isModerator = (): boolean => {
    return user?.role === 'MODERATOR';
  };

  return {
    permissions,
    hasPageAccess,
    hasPermission,
    canRead,
    canWrite,
    canUpdate,
    getAccessiblePages,
    isSuperAdmin,
    isAdmin,
    isModerator,
  };
};
