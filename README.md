# AR Glasses HUD Prototyper

Simple prototyping tool for AR glasses data visualizations. Built with Nuxt 3 + Vue.

## Goal

Quickly prototype ambient data displays and widgets for AR glasses. Test different positions, content types, and visual elements before building real implementations.

## Setup

```bash
npm install
npm run dev
```

## Usage

1. **Select Eye**: Choose left or right lens
2. **Choose Widget Type**: Text or animated decibel meter
3. **Pick Position**: 
   - Use preset positions (top-left, top-right, bottom-left, bottom-right, center) for quick prototyping
   - Or select "CUSTOM (X/Y)" for fine-grained pixel-level control with X/Y coordinates
4. **Add Content**: Type text or add visual widgets
5. **Prototype**: See how it looks in the glasses display

## Widget Types

- **Text**: Simple monospace text labels
- **Decibel Meter**: 64x4px animated bar chart with real-time oscillation

## Architecture

- Single `pages/index.vue` file with inline styles
- No complex components or abstractions
- Real-time oscillators for dynamic visual widgets
- Simple dropdown controls for rapid prototyping

Perfect for testing ideas like:
- Notification displays
- Biometric readouts
- Audio level meters
- Status indicators
- Ambient data visualization

Keep it simple. Prototype fast.