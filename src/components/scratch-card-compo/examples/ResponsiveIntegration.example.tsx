/**
 * Example: Responsive Scratch Card Implementation
 * 
 * This example shows how to make the scratch card responsive across different screen sizes.
 * Includes mobile-optimized settings and adaptive dimensions.
 */

import React, { useState, useEffect } from 'react';
import { ThreeScratchCard, ScratchCardOptions } from '../index';

interface ResponsiveScratchCardProps {
  config: ScratchCardOptions;
  onReveal?: () => void;
}

export const ResponsiveScratchCardExample: React.FC<ResponsiveScratchCardProps> = ({
  config,
  onReveal,
}) => {
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [isMobile, setIsMobile] = useState(false);
  const [adaptedConfig, setAdaptedConfig] = useState(config);

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const isMobileDevice = windowWidth < 768;
      setIsMobile(isMobileDevice);

      // Calculate responsive dimensions
      let width: number;
      let height: number;

      if (windowWidth < 640) {
        // Mobile
        width = Math.min(windowWidth - 32, 400);
        height = (width * 2) / 3;
      } else if (windowWidth < 1024) {
        // Tablet
        width = Math.min(windowWidth - 64, 500);
        height = (width * 2) / 3;
      } else {
        // Desktop
        width = 600;
        height = 400;
      }

      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Adapt config for mobile devices
  useEffect(() => {
    if (isMobile) {
      setAdaptedConfig({
        ...config,
        // Smaller brush size for touch precision
        brushSize: Math.max(config.brushSize * 0.7, 25),
        // Disable shine on mobile for better performance
        shine: false,
        // Lower metalness for better performance
        metalness: Math.min(config.metalness, 0.5),
      });
    } else {
      setAdaptedConfig(config);
    }
  }, [config, isMobile]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mobile Hint */}
      {isMobile && (
        <div className="mb-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm text-center">
          💡 Use your finger to scratch the card
        </div>
      )}

      {/* Scratch Card */}
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <ThreeScratchCard
          config={{
            ...adaptedConfig,
            onReveal,
          }}
          width={dimensions.width}
          height={dimensions.height}
          className="shadow-2xl rounded-xl overflow-hidden"
        />
      </div>

      {/* Device Info (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs">
          {isMobile ? '📱 Mobile' : '💻 Desktop'} • {dimensions.width}x{dimensions.height}
        </div>
      )}
    </div>
  );
};

/**
 * Example: Full Page Responsive Layout
 */
export const ResponsivePageExample: React.FC = () => {
  const [config] = useState<ScratchCardOptions>({
    prizes: [
      {
        id: '1',
        name: 'Grand Prize',
        imageUrl: 'https://example.com/prize.jpg',
        probability: 100,
      }
    ],
    coverColor: '#FFD700',
    brushSize: 40,
    revealThreshold: 70,
    foilRoughness: 0.3,
    metalness: 0.8,
    shine: true,
    revealAnimation: 'fade',
    revealEffect: 'confetti',
    showPercent: true,
    resetButton: true,
    showClaimButton: true,
  });

  const handleReveal = () => {
    console.log('Prize revealed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Scratch & Win Contest
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Reveal Your Prize!
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Scratch the card to discover what you've won
          </p>
        </div>

        {/* Scratch Card Section */}
        <div className="flex justify-center mb-8">
          <ResponsiveScratchCardExample config={config} onReveal={handleReveal} />
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">How to Play</h3>
            <ol className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">1.</span>
                <span>Use your mouse or finger to scratch the silver coating</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">2.</span>
                <span>Reveal at least 70% to automatically show your prize</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-purple-600 mr-2">3.</span>
                <span>Enjoy your winnings!</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Contest Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ResponsiveScratchCardExample;
