<template>
  <div class="widget-container" :style="containerStyle">
    <!-- Text widgets -->
    <span v-if="widget.type === 'text'" class="text-widget">
      {{ widget.content }}
    </span>
    
    <!-- Canvas-based widgets -->
    <DecibelMeter 
      v-else-if="widget.type === 'decibel-meter'"
      :width="widget.width || 64"
      :height="widget.height || 4"
      :value="widget.value || 45"
      :max="widget.max || 100"
    />
    
    <!-- Waveform widget -->
    <canvas 
      v-else-if="widget.type === 'waveform'"
      ref="waveCanvas"
      :width="widget.width || 32"
      :height="widget.height || 8"
      class="waveform-widget"
    />
    
    <!-- Bar chart widget -->
    <canvas
      v-else-if="widget.type === 'bars'"
      ref="barCanvas" 
      :width="widget.width || 24"
      :height="widget.height || 16"
      class="bar-widget"
    />
    
    <!-- Dot matrix widget -->
    <canvas
      v-else-if="widget.type === 'dots'"
      ref="dotCanvas"
      :width="widget.width || 16" 
      :height="widget.height || 16"
      class="dot-widget"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  widget: { type: Object, required: true },
  position: { type: String, default: 'center' }
})

const waveCanvas = ref(null)
const barCanvas = ref(null) 
const dotCanvas = ref(null)

const containerStyle = computed(() => ({
  position: 'absolute',
  ...getPositionStyle(props.position)
}))

const getPositionStyle = (position) => {
  const styles = {
    'top-left': { top: '8px', left: '8px' },
    'top-right': { top: '8px', right: '8px' },
    'bottom-left': { bottom: '8px', left: '8px' },
    'bottom-right': { bottom: '8px', right: '8px' },
    'center': { 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)' 
    },
    'bottom-center': { 
      bottom: '8px', 
      left: '50%', 
      transform: 'translateX(-50%)' 
    },
    'top-center': { 
      top: '8px', 
      left: '50%', 
      transform: 'translateX(-50%)' 
    }
  }
  return styles[position] || styles.center
}

// Draw waveform
const drawWaveform = () => {
  const canvas = waveCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  
  ctx.beginPath()
  for (let x = 0; x < width; x += 2) {
    const y = height/2 + Math.sin(Date.now() * 0.01 + x * 0.3) * (height/4)
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

// Draw bars
const drawBars = () => {
  const canvas = barCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  
  ctx.clearRect(0, 0, width, height)
  
  const bars = 6
  const barWidth = Math.floor(width / bars) - 1
  
  for (let i = 0; i < bars; i++) {
    const barHeight = Math.random() * height
    const x = i * (barWidth + 1)
    const y = height - barHeight
    
    ctx.fillStyle = '#fff'
    ctx.fillRect(x, y, barWidth, barHeight)
  }
}

// Draw dot matrix
const drawDots = () => {
  const canvas = dotCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#fff'
  
  const dotSize = 2
  const spacing = 3
  const cols = Math.floor(width / spacing)
  const rows = Math.floor(height / spacing)
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (Math.random() > 0.5) {
        ctx.fillRect(x * spacing, y * spacing, dotSize, dotSize)
      }
    }
  }
}

onMounted(() => {
  if (props.widget.type === 'waveform') {
    const interval = setInterval(drawWaveform, 50)
    onUnmounted(() => clearInterval(interval))
  } else if (props.widget.type === 'bars') {
    const interval = setInterval(drawBars, 200)
    onUnmounted(() => clearInterval(interval))
  } else if (props.widget.type === 'dots') {
    const interval = setInterval(drawDots, 300)
    onUnmounted(() => clearInterval(interval))
  }
})
</script>

<style scoped>
.widget-container {
  pointer-events: none;
}

.text-widget {
  font-family: monospace;
  font-size: 11px;
  color: #fff;
}

canvas {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>