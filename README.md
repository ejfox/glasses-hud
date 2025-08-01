# Glasses HUD Prototype

AR glasses data visualization prototype built with Nuxt 3 + Vue.

## Setup

```bash
npm install
npm run dev
```

## Structure

- `components/GlassesHUD.vue` - Main dual-lens canvas component
- `pages/index.vue` - Example implementation with time display
- Dual canvas setup for left/right eye visualizations
- Slot-based architecture for custom overlays

## Development

The glasses frame simulation uses two circular lens areas with canvas backing for complex visualizations and slot overlays for simpler UI elements.

Start prototyping your ambient data visualizations!