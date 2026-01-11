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
2. **Choose Widget Type**: Text, sensor data, or animated meters
3. **Pick Position**: Top-left, top-right, bottom-left, bottom-right, or center
4. **Add Content**: Type text or add sensor widgets
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

### Visual Meters
- **Decibel Meter**: 64x4px animated bar chart showing ambient noise (30-90 dB)

## Architecture

- Single `pages/index.vue` file with inline styles
- No complex components or abstractions
- Perlin noise implementation for smooth sensor data transitions
- Real-time data updates using requestAnimationFrame
- Simple dropdown controls for rapid prototyping

Perfect for testing ideas like:
- Navigation displays (bearing, altitude)
- Biometric readouts (heart rate, steps)
- Environmental sensors (temperature, brightness, noise)
- Motion tracking (yaw, pitch, roll)
- Status indicators
- Ambient data visualization

Keep it simple. Prototype fast.