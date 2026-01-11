<template>
  <div>
    <!-- Glasses Display -->
    <div style="height: 40vh; background: black; display: flex; justify-content: center; align-items: center; gap: 20px;">
      <!-- Left Lens -->
      <div style="width: 300px; height: 200px; border: 2px solid #333; border-radius: 20px; position: relative;">
        <div v-for="(widget, key) in leftWidgets" :key="key" :style="getPosition(widget.position)" style="position: absolute; color: white; font-family: monospace; font-size: 12px;">
          <div v-if="widget.type === 'text'">{{widget.text}}</div>
          <div v-else-if="widget.type === 'decibel'" style="width: 64px; height: 4px; background: #333; position: relative;">
            <div :style="`width: ${getDecibelLevel(widget.id)}%; height: 100%; background: white;`"></div>
          </div>
          <div v-else-if="widget.type === 'bearing'">{{sensorData.bearing}}°</div>
          <div v-else-if="widget.type === 'yaw'">YAW {{sensorData.yaw}}°</div>
          <div v-else-if="widget.type === 'pitch'">PITCH {{sensorData.pitch}}°</div>
          <div v-else-if="widget.type === 'roll'">ROLL {{sensorData.roll}}°</div>
          <div v-else-if="widget.type === 'heartRate'">{{sensorData.heartRate}} BPM</div>
          <div v-else-if="widget.type === 'steps'">{{sensorData.steps}} STEPS</div>
          <div v-else-if="widget.type === 'temperature'">{{sensorData.temperature}}°C</div>
          <div v-else-if="widget.type === 'brightness'">{{sensorData.brightness}}% LUX</div>
          <div v-else-if="widget.type === 'altitude'">{{sensorData.altitude}}m</div>
        </div>
      </div>
      
      <!-- Bridge -->
      <div style="width: 20px; height: 6px; background: #333; margin-top: -100px;"></div>
      
      <!-- Right Lens -->
      <div style="width: 300px; height: 200px; border: 2px solid #333; border-radius: 20px; position: relative;">
        <div v-for="(widget, key) in rightWidgets" :key="key" :style="getPosition(widget.position)" style="position: absolute; color: white; font-family: monospace; font-size: 12px;">
          <div v-if="widget.type === 'text'">{{widget.text}}</div>
          <div v-else-if="widget.type === 'decibel'" style="width: 64px; height: 4px; background: #333; position: relative;">
            <div :style="`width: ${getDecibelLevel(widget.id)}%; height: 100%; background: white;`"></div>
          </div>
          <div v-else-if="widget.type === 'bearing'">{{sensorData.bearing}}°</div>
          <div v-else-if="widget.type === 'yaw'">YAW {{sensorData.yaw}}°</div>
          <div v-else-if="widget.type === 'pitch'">PITCH {{sensorData.pitch}}°</div>
          <div v-else-if="widget.type === 'roll'">ROLL {{sensorData.roll}}°</div>
          <div v-else-if="widget.type === 'heartRate'">{{sensorData.heartRate}} BPM</div>
          <div v-else-if="widget.type === 'steps'">{{sensorData.steps}} STEPS</div>
          <div v-else-if="widget.type === 'temperature'">{{sensorData.temperature}}°C</div>
          <div v-else-if="widget.type === 'brightness'">{{sensorData.brightness}}% LUX</div>
          <div v-else-if="widget.type === 'altitude'">{{sensorData.altitude}}m</div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div style="height: 60vh; background: white; padding: 40px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; max-width: 800px;">
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">EYE</label>
          <select v-model="selectedEye" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="left">LEFT</option>
            <option value="right">RIGHT</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">WIDGET TYPE</label>
          <select v-model="widgetType" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="text">TEXT</option>
            <option value="decibel">DECIBEL METER</option>
            <option value="bearing">BEARING</option>
            <option value="yaw">YAW</option>
            <option value="pitch">PITCH</option>
            <option value="roll">ROLL</option>
            <option value="heartRate">HEART RATE</option>
            <option value="steps">STEPS</option>
            <option value="temperature">TEMPERATURE</option>
            <option value="brightness">BRIGHTNESS</option>
            <option value="altitude">ALTITUDE</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">POSITION</label>
          <select v-model="selectedPosition" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="top-left">TOP LEFT</option>
            <option value="top-right">TOP RIGHT</option>
            <option value="bottom-left">BOTTOM LEFT</option>
            <option value="bottom-right">BOTTOM RIGHT</option>
            <option value="center">CENTER</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">TEXT</label>
          <input v-model="widgetText" style="width: 100%; padding: 8px; font-family: monospace;" placeholder="Enter text">
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <button @click="addWidget" style="padding: 10px 20px; background: black; color: white; border: none; font-family: monospace; cursor: pointer;">
          ADD WIDGET
        </button>
        <button @click="clearAll" style="padding: 10px 20px; background: #999; color: white; border: none; font-family: monospace; cursor: pointer; margin-left: 10px;">
          CLEAR ALL
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRafFn } from '@vueuse/core'
const selectedEye = ref('left')
const selectedPosition = ref('top-left')
const widgetType = ref('text')
const widgetText = ref('')
const leftWidgets = ref([])
const rightWidgets = ref([])
let widgetIdCounter = 0

// Store decibel values for each widget
const decibelValues = ref(new Map())

// ===== PERLIN NOISE IMPLEMENTATION =====
// Simple 1D Perlin noise for smooth sensor data
class PerlinNoise {
  constructor() {
    this.permutation = []
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i
    }
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]]
    }
    // Duplicate
    this.permutation = [...this.permutation, ...this.permutation]
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(t, a, b) {
    return a + t * (b - a)
  }

  grad(hash, x) {
    return (hash & 1) === 0 ? x : -x
  }

  noise(x) {
    const X = Math.floor(x) & 255
    x -= Math.floor(x)
    const u = this.fade(x)
    const a = this.permutation[X]
    const b = this.permutation[X + 1]
    return this.lerp(u, this.grad(a, x), this.grad(b, x - 1))
  }
}

// ===== REALTIME SENSOR DATA =====
const perlin = new PerlinNoise()
let time = 0

// Sensor data that AR glasses might expose
const sensorData = ref({
  bearing: 0,        // Magnetic north bearing (0-359 degrees)
  yaw: 0,            // Rotation around vertical axis (-180 to 180)
  pitch: 0,          // Up/down tilt (-90 to 90)
  roll: 0,           // Side-to-side tilt (-180 to 180)
  noiseLevel: 0,     // Ambient noise (0-100 dB)
  heartRate: 0,      // Heart rate (40-180 bpm)
  steps: 0,          // Step count
  temperature: 0,    // Temperature (°C)
  brightness: 0,     // Ambient light (0-100%)
  altitude: 0,       // Altitude in meters
})

const getPosition = (position) => {
  const positions = {
    'top-left': 'top: 10px; left: 10px;',
    'top-right': 'top: 10px; right: 10px;',
    'bottom-left': 'bottom: 10px; left: 10px;',
    'bottom-right': 'bottom: 10px; right: 10px;',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
  }
  return positions[position] || positions['top-left']
}

const addWidget = () => {
  // Only require text for text widgets
  if (widgetType.value === 'text' && !widgetText.value.trim()) return
  
  const widget = {
    id: ++widgetIdCounter,
    type: widgetType.value,
    position: selectedPosition.value,
    text: widgetText.value
  }
  
  if (selectedEye.value === 'left') {
    leftWidgets.value.push(widget)
  } else {
    rightWidgets.value.push(widget)
  }
  
  widgetText.value = ''
}

const getDecibelLevel = (widgetId) => {
  return decibelValues.value.get(widgetId) || 0
}

// Update sensor data using Perlin noise for smooth, realistic changes
const updateSensorData = () => {
  time += 0.01 // Increment time for Perlin noise
  
  // Bearing: smooth rotation 0-359
  sensorData.value.bearing = Math.floor(((perlin.noise(time * 0.3) + 1) / 2) * 360)
  
  // Yaw: -180 to 180 (smooth rotation)
  sensorData.value.yaw = Math.floor(perlin.noise(time * 0.5) * 180)
  
  // Pitch: -90 to 90 (looking up/down)
  sensorData.value.pitch = Math.floor(perlin.noise(time * 0.4 + 100) * 90)
  
  // Roll: -180 to 180 (tilting head side to side)
  sensorData.value.roll = Math.floor(perlin.noise(time * 0.45 + 200) * 180)
  
  // Noise level: 30-90 dB (ambient sound)
  sensorData.value.noiseLevel = Math.floor(((perlin.noise(time * 2 + 300) + 1) / 2) * 60 + 30)
  
  // Heart rate: 60-100 bpm (resting)
  sensorData.value.heartRate = Math.floor(((perlin.noise(time * 0.2 + 400) + 1) / 2) * 40 + 60)
  
  // Steps: incrementing slowly
  if (Math.random() < 0.1) { // 10% chance each update
    sensorData.value.steps += Math.floor(Math.random() * 3)
  }
  
  // Temperature: 18-25°C (comfortable indoor range)
  sensorData.value.temperature = (((perlin.noise(time * 0.05 + 500) + 1) / 2) * 7 + 18).toFixed(1)
  
  // Brightness: 0-100% (ambient light)
  sensorData.value.brightness = Math.floor(((perlin.noise(time * 0.8 + 600) + 1) / 2) * 100)
  
  // Altitude: 0-500m (with slow drift)
  sensorData.value.altitude = Math.floor(((perlin.noise(time * 0.02 + 700) + 1) / 2) * 500)
}

// Update decibel values every second
const updateDecibelValues = () => {
  const allWidgets = [...leftWidgets.value, ...rightWidgets.value]
  allWidgets.forEach(widget => {
    if (widget.type === 'decibel') {
      // Use noise level from sensor data
      const percentage = Math.floor((sensorData.value.noiseLevel / 90) * 100)
      decibelValues.value.set(widget.id, percentage)
    }
  })
}

const clearAll = () => {
  leftWidgets.value = []
  rightWidgets.value = []
  decibelValues.value.clear()
}

// Animation control refs
let rafPause = null

// Only run animations on client-side
onMounted(() => {
  // Update sensor data continuously
  const { pause: pauseSensors } = useRafFn(() => {
    updateSensorData()
    
    // Update decibel values for widgets
    const allWidgets = [...leftWidgets.value, ...rightWidgets.value]
    allWidgets.forEach(widget => {
      if (widget.type === 'decibel') {
        const percentage = Math.floor((sensorData.value.noiseLevel / 90) * 100)
        decibelValues.value.set(widget.id, percentage)
      }
    })
  })
  
  // Store cleanup function
  rafPause = pauseSensors
})

// Cleanup on unmount
onUnmounted(() => {
  if (rafPause) rafPause()
})
</script>