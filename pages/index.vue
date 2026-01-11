<template>
  <div>
    <!-- Glasses Display -->
    <div style="height: 40vh; background: black; display: flex; justify-content: center; align-items: center; gap: 20px;">
      <!-- Left Lens -->
      <div style="width: 300px; height: 200px; border: 2px solid #333; border-radius: 20px; position: relative;">
        <div v-for="(widget, key) in leftWidgets" :key="key" :style="getPosition(widget)" style="position: absolute; color: white; font-family: monospace; font-size: 12px;">
          <div v-if="widget.type === 'text'">{{widget.text}}</div>
          <div v-else-if="widget.type === 'decibel'" style="width: 64px; height: 4px; background: #333; position: relative;">
            <div :style="`width: ${getDecibelLevel(widget.id)}%; height: 100%; background: white;`"></div>
          </div>
        </div>
      </div>
      
      <!-- Bridge -->
      <div style="width: 20px; height: 6px; background: #333; margin-top: -100px;"></div>
      
      <!-- Right Lens -->
      <div style="width: 300px; height: 200px; border: 2px solid #333; border-radius: 20px; position: relative;">
        <div v-for="(widget, key) in rightWidgets" :key="key" :style="getPosition(widget)" style="position: absolute; color: white; font-family: monospace; font-size: 12px;">
          <div v-if="widget.type === 'text'">{{widget.text}}</div>
          <div v-else-if="widget.type === 'decibel'" style="width: 64px; height: 4px; background: #333; position: relative;">
            <div :style="`width: ${getDecibelLevel(widget.id)}%; height: 100%; background: white;`"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div style="height: 60vh; background: white; padding: 40px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; max-width: 1000px;">
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">EYE</label>
          <select v-model="selectedEye" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="left">LEFT</option>
            <option value="right">RIGHT</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">TYPE</label>
          <select v-model="widgetType" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="text">TEXT</option>
            <option value="decibel">DECIBEL METER</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">POSITION PRESET</label>
          <select v-model="selectedPosition" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="custom">CUSTOM (X/Y)</option>
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
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">X POSITION (px)</label>
          <input v-model.number="customX" type="number" style="width: 100%; padding: 8px; font-family: monospace;" placeholder="0-300" min="0" max="300">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">Y POSITION (px)</label>
          <input v-model.number="customY" type="number" style="width: 100%; padding: 8px; font-family: monospace;" placeholder="0-200" min="0" max="200">
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
const customX = ref(10)
const customY = ref(10)
const leftWidgets = ref([])
const rightWidgets = ref([])
let widgetIdCounter = 0

// Store decibel values for each widget
const decibelValues = ref(new Map())

const getPosition = (widget) => {
  // If widget has custom coordinates, use them
  if (widget.x !== undefined && widget.y !== undefined) {
    return `left: ${widget.x}px; top: ${widget.y}px;`
  }
  
  // Otherwise use preset position
  const positions = {
    'top-left': 'top: 10px; left: 10px;',
    'top-right': 'top: 10px; right: 10px;',
    'bottom-left': 'bottom: 10px; left: 10px;',
    'bottom-right': 'bottom: 10px; right: 10px;',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
  }
  return positions[widget.position] || positions['top-left']
}

const addWidget = () => {
  if (widgetType.value === 'text' && !widgetText.value.trim()) return
  
  const widget = {
    id: ++widgetIdCounter,
    type: widgetType.value,
    text: widgetText.value
  }
  
  // Add position data based on mode
  if (selectedPosition.value === 'custom') {
    // Clamp X and Y values to valid ranges (lens is 300x200)
    widget.x = Math.max(0, Math.min(300, customX.value))
    widget.y = Math.max(0, Math.min(200, customY.value))
  } else {
    widget.position = selectedPosition.value
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

// Update decibel values every second
const updateDecibelValues = () => {
  const allWidgets = [...leftWidgets.value, ...rightWidgets.value]
  allWidgets.forEach(widget => {
    if (widget.type === 'decibel') {
      // Generate realistic decibel reading (30-90 dB range)
      const baseLevel = Math.floor(Math.random() * 61) + 30 // 30-90
      // Add some fluctuation
      const fluctuation = Math.floor(Math.random() * 11) - 5 // -5 to +5
      const finalLevel = Math.max(0, Math.min(100, baseLevel + fluctuation))
      
      // Convert to percentage for the bar
      const percentage = finalLevel
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
let intervalId = null
let rafPause = null

// Only run animations on client-side
onMounted(() => {
  // Update every second
  intervalId = setInterval(updateDecibelValues, 1000)
  
  // Also use RAF for smooth updates
  const { pause } = useRafFn(() => {
    // Slight random fluctuations between second updates
    const allWidgets = [...leftWidgets.value, ...rightWidgets.value]
    allWidgets.forEach(widget => {
      if (widget.type === 'decibel') {
        const currentValue = decibelValues.value.get(widget.id) || 0
        const microFluctuation = (Math.random() - 0.5) * 4 // -2 to +2
        const newValue = Math.max(0, Math.min(100, currentValue + microFluctuation))
        decibelValues.value.set(widget.id, newValue)
      }
    })
  })
  rafPause = pause
})

// Cleanup on unmount
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (rafPause) rafPause()
})
</script>