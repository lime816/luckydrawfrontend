import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertCircle, Calendar, Trophy, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  type: 'contest_ending' | 'contest_started' | 'new_participant' | 'winner_selected' | 'system' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

interface NotificationCenterProps {
  userId?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Check immediately on mount
    setTimeout(() => {
      checkContestEndingNotifications();
    }, 1000);

    // Set up polling for new notifications every 30 seconds
    const pollInterval = setInterval(() => {
      checkForNewNotifications();
    }, 30000);

    // Check for contest ending notifications every 10 seconds (for testing)
    const contestCheckInterval = setInterval(() => {
      checkContestEndingNotifications();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(contestCheckInterval);
    };
  }, [userId]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Update unread count
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      // Load from localStorage for now (can be replaced with API call)
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        const notifs = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notifs);
      }

      // Check for contest ending notifications on load
      await checkContestEndingNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const checkContestEndingNotifications = async () => {
    try {
      console.log('🔍 Checking for contest notifications...');
      const { supabase } = await import('../lib/supabase-db');
      
      // Get ongoing and upcoming contests
      const { data: contests, error } = await supabase
        .from('contests')
        .select('contest_id, name, start_date, end_date, status')
        .in('status', ['ONGOING', 'UPCOMING'])
        .order('end_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching contests:', error);
        return;
      }

      if (!contests || contests.length === 0) {
        console.log('ℹ️ No ongoing or upcoming contests found');
        return;
      }

      console.log(`📋 Found ${contests.length} contests to check`);

      const now = new Date();
      
      // Get already notified contest IDs from localStorage
      const notifiedContests = JSON.parse(localStorage.getItem('notifiedContests') || '{}');
      console.log('📝 Already notified contests:', notifiedContests);
      
      contests.forEach(contest => {
        const endDate = new Date(contest.end_date);
        const startDate = new Date(contest.start_date);
        
        // Calculate hours until end
        const millisecondsUntilEnd = endDate.getTime() - now.getTime();
        const hoursUntilEnd = millisecondsUntilEnd / (1000 * 60 * 60);
        
        console.log(`📊 Contest: "${contest.name}"`);
        console.log(`   End Date: ${endDate.toLocaleString()}`);
        console.log(`   Hours Until End: ${hoursUntilEnd.toFixed(2)}`);
        console.log(`   Status: ${contest.status}`);
        
        // Check if contest is ending within 24 hours and hasn't been notified yet
        if (hoursUntilEnd > 0 && hoursUntilEnd <= 24) {
          const notifKey = `ending_${contest.contest_id}`;
          
          console.log(`⚠️ Contest "${contest.name}" is ending within 24 hours!`);
          console.log(`   Already notified? ${!!notifiedContests[notifKey]}`);
          
          // Only notify if we haven't notified for this contest before
          if (!notifiedContests[notifKey]) {
            console.log(`✅ Creating notification for "${contest.name}"`);
            
            addNotification({
              type: 'contest_ending',
              title: 'Contest Ending Soon',
              message: `"${contest.name}" is ending soon`,
              priority: hoursUntilEnd <= 1 ? 'high' : 'medium',
              actionUrl: '/contests'
            });
            
            // Mark this contest as notified
            notifiedContests[notifKey] = {
              timestamp: now.toISOString(),
              contestId: contest.contest_id,
              contestName: contest.name
            };
            localStorage.setItem('notifiedContests', JSON.stringify(notifiedContests));
            console.log(`💾 Marked contest ${contest.contest_id} as notified`);
          }
        } else if (hoursUntilEnd <= 0) {
          console.log(`⏰ Contest "${contest.name}" has already ended`);
        } else {
          console.log(`⏳ Contest "${contest.name}" has ${hoursUntilEnd.toFixed(2)} hours remaining (> 24 hours)`);
        }
        
        // Check if contest just started (within last hour)
        const millisecondsSinceStart = now.getTime() - startDate.getTime();
        const hoursSinceStart = millisecondsSinceStart / (1000 * 60 * 60);
        
        if (contest.status === 'ONGOING' && hoursSinceStart >= 0 && hoursSinceStart <= 1) {
          const notifKey = `started_${contest.contest_id}`;
          
          // Only notify if we haven't notified for this contest before
          if (!notifiedContests[notifKey]) {
            addNotification({
              type: 'contest_started',
              title: 'Contest Started',
              message: `"${contest.name}" is now live!`,
              priority: 'medium',
              actionUrl: '/contests'
            });
            
            // Mark this contest as notified
            notifiedContests[notifKey] = {
              timestamp: now.toISOString(),
              contestId: contest.contest_id,
              contestName: contest.name
            };
            localStorage.setItem('notifiedContests', JSON.stringify(notifiedContests));
          }
        }
      });
    } catch (error) {
      console.error('Error checking contest notifications:', error);
    }
  };

  const checkForNewNotifications = async () => {
    // This can be expanded to check for:
    // - New participants
    // - Winners selected
    // - System updates
    // For now, we'll just check contests
    await checkContestEndingNotifications();
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only last 50 notifications
      const trimmed = updated.slice(0, 50);
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(trimmed));
      return trimmed;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
    // Also clear notified contests to allow re-notification (useful for testing)
    // localStorage.removeItem('notifiedContests');
  };

  const resetNotifiedContests = () => {
    // Utility function to reset notification tracking (for testing)
    localStorage.removeItem('notifiedContests');
    console.log('✅ Notification tracking reset. Contests can be notified again.');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'contest_ending':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'contest_started':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'winner_selected':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'new_participant':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'system':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-orange-50 border-orange-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col left-4 right-4 mx-auto md:left-auto md:mx-0"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-500">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">We'll notify you about important updates</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.read ? getPriorityColor(notification.priority) : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
