/**
 * Contest Approval Service
 * Handles all approval workflow operations
 */

import { supabase } from '../lib/supabase-db';

export interface ApprovalLog {
  log_id: number;
  contest_id: number;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  performed_by: number;
  performed_at: string;
  previous_status?: string;
  new_status?: string;
  reason?: string;
  metadata?: any;
}

export interface ApprovalNotification {
  notification_id: number;
  contest_id: number;
  recipient_id: number;
  notification_type: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'TIMEOUT';
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export class ApprovalService {
  /**
   * Check if user can approve contests
   */
  static async canApprove(userId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('admins')
      .select('is_super_admin, is_approval_manager')
      .eq('admin_id', userId)
      .single();

    if (error || !data) return false;
    return data.is_super_admin || data.is_approval_manager;
  }

  /**
   * Get approval manager
   */
  static async getApprovalManager(): Promise<any | null> {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('is_approval_manager', true)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Assign approval manager (Super Admin only)
   */
  static async assignApprovalManager(
    superAdminId: number,
    managerId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify super admin
      const { data: admin } = await supabase
        .from('admins')
        .select('is_super_admin')
        .eq('admin_id', superAdminId)
        .single();

      if (!admin?.is_super_admin) {
        return { success: false, error: 'Only Super Admin can assign approval manager' };
      }

      // Remove existing approval manager
      await supabase
        .from('admins')
        .update({ is_approval_manager: false })
        .eq('is_approval_manager', true);

      // Assign new approval manager
      const { error } = await supabase
        .from('admins')
        .update({
          is_approval_manager: true,
          approval_manager_assigned_at: new Date().toISOString(),
          approval_manager_assigned_by: superAdminId,
        })
        .eq('admin_id', managerId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revoke approval manager
   */
  static async revokeApprovalManager(
    superAdminId: number,
    managerId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admins')
        .update({
          is_approval_manager: false,
          approval_manager_assigned_at: null,
          approval_manager_assigned_by: null,
        })
        .eq('admin_id', managerId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve a contest
   */
  static async approveContest(
    contestId: number,
    reviewerId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user can approve
      const canApprove = await this.canApprove(reviewerId);
      if (!canApprove) {
        return { success: false, error: 'You do not have permission to approve contests' };
      }

      // Get current contest status
      const { data: contest } = await supabase
        .from('contests')
        .select('approval_status, created_by, name')
        .eq('contest_id', contestId)
        .single();

      if (!contest) {
        return { success: false, error: 'Contest not found' };
      }

      // Update contest status
      const { error: updateError } = await supabase
        .from('contests')
        .update({
          approval_status: 'APPROVED',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('contest_id', contestId);

      if (updateError) throw updateError;

      // Log the approval
      await this.logApprovalAction({
        contest_id: contestId,
        action: 'APPROVED',
        performed_by: reviewerId,
        previous_status: contest.approval_status,
        new_status: 'APPROVED',
      });

      // Notify contest creator
      await this.createNotification({
        contest_id: contestId,
        recipient_id: contest.created_by,
        notification_type: 'APPROVED',
        message: `Your contest "${contest.name}" has been approved!`,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reject a contest
   */
  static async rejectContest(
    contestId: number,
    reviewerId: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user can approve
      const canApprove = await this.canApprove(reviewerId);
      if (!canApprove) {
        return { success: false, error: 'You do not have permission to reject contests' };
      }

      // Get current contest status
      const { data: contest } = await supabase
        .from('contests')
        .select('approval_status, created_by, name')
        .eq('contest_id', contestId)
        .single();

      if (!contest) {
        return { success: false, error: 'Contest not found' };
      }

      // Update contest status
      const { error: updateError } = await supabase
        .from('contests')
        .update({
          approval_status: 'REJECTED',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('contest_id', contestId);

      if (updateError) throw updateError;

      // Log the rejection
      await this.logApprovalAction({
        contest_id: contestId,
        action: 'REJECTED',
        performed_by: reviewerId,
        previous_status: contest.approval_status,
        new_status: 'REJECTED',
        reason,
      });

      // Notify contest creator
      await this.createNotification({
        contest_id: contestId,
        recipient_id: contest.created_by,
        notification_type: 'REJECTED',
        message: `Your contest "${contest.name}" has been rejected. Reason: ${reason}`,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get pending contests for approval
   */
  static async getPendingContests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('contests')
      .select(`
        *,
        creator:admins!created_by(admin_id, name, email)
      `)
      .eq('approval_status', 'PENDING')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending contests:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Log approval action
   */
  static async logApprovalAction(log: Omit<ApprovalLog, 'log_id' | 'performed_at'>): Promise<void> {
    await supabase.from('contest_approval_log').insert({
      contest_id: log.contest_id,
      action: log.action,
      performed_by: log.performed_by,
      previous_status: log.previous_status,
      new_status: log.new_status,
      reason: log.reason,
      metadata: log.metadata,
    });
  }

  /**
   * Create notification
   */
  static async createNotification(
    notification: Omit<ApprovalNotification, 'notification_id' | 'is_read' | 'created_at' | 'read_at'>
  ): Promise<void> {
    await supabase.from('approval_notifications').insert({
      contest_id: notification.contest_id,
      recipient_id: notification.recipient_id,
      notification_type: notification.notification_type,
      message: notification.message,
    });
  }

  /**
   * Get notifications for user
   */
  static async getNotifications(userId: number, unreadOnly: boolean = false): Promise<ApprovalNotification[]> {
    let query = supabase
      .from('approval_notifications')
      .select(`
        *,
        contest:contests(contest_id, name)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: number): Promise<void> {
    await supabase
      .from('approval_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('notification_id', notificationId);
  }

  /**
   * Get approval logs for contest
   */
  static async getApprovalLogs(contestId: number): Promise<ApprovalLog[]> {
    const { data, error } = await supabase
      .from('contest_approval_log')
      .select(`
        *,
        performer:admins!performed_by(admin_id, name, email)
      `)
      .eq('contest_id', contestId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching approval logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check for expired approvals
   */
  static async checkExpiredApprovals(): Promise<void> {
    // This would typically be called by a cron job
    await supabase.rpc('check_approval_timeout');
  }
}

export default ApprovalService;
