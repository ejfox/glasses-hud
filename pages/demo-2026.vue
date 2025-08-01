<template>
  <div>
    <GlassesHUD 
      ref="hud"
      :eye-tracking="true"
      :depth-mode="true"
      :show-depth-indicators="showDepth"
    >
      <!-- Traditional HUD elements -->
      <template #left-hud-top-left>
        <div class="hud-top-left" style="color: #00ff88;">
          {{ currentTime }}
        </div>
      </template>
      
      <template #right-hud-top-right>
        <div class="hud-top-right" style="color: #ff8800;">
          2026 PROTO
        </div>
      </template>
      
      <template #left-hud-bottom-left>
        <div class="hud-bottom-left" style="color: #0088ff;">
          {{ biometrics.heartRate }} BPM
        </div>
      </template>
      
      <template #right-hud-bottom-right>
        <div class="hud-bottom-right" style="color: #888888;">
          FOCUS: {{ Math.floor(biometrics.attention * 100) }}%
        </div>
      </template>
    </GlassesHUD>

    <!-- 2026 Controls -->
    <div class="controls-2026">
      <div class="control-group">
        <button @click="toggleDepthIndicators">
          {{ showDepth ? 'Hide' : 'Show' }} Depth
        </button>
        <button @click="simulateEyeGesture">Eye Gesture</button>
        <button @click="clearAllWidgets">Clear All</button>
      </div>
      
      <div class="control-group">
        <button @click="spawnAmbientWidget">Ambient Data</button>
        <button @click="spawnNavWidget">Navigation</button>
        <button @click="spawnAIContext">AI Context</button>
      </div>
      
      <div class="control-group">
        <label>Canvas Mode:</label>
        <select @change="changeCanvasMode" v-model="canvasMode">
          <option value="neural">Neural Net</option>
          <option value="particles">Particles</option>
          <option value="waves">Waves</option>
          <option value="heatmap">Thermal</option>
          <option value="flow">Data Flow</option>
          <option value="mesh">3D Mesh</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
const { 
  createSpatialWidget, 
  depthLayers, 
  biometricStates,
  simulateGesture 
} = useHUD()

const hud = ref(null)
const currentTime = ref('')
const showDepth = ref(false)
const biometrics = ref(biometricStates.focused)
const widgetCounter = ref(0)
const canvasMode = ref('neural')

// Update time with milliseconds for futuristic feel
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + `.${String(now.getMilliseconds()).padStart(3, '0')}`
}

// Biometric simulation
const updateBiometrics = () => {
  const states = Object.values(biometricStates)
  const randomState = states[Math.floor(Math.random() * states.length)]
  biometrics.value = {
    ...randomState,
    heartRate: randomState.heartRate + Math.floor(Math.random() * 10 - 5)
  }
}

// Widget spawning functions
const spawnAmbientWidget = () => {
  const ambientData = [
    { icon: '🌡️', value: '72°F', label: 'TEMP' },
    { icon: '💨', value: '5mph', label: 'WIND' },
    { icon: '🌅', value: '6:42', label: 'SUNRISE' },
    { icon: '📊', value: '84%', label: 'AIR QUAL' },
    { icon: '🌙', value: '76%', label: 'MOON' }
  ]
  
  const data = ambientData[widgetCounter.value % ambientData.length]
  const widget = createSpatialWidget('ambient', data, {
    x: Math.random() * 200 + 50,
    y: Math.random() * 150 + 50
  }, depthLayers.contextual)
  
  hud.value?.addSpatialObject(widget)
  widgetCounter.value++
}

const spawnNavWidget = () => {
  const directions = [0, 45, 90, 135, 180, 225, 270, 315]
  const distances = ['0.1mi', '0.3mi', '0.7mi', '1.2mi']
  
  const widget = createSpatialWidget('nav', {
    direction: directions[Math.floor(Math.random() * directions.length)],
    distance: distances[Math.floor(Math.random() * distances.length)]
  }, {
    x: Math.random() * 200 + 50,
    y: Math.random() * 150 + 50
  }, depthLayers.personal)
  
  hud.value?.addSpatialObject(widget)
}

const spawnAIContext = () => {
  const aiTexts = [
    'Coffee shop ahead',
    'Meeting in 15min',
    'Friend nearby',
    'Photo opportunity',
    'Traffic alert',
    'Weather changing'
  ]
  
  const widget = createSpatialWidget('ai', {
    aiText: aiTexts[Math.floor(Math.random() * aiTexts.length)]
  }, {
    x: Math.random() * 200 + 50,
    y: Math.random() * 150 + 50
  }, depthLayers.immediate)
  
  hud.value?.addSpatialObject(widget)
}

const simulateEyeGesture = () => {
  // Flash all widgets to simulate eye-gesture activation
  const widgets = document.querySelectorAll('.spatial-widget')
  widgets.forEach(widget => {
    widget.style.borderColor = '#00ff88'
    widget.style.boxShadow = '0 0 20px #00ff88'
    setTimeout(() => {
      widget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
      widget.style.boxShadow = 'none'
    }, 500)
  })
}

const toggleDepthIndicators = () => {
  showDepth.value = !showDepth.value
}

const clearAllWidgets = () => {
  // Clear all spatial objects from both AR layers
  hud.value?.leftARLayer?.spatialObjects && (hud.value.leftARLayer.spatialObjects.length = 0)
  hud.value?.rightARLayer?.spatialObjects && (hud.value.rightARLayer.spatialObjects.length = 0)
}

const changeCanvasMode = () => {
  hud.value?.setCanvasMode(canvasMode.value)
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 100) // Update with milliseconds
  
  setInterval(updateBiometrics, 3000)
  
  // Spawn some initial ambient widgets
  setTimeout(() => {
    spawnAmbientWidget()
    setTimeout(spawnNavWidget, 1000)
    setTimeout(spawnAIContext, 2000)
  }, 2000)
})
</script>

<style scoped>
.controls-2026 {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  background: rgba(0, 0, 0, 0.9);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.controls-2026 button {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.controls-2026 button:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.controls-2026 select {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
}

.controls-2026 label {
  font-size: 10px;
  color: #ccc;
  margin-right: 4px;
}
</style>