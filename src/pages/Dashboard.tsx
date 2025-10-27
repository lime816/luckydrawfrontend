import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Trophy, Users, Award, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatNumber, formatDate } from '../utils/helpers';
import { Contest, ContestStatus } from '../types';
import { DatabaseService } from '../services/database';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase-db';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  totalContests: number;
  activeContests: number;
  totalParticipants: number;
  totalWinners: number;
  pendingDraws: number;
  pendingPrizes: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalContests: 0,
    activeContests: 0,
    totalParticipants: 0,
    totalWinners: 0,
    pendingDraws: 0,
    pendingPrizes: 0,
  });

  const [recentContests, setRecentContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time quick stats state
  const [totalWinners, setTotalWinners] = useState<number>(0);
  const [claimedWinners, setClaimedWinners] = useState<number>(0);
  const [validatedParticipants, setValidatedParticipants] = useState<number>(0);
  const [totalPrizes, setTotalPrizes] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
    // subscribe to realtime changes to keep Quick Stats fresh
    const participantsChannel = supabase
      .channel('public:participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        refreshQuickStats();
        refreshParticipationTrend();
      })
      .subscribe();

    const winnersChannel = supabase
      .channel('public:winners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'winners' }, () => {
        refreshQuickStats();
      })
      .subscribe();

    const prizesChannel = supabase
      .channel('public:prizes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prizes' }, () => {
        refreshQuickStats();
      })
      .subscribe();

  // initial quick stats load
  refreshQuickStats();
  // initial participation trend load
  refreshParticipationTrend();

    return () => {
      try {
        supabase.removeChannel(participantsChannel);
        supabase.removeChannel(winnersChannel);
        supabase.removeChannel(prizesChannel);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load contests from Supabase
      const contestData = await DatabaseService.getAllContests();
      
      // Convert Supabase format to frontend format
      const formattedContests: Contest[] = contestData.map(contest => ({
        id: contest.contest_id.toString(),
        name: contest.name,
        theme: contest.theme || '',
        description: contest.description || '',
        startTime: contest.start_time,
        endTime: contest.end_time,
        status: contest.status as ContestStatus,
        prizes: (contest as any).prizes?.map((prize: any) => ({
          id: prize.prize_id.toString(),
          name: prize.prize_name,
          value: prize.value || 0,
          quantity: prize.quantity
        })) || [],
        entryRules: contest.entry_rules || 'one entry',
        participationMethod: [],
        totalParticipants: (contest as any).participants?.length || 0,
        totalEntries: (contest as any).participants?.length || 0,
        createdBy: contest.created_by?.toString() || '1',
        createdAt: contest.created_at,
        updatedAt: contest.created_at,
      }));
      
      setRecentContests(formattedContests.slice(0, 5)); // Show only recent 5
      
      // Calculate stats from real data
      const activeContests = formattedContests.filter(c => c.status === ContestStatus.ONGOING).length;
      const totalParticipants = formattedContests.reduce((sum, c) => sum + c.totalParticipants, 0);
      
      setStats({
        totalContests: formattedContests.length,
        activeContests,
        totalParticipants,
        totalWinners: 0, // Will be calculated when we have draw data
        pendingDraws: 0, // Will be calculated when we have draw data
        pendingPrizes: 0, // Will be calculated when we have prize data
      });
      
      // also update quick stats derived values
      refreshQuickStats();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Fallback to sample data
      setStats({
        totalContests: 0,
        activeContests: 0,
        totalParticipants: 0,
        totalWinners: 0,
        pendingDraws: 0,
        pendingPrizes: 0,
      });
      
      setRecentContests([{
        id: 'sample-1',
        name: 'Sample Contest (Demo)',
        theme: 'Demo',
        description: 'This is sample data - database connection needed',
        startTime: '2025-09-15T10:00:00',
        endTime: '2025-10-15T18:00:00',
        status: ContestStatus.ONGOING,
        prizes: [],
        entryRules: 'One entry per person',
        participationMethod: [],
        totalParticipants: 0,
        totalEntries: 0,
        createdBy: '1',
        createdAt: '2025-09-01',
        updatedAt: '2025-09-01',
      },
      {
        id: '2',
        name: 'Diwali Special Draw',
        theme: 'Festival',
        description: 'Celebrate with us',
        startTime: '2025-10-20T10:00:00',
        endTime: '2025-11-05T18:00:00',
        status: ContestStatus.UPCOMING,
        prizes: [],
        entryRules: 'One entry per person',
        participationMethod: [],
        totalParticipants: 0,
        totalEntries: 0,
        createdBy: '1',
        createdAt: '2025-09-25',
        updatedAt: '2025-09-25',
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh quick stats from the DB (counts and simple aggregations)
  const refreshQuickStats = async () => {
    try {
      // participants
      const { data: participants } = await supabase.from('participants').select('participant_id,validated');
      const totalParticipants = (participants || []).length;
      const validated = (participants || []).filter((p: any) => p.validated).length;

      // winners
      const { data: winners } = await supabase.from('winners').select('winner_id,prize_status');
      const totalW = (winners || []).length;
      const claimed = (winners || []).filter((w: any) => w.prize_status === 'CLAIMED').length;

      // prizes
      const { data: prizes } = await supabase.from('prizes').select('quantity');
      const totalP = (prizes || []).reduce((sum: number, r: any) => sum + (r.quantity || 0), 0);

      setValidatedParticipants(validated);
      setTotalWinners(totalW);
      setClaimedWinners(claimed);
      setTotalPrizes(totalP);

      // Also update top-level stats.totalParticipants if inconsistent
      setStats(prev => ({ ...prev, totalParticipants: totalParticipants }));
    } catch (e) {
      console.warn('Could not refresh quick stats:', e);
    }
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Participants',
        data: [65, 78, 90, 81, 96, 105, 134],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Dynamic chart data for participation trend
  const [dynamicChartData, setDynamicChartData] = React.useState<any>(chartData);

  // Refresh participation trend based on participants' entry_timestamp
  const refreshParticipationTrend = async () => {
    try {
      // Fetch participants from the last 14 days to be safe
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      const isoStart = start.toISOString();

      const { data: participants, error } = await supabase
        .from('participants')
        .select('entry_timestamp')
        .gte('entry_timestamp', isoStart);

      if (error) {
        console.warn('Could not load participation trend:', error);
        return;
      }

      // Build labels for last 7 days
      const labels: string[] = [];
      const counts: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        labels.push(formatDate(d.toISOString(), 'EEE'));
        counts.push(0);
      }

      (participants || []).forEach((p: any) => {
        const ts = p.entry_timestamp || p.created_at || null;
        if (!ts) return;
        const d = new Date(ts);
        // normalize to midnight of that day
        const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diffDays = Math.round((dateOnly.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          counts[diffDays] = (counts[diffDays] || 0) + 1;
        }
      });

      setDynamicChartData({
        labels,
        datasets: [
          {
            label: 'Participants',
            data: counts,
            borderColor: 'rgb(14, 165, 233)',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (e) {
      console.warn('Error computing participation trend:', e);
    }
  };

  const statCards = [
    {
      title: 'Total Contests',
      value: stats.totalContests,
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Contests',
      value: stats.activeContests,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Total Participants',
      value: stats.totalParticipants,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: '+23%',
    },
    {
      title: 'Total Winners',
      value: stats.totalWinners,
      icon: <Award className="w-6 h-6" />,
      color: 'bg-yellow-500',
      change: '+8%',
    },
  ];

  const getStatusBadge = (status: ContestStatus) => {
    const variants: Record<ContestStatus, 'success' | 'warning' | 'info' | 'default' | 'danger'> = {
      [ContestStatus.ONGOING]: 'success',
      [ContestStatus.UPCOMING]: 'info',
      [ContestStatus.COMPLETED]: 'default',
      [ContestStatus.DRAFT]: 'warning',
      [ContestStatus.CANCELLED]: 'danger',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading dashboard data...</div>
        </div>
      )}

      {/* Alerts */}
      {(stats.pendingDraws > 0 || stats.pendingPrizes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingDraws > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Pending Draws</h3>
                <p className="text-sm text-yellow-700">
                  You have {stats.pendingDraws} contests waiting for lucky draw execution.
                </p>
              </div>
            </div>
          )}
          {stats.pendingPrizes > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Pending Prize Distribution</h3>
                <p className="text-sm text-blue-700">
                  {stats.pendingPrizes} prizes are pending dispatch or delivery.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stat.value)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participation Trend Chart */}
        <Card className="lg:col-span-2" title="Participation Trend" subtitle="Last 7 days">
          <div className="h-64">
            <Line data={dynamicChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Quick Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg. Participants/Contest</span>
              <span className="font-semibold text-gray-900">{stats.totalContests ? Math.round(stats.totalParticipants / Math.max(1, stats.totalContests)) : 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold text-green-600">{stats.totalParticipants ? Math.round((validatedParticipants / Math.max(1, stats.totalParticipants)) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Prize Claim Rate</span>
              <span className="font-semibold text-blue-600">{totalWinners ? Math.round((claimedWinners / Math.max(1, totalWinners)) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <span className="font-semibold text-purple-600">{stats.activeContests ? Math.round((stats.totalParticipants / Math.max(1, stats.activeContests))) : 0}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Contests */}
      <Card title="Recent Contests" subtitle="Latest contest activities">
        <div className="space-y-4">
          {recentContests.map((contest) => (
            <div
              key={contest.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{contest.name}</h3>
                  {getStatusBadge(contest.status)}
                </div>
                <p className="text-sm text-gray-600">{contest.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Start: {formatDate(contest.startTime, 'MMM dd, yyyy HH:mm')}</span>
                  <span>End: {formatDate(contest.endTime, 'MMM dd, yyyy HH:mm')}</span>
                  <span>{formatNumber(contest.totalParticipants)} participants</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
