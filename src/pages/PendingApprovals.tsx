/**
 * Pending Approvals Page
 * Shows contests awaiting approval (Super Admin & Approval Manager only)
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, User, Calendar } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ApprovalService } from '../services/approvalService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface PendingContest {
  contest_id: number;
  name: string;
  theme: string;
  description: string;
  start_time: string;
  end_time: string;
  submitted_at: string;
  creator: {
    admin_id: number;
    name: string;
    email: string;
  };
}

export const PendingApprovals: React.FC = () => {
  const { user } = useAuthStore();
  const [contests, setContests] = useState<PendingContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContest, setSelectedContest] = useState<PendingContest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [canApprove, setCanApprove] = useState(false);

  useEffect(() => {
    loadPendingContests();
    checkApprovalPermission();
  }, []);

  const checkApprovalPermission = async () => {
    if (user?.id) {
      const permission = await ApprovalService.canApprove(Number(user.id));
      setCanApprove(permission);
    }
  };

  const loadPendingContests = async () => {
    try {
      setLoading(true);
      const data = await ApprovalService.getPendingContests();
      setContests(data);
    } catch (error) {
      console.error('Error loading pending contests:', error);
      toast.error('Failed to load pending contests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contestId: number) => {
    if (!user?.id) return;

    setProcessing(true);
    try {
      const result = await ApprovalService.approveContest(contestId, Number(user.id));
      
      if (result.success) {
        toast.success('Contest approved successfully!');
        await loadPendingContests();
      } else {
        toast.error(result.error || 'Failed to approve contest');
      }
    } catch (error) {
      console.error('Error approving contest:', error);
      toast.error('An error occurred while approving the contest');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContest || !user?.id || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const result = await ApprovalService.rejectContest(
        selectedContest.contest_id,
        Number(user.id),
        rejectionReason
      );
      
      if (result.success) {
        toast.success('Contest rejected');
        setShowRejectModal(false);
        setSelectedContest(null);
        setRejectionReason('');
        await loadPendingContests();
      } else {
        toast.error(result.error || 'Failed to reject contest');
      }
    } catch (error) {
      console.error('Error rejecting contest:', error);
      toast.error('An error occurred while rejecting the contest');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysWaiting = (submittedAt: string) => {
    const days = Math.floor(
      (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (!canApprove) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You do not have permission to view pending approvals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and approve contests awaiting authorization
          </p>
        </div>
        <Badge variant="warning" size="lg">
          <Clock className="w-4 h-4 mr-1" />
          {contests.length} Pending
        </Badge>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading pending contests...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && contests.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">There are no contests pending approval at this time.</p>
        </div>
      )}

      {/* Contests List */}
      {!loading && contests.length > 0 && (
        <div className="grid gap-6">
          {contests.map((contest) => {
            const daysWaiting = getDaysWaiting(contest.submitted_at);
            const isUrgent = daysWaiting >= 5;

            return (
              <div
                key={contest.contest_id}
                className={`bg-white rounded-xl shadow-sm border-2 ${
                  isUrgent ? 'border-red-300' : 'border-gray-200'
                } p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{contest.name}</h3>
                      {isUrgent && (
                        <Badge variant="danger" size="sm">
                          <Clock className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{contest.theme}</p>
                    {contest.description && (
                      <p className="text-sm text-gray-500 mb-3">{contest.description}</p>
                    )}
                  </div>
                </div>

                {/* Contest Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Created By</p>
                      <p className="text-sm font-semibold text-gray-800">{contest.creator.name}</p>
                      <p className="text-xs text-gray-500">{contest.creator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(contest.submitted_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {daysWaiting} {daysWaiting === 1 ? 'day' : 'days'} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Contest Period</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(contest.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        to {new Date(contest.end_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleApprove(contest.contest_id)}
                    disabled={processing}
                    className="flex-1"
                  >
                    Approve Contest
                  </Button>
                  <Button
                    variant="danger"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => {
                      setSelectedContest(contest);
                      setShowRejectModal(true);
                    }}
                    disabled={processing}
                    className="flex-1"
                  >
                    Reject Contest
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => {
                      // Navigate to contest details
                      window.location.href = `/contests`;
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedContest(null);
          setRejectionReason('');
        }}
        title="Reject Contest"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedContest(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              Reject Contest
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to reject the contest:{' '}
            <span className="font-semibold">{selectedContest?.name}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
              placeholder="Please provide a clear reason for rejection..."
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The contest creator will be notified of this rejection and the
              reason you provide.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingApprovals;
