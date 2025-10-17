import { useState, useEffect } from 'react';
import { Database, Link, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useFlowBuilderDatabase } from '../../../hooks/useFlowBuilderDatabase';
import { SupabaseService } from '../../../lib/supabase-db';

interface FlowDatabaseIntegrationProps {
  flowId: string;
  flowName: string;
  flowSchema: any;
  onIntegrationComplete?: (formId: number, contestId?: number) => void;
}

export default function FlowDatabaseIntegration({
  flowId,
  flowName,
  flowSchema,
  onIntegrationComplete,
}: FlowDatabaseIntegrationProps) {
  const {
    createFlow,
    linkFormToContest,
    getFormByFlowId,
    isLoading,
    error,
  } = useFlowBuilderDatabase();

  const [contests, setContests] = useState<any[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<number | null>(
    null
  );
  const [existingForm, setExistingForm] = useState<any | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<
    'idle' | 'checking' | 'creating' | 'linking' | 'complete' | 'error'
  >('idle');

  // Load contests on mount
  useEffect(() => {
    loadContests();
    checkExistingForm();
  }, [flowId]);

  const loadContests = async () => {
    try {
      const allContests = await SupabaseService.getAllContests();
      setContests(allContests);
    } catch (err) {
      console.error('Failed to load contests:', err);
    }
  };

  const checkExistingForm = async () => {
    setIntegrationStatus('checking');
    try {
      const form = await getFormByFlowId(flowId);
      setExistingForm(form);
      if (form) {
        setIntegrationStatus('complete');
        if (form.form_schema?.contest_id) {
          setSelectedContestId(form.form_schema.contest_id);
        }
      } else {
        setIntegrationStatus('idle');
      }
    } catch (err) {
      console.error('Failed to check existing form:', err);
      setIntegrationStatus('idle');
    }
  };

  const handleCreateFlow = async () => {
    if (!flowName || !flowId) {
      alert('Flow name and ID are required');
      return;
    }

    setIntegrationStatus('creating');

    try {
      const result = await createFlow(
        flowName,
        flowSchema,
        flowId,
        selectedContestId || undefined
      );

      setIntegrationStatus('complete');
      setExistingForm({
        form_id: result.formId,
        form_name: flowName,
        flow_id: flowId,
        form_schema: flowSchema,
      });

      if (onIntegrationComplete) {
        onIntegrationComplete(result.formId, result.contestId);
      }
    } catch (err) {
      setIntegrationStatus('error');
      console.error('Failed to create flow:', err);
    }
  };

  const handleLinkToContest = async () => {
    if (!existingForm || !selectedContestId) {
      alert('Please select a contest');
      return;
    }

    setIntegrationStatus('linking');

    try {
      await linkFormToContest(existingForm.form_id, selectedContestId);
      setIntegrationStatus('complete');
      checkExistingForm(); // Refresh
    } catch (err) {
      setIntegrationStatus('error');
      console.error('Failed to link to contest:', err);
    }
  };

  const getStatusIcon = () => {
    switch (integrationStatus) {
      case 'checking':
      case 'creating':
      case 'linking':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (integrationStatus) {
      case 'checking':
        return 'Checking database...';
      case 'creating':
        return 'Creating form in database...';
      case 'linking':
        return 'Linking to contest...';
      case 'complete':
        return existingForm
          ? `Connected (Form ID: ${existingForm.form_id})`
          : 'Ready to connect';
      case 'error':
        return 'Connection failed';
      default:
        return 'Not connected';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Database Integration
            </h3>
            <p className="text-sm text-slate-400">{getStatusText()}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      {existingForm ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm font-medium text-green-400">
                Flow Connected to Database
              </p>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400">Form ID:</span>{' '}
                {existingForm.form_id}
              </p>
              <p>
                <span className="text-slate-400">Form Name:</span>{' '}
                {existingForm.form_name}
              </p>
              <p>
                <span className="text-slate-400">Flow ID:</span>{' '}
                {existingForm.flow_id || flowId}
              </p>
              {existingForm.form_schema?.contest_id && (
                <p>
                  <span className="text-slate-400">Contest ID:</span>{' '}
                  {existingForm.form_schema.contest_id}
                </p>
              )}
            </div>
          </div>

          {!existingForm.form_schema?.contest_id && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Link to Contest (Optional)
              </label>
              <select
                value={selectedContestId || ''}
                onChange={(e) =>
                  setSelectedContestId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select a contest...</option>
                {contests.map((contest) => (
                  <option key={contest.contest_id} value={contest.contest_id}>
                    {contest.name} ({contest.status})
                  </option>
                ))}
              </select>

              <button
                onClick={handleLinkToContest}
                disabled={!selectedContestId || isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Link className="w-4 h-4" />
                Link to Contest
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400 mb-2">
              Connect this flow to the database to:
            </p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Store flow responses in form_responses table</li>
              <li>Link responses to participants</li>
              <li>Associate with contests</li>
              <li>Track form submissions</li>
            </ul>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              Link to Contest (Optional)
            </label>
            <select
              value={selectedContestId || ''}
              onChange={(e) =>
                setSelectedContestId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">No contest (standalone form)</option>
              {contests.map((contest) => (
                <option key={contest.contest_id} value={contest.contest_id}>
                  {contest.name} ({contest.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateFlow}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            {isLoading ? 'Connecting...' : 'Connect to Database'}
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          <strong>Note:</strong> Flow responses will automatically create
          participants when linked to a contest.
        </p>
      </div>
    </div>
  );
}
