<template>
  <WidgetBase v-bind="$props" @select="$emit('select')">
    <canvas 
      ref="canvas"
      :width="width"
      :height="height"
      class="bar-canvas"
    />
  </WidgetBase>
</template>

<script setup>
const props = defineProps({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 32 },
  height: { type: Number, default: 16 },
  opacity: { type: Number, default: 1 },
  color: { type: String, default: '#fff' },
  isSelected: { type: Boolean, default: false },
  showHandle: { type: Boolean, default: false },
  barCount: { type: Number, default: 8 },
  barColor: { type: String, default: '#fff' },
  bgColor: { type: String, default: '#222' },
  animSpeed: { type: Number, default: 200 },
  dataSource: { type: String, default: 'random' },
  values: { type: Array, default: () => [] },
  oscillatorId: { type: String, default: null }
})

const { getOscillatorValue, createOscillator } = useOscillators()

// Create oscillator if dataSource is an oscillator
if (props.dataSource && props.dataSource.startsWith('osc:')) {
  const oscId = props.oscillatorId || `bars-${Math.random()}`
  const oscType = props.dataSource.replace('osc:', '')
  createOscillator(oscId, { type: oscType })
}

defineEmits(['select'])

const canvas = ref(null)
let animationId = null

const draw = () => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, props.width, props.height)
  
  // Background
  ctx.fillStyle = props.bgColor
  ctx.fillRect(0, 0, props.width, props.height)
  
  // Bars
  const barWidth = Math.floor(props.width / props.barCount) - 1
  const spacing = 1
  
  for (let i = 0; i < props.barCount; i++) {
    let barHeight
    
    if (props.dataSource === 'random') {
      barHeight = Math.random() * props.height
    } else if (props.dataSource === 'static') {
      barHeight = props.height * 0.5
    } else if (props.dataSource && props.dataSource.startsWith('osc:')) {
      const oscId = props.oscillatorId || `bars-${Math.random()}`
      const baseValue = getOscillatorValue(oscId)
      // Add some variation per bar
      const variation = Math.sin(Date.now() * 0.001 + i * 0.5) * 20
      barHeight = ((baseValue + variation) / 100) * props.height
    } else if (props.values[i] !== undefined) {
      barHeight = (props.values[i] / 100) * props.height
    } else {
      barHeight = Math.random() * props.height
    }
    
    const x = i * (barWidth + spacing)
    const y = props.height - Math.max(0, barHeight)
    
    ctx.fillStyle = props.barColor
    ctx.fillRect(x, y, barWidth, Math.max(0, barHeight))
  }
}

const startAnimation = () => {
  const animate = () => {
    draw()
    animationId = setTimeout(animate, props.animSpeed)
  }
  animate()
}

onMounted(() => {
  if (props.dataSource === 'random') {
    startAnimation()
  } else {
    draw()
  }
})

onUnmounted(() => {
  if (animationId) {
    clearTimeout(animationId)
  }
})

watch(() => [props.barCount, props.barColor, props.values], draw)
</script>

<style scoped>
.bar-canvas {
  image-rendering: pixelated;
}
</style>