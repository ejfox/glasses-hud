<template>
  <WidgetBase v-bind="$props" @select="$emit('select')">
    <span class="text-content" :style="textStyle">
      {{ displayText }}
    </span>
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
  text: { type: String, default: 'TEXT' },
  fontSize: { type: Number, default: 11 },
  fontFamily: { type: String, default: 'monospace' },
  align: { type: String, default: 'left' },
  dataSource: { type: String, default: null }
})

defineEmits(['select'])

const { getOscillatorValue, createOscillator } = useOscillators()

// Create oscillator if dataSource is an oscillator
if (props.dataSource && props.dataSource.startsWith('osc:')) {
  const oscId = `${props.dataSource}-${Math.random()}`
  const oscType = props.dataSource.replace('osc:', '')
  createOscillator(oscId, { type: oscType })
}

const displayText = computed(() => {
  if (props.dataSource === 'time') {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  if (props.dataSource === 'random') {
    return Math.floor(Math.random() * 100).toString()
  }
  if (props.dataSource && props.dataSource.startsWith('osc:')) {
    const oscId = `${props.dataSource}-${Math.random()}`
    const value = getOscillatorValue(oscId)
    return Math.floor(value).toString()
  }
  return props.text
})

const textStyle = computed(() => ({
  fontSize: `${props.fontSize}px`,
  fontFamily: props.fontFamily,
  textAlign: props.align,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: props.align === 'center' ? 'center' : props.align === 'right' ? 'flex-end' : 'flex-start'
}))

// Auto-update time
if (props.dataSource === 'time' || props.dataSource === 'random') {
  setInterval(() => {
    // Force reactivity update
  }, 1000)
}
</script>

<style scoped>
.text-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>