import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Shield, AlertTriangle } from 'lucide-react';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

/**
 * SuperAdminGuard - Protects routes that should only be accessible by Super Admin
 * 
 * Usage:
 * <SuperAdminGuard>
 *   <SuperAdminOnlyComponent />
 * </SuperAdminGuard>
 */
export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  redirectTo = '/dashboard',
  showAccessDenied = true,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== UserRole.SUPER_ADMIN) {
      setShowDenied(true);
      
      // Auto-redirect after 3 seconds if access denied screen is shown
      if (showAccessDenied) {
        const timer = setTimeout(() => {
          setShowDenied(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user, showAccessDenied]);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Not Super Admin
  if (user?.role !== UserRole.SUPER_ADMIN) {
    // Show access denied screen if enabled
    if (showAccessDenied && showDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-red-100 rounded-full p-6">
                  <AlertTriangle className="w-16 h-16 text-red-600" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Access Denied
            </h1>
            
            <p className="text-gray-600 mb-6">
              This page is restricted to Super Administrators only.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Insufficient Permissions
                  </p>
                  <p className="text-xs text-red-700">
                    Your current role: <span className="font-semibold">{user?.role}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard...
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-red-600 h-full rounded-full animate-[progress_3s_linear]"></div>
            </div>
          </div>
        </div>
      );
    }
    
    // Redirect immediately if access denied screen is disabled
    return <Navigate to={redirectTo} replace />;
  }

  // User is Super Admin - allow access
  return <>{children}</>;
};

// Add CSS animation for progress bar
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    from { width: 0%; }
    to { width: 100%; }
  }
`;
document.head.appendChild(style);
