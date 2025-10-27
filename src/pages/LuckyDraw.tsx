import React, { useState, useEffect } from 'react';
import { Sparkles, Play, RotateCcw, Users, Award, AlertTriangle, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { secureRandomSelection } from '../utils/helpers';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { DatabaseService } from '../services/database';
import type { Contest, Prize, Participant } from '../services/database';

interface DrawParticipant {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ContestWithStats extends Contest {
  participantCount: number;
}

export const LuckyDraw: React.FC = () => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [contests, setContests] = useState<ContestWithStats[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [remainingPrizeSlots, setRemainingPrizeSlots] = useState<number>(0);
  const [prizeRemainingMap, setPrizeRemainingMap] = useState<Record<number, number>>({});
  const [selectedContest, setSelectedContest] = useState('');
  const [selectedPrize, setSelectedPrize] = useState('');
  const [winnersCount, setWinnersCount] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState<DrawParticipant[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingResults, setSavingResults] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load contests on mount
  useEffect(() => {
    loadContests();
  }, []);

  // Load prizes when contest is selected
  useEffect(() => {
    if (selectedContest) {
      loadPrizesAndParticipants(parseInt(selectedContest));
    } else {
      setPrizes([]);
      setParticipants([]);
    }
  }, [selectedContest]);

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const contestData = await DatabaseService.getAllContests();
      
      // Load participant counts for each contest
      const contestsWithStats = await Promise.all(
        contestData.map(async (contest) => {
          const participants = await DatabaseService.getParticipantsByContest(contest.contest_id);
          return {
            ...contest,
            participantCount: participants.length,
          };
        })
      );
      
      setContests(contestsWithStats);
    } catch (error) {
      console.error('Error loading contests:', error);
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const loadPrizesAndParticipants = async (contestId: number) => {
    try {
      const [prizeData, participantData] = await Promise.all([
        DatabaseService.getPrizesByContest(contestId),
        DatabaseService.getValidatedParticipants(contestId),
      ]);
      
      setPrizes(prizeData);
      setParticipants(participantData);
      // Compute remaining prize slots and per-prize remaining quantities
      try {
        const allWinners = await DatabaseService.getWinnersByContest(contestId);
        const totalSlots = (prizeData || []).reduce((s, p) => s + (p.quantity || 0), 0);
        const existingWinnersCount = (allWinners || []).length;
        const remainingSlots = Math.max(0, totalSlots - existingWinnersCount);
        setRemainingPrizeSlots(remainingSlots);

        const allocatedByPrize: Record<number, number> = {};
        (allWinners || []).forEach((w: any) => {
          if (w.prize_id) allocatedByPrize[w.prize_id] = (allocatedByPrize[w.prize_id] || 0) + 1;
        });
        const map: Record<number, number> = {};
        (prizeData || []).forEach(p => {
          const allocated = allocatedByPrize[p.prize_id] || 0;
          map[p.prize_id] = Math.max(0, (p.quantity || 0) - allocated);
        });
        setPrizeRemainingMap(map);
        // Clamp winnersCount if it exceeds available slots
        if (selectedPrize) {
          const sel = parseInt(selectedPrize);
          const rem = map[sel] ?? 0;
          if (winnersCount > rem) setWinnersCount(Math.max(1, rem));
        } else if (winnersCount > remainingSlots) {
          setWinnersCount(Math.max(1, remainingSlots));
        }
      } catch (e) {
        console.warn('Could not compute prize remaining slots:', e);
      }
    } catch (error) {
      console.error('Error loading prizes and participants:', error);
      toast.error('Failed to load contest data');
    }
  };

  const handleDrawClick = () => {
    if (!selectedContest) {
      toast.error('Please select a contest');
      return;
    }

    if (!selectedPrize) {
      toast.error('Please select a prize');
      return;
    }

    if (participants.length === 0) {
      toast.error('No validated participants found for this contest');
      return;
    }

    if (winnersCount > participants.length) {
      toast.error('Number of winners cannot exceed number of participants');
      return;
    }

    // Prevent starting a draw if there are no remaining prize slots
    if (remainingPrizeSlots <= 0) {
      toast.error('No prize slots remaining for this contest');
      return;
    }

    // If a specific prize is selected, ensure that prize still has remaining quantity
    if (selectedPrize) {
      const pid = parseInt(selectedPrize);
      const rem = prizeRemainingMap[pid] ?? 0;
      if (rem <= 0) {
        toast.error('Selected prize has no remaining units');
        return;
      }
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleDraw = async () => {
    // Close the confirmation modal
    setShowConfirmModal(false);

    // Start animation
    setIsDrawing(true);
    setShowAnimation(true);
    setWinners([]);
    setShowConfetti(false);

    try {
      // Simulate drawing animation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Execute and persist the draw server-side
      const prizeIds = selectedPrize ? [parseInt(selectedPrize)] : undefined;
      setSavingResults(true);
      const result = await DatabaseService.executeRandomDraw(
        parseInt(selectedContest),
        1, // TODO: replace with real admin id from auth context
        winnersCount,
        prizeIds
      );

      // Fetch persisted winners (joined with participant info) and show only winners for this draw
      const allWinners = await DatabaseService.getWinnersByContest(parseInt(selectedContest));
      const drawWinners = allWinners.filter(w => w.draw_id === result.draw.draw_id);

      const mapped: DrawParticipant[] = drawWinners.map(w => {
        const participant = (w as any).participants || null;
        const contact = participant?.contact || '';
        const winnerName = (w as any).winner_name || participant?.name || '';
        return {
          id: w.participant_id.toString(),
          name: winnerName,
          email: contact.includes('@') ? contact : 'N/A',
          phone: contact && !contact.includes('@') ? contact : 'N/A',
        };
      });

      setWinners(mapped);
      toast.success(`${mapped.length} winner(s) selected!`);
      setShowConfetti(true);

      // Stop confetti after 10 seconds
      setTimeout(() => setShowConfetti(false), 10000);
    } catch (error) {
      console.error('Error executing draw:', error);
      toast.error('Failed to execute draw');
    } finally {
      setSavingResults(false);
      setIsDrawing(false);
      setShowAnimation(false);
    }
  };

  const handleReDraw = () => {
    setWinners([]);
    setShowAnimation(false);
    setShowConfetti(false);
  };

  const handleSaveResults = async () => {
    if (!selectedContest || winners.length === 0) return;
    try {
      setSavingResults(true);

      const prizeIds = selectedPrize ? [parseInt(selectedPrize)] : undefined;

      // Execute the draw server-side and persist winners
      const result = await DatabaseService.executeRandomDraw(
        parseInt(selectedContest),
        1, // TODO: Get actual admin ID from auth context
        winners.length,
        prizeIds
      );

      // Fetch persisted winners for this contest and draw to show authoritative data
      const allWinners = await DatabaseService.getWinnersByContest(parseInt(selectedContest));
      const drawWinners = allWinners.filter(w => w.draw_id === result.draw.draw_id);

      // Map to local DrawParticipant shape
      const mapped = drawWinners.map(w => {
        const participant = (w as any).participants || null;
        const contact = participant?.contact || '';
        const winnerName = (w as any).winner_name || participant?.name || '';
        return {
          id: w.participant_id.toString(),
          name: winnerName,
          email: contact.includes('@') ? contact : 'N/A',
          phone: contact && !contact.includes('@') ? contact : 'N/A',
        } as DrawParticipant;
      });

      setWinners(mapped);

      toast.success('Draw results saved successfully!');

      // Reset UI selections (keep winners displayed)
      setShowAnimation(false);
      setShowConfetti(true);
      setSelectedPrize('');
    } catch (error) {
      console.error('Error saving draw results:', error);
      toast.error('Failed to save draw results');
    } finally {
      setSavingResults(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={500}
          gravity={0.15}
          colors={['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32', '#FF1493']}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lucky Draw Execution</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Execute random draws and select winners</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draw Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Draw Configuration">
            <div className="space-y-4">
              {/* Contest Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Contest
                </label>
                <select
                  value={selectedContest}
                  onChange={(e) => setSelectedContest(e.target.value)}
                  className="input-field"
                  disabled={isDrawing}
                >
                  <option value="">Choose a contest...</option>
                  {contests.map((contest) => (
                    <option key={contest.contest_id} value={contest.contest_id}>
                      {contest.name} ({contest.participantCount} participants)
                    </option>
                  ))}
                </select>
              </div>

              {/* Prize Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Prize
                </label>
                <select
                  value={selectedPrize}
                  onChange={(e) => {
                    setSelectedPrize(e.target.value);
                    const pid = parseInt(e.target.value || '0');
                    if (pid && prizeRemainingMap[pid] !== undefined) {
                      const rem = prizeRemainingMap[pid];
                      if (winnersCount > rem) setWinnersCount(Math.max(1, rem));
                    }
                  }}
                  className="input-field"
                  disabled={isDrawing}
                >
                  <option value="">Choose a prize...</option>
                  {prizes.map((prize) => (
                    <option key={prize.prize_id} value={prize.prize_id}>
                      {prize.prize_name} (Available: {prizeRemainingMap[prize.prize_id] ?? prize.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Winners */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Winners
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedPrize ? (prizeRemainingMap[parseInt(selectedPrize)] ?? remainingPrizeSlots) : (remainingPrizeSlots || 10)}
                  value={winnersCount}
                  onChange={(e) => setWinnersCount(parseInt(e.target.value) || 1)}
                  className="input-field"
                  disabled={isDrawing}
                />
                <p className="text-xs text-gray-500 mt-1">Remaining prize slots: {remainingPrizeSlots}</p>
              </div>

              {/* Draw Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Draw Type
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="drawType"
                      value="manual"
                      defaultChecked
                      className="w-4 h-4 text-primary-600"
                      disabled={isDrawing}
                    />
                    <span className="text-sm text-gray-700">Manual Draw</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="drawType"
                      value="live"
                      className="w-4 h-4 text-primary-600"
                      disabled={isDrawing}
                    />
                    <span className="text-sm text-gray-700">Live Draw</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  icon={<Play className="w-5 h-5" />}
                  onClick={handleDrawClick}
                  loading={isDrawing}
                  disabled={!selectedContest || !selectedPrize || remainingPrizeSlots <= 0}
                  className="flex-1"
                >
                  {isDrawing ? 'Drawing...' : 'Start Draw'}
                </Button>
                {winners.length > 0 && (
                  <Button
                    variant="secondary"
                    icon={<RotateCcw className="w-5 h-5" />}
                    onClick={handleReDraw}
                  >
                    Re-Draw
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Winners Display */}
          {showAnimation && (
            <Card title="Draw Results">
              <AnimatePresence>
                {isDrawing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-16 h-16 text-primary-600" />
                    </motion.div>
                    <p className="text-lg font-medium text-gray-900 mt-4">
                      Selecting winners...
                    </p>
                    <p className="text-sm text-gray-500">Please wait</p>
                  </motion.div>
                ) : winners.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                        <Award className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Congratulations to the Winners!
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {winners.map((winner, index) => (
                        <motion.div
                          key={winner.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border-2 border-primary-200"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{winner.name}</p>
                            <p className="text-sm text-gray-600">{winner.email}</p>
                            <p className="text-sm text-gray-600">{winner.phone}</p>
                          </div>
                          <Badge variant="success">Winner</Badge>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4">
                  <Button variant="primary" onClick={handleSaveResults} className="flex-1" loading={savingResults} disabled={savingResults}>
                        Save Results
                      </Button>
                      <Button variant="secondary" onClick={handleReDraw}>
                        Re-Draw
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Card>
          )}
        </div>

        {/* Draw Information */}
        <div className="space-y-6">
          <Card title="Draw Information">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Eligible Participants</p>
                  <p className="text-lg font-semibold text-gray-900">{participants.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Prizes</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {prizes.reduce((sum, p) => sum + p.quantity, 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Contests</p>
                  <p className="text-lg font-semibold text-gray-900">{contests.length}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Security Features">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <p className="text-gray-700">Cryptographically secure random selection</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <p className="text-gray-700">Audit trail for all draw activities</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <p className="text-gray-700">Duplicate entry prevention</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <p className="text-gray-700">Tamper-proof result recording</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
                  <h2 className="text-xl font-semibold text-gray-900">Confirm Draw Start</h2>
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
                      <p className="text-gray-700 leading-relaxed">
                        Once the draw starts, it cannot be undone. Do you want to proceed?
                      </p>
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
                    onClick={handleDraw}
                  >
                    Confirm
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
