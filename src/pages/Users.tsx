import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Loader, Settings } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { formatDate } from '../utils/helpers';
import { AdminService, Admin, AdminActivityLog, PagePermissions } from '../services/adminService';
import { PermissionModal } from '../components/permissions/PermissionModal';
import toast from 'react-hot-toast';

export const Users: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleStats, setRoleStats] = useState({
    total: 0,
    superAdmins: 0,
    admins: 0,
    moderators: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAdminForPermissions, setSelectedAdminForPermissions] = useState<Admin | null>(null);

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    passwordHash: '', // In real app, this would be handled securely
    role: 'MODERATOR' as 'ADMIN' | 'SUPERADMIN' | 'MODERATOR',
    customRole: '',
    permissions: {
      dashboard: ['read'] as ('read' | 'write' | 'update')[],
      contests: [] as ('read' | 'write' | 'update')[],
      participants: [] as ('read' | 'write' | 'update')[],
      draw: [] as ('read' | 'write' | 'update')[],
      winners: [] as ('read' | 'write' | 'update')[],
      communication: [] as ('read' | 'write' | 'update')[],
      analytics: [] as ('read' | 'write' | 'update')[],
      settings: [] as ('read' | 'write' | 'update')[],
    },
    twoFactor: false,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [adminsData, activityData, statsData] = await Promise.all([
        AdminService.getAllAdmins(),
        AdminService.getAdminActivityLogs(),
        AdminService.getAdminRoleStats(),
      ]);
      
      setAdmins(adminsData);
      setActivityLogs(activityData);
      setRoleStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: 'ADMIN' | 'SUPERADMIN' | 'MODERATOR') => {
    const variants: Record<string, 'success' | 'info' | 'warning'> = {
      SUPERADMIN: 'success',
      ADMIN: 'info',
      MODERATOR: 'warning',
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const adminColumns = [
    {
      key: 'name',
      header: 'User',
      render: (admin: Admin) => (
        <div>
          <p className="font-medium text-gray-900">{admin.name}</p>
          <p className="text-sm text-gray-500">{admin.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (admin: Admin) => (
        <div>
          {admin.custom_role ? (
            <Badge variant="info">{admin.custom_role}</Badge>
          ) : (
            getRoleBadge(admin.role)
          )}
        </div>
      ),
    },
    // {
    //   key: 'twoFactor',
    //   header: '2FA',
    //   render: (admin: Admin) => (
    //     <Badge variant={admin.two_factor ? 'success' : 'default'} size="sm">
    //       {admin.two_factor ? 'Enabled' : 'Disabled'}
    //     </Badge>
    //   ),
    // },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (admin: Admin) =>
        admin.last_login ? formatDate(admin.last_login, 'MMM dd, yyyy HH:mm') : 'Never',
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (admin: Admin) => formatDate(admin.created_at, 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (admin: Admin) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAdminForPermissions(admin);
              setShowPermissionModal(true);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            title="Setup permissions"
          >
            <Settings className="w-4 h-4" />
            Setup permissions
          </button>
          <button
            onClick={() => handleEdit(admin)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(admin.admin_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const activityColumns = [
    {
      key: 'adminId',
      header: 'Admin ID',
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AdminActivityLog) => (
        <span className="font-medium text-gray-900">{log.action}</span>
      ),
    },
    {
      key: 'targetTable',
      header: 'Resource',
      render: (log: AdminActivityLog) => (
        <Badge variant="info">
          {log.target_table} {log.target_id ? `#${log.target_id}` : ''}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (log: AdminActivityLog) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = {
          SUCCESS: 'success',
          PENDING: 'warning',
          FAILURE: 'danger',
        };
        return <Badge variant={variants[log.status]} size="sm">{log.status}</Badge>;
      },
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log: AdminActivityLog) => formatDate(log.timestamp, 'MMM dd, yyyy HH:mm:ss'),
    },
  ];

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      passwordHash: '', // Don't pre-fill password
      role: admin.role,
      customRole: admin.custom_role || '',
      permissions: {
        dashboard: admin.permissions?.dashboard || ['read'],
        contests: admin.permissions?.contests || [],
        participants: admin.permissions?.participants || [],
        draw: admin.permissions?.draw || [],
        winners: admin.permissions?.winners || [],
        communication: admin.permissions?.communication || [],
        analytics: admin.permissions?.analytics || [],
        settings: admin.permissions?.settings || [],
      },
      twoFactor: admin.two_factor,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await AdminService.deleteAdmin(id);
        toast.success('Admin deleted successfully!');
        await loadData();
      } catch (error) {
        console.error('Error deleting admin:', error);
        toast.error('Failed to delete admin');
      }
    }
  };

  const handleSavePermissions = async (permissions: PagePermissions, customRole: string) => {
    if (!selectedAdminForPermissions) return;

    try {
      await AdminService.updateAdmin(selectedAdminForPermissions.admin_id, {
        permissions,
        custom_role: customRole || null,
      });
      toast.success('Permissions updated successfully!');
      await loadData();
      setShowPermissionModal(false);
      setSelectedAdminForPermissions(null);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
      throw error;
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminForm.name || !adminForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      if (editingAdmin) {
        // Update existing admin - trim inputs to avoid whitespace issues
        const updates: Partial<Admin> = {
          name: adminForm.name.trim(),
          email: adminForm.email.trim(),
          role: adminForm.role,
          custom_role: adminForm.customRole.trim() || null,
          permissions: adminForm.permissions,
          two_factor: adminForm.twoFactor,
        };

        if (adminForm.passwordHash) {
          updates.password_hash = adminForm.passwordHash.trim(); // In real app, hash this
        }

        await AdminService.updateAdmin(editingAdmin.admin_id, updates);
        toast.success('Admin updated successfully!');
      } else {
        // Create new admin
        if (!adminForm.passwordHash) {
          toast.error('Password is required for new admin');
          return;
        }

        // Trim inputs to avoid whitespace issues
        await AdminService.createAdmin({
          name: adminForm.name.trim(),
          email: adminForm.email.trim(),
          password_hash: adminForm.passwordHash.trim(), // In real app, hash this
          role: adminForm.role,
          custom_role: adminForm.customRole.trim() || null,
          permissions: adminForm.permissions,
          two_factor: adminForm.twoFactor,
        });
        toast.success('Admin created successfully!');
      }

      setShowCreateModal(false);
      setEditingAdmin(null);
      setAdminForm({
        name: '',
        email: '',
        passwordHash: '',
        role: 'MODERATOR',
        customRole: '',
        permissions: {
          dashboard: ['read'],
          contests: [],
          participants: [],
          draw: [],
          winners: [],
          communication: [],
          analytics: [],
          settings: [],
        },
        twoFactor: false,
      });
      await loadData();
    } catch (error) {
      console.error('Error saving admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save admin: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User & Role Management</h1>
          <p className="text-gray-600 mt-1">Manage admin users and monitor activities</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => {
            setEditingAdmin(null);
            setAdminForm({
              name: '',
              email: '',
              passwordHash: '',
              role: 'MODERATOR',
              customRole: '',
              permissions: {
                dashboard: ['read'],
                contests: [],
                participants: [],
                draw: [],
                winners: [],
                communication: [],
                analytics: [],
                settings: [],
              },
              twoFactor: false,
            });
            setShowCreateModal(true);
          }}
        >
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{roleStats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{roleStats.superAdmins}</p>
            <p className="text-sm text-gray-600 mt-1">Super Admins</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{roleStats.admins}</p>
            <p className="text-sm text-gray-600 mt-1">Admins</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{roleStats.moderators}</p>
            <p className="text-sm text-gray-600 mt-1">Moderators</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Activity Log
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <>
          {/* Search */}
          <Card>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </Card>

          {/* Users Table */}
          <Card>
            <Table data={filteredAdmins} columns={adminColumns} emptyMessage="No users found" />
          </Card>
        </>
      ) : (
        <Card title="Activity Log" subtitle="Recent admin activities">
          <Table
            data={activityLogs}
            columns={activityColumns}
            emptyMessage="No activity logs found"
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAdmin(null);
        }}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        size="md"
      >
        <form onSubmit={handleSaveAdmin} className="space-y-4">
          <Input
            label="Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            required
          />

          <Input
            label={editingAdmin ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={adminForm.passwordHash}
            onChange={(e) => setAdminForm({ ...adminForm, passwordHash: e.target.value })}
            required={!editingAdmin}
            placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter password"}
          />

          <Input
            label="Role"
            value={adminForm.customRole}
            onChange={(e) => setAdminForm({ ...adminForm, customRole: e.target.value })}
            placeholder="e.g., Event Manager, Data Analyst, Contest Moderator"
            required
          />

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
                <div key={page.key} className="border-b border-gray-200 pb-2 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {page.icon} {page.label}
                    </span>
                  </div>
                  <div className="flex gap-3 ml-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminForm.permissions[page.key as keyof typeof adminForm.permissions]?.includes('read') || false}
                        onChange={(e) => {
                          const currentPerms = adminForm.permissions[page.key as keyof typeof adminForm.permissions] || [];
                          const newPerms = e.target.checked
                            ? [...currentPerms, 'read']
                            : currentPerms.filter(p => p !== 'read');
                          setAdminForm({
                            ...adminForm,
                            permissions: { ...adminForm.permissions, [page.key]: newPerms }
                          });
                        }}
                        className="w-3 h-3 text-blue-600"
                      />
                      <span className="ml-1 text-xs text-blue-600">Read</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminForm.permissions[page.key as keyof typeof adminForm.permissions]?.includes('write') || false}
                        onChange={(e) => {
                          const currentPerms = adminForm.permissions[page.key as keyof typeof adminForm.permissions] || [];
                          const newPerms = e.target.checked
                            ? [...currentPerms, 'write']
                            : currentPerms.filter(p => p !== 'write');
                          setAdminForm({
                            ...adminForm,
                            permissions: { ...adminForm.permissions, [page.key]: newPerms }
                          });
                        }}
                        className="w-3 h-3 text-green-600"
                      />
                      <span className="ml-1 text-xs text-green-600">Write</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminForm.permissions[page.key as keyof typeof adminForm.permissions]?.includes('update') || false}
                        onChange={(e) => {
                          const currentPerms = adminForm.permissions[page.key as keyof typeof adminForm.permissions] || [];
                          const newPerms = e.target.checked
                            ? [...currentPerms, 'update']
                            : currentPerms.filter(p => p !== 'update');
                          setAdminForm({
                            ...adminForm,
                            permissions: { ...adminForm.permissions, [page.key]: newPerms }
                          });
                        }}
                        className="w-3 h-3 text-purple-600"
                      />
                      <span className="ml-1 text-xs text-purple-600">Update</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <strong>None:</strong> No access | <strong>Read:</strong> View only | <strong>Write:</strong> Add/Edit | <strong>Update:</strong> Edit & delete
            </p>
          </div>

          {/* <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={adminForm.twoFactor}
              onChange={(e) =>
                setAdminForm({ ...adminForm, twoFactor: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
          </label> */}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setEditingAdmin(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Permission Modal */}
      {selectedAdminForPermissions && (
        <PermissionModal
          admin={selectedAdminForPermissions}
          isOpen={showPermissionModal}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedAdminForPermissions(null);
          }}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
};
