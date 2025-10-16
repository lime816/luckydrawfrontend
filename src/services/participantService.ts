import { supabase } from '../lib/supabase-db';

export interface Participant {
  participant_id: number;
  contest_id: number;
  name: string;
  contact: string;
  form_response_id?: number | null;
  entry_timestamp: string;
  validated: boolean;
  unique_token?: string | null;
  contest?: {
    name: string;
    contest_id: number;
  };
}

export class ParticipantService {
  // Get all participants
  static async getAllParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        contest:contests(name, contest_id)
      `)
      .order('entry_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get participants by contest
  static async getParticipantsByContest(contestId: number): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        contest:contests(name, contest_id)
      `)
      .eq('contest_id', contestId)
      .order('entry_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get participant by ID
  static async getParticipantById(participantId: number): Promise<Participant | null> {
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        contest:contests(name, contest_id)
      `)
      .eq('participant_id', participantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  // Create a new participant
  static async createParticipant(participant: {
    contest_id: number;
    name: string;
    contact: string;
    form_response_id?: number;
    validated?: boolean;
    unique_token?: string;
  }): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .insert({
        ...participant,
        validated: participant.validated ?? true
      })
      .select(`
        *,
        contest:contests(name, contest_id)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Update participant
  static async updateParticipant(
    participantId: number,
    updates: Partial<Participant>
  ): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('participant_id', participantId)
      .select(`
        *,
        contest:contests(name, contest_id)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Delete participant
  static async deleteParticipant(participantId: number): Promise<void> {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('participant_id', participantId);

    if (error) throw error;
  }

  // Validate participant
  static async validateParticipant(participantId: number, validated: boolean): Promise<Participant> {
    return this.updateParticipant(participantId, { validated });
  }

  // Get participant statistics
  static async getParticipantStats(contestId?: number) {
    let query = supabase
      .from('participants')
      .select('participant_id, validated, contest_id');

    if (contestId) {
      query = query.eq('contest_id', contestId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data?.length || 0;
    const valid = data?.filter(p => p.validated).length || 0;
    const invalid = total - valid;

    // Get unique contests
    const contests = contestId ? 1 : new Set(data?.map(p => p.contest_id)).size;

    return {
      total,
      valid,
      invalid,
      contests
    };
  }

  // Search participants
  static async searchParticipants(searchTerm: string): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select(`
        *,
        contest:contests(name, contest_id)
      `)
      .or(`name.ilike.%${searchTerm}%,contact.ilike.%${searchTerm}%`)
      .order('entry_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Bulk import participants
  static async bulkImportParticipants(participants: Array<{
    contest_id: number;
    name: string;
    contact: string;
    validated?: boolean;
  }>): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .insert(participants)
      .select(`
        *,
        contest:contests(name, contest_id)
      `);

    if (error) throw error;
    return data || [];
  }

  // Check for duplicate participants (by contact in same contest)
  static async checkDuplicate(contestId: number, contact: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('participants')
      .select('participant_id')
      .eq('contest_id', contestId)
      .eq('contact', contact)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  // Get participants count by contest
  static async getParticipantCountByContest(contestId: number): Promise<number> {
    const { count, error } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('contest_id', contestId);

    if (error) throw error;
    return count || 0;
  }
}
