import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Simplex-inspired noise for smooth random values
class SmoothNoise {
  constructor() {
    this.octaves = 4
    this.persistence = 0.5
    this.lacunarity = 2
    this.scale = 0.02
    // Pre-generate random gradients
    this.gradients = Array.from({ length: 256 }, () => Math.random() * 2 - 1)
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(a, b, t) {
    return a + t * (b - a)
  }

  noise1D(x) {
    const x0 = Math.floor(x) & 255
    const x1 = (x0 + 1) & 255
    const dx = x - Math.floor(x)

    const g0 = this.gradients[x0]
    const g1 = this.gradients[x1]

    const n0 = g0 * dx
    const n1 = g1 * (dx - 1)

    return this.lerp(n0, n1, this.fade(dx))
  }

  // Fractal Brownian Motion for more natural variation
  fbm(x) {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0

    for (let i = 0; i < this.octaves; i++) {
      value += this.noise1D(x * frequency * this.scale) * amplitude
      maxValue += amplitude
      amplitude *= this.persistence
      frequency *= this.lacunarity
    }

    return value / maxValue
  }

  // Get value between min and max
  range(time, min, max, speed = 1) {
    const n = (this.fbm(time * speed) + 1) / 2 // normalize to 0-1
    return min + n * (max - min)
  }
}

const WIDGET_TYPES = [
  { value: 'bearing', label: 'Bearing' },
  { value: 'heartRate', label: 'Heart Rate' },
  { value: 'steps', label: 'Steps' },
  { value: 'temp', label: 'Temperature' },
  { value: 'altitude', label: 'Altitude' },
  { value: 'speed', label: 'Speed' },
  { value: 'time', label: 'Time' },
  { value: 'text', label: 'Text' },
]

const POSITIONS = [
  { value: 'tl', label: 'Top Left' },
  { value: 'tr', label: 'Top Right' },
  { value: 'bl', label: 'Bottom Left' },
  { value: 'br', label: 'Bottom Right' },
  { value: 'c', label: 'Center' },
]

function getPositionClasses(pos) {
  switch (pos) {
    case 'tl': return 'top-2 left-2'
    case 'tr': return 'top-2 right-2'
    case 'bl': return 'bottom-2 left-2'
    case 'br': return 'bottom-2 right-2'
    case 'c': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    default: return 'top-2 left-2'
  }
}

function App() {
  const [leftWidgets, setLeftWidgets] = useState([])
  const [rightWidgets, setRightWidgets] = useState([])
  const [eye, setEye] = useState('left')
  const [widgetType, setWidgetType] = useState('bearing')
  const [position, setPosition] = useState('tl')
  const [text, setText] = useState('')
  const [sensors, setSensors] = useState({
    bearing: 127,
    heartRate: 72,
    steps: 4521,
    temp: 21.5,
    altitude: 142,
    speed: 0,
  })

  const noiseRef = useRef(null)
  const timeRef = useRef(0)
  const stepsRef = useRef(4521)
  const lastStepTime = useRef(0)
  const isWalking = useRef(false)
  const walkStartTime = useRef(0)

  // Initialize noise generator
  useEffect(() => {
    noiseRef.current = new SmoothNoise()
  }, [])

  // Smooth sensor updates with requestAnimationFrame
  useEffect(() => {
    let animationId
    const startTime = performance.now()

    function updateSensors(currentTime) {
      if (!noiseRef.current) {
        animationId = requestAnimationFrame(updateSensors)
        return
      }

      const noise = noiseRef.current
      const elapsed = (currentTime - startTime) / 1000 // seconds
      timeRef.current = elapsed

      // Simulate walking patterns - occasional bursts of activity
      const walkCycle = noise.range(elapsed * 0.1, 0, 1, 0.5)
      if (walkCycle > 0.7 && !isWalking.current) {
        isWalking.current = true
        walkStartTime.current = elapsed
      } else if (walkCycle < 0.3) {
        isWalking.current = false
      }

      // Steps: increment during walking periods
      if (isWalking.current && elapsed - lastStepTime.current > 0.5) {
        // ~2 steps per second when walking
        const stepVariation = noise.range(elapsed * 10, 0.8, 1.2, 2)
        stepsRef.current += Math.round(stepVariation)
        lastStepTime.current = elapsed
      }

      // Calculate speed based on walking state
      const baseSpeed = isWalking.current
        ? noise.range(elapsed, 3.5, 5.5, 0.8) // walking: 3.5-5.5 km/h
        : noise.range(elapsed, 0, 0.3, 0.2)   // standing: nearly 0

      setSensors({
        // Bearing: slow drift like compass settling, with occasional direction changes
        bearing: Math.round(noise.range(elapsed, 0, 360, 0.15) +
                          Math.sin(elapsed * 0.3) * 15), // subtle oscillation

        // Heart rate: base rate with exertion and natural variation
        heartRate: Math.round(
          (isWalking.current ? 95 : 68) + // base rate
          noise.range(elapsed + 100, -8, 8, 0.4) + // slow variation
          noise.range(elapsed * 3 + 200, -3, 3, 1.5) // quick micro-variations
        ),

        // Steps: accumulated from walking simulation
        steps: stepsRef.current,

        // Temperature: very stable with tiny drift
        temp: (21.5 + noise.range(elapsed + 300, -0.8, 0.8, 0.05)).toFixed(1),

        // Altitude: gradual changes like walking on varied terrain
        altitude: Math.round(142 + noise.range(elapsed + 400, -20, 20, 0.08)),

        // Speed: based on walking state
        speed: baseSpeed.toFixed(1),
      })

      animationId = requestAnimationFrame(updateSensors)
    }

    animationId = requestAnimationFrame(updateSensors)
    return () => cancelAnimationFrame(animationId)
  }, [])

  function getValue(type, widgetText) {
    switch (type) {
      case 'bearing':
        const b = ((sensors.bearing % 360) + 360) % 360
        const dir = b >= 337.5 || b < 22.5 ? 'N' :
                   b >= 22.5 && b < 67.5 ? 'NE' :
                   b >= 67.5 && b < 112.5 ? 'E' :
                   b >= 112.5 && b < 157.5 ? 'SE' :
                   b >= 157.5 && b < 202.5 ? 'S' :
                   b >= 202.5 && b < 247.5 ? 'SW' :
                   b >= 247.5 && b < 292.5 ? 'W' : 'NW'
        return `${Math.round(b)}° ${dir}`
      case 'heartRate': return `${sensors.heartRate} BPM`
      case 'steps': return `${sensors.steps.toLocaleString()}`
      case 'temp': return `${sensors.temp}°C`
      case 'altitude': return `${sensors.altitude}m`
      case 'speed': return `${sensors.speed} km/h`
      case 'time': return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      case 'text': return widgetText || 'TEXT'
      default: return type
    }
  }

  function addWidget() {
    const widget = {
      id: Date.now(),
      type: widgetType,
      position,
      text,
    }

    if (eye === 'left') {
      setLeftWidgets(prev => [...prev, widget])
    } else {
      setRightWidgets(prev => [...prev, widget])
    }
    setText('')
  }

  function clearAll() {
    setLeftWidgets([])
    setRightWidgets([])
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Glasses Display */}
      <div className="bg-black p-8 flex justify-center items-center gap-3">
        {/* Left Lens */}
        <div className="w-[42vw] max-w-[300px] aspect-[3/2] border-2 border-zinc-700 rounded-2xl relative overflow-hidden">
          {leftWidgets.map(w => (
            <div
              key={w.id}
              className={`absolute text-white text-xs font-mono tracking-wide ${getPositionClasses(w.position)}`}
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.3)' }}
            >
              {getValue(w.type, w.text)}
            </div>
          ))}
        </div>

        {/* Bridge */}
        <div className="w-3 h-1.5 bg-zinc-700 -mt-12" />

        {/* Right Lens */}
        <div className="w-[42vw] max-w-[300px] aspect-[3/2] border-2 border-zinc-700 rounded-2xl relative overflow-hidden">
          {rightWidgets.map(w => (
            <div
              key={w.id}
              className={`absolute text-white text-xs font-mono tracking-wide ${getPositionClasses(w.position)}`}
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.3)' }}
            >
              {getValue(w.type, w.text)}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 bg-white p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Eye</label>
              <Select value={eye} onValueChange={setEye}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Widget</label>
              <Select value={widgetType} onValueChange={setWidgetType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Position</label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500">Text (optional)</label>
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text..."
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <Button onClick={addWidget} size="lg">
              Add Widget
            </Button>
            <Button onClick={clearAll} variant="secondary" size="lg">
              Clear All
            </Button>
            <span className="text-sm text-zinc-500 font-mono">
              L: {leftWidgets.length} | R: {rightWidgets.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
