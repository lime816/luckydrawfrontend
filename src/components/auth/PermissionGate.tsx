import React from 'react';
import { usePermissions, PageKey, PermissionLevel } from '../../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  page: PageKey;
  permission?: PermissionLevel;
  fallback?: React.ReactNode;
}

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 * 
 * Usage:
 * <PermissionGate page="contests" permission="write">
 *   <button>Create Contest</button>
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  page,
  permission,
  fallback = null,
}) => {
  const { hasPageAccess, hasPermission } = usePermissions();

  // If no specific permission required, just check page access
  if (!permission) {
    return hasPageAccess(page) ? <>{children}</> : <>{fallback}</>;
  }

  // Check specific permission level
  return hasPermission(page, permission) ? <>{children}</> : <>{fallback}</>;
};

/**
 * Show component only if user can read the page
 */
export const CanRead: React.FC<{ page: PageKey; children: React.ReactNode }> = ({
  page,
  children,
}) => {
  const { canRead } = usePermissions();
  return canRead(page) ? <>{children}</> : null;
};

/**
 * Show component only if user can write to the page
 */
export const CanWrite: React.FC<{ page: PageKey; children: React.ReactNode }> = ({
  page,
  children,
}) => {
  const { canWrite } = usePermissions();
  return canWrite(page) ? <>{children}</> : null;
};

/**
 * Show component only if user can update on the page
 */
export const CanUpdate: React.FC<{ page: PageKey; children: React.ReactNode }> = ({
  page,
  children,
}) => {
  const { canUpdate } = usePermissions();
  return canUpdate(page) ? <>{children}</> : null;
};

/**
 * Show component only for Super Admin
 */
export const SuperAdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperAdmin } = usePermissions();
  return isSuperAdmin() ? <>{children}</> : null;
};
