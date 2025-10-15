import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions, PageKey } from '../../hooks/usePermissions';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  page: PageKey;
  requirePermission?: 'read' | 'write' | 'update';
}

/**
 * Protected Route Component
 * Wraps routes that require specific permissions
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  page,
  requirePermission = 'read',
}) => {
  const { hasPermission, hasPageAccess } = usePermissions();

  // Check if user has access to the page
  if (!hasPageAccess(page)) {
    return <AccessDenied page={page} />;
  }

  // Check if user has the required permission level
  if (!hasPermission(page, requirePermission)) {
    return <AccessDenied page={page} requiredPermission={requirePermission} />;
  }

  return <>{children}</>;
};

/**
 * Access Denied Component
 */
const AccessDenied: React.FC<{
  page: string;
  requiredPermission?: string;
}> = ({ page, requiredPermission }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
          {requiredPermission && (
            <span className="block mt-2 text-sm">
              Required permission: <strong>{requiredPermission}</strong> on{' '}
              <strong>{page}</strong>
            </span>
          )}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
