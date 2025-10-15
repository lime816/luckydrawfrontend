// Hybrid Database Service - Uses Supabase client as primary, Prisma as fallback
import { SupabaseService } from '../lib/supabase-db';
import type { Contest, Participant, Prize, Draw, Winner } from '../lib/supabase-db';

// Re-export types for convenience
export type { Contest, Participant, Prize, Draw, Winner };

// Primary database service using Supabase client
export class DatabaseService {
  // Contest operations
  static async createContest(contestData: Omit<Contest, 'contest_id' | 'created_at'>): Promise<Contest> {
    return await SupabaseService.createContest(contestData);
  }

  static async getAllContests(): Promise<Contest[]> {
    return await SupabaseService.getAllContests();
  }

  static async getContestById(id: number): Promise<Contest | null> {
    return await SupabaseService.getContestById(id);
  }

  static async updateContest(id: number, updates: Partial<Contest>): Promise<Contest> {
    return await SupabaseService.updateContest(id, updates);
  }

  static async deleteContest(id: number): Promise<void> {
    return await SupabaseService.deleteContest(id);
  }

  // Participant operations
  static async addParticipant(participantData: Omit<Participant, 'participant_id' | 'entry_timestamp'>): Promise<Participant> {
    return await SupabaseService.addParticipant(participantData);
  }

  static async getParticipantsByContest(contestId: number): Promise<Participant[]> {
    return await SupabaseService.getParticipantsByContest(contestId);
  }

  static async getValidatedParticipants(contestId: number): Promise<Participant[]> {
    return await SupabaseService.getValidatedParticipants(contestId);
  }

  static async updateParticipantValidation(id: number, validated: boolean): Promise<Participant> {
    return await SupabaseService.updateParticipantValidation(id, validated);
  }

  // Prize operations
  static async createPrize(prizeData: Omit<Prize, 'prize_id'>): Promise<Prize> {
    return await SupabaseService.createPrize(prizeData);
  }

  static async getPrizesByContest(contestId: number): Promise<Prize[]> {
    return await SupabaseService.getPrizesByContest(contestId);
  }

  static async updatePrize(id: number, updates: Partial<Prize>): Promise<Prize> {
    return await SupabaseService.updatePrize(id, updates);
  }

  static async deletePrize(id: number): Promise<void> {
    return await SupabaseService.deletePrize(id);
  }

  // Draw operations
  static async executeRandomDraw(
    contestId: number,
    executedBy: number,
    numberOfWinners: number,
    prizeIds?: number[]
  ): Promise<{ draw: Draw; winners: Winner[] }> {
    return await SupabaseService.executeRandomDraw(contestId, executedBy, numberOfWinners, prizeIds);
  }

  static async getWinnersByContest(contestId: number): Promise<Winner[]> {
    return await SupabaseService.getWinnersByContest(contestId);
  }

  static async updateWinnerNotification(winnerId: number, notified: boolean): Promise<Winner> {
    return await SupabaseService.updateWinnerNotification(winnerId, notified);
  }

  // Statistics
  static async getContestStats(contestId: number) {
    return await SupabaseService.getContestStats(contestId);
  }

  // Utility methods
  static async checkDuplicateParticipant(contestId: number, contact: string): Promise<Participant | null> {
    const participants = await this.getParticipantsByContest(contestId);
    return participants.find(p => p.contact === contact) || null;
  }

  static async getActiveContests(): Promise<Contest[]> {
    const contests = await this.getAllContests();
    const now = new Date();
    return contests.filter(contest => {
      const startTime = new Date(contest.start_time);
      const endTime = new Date(contest.end_time);
      return startTime <= now && endTime >= now && contest.status === 'ONGOING';
    });
  }

  static async getContestsByStatus(status: 'UPCOMING' | 'ONGOING' | 'COMPLETED'): Promise<Contest[]> {
    const contests = await this.getAllContests();
    return contests.filter(contest => contest.status === status);
  }
}
