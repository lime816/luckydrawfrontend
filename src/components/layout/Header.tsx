import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown, Menu, Trophy, Users, X, Gift, Award } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatabaseService } from '../../services/database';
import { AuthService } from '../../services/authService';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAsRead } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Get current page context
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/contests')) return 'contests';
    if (path.includes('/participants')) return 'participants';
    if (path.includes('/winners')) return 'winners';
    if (path.includes('/draw')) return 'draw';
    if (path.includes('/communication')) return 'communication';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/users') || path.includes('/admin')) return 'users';
    return 'all';
  };

  const handleLogout = async () => {
    try {
      // Call AuthService logout to handle both Supabase and local logout
      await AuthService.logout();
      
      // Clear local auth state
      logout();
      
      // Show success message
      toast.success('Logged out successfully', {
        icon: '👋',
        duration: 2000,
      });
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if remote logout fails
      logout();
      navigate('/login');
    }
  };

  // Universal search function - searches everything
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    console.log('🔍 Searching for:', query);

    try {
      const contests = await DatabaseService.getAllContests();
      console.log('📋 Total contests:', contests.length);
      
      // 1. Search CONTESTS
      const contestResults = contests
        .filter(contest => {
          const searchLower = query.toLowerCase();
          return contest.name?.toLowerCase().includes(searchLower) ||
                 contest.theme?.toLowerCase().includes(searchLower) ||
                 contest.description?.toLowerCase().includes(searchLower) ||
                 contest.status?.toLowerCase().includes(searchLower);
        })
        .map(contest => ({
          type: 'contest',
          id: contest.contest_id,
          title: contest.name,
          subtitle: `${contest.theme || ''} • ${contest.status}`,
          status: contest.status,
          icon: 'trophy',
          page: 'Contests'
        }));
      console.log('🏆 Found', contestResults.length, 'contests');

      // 2. Search PARTICIPANTS
      const participantPromises = contests.map(async (contest) => {
        try {
          const participants = await DatabaseService.getParticipantsByContest(contest.contest_id);
          return participants
            .filter(p => {
              const searchLower = query.toLowerCase();
              return p.name?.toLowerCase().includes(searchLower) ||
                     p.contact?.toLowerCase().includes(searchLower);
            })
            .map(p => ({
              type: 'participant',
              id: p.participant_id,
              title: p.name,
              subtitle: `${p.contact} • ${contest.name}`,
              contestName: contest.name,
              icon: 'users',
              page: 'Participants'
            }));
        } catch (error) {
          return [];
        }
      });
      const allParticipantArrays = await Promise.all(participantPromises);
      const participantResults = allParticipantArrays.flat();
      console.log('👤 Found', participantResults.length, 'participants');

      // 3. Search WINNERS
      const winnerPromises = contests.map(async (contest) => {
        try {
          const winners = await DatabaseService.getWinnersByContest(contest.contest_id);
          const participants = await DatabaseService.getParticipantsByContest(contest.contest_id);
          const prizes = await DatabaseService.getPrizesByContest(contest.contest_id);
          
          return winners
            .filter(w => {
              const searchLower = query.toLowerCase();
              const participant = participants.find(p => p.participant_id === w.participant_id);
              const prize = prizes.find(pr => pr.prize_id === w.prize_id);
              const prizeName = (prize as any)?.prize_name || (prize as any)?.name || '';
              return participant?.name?.toLowerCase().includes(searchLower) ||
                     prizeName?.toLowerCase().includes(searchLower);
            })
            .map(w => {
              const participant = participants.find(p => p.participant_id === w.participant_id);
              const prize = prizes.find(pr => pr.prize_id === w.prize_id);
              const prizeName = (prize as any)?.prize_name || (prize as any)?.name || 'Prize';
              return {
                type: 'winner',
                id: w.winner_id,
                title: participant?.name || 'Unknown',
                subtitle: `Won: ${prizeName} • ${contest.name}`,
                contestName: contest.name,
                icon: 'award',
                page: 'Winners'
              };
            });
        } catch (error) {
          return [];
        }
      });
      const allWinnerArrays = await Promise.all(winnerPromises);
      const winnerResults = allWinnerArrays.flat();
      console.log('🏆 Found', winnerResults.length, 'winners');

      // Combine all results
      const allResults = [...contestResults, ...participantResults, ...winnerResults];
      console.log('📊 Total results:', allResults.length);

      setSearchResults(allResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    console.log('🔄 Search query changed:', searchQuery);
    const timer = setTimeout(() => {
      if (searchQuery) {
        console.log('⏱️ Debounce complete, starting search...');
        performSearch(searchQuery);
      } else {
        console.log('❌ Empty search query, clearing results');
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, location.pathname]); // Re-run when page changes

  const handleSearchResultClick = (result: any) => {
    const currentPage = getCurrentPage();
    
    // If already on the correct page, just trigger the action
    if (currentPage === 'contests' && result.type === 'contest') {
      // Stay on contests page and open modal
      navigate('/contests', { state: { searchedContestId: result.id, highlightId: result.id } });
    } else if (currentPage === 'participants' && result.type === 'participant') {
      // Stay on participants page and highlight
      navigate('/participants', { state: { searchedParticipantId: result.id, highlightId: result.id } });
    } else if (currentPage === 'winners' && result.type === 'winner') {
      // Stay on winners page and highlight
      navigate('/winners', { state: { searchedWinnerId: result.id, highlightId: result.id } });
    } else {
      // Navigate to appropriate page
      if (result.type === 'contest') {
        navigate('/contests', { state: { searchedContestId: result.id, highlightId: result.id } });
      } else if (result.type === 'participant') {
        navigate('/participants', { state: { searchedParticipantId: result.id, highlightId: result.id } });
      } else if (result.type === 'winner') {
        navigate('/winners', { state: { searchedWinnerId: result.id, highlightId: result.id } });
      }
    }
    
    setSearchQuery('');
    setShowSearchResults(false);
    setShowMobileSearch(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}


        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Notifications */}
          <div className="relative z-30">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="fixed sm:absolute top-16 sm:top-auto right-2 sm:right-0 mt-0 sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <h4 className="font-medium text-sm text-gray-900 break-words">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 break-words">
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
