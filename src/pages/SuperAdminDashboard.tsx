import React, { useState, useEffect } from 'react';
import { Crown, Users, Shield, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { SuperAdminGuard } from '../components/auth/SuperAdminGuard';
import { AdminService, Admin } from '../services/adminService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

/**
 * SuperAdminDashboard - Dashboard page exclusively for Super Admin
 * 
 * Features:
 * - View all admins (including Super Admin)
 * - System-wide statistics
 * - Super Admin specific controls
 * - Protected by SuperAdminGuard
 */
const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAdmins: 0,
    regularAdmins: 0,
    moderators: 0,
    superAdmins: 0,
  });

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      
      // Super Admin can see ALL admins including themselves
      const [adminsData, roleStats] = await Promise.all([
        AdminService.getAllAdmins(true), // includeSuperAdmin = true
        AdminService.getAdminRoleStats(true), // includeSuperAdmin = true
      ]);

      setAllAdmins(adminsData);
      setStats({
        totalAdmins: roleStats.total,
        regularAdmins: roleStats.admins,
        moderators: roleStats.moderators,
        superAdmins: roleStats.superAdmins,
      });
    } catch (error) {
      console.error('Error loading Super Admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading Super Admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-purple-100">
          Welcome back, {user?.name}! You have full system access.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAdmins}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.regularAdmins}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moderators</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.moderators}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.superAdmins}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">
              Super Admin Privileges Active
            </p>
            <p className="text-xs text-purple-700">
              You can view and manage all administrators including yourself. 
              Regular admins cannot see your account in their lists.
            </p>
          </div>
        </div>
      </div>

      {/* All Admins List (Including Super Admin) */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All System Administrators</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete list including Super Admin (only visible to you)
          </p>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allAdmins.map((admin) => (
                  <tr
                    key={admin.admin_id}
                    className={`transition-colors ${
                      admin.is_super_admin 
                        ? 'bg-purple-50 hover:bg-purple-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            admin.is_super_admin
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            <span className="text-white font-medium text-sm">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {admin.name}
                            {admin.is_super_admin && (
                              <Crown className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        admin.is_super_admin
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : admin.role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {admin.role === 'SUPERADMIN' ? 'Super Admin' : admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        admin.is_super_admin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {admin.is_super_admin ? 'Supabase Auth' : 'Database'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.last_login 
                        ? new Date(admin.last_login).toLocaleString()
                        : 'Never'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-900">Authentication System</span>
            </div>
            <span className="text-xs text-green-700">Operational</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-900">Database Connection</span>
            </div>
            <span className="text-xs text-green-700">Operational</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-900">Row Level Security</span>
            </div>
            <span className="text-xs text-green-700">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with SuperAdminGuard protection
export default function ProtectedSuperAdminDashboard() {
  return (
    <SuperAdminGuard showAccessDenied={true}>
      <SuperAdminDashboard />
    </SuperAdminGuard>
  );
}
