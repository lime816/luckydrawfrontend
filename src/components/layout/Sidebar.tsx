import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Workflow,
  Award,
  MessageSquare,
  BarChart3,
  Settings,
  UserCog,
  X,
} from 'lucide-react';
import { usePermissions, PageKey } from '../../hooks/usePermissions';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  page: PageKey; // Permission key
}

const allNavItems: NavItem[] = [
  { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', page: 'dashboard' },
  { path: '/contests', icon: <Trophy className="w-5 h-5" />, label: 'Contests', page: 'contests' },
  { path: '/participants', icon: <Users className="w-5 h-5" />, label: 'Participants', page: 'participants' },
  { path: '/draw', icon: <Sparkles className="w-5 h-5" />, label: 'Lucky Draw', page: 'draw' },
  { path: '/winners', icon: <Award className="w-5 h-5" />, label: 'Winners', page: 'winners' },
  { path: '/communication', icon: <MessageSquare className="w-5 h-5" />, label: 'Communication', page: 'communication' },
  { path: '/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', page: 'analytics' },
  { path: '/admin-management', icon: <UserCog className="w-5 h-5" />, label: 'User Management', page: 'user_management' },
  { path: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', page: 'settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { hasPageAccess } = usePermissions();
  const [contestsExpanded, setContestsExpanded] = useState(false);

  // Filter navigation items based on user permissions
  const navItems = useMemo(() => {
    return allNavItems.filter((item) => hasPageAccess(item.page));
  }, [hasPageAccess]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lucky Draw</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.path === '/contests') {
              return (
                <li key={item.path}>
                  <button
                    onClick={() => setContestsExpanded(!contestsExpanded)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {contestsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {contestsExpanded && (
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>
                        <NavLink
                          to="/contests"
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`
                          }
                        >
                          <Trophy className="w-4 h-4" />
                          <span>Contest List</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/flow-builder"
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`
                          }
                        >
                          <Workflow className="w-4 h-4" />
                          <span>Flow Builder</span>
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
    </>
  );
};
