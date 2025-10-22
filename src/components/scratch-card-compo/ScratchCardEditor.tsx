/**
 * ScratchCardEditor Component
 * Configuration panel for scratch card customization with live preview
 */

import React, { useState, useRef } from 'react';
import { ScratchCardEditorProps, RevealAnimation, RevealEffect } from './types';
import { ThreeScratchCardPreview } from './ThreeScratchCardPreview';
import {
  BRUSH_SIZE_RANGE,
  REVEAL_THRESHOLD_RANGE,
  ROUGHNESS_RANGE,
  METALNESS_RANGE,
  REVEAL_ANIMATION_OPTIONS,
  REVEAL_EFFECT_OPTIONS,
  PRESET_COLORS,
} from './scratchCardConfig';

export const ScratchCardEditor: React.FC<ScratchCardEditorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'appearance' | 'behavior' | 'effects'>('images');
  const prizeImageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'prize' | 'cover'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (type === 'cover') {
        onChange({ ...value, coverImage: imageUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input
  const handleImageUrl = (url: string, type: 'prize' | 'cover') => {
    if (type === 'cover') {
      onChange({ ...value, coverImage: url });
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Preview Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Live Preview</h3>
        <ThreeScratchCardPreview config={value} />
      </div>

      {/* Editor Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'images', label: 'Images', icon: '🖼️' },
            { id: 'appearance', label: 'Appearance', icon: '🎨' },
            { id: 'behavior', label: 'Behavior', icon: '⚙️' },
            { id: 'effects', label: 'Effects', icon: '✨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              Note: Prize images are now configured in the prizes section. This editor is deprecated - please use the Simple Editor.
            </p>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cover Image (Optional)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={value.coverImage || ''}
                  onChange={(e) => handleImageUrl(e.target.value, 'cover')}
                  placeholder="Enter image URL (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">or</span>
                  <button
                    onClick={() => coverImageInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-semibold"
                  >
                    Upload File
                  </button>
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="hidden"
                  />
                  {value.coverImage && (
                    <button
                      onClick={() => onChange({ ...value, coverImage: undefined })}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {value.coverImage && (
                  <div className="mt-2">
                    <img
                      src={value.coverImage}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Cover Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cover Color
              </label>
              <div className="flex items-center gap-3 mb-3">
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
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onChange({ ...value, coverColor: preset.value })}
                    className={`h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                      value.coverColor === preset.value
                        ? 'border-purple-600 ring-2 ring-purple-300'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Foil Roughness */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Foil Roughness: {value.foilRoughness.toFixed(1)}
              </label>
              <input
                type="range"
                min={ROUGHNESS_RANGE.min}
                max={ROUGHNESS_RANGE.max}
                step={ROUGHNESS_RANGE.step}
                value={value.foilRoughness}
                onChange={(e) =>
                  onChange({ ...value, foilRoughness: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smooth</span>
                <span>Rough</span>
              </div>
            </div>

            {/* Metalness */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Metalness: {value.metalness.toFixed(1)}
              </label>
              <input
                type="range"
                min={METALNESS_RANGE.min}
                max={METALNESS_RANGE.max}
                step={METALNESS_RANGE.step}
                value={value.metalness}
                onChange={(e) =>
                  onChange({ ...value, metalness: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Matte</span>
                <span>Metallic</span>
              </div>
            </div>

            {/* Shine Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-bold text-gray-700">Enable Shine</label>
                <p className="text-xs text-gray-500">Add subtle shimmer effect</p>
              </div>
              <button
                onClick={() => onChange({ ...value, shine: !value.shine })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value.shine ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value.shine ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Behavior Tab */}
        {activeTab === 'behavior' && (
          <div className="space-y-6">
            {/* Brush Size */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Brush Size: {value.brushSize}px
              </label>
              <input
                type="range"
                min={BRUSH_SIZE_RANGE.min}
                max={BRUSH_SIZE_RANGE.max}
                step={BRUSH_SIZE_RANGE.step}
                value={value.brushSize}
                onChange={(e) => onChange({ ...value, brushSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Reveal Threshold */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Auto-Reveal Threshold: {value.revealThreshold}%
              </label>
              <input
                type="range"
                min={REVEAL_THRESHOLD_RANGE.min}
                max={REVEAL_THRESHOLD_RANGE.max}
                step={REVEAL_THRESHOLD_RANGE.step}
                value={value.revealThreshold}
                onChange={(e) =>
                  onChange({ ...value, revealThreshold: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Card will auto-reveal when {value.revealThreshold}% is scratched
              </p>
            </div>

            {/* Show Progress */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Show Progress Percentage
                </label>
                <p className="text-xs text-gray-500">Display scratch progress indicator</p>
              </div>
              <button
                onClick={() => onChange({ ...value, showPercent: !value.showPercent })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value.showPercent ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value.showPercent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reset Button */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Show Reset Button
                </label>
                <p className="text-xs text-gray-500">Allow users to reset the card</p>
              </div>
              <button
                onClick={() => onChange({ ...value, resetButton: !value.resetButton })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value.resetButton ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value.resetButton ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            {/* Reveal Animation */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reveal Animation
              </label>
              <div className="grid grid-cols-2 gap-3">
                {REVEAL_ANIMATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      onChange({ ...value, revealAnimation: option.value as RevealAnimation })
                    }
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      value.revealAnimation === option.value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reveal Effect */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reveal Effect
              </label>
              <div className="grid grid-cols-2 gap-3">
                {REVEAL_EFFECT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      onChange({ ...value, revealEffect: option.value as RevealEffect })
                    }
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      value.revealEffect === option.value
                        ? 'bg-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Effect Preview */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <p className="text-xs text-gray-600">
                When revealed, the card will use{' '}
                <span className="font-bold text-purple-600">{value.revealAnimation}</span>{' '}
                animation
                {value.revealEffect !== 'none' && (
                  <>
                    {' '}
                    with <span className="font-bold text-pink-600">{value.revealEffect}</span>{' '}
                    effect
                  </>
                )}
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchCardEditor;
