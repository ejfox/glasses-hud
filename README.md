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
2. **Choose Widget Type**: Text, decibel meter, or D3-powered visualizations
3. **Pick Position**: Top-left, top-right, bottom-left, bottom-right, or center
4. **Add Content**: Type text or add visual widgets
5. **Prototype**: See how it looks in the glasses display

## Widget Types

- **Text**: Simple monospace text labels
- **Decibel Meter**: 64x4px animated bar chart with real-time oscillation
- **Sparkline**: D3-powered line chart for time-series data (80x30px)
- **Bar Chart**: D3-powered bar chart showing last 10 data points (80x40px)
- **Area Chart**: D3-powered filled area chart for trend visualization (80x30px)

## Architecture

- Single `pages/index.vue` file with inline styles
- D3.js integration for advanced data visualizations
- No complex components or abstractions
- Real-time oscillators for dynamic visual widgets
- Simple dropdown controls for rapid prototyping

Perfect for testing ideas like:
- Notification displays
- Biometric readouts
- Audio level meters
- Status indicators
- Ambient data visualization
- Time-series data trends
- Real-time metrics dashboards

Keep it simple. Prototype fast.