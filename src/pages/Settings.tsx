import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Mail } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'email'>('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Lucky Draw',
    siteUrl: 'https://luckydraw.example.com',
    timezone: 'Asia/Kolkata',
    language: 'en',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    contestCreated: true,
    contestEnding: true,
    drawCompleted: true,
    winnerSelected: true,
    prizeDispatched: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordExpiry: '90',
    requireTwoFactor: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'noreply@example.com',
    smtpPassword: '',
    fromName: 'Lucky Draw',
    fromEmail: 'noreply@example.com',
  });

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('General settings saved successfully!');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Notification settings saved successfully!');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Security settings saved successfully!');
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Email settings saved successfully!');
  };

  const tabs = [
    // { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    // { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your application settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* {activeTab === 'general' && (
            <Card title="General Settings" subtitle="Configure basic application settings">
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <Input
                  label="Site Name"
                  value={generalSettings.siteName}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                  }
                  required
                />

                <Input
                  label="Site URL"
                  type="url"
                  value={generalSettings.siteUrl}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, language: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" icon={<Save className="w-5 h-5" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )} */}

          {activeTab === 'notifications' && (
            <Card title="Notification Settings" subtitle="Configure notification preferences">
              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Contest Created</p>
                      <p className="text-sm text-gray-600">
                        Notify when a new contest is created
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.contestCreated}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          contestCreated: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Contest Ending Soon</p>
                      <p className="text-sm text-gray-600">
                        Notify when a contest is about to end
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.contestEnding}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          contestEnding: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Draw Completed</p>
                      <p className="text-sm text-gray-600">
                        Notify when a lucky draw is completed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.drawCompleted}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          drawCompleted: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Winner Selected</p>
                      <p className="text-sm text-gray-600">
                        Notify when winners are selected
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.winnerSelected}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          winnerSelected: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Prize Dispatched</p>
                      <p className="text-sm text-gray-600">
                        Notify when prizes are dispatched
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.prizeDispatched}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          prizeDispatched: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" icon={<Save className="w-5 h-5" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Security Settings" subtitle="Configure security and authentication">
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <Input
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })
                  }
                  required
                />

                <Input
                  label="Max Login Attempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      maxLoginAttempts: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  label="Password Expiry (days)"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })
                  }
                  required
                />

                {/* <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Require Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      Force all users to enable 2FA
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securitySettings.requireTwoFactor}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        requireTwoFactor: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label> */}

                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" icon={<Save className="w-5 h-5" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* {activeTab === 'email' && (
            <Card title="Email Settings" subtitle="Configure SMTP and email preferences">
              <form onSubmit={handleSaveEmail} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="SMTP Host"
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="SMTP Port"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                    }
                    required
                  />
                </div>

                <Input
                  label="SMTP Username"
                  value={emailSettings.smtpUser}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                  }
                  required
                />

                <Input
                  label="SMTP Password"
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                  }
                  placeholder="Enter password to update"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="From Name"
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromName: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="From Email"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary">
                    Test Connection
                  </Button>
                  <Button type="submit" variant="primary" icon={<Save className="w-5 h-5" />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )} */}
        </div>
      </div>
    </div>
  );
};
