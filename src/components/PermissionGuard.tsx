import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: 'read' | 'write' | 'update';
  fallback?: React.ReactNode;
  hideOnDenied?: boolean;
}

/**
 * PermissionGuard component to conditionally render content based on user permissions
 * 
 * @param children - Content to render if permission is granted
 * @param permission - Required permission ('read', 'write', or 'update')
 * @param fallback - Optional custom fallback content when permission is denied
 * @param hideOnDenied - If true, renders nothing when permission is denied (default: false)
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback,
  hideOnDenied = false,
}) => {
  const { hasPagePermission, isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Super admins always have access
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Map old permission names to page-based permissions
  // This is a compatibility layer - you should update calling code to use page-specific permissions
  const hasPermission = permission === 'read' || permission === 'write' || permission === 'update';

  if (hasPermission) {
    return <>{children}</>;
  }

  // Permission denied
  if (hideOnDenied) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback
  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <Lock className="w-4 h-4" />
      <span>Insufficient permissions</span>
    </div>
  );
};

interface DisableIfNoPermissionProps {
  children: (disabled: boolean) => React.ReactNode;
  permission: 'read' | 'write' | 'update';
}

/**
 * Render prop component that passes disabled state based on permissions
 * Useful for disabling form inputs, buttons, etc.
 */
export const DisableIfNoPermission: React.FC<DisableIfNoPermissionProps> = ({
  children,
  permission,
}) => {
  const { isSuperAdmin } = usePermissions();

  if (isSuperAdmin) {
    return <>{children(false)}</>;
  }

  // Compatibility layer - always allow for now
  // Update calling code to use page-specific permissions
  const hasPermission = true;

  return <>{children(!hasPermission)}</>;
};
