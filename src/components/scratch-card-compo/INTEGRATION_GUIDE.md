# Scratch Card Component Integration Guide

## 📦 Installation

The scratch card system requires the following dependencies:

```bash
npm install three @types/three
```

## 🎯 Quick Start

### 1. Import Components

```typescript
import {
  ThreeScratchCard,
  ScratchCardEditor,
  DEFAULT_SCRATCH_CARD_CONFIG,
  ScratchCardOptions,
} from '@/components/scratch-card-compo';
```

### 2. Add to Contest Schema

Extend your contest type/interface:

```typescript
interface Contest {
  // ... existing fields
  scratchCardEnabled: boolean;
  scratchCardConfig?: ScratchCardOptions;
}
```

## 🔧 Integration Examples

### Example 1: Create Contest Page

Add scratch card configuration to your contest creation form:

```tsx
import React, { useState } from 'react';
import { ScratchCardEditor, DEFAULT_SCRATCH_CARD_CONFIG } from '@/components/scratch-card-compo';

export const CreateContestPage = () => {
  const [scratchCardEnabled, setScratchCardEnabled] = useState(false);
  const [scratchCardConfig, setScratchCardConfig] = useState(DEFAULT_SCRATCH_CARD_CONFIG);

  const handleSubmit = async () => {
    const contestData = {
      // ... other contest fields
      scratchCardEnabled,
      scratchCardConfig: scratchCardEnabled ? scratchCardConfig : undefined,
    };

    // Save to database
    await saveContest(contestData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other contest fields */}
      
      {/* Scratch Card Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={scratchCardEnabled}
            onChange={(e) => setScratchCardEnabled(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <div>
            <span className="font-bold text-gray-800">Enable Scratch Card Reveal</span>
            <p className="text-sm text-gray-600">
              Add an interactive scratch-to-reveal experience
            </p>
          </div>
        </label>
      </div>

      {/* Scratch Card Editor */}
      {scratchCardEnabled && (
        <div className="mb-6">
          <ScratchCardEditor
            value={scratchCardConfig}
            onChange={setScratchCardConfig}
          />
        </div>
      )}

      <button type="submit" className="btn-primary">
        Create Contest
      </button>
    </form>
  );
};
```

### Example 2: Contest View Page

Display the interactive scratch card on the contest viewer:

```tsx
import React from 'react';
import { ThreeScratchCard } from '@/components/scratch-card-compo';

interface ContestViewPageProps {
  contest: Contest;
}

export const ContestViewPage: React.FC<ContestViewPageProps> = ({ contest }) => {
  const handleReveal = () => {
    console.log('Prize revealed!');
    // Track analytics, show modal, etc.
  };

  const handleScratchProgress = (percent: number) => {
    console.log(`Scratched: ${percent}%`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{contest.title}</h1>

      {contest.scratchCardEnabled && contest.scratchCardConfig ? (
        <div className="flex justify-center mb-8">
          <ThreeScratchCard
            config={{
              ...contest.scratchCardConfig,
              onReveal: handleReveal,
              onScratchProgress: handleScratchProgress,
            }}
            width={600}
            height={400}
            className="shadow-2xl"
          />
        </div>
      ) : (
        <div className="text-center">
          <img
            src={contest.prizeImage}
            alt="Prize"
            className="mx-auto rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Other contest content */}
    </div>
  );
};
```

### Example 3: Mobile Responsive

Make the scratch card responsive:

```tsx
import React, { useState, useEffect } from 'react';
import { ThreeScratchCard } from '@/components/scratch-card-compo';

export const ResponsiveScratchCard: React.FC<{ config: ScratchCardOptions }> = ({ config }) => {
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 32, 600);
      const height = (width * 2) / 3; // Maintain 3:2 aspect ratio
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <ThreeScratchCard
      config={config}
      width={dimensions.width}
      height={dimensions.height}
      className="mx-auto"
    />
  );
};
```

### Example 4: With Custom Callbacks

Add custom behavior on reveal:

```tsx
import React, { useState } from 'react';
import { ThreeScratchCard, ScratchCardOptions } from '@/components/scratch-card-compo';

export const CustomCallbackExample: React.FC = () => {
  const [revealed, setRevealed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const config: ScratchCardOptions = {
    prizeImage: '/prize.jpg',
    coverColor: '#FFD700',
    brushSize: 50,
    revealThreshold: 70,
    foilRoughness: 0.2,
    metalness: 0.9,
    shine: true,
    revealAnimation: 'bounce',
    revealEffect: 'confetti',
    showPercent: true,
    resetButton: true,
    onReveal: () => {
      setRevealed(true);
      setShowModal(true);
      // Track analytics
      analytics.track('scratch_card_revealed');
      // Award prize
      awardPrize();
    },
    onScratchProgress: (percent) => {
      if (percent > 50 && !revealed) {
        // Show hint
        console.log('Almost there!');
      }
    },
  };

  return (
    <>
      <ThreeScratchCard config={config} />
      
      {showModal && (
        <div className="modal">
          <h2>Congratulations! 🎉</h2>
          <p>You've won the prize!</p>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </>
  );
};
```

## 🎨 Customization Options

### ScratchCardOptions Interface

```typescript
interface ScratchCardOptions {
  // Images
  prizeImage: string;           // Required: URL or data URL
  coverImage?: string;          // Optional: URL or data URL
  coverColor: string;           // Hex color (e.g., '#C0C0C0')

  // Scratch Behavior
  brushSize: number;            // 10-100 (default: 40)
  revealThreshold: number;      // 30-100 (default: 70)

  // Visual Effects
  foilRoughness: number;        // 0-1 (default: 0.3)
  metalness: number;            // 0-1 (default: 0.8)
  shine: boolean;               // default: true

  // Reveal Configuration
  revealAnimation: RevealAnimation;  // 'fade' | 'scale' | 'slide' | 'bounce' | 'none'
  revealEffect: RevealEffect;        // 'confetti' | 'sparkles' | 'fireworks' | 'none'

  // UI Options
  showPercent: boolean;         // default: true
  resetButton: boolean;         // default: true

  // Callbacks
  onReveal?: () => void;
  onScratchProgress?: (percent: number) => void;
}
```

## 🎭 Animation Classes

Add these to your Tailwind config or CSS:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-fade-in { animation: fade-in 0.5s ease-out; }
.animate-scale-in { animation: scale-in 0.5s ease-out; }
.animate-slide-up { animation: slide-up 0.5s ease-out; }
.animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

## 📱 Best Practices

### 1. Image Optimization
- Use optimized images (WebP, compressed JPEGs)
- Recommended size: 1200x800px for prize image
- Keep file sizes under 500KB for best performance

### 2. Mobile Considerations
- Use responsive dimensions
- Test touch interactions on actual devices
- Consider reducing brush size on mobile (30-40px)

### 3. Accessibility
- Provide alternative text for images
- Include keyboard navigation if needed
- Consider adding skip option for users who can't scratch

### 4. Performance
- Lazy load the Three.js library if not immediately needed
- Use lower resolution textures on mobile devices
- Debounce scratch progress callbacks

### 5. User Experience
- Set reveal threshold between 60-80% for best UX
- Use subtle animations (fade, scale) for professional look
- Show progress indicator to encourage completion

## 🐛 Troubleshooting

### Images not loading
- Ensure CORS is enabled for external images
- Use data URLs for uploaded images
- Check image paths are correct

### Performance issues
- Reduce canvas size on mobile
- Lower metalness/roughness values
- Disable shine effect on low-end devices

### Touch not working
- Ensure `touch-action: none` is set
- Check for conflicting event listeners
- Test on actual devices, not just browser emulation

## 📊 Database Schema Example

```sql
-- Add to contests table
ALTER TABLE contests
ADD COLUMN scratch_card_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN scratch_card_config JSONB;

-- Example data
UPDATE contests
SET 
  scratch_card_enabled = true,
  scratch_card_config = '{
    "prizeImage": "https://example.com/prize.jpg",
    "coverColor": "#FFD700",
    "brushSize": 40,
    "revealThreshold": 70,
    "foilRoughness": 0.3,
    "metalness": 0.8,
    "shine": true,
    "revealAnimation": "fade",
    "revealEffect": "confetti",
    "showPercent": true,
    "resetButton": true
  }'::jsonb
WHERE id = 1;
```

## 🚀 Advanced Usage

### Custom Effects

You can create custom reveal effects by extending the utils:

```typescript
import { triggerConfetti } from '@/components/scratch-card-compo';

function customRevealEffect() {
  // Your custom effect logic
  triggerConfetti();
  playSound('/sounds/win.mp3');
  vibrate();
}

const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  onReveal: customRevealEffect,
};
```

### Analytics Integration

```typescript
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  onScratchProgress: (percent) => {
    if (percent === 25 || percent === 50 || percent === 75) {
      analytics.track('scratch_milestone', { percent });
    }
  },
  onReveal: () => {
    analytics.track('scratch_complete', {
      contestId: contest.id,
      timestamp: Date.now(),
    });
  },
};
```

## 📝 License

This component system is part of the contest platform project.
