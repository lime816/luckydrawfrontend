/**
 * Scratch Card Utility Functions
 * Helper functions for scratch card logic and calculations
 */

import { ScratchPoint, ScratchCardPrize } from './types';

/**
 * Select a random prize based on probability distribution
 * @param prizes - Array of prizes with probabilities
 * @returns Selected prize
 */
export function selectPrizeByProbability(prizes: ScratchCardPrize[]): ScratchCardPrize {
  if (prizes.length === 0) {
    throw new Error('No prizes available');
  }

  // Normalize probabilities to ensure they sum to 100
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
  
  if (totalProbability === 0) {
    // If all probabilities are 0, return random prize
    return prizes[Math.floor(Math.random() * prizes.length)];
  }

  // Generate random number between 0 and total probability
  const random = Math.random() * totalProbability;
  
  // Select prize based on cumulative probability
  let cumulative = 0;
  for (const prize of prizes) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return prize;
    }
  }

  // Fallback to last prize (should never reach here)
  return prizes[prizes.length - 1];
}

/**
 * Validate that probabilities sum to 100 (or close to it)
 * @param prizes - Array of prizes with probabilities
 * @returns Whether probabilities are valid
 */
export function validateProbabilities(prizes: ScratchCardPrize[]): { valid: boolean; total: number; message?: string } {
  const total = prizes.reduce((sum, prize) => sum + prize.probability, 0);
  
  if (Math.abs(total - 100) < 0.01) {
    return { valid: true, total };
  }
  
  return {
    valid: false,
    total,
    message: `Probabilities sum to ${total.toFixed(2)}% (should be 100%)`,
  };
}

/**
 * Calculate the percentage of canvas that has been scratched
 * @param canvas - The scratch mask canvas
 * @returns Percentage scratched (0-100)
 */
export function calculateScratchPercentage(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let transparentPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Count transparent pixels (alpha channel < 128)
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 128) {
      transparentPixels++;
    }
  }

  return (transparentPixels / totalPixels) * 100;
}

/**
 * Draw a scratch line on the canvas
 * @param ctx - Canvas 2D context
 * @param from - Starting point
 * @param to - Ending point
 * @param brushSize - Size of the brush
 */
export function drawScratchLine(
  ctx: CanvasRenderingContext2D,
  from: ScratchPoint,
  to: ScratchPoint,
  brushSize: number
): void {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

/**
 * Get mouse/touch position relative to canvas
 * @param event - Mouse or touch event
 * @param canvas - Target canvas element
 * @returns Point coordinates
 */
export function getCanvasPoint(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
): ScratchPoint {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX: number;
  let clientY: number;

  if ('touches' in event) {
    clientX = event.touches[0]?.clientX || 0;
    clientY = event.touches[0]?.clientY || 0;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

/**
 * Initialize scratch mask canvas
 * @param canvas - Canvas element
 * @param color - Cover color
 * @param image - Optional cover image
 */
export async function initializeScratchMask(
  canvas: HTMLCanvasElement,
  color: string,
  image?: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Overlay image if provided
  if (image) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image;
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.warn('Failed to load cover image:', error);
    }
  }
}

/**
 * Reset scratch mask to initial state
 * @param canvas - Canvas element
 * @param color - Cover color
 * @param image - Optional cover image
 */
export function resetScratchMask(
  canvas: HTMLCanvasElement,
  color: string,
  image?: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.globalCompositeOperation = 'source-over';
  initializeScratchMask(canvas, color, image);
}

/**
 * Trigger confetti effect
 */
export function triggerConfetti(): void {
  // Simple confetti implementation
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createConfettiPiece(color: string): void {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = '10px';
  confetti.style.height = '10px';
  confetti.style.backgroundColor = color;
  confetti.style.left = Math.random() * window.innerWidth + 'px';
  confetti.style.top = '-10px';
  confetti.style.opacity = '1';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  confetti.style.borderRadius = '50%';

  document.body.appendChild(confetti);

  const animation = confetti.animate(
    [
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      {
        transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`,
        opacity: 0,
      },
    ],
    {
      duration: 3000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }
  );

  animation.onfinish = () => confetti.remove();
}

/**
 * Trigger sparkles effect
 */
export function triggerSparkles(): void {
  const sparkleCount = 30;
  for (let i = 0; i < sparkleCount; i++) {
    setTimeout(() => createSparkle(), i * 50);
  }
}

function createSparkle(): void {
  const sparkle = document.createElement('div');
  sparkle.innerHTML = '✨';
  sparkle.style.position = 'fixed';
  sparkle.style.left = Math.random() * window.innerWidth + 'px';
  sparkle.style.top = Math.random() * window.innerHeight + 'px';
  sparkle.style.fontSize = '24px';
  sparkle.style.pointerEvents = 'none';
  sparkle.style.zIndex = '9999';

  document.body.appendChild(sparkle);

  const animation = sparkle.animate(
    [
      { opacity: 0, transform: 'scale(0)' },
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0)' },
    ],
    {
      duration: 1000,
      easing: 'ease-in-out',
    }
  );

  animation.onfinish = () => sparkle.remove();
}

/**
 * Trigger fireworks effect
 */
export function triggerFireworks(): void {
  const positions = [
    { x: '25%', y: '30%' },
    { x: '75%', y: '30%' },
    { x: '50%', y: '50%' },
  ];

  positions.forEach((pos, index) => {
    setTimeout(() => createFirework(pos.x, pos.y), index * 300);
  });
}

function createFirework(x: string, y: string): void {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '6px';
    particle.style.height = '6px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = x;
    particle.style.top = y;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';

    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 100 + Math.random() * 100;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    const animation = particle.animate(
      [
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px)`, opacity: 0 },
      ],
      {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    );

    animation.onfinish = () => particle.remove();
  }
}
