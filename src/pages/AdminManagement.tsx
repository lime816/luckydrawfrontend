import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Activity,
  Lock,
  Search,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  Crown,
  Calendar,
  Settings,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { AdminService, Admin, AdminActivityLog } from '../services/adminService';
import { toast } from 'react-hot-toast';

interface AdminWithStats extends Admin {
  lastActivity?: string;
  permissionCount?: number;
  isLocked?: boolean;
}

interface SummaryCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminWithStats[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'permissions' | 'access'>('users');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminWithStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminWithStats | null>(null);
  const [activityFilter, setActivityFilter] = useState({
    adminId: '',
    action: '',
    status: '',
    dateRange: 'all',
  });
  const [activitySearch, setActivitySearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MODERATOR' as 'ADMIN' | 'SUPERADMIN' | 'MODERATOR',
    custom_role: '',
    permissions: {
      dashboard: ['read'] as ('read' | 'write' | 'update')[],
      contests: [] as ('read' | 'write' | 'update')[],
      participants: [] as ('read' | 'write' | 'update')[],
      draw: [] as ('read' | 'write' | 'update')[],
      winners: [] as ('read' | 'write' | 'update')[],
      communication: [] as ('read' | 'write' | 'update')[],
      analytics: [] as ('read' | 'write' | 'update')[],
      settings: [] as ('read' | 'write' | 'update')[],
      user_management: [] as ('read' | 'write' | 'update')[],
    },
    two_factor: false,
    is_approval_manager: false,
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalAdmins: 0,
    totalModerators: 0,
    activeUsers: 0,
    twoFactorEnabled: 0,
  });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Note: getAllAdmins() automatically excludes Super Admin from Supabase Auth
      // Super Admin is only visible to themselves and is managed separately
      const [adminsData, activityData, roleStats] = await Promise.all([
        AdminService.getAllAdmins(), // Excludes Super Admin by default
        AdminService.getAdminActivityLogs(),
        AdminService.getAdminRoleStats(), // Excludes Super Admin from counts
      ]);

      // Enhance admins with additional stats
      const enhancedAdmins: AdminWithStats[] = adminsData.map(admin => ({
        ...admin,
        lastActivity: activityData
          .filter(log => log.admin_id === admin.admin_id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp,
        permissionCount: getPermissionCount(admin.role),
        isLocked: Math.random() > 0.8, // Random for demo
      }));

      setAdmins(enhancedAdmins);
      setActivityLogs(activityData);

      // Calculate summary statistics
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      setSummaryStats({
        totalAdmins: roleStats.superAdmins + roleStats.admins,
        totalModerators: roleStats.moderators,
        activeUsers: enhancedAdmins.filter(admin => 
          admin.last_login && new Date(admin.last_login) > last24Hours
        ).length,
        twoFactorEnabled: enhancedAdmins.filter(admin => admin.two_factor).length,
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionCount = (role: string): number => {
    const permissionCounts = {
      SUPERADMIN: 18,
      ADMIN: 14,
      MODERATOR: 7,
    };
    return permissionCounts[role as keyof typeof permissionCounts] || 0;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      SUPERADMIN: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: Crown },
      ADMIN: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Shield },
      MODERATOR: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: UserCheck },
    };

    const config = variants[role as keyof typeof variants] || variants.MODERATOR;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:shadow-md hover:scale-105`}>
        <Icon className="w-3 h-3" />
        {role === 'SUPERADMIN' ? 'Super Admin' : role.charAt(0) + role.slice(1).toLowerCase()}
      </span>
    );
  };

  // Removed getTwoFactorBadge - not currently used

  const handleAction = async (action: string, admin: AdminWithStats) => {
    try {
      switch (action) {
        case 'edit':
          setSelectedAdmin(admin);
          setFormData({
            name: admin.name,
            email: admin.email,
            password: '',
            role: admin.role,
            custom_role: admin.custom_role || '',
            permissions: {
              dashboard: admin.permissions?.dashboard || ['read'],
              contests: admin.permissions?.contests || [],
              participants: admin.permissions?.participants || [],
              draw: admin.permissions?.draw || [],
              winners: admin.permissions?.winners || [],
              communication: admin.permissions?.communication || [],
              analytics: admin.permissions?.analytics || [],
              settings: admin.permissions?.settings || [],
              user_management: admin.permissions?.user_management || [],
            },
            two_factor: admin.two_factor,
            is_approval_manager: (admin as any).is_approval_manager || false,
          });
          setShowEditModal(true);
          break;
        case 'view':
          setSelectedAdmin(admin);
          setShowViewModal(true);
          break;
        case 'lock':
          // Toggle lock status (for demo purposes, we'll just update a local state)
          const updatedAdmins = admins.map(a => 
            a.admin_id === admin.admin_id 
              ? { ...a, isLocked: !a.isLocked }
              : a
          );
          setAdmins(updatedAdmins);
          toast.success(`${admin.isLocked ? 'Unlocked' : 'Locked'} ${admin.name}`);
          break;
        case 'delete':
          setAdminToDelete(admin);
          setShowDeleteModal(true);
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} admin`);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      await AdminService.deleteAdmin(adminToDelete.admin_id);
      
      // Log the admin deletion activity
      try {
        await AdminService.logActivity(
          1, // Current admin ID (you should get this from auth context)
          'DELETE_ADMIN',
          'admins',
          adminToDelete.admin_id,
          undefined,
          'SUCCESS'
        );
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }
      
      toast.success(`Deleted ${adminToDelete.name}`);
      setShowDeleteModal(false);
      setAdminToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    }
  };

  const handleCreateAdmin = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Check admin limit - Maximum 5 admins allowed
      if (admins.length >= 5) {
        toast.error('Maximum limit reached! Only 5 admins can be created.');
        return;
      }

      // Trim inputs to avoid whitespace issues
      const trimmedEmail = formData.email.trim();
      const trimmedPassword = formData.password.trim();
      const trimmedName = formData.name.trim();

      // Check if email already exists
      const existingAdmin = await AdminService.getAdminByEmail(trimmedEmail);
      if (existingAdmin) {
        toast.error('An admin with this email already exists');
        return;
      }

      console.log('🔧 Creating new admin with credentials:', {
        email: trimmedEmail,
        password: trimmedPassword,
        role: formData.role
      });

      // Create admin with proper field names (AdminService expects snake_case)
      const newAdmin = await AdminService.createAdmin({
        name: trimmedName,
        email: trimmedEmail,
        password_hash: trimmedPassword, // In production, this should be hashed
        role: formData.role,
        custom_role: formData.custom_role.trim() || null,
        permissions: formData.permissions,
        two_factor: formData.two_factor,
      });

      console.log('✅ Admin created successfully in database:', {
        id: newAdmin.admin_id,
        email: newAdmin.email,
        password_hash: newAdmin.password_hash
      });

      // Log the admin creation activity
      try {
        await AdminService.logActivity(
          1, // Current admin ID (you should get this from auth context)
          'CREATE_ADMIN',
          'admins',
          newAdmin.admin_id,
          undefined,
          'SUCCESS'
        );
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toast.success('Admin created successfully');
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'MODERATOR',
        custom_role: '',
        permissions: {
          dashboard: ['read'],
          contests: [],
          participants: [],
          draw: [],
          winners: [],
          communication: [],
          analytics: [],
          settings: [],
          user_management: [],
        },
        two_factor: false,
        is_approval_manager: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error creating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create admin';
      toast.error(`Failed to create admin: ${errorMessage}`);
    }
  };

  const handleUpdateAdmin = async () => {
    try {
      if (!selectedAdmin || !formData.name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Trim inputs to avoid whitespace issues
      const updates: Partial<Admin> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        custom_role: formData.custom_role.trim() || null,
        permissions: formData.permissions,
        two_factor: formData.two_factor,
      };

      // Only include password if it's provided
      if (formData.password) {
        updates.password_hash = formData.password.trim();
      }

      await AdminService.updateAdmin(selectedAdmin.admin_id, updates);

      // Log the admin update activity
      try {
        await AdminService.logActivity(
          1, // Current admin ID (you should get this from auth context)
          'UPDATE_ADMIN',
          'admins',
          selectedAdmin.admin_id,
          undefined,
          'SUCCESS'
        );
      } catch (logError) {
        console.warn('Failed to log activity:', logError);
      }

      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'MODERATOR',
        custom_role: '',
        permissions: {
          dashboard: ['read'],
          contests: [],
          participants: [],
          draw: [],
          winners: [],
          communication: [],
          analytics: [],
          settings: [],
          user_management: [],
        },
        two_factor: false,
        is_approval_manager: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error updating admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin';
      toast.error(`Failed to update admin: ${errorMessage}`);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivityLogs = activityLogs.filter(log => {
    // Search filter
    const matchesSearch = activitySearch === '' || 
      log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.target_table.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.status.toLowerCase().includes(activitySearch.toLowerCase());

    // Admin filter
    const matchesAdmin = activityFilter.adminId === '' || 
      log.admin_id.toString() === activityFilter.adminId;

    // Action filter
    const matchesAction = activityFilter.action === '' || 
      log.action === activityFilter.action;

    // Status filter
    const matchesStatus = activityFilter.status === '' || 
      log.status === activityFilter.status;

    // Date range filter
    let matchesDate = true;
    if (activityFilter.dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      switch (activityFilter.dateRange) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesAdmin && matchesAction && matchesStatus && matchesDate;
  });

  const getAdminName = (adminId: number): string => {
    const admin = admins.find(a => a.admin_id === adminId);
    return admin ? admin.name : `Admin #${adminId}`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_ADMIN':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE_ADMIN':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE_ADMIN':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'LOGIN':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'LOGOUT':
        return <Lock className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const summaryCards: SummaryCard[] = [
    {
      title: 'Total Admins',
      value: summaryStats.totalAdmins,
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Total Moderators',
      value: summaryStats.totalModerators,
      icon: <Shield className="w-6 h-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Active Users',
      value: summaryStats.activeUsers,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+24%',
      changeType: 'increase',
    },
    // {
    //   title: '2FA Enabled',
    //   value: summaryStats.twoFactorEnabled,
    //   icon: <Lock className="w-6 h-6" />,
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-50',
    //   change: '+15%',
    //   changeType: 'increase',
    // },
  ];

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'permissions', label: 'Permission Matrix', icon: Settings },
    { id: 'access', label: 'Dashboard Access', icon: Eye },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">
            Manage admin users, roles, and permissions 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              admins.length >= 5 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {admins.length}/5 Admins
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              if (admins.length >= 5) {
                toast.error('Maximum limit reached! Only 5 admins allowed.');
                return;
              }
              setShowCreateModal(true);
            }}
            disabled={admins.length >= 5}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              admins.length >= 5
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={admins.length >= 5 ? 'Maximum 5 admins allowed' : 'Add new admin'}
          >
            <Plus className="w-4 h-4" />
            Add Admin {admins.length >= 5 && `(${admins.length}/5)`}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.change && (
                  <p className={`text-xs mt-1 ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change} from last month
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmins.map((admin) => (
                      <tr
                        key={admin.admin_id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {admin.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                              <div className="text-sm text-gray-500">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {/* Show custom role if exists, otherwise show system role badge */}
                            {admin.custom_role ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200 w-fit transition-all duration-200 hover:shadow-md hover:scale-105">
                                  <UserCheck className="w-3 h-3" />
                                  {admin.custom_role}
                                </span>
                                <div className="text-xs text-gray-500">
                                  ({admin.role})
                                </div>
                              </div>
                            ) : (
                              getRoleBadge(admin.role)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {admin.last_login 
                              ? new Date(admin.last_login).toLocaleDateString()
                              : 'Never'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions && Object.keys(admin.permissions).length > 0 ? (
                              <>
                                {Object.entries(admin.permissions).filter(([_, levels]) => levels && Array.isArray(levels) && levels.length > 0).map(([page, levels]) => (
                                  <span key={page} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {page}: {(levels as string[]).join(', ')}
                                  </span>
                                ))}
                              </>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                No permissions
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction('view', admin)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 hover:scale-110"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('edit', admin)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('delete', admin)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAdmins.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new admin.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Activity Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
                    <select
                      value={activityFilter.adminId}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, adminId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Admins</option>
                      {admins.map(admin => (
                        <option key={admin.admin_id} value={admin.admin_id}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select
                      value={activityFilter.action}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Actions</option>
                      <option value="CREATE_ADMIN">Create Admin</option>
                      <option value="UPDATE_ADMIN">Update Admin</option>
                      <option value="DELETE_ADMIN">Delete Admin</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                    <select
                      value={activityFilter.dateRange}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredActivityLogs.length} of {activityLogs.length} activities
                  </p>
                  <button
                    onClick={() => {
                      setActivityFilter({ adminId: '', action: '', status: '', dateRange: 'all' });
                      setActivitySearch('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-3">
                {filteredActivityLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activitySearch || activityFilter.adminId || activityFilter.action || activityFilter.dateRange !== 'all'
                        ? 'Try adjusting your filters.'
                        : 'Admin activities will appear here.'}
                    </p>
                  </div>
                ) : (
                  filteredActivityLogs.map((log) => (
                    <div key={log.log_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {getAdminName(log.admin_id)}
                              </p>
                              <span className="text-sm text-gray-500">performed</span>
                              <span className="text-sm font-medium text-gray-900">
                                {log.action.replace('_', ' ').toLowerCase()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Table: {log.target_table}</span>
                              {log.target_id && <span>ID: {log.target_id}</span>}
                              {log.session_id && <span>Session: {log.session_id.slice(0, 8)}...</span>}
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'SUCCESS' 
                              ? 'bg-green-100 text-green-800' 
                              : log.status === 'FAILURE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More Button */}
              {filteredActivityLogs.length > 0 && filteredActivityLogs.length < activityLogs.length && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      // Load more activities - you can implement pagination here
                      toast('Load more functionality can be implemented here', {
                        icon: 'ℹ️',
                        duration: 3000,
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Load More Activities
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Permission Matrix</h3>
                <p className="text-sm text-gray-500">View all admin permissions at a glance</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Admin
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        📊 Dashboard
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🏆 Contests
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        👥 Participants
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🎲 Draw
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        🏅 Winners
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        💬 Communication
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        📈 Analytics
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        👤 Users
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ⚙️ Settings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => {
                      const getPermissionBadge = (perms: string[] | undefined) => {
                        if (!perms || perms.length === 0) {
                          return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">None</span>;
                        }
                        if (perms.length === 3) {
                          return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Full</span>;
                        }
                        if (perms.includes('read') && perms.includes('write')) {
                          return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">R+W</span>;
                        }
                        if (perms.includes('read')) {
                          return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Read</span>;
                        }
                        return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">Limited</span>;
                      };

                      return (
                        <tr key={admin.admin_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                              <p className="text-xs text-gray-500">{admin.custom_role || admin.role}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.dashboard)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.contests)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.participants)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.draw)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.winners)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.communication)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.analytics)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.user_management)}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getPermissionBadge(admin.permissions?.settings)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="font-medium">Legend:</span>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">Full</span>
                  <span>= Read, Write, Update</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">R+W</span>
                  <span>= Read + Write</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Read</span>
                  <span>= Read only</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">None</span>
                  <span>= No access</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Dashboard Access Control</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage which admins can access the dashboard</p>
                </div>
              </div>

              {/* Access Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Full Access</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">
                        {admins.filter(a => a.permissions?.dashboard?.length === 3).length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Read Only</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {admins.filter(a => {
                          const perms = a.permissions?.dashboard || [];
                          return perms.includes('read') && perms.length < 3;
                        }).length}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">No Access</p>
                      <p className="text-2xl font-bold text-red-900 mt-1">
                        {admins.filter(a => !a.permissions?.dashboard || a.permissions.dashboard.length === 0).length}
                      </p>
                    </div>
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Admin Access List */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900">Admin Dashboard Access</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {admins.map((admin) => {
                    const dashboardPerms = admin.permissions?.dashboard || [];
                    const hasFullAccess = dashboardPerms.length === 3;
                    const hasReadOnly = dashboardPerms.includes('read') && dashboardPerms.length < 3;
                    const hasNoAccess = dashboardPerms.length === 0;

                    return (
                      <div key={admin.admin_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                              <p className="text-xs text-gray-500">{admin.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Role Badge */}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {admin.custom_role || admin.role}
                            </span>

                            {/* Access Badge */}
                            {hasFullAccess && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                <UserCheck className="w-3 h-3" />
                                Full Access
                              </span>
                            )}
                            {hasReadOnly && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <Eye className="w-3 h-3" />
                                Read Only
                              </span>
                            )}
                            {hasNoAccess && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                <Lock className="w-3 h-3" />
                                No Access
                              </span>
                            )}

                            {/* Permissions Detail */}
                            <div className="text-xs text-gray-500">
                              {dashboardPerms.length > 0 ? (
                                <span className="flex items-center gap-1">
                                  {dashboardPerms.includes('read') && <span className="text-blue-600">R</span>}
                                  {dashboardPerms.includes('write') && <span className="text-green-600">W</span>}
                                  {dashboardPerms.includes('update') && <span className="text-purple-600">U</span>}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Box */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">About Dashboard Access</h4>
                    <p className="text-sm text-blue-800">
                      Dashboard access controls what admins can see and do on the main dashboard. 
                      <strong> Full Access</strong> allows viewing, creating, and editing. 
                      <strong> Read Only</strong> allows viewing only. 
                      <strong> No Access</strong> blocks dashboard access completely.
                    </p>
                    <p className="text-sm text-blue-800 mt-2">
                      To modify access, click "Setup permissions" on any user in the Users tab.
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          )}
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin</h3>
            
            {/* Admin Limit Warning */}
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              admins.length >= 4 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <Shield className={`w-5 h-5 ${admins.length >= 4 ? 'text-yellow-600' : 'text-blue-600'}`} />
              <p className={`text-sm ${admins.length >= 4 ? 'text-yellow-800' : 'text-blue-800'}`}>
                {admins.length >= 4 
                  ? `⚠️ Warning: ${5 - admins.length} admin slot${5 - admins.length === 1 ? '' : 's'} remaining!`
                  : `${admins.length}/5 admins created. ${5 - admins.length} slot${5 - admins.length === 1 ? '' : 's'} available.`
                }
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.custom_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Event Manager, Data Analyst, Contest Moderator"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Define the role name for this admin</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Permissions</label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto border border-gray-200">
                  {[
                    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
                    { key: 'contests', label: 'Contest Management', icon: '🏆' },
                    { key: 'participants', label: 'Participant Management', icon: '👥' },
                    { key: 'draw', label: 'Lucky Draw', icon: '🎲' },
                    { key: 'winners', label: 'Winners Management', icon: '🏅' },
                    { key: 'communication', label: 'Communication', icon: '💬' },
                    { key: 'analytics', label: 'Analytics', icon: '📈' },
                    { key: 'user_management', label: 'User Management', icon: '👤' },
                    { key: 'settings', label: 'Settings', icon: '⚙️' },
                  ].map((page) => (
                    <div key={page.key} className="border-b border-gray-200 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {page.icon} {page.label}
                        </span>
                      </div>
                      <div className="flex gap-3 ml-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions[page.key as keyof typeof formData.permissions]?.includes('read') || false}
                            onChange={(e) => {
                              const currentPerms = formData.permissions[page.key as keyof typeof formData.permissions] || [];
                              const newPerms = e.target.checked
                                ? [...currentPerms, 'read']
                                : currentPerms.filter(p => p !== 'read');
                              setFormData({
                                ...formData,
                                permissions: { ...formData.permissions, [page.key]: newPerms }
                              });
                            }}
                            className="w-3 h-3 text-blue-600"
                          />
                          <span className="ml-1 text-xs text-blue-600">Read</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions[page.key as keyof typeof formData.permissions]?.includes('write') || false}
                            onChange={(e) => {
                              const currentPerms = formData.permissions[page.key as keyof typeof formData.permissions] || [];
                              const newPerms = e.target.checked
                                ? [...currentPerms, 'write']
                                : currentPerms.filter(p => p !== 'write');
                              setFormData({
                                ...formData,
                                permissions: { ...formData.permissions, [page.key]: newPerms }
                              });
                            }}
                            className="w-3 h-3 text-green-600"
                          />
                          <span className="ml-1 text-xs text-green-600">Write</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions[page.key as keyof typeof formData.permissions]?.includes('update') || false}
                            onChange={(e) => {
                              const currentPerms = formData.permissions[page.key as keyof typeof formData.permissions] || [];
                              const newPerms = e.target.checked
                                ? [...currentPerms, 'update']
                                : currentPerms.filter(p => p !== 'update');
                              setFormData({
                                ...formData,
                                permissions: { ...formData.permissions, [page.key]: newPerms }
                              });
                            }}
                            className="w-3 h-3 text-purple-600"
                          />
                          <span className="ml-1 text-xs text-purple-600">Update</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {/* Other Permissions Section */}
                  <div className="border-t-2 border-purple-200 pt-3 mt-2">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-purple-700">
                        🔐 Other Permissions
                      </span>
                    </div>
                    <div className="ml-6">
                      <label className="flex items-center cursor-pointer p-2 hover:bg-purple-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.is_approval_manager || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            is_approval_manager: e.target.checked
                          })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">
                            ✅ Approval Manager
                          </span>
                          <p className="text-xs text-gray-500">
                            Can approve or reject contests created by other admins
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Read:</strong> View only | <strong>Write:</strong> Create new | <strong>Update:</strong> Edit & delete
                </p>
              </div>
              
              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="two_factor"
                  checked={formData.two_factor}
                  onChange={(e) => setFormData(prev => ({ ...prev, two_factor: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="two_factor" className="ml-2 block text-sm text-gray-900">
                  Enable Two-Factor Authentication
                </label>
              </div> */}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'MODERATOR',
                    custom_role: '',
                    permissions: {
                      dashboard: ['read'],
                      contests: [],
                      participants: [],
                      draw: [],
                      winners: [],
                      communication: [],
                      analytics: [],
                      settings: [],
                      user_management: [],
                    },
                    two_factor: false,
                    is_approval_manager: false,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter admin name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty to keep current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.custom_role}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Event Manager, Data Analyst, Contest Moderator"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Define the role name for this admin</p>
              </div>
              
              {/* COMMENTED OUT - Permissions UI disabled for Edit Modal */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Permissions</label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  Permissions UI removed temporarily
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Permissions feature is currently disabled
                </p>
              </div> */}
              
              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_two_factor"
                  checked={formData.two_factor}
                  onChange={(e) => setFormData(prev => ({ ...prev, two_factor: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                /> */}
                {/* <label htmlFor="edit_two_factor" className="ml-2 block text-sm text-gray-900">
                  Enable Two-Factor Authentication
                </label> */}
              {/* </div> */}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAdmin(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'MODERATOR',
                    custom_role: '',
                    permissions: {
                      dashboard: ['read'],
                      contests: [],
                      participants: [],
                      draw: [],
                      winners: [],
                      communication: [],
                      analytics: [],
                      settings: [],
                      user_management: [],
                    },
                    two_factor: false,
                    is_approval_manager: false,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAdmin}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Admin Modal */}
      {showViewModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {selectedAdmin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">User Details</h3>
                    <p className="text-blue-100 text-sm">View complete user information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAdmin.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedAdmin.email}</p>
                  </div>
                </div>
              </div>

              {/* Role Information */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Role & Access
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Role</label>
                    <div className="mt-2">
                      {selectedAdmin.custom_role ? (
                        <div className="flex flex-col gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-200 w-fit">
                            <UserCheck className="w-4 h-4" />
                            {selectedAdmin.custom_role}
                          </span>
                          <span className="text-xs text-gray-500">System Role: {selectedAdmin.role}</span>
                        </div>
                      ) : (
                        getRoleBadge(selectedAdmin.role)
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAdmin.permissions && Object.keys(selectedAdmin.permissions).length > 0 ? (
                    <>
                      {Object.entries(selectedAdmin.permissions)
                        .filter(([_, levels]) => levels && Array.isArray(levels) && levels.length > 0)
                        .map(([page, levels]) => (
                          <span key={page} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {page}: {(levels as string[]).join(', ')}
                          </span>
                        ))}
                    </>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-200 text-gray-700">
                      No specific permissions assigned
                    </span>
                  )}
                </div>
              </div>

              {/* Activity Information */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Activity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedAdmin.last_login 
                        ? new Date(selectedAdmin.last_login).toLocaleString()
                        : 'Never logged in'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Created</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {selectedAdmin.created_at 
                        ? new Date(selectedAdmin.created_at).toLocaleString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleAction('edit', selectedAdmin);
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && adminToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Admin
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">{adminToDelete.name}</span>?
              <br />
              <span className="text-sm text-red-600 mt-2 block">
                This action cannot be undone.
              </span>
            </p>

            {/* Admin Info Card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{adminToDelete.name}</p>
                  <p className="text-sm text-gray-600">{adminToDelete.email}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    adminToDelete.role === 'SUPERADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : adminToDelete.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {adminToDelete.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAdminToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAdmin}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
