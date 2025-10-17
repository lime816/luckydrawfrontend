import { supabase } from '../lib/supabase-db';

/**
 * Flow Builder Database Integration Service
 * Connects WhatsApp Flow Builder with Lucky Draw database tables:
 * - Message Library → messages table
 * - Create Flow → forms table
 * - Flow Responses → form_responses table
 * - Links flow_id, contest_id, and response_id
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FlowMessage {
  message_id?: number;
  contest_id: number;
  participant_id?: number;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  recipient: string;
  content: string;
  sent_at?: Date;
  sent_by?: number;
  is_auto: boolean;
}

export interface FlowForm {
  form_id?: number;
  form_name: string;
  form_schema: any; // JSON schema of the flow
  created_at?: Date;
  flow_id?: string; // WhatsApp Flow ID
  contest_id?: number; // Associated contest
}

export interface FlowResponse {
  response_id?: number;
  form_id: number;
  response_data: any; // JSON response data from flow
  submitted_at?: Date;
  flow_response_id?: string; // WhatsApp Flow Response ID
  participant_id?: number; // Link to participant
}

export interface FlowBuilderData {
  flowId: string;
  flowName: string;
  contestId?: number;
  screens: any[]; // Flow screens/schema
  createdAt: Date;
}

// ============================================
// MESSAGE LIBRARY INTEGRATION
// ============================================

export class MessageLibraryService {
  /**
   * Save message from Message Library to messages table
   */
  static async saveMessage(message: FlowMessage): Promise<number> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        contest_id: message.contest_id,
        participant_id: message.participant_id,
        type: message.type,
        recipient: message.recipient,
        content: message.content,
        sent_by: message.sent_by,
        is_auto: message.is_auto,
      })
      .select('message_id')
      .single();

    if (error) throw new Error(`Failed to save message: ${error.message}`);
    return data.message_id;
  }

  /**
   * Get all messages for a contest
   */
  static async getMessagesByContest(contestId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contest_id', contestId)
      .order('sent_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch messages: ${error.message}`);
    return data || [];
  }

  /**
   * Send WhatsApp message and log to database
   */
  static async sendAndLogMessage(
    contestId: number,
    recipient: string,
    content: string,
    sentBy?: number
  ): Promise<{ messageId: number; sent: boolean }> {
    try {
      // Log message to database
      const messageId = await this.saveMessage({
        contest_id: contestId,
        type: 'WHATSAPP',
        recipient,
        content,
        sent_by: sentBy,
        is_auto: true,
      });

      // TODO: Integrate with WhatsApp API to actually send
      // await whatsappService.sendMessage(recipient, content);

      return { messageId, sent: true };
    } catch (error) {
      console.error('Failed to send and log message:', error);
      throw error;
    }
  }
}

// ============================================
// FLOW FORM INTEGRATION
// ============================================

export class FlowFormService {
  /**
   * Create a new form from WhatsApp Flow
   * Links flow_id with form_id and contest_id
   */
  static async createFlowForm(
    flowName: string,
    flowSchema: any,
    flowId: string,
    contestId?: number
  ): Promise<number> {
    const { data, error } = await supabase
      .from('forms')
      .insert({
        form_name: flowName,
        form_schema: {
          ...flowSchema,
          flow_id: flowId,
          contest_id: contestId,
        },
      })
      .select('form_id')
      .single();

    if (error) throw new Error(`Failed to create flow form: ${error.message}`);
    return data.form_id;
  }

  /**
   * Get form by flow_id
   */
  static async getFormByFlowId(flowId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .contains('form_schema', { flow_id: flowId })
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch form: ${error.message}`);
    }
    return data;
  }

  /**
   * Get all forms for a contest
   */
  static async getFormsByContest(contestId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .contains('form_schema', { contest_id: contestId });

    if (error) throw new Error(`Failed to fetch forms: ${error.message}`);
    return data || [];
  }

  /**
   * Update form schema
   */
  static async updateFormSchema(
    formId: number,
    flowSchema: any
  ): Promise<void> {
    const { error } = await supabase
      .from('forms')
      .update({ form_schema: flowSchema })
      .eq('form_id', formId);

    if (error) throw new Error(`Failed to update form: ${error.message}`);
  }

  /**
   * Link form to contest
   */
  static async linkFormToContest(
    formId: number,
    contestId: number
  ): Promise<void> {
    // Update contest to use this form
    const { error } = await supabase
      .from('contests')
      .update({ entry_form_id: formId })
      .eq('contest_id', contestId);

    if (error)
      throw new Error(`Failed to link form to contest: ${error.message}`);
  }
}

// ============================================
// FLOW RESPONSE INTEGRATION
// ============================================

export class FlowResponseService {
  /**
   * Save flow response with unique response_id
   * Links flow_response_id, form_id, and participant_id
   */
  static async saveFlowResponse(
    formId: number,
    responseData: any,
    flowResponseId: string,
    participantId?: number
  ): Promise<number> {
    const { data, error } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        response_data: {
          ...responseData,
          flow_response_id: flowResponseId,
          participant_id: participantId,
        },
      })
      .select('response_id')
      .single();

    if (error)
      throw new Error(`Failed to save flow response: ${error.message}`);
    return data.response_id;
  }

  /**
   * Get response by flow_response_id
   */
  static async getResponseByFlowResponseId(
    flowResponseId: string
  ): Promise<any | null> {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .contains('response_data', { flow_response_id: flowResponseId })
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch response: ${error.message}`);
    }
    return data;
  }

  /**
   * Get all responses for a form
   */
  static async getResponsesByForm(formId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch responses: ${error.message}`);
    return data || [];
  }

  /**
   * Link response to participant
   */
  static async linkResponseToParticipant(
    responseId: number,
    participantId: number
  ): Promise<void> {
    // Update participant with form_response_id
    const { error } = await supabase
      .from('participants')
      .update({ form_response_id: responseId })
      .eq('participant_id', participantId);

    if (error)
      throw new Error(
        `Failed to link response to participant: ${error.message}`
      );
  }

  /**
   * Create participant from flow response
   */
  static async createParticipantFromResponse(
    contestId: number,
    responseId: number,
    responseData: any
  ): Promise<number> {
    // Extract participant info from response data
    const name = responseData.name || responseData.full_name || 'Unknown';
    const contact =
      responseData.phone ||
      responseData.email ||
      responseData.contact ||
      'Unknown';

    const { data, error } = await supabase
      .from('participants')
      .insert({
        contest_id: contestId,
        name,
        contact,
        form_response_id: responseId,
        validated: false, // Needs validation
      })
      .select('participant_id')
      .single();

    if (error)
      throw new Error(`Failed to create participant: ${error.message}`);
    return data.participant_id;
  }
}

// ============================================
// INTEGRATED FLOW BUILDER SERVICE
// ============================================

export class FlowBuilderDatabaseService {
  /**
   * Complete flow creation workflow:
   * 1. Create form in database
   * 2. Link to contest if provided
   * 3. Return form_id and flow_id mapping
   */
  static async createCompleteFlow(
    flowName: string,
    flowSchema: any,
    flowId: string,
    contestId?: number
  ): Promise<{ formId: number; flowId: string; contestId?: number }> {
    try {
      // Create form
      const formId = await FlowFormService.createFlowForm(
        flowName,
        flowSchema,
        flowId,
        contestId
      );

      // Link to contest if provided
      if (contestId) {
        await FlowFormService.linkFormToContest(formId, contestId);
      }

      return { formId, flowId, contestId };
    } catch (error) {
      console.error('Failed to create complete flow:', error);
      throw error;
    }
  }

  /**
   * Process flow response workflow:
   * 1. Save response to database
   * 2. Create participant if contest_id exists
   * 3. Link response to participant
   * 4. Return response_id and participant_id
   */
  static async processFlowResponse(
    flowId: string,
    flowResponseId: string,
    responseData: any
  ): Promise<{
    responseId: number;
    participantId?: number;
    formId: number;
  }> {
    try {
      // Get form by flow_id
      const form = await FlowFormService.getFormByFlowId(flowId);
      if (!form) {
        throw new Error(`Form not found for flow_id: ${flowId}`);
      }

      const formId = form.form_id;
      const contestId = form.form_schema?.contest_id;

      // Save response
      const responseId = await FlowResponseService.saveFlowResponse(
        formId,
        responseData,
        flowResponseId
      );

      // Create participant if contest exists
      let participantId: number | undefined;
      if (contestId) {
        participantId =
          await FlowResponseService.createParticipantFromResponse(
            contestId,
            responseId,
            responseData
          );
      }

      return { responseId, participantId, formId };
    } catch (error) {
      console.error('Failed to process flow response:', error);
      throw error;
    }
  }

  /**
   * Get complete flow data including form, responses, and participants
   */
  static async getCompleteFlowData(flowId: string): Promise<{
    form: any;
    responses: any[];
    participants: any[];
  }> {
    try {
      const form = await FlowFormService.getFormByFlowId(flowId);
      if (!form) {
        throw new Error(`Form not found for flow_id: ${flowId}`);
      }

      const responses = await FlowResponseService.getResponsesByForm(
        form.form_id
      );

      // Get participants if contest exists
      let participants: any[] = [];
      const contestId = form.form_schema?.contest_id;
      if (contestId) {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('contest_id', contestId);
        participants = data || [];
      }

      return { form, responses, participants };
    } catch (error) {
      console.error('Failed to get complete flow data:', error);
      throw error;
    }
  }
}

// Export all services
export default {
  MessageLibraryService,
  FlowFormService,
  FlowResponseService,
  FlowBuilderDatabaseService,
};
