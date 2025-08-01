<template>
  <canvas
    ref="canvas"
    class="ar-canvas"
    :width="width"
    :height="height"
    @click="handleCanvasClick"
  />
</template>

<script setup>
const props = defineProps({
  width: { type: Number, default: 312 },
  height: { type: Number, default: 232 },
  eye: { type: String, default: 'left' } // left or right
})

const canvas = ref(null)
let ctx = null
let animationId = null

// Advanced rendering patterns for 2026
const renderingModes = {
  neural: 'neural-network',
  particles: 'particle-system', 
  waves: 'wave-visualization',
  heatmap: 'thermal-overlay',
  flow: 'data-flow',
  mesh: '3d-mesh-overlay'
}

const currentMode = ref('neural')
const frameCount = ref(0)

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  startRenderLoop()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

// Main render loop
const startRenderLoop = () => {
  const render = () => {
    frameCount.value++
    clearCanvas()
    
    switch (currentMode.value) {
      case 'neural':
        renderNeuralNetwork()
        break
      case 'particles':
        renderParticleSystem()
        break
      case 'waves':
        renderWaveVisualization()
        break
      case 'heatmap':
        renderThermalOverlay()
        break
      case 'flow':
        renderDataFlow()
        break  
      case 'mesh':
        render3DMeshOverlay()
        break
    }
    
    animationId = requestAnimationFrame(render)
  }
  render()
}

const clearCanvas = () => {
  ctx.clearRect(0, 0, props.width, props.height)
}

// Neural network visualization
const renderNeuralNetwork = () => {
  const nodes = 12
  const connections = []
  
  // Generate node positions
  for (let i = 0; i < nodes; i++) {
    const x = (props.width / (nodes - 1)) * i
    const y = props.height / 2 + Math.sin(frameCount.value * 0.02 + i * 0.5) * 30
    
    // Draw node
    ctx.save()
    ctx.globalAlpha = 0.6
    ctx.fillStyle = '#00ff88'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    // Store for connections
    connections.push({ x, y })
  }
  
  // Draw connections
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.strokeStyle = '#00ff88'
  ctx.lineWidth = 1
  
  for (let i = 0; i < connections.length - 1; i++) {
    const intensity = Math.sin(frameCount.value * 0.03 + i * 0.3) * 0.5 + 0.5
    ctx.globalAlpha = intensity * 0.3
    
    ctx.beginPath()
    ctx.moveTo(connections[i].x, connections[i].y)
    ctx.lineTo(connections[i + 1].x, connections[i + 1].y)
    ctx.stroke()
  }
  ctx.restore()
}

// Particle system for ambient data
const renderParticleSystem = () => {
  const particleCount = 20
  
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.sin(frameCount.value * 0.01 + i) + 1) * props.width / 2
    const y = (Math.cos(frameCount.value * 0.015 + i * 0.5) + 1) * props.height / 2
    const size = Math.sin(frameCount.value * 0.02 + i) * 2 + 3
    
    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = `hsl(${(frameCount.value + i * 30) % 360}, 70%, 60%)`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// Wave visualization for audio/data streams
const renderWaveVisualization = () => {
  const waveHeight = 40
  const frequency = 0.02
  const amplitude = Math.sin(frameCount.value * 0.01) * 0.5 + 0.5
  
  ctx.save()
  ctx.strokeStyle = '#0088ff'
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6
  
  ctx.beginPath()
  for (let x = 0; x < props.width; x += 2) {
    const y = props.height / 2 + 
      Math.sin(x * frequency + frameCount.value * 0.03) * waveHeight * amplitude
    
    if (x === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
  ctx.restore()
}

// Thermal/heatmap overlay
const renderThermalOverlay = () => {
  const gridSize = 20
  const cols = Math.floor(props.width / gridSize)
  const rows = Math.floor(props.height / gridSize)
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const intensity = Math.sin(frameCount.value * 0.02 + x * 0.3 + y * 0.2) * 0.5 + 0.5
      const hue = intensity * 60 // Red-yellow range
      
      ctx.save()
      ctx.globalAlpha = intensity * 0.3
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
      ctx.restore()
    }
  }
}

// Data flow visualization
const renderDataFlow = () => {
  const streamCount = 5
  
  for (let i = 0; i < streamCount; i++) {
    const y = (props.height / streamCount) * i + 20
    const speed = 2 + i * 0.5
    const offset = (frameCount.value * speed) % (props.width + 100)
    
    // Draw flowing dots
    for (let j = 0; j < 3; j++) {
      const x = offset - j * 30
      if (x > -10 && x < props.width + 10) {
        ctx.save()
        ctx.globalAlpha = 0.8 - j * 0.2
        ctx.fillStyle = '#ff8800'
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
  }
}

// 3D mesh overlay simulation
const render3DMeshOverlay = () => {
  const meshSize = 30
  const cols = Math.floor(props.width / meshSize)
  const rows = Math.floor(props.height / meshSize)
  
  ctx.save()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.2
  
  // Vertical lines
  for (let x = 0; x <= cols; x++) {
    const xPos = x * meshSize
    const wave = Math.sin(frameCount.value * 0.02 + x * 0.1) * 5
    
    ctx.beginPath()
    ctx.moveTo(xPos + wave, 0)
    ctx.lineTo(xPos - wave, props.height)
    ctx.stroke()
  }
  
  // Horizontal lines  
  for (let y = 0; y <= rows; y++) {
    const yPos = y * meshSize
    const wave = Math.cos(frameCount.value * 0.02 + y * 0.1) * 5
    
    ctx.beginPath()
    ctx.moveTo(0, yPos + wave)
    ctx.lineTo(props.width, yPos - wave)
    ctx.stroke()
  }
  ctx.restore()
}

const handleCanvasClick = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Cycle through rendering modes on click
  const modes = Object.keys(renderingModes)
  const currentIndex = modes.indexOf(currentMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  currentMode.value = modes[nextIndex]
}

// Expose methods for external control
defineExpose({
  setRenderingMode: (mode) => {
    if (renderingModes[mode]) {
      currentMode.value = mode
    }
  },
  getCurrentMode: () => currentMode.value,
  canvas
})
</script>

<style scoped>
.ar-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  cursor: pointer;
  opacity: 0.8;
  mix-blend-mode: screen;
}
</style>