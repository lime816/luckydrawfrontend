/**
 * Scratch Card Component Types
 * Defines all interfaces and types for the scratch card system
 */

export type RevealAnimation = 'fade' | 'scale' | 'slide' | 'bounce' | 'none';
export type RevealEffect = 'confetti' | 'sparkles' | 'fireworks' | 'none';

export interface ScratchCardPrize {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  probability: number; // Percentage (0-100)
  value?: number;
  claimLink?: string; // Link to claim this specific prize
}

export interface ScratchCardOptions {
  // Prize Configuration
  prizes: ScratchCardPrize[]; // List of prizes with probabilities
  defaultClaimLink?: string; // Default link if prize doesn't have specific link
  
  // Image Configuration (for cover)
  coverImage?: string;
  coverColor: string;

  // Scratch Behavior
  brushSize: number;
  revealThreshold: number; // Percentage (0-100)

  // Visual Effects
  foilRoughness: number; // 0-1
  metalness: number; // 0-1
  shine: boolean;

  // Reveal Configuration
  revealAnimation: RevealAnimation;
  revealEffect: RevealEffect;

  // UI Options
  showPercent: boolean;
  resetButton: boolean;
  showClaimButton: boolean; // Show claim prize button after reveal

  // Optional Callbacks
  onReveal?: (prize: ScratchCardPrize) => void;
  onScratchProgress?: (percent: number) => void;
  onClaim?: (prize: ScratchCardPrize) => void;
}

export interface ScratchCardEditorProps {
  value: ScratchCardOptions;
  onChange: (config: ScratchCardOptions) => void;
  className?: string;
}

export interface ThreeScratchCardProps {
  config: ScratchCardOptions;
  width?: number;
  height?: number;
  className?: string;
}

export interface ThreeScratchCardPreviewProps {
  config: ScratchCardOptions;
  className?: string;
}

export interface ScratchPoint {
  x: number;
  y: number;
}

export interface ScratchState {
  isScratching: boolean;
  scratchedPercent: number;
  isRevealed: boolean;
}
