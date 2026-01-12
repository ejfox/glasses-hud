# Glasses HUD Prototyping Tool

A React-based simulator for prototyping AR glasses heads-up displays. Design and preview widget layouts for smart glasses interfaces with realistic, smoothly-animated sensor data.

**Live Demo:** https://ejfox.github.io/glasses-hud/

## Why This Exists

Designing interfaces for AR glasses is hard without the actual hardware. This tool lets you:

- **Prototype layouts** - Place widgets on left/right lenses in 9 positions
- **See realistic data** - Sensor values animate smoothly, not randomly
- **Test on mobile** - Collapsible controls for fullscreen preview on phones/tablets
- **Iterate quickly** - No build step needed for layout changes

## Features

### 55+ Widget Types

Organized into 13 categories that mirror real smartwatch/glasses capabilities:

| Category | Widgets |
|----------|---------|
| **Body** | Heart Rate, HRV, Blood Oxygen (SpO2), Stress Level, Calories, Body Temp |
| **Motion** | Steps, Distance, Speed, Pace, Floors Climbed, Cadence |
| **Location** | Compass/Bearing, Altitude, Coordinates, GPS Accuracy |
| **Environment** | Temperature, Humidity, Pressure, UV Index, Air Quality, Light Level, Noise Level |
| **Device** | Watch Battery, Phone Battery, Signal Strength, WiFi, Storage |
| **Time** | Clock, Date, Stopwatch, Timer, Sunrise, Sunset |
| **Messages** | Unread Messages, Emails, Missed Calls, Slack Unread, All Notifications |
| **Productivity** | Todo Count, Next Todo, Focus Time, Screen Time, Meeting Countdown, Pomodoro Timer |
| **Media** | Now Playing, Artist, Song BPM, Song Progress, Volume |
| **Social** | Followers, New Likes, Mentions |
| **Weather** | Current Weather, Feels Like, Rain Chance, Wind Speed, Visibility |
| **Navigation** | Distance to Destination, ETA, Next Turn Direction |
| **Custom** | Custom Text, Labels |

### Realistic Data Simulation

Values don't just random-walk. The simulator uses:

- **Fractal Brownian Motion (FBM)** - Multi-octave noise for organic, smooth transitions
- **Correlated sensors** - Walking increases heart rate, speed, cadence simultaneously
- **Activity states** - Simulated walking/resting cycles affect multiple readings
- **Temporal patterns** - Some values (UV, meetings) follow time-of-day patterns

### Mobile-Friendly Viewing

- Collapsible control panel for fullscreen HUD preview
- Larger text on mobile devices
- Dark theme optimized for viewing the display
- Touch-friendly controls

## Getting Started

```bash
# Clone
git clone https://github.com/ejfox/glasses-hud.git
cd glasses-hud

# Install
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

## Usage

1. **Drag** a widget from the bento grid palette
2. **Drop** onto left or right lens (ghost preview shows position)
3. **Drag placed widgets** to reposition (snaps to 5% grid with anime.js)
4. **Hover + ×** to delete widgets
5. **Show Grid** reveals Swiss-style alignment guides
6. **Hide Controls** for fullscreen preview

## Adding New Widgets

To add a new widget type:

### 1. Add to `WIDGET_CATEGORIES`

```jsx
{
  label: '— Your Category —',
  widgets: [
    { value: 'yourWidget', label: 'Your Widget' },
  ]
}
```

### 2. Add sensor data (if needed)

In the `setSensors()` call inside `useEffect`:

```jsx
setSensors({
  // ... existing sensors
  yourValue: n.main.range(t, min, max, speed),
})
```

### 3. Add display handler

In the `getValue()` switch statement:

```jsx
case 'yourWidget': return `${s.yourValue} units`
```

## Technical Details

### Noise Generation

The `SmoothNoise` class generates FBM (Fractal Brownian Motion) noise:

```jsx
const noise = new SmoothNoise(seed)
// Get value between min-max, animated over time
const value = noise.range(time, min, max, speed)
```

- `seed` - Different seeds = different patterns
- `time` - Usually `performance.now() / 1000`
- `speed` - How fast the value changes (0.1 = slow drift, 2 = rapid variation)

### Walking Simulation

The app simulates activity cycles:

```jsx
const walkCycle = noise.range(t * 0.1, 0, 1, 0.5)
if (walkCycle > 0.7) isWalking = true  // ~30% of time walking
```

When walking:
- Heart rate increases from ~68 to ~95 BPM
- Speed jumps from ~0 to 3.5-5.5 km/h
- Cadence activates (~110 spm)
- Steps and calories accumulate

### Positions

9 widget positions available:

| Code | Position |
|------|----------|
| `tl` | Top Left |
| `tc` | Top Center |
| `tr` | Top Right |
| `ml` | Middle Left |
| `c` | Center |
| `mr` | Middle Right |
| `bl` | Bottom Left |
| `bc` | Bottom Center |
| `br` | Bottom Right |

## Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library (Button, Input)
- **@dnd-kit** - Drag and drop from palette to lens
- **anime.js** - Smooth grid-snap animations

## License

MIT
