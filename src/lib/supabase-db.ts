import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }
});

// Type definitions matching actual Supabase table structure
export interface Contest {
  contest_id: number;
  name: string;
  theme?: string | null;
  description?: string | null;
  entry_form_id?: number | null;
  start_time: string; // Lucky draw start time (required)
  end_time: string;   // Lucky draw end time (required)
  entry_rules?: any | null;
  status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  created_by?: number | null;
  created_at: string;
  qr_code_url?: string | null;
  // NOTE: whatsapp_number and whatsapp_message columns may not exist in DB schema; avoid writing them from client
}

export interface Participant {
  participant_id: number;
  contest_id: number;
  name: string;
  form_response_id?: number;
  contact: string;
  entry_timestamp: string;
  validated: boolean;
  unique_token?: string;
  ip_address?: string;
  device_id?: string;
}

export interface Prize {
  prize_id: number;
  contest_id: number;
  prize_name: string;
  value?: number;
  quantity: number;
  description?: string;
}

export interface Draw {
  draw_id: number;
  contest_id: number;
  draw_mode: 'RANDOM' | 'MANUAL' | 'WEIGHTED';
  executed_by?: number;
  executed_at: string;
  total_winners: number;
}

export interface Winner {
  winner_id: number;
  draw_id: number;
  participant_id: number;
  prize_id?: number;
  prize_status: 'PENDING' | 'CLAIMED' | 'SHIPPED';
  notified: boolean;
  notified_at?: string;
}

// Database service using Supabase client instead of Prisma
export class SupabaseService {
  // Contest operations - using Supabase directly (RLS policies fixed)
  static async createContest(contestData: Omit<Contest, 'contest_id' | 'created_at'>): Promise<Contest> {
    const { data, error } = await supabase
      .from('contests')
      .insert(contestData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAllContests(): Promise<Contest[]> {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getContestById(id: number): Promise<Contest | null> {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .eq('contest_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  static async updateContest(id: number, updates: Partial<Contest>): Promise<Contest> {
    const { data, error } = await supabase
      .from('contests')
      .update(updates)
      .eq('contest_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteContest(id: number): Promise<void> {
    const { error } = await supabase
      .from('contests')
      .delete()
      .eq('contest_id', id);
    
    if (error) throw error;
  }

  // Participant operations
  static async addParticipant(participantData: Omit<Participant, 'participant_id' | 'entry_timestamp'>): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .insert(participantData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getParticipantsByContest(contestId: number): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('contest_id', contestId)
      .order('entry_timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getValidatedParticipants(contestId: number): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('contest_id', contestId)
      .eq('validated', true)
      .order('entry_timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async updateParticipantValidation(id: number, validated: boolean): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .update({ validated })
      .eq('participant_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Prize operations - using Supabase directly (RLS policies fixed)
  static async createPrize(prizeData: Omit<Prize, 'prize_id'>): Promise<Prize> {
    const { data, error } = await supabase
      .from('prizes')
      .insert(prizeData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPrizesByContest(contestId: number): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('contest_id', contestId)
      .order('value', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async updatePrize(id: number, updates: Partial<Prize>): Promise<Prize> {
    const { data, error } = await supabase
      .from('prizes')
      .update(updates)
      .eq('prize_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePrize(id: number): Promise<void> {
    const { error } = await supabase
      .from('prizes')
      .delete()
      .eq('prize_id', id);
    
    if (error) throw error;
  }

  // Draw operations
  static async createDraw(drawData: Omit<Draw, 'draw_id' | 'executed_at'>): Promise<Draw> {
    const { data, error } = await supabase
      .from('draws')
      .insert(drawData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async executeRandomDraw(
    contestId: number,
    executedBy: number,
    numberOfWinners: number,
    prizeIds?: number[]
  ): Promise<{ draw: Draw; winners: Winner[] }> {
    // Get validated participants
    const participants = await this.getValidatedParticipants(contestId);
    
    if (participants.length === 0) {
      throw new Error('No validated participants found for this contest');
    }

    if (numberOfWinners > participants.length) {
      throw new Error('Number of winners cannot exceed number of participants');
    }

    // Create the draw
    const draw = await this.createDraw({
      contest_id: contestId,
      draw_mode: 'RANDOM',
      executed_by: executedBy,
      total_winners: numberOfWinners,
    });

    // Randomly select winners
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const selectedWinners = shuffled.slice(0, numberOfWinners);

    // Create winner records
    const winnerPromises = selectedWinners.map((participant, index) => {
      const prizeId = prizeIds && prizeIds[index] ? prizeIds[index] : null;
      
      return this.createWinner({
        draw_id: draw.draw_id,
        participant_id: participant.participant_id,
        prize_id: prizeId || undefined,
        prize_status: 'PENDING',
        notified: false,
      });
    });

    const winners = await Promise.all(winnerPromises);

    return { draw, winners };
  }

  // Winner operations
  static async createWinner(winnerData: Omit<Winner, 'winner_id'>): Promise<Winner> {
    const { data, error } = await supabase
      .from('winners')
      .insert(winnerData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getWinnersByContest(contestId: number): Promise<Winner[]> {
    const { data, error } = await supabase
      .from('winners')
      .select(`
        *,
        participants(*),
        prizes(*),
        draws(*)
      `)
      .eq('draws.contest_id', contestId)
      .order('draws.executed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async updateWinnerNotification(winnerId: number, notified: boolean): Promise<Winner> {
    const { data, error } = await supabase
      .from('winners')
      .update({
        notified,
        notified_at: notified ? new Date().toISOString() : null,
      })
      .eq('winner_id', winnerId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Statistics
  static async getContestStats(contestId: number) {
    const [participants, prizes, draws] = await Promise.all([
      this.getParticipantsByContest(contestId),
      this.getPrizesByContest(contestId),
      supabase.from('draws').select('*').eq('contest_id', contestId),
    ]);

    const validatedCount = participants.filter(p => p.validated).length;
    const totalPrizes = prizes.reduce((sum, prize) => sum + prize.quantity, 0);

    return {
      totalParticipants: participants.length,
      validatedParticipants: validatedCount,
      pendingParticipants: participants.length - validatedCount,
      totalPrizes,
      prizeTypes: prizes.length,
      totalDraws: draws.data?.length || 0,
    };
  }
}
