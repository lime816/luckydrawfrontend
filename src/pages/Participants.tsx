import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Upload, UserX, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { formatDate, downloadCSV } from '../utils/helpers';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { ParticipantService, Participant } from '../services/participantService';

export const Participants: React.FC = () => {
  const location = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0, contests: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterValid, setFilterValid] = useState<'ALL' | 'VALID' | 'INVALID'>('ALL');
  const [selectedContest, setSelectedContest] = useState<number | 'ALL'>('ALL');
  const [highlightedParticipantId, setHighlightedParticipantId] = useState<number | null>(null);
  const [contests, setContests] = useState<Array<{ contest_id: number; name: string }>>([]);

  // Load participants from database
  useEffect(() => {
    loadParticipants();
    loadContests();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const data = await ParticipantService.getAllParticipants();
      setParticipants(data);
      
      // Load stats
      const statsData = await ParticipantService.getParticipantStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const loadContests = async () => {
    try {
      const { supabase } = await import('../lib/supabase-db');
      const { data } = await supabase
        .from('contests')
        .select('contest_id, name')
        .order('created_at', { ascending: false });
      
      if (data) setContests(data);
    } catch (error) {
      console.error('Error loading contests:', error);
    }
  };

  // Handle search navigation - highlight searched participant
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchedParticipantId && participants.length > 0) {
      const participantId = state.searchedParticipantId.toString();
      setHighlightedParticipantId(participantId);
      
      // Scroll to the participant after a short delay
      setTimeout(() => {
        const element = document.getElementById(`participant-${participantId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedParticipantId(null);
      }, 3000);
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, participants]);

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesValid =
      filterValid === 'ALL' ||
      (filterValid === 'VALID' && participant.validated) ||
      (filterValid === 'INVALID' && !participant.validated);
    const matchesContest = selectedContest === 'ALL' || participant.contest_id === selectedContest;
    return matchesSearch && matchesValid && matchesContest;
  });

  const columns = [
    {
      key: 'name',
      header: 'Participant',
      render: (participant: Participant) => (
        <div>
          <p className="font-medium text-gray-900">{participant.name}</p>
          <p className="text-sm text-gray-500">{participant.contact}</p>
        </div>
      ),
    },
    {
      key: 'contest',
      header: 'Contest',
      render: (participant: Participant) => (
        <span className="text-sm text-gray-700">
          {participant.contest?.name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'entry_timestamp',
      header: 'Entry Date',
      render: (participant: Participant) => formatDate(participant.entry_timestamp, 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (participant: Participant) => (
        <div className="flex items-center gap-2">
          {participant.validated ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Valid</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">Invalid</span>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleExportCSV = () => {
    const exportData = filteredParticipants.map((p) => ({
      Name: p.name,
      Contact: p.contact,
      Contest: p.contest?.name || 'N/A',
      'Entry Date': formatDate(p.entry_timestamp, 'yyyy-MM-dd HH:mm:ss'),
      Valid: p.validated ? 'Yes' : 'No',
    }));
    downloadCSV(exportData, `participants-${Date.now()}`);
    toast.success('Participants exported successfully!');
  };

  const handleExportExcel = () => {
    const exportData = filteredParticipants.map((p) => ({
      Name: p.name,
      Contact: p.contact,
      Contest: p.contest?.name || 'N/A',
      'Entry Date': formatDate(p.entry_timestamp, 'yyyy-MM-dd HH:mm:ss'),
      Valid: p.validated ? 'Yes' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    XLSX.writeFile(wb, `participants-${Date.now()}.xlsx`);
    toast.success('Participants exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process imported data
        console.log('Imported data:', jsonData);
        toast.success(`Imported ${jsonData.length} participants successfully!`);
      } catch (error) {
        toast.error('Failed to import file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleToggleValidation = async (participantId: number, validated: boolean) => {
    try {
      await ParticipantService.validateParticipant(participantId, validated);
      toast.success(`Participant ${validated ? 'validated' : 'invalidated'} successfully`);
      loadParticipants();
    } catch (error) {
      console.error('Error updating validation:', error);
      toast.error('Failed to update participant');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Participant Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and validate contest participants</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <label htmlFor="import-file" className="cursor-pointer w-full sm:w-auto">
            <input
              id="import-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 text-base w-full sm:w-auto">
              <Upload className="w-5 h-5 mr-2" />
              Import
            </span>
          </label>
          <Button
            variant="primary"
            icon={<Download className="w-5 h-5" />}
            onClick={handleExportExcel}
            className="w-full sm:w-auto"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Participants</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.valid}</p>
            <p className="text-sm text-gray-600 mt-1">Valid Entries</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.invalid}</p>
            <p className="text-sm text-gray-600 mt-1">Invalid Entries</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.contests}</p>
            <p className="text-sm text-gray-600 mt-1">Contests</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterValid}
              onChange={(e) => setFilterValid(e.target.value as 'ALL' | 'VALID' | 'INVALID')}
              className="input-field"
            >
              <option value="ALL">All Status</option>
              <option value="VALID">Valid Only</option>
              <option value="INVALID">Invalid Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedContest}
              onChange={(e) => setSelectedContest(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="input-field"
            >
              <option value="ALL">All Contests</option>
              {contests.map((contest) => (
                <option key={contest.contest_id} value={contest.contest_id}>
                  {contest.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading && (
          <div className="mt-4 flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading participants...</span>
          </div>
        )}
      </Card>

      {/* Participants Table */}
      <Card>
        <Table
          data={filteredParticipants}
          columns={columns}
          emptyMessage="No participants found"
        />
      </Card>
    </div>
  );
};
