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
2. **Choose Widget Type**: Text, sensor data, D3 visualizations, or animated meters
3. **Pick Position**: 
   - Use preset positions (top-left, top-right, bottom-left, bottom-right, center) for quick prototyping
   - Or select "CUSTOM (X/Y)" for fine-grained pixel-level control with X/Y coordinates
4. **Add Content**: Type text or add sensor/visual widgets
5. **Prototype**: See how it looks in the glasses display

## Widget Types

### Static Widgets
- **Text**: Simple monospace text labels

### Realtime Sensor Data
All sensor data uses Perlin noise for smooth, realistic transitions:
- **Bearing**: Magnetic north bearing (0-359°)
- **Yaw**: Head rotation around vertical axis (-180 to 180°)
- **Pitch**: Head tilt up/down (-90 to 90°)
- **Roll**: Head tilt side-to-side (-180 to 180°)
- **Heart Rate**: Simulated heart rate (60-100 BPM)
- **Steps**: Incrementing step counter
- **Temperature**: Ambient temperature (18-25°C)
- **Brightness**: Ambient light level (0-100%)
- **Altitude**: Elevation in meters (0-500m)

### D3-Powered Visualizations
Time-series data visualizations with real-time updates:
- **Sparkline**: 80x30px smooth line chart for trends
- **Bar Chart**: 80x40px bar chart showing last 10 data points
- **Area Chart**: 80x30px filled area chart for trend visualization

### Visual Meters
- **Decibel Meter**: 64x4px animated bar chart showing ambient noise (30-90 dB)

## Positioning

Widgets can be positioned using two methods:

### Preset Positions
Quick placement options:
- Top Left
- Top Right
- Bottom Left
- Bottom Right
- Center

### Custom X/Y Coordinates
For precise control, select "CUSTOM (X/Y)" and specify exact pixel coordinates:
- X Position: 0-300px (horizontal placement within lens)
- Y Position: 0-200px (vertical placement within lens)
- Coordinates are automatically clamped to valid ranges

## Architecture

- Single `pages/index.vue` file with inline styles
- D3.js integration for advanced data visualizations
- Perlin noise implementation for smooth sensor data transitions
- Real-time data updates using requestAnimationFrame
- Fine-grained positioning with pixel-level control
- No complex components or abstractions
- Simple dropdown controls for rapid prototyping

Perfect for testing ideas like:
- Navigation displays (bearing, altitude)
- Biometric readouts (heart rate, steps)
- Environmental sensors (temperature, brightness, noise)
- Motion tracking (yaw, pitch, roll)
- Time-series data trends and sparklines
- Real-time metrics dashboards
- Status indicators
- Ambient data visualization
- Precise widget positioning and layouts

Keep it simple. Prototype fast.
