/**
 * Example: Integrating Scratch Card into Create Contest Page
 * 
 * This example shows how to add scratch card functionality to your contest creation form.
 * Copy and adapt this code to your actual CreateContest component.
 */

import React, { useState } from 'react';
import {
  ScratchCardEditor,
  DEFAULT_SCRATCH_CARD_CONFIG,
  ScratchCardOptions,
} from '../index';

// Example Contest interface - adjust to match your actual type
interface Contest {
  id?: number;
  name: string;
  description: string;
  prizeImage: string;
  startTime: Date;
  endTime: Date;
  // Add scratch card fields
  scratchCardEnabled: boolean;
  scratchCardConfig?: ScratchCardOptions;
}

export const CreateContestIntegrationExample: React.FC = () => {
  // Form state
  const [contestData, setContestData] = useState<Partial<Contest>>({
    name: '',
    description: '',
    prizeImage: '',
    scratchCardEnabled: false,
    scratchCardConfig: DEFAULT_SCRATCH_CARD_CONFIG,
  });

  // Handle scratch card toggle
  const handleScratchCardToggle = (enabled: boolean) => {
    setContestData((prev) => ({
      ...prev,
      scratchCardEnabled: enabled,
      // Initialize config when enabling
      scratchCardConfig: enabled ? DEFAULT_SCRATCH_CARD_CONFIG : undefined,
    }));
  };

  // Handle scratch card config changes
  const handleScratchCardConfigChange = (config: ScratchCardOptions) => {
    setContestData((prev) => ({
      ...prev,
      scratchCardConfig: config,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate scratch card if enabled
      if (contestData.scratchCardEnabled && (!contestData.scratchCardConfig?.prizes || contestData.scratchCardConfig.prizes.length === 0)) {
        alert('Please add at least one prize for the scratch card');
        return;
      }

      // Save contest to database
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contestData,
          // Only include config if enabled
          scratchCardConfig: contestData.scratchCardEnabled
            ? contestData.scratchCardConfig
            : null,
        }),
      });

      if (response.ok) {
        alert('Contest created successfully!');
        // Reset form or navigate away
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      alert('Failed to create contest');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Contest</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Contest Fields */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contest Name *
            </label>
            <input
              type="text"
              value={contestData.name}
              onChange={(e) => setContestData({ ...contestData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={contestData.description}
              onChange={(e) => setContestData({ ...contestData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Prize Image URL *
            </label>
            <input
              type="url"
              value={contestData.prizeImage}
              onChange={(e) => setContestData({ ...contestData, prizeImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        {/* Scratch Card Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Scratch Card Reveal</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add an interactive scratch-to-reveal experience for participants
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => handleScratchCardToggle(!contestData.scratchCardEnabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                contestData.scratchCardEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  contestData.scratchCardEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Scratch Card Editor - Only show when enabled */}
          {contestData.scratchCardEnabled && contestData.scratchCardConfig && (
            <div className="mt-6">
              <ScratchCardEditor
                value={contestData.scratchCardConfig}
                onChange={handleScratchCardConfigChange}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Create Contest
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateContestIntegrationExample;
