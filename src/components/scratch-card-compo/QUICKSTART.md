# 🚀 Quick Start Guide

Get the scratch card system up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install three @types/three
```

## Step 2: Import CSS

Add to your `src/index.css` or `src/App.css`:

```css
@import './components/scratch-card-compo/scratch-card.css';
```

Or import in your main TypeScript file:

```typescript
import './components/scratch-card-compo/scratch-card.css';
```

## Step 3: Basic Usage

### Simple Scratch Card

```tsx
import { ThreeScratchCard, DEFAULT_SCRATCH_CARD_CONFIG } from '@/components/scratch-card-compo';

function App() {
  return (
    <ThreeScratchCard
      config={{
        ...DEFAULT_SCRATCH_CARD_CONFIG,
        prizeImage: 'https://your-image-url.com/prize.jpg',
      }}
      width={600}
      height={400}
    />
  );
}
```

### With Editor

```tsx
import { useState } from 'react';
import {
  ThreeScratchCard,
  ScratchCardEditor,
  DEFAULT_SCRATCH_CARD_CONFIG,
  ScratchCardOptions,
} from '@/components/scratch-card-compo';

function App() {
  const [config, setConfig] = useState<ScratchCardOptions>(DEFAULT_SCRATCH_CARD_CONFIG);

  return (
    <div>
      <ScratchCardEditor value={config} onChange={setConfig} />
      <ThreeScratchCard config={config} width={600} height={400} />
    </div>
  );
}
```

## Step 4: Add to Contest Form

```tsx
// In your CreateContest component
const [scratchCardEnabled, setScratchCardEnabled] = useState(false);
const [scratchCardConfig, setScratchCardConfig] = useState(DEFAULT_SCRATCH_CARD_CONFIG);

// In your JSX
<div>
  <label>
    <input
      type="checkbox"
      checked={scratchCardEnabled}
      onChange={(e) => setScratchCardEnabled(e.target.checked)}
    />
    Enable Scratch Card
  </label>

  {scratchCardEnabled && (
    <ScratchCardEditor
      value={scratchCardConfig}
      onChange={setScratchCardConfig}
    />
  )}
</div>
```

## Step 5: Display in Contest View

```tsx
// In your ContestView component
{contest.scratchCardEnabled && contest.scratchCardConfig && (
  <ThreeScratchCard
    config={{
      ...contest.scratchCardConfig,
      onReveal: () => console.log('Prize revealed!'),
    }}
    width={600}
    height={400}
  />
)}
```

## Common Customizations

### Change Colors

```tsx
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  coverColor: '#FFD700', // Gold
};
```

### Adjust Reveal Threshold

```tsx
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  revealThreshold: 80, // Reveal at 80%
};
```

### Add Callbacks

```tsx
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  onReveal: () => {
    alert('You won!');
  },
  onScratchProgress: (percent) => {
    console.log(`${percent}% scratched`);
  },
};
```

### Change Animation

```tsx
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  revealAnimation: 'bounce',
  revealEffect: 'confetti',
};
```

## Database Setup

Add to your contest schema:

```typescript
interface Contest {
  // ... existing fields
  scratchCardEnabled: boolean;
  scratchCardConfig?: ScratchCardOptions;
}
```

SQL:
```sql
ALTER TABLE contests
ADD COLUMN scratch_card_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN scratch_card_config JSONB;
```

## Troubleshooting

### Images not loading?
- Check CORS settings
- Use absolute URLs
- Verify image paths

### Touch not working on mobile?
- Ensure CSS is imported
- Check for conflicting event listeners

### Performance issues?
- Reduce image sizes
- Lower metalness/roughness values
- Disable shine on mobile

## Next Steps

- Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed examples
- Check [README.md](./README.md) for full documentation
- See [examples/](./examples/) folder for complete implementations

## Need Help?

Check the documentation files:
- `README.md` - Component overview
- `INTEGRATION_GUIDE.md` - Detailed integration examples
- `DEPENDENCIES.md` - Installation and setup
- `types.ts` - TypeScript interfaces

---

**You're all set! 🎉**

Start creating amazing scratch card experiences for your contests!
