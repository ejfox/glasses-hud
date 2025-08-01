<template>
  <div 
    class="widget-lego"
    :style="computedStyle"
    @click="$emit('select')"
    :class="{ selected: isSelected }"
  >
    <slot />
    <div v-if="showHandle" class="widget-handle">⋮⋮</div>
  </div>
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
  showHandle: { type: Boolean, default: false }
})

defineEmits(['select'])

const computedStyle = computed(() => ({
  position: 'absolute',
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.width}px`,
  height: `${props.height}px`,
  opacity: props.opacity,
  color: props.color,
  cursor: props.showHandle ? 'move' : 'default'
}))
</script>

<style scoped>
.widget-lego {
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.widget-lego.selected {
  border-color: #0ff;
  box-shadow: 0 0 8px #0ff;
}

.widget-handle {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 8px;
  background: #0ff;
  color: #000;
  padding: 2px;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.widget-lego:hover .widget-handle {
  opacity: 1;
}
</style>