/**
 * Scratch Card Component System
 * Modular scratch card components for contest platform
 * 
 * @example
 * // Import components
 * import { ThreeScratchCard, ScratchCardEditor, DEFAULT_SCRATCH_CARD_CONFIG } from '@/components/scratch-card-compo';
 * 
 * // Use in your app
 * <ThreeScratchCard config={scratchCardConfig} />
 */

// Components
export { ThreeScratchCard } from './ThreeScratchCard';
export { ThreeScratchCardPreview } from './ThreeScratchCardPreview';
export { ScratchCardEditor } from './ScratchCardEditor';
export { ScratchCardEditorSimple } from './ScratchCardEditorSimple';

// Types
export type {
  ScratchCardOptions,
  ScratchCardPrize,
  ScratchCardEditorProps,
  ThreeScratchCardProps,
  ThreeScratchCardPreviewProps,
  ScratchPoint,
  ScratchState,
  RevealAnimation,
  RevealEffect,
} from './types';

// Configuration
export {
  DEFAULT_SCRATCH_CARD_CONFIG,
  BRUSH_SIZE_RANGE,
  REVEAL_THRESHOLD_RANGE,
  ROUGHNESS_RANGE,
  METALNESS_RANGE,
  REVEAL_ANIMATION_OPTIONS,
  REVEAL_EFFECT_OPTIONS,
  PRESET_COLORS,
} from './scratchCardConfig';

// Utilities
export {
  calculateScratchPercentage,
  drawScratchLine,
  getCanvasPoint,
  initializeScratchMask,
  resetScratchMask,
  triggerConfetti,
  triggerSparkles,
  triggerFireworks,
  selectPrizeByProbability,
  validateProbabilities,
} from './utils';
