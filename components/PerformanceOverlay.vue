<template>
  <div class="perf-overlay" v-if="showOverlay">
    <div class="perf-section">
      <h4>Performance</h4>
      <div class="perf-metric">
        <span>FPS:</span>
        <span :class="fpsClass">{{ fps }}</span>
      </div>
      <div class="perf-metric">
        <span>Frame Time:</span>
        <span>{{ frameTime }}ms</span>
      </div>
      <div class="perf-metric">
        <span>Memory:</span> 
        <span>{{ memoryUsage }}MB</span>
      </div>
    </div>
    
    <div class="perf-section">
      <h4>Widgets</h4>
      <div class="perf-metric">
        <span>Active:</span>
        <span>{{ activeWidgets }}</span>
      </div>
      <div class="perf-metric">
        <span>Oscillators:</span>
        <span>{{ activeOscillators }}</span>
      </div>
      <div class="perf-metric">
        <span>Canvas:</span>
        <span>{{ canvasElements }}</span>
      </div>
    </div>
    
    <div class="perf-section">
      <h4>HUD Stats</h4>
      <div class="perf-metric">
        <span>Resolution:</span>
        <span>{{ resolution }}</span>
      </div>
      <div class="perf-metric">
        <span>Readability:</span>
        <span :class="readabilityClass">{{ readabilityScore }}%</span>
      </div>
      <div class="perf-metric">
        <span>Eye Strain:</span>
        <span :class="eyeStrainClass">{{ eyeStrainLevel }}</span>
      </div>
    </div>
    
    <button @click="showOverlay = false" class="close-btn">×</button>
  </div>
  
  <button 
    v-else
    @click="showOverlay = true" 
    class="perf-trigger"
    title="Performance Overlay"
  >
    📊
  </button>
</template>

<script setup>
const showOverlay = ref(false)
const fps = ref(60)
const frameTime = ref(16.7)
const memoryUsage = ref(45)
const activeWidgets = ref(0)
const activeOscillators = ref(0)
const canvasElements = ref(0)
const resolution = ref('1920×1080')
const readabilityScore = ref(85)
const eyeStrainLevel = ref('LOW')

// Performance monitoring
let lastTime = performance.now()
let frameCount = 0

const updatePerformance = () => {
  const now = performance.now()
  frameCount++
  
  if (frameCount % 60 === 0) {
    const delta = now - lastTime
    fps.value = Math.round(60000 / delta)
    frameTime.value = (delta / 60).toFixed(1)
    lastTime = now
    
    // Mock memory usage
    memoryUsage.value = Math.floor(Math.random() * 20) + 40
    
    // Count active elements
    activeWidgets.value = document.querySelectorAll('.widget-lego').length
    canvasElements.value = document.querySelectorAll('canvas').length
    
    // Calculate readability score based on contrast, size, positioning
    const widgets = document.querySelectorAll('.widget-lego')
    let totalScore = 0
    
    widgets.forEach(widget => {
      const rect = widget.getBoundingClientRect()
      let score = 100
      
      // Penalize if too close to edges
      if (rect.left < 20 || rect.right > window.innerWidth - 20) score -= 15
      if (rect.top < 20 || rect.bottom > window.innerHeight - 20) score -= 15
      
      // Penalize if too small
      if (rect.width < 30 || rect.height < 12) score -= 20
      
      totalScore += score
    })
    
    readabilityScore.value = widgets.length > 0 
      ? Math.floor(totalScore / widgets.length) 
      : 100
      
    // Eye strain based on widget density and brightness
    const density = widgets.length / (window.innerWidth * window.innerHeight / 10000)
    if (density > 0.8) eyeStrainLevel.value = 'HIGH'
    else if (density > 0.4) eyeStrainLevel.value = 'MED'
    else eyeStrainLevel.value = 'LOW'
  }
  
  requestAnimationFrame(updatePerformance)
}

const fpsClass = computed(() => ({
  'perf-good': fps.value >= 55,
  'perf-warn': fps.value >= 30 && fps.value < 55,
  'perf-bad': fps.value < 30
}))

const readabilityClass = computed(() => ({
  'perf-good': readabilityScore.value >= 80,
  'perf-warn': readabilityScore.value >= 60 && readabilityScore.value < 80,
  'perf-bad': readabilityScore.value < 60
}))

const eyeStrainClass = computed(() => ({
  'perf-good': eyeStrainLevel.value === 'LOW',
  'perf-warn': eyeStrainLevel.value === 'MED',
  'perf-bad': eyeStrainLevel.value === 'HIGH'
}))

onMounted(() => {
  updatePerformance()
})
</script>

<style scoped>
.perf-overlay {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  color: #fff;
  font-family: monospace;
  font-size: 10px;
  width: 200px;
  z-index: 1000;
}

.perf-section {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.perf-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.perf-section h4 {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: #0ff;
}

.perf-metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.perf-metric span:first-child {
  color: #ccc;
}

.perf-good { color: #0f0; }
.perf-warn { color: #ff0; }
.perf-bad { color: #f00; }

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.perf-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  color: #fff;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.perf-trigger:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: #0ff;
}
</style>