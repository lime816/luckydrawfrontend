import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Admin, PagePermissions } from '../../services/adminService';

interface PermissionModalProps {
  admin: Admin;
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissions: PagePermissions, customRole: string) => Promise<void>;
}

interface PermissionItem {
  key: keyof PagePermissions;
  label: string;
  description: string;
  icon: string;
}

const permissionItems: PermissionItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard Access',
    description: 'Allows full access to view and analyze dashboard',
    icon: '📊',
  },
  {
    key: 'contests',
    label: 'Contest Management',
    description: 'Allows full access to create and manage contests',
    icon: '🏆',
  },
  {
    key: 'participants',
    label: 'Participant Management',
    description: 'Allows access to view and manage participants',
    icon: '👥',
  },
  {
    key: 'draw',
    label: 'Lucky Draw Execution',
    description: 'Allows access to execute lucky draws',
    icon: '🎲',
  },
  {
    key: 'winners',
    label: 'Winners Management',
    description: 'Allows access to view and manage winners',
    icon: '🏅',
  },
  {
    key: 'communication',
    label: 'Communication',
    description: 'Allows access to send emails and notifications',
    icon: '💬',
  },
  {
    key: 'analytics',
    label: 'Analytics & Reports',
    description: 'Allows access to view analytics and reports',
    icon: '📈',
  },
  {
    key: 'user_management',
    label: 'User Management',
    description: 'Allows access to manage users and admins',
    icon: '👤',
  },
  {
    key: 'settings',
    label: 'System Settings',
    description: 'Allows access to modify system settings',
    icon: '⚙️',
  },
];

const roleTemplates = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full access to all features' },
  { value: 'contest_manager', label: 'Contest Manager', description: 'Manage contests and participants' },
  { value: 'data_analyst', label: 'Data Analyst', description: 'View analytics and reports' },
  { value: 'moderator', label: 'Moderator', description: 'Basic moderation access' },
  { value: 'custom', label: 'Custom', description: 'Define custom permissions' },
];

export const PermissionModal: React.FC<PermissionModalProps> = ({
  admin,
  isOpen,
  onClose,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<PagePermissions>(
    admin.permissions || {}
  );
  const [selectedRole, setSelectedRole] = useState<string>(
    admin.custom_role || 'custom'
  );
  const [customRoleName, setCustomRoleName] = useState<string>(
    admin.custom_role || ''
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof PagePermissions) => {
    const currentPerms = permissions[key] || [];
    const hasFullAccess = currentPerms.length === 3;

    setPermissions({
      ...permissions,
      [key]: hasFullAccess ? [] : ['read', 'write', 'update'],
    });
  };

  const isEnabled = (key: keyof PagePermissions): boolean => {
    const perms = permissions[key] || [];
    return perms.length > 0;
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);

    // Apply role template
    switch (role) {
      case 'super_admin':
        setCustomRoleName('Super Admin');
        setPermissions({
          dashboard: ['read', 'write', 'update'],
          contests: ['read', 'write', 'update'],
          participants: ['read', 'write', 'update'],
          draw: ['read', 'write', 'update'],
          winners: ['read', 'write', 'update'],
          communication: ['read', 'write', 'update'],
          analytics: ['read', 'write', 'update'],
          user_management: ['read', 'write', 'update'],
          settings: ['read', 'write', 'update'],
        });
        break;
      case 'contest_manager':
        setCustomRoleName('Contest Manager');
        setPermissions({
          dashboard: ['read'],
          contests: ['read', 'write', 'update'],
          participants: ['read', 'write'],
          draw: ['read', 'write'],
          winners: ['read'],
          communication: ['read', 'write'],
          analytics: ['read'],
          user_management: [],
          settings: [],
        });
        break;
      case 'data_analyst':
        setCustomRoleName('Data Analyst');
        setPermissions({
          dashboard: ['read'],
          contests: ['read'],
          participants: ['read'],
          draw: [],
          winners: ['read'],
          communication: [],
          analytics: ['read'],
          user_management: [],
          settings: [],
        });
        break;
      case 'moderator':
        setCustomRoleName('Moderator');
        setPermissions({
          dashboard: ['read'],
          contests: ['read'],
          participants: ['read', 'write'],
          draw: ['read'],
          winners: ['read'],
          communication: ['read'],
          analytics: [],
          user_management: [],
          settings: [],
        });
        break;
      case 'custom':
        // Keep current permissions
        break;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(permissions, customRoleName);
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Permissions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage permissions and settings for {admin.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{admin.name}</h3>
              <p className="text-sm text-gray-600">{admin.email}</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Group / Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roleTemplates.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Role Name */}
          {selectedRole === 'custom' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Role Name
              </label>
              <input
                type="text"
                value={customRoleName}
                onChange={(e) => setCustomRoleName(e.target.value)}
                placeholder="e.g., Event Coordinator, Support Staff"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Info Banner */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Permission list will change when select the user group
            </p>
          </div>

          {/* Permissions List */}
          <div className="space-y-3">
            {permissionItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isEnabled(item.key) ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled(item.key) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
