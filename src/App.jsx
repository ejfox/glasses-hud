import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const WIDGET_TYPES = [
  { value: 'bearing', label: 'Bearing' },
  { value: 'heartRate', label: 'Heart Rate' },
  { value: 'steps', label: 'Steps' },
  { value: 'temp', label: 'Temperature' },
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
  })

  // Update sensor values
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => ({
        bearing: Math.floor(Math.random() * 360),
        heartRate: 60 + Math.floor(Math.random() * 40),
        steps: prev.steps + Math.floor(Math.random() * 3),
        temp: (18 + Math.random() * 7).toFixed(1),
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function getValue(type, widgetText) {
    switch (type) {
      case 'bearing': return `${sensors.bearing}°`
      case 'heartRate': return `${sensors.heartRate} BPM`
      case 'steps': return `${sensors.steps} STEPS`
      case 'temp': return `${sensors.temp}°C`
      case 'time': return new Date().toLocaleTimeString()
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
        <div className="w-[42vw] max-w-[300px] aspect-[3/2] border-2 border-zinc-700 rounded-2xl relative">
          {leftWidgets.map(w => (
            <div
              key={w.id}
              className={`absolute text-white text-xs font-mono ${getPositionClasses(w.position)}`}
            >
              {getValue(w.type, w.text)}
            </div>
          ))}
        </div>

        {/* Bridge */}
        <div className="w-3 h-1.5 bg-zinc-700 -mt-12" />

        {/* Right Lens */}
        <div className="w-[42vw] max-w-[300px] aspect-[3/2] border-2 border-zinc-700 rounded-2xl relative">
          {rightWidgets.map(w => (
            <div
              key={w.id}
              className={`absolute text-white text-xs font-mono ${getPositionClasses(w.position)}`}
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
