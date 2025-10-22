/**
 * Default Scratch Card Configuration
 * Provides sensible defaults for all scratch card options
 */

import { ScratchCardOptions } from './types';

export const DEFAULT_SCRATCH_CARD_CONFIG: ScratchCardOptions = {
  // Prize Configuration
  prizes: [
    {
      id: '1',
      name: 'Grand Prize',
      description: 'Win amazing rewards!',
      imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop',
      probability: 10,
      value: 1000,
      claimLink: 'http://localhost:3000/claim/grand-prize',
    },
    {
      id: '2',
      name: 'Second Prize',
      description: 'Great rewards await!',
      imageUrl: 'https://images.unsplash.com/photo-1532635270-c09dac425ca9?w=400&h=300&fit=crop',
      probability: 30,
      value: 500,
      claimLink: 'http://localhost:3000/claim/second-prize',
    },
    {
      id: '3',
      name: 'Consolation Prize',
      description: 'Better luck next time!',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=300&fit=crop',
      probability: 60,
      value: 100,
      claimLink: 'http://localhost:3000/claim/consolation',
    },
  ],
  defaultClaimLink: 'http://localhost:3000/claim',

  // Image Configuration
  coverImage: undefined,
  coverColor: '#C0C0C0', // Silver

  // Scratch Behavior
  brushSize: 40,
  revealThreshold: 70, // Auto-reveal at 70%

  // Visual Effects
  foilRoughness: 0.3,
  metalness: 0.8,
  shine: true,

  // Reveal Configuration
  revealAnimation: 'fade',
  revealEffect: 'confetti',

  // UI Options
  showPercent: true,
  resetButton: true,
  showClaimButton: true,
};

export const BRUSH_SIZE_RANGE = {
  min: 10,
  max: 100,
  step: 5,
};

export const REVEAL_THRESHOLD_RANGE = {
  min: 30,
  max: 100,
  step: 5,
};

export const ROUGHNESS_RANGE = {
  min: 0,
  max: 1,
  step: 0.1,
};

export const METALNESS_RANGE = {
  min: 0,
  max: 1,
  step: 0.1,
};

export const REVEAL_ANIMATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'scale', label: 'Scale' },
  { value: 'slide', label: 'Slide' },
  { value: 'bounce', label: 'Bounce' },
] as const;

export const REVEAL_EFFECT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'confetti', label: 'Confetti' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'fireworks', label: 'Fireworks' },
] as const;

export const PRESET_COLORS = [
  { name: 'Silver', value: '#C0C0C0' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Bronze', value: '#CD7F32' },
  { name: 'Rose Gold', value: '#B76E79' },
  { name: 'Platinum', value: '#E5E4E2' },
  { name: 'Copper', value: '#B87333' },
];
