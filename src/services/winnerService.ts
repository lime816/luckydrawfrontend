import { supabase } from '../lib/supabase-db';

export interface Winner {
  winner_id: number;
  draw_id: number;
  participant_id: number;
  prize_id?: number | null;
  prize_status: 'PENDING' | 'CLAIMED' | 'SHIPPED';
  notified: boolean;
  notified_at?: string | null;
  participant?: {
    participant_id: number;
    name: string;
    contact: string;
    contest_id: number;
  };
  prize?: {
    prize_id: number;
    prize_name: string;
    value: number;
    description?: string;
  };
  draw?: {
    draw_id: number;
    contest_id: number;
    executed_at: string;
  };
}

export class WinnerService {
  // Get all winners
  static async getAllWinners(): Promise<Winner[]> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        participant:participants(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws(draw_id, contest_id, executed_at)
      `)
      .order('winner_id', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get winners by contest
  static async getWinnersByContest(contestId: number): Promise<Winner[]> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        participant:participants(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws!inner(draw_id, contest_id, executed_at)
      `)
      .eq('draw.contest_id', contestId)
      .order('winner_id', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get winners by draw
  static async getWinnersByDraw(drawId: number): Promise<Winner[]> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        participant:participants(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws(draw_id, contest_id, executed_at)
      `)
      .eq('draw_id', drawId)
      .order('winner_id', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get winner by ID
  static async getWinnerById(winnerId: number): Promise<Winner | null> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        participant:participants(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws(draw_id, contest_id, executed_at)
      `)
      .eq('winner_id', winnerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Create a new winner
  static async createWinner(winner: {
    draw_id: number;
    participant_id: number;
    prize_id?: number;
    prize_status?: 'PENDING' | 'CLAIMED' | 'SHIPPED';
    notified?: boolean;
  }): Promise<Winner> {
    const { data, error } = await supabase
      .from('winners')
      .insert({
        ...winner,
        prize_status: winner.prize_status || 'PENDING',
        notified: winner.notified || false
      })
      .select(`
        *,
        participant:participants(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws(draw_id, contest_id, executed_at)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Update winner
  static async updateWinner(
    winnerId: number,
    updates: Partial<Winner>
  ): Promise<Winner> {
    const { data, error } = await supabase
      .from('winners')
      .update(updates)
      .eq('winner_id', winnerId)
      .select(`
        *,
        participant:participants(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws(draw_id, contest_id, executed_at)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Delete winner
  static async deleteWinner(winnerId: number): Promise<void> {
    const { error } = await supabase
      .from('winners')
      .delete()
      .eq('winner_id', winnerId);

    if (error) throw error;
  }

  // Update prize status
  static async updatePrizeStatus(
    winnerId: number,
    status: 'PENDING' | 'CLAIMED' | 'SHIPPED'
  ): Promise<Winner> {
    return this.updateWinner(winnerId, { prize_status: status });
  }

  // Mark as notified
  static async markAsNotified(winnerId: number): Promise<Winner> {
    return this.updateWinner(winnerId, {
      notified: true,
      notified_at: new Date().toISOString()
    });
  }

  // Bulk mark as notified
  static async bulkMarkAsNotified(winnerIds: number[]): Promise<void> {
    const { error } = await supabase
      .from('winners')
      .update({
        notified: true,
        notified_at: new Date().toISOString()
      })
      .in('winner_id', winnerIds);

    if (error) throw error;
  }

  // Get winner statistics
  static async getWinnerStats(contestId?: number) {
    let query = supabase
      .from('winners')
      .select(`
        winner_id,
        prize_status,
        notified,
        draw:draws!inner(contest_id)
      `);

    if (contestId) {
      query = query.eq('draw.contest_id', contestId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data?.length || 0;
    const pending = data?.filter(w => w.prize_status === 'PENDING').length || 0;
    const claimed = data?.filter(w => w.prize_status === 'CLAIMED').length || 0;
    const shipped = data?.filter(w => w.prize_status === 'SHIPPED').length || 0;
    const notified = data?.filter(w => w.notified).length || 0;
    const notNotified = total - notified;

    return {
      total,
      pending,
      claimed,
      shipped,
      notified,
      notNotified
    };
  }

  // Search winners
  static async searchWinners(searchTerm: string): Promise<Winner[]> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        participant:participants!inner(participant_id, name, contact, contest_id),
        prize:prizes(prize_id, prize_name, value, description),
        draw:draws(draw_id, contest_id, executed_at)
      `)
      .or(`participant.name.ilike.%${searchTerm}%,participant.contact.ilike.%${searchTerm}%`)
      .order('winner_id', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get winners count by contest
  static async getWinnerCountByContest(contestId: number): Promise<number> {
    const { count, error } = await supabase
      .from('winners')
      .select(`
        winner_id,
        draw:draws!inner(contest_id)
      `, { count: 'exact', head: true })
      .eq('draw.contest_id', contestId);

    if (error) throw error;
    return count || 0;
  }

  // Check if participant is already a winner in a contest
  static async isParticipantWinner(participantId: number, contestId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        winner_id,
        draw:draws!inner(contest_id)
      `)
      .eq('participant_id', participantId)
      .eq('draw.contest_id', contestId)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }
}
