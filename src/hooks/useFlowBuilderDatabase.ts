import { useState, useCallback } from 'react';
import {
  FlowBuilderDatabaseService,
  MessageLibraryService,
  FlowFormService,
  FlowResponseService,
} from '../services/flowBuilderDatabaseService';
import toast from 'react-hot-toast';

/**
 * React Hook for Flow Builder Database Integration
 * Provides easy-to-use functions for connecting Flow Builder with database
 */

export function useFlowBuilderDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================
  // FLOW CREATION
  // ============================================

  const createFlow = useCallback(
    async (
      flowName: string,
      flowSchema: any,
      flowId: string,
      contestId?: number
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await FlowBuilderDatabaseService.createCompleteFlow(
          flowName,
          flowSchema,
          flowId,
          contestId
        );

        toast.success(
          `Flow "${flowName}" created successfully! Form ID: ${result.formId}`
        );
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to create flow: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================
  // FLOW RESPONSE PROCESSING
  // ============================================

  const processFlowResponse = useCallback(
    async (flowId: string, flowResponseId: string, responseData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await FlowBuilderDatabaseService.processFlowResponse(
          flowId,
          flowResponseId,
          responseData
        );

        toast.success(
          `Flow response processed! Response ID: ${result.responseId}`
        );
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to process response: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================
  // MESSAGE LIBRARY
  // ============================================

  const sendMessage = useCallback(
    async (
      contestId: number,
      recipient: string,
      content: string,
      sentBy?: number
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await MessageLibraryService.sendAndLogMessage(
          contestId,
          recipient,
          content,
          sentBy
        );

        toast.success('Message sent and logged successfully!');
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to send message: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getContestMessages = useCallback(async (contestId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const messages = await MessageLibraryService.getMessagesByContest(
        contestId
      );
      return messages;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch messages: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // FORM MANAGEMENT
  // ============================================

  const getFormByFlowId = useCallback(async (flowId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const form = await FlowFormService.getFormByFlowId(flowId);
      return form;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch form: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getContestForms = useCallback(async (contestId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const forms = await FlowFormService.getFormsByContest(contestId);
      return forms;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch forms: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const linkFormToContest = useCallback(
    async (formId: number, contestId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await FlowFormService.linkFormToContest(formId, contestId);
        toast.success('Form linked to contest successfully!');
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to link form: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================
  // RESPONSE MANAGEMENT
  // ============================================

  const getFormResponses = useCallback(async (formId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const responses = await FlowResponseService.getResponsesByForm(formId);
      return responses;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch responses: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const linkResponseToParticipant = useCallback(
    async (responseId: number, participantId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await FlowResponseService.linkResponseToParticipant(
          responseId,
          participantId
        );
        toast.success('Response linked to participant successfully!');
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error(`Failed to link response: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ============================================
  // COMPLETE FLOW DATA
  // ============================================

  const getCompleteFlowData = useCallback(async (flowId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await FlowBuilderDatabaseService.getCompleteFlowData(
        flowId
      );
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(`Failed to fetch flow data: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,

    // Flow Operations
    createFlow,
    processFlowResponse,
    getCompleteFlowData,

    // Message Library
    sendMessage,
    getContestMessages,

    // Form Management
    getFormByFlowId,
    getContestForms,
    linkFormToContest,

    // Response Management
    getFormResponses,
    linkResponseToParticipant,
  };
}

export default useFlowBuilderDatabase;
