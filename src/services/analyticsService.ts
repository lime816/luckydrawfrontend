import { supabase } from '../lib/supabase-db';

export interface AnalyticsData {
  // Overview Stats
  totalContests: number;
  totalParticipants: number;
  totalPrizes: number;
  totalDraws: number;
  
  // Participation Trends
  participationTrend: {
    labels: string[];
    data: number[];
  };
  
  // Contest Performance
  contestPerformance: {
    labels: string[];
    participantCounts: number[];
    prizeCounts: number[];
  };
  
  // Prize Distribution
  prizeDistribution: {
    labels: string[];
    data: number[];
  };
  
  // Status Distribution
  statusDistribution: {
    labels: string[];
    data: number[];
  };
  
  // Recent Activity
  recentActivity: {
    date: string;
    action: string;
    details: string;
  }[];
  
  // Top Contests
  topContests: {
    name: string;
    participants: number;
    prizes: number;
    status: string;
  }[];
}

export class AnalyticsService {
  // Get comprehensive analytics data
  static async getAnalytics(): Promise<AnalyticsData> {
    try {
      // Fetch all required data in parallel
      const [
        contestsData,
        participantsData,
        prizesData,
        drawsData,
      ] = await Promise.all([
        supabase.from('contests').select('*'),
        supabase.from('participants').select('*'),
        supabase.from('prizes').select('*'),
        supabase.from('draws').select('*'),
      ]);

      const contests = contestsData.data || [];
      const participants = participantsData.data || [];
      const prizes = prizesData.data || [];
      const draws = drawsData.data || [];

      // Calculate overview stats
      const totalContests = contests.length;
      const totalParticipants = participants.length;
      const totalPrizes = prizes.reduce((sum, prize) => sum + (prize.quantity || 0), 0);
      const totalDraws = draws.length;

      // Calculate participation trend (last 6 weeks)
      const participationTrend = this.calculateParticipationTrend(participants);

      // Calculate contest performance
      const contestPerformance = this.calculateContestPerformance(contests, participants, prizes);

      // Calculate prize distribution
      const prizeDistribution = this.calculatePrizeDistribution(prizes);

      // Calculate status distribution
      const statusDistribution = this.calculateStatusDistribution(contests);

      // Get recent activity
      const recentActivity = this.getRecentActivity(contests, participants, draws);

      // Get top contests
      const topContests = this.getTopContests(contests, participants, prizes);

      return {
        totalContests,
        totalParticipants,
        totalPrizes,
        totalDraws,
        participationTrend,
        contestPerformance,
        prizeDistribution,
        statusDistribution,
        recentActivity,
        topContests,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Calculate participation trend over last 6 weeks
  private static calculateParticipationTrend(participants: any[]): {
    labels: string[];
    data: number[];
  } {
    const weeks = 6;
    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekLabel = `Week ${weeks - i}`;
      const count = participants.filter(p => {
        const entryDate = new Date(p.entry_timestamp);
        return entryDate >= weekStart && entryDate < weekEnd;
      }).length;

      labels.push(weekLabel);
      data.push(count);
    }

    return { labels, data };
  }

  // Calculate contest performance
  private static calculateContestPerformance(
    contests: any[],
    participants: any[],
    prizes: any[]
  ): {
    labels: string[];
    participantCounts: number[];
    prizeCounts: number[];
  } {
    // Get top 5 contests by participant count
    const contestStats = contests.map(contest => {
      const participantCount = participants.filter(
        p => p.contest_id === contest.contest_id
      ).length;
      const prizeCount = prizes.filter(
        p => p.contest_id === contest.contest_id
      ).reduce((sum, prize) => sum + (prize.quantity || 0), 0);

      return {
        name: contest.name,
        participantCount,
        prizeCount,
      };
    });

    // Sort by participant count and take top 5
    const topContests = contestStats
      .sort((a, b) => b.participantCount - a.participantCount)
      .slice(0, 5);

    return {
      labels: topContests.map(c => c.name),
      participantCounts: topContests.map(c => c.participantCount),
      prizeCounts: topContests.map(c => c.prizeCount),
    };
  }

  // Calculate prize distribution
  private static calculatePrizeDistribution(prizes: any[]): {
    labels: string[];
    data: number[];
  } {
    // Group prizes by name and sum quantities
    const prizeMap = new Map<string, number>();

    prizes.forEach(prize => {
      const name = prize.prize_name || 'Unknown';
      const quantity = prize.quantity || 0;
      prizeMap.set(name, (prizeMap.get(name) || 0) + quantity);
    });

    // Convert to arrays and sort by quantity
    const prizeArray = Array.from(prizeMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6); // Top 6 prizes

    return {
      labels: prizeArray.map(p => p.name),
      data: prizeArray.map(p => p.quantity),
    };
  }

  // Calculate status distribution
  private static calculateStatusDistribution(contests: any[]): {
    labels: string[];
    data: number[];
  } {
    const statusMap = new Map<string, number>();

    contests.forEach(contest => {
      const status = contest.status || 'UNKNOWN';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const statusArray = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      labels: statusArray.map(s => s.status),
      data: statusArray.map(s => s.count),
    };
  }

  // Get recent activity
  private static getRecentActivity(
    contests: any[],
    participants: any[],
    draws: any[]
  ): {
    date: string;
    action: string;
    details: string;
  }[] {
    const activities: { date: string; action: string; details: string }[] = [];

    // Add contest activities
    contests.slice(0, 3).forEach(contest => {
      activities.push({
        date: contest.created_at,
        action: 'Contest Created',
        details: contest.name,
      });
    });

    // Add recent participants
    participants
      .sort((a, b) => new Date(b.entry_timestamp).getTime() - new Date(a.entry_timestamp).getTime())
      .slice(0, 3)
      .forEach(participant => {
        activities.push({
          date: participant.entry_timestamp,
          action: 'New Participant',
          details: participant.name,
        });
      });

    // Add recent draws
    draws
      .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
      .slice(0, 3)
      .forEach(draw => {
        activities.push({
          date: draw.executed_at,
          action: 'Draw Executed',
          details: `${draw.total_winners} winners selected`,
        });
      });

    // Sort by date and return top 10
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  // Get top contests
  private static getTopContests(
    contests: any[],
    participants: any[],
    prizes: any[]
  ): {
    name: string;
    participants: number;
    prizes: number;
    status: string;
  }[] {
    const contestStats = contests.map(contest => {
      const participantCount = participants.filter(
        p => p.contest_id === contest.contest_id
      ).length;
      const prizeCount = prizes.filter(
        p => p.contest_id === contest.contest_id
      ).reduce((sum, prize) => sum + (prize.quantity || 0), 0);

      return {
        name: contest.name,
        participants: participantCount,
        prizes: prizeCount,
        status: contest.status,
      };
    });

    // Sort by participant count and return top 5
    return contestStats
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5);
  }

  // Get contest-specific analytics
  static async getContestAnalytics(contestId: number) {
    try {
      const [participantsData, prizesData, drawsData, winnersData] = await Promise.all([
        supabase.from('participants').select('*').eq('contest_id', contestId),
        supabase.from('prizes').select('*').eq('contest_id', contestId),
        supabase.from('draws').select('*').eq('contest_id', contestId),
        supabase
          .from('winners')
          .select('*, draws!inner(*)')
          .eq('draws.contest_id', contestId),
      ]);

      const participants = participantsData.data || [];
      const prizes = prizesData.data || [];
      const draws = drawsData.data || [];
      const winners = winnersData.data || [];

      return {
        totalParticipants: participants.length,
        validatedParticipants: participants.filter(p => p.validated).length,
        totalPrizes: prizes.reduce((sum, p) => sum + (p.quantity || 0), 0),
        totalDraws: draws.length,
        totalWinners: winners.length,
        participationRate: participants.length > 0 
          ? ((participants.filter(p => p.validated).length / participants.length) * 100).toFixed(1)
          : '0',
        prizeDistribution: prizes.map(p => ({
          name: p.prize_name,
          quantity: p.quantity,
          value: p.value,
        })),
      };
    } catch (error) {
      console.error('Error fetching contest analytics:', error);
      throw error;
    }
  }

  // Export analytics data as CSV
  static async exportAnalytics(): Promise<string> {
    try {
      const analytics = await this.getAnalytics();
      
      let csv = 'Analytics Report\n\n';
      csv += 'Overview\n';
      csv += `Total Contests,${analytics.totalContests}\n`;
      csv += `Total Participants,${analytics.totalParticipants}\n`;
      csv += `Total Prizes,${analytics.totalPrizes}\n`;
      csv += `Total Draws,${analytics.totalDraws}\n\n`;
      
      csv += 'Top Contests\n';
      csv += 'Name,Participants,Prizes,Status\n';
      analytics.topContests.forEach(contest => {
        csv += `${contest.name},${contest.participants},${contest.prizes},${contest.status}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }
}
