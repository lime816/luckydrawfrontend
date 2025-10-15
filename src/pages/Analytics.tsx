import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Download, TrendingUp, Users, Trophy, Award } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatNumber } from '../utils/helpers';
import { AnalyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await AnalyticsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">No analytics data available</div>
      </div>
    );
  }
  const participationTrendData = {
    labels: analytics.participationTrend.labels,
    datasets: [
      {
        label: 'Participants',
        data: analytics.participationTrend.data,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const contestPerformanceData = {
    labels: analytics.contestPerformance.labels,
    datasets: [
      {
        label: 'Participants',
        data: analytics.contestPerformance.participantCounts,
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
      },
      {
        label: 'Prizes',
        data: analytics.contestPerformance.prizeCounts,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const prizeDistributionData = {
    labels: analytics.prizeDistribution.labels,
    datasets: [
      {
        data: analytics.prizeDistribution.data,
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const handleExportReport = async () => {
    try {
      const csv = await AnalyticsService.exportAnalytics();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Analytics report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and engagement metrics</p>
        </div>
        <Button
          variant="primary"
          icon={<Download className="w-5 h-5" />}
          onClick={handleExportReport}
        >
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Contests</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalContests}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Participants</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalParticipants)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+23%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Prizes</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalPrizes)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+8%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Draws</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalDraws}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+5%</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation Trend */}
        <Card title="Participation Trend" subtitle="Last 6 weeks">
          <div className="h-80">
            <Line data={participationTrendData} options={chartOptions} />
          </div>
        </Card>

        {/* Contest Performance */}
        <Card title="Contest Performance" subtitle="Participants vs Winners">
          <div className="h-80">
            <Bar data={contestPerformanceData} options={chartOptions} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prize Distribution */}
        <Card title="Prize Distribution">
          <div className="h-64">
            <Doughnut data={prizeDistributionData} options={chartOptions} />
          </div>
        </Card>

        {/* Top Performing Contests */}
        <Card title="Top Performing Contests" className="lg:col-span-2">
          <div className="space-y-4">
            {analytics.topContests.map((contest: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contest.name}</p>
                  <p className="text-sm text-gray-600">{formatNumber(contest.participants)} participants</p>
                </div>
                <div className="text-right">
                  {/* <p className="text-sm font-medium text-gray-900">{contest.participants}</p> */}
                   {/* <p className="text-xs text-gray-500">Participants</p> */}
                </div>
                <div className="ml-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {contest.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Participation by Time">
          <div className="space-y-3">
            {[
              { time: 'Morning (6 AM - 12 PM)', count: 423, percentage: 23 },
              { time: 'Afternoon (12 PM - 6 PM)', count: 856, percentage: 46 },
              { time: 'Evening (6 PM - 12 AM)', count: 512, percentage: 28 },
              { time: 'Night (12 AM - 6 AM)', count: 56, percentage: 3 },
            ].map((slot, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{slot.time}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(slot.count)} ({slot.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${slot.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Prize Claim Statistics">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Claimed</span>
              <span className="text-lg font-bold text-green-600">87%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Pending</span>
              <span className="text-lg font-bold text-yellow-600">8%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-700">Unclaimed</span>
              <span className="text-lg font-bold text-red-600">5%</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Average Claim Time</span>
                <span className="text-lg font-bold text-gray-900">2.3 days</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
