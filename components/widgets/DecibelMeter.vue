<template>
  <canvas 
    ref="canvas"
    :width="width"
    :height="height"
    class="decibel-meter"
  />
</template>

<script setup>
const props = defineProps({
  width: { type: Number, default: 64 },
  height: { type: Number, default: 4 },
  value: { type: Number, default: 45 }, // dB level
  max: { type: Number, default: 100 }
})

const canvas = ref(null)
let animationId = null

onMounted(() => {
  draw()
  // Simulate fluctuating audio levels
  const interval = setInterval(() => {
    const newValue = Math.max(20, Math.min(props.max, props.value + (Math.random() - 0.5) * 10))
    draw(newValue)
  }, 100)
  
  onUnmounted(() => {
    clearInterval(interval)
    if (animationId) cancelAnimationFrame(animationId)
  })
})

const draw = (currentValue = props.value) => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, props.width, props.height)
  
  // Calculate fill width based on dB level
  const fillWidth = (currentValue / props.max) * props.width
  
  // Draw background
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, props.width, props.height)
  
  // Draw level bars
  const barWidth = 2
  const spacing = 1
  const totalBars = Math.floor(props.width / (barWidth + spacing))
  const activeBars = Math.floor((fillWidth / props.width) * totalBars)
  
  for (let i = 0; i < totalBars; i++) {
    const x = i * (barWidth + spacing)
    const isActive = i < activeBars
    
    if (isActive) {
      // Color based on level (green -> yellow -> red)
      const ratio = i / totalBars
      if (ratio < 0.6) {
        ctx.fillStyle = '#0f0' // Green
      } else if (ratio < 0.8) {
        ctx.fillStyle = '#ff0' // Yellow  
      } else {
        ctx.fillStyle = '#f00' // Red
      }
    } else {
      ctx.fillStyle = '#444'
    }
    
    ctx.fillRect(x, 0, barWidth, props.height)
  }
}
</script>

<style scoped>
.decibel-meter {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>