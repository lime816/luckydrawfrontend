/**
 * ScratchCardEditor Component
 * Simplified editor for scratch card with prize probability system
 */

import React, { useState } from 'react';
import { ScratchCardEditorProps, ScratchCardPrize } from './types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { validateProbabilities } from './utils';

export const ScratchCardEditorSimple: React.FC<ScratchCardEditorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [newPrize, setNewPrize] = useState({
    name: '',
    description: '',
    imageUrl: '',
    probability: '',
    claimLink: '',
  });

  // Debug: Log the prizes
  console.log('ScratchCardEditor - Current prizes:', value.prizes);

  const [showTestCard, setShowTestCard] = useState(false);

  // Calculate total probability
  const totalProbability = value.prizes.reduce((sum, prize) => sum + prize.probability, 0);
  const validation = validateProbabilities(value.prizes);

  // Handle add prize
  const handleAddPrize = () => {
    if (newPrize.name && newPrize.imageUrl && newPrize.probability) {
      const prize: ScratchCardPrize = {
        id: Date.now().toString(),
        name: newPrize.name,
        description: newPrize.description || undefined,
        imageUrl: newPrize.imageUrl,
        probability: parseFloat(newPrize.probability),
        claimLink: newPrize.claimLink || undefined,
      };

      onChange({
        ...value,
        prizes: [...value.prizes, prize],
      });

      setNewPrize({
        name: '',
        description: '',
        imageUrl: '',
        probability: '',
        claimLink: '',
      });
    }
  };

  // Handle remove prize
  const handleRemovePrize = (id: string) => {
    onChange({
      ...value,
      prizes: value.prizes.filter((p) => p.id !== id),
    });
  };

  // Handle update prize
  const handleUpdatePrize = (id: string, updates: Partial<ScratchCardPrize>) => {
    onChange({
      ...value,
      prizes: value.prizes.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Scratch Card Configuration</h3>
        <p className="text-sm opacity-90">
          Define prizes, probabilities, and claim links for your scratch card
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Live Preview Demo */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-300">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800">🎴 Live Scratch Card Preview</h4>
            <div className="flex items-center gap-2">
              {value.prizes && value.prizes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTestCard(true)}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors font-semibold"
                >
                  Test Interactive Card
                </button>
              )}
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                Live Preview
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            {value.prizes && value.prizes.length > 0 ? (
              <div className="space-y-2">
                <div className="text-center">
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold">Scratch to reveal your prize!</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {value.prizes.slice(0, 3).map((prize) => (
                    <div key={prize.id} className="text-center p-2 bg-gray-50 rounded border">
                      <img
                        src={prize.imageUrl}
                        alt={prize.name}
                        className="w-full h-20 object-cover rounded mb-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="80"%3E%3Crect fill="%23ddd" width="100" height="80"/%3E%3Ctext fill="%23999" font-size="10" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <p className="text-xs font-semibold truncate">{prize.name}</p>
                      <p className="text-xs text-purple-600">{prize.probability}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">
                Add prizes below to see preview
              </p>
            )}
          </div>
        </div>

        {/* Default Claim Link */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Default Claim Link (Optional)
          </label>
          <input
            type="url"
            value={value.defaultClaimLink || ''}
            onChange={(e) => onChange({ ...value, defaultClaimLink: e.target.value })}
            placeholder="http://localhost:3000/claim"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used when a prize doesn't have its own claim link. Example: http://localhost:3000/claim
          </p>
        </div>

        {/* Prizes List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-800">Prizes</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Probability:</span>
              <span
                className={`font-bold ${
                  validation.valid ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {totalProbability.toFixed(1)}%
              </span>
            </div>
          </div>

          {!validation.valid && value.prizes.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{validation.message}</p>
            </div>
          )}

          {/* Existing Prizes */}
          {value.prizes.length > 0 && (
            <div className="space-y-3 mb-4">
              {value.prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900">{prize.name}</h5>
                      {prize.description && (
                        <p className="text-sm text-gray-600">{prize.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePrize(prize.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Probability:</span>
                      <span className="ml-2 font-semibold text-purple-600">
                        {prize.probability}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Image:</span>
                      <a
                        href={prize.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline truncate block"
                      >
                        View
                      </a>
                    </div>
                    {prize.claimLink && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Claim Link:</span>
                        <a
                          href={prize.claimLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline truncate block"
                        >
                          {prize.claimLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Prize Form */}
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
            <h5 className="font-bold text-gray-800 mb-3">Add New Prize</h5>
            
            {/* Example Links Info */}
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">💡 Example Links:</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p><strong>Scratch Page:</strong> http://localhost:3000/scratch</p>
                <p><strong>Claim Links:</strong></p>
                <p>• http://localhost:3000/claim/grand-prize</p>
                <p>• http://localhost:3000/claim/second-prize</p>
                <p>• http://localhost:3000/claim/consolation</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Prize Name *"
                  value={newPrize.name}
                  onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Probability (%) *"
                  value={newPrize.probability}
                  onChange={(e) => setNewPrize({ ...newPrize, probability: e.target.value })}
                  min="0"
                  max="100"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <input
                type="text"
                placeholder="Description (Optional)"
                value={newPrize.description}
                onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <input
                type="url"
                placeholder="Prize Image URL *"
                value={newPrize.imageUrl}
                onChange={(e) => setNewPrize({ ...newPrize, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <input
                type="url"
                placeholder="Claim Link (e.g., http://localhost:3000/claim/prize-name)"
                value={newPrize.claimLink}
                onChange={(e) => setNewPrize({ ...newPrize, claimLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              <button
                type="button"
                onClick={handleAddPrize}
                disabled={!newPrize.name || !newPrize.imageUrl || !newPrize.probability}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Prize
              </button>
            </div>
          </div>
        </div>

        {/* Cover Color */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Scratch Card Cover Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value.coverColor}
              onChange={(e) => onChange({ ...value, coverColor: e.target.value })}
              className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
            />
            <input
              type="text"
              value={value.coverColor}
              onChange={(e) => onChange({ ...value, coverColor: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
            />
          </div>
        </div>

        {/* Show Claim Button Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-bold text-gray-700">
              Show Claim Button
            </label>
            <p className="text-xs text-gray-500">Display claim button after reveal</p>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...value, showClaimButton: !value.showClaimButton })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value.showClaimButton ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value.showClaimButton ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Test Card Modal */}
      {showTestCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Interactive Scratch Card Test</h3>
                <button
                  onClick={() => setShowTestCard(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-4 text-center">
                  This is how your scratch card will appear to users. The actual interactive version will use Three.js for 3D effects.
                </p>
                
                {/* Show all prizes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {value.prizes.map((prize) => (
                    <div key={prize.id} className="bg-white rounded-lg p-4 shadow-md">
                      <img
                        src={prize.imageUrl}
                        alt={prize.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <h4 className="font-bold text-gray-800 mb-1">{prize.name}</h4>
                      {prize.description && (
                        <p className="text-xs text-gray-600 mb-2">{prize.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                          {prize.probability}% chance
                        </span>
                        {prize.claimLink && (
                          <a
                            href={prize.claimLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Test Link
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> The actual scratch card will randomly select ONE of these prizes based on the probabilities you've set.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchCardEditorSimple;
