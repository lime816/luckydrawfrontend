# 🎴 Scratch Card Component System

A modular, interactive scratch card system built with **TypeScript**, **React**, **Tailwind CSS**, and **Three.js** for contest platforms.

## ✨ Features

- 🎨 **Fully Customizable** - Colors, textures, animations, and effects
- 🖼️ **Image Support** - Prize and cover images with file upload
- 🎭 **Rich Animations** - Fade, scale, slide, bounce reveal animations
- 🎉 **Visual Effects** - Confetti, sparkles, and fireworks
- 📱 **Mobile Friendly** - Touch-optimized with responsive design
- ⚡ **High Performance** - Optimized Three.js rendering
- 🔧 **Developer Friendly** - TypeScript types, clean API, modular design
- 🎯 **Production Ready** - Battle-tested components with error handling

## 📦 Components

### ThreeScratchCard
Full interactive scratch card with Three.js rendering and canvas masking.

**Features:**
- Real-time scratch detection
- Metallic/foil effects with configurable roughness
- Auto-reveal at threshold
- Progress tracking
- Reset functionality
- Custom callbacks

### ThreeScratchCardPreview
Lightweight, non-interactive preview for the editor.

**Features:**
- Live updates as settings change
- Visual indicators for configuration
- No Three.js overhead
- Fast rendering

### ScratchCardEditor
Comprehensive configuration panel with tabbed interface.

**Features:**
- Image upload and URL input
- Color picker with presets
- Sliders for all numeric values
- Toggle switches for boolean options
- Dropdown selectors for animations/effects
- Live preview integration

## 🚀 Quick Start

```tsx
import {
  ThreeScratchCard,
  ScratchCardEditor,
  DEFAULT_SCRATCH_CARD_CONFIG,
} from '@/components/scratch-card-compo';

// In your component
const [config, setConfig] = useState(DEFAULT_SCRATCH_CARD_CONFIG);

// Render
<ThreeScratchCard
  config={config}
  width={600}
  height={400}
  className="shadow-2xl"
/>
```

## 📁 File Structure

```
/components/scratch-card-compo/
├── index.ts                      # Main exports
├── types.ts                      # TypeScript interfaces
├── scratchCardConfig.ts          # Default configuration
├── utils.ts                      # Helper functions
├── ThreeScratchCard.tsx          # Interactive component
├── ThreeScratchCardPreview.tsx   # Preview component
├── ScratchCardEditor.tsx         # Configuration panel
├── README.md                     # This file
└── INTEGRATION_GUIDE.md          # Detailed integration guide
```

## 🎨 Configuration Options

```typescript
interface ScratchCardOptions {
  // Images
  prizeImage: string;
  coverImage?: string;
  coverColor: string;

  // Behavior
  brushSize: number;              // 10-100
  revealThreshold: number;        // 30-100

  // Visual
  foilRoughness: number;          // 0-1
  metalness: number;              // 0-1
  shine: boolean;

  // Animation
  revealAnimation: 'fade' | 'scale' | 'slide' | 'bounce' | 'none';
  revealEffect: 'confetti' | 'sparkles' | 'fireworks' | 'none';

  // UI
  showPercent: boolean;
  resetButton: boolean;

  // Callbacks
  onReveal?: () => void;
  onScratchProgress?: (percent: number) => void;
}
```

## 🎯 Use Cases

1. **Contest Platforms** - Reveal prizes in contests
2. **Promotional Campaigns** - Interactive marketing materials
3. **Gaming** - Lottery-style reveals
4. **E-commerce** - Discount code reveals
5. **Events** - Virtual scratch cards for giveaways

## 🔧 Dependencies

```json
{
  "three": "^0.150.0",
  "@types/three": "^0.150.0"
}
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎭 Animation Examples

### Fade Animation
Smooth opacity transition from 0 to 1.

### Scale Animation
Prize scales up from 80% to 100% with opacity fade.

### Slide Animation
Prize slides up from below with fade effect.

### Bounce Animation
Prize bounces in with elastic easing.

## 🎉 Effect Examples

### Confetti
50 colorful particles fall from top with rotation.

### Sparkles
30 sparkle emojis appear and fade across the screen.

### Fireworks
Multiple bursts of colored particles from center points.

## 🛠️ Customization

### Custom Colors
```tsx
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  coverColor: '#FF6B6B', // Custom red
};
```

### Custom Callbacks
```tsx
const config = {
  ...DEFAULT_SCRATCH_CARD_CONFIG,
  onReveal: () => {
    console.log('Revealed!');
    playSound('/win.mp3');
  },
  onScratchProgress: (percent) => {
    console.log(`Progress: ${percent}%`);
  },
};
```

### Custom Dimensions
```tsx
<ThreeScratchCard
  config={config}
  width={800}
  height={600}
/>
```

## 📊 Performance Tips

1. **Optimize Images** - Use WebP format, compress to <500KB
2. **Reduce Canvas Size** - Use smaller dimensions on mobile
3. **Disable Shine** - On low-end devices for better FPS
4. **Debounce Callbacks** - Avoid excessive callback invocations
5. **Lazy Load** - Load Three.js only when needed

## 🐛 Common Issues

### Images Not Loading
- Check CORS settings for external images
- Use data URLs for uploaded files
- Verify image paths

### Touch Not Working
- Ensure `touch-action: none` is set
- Check for event listener conflicts
- Test on real devices

### Performance Issues
- Reduce metalness/roughness values
- Lower canvas resolution
- Disable shine effect

## 📚 Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md) - Detailed integration examples
- [API Reference](./types.ts) - TypeScript interfaces and types
- [Configuration](./scratchCardConfig.ts) - Default values and ranges

## 🤝 Contributing

When extending this system:

1. Follow existing TypeScript patterns
2. Maintain backward compatibility
3. Add tests for new features
4. Update documentation
5. Use semantic versioning

## 📝 Examples

See `INTEGRATION_GUIDE.md` for comprehensive examples including:
- Create Contest integration
- Contest View integration
- Mobile responsive implementation
- Custom callbacks and analytics
- Database schema examples

## 🎓 Best Practices

1. **Always provide prize image** - Required for component to work
2. **Set reasonable thresholds** - 60-80% for best UX
3. **Use subtle animations** - Fade/scale for professional look
4. **Test on mobile** - Touch interactions differ from mouse
5. **Optimize images** - Keep file sizes small for fast loading

## 📄 License

Part of the contest platform project.

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Three.js**
