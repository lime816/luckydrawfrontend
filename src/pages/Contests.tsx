import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Eye, QrCode, Power, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Contest, ContestStatus } from '../types';
import { DatabaseService } from '../services/database';
import { formatNumber } from '../utils/helpers';
import { ContestForm } from '../components/contests/ContestForm';
import { QRCodeModal } from '../components/contests/QRCodeModal';
import { ContestDetailsModal } from '../components/contests/ContestDetailsModal';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase-db';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

// Function to set QR code URL for a contest. For now we use a static cat image for all contests
const generateAndUploadQRCode = async (contestId: number, contestName: string): Promise<string> => {
  try {
    const catImageUrl = 'https://hips.hearstapps.com/hmg-prod/images/cutest-cat-breeds-ragdoll-663a8c6d52172.jpg?crop=0.5989005497251375xw:1xh;center,top&resize=980:*';
    console.log(`Using static cat image for contest ${contestId} (${contestName})`);
    // Return the external cat image URL directly. If you prefer storing images in Supabase storage,
    // we can download & upload the image here instead — kept simple for now.
    return catImageUrl;
  } catch (error) {
    console.error('Error in generateAndUploadQRCode:', error);
    throw error;
  }
};

export const Contests: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<Contest | null>(null);

  // Load contests from Supabase
  useEffect(() => {
    loadContests();
  }, []);

  // Handle search navigation - open details modal for searched contest
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchedContestId && contests.length > 0) {
      const contest = contests.find(c => c.id === state.searchedContestId.toString());
      if (contest) {
        // Open the details modal for the searched contest
        setSelectedContest(contest);
        setShowDetailsModal(true);
        // Clear the state
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, contests]);

  // Update contest statuses periodically
  useEffect(() => {
    if (contests.length === 0) return;
    
    console.log('🔄 Setting up automatic status updates...');
    
    // Update immediately when contests load
    const checkAndUpdateStatuses = () => {
      console.log('⏰ Running status check at:', new Date().toLocaleTimeString());
      
      setContests(prevContests => {
        let hasChanges = false;
        
        const updatedContests = prevContests.map(contest => {
          // Skip DRAFT and CANCELLED contests
          if (contest.status === ContestStatus.DRAFT || contest.status === ContestStatus.CANCELLED) {
            return contest;
          }
          
          const { status, isActive } = getAutoStatus(contest.startTime, contest.endTime);
          
          console.log(`Checking "${contest.name}": current=${contest.status}, calculated=${status}`);
          
          // Only update if status or active state has changed
          if (contest.status !== status || contest.isActive !== isActive) {
            hasChanges = true;
            console.log(`🔄 Auto-updating contest "${contest.name}" from ${contest.status} to ${status}, isActive: ${isActive}`);
            
            // Update in database asynchronously
            const updatePayload = { status: status } as any;
            console.log(`📤 Sending to database: contest_id=${contest.id}, payload=`, updatePayload);
            
            DatabaseService.updateContest(parseInt(contest.id), updatePayload)
              .then((result) => {
                console.log(`✅ Database updated successfully:`, result);
              })
              .catch(err => {
                console.error('❌ Failed to auto-update contest status in database:', {
                  contestId: contest.id,
                  contestName: contest.name,
                  attemptedStatus: status,
                  error: err,
                  errorMessage: err?.message,
                  errorDetails: err?.details
                });
              });
            
            return { ...contest, status, isActive };
          }
          return contest;
        });
        
        if (!hasChanges) {
          console.log('✓ No status changes needed');
        }
        
        return hasChanges ? updatedContests : prevContests;
      });
    };
    
    // Run immediately
    checkAndUpdateStatuses();
    
    // Then run every 10 seconds for testing (change to 60000 for production)
    const intervalId = setInterval(checkAndUpdateStatuses, 10000);
    
    return () => {
      console.log('🛑 Stopping automatic status updates');
      clearInterval(intervalId);
    };
  }, [contests.length]); // Re-run when contests are loaded


  // Function to determine status and active state based on dates
  const getAutoStatus = (startTime: string, endTime: string): { status: ContestStatus; isActive: boolean } => {
    try {
      // Validate input
      if (!startTime || !endTime) {
        return { status: ContestStatus.DRAFT, isActive: false };
      }

      // Get current local time in same format as stored times
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const nowString = `${year}-${month}-${day}T${hours}:${minutes}`; // "2025-10-08T13:44"
      
      // Compare strings directly (works because ISO format is sortable)
      const startString = startTime.slice(0, 16);
      const endString = endTime.slice(0, 16);

      console.log('Status check:', {
        now: nowString,
        start: startString,
        end: endString,
        isBeforeStart: nowString < startString,
        isBetween: nowString >= startString && nowString <= endString,
        isAfterEnd: nowString > endString
      });

      if (nowString < startString) {
        console.log('→ Status: UPCOMING');
        return { status: ContestStatus.UPCOMING, isActive: false };
      } else if (nowString >= startString && nowString <= endString) {
        console.log('→ Status: ONGOING');
        return { status: ContestStatus.ONGOING, isActive: true };
      } else {
        console.log('→ Status: COMPLETED');
        return { status: ContestStatus.COMPLETED, isActive: false };
      }
    } catch (error) {
      console.error('Error in getAutoStatus:', error);
      return { status: ContestStatus.DRAFT, isActive: false };
    }
  };


  const loadContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const contestData = await DatabaseService.getAllContests();
      
      // Check user role for filtering
      const isSuperAdmin = user?.role === 'SUPER_ADMIN';
      
      console.log('Current user:', { id: user?.id, role: user?.role });
      console.log('Total contests from DB:', contestData.length);
      
      // Filter contests based on approval status
      const filteredContestData = isSuperAdmin 
        ? contestData // Superadmin sees all contests
        : contestData.filter((c: any) => {
            const isApproved = c.approval_status === 'APPROVED';
            const isOwnContest = c.created_by === Number(user?.id);
            console.log(`Contest ${c.contest_id} (${c.name}):`, {
              approval_status: c.approval_status,
              created_by: c.created_by,
              current_user_id: Number(user?.id),
              isApproved,
              isOwnContest,
              willShow: isApproved || isOwnContest
            });
            return isApproved || isOwnContest;
          });
      
      console.log('Filtered contests:', filteredContestData.length);
      
      // Convert Supabase format to frontend format and load prizes
      const formattedContests: Contest[] = await Promise.all(
        filteredContestData.map(async (contest: any) => {
          // Load prizes for this contest using our new service
          const contestPrizes = await DatabaseService.getPrizesByContest(contest.contest_id);
          
          // Determine auto status based on dates
          const startTime = contest.start_time || '';
          const endTime = contest.end_time || '';
          const { status: autoStatus, isActive: autoIsActive } = getAutoStatus(startTime, endTime);
          
          // Use auto-calculated status if contest is not manually set to DRAFT or CANCELLED
          const finalStatus = (contest.status === 'DRAFT' || contest.status === 'CANCELLED') 
            ? contest.status as ContestStatus
            : autoStatus;
          
          const finalIsActive = (contest.status === 'DRAFT' || contest.status === 'CANCELLED')
            ? false
            : autoIsActive;
          
          return {
            id: contest.contest_id.toString(),
            name: contest.name,
            theme: contest.theme || '',
            description: contest.description || '',
            startTime: startTime,
            endTime: endTime,
            status: finalStatus,
            prizes: contestPrizes.map((prize: any) => ({
              id: prize.prize_id.toString(),
              name: prize.prize_name,
              value: prize.value || 0,
              quantity: prize.quantity
            })),
            entryRules: typeof contest.entry_rules === 'object' && contest.entry_rules !== null 
              ? (contest.entry_rules as any).type || 'one entry'
              : contest.entry_rules || 'one entry',
            participationMethod: [],
            totalParticipants: (contest as any).participants?.length || 0,
            totalEntries: (contest as any).participants?.length || 0,
            createdBy: contest.created_by?.toString() || '1',
            createdAt: contest.created_at,
            updatedAt: contest.created_at,
            qrCodeUrl: contest.qr_code_url || undefined,
            whatsappNumber: contest.whatsapp_number || undefined,
            whatsappMessage: contest.whatsapp_message || undefined,
            isActive: finalIsActive,
            approvalStatus: contest.approval_status || 'APPROVED',
            rejectionReason: contest.rejection_reason,
          };
        })
      );
      
      setContests(formattedContests);
    } catch (err) {
      console.error('Error loading contests:', err);
      setError('Failed to load contests. Please try again.');
      // Fallback to sample data if database fails
      setContests([{
        id: 'sample-1',
        name: 'Sample Contest (Demo)',
        theme: 'Demo',
        description: 'This is sample data - database connection needed',
        startTime: '2025-09-15T10:00',
        endTime: '2025-10-15T18:00',
        status: ContestStatus.ONGOING,
        prizes: [],
        entryRules: 'one entry',
        participationMethod: [],
        totalParticipants: 0,
        totalEntries: 0,
        createdBy: '1',
        createdAt: '2025-09-01',
        updatedAt: '2025-09-01',
        isActive: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async (contestData: any) => {
    try {
      console.log('Creating contest with data (IST):', contestData);
      
      // Ensure times are provided
      if (!contestData.startTime || !contestData.endTime) {
        setError('Start time and end time are required');
        return;
      }
      
      // Check if user is superadmin
      const isSuperAdmin = user?.role === 'SUPER_ADMIN';
      
      // Use times directly as entered
      const startTime = contestData.startTime;
      const endTime = contestData.endTime;
      
      console.log('Contest times:', { startTime, endTime });
      
      // Automatically determine status based on dates
      const { status: autoStatus, isActive: autoIsActive } = getAutoStatus(startTime, endTime);
      
      const contestPayload: any = {
        name: contestData.name,
        theme: contestData.theme || null,
        description: contestData.description || null,
        // Handle both old and new schema during transition
        start_date: startTime ? startTime.split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: endTime ? endTime.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        entry_rules: contestData.entryRules || null,
        status: autoStatus, // Automatically set based on dates
        approval_status: isSuperAdmin ? 'APPROVED' : 'PENDING', // Non-superadmin creates pending contests
        whatsapp_number: contestData.whatsappNumber || null,
        whatsapp_message: contestData.whatsappMessage || null,
      };
      
      // Don't include is_active in payload until column is added to database
      // contestPayload.is_active = autoIsActive;
      
      console.log('Contest payload:', contestPayload);
      
      const result = await DatabaseService.createContest(contestPayload);
      console.log('Contest created successfully:', result);
      
      // Generate and upload QR code
      try {
        const qrCodeUrl = await generateAndUploadQRCode(result.contest_id, result.name);
        console.log('QR Code generated and uploaded:', qrCodeUrl);
        
        // Update contest with QR code URL
        await DatabaseService.updateContest(result.contest_id, {
          qr_code_url: qrCodeUrl
        });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        // Don't fail the whole operation if QR generation fails
      }
      
      // Also create prizes if any
      if (contestData.prizes && contestData.prizes.length > 0) {
        console.log('Creating prizes for contest:', result.contest_id);
        for (const prize of contestData.prizes) {
          await DatabaseService.createPrize({
            contest_id: result.contest_id,
            prize_name: prize.name,
            value: prize.value,
            quantity: prize.quantity,
            description: prize.description || null,
          });
        }
        console.log('Prizes created successfully');
      }
      
      // Reload contests after creation
      await loadContests();
      setShowCreateModal(false);
      setError(null);
      
      if (isSuperAdmin) {
        toast.success('Contest created successfully!');
      } else {
        toast.success('Contest submitted for approval! It will be reviewed by a superadmin.');
      }
      
    } catch (err: any) {
      console.error('Error creating contest:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      setError(`Failed to create contest: ${err.message || 'Please try again.'}`);
    }
  };

  const handleDeleteContest = async (contestId: string) => {
    try {
      await DatabaseService.deleteContest(parseInt(contestId));
      await loadContests(); // Reload after deletion
      setShowDeleteModal(false);
      setContestToDelete(null);
    } catch (err) {
      console.error('Error deleting contest:', err);
      setError('Failed to delete contest. Please try again.');
    }
  };

  const handleToggleActive = async (contest: Contest) => {
    try {
      // Prevent toggling completed contests
      if (contest.status === ContestStatus.COMPLETED) {
        console.warn('Cannot toggle completed contest');
        setError('Cannot enable/disable a completed contest');
        return;
      }
      
      const newActiveStatus = !contest.isActive;
      
      let newStatus = contest.status;
      
      if (newActiveStatus) {
        // Enabling: Calculate status based on current date/time
        const { status: calculatedStatus } = getAutoStatus(contest.startTime, contest.endTime);
        
        // Don't allow enabling if the calculated status is COMPLETED
        if (calculatedStatus === ContestStatus.COMPLETED) {
          console.warn('Cannot enable contest - it has already ended');
          setError('Cannot enable a contest that has already ended');
          return;
        }
        
        newStatus = calculatedStatus;
        console.log(`🟢 Enabling contest "${contest.name}" - Status will be: ${newStatus}`);
      } else {
        // Disabling: Set status to CANCELLED to stop the contest
        newStatus = ContestStatus.CANCELLED;
        console.log(`🔴 Disabling contest "${contest.name}" - Status will be: CANCELLED`);
      }
      
      // Update local state immediately for better UX
      setContests(contests.map(c => 
        c.id === contest.id ? { ...c, isActive: newActiveStatus, status: newStatus } : c
      ));
      
      // Update in database
      try {
        await DatabaseService.updateContest(parseInt(contest.id), {
          status: newStatus,
          // is_active: newActiveStatus  // Uncomment when column exists
        } as any);
        
        const statusText = newActiveStatus ? 'enabled' : 'disabled';
        console.log(`✅ Contest "${contest.name}" ${statusText} successfully. Status: ${newStatus}`);
        setError(null);
      } catch (dbErr: any) {
        console.error('❌ Failed to update contest in database:', dbErr);
        
        // Revert the local change
        setContests(contests.map(c => 
          c.id === contest.id ? { ...c, isActive: !newActiveStatus, status: contest.status } : c
        ));
        setError('Failed to update contest status in database.');
      }
    } catch (err) {
      console.error('Error toggling contest status:', err);
      setError('Failed to update contest status. Please try again.');
    }
  };

  const handleUpdateContest = async (contestData: any) => {
    if (!editingContest) return;
    
    try {
      await DatabaseService.updateContest(parseInt(editingContest.id), {
        name: contestData.name,
        theme: contestData.theme,
        description: contestData.description,
        start_time: contestData.startTime,
        end_time: contestData.endTime,
        entry_rules: contestData.entryRules,
        status: contestData.status,
        whatsapp_number: contestData.whatsappNumber || null,
        whatsapp_message: contestData.whatsappMessage || null,
      });
      
      // Reload contests after update
      await loadContests();
      setShowCreateModal(false);
      setEditingContest(null);
    } catch (err) {
      console.error('Error updating contest:', err);
      setError('Failed to update contest. Please try again.');
    }
  };

  const getStatusBadge = (status: ContestStatus) => {
    const variants: Record<ContestStatus, 'success' | 'warning' | 'info' | 'default' | 'danger'> = {
      [ContestStatus.ONGOING]: 'success',
      [ContestStatus.UPCOMING]: 'info',
      [ContestStatus.COMPLETED]: 'default',
      [ContestStatus.DRAFT]: 'warning',
      [ContestStatus.CANCELLED]: 'danger',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredContests = contests.filter((contest) => {
    const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || contest.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'serial',
      header: 'S.No',
      render: (contest: Contest, index: number) => (
        <span className="font-medium text-gray-700">{index + 1}</span>
      ),
    },
    {
      key: 'id',
      header: 'Contest ID',
      render: (contest: Contest) => (
        <span className="font-mono text-sm text-gray-600">#{contest.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Contest Name',
      render: (contest: Contest) => (
        <div>
          <p className="font-medium text-gray-900">{contest.name}</p>
          <p className="text-sm text-gray-500">{contest.theme}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (contest: Contest) => getStatusBadge(contest.status),
    },
    {
      key: 'approval',
      header: 'Approval',
      render: (contest: Contest) => {
        if (!contest.approvalStatus || contest.approvalStatus === 'APPROVED') {
          return <Badge variant="success" size="sm">Approved</Badge>;
        }
        if (contest.approvalStatus === 'PENDING') {
          return <Badge variant="warning" size="sm">Pending</Badge>;
        }
        if (contest.approvalStatus === 'REJECTED') {
          return <Badge variant="danger" size="sm">Rejected</Badge>;
        }
        return null;
      },
    },
    {
      key: 'active',
      header: 'Active',
      render: (contest: Contest) => (
        <Badge variant={contest.isActive ? 'success' : 'default'} size="sm">
          {contest.isActive ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (contest: Contest) => {
        try {
          // Check if times are valid
          if (!contest.startTime || !contest.endTime) {
            return <span className="text-sm text-gray-400">No schedule set</span>;
          }

          // Parse time directly from string to avoid timezone conversion
          const formatDateTime = (timeString: string) => {
            try {
              // Extract date and time parts from ISO string
              // Format: "2025-10-08T13:00:00" or "2025-10-08T13:00:00.000Z"
              const [datePart, timePart] = timeString.split('T');
              const [year, month, day] = datePart.split('-');
              const [hourMin] = timePart.split(':');
              const hours24 = parseInt(hourMin);
              const minutes = timePart.split(':')[1];
              
              // Convert to 12-hour format
              const ampm = hours24 >= 12 ? 'PM' : 'AM';
              let hours12 = hours24 % 12;
              hours12 = hours12 ? hours12 : 12;
              
              // Format month
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const monthName = monthNames[parseInt(month) - 1];
              
              return `${day} ${monthName} ${year}, ${hours12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
            } catch (error) {
              console.error('Error parsing time:', timeString, error);
              return 'Invalid time';
            }
          };
          
          return (
            <div className="text-sm">
              <p className="font-medium">{formatDateTime(contest.startTime)}</p>
              <p className="text-gray-500">to {formatDateTime(contest.endTime)}</p>
            </div>
          );
        } catch (error) {
          console.error('Error formatting date:', error, contest);
          return <span className="text-sm text-red-400">Date error</span>;
        }
      },
    },
    {
      key: 'participants',
      header: 'Participants',
      render: (contest: Contest) => (
        <span className="font-medium">{formatNumber(contest.totalParticipants)}</span>
      ),
    },
    {
      key: 'prizes',
      header: 'Prizes',
      render: (contest: Contest) => (
        <span className="font-medium">{contest.prizes.length}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (contest: Contest) => {
        const isSuperAdmin = user?.role === 'SUPER_ADMIN';
        const isPending = contest.approvalStatus === 'PENDING';
        
        return (
          <div className="flex items-center gap-2">
            {/* Approve/Reject buttons for superadmin on pending contests */}
            {isSuperAdmin && isPending && (
              <>
                <button
                  onClick={() => handleApproveContest(contest)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Approve Contest"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRejectContest(contest)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Reject Contest"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            
            <button
              onClick={() => handleViewQR(contest)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleView(contest)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(contest)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleActive(contest)}
              disabled={contest.status === ContestStatus.COMPLETED}
              className={`p-2 rounded-lg transition-colors ${
                contest.status === ContestStatus.COMPLETED
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : contest.isActive 
                    ? 'text-green-600 hover:bg-green-50' 
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={
                contest.status === ContestStatus.COMPLETED 
                  ? 'Cannot toggle completed contest' 
                  : contest.isActive 
                    ? 'Disable Contest' 
                    : 'Enable Contest'
              }
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleViewQR = (contest: Contest) => {
    setSelectedContest(contest);
    setShowQRModal(true);
  };

  const handleView = (contest: Contest) => {
    setSelectedContest(contest);
    setShowDetailsModal(true);
  };

  const handleEdit = (contest: Contest) => {
    setEditingContest(contest);
    setShowCreateModal(true);
  };

  const confirmDelete = async () => {
    if (contestToDelete) {
      await handleDeleteContest(contestToDelete.id);
    }
  };

  const handleApproveContest = async (contest: Contest) => {
    try {
      // Update directly in Supabase with snake_case fields
      const { error } = await supabase
        .from('contests')
        .update({
          approval_status: 'APPROVED',
          reviewed_by: Number(user?.id),
          reviewed_at: new Date().toISOString(),
        })
        .eq('contest_id', parseInt(contest.id));
      
      if (error) throw error;
      
      toast.success(`Contest "${contest.name}" approved!`);
      await loadContests();
    } catch (error) {
      console.error('Error approving contest:', error);
      toast.error('Failed to approve contest');
    }
  };

  const handleRejectContest = async (contest: Contest) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      // Update directly in Supabase with snake_case fields
      const { error } = await supabase
        .from('contests')
        .update({
          approval_status: 'REJECTED',
          reviewed_by: Number(user?.id),
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('contest_id', parseInt(contest.id));
      
      if (error) throw error;
      
      toast.success(`Contest "${contest.name}" rejected`);
      await loadContests();
    } catch (error) {
      console.error('Error rejecting contest:', error);
      toast.error('Failed to reject contest');
    }
  };

  const handleSaveContest = async (contestData: any) => {
    if (editingContest) {
      await handleUpdateContest(contestData);
    } else {
      await handleCreateContest(contestData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contest Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage your lucky draw contests</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => {
            setEditingContest(null);
            setShowCreateModal(true);
          }}
          className="w-full sm:w-auto"
        >
          Create Contest
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading contests...</div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="ALL">All Status</option>
              <option value={ContestStatus.DRAFT}>Draft</option>
              <option value={ContestStatus.UPCOMING}>Upcoming</option>
              <option value={ContestStatus.ONGOING}>Ongoing</option>
              <option value={ContestStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contests Table */}
      <Card>
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table data={filteredContests} columns={columns} emptyMessage="No contests found" />
          </div>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingContest(null);
        }}
        title={editingContest ? 'Edit Contest' : 'Create New Contest'}
        size="xl"
      >
        <ContestForm
          contest={editingContest}
          onSave={handleSaveContest}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingContest(null);
          }}
        />
      </Modal>

      {/* QR Code Modal */}
      {selectedContest && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedContest(null);
          }}
          contest={selectedContest}
        />
      )}

      {/* Contest Details Modal */}
      {selectedContest && (
        <ContestDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedContest(null);
          }}
          contest={selectedContest}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && contestToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Are you sure you want to delete the contest <strong>"{contestToDelete.name}"</strong>?
                      </p>
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium">
                          ⚠️ This action cannot be undone.
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          All associated data including participants, prizes, and results will be permanently deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={confirmDelete}
                  >
                    Delete Contest
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
