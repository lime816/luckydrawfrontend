/**
 * ThreeScratchCardPreview Component
 * Lightweight, non-interactive preview for the editor
 */

import React from 'react';
import { ThreeScratchCardPreviewProps } from './types';

export const ThreeScratchCardPreview: React.FC<ThreeScratchCardPreviewProps> = ({
  config,
  className = '',
}) => {
  return (
    <div className={`relative w-full aspect-[3/2] rounded-xl overflow-hidden shadow-lg ${className}`}>
      {/* Prize Image (Background) */}
      <div className="absolute inset-0">
        {config.prizes && config.prizes.length > 0 && config.prizes[0].imageUrl ? (
          <img
            src={config.prizes[0].imageUrl}
            alt="Prize"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EPrize Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">Prize Preview</span>
          </div>
        )}
      </div>

      {/* Cover Layer with Overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          backgroundColor: config.coverColor,
          opacity: 0.85,
          backgroundImage: config.coverImage ? `url(${config.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Metallic/Shine Effect Simulation */}
        {config.shine && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, 
                transparent 0%, 
                rgba(255,255,255,${config.metalness}) 25%, 
                transparent 50%, 
                rgba(255,255,255,${config.metalness}) 75%, 
                transparent 100%)`,
            }}
          />
        )}

        {/* Preview Label */}
        <div className="relative z-10 text-center">
          <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white/50">
            <p className="text-white font-bold text-lg drop-shadow-lg">Scratch to Reveal</p>
          </div>
        </div>
      </div>

      {/* Configuration Indicators */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end gap-2 z-20">
        {/* Brush Size Indicator */}
        <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-sm">
          Brush: {config.brushSize}px
        </div>

        {/* Reveal Threshold Indicator */}
        <div className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-sm">
          Reveal: {config.revealThreshold}%
        </div>

        {/* Effect Indicators */}
        <div className="flex gap-1">
          {config.revealAnimation !== 'none' && (
            <div className="bg-purple-500/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
              {config.revealAnimation}
            </div>
          )}
          {config.revealEffect !== 'none' && (
            <div className="bg-pink-500/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
              {config.revealEffect}
            </div>
          )}
        </div>
      </div>

      {/* Material Properties Visualization */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
        {config.metalness > 0.5 && (
          <div className="bg-yellow-500/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            ✨ Metallic
          </div>
        )}
        {config.foilRoughness < 0.3 && (
          <div className="bg-blue-500/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            💎 Smooth
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeScratchCardPreview;
