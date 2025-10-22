# Dependencies and Installation

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

## Installation Commands

### Install Three.js
```bash
npm install three
npm install --save-dev @types/three
```

### Verify Existing Dependencies
```bash
# Check if React and TypeScript are already installed
npm list react react-dom typescript tailwindcss
```

## Import CSS Styles

Add the scratch card CSS to your global styles:

### Option 1: Import in your main CSS file
```css
/* src/index.css or src/App.css */
@import './components/scratch-card-compo/scratch-card.css';
```

### Option 2: Import in your main TypeScript file
```typescript
// src/main.tsx or src/index.tsx
import './components/scratch-card-compo/scratch-card.css';
```

### Option 3: Add animations to Tailwind config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
};
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Vite Configuration (if using Vite)

No special configuration needed, but ensure you have:

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

## Database Schema Changes

If using a SQL database, add these columns to your contests table:

```sql
ALTER TABLE contests
ADD COLUMN scratch_card_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN scratch_card_config JSONB;
```

If using Prisma, update your schema:

```prisma
model Contest {
  id                  Int       @id @default(autoincrement())
  name                String
  description         String
  prizeImage          String
  scratchCardEnabled  Boolean   @default(false)
  scratchCardConfig   Json?
  // ... other fields
}
```

## Environment Setup

No environment variables required for basic functionality.

For production deployment with image uploads, you may need:

```env
# Optional: If using cloud storage for images
VITE_STORAGE_URL=your_storage_url
VITE_STORAGE_BUCKET=your_bucket_name
```

## Verification

After installation, verify everything works:

```typescript
// Test import
import {
  ThreeScratchCard,
  ScratchCardEditor,
  DEFAULT_SCRATCH_CARD_CONFIG,
} from '@/components/scratch-card-compo';

console.log('Scratch card components loaded successfully!');
```

## Troubleshooting

### Three.js not found
```bash
npm install three @types/three --force
```

### CSS animations not working
Ensure the CSS file is imported in your main entry point.

### TypeScript errors
```bash
npm install --save-dev @types/three @types/react @types/react-dom
```

### Build errors
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Optional Dependencies

For enhanced functionality:

```bash
# For confetti effects (alternative to built-in)
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti

# For image optimization
npm install sharp

# For analytics integration
npm install @segment/analytics-next
```

## Browser Requirements

- Modern browsers with WebGL support
- Canvas 2D API support
- ES2020+ JavaScript features
- Touch events API (for mobile)

## Performance Considerations

For optimal performance:

1. **Lazy load Three.js** if not immediately needed
2. **Use CDN** for Three.js in production (optional)
3. **Optimize images** before upload
4. **Enable gzip** compression on server

## Production Build

Ensure your build configuration includes:

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
        },
      },
    },
  },
});
```

This separates Three.js into its own chunk for better caching.
