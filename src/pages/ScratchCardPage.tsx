/**
 * Scratch Card Page
 * Interactive scratch card experience for contest participants
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gift, RotateCcw, ExternalLink } from 'lucide-react';
import { ScratchCardPrize } from '../components/scratch-card-compo/types';
import { selectPrizeByProbability } from '../components/scratch-card-compo/utils';

// Mock contest data - replace with actual API call
const mockContestData = {
  id: '1',
  name: 'Summer Giveaway Contest',
  scratchCardConfig: {
    prizes: [
      {
        id: '1',
        name: 'Grand Prize - iPhone 15',
        description: 'Win the latest iPhone!',
        imageUrl: 'https://images.unsplash.com/photo-1592286927505-2fd0d113f0e2?w=400&h=300&fit=crop',
        probability: 10,
        value: 80000,
        claimLink: 'http://localhost:3000/claim/grand-prize',
      },
      {
        id: '2',
        name: 'Second Prize - AirPods Pro',
        description: 'Premium wireless earbuds',
        imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=300&fit=crop',
        probability: 30,
        value: 25000,
        claimLink: 'http://localhost:3000/claim/second-prize',
      },
      {
        id: '3',
        name: 'Consolation - 20% Discount',
        description: 'Get 20% off your next purchase',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop',
        probability: 60,
        value: 0,
        claimLink: 'http://localhost:3000/claim/consolation',
      },
    ],
    coverColor: '#C0C0C0',
    defaultClaimLink: 'http://localhost:3000/claim',
  },
};

export const ScratchCardPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<ScratchCardPrize | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Select a random prize when component mounts
  useEffect(() => {
    if (mockContestData.scratchCardConfig.prizes.length > 0) {
      const prize = selectPrizeByProbability(mockContestData.scratchCardConfig.prizes);
      setSelectedPrize(prize);
    }
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedPrize) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw silver scratch-off layer
    ctx.fillStyle = mockContestData.scratchCardConfig.coverColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add "Scratch Here" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
  }, [selectedPrize]);

  // Calculate scratch percentage
  const calculateScratchPercentage = () => {
    if (!canvasRef.current) return 0;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    return (transparentPixels / (canvas.width * canvas.height)) * 100;
  };

  // Handle scratch
  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || isRevealed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (isScratching) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 120;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPointRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      lastPointRef.current = { x, y };

      // Calculate percentage
      const percent = calculateScratchPercentage();
      setScratchedPercent(percent);

      // Auto-reveal at 30%
      if (percent >= 30 && !isRevealed) {
        handleReveal();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    handleScratch(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching) {
      handleScratch(e);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    lastPointRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(true);
    handleScratch(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isScratching) {
      handleScratch(e);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
    lastPointRef.current = null;
  };

  const handleReveal = () => {
    setIsRevealed(true);
    
    // Completely remove the canvas by hiding it
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none';
    }

    // Trigger confetti effect
    triggerConfetti();
  };

  const triggerConfetti = () => {
    // Simple confetti effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

    const frame = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 3;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = '-10px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        document.body.appendChild(particle);

        const animation = particle.animate(
          [
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 },
          ],
          {
            duration: 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }
        );

        animation.onfinish = () => particle.remove();
      }

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleReset = () => {
    // Select new prize
    if (mockContestData.scratchCardConfig.prizes.length > 0) {
      const prize = selectPrizeByProbability(mockContestData.scratchCardConfig.prizes);
      setSelectedPrize(prize);
    }
    
    setIsRevealed(false);
    setScratchedPercent(0);
    setIsScratching(false);
    lastPointRef.current = null;

    // Reinitialize canvas and show it again
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.style.display = 'block'; // Show canvas again
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = mockContestData.scratchCardConfig.coverColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
      }
    }
  };

  const handleClaim = () => {
    const claimLink = selectedPrize?.claimLink || mockContestData.scratchCardConfig.defaultClaimLink;
    if (claimLink) {
      window.open(claimLink, '_blank');
    }
  };

  if (!selectedPrize) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your scratch card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {mockContestData.name}
          </h1>
          <p className="text-gray-600">Scratch the card to reveal your prize!</p>
        </div>

        {/* Scratch Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="relative">
            {/* Prize Image (Background) */}
            <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
              <img
                src={selectedPrize.imageUrl}
                alt={selectedPrize.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23ddd" width="600" height="400"/%3E%3Ctext fill="%23999" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EPrize Image%3C/text%3E%3C/svg%3E';
                }}
              />
              
              {/* Prize Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedPrize.name}</h2>
                {selectedPrize.description && (
                  <p className="text-white/90">{selectedPrize.description}</p>
                )}
              </div>

              {/* Scratch Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              />
            </div>

            {/* Progress Bar - Hidden */}
          </div>

          {/* Revealed State */}
          {isRevealed && (
            <div className="mt-6 space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Congratulations! 🎉
                </h3>
                <p className="text-gray-600 mb-4">
                  You've won: <span className="font-bold text-purple-600">{selectedPrize.name}</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleClaim}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Claim Your Prize
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isRevealed && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                💡 Use your mouse or finger to scratch off the silver layer
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/contests')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Contests
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardPage;
