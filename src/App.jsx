import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

// Flatten for select options
const WIDGET_TYPES = WIDGET_CATEGORIES.flatMap(cat => [
  { value: `cat_${cat.label}`, label: cat.label, disabled: true },
  ...cat.widgets
])

const POSITIONS = [
  { value: 'tl', label: 'Top Left' },
  { value: 'tr', label: 'Top Right' },
  { value: 'bl', label: 'Bottom Left' },
  { value: 'br', label: 'Bottom Right' },
  { value: 'c', label: 'Center' },
  { value: 'tc', label: 'Top Center' },
  { value: 'bc', label: 'Bottom Center' },
  { value: 'ml', label: 'Middle Left' },
  { value: 'mr', label: 'Middle Right' },
]

function getPositionClasses(pos) {
  const positions = {
    'tl': 'top-2 left-2',
    'tr': 'top-2 right-2',
    'bl': 'bottom-2 left-2',
    'br': 'bottom-2 right-2',
    'c': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'tc': 'top-2 left-1/2 -translate-x-1/2',
    'bc': 'bottom-2 left-1/2 -translate-x-1/2',
    'ml': 'top-1/2 left-2 -translate-y-1/2',
    'mr': 'top-1/2 right-2 -translate-y-1/2',
  }
  return positions[pos] || positions['tl']
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

function App() {
  const [leftWidgets, setLeftWidgets] = useState([])
  const [rightWidgets, setRightWidgets] = useState([])
  const [eye, setEye] = useState('left')
  const [widgetType, setWidgetType] = useState('heartRate')
  const [position, setPosition] = useState('tl')
  const [text, setText] = useState('')
  const [sensors, setSensors] = useState({})
  const [showControls, setShowControls] = useState(true)

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

  function addWidget() {
    const widget = { id: Date.now(), type: widgetType, position, text }
    if (eye === 'left') setLeftWidgets(prev => [...prev, widget])
    else setRightWidgets(prev => [...prev, widget])
    setText('')
  }

  function clearAll() {
    setLeftWidgets([])
    setRightWidgets([])
  }

  const renderLens = (widgets, label) => (
    <div className="relative">
      <div className="w-[44vw] sm:w-[42vw] max-w-[320px] aspect-[3/2] border-2 border-zinc-700 rounded-2xl relative overflow-hidden">
        {widgets.map(w => (
          <div
            key={w.id}
            className={`absolute text-white text-sm sm:text-xs font-mono tracking-wide ${getPositionClasses(w.position)}`}
            style={{ textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
          >
            {getValue(w.type, w.text)}
          </div>
        ))}
      </div>
      <div className="text-zinc-600 text-[10px] text-center mt-1 font-mono uppercase tracking-widest">{label}</div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Glasses Display - fills screen on mobile when controls hidden */}
      <div
        className={`bg-black flex justify-center items-center gap-2 sm:gap-3 transition-all duration-300 ${
          showControls ? 'p-4 sm:p-8' : 'p-4 sm:p-8 flex-1'
        }`}
        onClick={() => !showControls && setShowControls(true)}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {renderLens(leftWidgets, 'L')}
            <div className="w-2 sm:w-3 h-1 sm:h-1.5 bg-zinc-700 -mt-6 sm:-mt-8" />
            {renderLens(rightWidgets, 'R')}
          </div>
        </div>
      </div>

      {/* Toggle button - always visible */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="bg-zinc-900 border-t border-zinc-800 py-2 px-4 text-zinc-500 text-xs font-mono flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
      >
        <span>{showControls ? '▼ Hide Controls' : '▲ Show Controls'}</span>
        <span className="text-zinc-600">L:{leftWidgets.length} R:{rightWidgets.length}</span>
      </button>

      {/* Controls - collapsible */}
      <div className={`bg-white overflow-hidden transition-all duration-300 ${showControls ? 'flex-1' : 'h-0'}`}>
        <div className="p-4 sm:p-6 overflow-auto h-full">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Eye</label>
                <Select value={eye} onValueChange={setEye}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Widget</label>
                <Select value={widgetType} onValueChange={setWidgetType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {WIDGET_TYPES.map(t =>
                      t.disabled ? (
                        <div key={t.value} className="px-2 py-1.5 text-xs font-semibold text-zinc-400 bg-zinc-50">
                          {t.label}
                        </div>
                      ) : (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Position</label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Text (for custom widgets)</label>
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter text..."
              />
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <Button onClick={addWidget} size="lg">Add Widget</Button>
              <Button onClick={clearAll} variant="secondary" size="lg">Clear All</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
