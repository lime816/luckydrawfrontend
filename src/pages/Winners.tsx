import React, { useState } from 'react';
import { Search, Filter, Download, Send, CheckCircle, Package, Truck, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { Winner, PrizeStatus } from '../types';
import { formatDate, downloadCSV } from '../utils/helpers';
import toast from 'react-hot-toast';

export const Winners: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([
    {
      id: '1',
      participantId: '1',
      participant: {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '+91 98765 43210',
        contestId: '1',
        entryDate: '2025-09-20T10:30:00Z',
        entryMethod: 'QR' as any,
        isDuplicate: false,
        isValid: true,
      },
      contestId: '1',
      contest: {} as any,
      prize: {
        id: '1',
        name: 'iPhone 15 Pro',
        value: 120000,
        quantity: 1,
      },
      wonAt: '2025-09-25T15:30:00Z',
      prizeStatus: PrizeStatus.PENDING,
      notificationSent: false,
    },
    {
      id: '2',
      participantId: '2',
      participant: {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+91 98765 43211',
        contestId: '1',
        entryDate: '2025-09-21T14:20:00Z',
        entryMethod: 'WHATSAPP' as any,
        isDuplicate: false,
        isValid: true,
      },
      contestId: '1',
      contest: {} as any,
      prize: {
        id: '2',
        name: 'AirPods Pro',
        value: 25000,
        quantity: 1,
      },
      wonAt: '2025-09-25T15:30:00Z',
      prizeStatus: PrizeStatus.CLAIMED,
      notificationSent: true,
      claimedAt: '2025-09-26T10:00:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PrizeStatus | 'ALL'>('ALL');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [newStatus, setNewStatus] = useState<PrizeStatus | null>(null);

  const filteredWinners = winners.filter((winner) => {
    const matchesSearch =
      winner.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.prize.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || winner.prizeStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PrizeStatus) => {
    const variants: Record<PrizeStatus, { variant: 'success' | 'warning' | 'info' | 'default' | 'danger'; icon: React.ReactNode }> = {
      [PrizeStatus.PENDING]: { variant: 'warning', icon: <CheckCircle className="w-3 h-3" /> },
      [PrizeStatus.NOTIFIED]: { variant: 'info', icon: <Send className="w-3 h-3" /> },
      [PrizeStatus.CLAIMED]: { variant: 'default', icon: <CheckCircle className="w-3 h-3" /> },
      [PrizeStatus.DISPATCHED]: { variant: 'info', icon: <Package className="w-3 h-3" /> },
      [PrizeStatus.DELIVERED]: { variant: 'success', icon: <Truck className="w-3 h-3" /> },
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
          <p className="font-medium text-gray-900">{winner.participant.name}</p>
          <p className="text-sm text-gray-500">{winner.participant.email}</p>
          <p className="text-sm text-gray-500">{winner.participant.phone}</p>
        </div>
      ),
    },
    {
      key: 'prize',
      header: 'Prize',
      render: (winner: Winner) => (
        <div>
          <p className="font-medium text-gray-900">{winner.prize.name}</p>
          <p className="text-sm text-gray-500">₹{winner.prize.value.toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'wonAt',
      header: 'Won Date',
      render: (winner: Winner) => formatDate(winner.wonAt, 'MMM dd, yyyy'),
    },
    {
      key: 'status',
      header: 'Prize Status',
      render: (winner: Winner) => getStatusBadge(winner.prizeStatus),
    },
    ///{
     /* key: 'notification',
      header: 'Notification',
      render: (winner: Winner) => (
        <Badge variant={winner.notificationSent ? 'success' : 'warning'} size="sm">
    /     {winner.notificationSent ? 'Sent' : 'Pending'}*/
    ///    </Badge>
    ///  ),
    ///},
    {
      key: 'actions',
      header: 'Actions',
      render: (winner: Winner) => (
        <div className="flex items-center gap-2">
          {/* Status Toggle Button */}
          {(winner.prizeStatus === PrizeStatus.PENDING || winner.prizeStatus === PrizeStatus.CLAIMED) && (
            <Button
              size="sm"
              variant={winner.prizeStatus === PrizeStatus.PENDING ? 'secondary' : 'success'}
              onClick={() => handleStatusToggle(winner, winner.prizeStatus === PrizeStatus.PENDING ? PrizeStatus.CLAIMED : PrizeStatus.PENDING)}
              className={winner.prizeStatus === PrizeStatus.PENDING ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300' : ''}
            >
              {winner.prizeStatus === PrizeStatus.PENDING ? 'Pending' : 'Claimed'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleSendNotification = (winnerId: string) => {
    setWinners(
      winners.map((w) =>
        w.id === winnerId ? { ...w, notificationSent: true, prizeStatus: PrizeStatus.NOTIFIED } : w
      )
    );
    toast.success('Notification sent successfully!');
  };

  const handleStatusToggle = (winner: Winner, status: PrizeStatus) => {
    setSelectedWinner(winner);
    setNewStatus(status);
    setShowConfirmModal(true);
  };

  const confirmStatusChange = () => {
    if (!selectedWinner || !newStatus) return;

    setWinners(
      winners.map((w) =>
        w.id === selectedWinner.id
          ? {
              ...w,
              prizeStatus: newStatus,
              claimedAt: newStatus === PrizeStatus.CLAIMED ? new Date().toISOString() : w.claimedAt,
            }
          : w
      )
    );
    
    toast.success(`Status updated to ${newStatus.toLowerCase()}!`);
    setShowConfirmModal(false);
    setSelectedWinner(null);
    setNewStatus(null);
  };

  const handleUpdateStatus = (winnerId: string, status: PrizeStatus) => {
    setWinners(
      winners.map((w) =>
        w.id === winnerId
          ? {
              ...w,
              prizeStatus: status,
              dispatchedAt: status === PrizeStatus.DISPATCHED ? new Date().toISOString() : w.dispatchedAt,
            }
          : w
      )
    );
    toast.success('Prize status updated!');
  };

  const handleExportReport = () => {
    const exportData = filteredWinners.map((w) => ({
      Winner: w.participant.name,
      Email: w.participant.email,
      Phone: w.participant.phone,
      Prize: w.prize.name,
      'Prize Value': `₹${w.prize.value}`,
      'Won Date': formatDate(w.wonAt, 'yyyy-MM-dd'),
      Status: w.prizeStatus,
      'Notification Sent': w.notificationSent ? 'Yes' : 'No',
      'Dispatched Date': w.dispatchedAt ? formatDate(w.dispatchedAt, 'yyyy-MM-dd') : 'N/A',
    }));
    downloadCSV(exportData, `winners-report-${Date.now()}`);
    toast.success('Report exported successfully!');
  };

  const handleBulkNotify = () => {
    const pendingNotifications = winners.filter((w) => !w.notificationSent);
    setWinners(
      winners.map((w) =>
        !w.notificationSent ? { ...w, notificationSent: true, prizeStatus: PrizeStatus.NOTIFIED } : w
      )
    );
    toast.success(`Sent notifications to ${pendingNotifications.length} winners!`);
  };

  const stats = {
    total: winners.length,
    pending: winners.filter((w) => w.prizeStatus === PrizeStatus.PENDING).length,
    claimed: winners.filter((w) => w.prizeStatus === PrizeStatus.CLAIMED).length,
    delivered: winners.filter((w) => w.prizeStatus === PrizeStatus.DELIVERED).length,
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
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-600 mt-1">Delivered</p>
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
              <option value={PrizeStatus.PENDING}>Pending</option>
              <option value={PrizeStatus.NOTIFIED}>Notified</option>
              <option value={PrizeStatus.CLAIMED}>Claimed</option>
              <option value={PrizeStatus.DISPATCHED}>Dispatched</option>
              <option value={PrizeStatus.DELIVERED}>Delivered</option>
            </select>
          </div>
        </div>
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
                        Are you sure you want to change the status for <strong>{selectedWinner.participant.name}</strong> from{' '}
                        <span className={`font-semibold ${
                          selectedWinner.prizeStatus === PrizeStatus.PENDING ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {selectedWinner.prizeStatus}
                        </span>{' '}
                        to{' '}
                        <span className={`font-semibold ${
                          newStatus === PrizeStatus.PENDING ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {newStatus}
                        </span>?
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Prize:</strong> {selectedWinner.prize.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Value:</strong> ₹{selectedWinner.prize.value.toLocaleString()}
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
