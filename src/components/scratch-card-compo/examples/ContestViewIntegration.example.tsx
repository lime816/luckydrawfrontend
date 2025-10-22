/**
 * Example: Integrating Scratch Card into Contest View Page
 * 
 * This example shows how to display the interactive scratch card on the contest viewer page.
 * Copy and adapt this code to your actual ContestView component.
 */

import React, { useState, useEffect } from 'react';
import { ThreeScratchCard, ScratchCardOptions } from '../index';

// Example Contest interface - adjust to match your actual type
interface Contest {
  id: number;
  name: string;
  description: string;
  prizeImage: string;
  scratchCardEnabled: boolean;
  scratchCardConfig?: ScratchCardOptions;
}

interface ContestViewIntegrationExampleProps {
  contestId: number;
}

export const ContestViewIntegrationExample: React.FC<ContestViewIntegrationExampleProps> = ({
  contestId,
}) => {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  // Load contest data
  useEffect(() => {
    const loadContest = async () => {
      try {
        const response = await fetch(`/api/contests/${contestId}`);
        const data = await response.json();
        setContest(data);
      } catch (error) {
        console.error('Error loading contest:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId]);

  // Handle scratch card reveal
  const handleReveal = () => {
    setRevealed(true);
    setShowCongrats(true);

    // Track analytics
    trackEvent('scratch_card_revealed', {
      contestId: contest?.id,
      contestName: contest?.name,
    });

    // Award prize or update user status
    awardPrize();
  };

  // Handle scratch progress
  const handleScratchProgress = (percent: number) => {
    console.log(`Scratched: ${percent}%`);

    // Show encouragement at milestones
    if (percent === 50) {
      showToast('Halfway there! Keep scratching!');
    }
  };

  // Dummy functions - replace with your actual implementations
  const trackEvent = (event: string, data: any) => {
    console.log('Analytics:', event, data);
  };

  const awardPrize = () => {
    console.log('Prize awarded!');
  };

  const showToast = (message: string) => {
    console.log('Toast:', message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Contest Not Found</h2>
          <p className="text-gray-600">The contest you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{contest.name}</h1>
          <p className="text-lg text-gray-600">{contest.description}</p>
        </div>

        {/* Scratch Card or Prize Display */}
        <div className="flex justify-center mb-8">
          {contest.scratchCardEnabled && contest.scratchCardConfig ? (
            // Show interactive scratch card
            <div className="relative">
              <ThreeScratchCard
                config={{
                  ...contest.scratchCardConfig,
                  onReveal: handleReveal,
                  onScratchProgress: handleScratchProgress,
                }}
                width={600}
                height={400}
                className="shadow-2xl rounded-xl overflow-hidden"
              />

              {/* Instruction Overlay (only before scratching) */}
              {!revealed && (
                <div className="absolute -bottom-16 left-0 right-0 text-center">
                  <p className="text-gray-700 font-semibold">
                    👆 Scratch the card to reveal your prize!
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Show prize image directly (no scratch card)
            <div className="max-w-2xl">
              <img
                src={contest.prizeImage}
                alt="Prize"
                className="w-full rounded-xl shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* Congratulations Modal */}
        {showCongrats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform animate-bounce-in">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-600 mb-6">
                You've revealed your prize!
              </p>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 font-semibold">
                  Check your email for prize details
                </p>
              </div>
              <button
                onClick={() => setShowCongrats(false)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Contest Details */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Contest Details</h3>
            <div className="space-y-3 text-gray-600">
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className="text-green-600">Active</span>
              </p>
              <p>
                <span className="font-semibold">Participants:</span> 1,234
              </p>
              <p>
                <span className="font-semibold">Ends:</span> December 31, 2024
              </p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-2">Share with Friends!</h3>
            <p className="mb-4">Invite others to participate in this contest</p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                Share on Facebook
              </button>
              <button className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all">
                Share on Twitter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestViewIntegrationExample;
