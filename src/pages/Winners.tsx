import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Send, CheckCircle, Package, Truck, AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { formatDate, downloadCSV } from '../utils/helpers';
import toast from 'react-hot-toast';
import { WinnerService, Winner } from '../services/winnerService';

type PrizeStatus = 'PENDING' | 'CLAIMED' | 'SHIPPED';

export const Winners: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PrizeStatus | 'ALL'>('ALL');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [newStatus, setNewStatus] = useState<PrizeStatus | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, claimed: 0, shipped: 0 });

  // Load winners from database
  useEffect(() => {
    loadWinners();
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const data = await WinnerService.getAllWinners();
      setWinners(data);
      
      // Load stats
      const statsData = await WinnerService.getWinnerStats();
      setStats({
        total: statsData.total,
        pending: statsData.pending,
        claimed: statsData.claimed,
        shipped: statsData.shipped
      });
    } catch (error) {
      console.error('Error loading winners:', error);
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const filteredWinners = winners.filter((winner) => {
    const matchesSearch =
      winner.participant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.participant?.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.prize?.prize_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || winner.prize_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PrizeStatus) => {
    const variants: Record<PrizeStatus, { variant: 'success' | 'warning' | 'info' | 'default' | 'danger'; icon: React.ReactNode }> = {
      PENDING: { variant: 'warning', icon: <CheckCircle className="w-3 h-3" /> },
      CLAIMED: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      SHIPPED: { variant: 'success', icon: <Truck className="w-3 h-3" /> },
    };
    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant}>
        <span className="flex items-center gap-1">
          {icon}
          {status}
        </span>
      </Badge>
    );
  };

  const columns = [
    {
      key: 'participant',
      header: 'Winner',
      render: (winner: Winner) => (
        <div>
          <p className="font-medium text-gray-900">{winner.participant?.name || 'N/A'}</p>
          <p className="text-sm text-gray-500">{winner.participant?.contact || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'prize',
      header: 'Prize',
      render: (winner: Winner) => (
        <div>
          <p className="font-medium text-gray-900">{winner.prize?.prize_name || 'N/A'}</p>
          <p className="text-sm text-gray-500">
            {winner.prize?.value ? `₹${winner.prize.value.toLocaleString()}` : 'N/A'}
          </p>
        </div>
      ),
    },
    {
      key: 'wonAt',
      header: 'Won Date',
      render: (winner: Winner) => formatDate(winner.draw?.executed_at || new Date().toISOString(), 'MMM dd, yyyy'),
    },
    {
      key: 'status',
      header: 'Prize Status',
      render: (winner: Winner) => getStatusBadge(winner.prize_status),
    },
    {
      key: 'notification',
      header: 'Notification',
      render: (winner: Winner) => (
        <Badge variant={winner.notified ? 'success' : 'warning'} size="sm">
          {winner.notified ? 'Sent' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (winner: Winner) => (
        <div className="flex items-center gap-2">
          {/* Send Notification Button */}
          {!winner.notified && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSendNotification(winner.winner_id)}
              icon={<Send className="w-4 h-4" />}
            >
              Notify
            </Button>
          )}
          
          {/* Status Toggle Button */}
          {(winner.prize_status === 'PENDING' || winner.prize_status === 'CLAIMED') && (
            <Button
              size="sm"
              variant={winner.prize_status === 'PENDING' ? 'secondary' : 'success'}
              onClick={() => handleStatusToggle(winner, winner.prize_status === 'PENDING' ? 'CLAIMED' : 'PENDING')}
              className={winner.prize_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300' : ''}
            >
              {winner.prize_status === 'PENDING' ? 'Pending' : 'Claimed'}
            </Button>
          )}
          
          {/* Ship Button */}
          {winner.prize_status === 'CLAIMED' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusToggle(winner, 'SHIPPED')}
              icon={<Truck className="w-4 h-4" />}
            >
              Ship
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleSendNotification = async (winnerId: number) => {
    try {
      await WinnerService.markAsNotified(winnerId);
      toast.success('Notification sent successfully!');
      loadWinners();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleStatusToggle = (winner: Winner, status: PrizeStatus) => {
    setSelectedWinner(winner);
    setNewStatus(status);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedWinner || !newStatus) return;

    try {
      await WinnerService.updatePrizeStatus(selectedWinner.winner_id, newStatus);
      toast.success(`Status updated to ${newStatus.toLowerCase()}!`);
      loadWinners();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setShowConfirmModal(false);
      setSelectedWinner(null);
      setNewStatus(null);
    }
  };

  const handleExportReport = () => {
    const exportData = filteredWinners.map((w) => ({
      Winner: w.participant?.name || 'N/A',
      Contact: w.participant?.contact || 'N/A',
      Prize: w.prize?.prize_name || 'N/A',
      'Prize Value': w.prize?.value ? `₹${w.prize.value}` : 'N/A',
      'Won Date': formatDate(w.draw?.executed_at || new Date().toISOString(), 'yyyy-MM-dd'),
      Status: w.prize_status,
      'Notification Sent': w.notified ? 'Yes' : 'No',
      'Notified At': w.notified_at ? formatDate(w.notified_at, 'yyyy-MM-dd') : 'N/A',
    }));
    downloadCSV(exportData, `winners-report-${Date.now()}`);
    toast.success('Report exported successfully!');
  };

  const handleBulkNotify = async () => {
    try {
      const pendingWinners = winners.filter((w) => !w.notified);
      const winnerIds = pendingWinners.map(w => w.winner_id);
      
      if (winnerIds.length === 0) {
        toast('No pending notifications', { icon: 'ℹ️' });
        return;
      }
      
      await WinnerService.bulkMarkAsNotified(winnerIds);
      toast.success(`Sent notifications to ${winnerIds.length} winners!`);
      loadWinners();
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      toast.error('Failed to send notifications');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Winner Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage winners and prize distribution</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            icon={<Send className="w-5 h-5" />}
            onClick={handleBulkNotify}
            className="w-full sm:w-auto"
          >
            Notify All
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-5 h-5" />}
            onClick={handleExportReport}
            className="w-full sm:w-auto"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Winners</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.claimed}</p>
            <p className="text-sm text-gray-600 mt-1">Claimed</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.shipped}</p>
            <p className="text-sm text-gray-600 mt-1">Shipped</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search winners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PrizeStatus | 'ALL')}
              className="input-field"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CLAIMED">Claimed</option>
              <option value="SHIPPED">Shipped</option>
            </select>
          </div>
        </div>
        {loading && (
          <div className="mt-4 flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading winners...</span>
          </div>
        )}
      </Card>

      {/* Winners Table */}
      <Card>
        <Table data={filteredWinners} columns={columns} emptyMessage="No winners found" />
      </Card>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedWinner && newStatus && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowConfirmModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Confirm Status Change</h2>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Are you sure you want to change the status for <strong>{selectedWinner.participant?.name}</strong> from{' '}
                        <span className={`font-semibold ${
                          selectedWinner.prize_status === 'PENDING' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {selectedWinner.prize_status}
                        </span>{' '}
                        to{' '}
                        <span className={`font-semibold ${
                          newStatus === 'PENDING' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {newStatus}
                        </span>?
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Prize:</strong> {selectedWinner.prize?.prize_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Value:</strong> {selectedWinner.prize?.value ? `₹${selectedWinner.prize.value.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={confirmStatusChange}
                  >
                    Confirm Change
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
