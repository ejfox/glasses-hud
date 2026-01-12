import { useState, useEffect, useRef, useCallback } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core'
import { animate } from 'animejs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Simplex-inspired noise for smooth random values
class SmoothNoise {
  constructor(seed = Math.random() * 10000) {
    this.seed = seed
    this.octaves = 4
    this.persistence = 0.5
    this.lacunarity = 2
    this.scale = 0.02
    this.gradients = Array.from({ length: 256 }, (_, i) =>
      Math.sin(seed + i * 0.1) * 2 - 1
    )
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
  lerp(a, b, t) { return a + t * (b - a) }

  noise1D(x) {
    const x0 = Math.floor(x) & 255
    const x1 = (x0 + 1) & 255
    const dx = x - Math.floor(x)
    return this.lerp(
      this.gradients[x0] * dx,
      this.gradients[x1] * (dx - 1),
      this.fade(dx)
    )
  }

  fbm(x) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0
    for (let i = 0; i < this.octaves; i++) {
      value += this.noise1D(x * frequency * this.scale) * amplitude
      maxValue += amplitude
      amplitude *= this.persistence
      frequency *= this.lacunarity
    }
    return value / maxValue
  }

  range(time, min, max, speed = 1) {
    return min + ((this.fbm(time * speed) + 1) / 2) * (max - min)
  }
}

// Widget categories for organization
const WIDGET_CATEGORIES = [
  {
    label: '— Body —',
    widgets: [
      { value: 'heartRate', label: 'Heart Rate' },
      { value: 'hrv', label: 'HRV' },
      { value: 'spo2', label: 'Blood Oxygen' },
      { value: 'stress', label: 'Stress Level' },
      { value: 'calories', label: 'Calories' },
      { value: 'bodyTemp', label: 'Body Temp' },
    ]
  },
  {
    label: '— Motion —',
    widgets: [
      { value: 'steps', label: 'Steps' },
      { value: 'distance', label: 'Distance' },
      { value: 'speed', label: 'Speed' },
      { value: 'pace', label: 'Pace' },
      { value: 'floors', label: 'Floors Climbed' },
      { value: 'cadence', label: 'Cadence' },
    ]
  },
  {
    label: '— Location —',
    widgets: [
      { value: 'bearing', label: 'Compass' },
      { value: 'altitude', label: 'Altitude' },
      { value: 'coords', label: 'Coordinates' },
      { value: 'gpsAccuracy', label: 'GPS Accuracy' },
    ]
  },
  {
    label: '— Environment —',
    widgets: [
      { value: 'temp', label: 'Temperature' },
      { value: 'humidity', label: 'Humidity' },
      { value: 'pressure', label: 'Pressure' },
      { value: 'uv', label: 'UV Index' },
      { value: 'aqi', label: 'Air Quality' },
      { value: 'light', label: 'Light Level' },
      { value: 'noise', label: 'Noise Level' },
    ]
  },
  {
    label: '— Device —',
    widgets: [
      { value: 'battery', label: 'Battery' },
      { value: 'phoneBattery', label: 'Phone Battery' },
      { value: 'signal', label: 'Signal' },
      { value: 'wifi', label: 'WiFi' },
      { value: 'storage', label: 'Storage' },
    ]
  },
  {
    label: '— Time —',
    widgets: [
      { value: 'time', label: 'Time' },
      { value: 'date', label: 'Date' },
      { value: 'stopwatch', label: 'Stopwatch' },
      { value: 'timer', label: 'Timer' },
      { value: 'sunrise', label: 'Sunrise' },
      { value: 'sunset', label: 'Sunset' },
    ]
  },
  {
    label: '— Messages —',
    widgets: [
      { value: 'unreadMessages', label: 'Unread Messages' },
      { value: 'unreadEmails', label: 'Unread Emails' },
      { value: 'missedCalls', label: 'Missed Calls' },
      { value: 'slackUnread', label: 'Slack Unread' },
      { value: 'notifications', label: 'All Notifications' },
    ]
  },
  {
    label: '— Productivity —',
    widgets: [
      { value: 'todoCount', label: 'Todo Count' },
      { value: 'todoNext', label: 'Next Todo' },
      { value: 'focusTime', label: 'Focus Time' },
      { value: 'screenTime', label: 'Screen Time' },
      { value: 'meetingIn', label: 'Meeting In...' },
      { value: 'nextEvent', label: 'Next Event' },
      { value: 'pomodoroTimer', label: 'Pomodoro' },
    ]
  },
  {
    label: '— Media —',
    widgets: [
      { value: 'nowPlaying', label: 'Now Playing' },
      { value: 'songArtist', label: 'Artist' },
      { value: 'songBpm', label: 'Song BPM' },
      { value: 'songProgress', label: 'Song Progress' },
      { value: 'volume', label: 'Volume' },
    ]
  },
  {
    label: '— Social —',
    widgets: [
      { value: 'followers', label: 'Followers' },
      { value: 'likes', label: 'New Likes' },
      { value: 'mentions', label: 'Mentions' },
    ]
  },
  {
    label: '— Weather —',
    widgets: [
      { value: 'weather', label: 'Weather' },
      { value: 'feelsLike', label: 'Feels Like' },
      { value: 'rainChance', label: 'Rain Chance' },
      { value: 'wind', label: 'Wind' },
      { value: 'visibility', label: 'Visibility' },
    ]
  },
  {
    label: '— Navigation —',
    widgets: [
      { value: 'navDistance', label: 'Nav Distance' },
      { value: 'navEta', label: 'Nav ETA' },
      { value: 'navDirection', label: 'Nav Turn' },
    ]
  },
  {
    label: '— Custom —',
    widgets: [
      { value: 'text', label: 'Custom Text' },
      { value: 'label', label: 'Label' },
    ]
  },
]

// Grid snapping - 5% increments for finer control, Swiss precision
const GRID_SIZE = 5
const GRID_PADDING = 8 // ~8% margin from edges
const snapToGrid = (value) => {
  const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE
  return Math.max(GRID_PADDING, Math.min(100 - GRID_PADDING, snapped))
}

// Simulated song titles with BPM
const SONGS = [
  { title: 'Midnight City', artist: 'M83', bpm: 105 },
  { title: 'Starboy', artist: 'The Weeknd', bpm: 186 },
  { title: 'Blinding Lights', artist: 'The Weeknd', bpm: 171 },
  { title: 'Take On Me', artist: 'a-ha', bpm: 169 },
  { title: 'Electric Feel', artist: 'MGMT', bpm: 116 },
  { title: 'Get Lucky', artist: 'Daft Punk', bpm: 116 },
  { title: 'Uptown Funk', artist: 'Bruno Mars', bpm: 115 },
  { title: 'Bohemian Rhapsody', artist: 'Queen', bpm: 72 },
]

// Simulated calendar events
const EVENTS = [
  { title: 'Team Standup', time: '10:00 AM' },
  { title: 'Lunch with Alex', time: '12:30 PM' },
  { title: 'Design Review', time: '2:00 PM' },
  { title: 'Gym', time: '6:00 PM' },
]

// Draggable widget card from palette
function DraggableCard({ type, label, preview, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true }
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(type)}
      className={`group relative rounded-lg p-2 text-left transition-all touch-none ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected
          ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2'
          : 'bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <div className={`font-mono text-xs truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
        {preview}
      </div>
      <div className={`text-[11px] font-medium truncate mt-0.5 ${isSelected ? 'text-white' : 'text-zinc-700'}`}>
        {label}
      </div>
    </button>
  )
}

// Droppable lens area
function DroppableLens({ eye, isOver, lensRef, children }) {
  const { setNodeRef } = useDroppable({ id: `lens-${eye}` })

  // Combine refs
  const combinedRef = (node) => {
    setNodeRef(node)
    if (lensRef) lensRef.current = node
  }

  return (
    <div
      ref={combinedRef}
      className={`w-[44vw] sm:w-[42vw] max-w-[320px] aspect-[3/2] border-2 rounded-2xl relative overflow-hidden transition-all ${
        isOver ? 'border-white bg-zinc-800/50 scale-105' : 'border-zinc-700'
      }`}
    >
      {children}
    </div>
  )
}

// Draggable widget on lens - uses anime.js for smooth grid snapping
function DraggableLensWidget({ widget, onMove, onRemove, getValue }) {
  const ref = useRef(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startWidget = useRef({ x: 0, y: 0 })

  const handlePointerDown = useCallback((e) => {
    if (e.target.closest('button')) return // Don't drag if clicking delete button
    e.preventDefault()
    e.stopPropagation()
    isDragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY }
    startWidget.current = { x: widget.x, y: widget.y }
    ref.current?.setPointerCapture(e.pointerId)
    ref.current.style.zIndex = '50'
    ref.current.style.cursor = 'grabbing'
  }, [widget.x, widget.y])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || !ref.current) return
    const parent = ref.current.parentElement
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    const deltaX = ((e.clientX - startPos.current.x) / rect.width) * 100
    const deltaY = ((e.clientY - startPos.current.y) / rect.height) * 100

    const newX = Math.max(8, Math.min(92, startWidget.current.x + deltaX))
    const newY = Math.max(8, Math.min(92, startWidget.current.y + deltaY))

    // Live position update (no snapping during drag)
    ref.current.style.left = `${newX}%`
    ref.current.style.top = `${newY}%`
  }, [])

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current || !ref.current) return
    isDragging.current = false
    ref.current?.releasePointerCapture(e.pointerId)
    ref.current.style.zIndex = ''
    ref.current.style.cursor = ''

    const parent = ref.current.parentElement
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    const deltaX = ((e.clientX - startPos.current.x) / rect.width) * 100
    const deltaY = ((e.clientY - startPos.current.y) / rect.height) * 100

    const rawX = startWidget.current.x + deltaX
    const rawY = startWidget.current.y + deltaY

    // Snap to 5% grid with 8% margin
    const snappedX = Math.max(8, Math.min(92, Math.round(rawX / 5) * 5))
    const snappedY = Math.max(8, Math.min(92, Math.round(rawY / 5) * 5))

    // Animate to snapped position with anime.js
    animate(ref.current, {
      left: `${snappedX}%`,
      top: `${snappedY}%`,
      duration: 150,
      ease: 'outBack',
      onComplete: () => {
        onMove(widget.id, snappedX, snappedY)
      }
    })
  }, [widget.id, onMove])

  return (
    <div
      ref={ref}
      className="absolute text-white text-sm sm:text-xs font-mono tracking-wide select-none group cursor-grab touch-none"
      style={{
        left: `${widget.x}%`,
        top: `${widget.y}%`,
        transform: 'translate(-50%, -50%)',
        textShadow: '0 0 10px rgba(255,255,255,0.4)'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {getValue(widget.type, widget.text)}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(widget.id) }}
        className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center leading-none"
      >
        ×
      </button>
    </div>
  )
}

function App() {
  const [leftWidgets, setLeftWidgets] = useState([])
  const [rightWidgets, setRightWidgets] = useState([])
  const [selectedType, setSelectedType] = useState('heartRate')
  const [text, setText] = useState('')
  const [sensors, setSensors] = useState({})
  const [showControls, setShowControls] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [overLens, setOverLens] = useState(null)
  const [dropCoords, setDropCoords] = useState({ x: 50, y: 50 }) // Track where to drop
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 }) // Track actual pointer
  const leftLensRef = useRef(null)
  const rightLensRef = useRef(null)

  const noiseRef = useRef({})
  const stepsRef = useRef(4521)
  const caloriesRef = useRef(847)
  const floorsRef = useRef(3)
  const lastStepTime = useRef(0)
  const isWalking = useRef(false)
  const stopwatchStart = useRef(Date.now())
  const timerEnd = useRef(Date.now() + 25 * 60 * 1000) // 25 min timer
  const currentSong = useRef(0)
  const songChangeTime = useRef(0)

  // Initialize multiple noise generators for different signals
  useEffect(() => {
    noiseRef.current = {
      main: new SmoothNoise(1),
      hr: new SmoothNoise(2),
      hrv: new SmoothNoise(3),
      stress: new SmoothNoise(4),
      gps: new SmoothNoise(5),
      env: new SmoothNoise(6),
      device: new SmoothNoise(7),
    }
  }, [])

  useEffect(() => {
    let animationId
    const startTime = performance.now()

    function updateSensors(currentTime) {
      const n = noiseRef.current
      if (!n.main) {
        animationId = requestAnimationFrame(updateSensors)
        return
      }

      const t = (currentTime - startTime) / 1000

      // Walking simulation
      const walkCycle = n.main.range(t * 0.1, 0, 1, 0.5)
      if (walkCycle > 0.7 && !isWalking.current) isWalking.current = true
      else if (walkCycle < 0.3) isWalking.current = false

      // Steps & calories
      if (isWalking.current && t - lastStepTime.current > 0.5) {
        stepsRef.current += Math.round(n.main.range(t * 10, 0.8, 1.2, 2))
        caloriesRef.current += Math.round(n.main.range(t * 5, 0.3, 0.8, 1))
        if (Math.random() < 0.02) floorsRef.current += 1
        lastStepTime.current = t
      }

      // Song changes every ~3 minutes
      if (t - songChangeTime.current > 180) {
        currentSong.current = (currentSong.current + 1) % SONGS.length
        songChangeTime.current = t
      }

      const baseHR = isWalking.current ? 95 : 68
      const speed = isWalking.current ? n.main.range(t, 3.5, 5.5, 0.8) : n.main.range(t, 0, 0.3, 0.2)
      const distance = (stepsRef.current * 0.7) / 1000 // ~0.7m per step

      setSensors({
        // Body
        heartRate: Math.round(baseHR + n.hr.range(t + 100, -8, 8, 0.4) + n.hr.range(t * 3 + 200, -3, 3, 1.5)),
        hrv: Math.round(40 + n.hrv.range(t + 50, -15, 25, 0.2)),
        spo2: Math.round(96 + n.hr.range(t + 150, 0, 3, 0.1)),
        stress: Math.round(isWalking.current ? 35 : 25 + n.stress.range(t + 200, -10, 20, 0.15)),
        calories: caloriesRef.current,
        bodyTemp: (36.5 + n.hr.range(t + 300, -0.3, 0.5, 0.05)).toFixed(1),

        // Motion
        steps: stepsRef.current,
        distance: distance.toFixed(2),
        speed: speed.toFixed(1),
        pace: speed > 0.5 ? (60 / speed).toFixed(1) : '—',
        floors: floorsRef.current,
        cadence: isWalking.current ? Math.round(110 + n.main.range(t * 2, -10, 10, 1)) : 0,

        // Location
        bearing: Math.round(n.gps.range(t, 0, 360, 0.15) + Math.sin(t * 0.3) * 15),
        altitude: Math.round(142 + n.gps.range(t + 400, -20, 20, 0.08)),
        lat: (40.7128 + n.gps.range(t, -0.001, 0.001, 0.01)).toFixed(6),
        lon: (-74.0060 + n.gps.range(t + 500, -0.001, 0.001, 0.01)).toFixed(6),
        gpsAccuracy: Math.round(3 + n.gps.range(t + 600, 0, 12, 0.3)),

        // Environment
        temp: (21.5 + n.env.range(t + 300, -0.8, 0.8, 0.05)).toFixed(1),
        humidity: Math.round(55 + n.env.range(t + 350, -10, 15, 0.08)),
        pressure: Math.round(1013 + n.env.range(t + 400, -5, 5, 0.02)),
        uv: Math.round(n.env.range(t + 450, 2, 7, 0.05)),
        aqi: Math.round(35 + n.env.range(t + 500, -10, 30, 0.1)),
        light: Math.round(n.env.range(t + 550, 100, 10000, 0.2)),
        noise: Math.round(35 + n.env.range(t + 600, -5, 30, 0.5)),

        // Device
        battery: Math.max(10, Math.round(85 - t * 0.01 + n.device.range(t, -2, 2, 0.1))),
        phoneBattery: Math.max(5, Math.round(72 - t * 0.008 + n.device.range(t + 100, -2, 2, 0.1))),
        signal: Math.round(n.device.range(t + 200, 2, 4, 0.3)),
        wifiStrength: Math.round(n.device.range(t + 250, -70, -40, 0.2)),
        storage: 64 - Math.round(t * 0.001),

        // Navigation (simulated destination)
        navDistanceKm: Math.max(0, (2.4 - t * 0.005 + n.gps.range(t, -0.1, 0.1, 0.5))).toFixed(1),
        navEtaMin: Math.max(0, Math.round(18 - t * 0.03)),
        navTurn: t % 30 < 15 ? 'right' : 'left',
        navTurnDist: Math.round(50 + n.gps.range(t * 2, 0, 150, 1)),
      })

      animationId = requestAnimationFrame(updateSensors)
    }

    animationId = requestAnimationFrame(updateSensors)
    return () => cancelAnimationFrame(animationId)
  }, [])

  function getValue(type, widgetText) {
    const s = sensors
    const bearing = ((s.bearing % 360) + 360) % 360
    const dir = bearing >= 337.5 || bearing < 22.5 ? 'N' :
               bearing >= 22.5 && bearing < 67.5 ? 'NE' :
               bearing >= 67.5 && bearing < 112.5 ? 'E' :
               bearing >= 112.5 && bearing < 157.5 ? 'SE' :
               bearing >= 157.5 && bearing < 202.5 ? 'S' :
               bearing >= 202.5 && bearing < 247.5 ? 'SW' :
               bearing >= 247.5 && bearing < 292.5 ? 'W' : 'NW'

    const now = new Date()
    const stopwatchMs = now - stopwatchStart.current
    const timerMs = Math.max(0, timerEnd.current - now)
    const formatTime = (ms) => {
      const s = Math.floor(ms / 1000)
      const m = Math.floor(s / 60)
      return `${m}:${String(s % 60).padStart(2, '0')}`
    }

    const nextEvent = EVENTS[Math.floor(now.getHours() / 6) % EVENTS.length]
    const song = SONGS[currentSong.current]

    switch (type) {
      // Body
      case 'heartRate': return `${s.heartRate} BPM`
      case 'hrv': return `HRV ${s.hrv}ms`
      case 'spo2': return `SpO₂ ${s.spo2}%`
      case 'stress': return `Stress ${s.stress}`
      case 'calories': return `${s.calories} kcal`
      case 'bodyTemp': return `${s.bodyTemp}°C`

      // Motion
      case 'steps': return `${s.steps?.toLocaleString()}`
      case 'distance': return `${s.distance} km`
      case 'speed': return `${s.speed} km/h`
      case 'pace': return s.pace === '—' ? '—' : `${s.pace} min/km`
      case 'floors': return `${s.floors} floors`
      case 'cadence': return s.cadence > 0 ? `${s.cadence} spm` : '—'

      // Location
      case 'bearing': return `${Math.round(bearing)}° ${dir}`
      case 'altitude': return `${s.altitude}m`
      case 'coords': return `${s.lat}, ${s.lon}`
      case 'gpsAccuracy': return `±${s.gpsAccuracy}m`

      // Environment
      case 'temp': return `${s.temp}°C`
      case 'humidity': return `${s.humidity}%`
      case 'pressure': return `${s.pressure} hPa`
      case 'uv': return `UV ${s.uv}`
      case 'aqi': return `AQI ${s.aqi}`
      case 'light': return `${s.light} lux`
      case 'noise': return `${s.noise} dB`

      // Device
      case 'battery': return `⌚ ${s.battery}%`
      case 'phoneBattery': return `📱 ${s.phoneBattery}%`
      case 'signal': return '▂▄▆█'.slice(0, s.signal)
      case 'wifi': return `WiFi ${s.wifiStrength}dBm`
      case 'storage': return `${s.storage}GB free`

      // Time
      case 'time': return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      case 'date': return now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      case 'stopwatch': return formatTime(stopwatchMs)
      case 'timer': return timerMs > 0 ? formatTime(timerMs) : '0:00'
      case 'sunrise': return '6:42 AM'
      case 'sunset': return '7:38 PM'

      // Messages & Notifications
      case 'unreadMessages': return `${Math.floor(7 + Math.sin(now.getSeconds() * 0.05) * 4)} msgs`
      case 'unreadEmails': return `${Math.floor(23 + Math.sin(now.getSeconds() * 0.02) * 8)} emails`
      case 'missedCalls': return `${Math.floor(1 + Math.sin(now.getMinutes() * 0.5) * 1)} missed`
      case 'slackUnread': return `${Math.floor(12 + Math.sin(now.getSeconds() * 0.03) * 6)} slack`
      case 'notifications': return `${Math.floor(14 + Math.sin(now.getSeconds() * 0.04) * 5)} notifs`

      // Productivity
      case 'todoCount': return `${Math.floor(8 + Math.sin(now.getMinutes() * 0.2) * 3)} todos`
      case 'todoNext': {
        const todos = ['Review PR', 'Call mom', 'Ship feature', 'Write tests', 'Fix bug']
        return todos[Math.floor(now.getMinutes() / 12) % todos.length]
      }
      case 'focusTime': return `${Math.floor(now.getMinutes() + now.getSeconds() / 60)} min focus`
      case 'screenTime': return `${Math.floor(2 + now.getHours() * 0.3)}h ${Math.floor(now.getMinutes() / 2)}m`
      case 'meetingIn': {
        const mins = Math.floor(45 - (now.getMinutes() % 60))
        return mins > 0 ? `Meeting in ${mins}m` : 'Meeting now'
      }
      case 'nextEvent': return `${nextEvent.title} ${nextEvent.time}`
      case 'pomodoroTimer': {
        const pomodoroSecs = (25 * 60) - ((now.getMinutes() % 25) * 60 + now.getSeconds())
        return `🍅 ${Math.floor(pomodoroSecs / 60)}:${String(pomodoroSecs % 60).padStart(2, '0')}`
      }

      // Media
      case 'nowPlaying': return `♪ ${song.title}`
      case 'songArtist': return song.artist
      case 'songBpm': return `${song.bpm} BPM`
      case 'songProgress': {
        const progress = (now.getSeconds() + now.getMinutes() * 60) % 240
        const total = 240
        return `${Math.floor(progress / 60)}:${String(progress % 60).padStart(2, '0')} / ${Math.floor(total / 60)}:00`
      }
      case 'volume': return `🔊 ${Math.floor(65 + Math.sin(now.getMinutes() * 0.3) * 20)}%`

      // Social
      case 'followers': return `${(12847 + Math.floor(now.getMinutes())).toLocaleString()} followers`
      case 'likes': return `${Math.floor(34 + Math.sin(now.getSeconds() * 0.1) * 12)} new likes`
      case 'mentions': return `@${Math.floor(3 + Math.sin(now.getMinutes() * 0.2) * 2)} mentions`

      // Weather
      case 'weather': return `☀️ ${s.temp}°C`
      case 'feelsLike': return `Feels ${(parseFloat(s.temp) + 2.5).toFixed(1)}°C`
      case 'rainChance': return `🌧 ${Math.floor(15 + Math.sin(now.getHours() * 0.5) * 10)}%`
      case 'wind': return `💨 ${Math.floor(8 + Math.sin(now.getMinutes() * 0.1) * 5)} km/h`
      case 'visibility': return `${Math.floor(8 + Math.sin(now.getHours() * 0.2) * 4)} km vis`

      // Navigation
      case 'navDistance': return `${s.navDistanceKm} km`
      case 'navEta': return `ETA ${s.navEtaMin} min`
      case 'navDirection': return `${s.navTurn === 'right' ? '→' : '←'} ${s.navTurnDist}m`

      // Custom
      case 'text': return widgetText || 'TEXT'
      case 'label': return widgetText || 'LABEL'

      default: return type
    }
  }

  // Track pointer position globally during drag
  useEffect(() => {
    if (!activeId) return

    const handlePointer = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      setPointerPos({ x: clientX, y: clientY })

      // Calculate drop coords for whichever lens we're over
      const leftRect = leftLensRef.current?.getBoundingClientRect()
      const rightRect = rightLensRef.current?.getBoundingClientRect()

      let targetRect = null
      if (leftRect && clientX >= leftRect.left && clientX <= leftRect.right &&
          clientY >= leftRect.top && clientY <= leftRect.bottom) {
        targetRect = leftRect
      } else if (rightRect && clientX >= rightRect.left && clientX <= rightRect.right &&
          clientY >= rightRect.top && clientY <= rightRect.bottom) {
        targetRect = rightRect
      }

      if (targetRect) {
        const x = ((clientX - targetRect.left) / targetRect.width) * 100
        const y = ((clientY - targetRect.top) / targetRect.height) * 100
        const snappedX = Math.max(8, Math.min(92, Math.round(x / 5) * 5))
        const snappedY = Math.max(8, Math.min(92, Math.round(y / 5) * 5))
        setDropCoords({ x: snappedX, y: snappedY })
      }
    }

    window.addEventListener('pointermove', handlePointer)
    window.addEventListener('touchmove', handlePointer)
    return () => {
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('touchmove', handlePointer)
    }
  }, [activeId])

  // dnd-kit handlers
  function handleDragStart(event) {
    setActiveId(event.active.id)
    setShowGrid(true)
    // Lock scroll while dragging
    document.body.style.overflow = 'hidden'
  }

  function handleDragMove(event) {
    // Position tracking now handled by useEffect above
  }

  function handleDragOver(event) {
    const overId = event.over?.id
    if (overId === 'lens-left') setOverLens('left')
    else if (overId === 'lens-right') setOverLens('right')
    else setOverLens(null)

    handleDragMove(event)
  }

  function handleDragEnd(event) {
    const { active, over } = event

    // Dropping from palette onto lens
    if (over && active.data.current?.fromPalette && over.id.startsWith('lens-')) {
      const eye = over.id === 'lens-left' ? 'left' : 'right'
      const type = active.data.current.type

      // Place at the tracked drop coordinates
      const widget = { id: Date.now(), type, x: dropCoords.x, y: dropCoords.y, text }
      if (eye === 'left') setLeftWidgets(prev => [...prev, widget])
      else setRightWidgets(prev => [...prev, widget])
      setText('')
    }

    setActiveId(null)
    setShowGrid(false)
    setOverLens(null)
    setDropCoords({ x: 50, y: 50 })
    // Unlock scroll
    document.body.style.overflow = ''
  }

  // Move widget to new position
  function moveWidget(eye, widgetId, x, y) {
    const update = (widgets) => widgets.map(w => w.id === widgetId ? { ...w, x, y } : w)
    if (eye === 'left') setLeftWidgets(update)
    else setRightWidgets(update)
  }

  // Remove widget
  function removeWidget(eye, widgetId) {
    if (eye === 'left') setLeftWidgets(prev => prev.filter(w => w.id !== widgetId))
    else setRightWidgets(prev => prev.filter(w => w.id !== widgetId))
  }

  function clearAll() {
    setLeftWidgets([])
    setRightWidgets([])
  }

  const renderLens = (widgets, eye) => {
    const isOver = overLens === eye
    const activeType = activeId?.replace('palette-', '')
    const lensRef = eye === 'left' ? leftLensRef : rightLensRef
    return (
      <div className="relative">
        <DroppableLens eye={eye} isOver={isOver} lensRef={lensRef}>
          {/* Swiss-style grid overlay - subtle, precise */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Major gridlines every 20% */}
              {[1, 2, 3, 4].map(i => (
                <div key={`mh${i}`} className="absolute w-full h-px bg-zinc-500/30" style={{ top: `${i * 20}%` }} />
              ))}
              {[1, 2, 3, 4].map(i => (
                <div key={`mv${i}`} className="absolute h-full w-px bg-zinc-500/30" style={{ left: `${i * 20}%` }} />
              ))}
              {/* Minor gridlines every 10% */}
              {[1, 3, 5, 7, 9].map(i => (
                <div key={`h${i}`} className="absolute w-full h-px bg-zinc-700/20" style={{ top: `${i * 10}%` }} />
              ))}
              {[1, 3, 5, 7, 9].map(i => (
                <div key={`v${i}`} className="absolute h-full w-px bg-zinc-700/20" style={{ left: `${i * 10}%` }} />
              ))}
              {/* Safe zone indicator */}
              <div className="absolute border border-dashed border-zinc-600/30 rounded-lg" style={{ inset: '8%' }} />
            </div>
          )}

          {/* Ghost preview - shows where widget will land */}
          {isOver && activeId && (
            <div
              className="absolute text-zinc-500/60 text-sm sm:text-xs font-mono tracking-wide pointer-events-none transition-all duration-75"
              style={{
                left: `${dropCoords.x}%`,
                top: `${dropCoords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {getValue(activeType, text)}
            </div>
          )}

          {/* Widgets - draggable with anime.js snap */}
          {widgets.map(w => (
            <DraggableLensWidget
              key={w.id}
              widget={w}
              onMove={(id, x, y) => moveWidget(eye, id, x, y)}
              onRemove={(id) => removeWidget(eye, id)}
              getValue={getValue}
            />
          ))}

          {/* Empty state */}
          {widgets.length === 0 && !activeId && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-[10px] font-mono uppercase tracking-widest pointer-events-none">
              Drop here
            </div>
          )}
        </DroppableLens>
        <div className="text-zinc-600 text-[10px] text-center mt-1 font-mono uppercase tracking-[0.2em]">{eye === 'left' ? 'L' : 'R'}</div>
      </div>
    )
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="min-h-screen flex flex-col bg-black">
        {/* Glasses Display */}
        <div
          className={`bg-black flex justify-center items-center gap-2 sm:gap-3 transition-all duration-300 ${
            showControls ? 'p-4 sm:p-6' : 'p-4 sm:p-8 flex-1'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {renderLens(leftWidgets, 'left')}
              <div className="w-2 sm:w-3 h-1 sm:h-1.5 bg-zinc-700 -mt-6 sm:-mt-8" />
              {renderLens(rightWidgets, 'right')}
            </div>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-zinc-900 border-t border-zinc-800 py-2 px-4 text-zinc-500 text-xs font-mono flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          <span>{showControls ? '▼ Hide Controls' : '▲ Show Controls'}</span>
          <span className="text-zinc-600">L:{leftWidgets.length} R:{rightWidgets.length}</span>
        </button>

        {/* Controls - scrollable */}
        <div className={`bg-zinc-50 transition-all duration-300 ${showControls ? 'min-h-[50vh]' : 'h-0 overflow-hidden'}`}>
          <div className="p-3 sm:p-4">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Instructions bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-zinc-500">
                  <strong>Drag</strong> widgets onto lenses &bull; <strong>Hover + ×</strong> to remove
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setShowGrid(!showGrid)} variant="outline" size="sm">
                    {showGrid ? 'Hide Grid' : 'Show Grid'}
                  </Button>
                  <Button onClick={clearAll} variant="secondary" size="sm">Clear All</Button>
                </div>
              </div>

              {/* Custom text input - only show when text widget selected */}
              {(selectedType === 'text' || selectedType === 'label') && (
                <div className="bg-white rounded-lg p-3 border">
                  <Input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Enter custom text..."
                    className="text-base"
                  />
                </div>
              )}

              {/* Widget Bento Grid */}
              <div className="space-y-3">
                {WIDGET_CATEGORIES.map(category => (
                  <div key={category.label}>
                    <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                      {category.label.replace(/—/g, '').trim()}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {category.widgets.map(w => (
                        <DraggableCard
                          key={w.value}
                          type={w.value}
                          label={w.label}
                          preview={getValue(w.value, 'Sample')}
                          isSelected={selectedType === w.value}
                          onSelect={setSelectedType}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay - shows what's being dragged */}
      <DragOverlay>
        {activeId && activeId.startsWith('palette-') && (
          <div className="bg-zinc-900 text-white rounded-lg p-2 shadow-xl opacity-90">
            <div className="font-mono text-xs">{getValue(activeId.replace('palette-', ''), text)}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default App
