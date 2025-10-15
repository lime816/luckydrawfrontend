import { supabase } from '../lib/supabase-db';

export interface Message {
  message_id: number;
  contest_id: number;
  participant_id?: number | null;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  recipient: string;
  content: string;
  sent_at: string;
  sent_by?: number | null;
  is_auto: boolean;
}

export interface SendMessageRequest {
  contest_id: number;
  participant_id?: number;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  recipient: string;
  content: string;
  sent_by: number;
  is_auto?: boolean;
}

export class MessageService {
  // Send a message
  static async sendMessage(request: SendMessageRequest): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        contest_id: request.contest_id,
        participant_id: request.participant_id || null,
        type: request.type,
        recipient: request.recipient,
        content: request.content,
        sent_by: request.sent_by,
        is_auto: request.is_auto || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all messages
  static async getAllMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get messages by contest
  static async getMessagesByContest(contestId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contest_id', contestId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get message statistics
  static async getMessageStats() {
    const [total, email, sms, whatsapp] = await Promise.all([
      supabase.from('messages').select('message_id', { count: 'exact', head: true }),
      supabase.from('messages').select('message_id', { count: 'exact', head: true }).eq('type', 'EMAIL'),
      supabase.from('messages').select('message_id', { count: 'exact', head: true }).eq('type', 'SMS'),
      supabase.from('messages').select('message_id', { count: 'exact', head: true }).eq('type', 'WHATSAPP'),
    ]);

    return {
      total: total.count || 0,
      email: email.count || 0,
      sms: sms.count || 0,
      whatsapp: whatsapp.count || 0,
    };
  }

  // Send bulk messages
  static async sendBulkMessage(
    contestId: number,
    type: 'EMAIL' | 'SMS' | 'WHATSAPP',
    content: string,
    sentBy: number
  ): Promise<Message[]> {
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('participant_id, name, contact')
      .eq('contest_id', contestId)
      .eq('validated', true);

    if (participantsError) throw participantsError;
    if (!participants || participants.length === 0) {
      throw new Error('No participants found');
    }

    const messages = participants.map(p => ({
      contest_id: contestId,
      participant_id: p.participant_id,
      type,
      recipient: p.contact,
      content,
      sent_by: sentBy,
      is_auto: false,
    }));

    const { data, error } = await supabase
      .from('messages')
      .insert(messages)
      .select();

    if (error) throw error;
    return data || [];
  }

  // Delete message
  static async deleteMessage(messageId: number): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('message_id', messageId);

    if (error) throw error;
  }
}
