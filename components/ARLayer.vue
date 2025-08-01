<template>
  <div class="ar-layer" :class="{ 'depth-aware': depthMode }">
    <div 
      v-for="(object, index) in spatialObjects" 
      :key="index"
      class="spatial-object"
      :style="getObjectStyle(object)"
      @click="handleObjectInteraction(object)"
    >
      <component 
        :is="object.component" 
        v-bind="object.props" 
        :depth="object.depth"
        :opacity="getDepthOpacity(object.depth)"
      />
      
      <!-- Depth indicator -->
      <div v-if="showDepthIndicators" class="depth-indicator">
        {{ object.depth.toFixed(1) }}m
      </div>
    </div>
    
    <!-- Eye tracking cursor -->
    <div 
      v-if="eyeTracking" 
      class="eye-cursor"
      :style="{ left: gazeX + 'px', top: gazeY + 'px' }"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  depthMode: { type: Boolean, default: true },
  eyeTracking: { type: Boolean, default: false },
  showDepthIndicators: { type: Boolean, default: false }
})

const spatialObjects = ref([])
const gazeX = ref(0)
const gazeY = ref(0)

// Simulate eye tracking
const simulateEyeTracking = () => {
  if (props.eyeTracking) {
    gazeX.value = Math.random() * 300 + 10
    gazeY.value = Math.random() * 200 + 10
  }
}

// Calculate depth-based opacity
const getDepthOpacity = (depth) => {
  // Objects further away are more transparent
  return Math.max(0.3, 1 - (depth / 10))
}

// Get spatial positioning styles
const getObjectStyle = (object) => {
  const scale = 1 / (object.depth * 0.2 + 0.8) // Perspective scaling
  const blur = Math.max(0, (object.depth - 2) * 0.5) // Depth blur
  
  return {
    left: object.x + 'px',
    top: object.y + 'px',
    transform: `scale(${scale})`,
    filter: `blur(${blur}px)`,
    zIndex: Math.floor(100 - object.depth * 10)
  }
}

// Handle spatial object interactions
const handleObjectInteraction = (object) => {
  if (object.interactive) {
    object.onInteract?.(object)
  }
}

// Add spatial object to scene
const addSpatialObject = (object) => {
  spatialObjects.value.push({
    id: Date.now(),
    x: 0,
    y: 0,
    depth: 1.0, // meters
    component: 'div',
    props: {},
    interactive: false,
    ...object
  })
}

// Remove spatial object
const removeSpatialObject = (id) => {
  spatialObjects.value = spatialObjects.value.filter(obj => obj.id !== id)
}

onMounted(() => {
  if (props.eyeTracking) {
    setInterval(simulateEyeTracking, 100)
  }
})

defineExpose({
  addSpatialObject,
  removeSpatialObject,
  spatialObjects
})
</script>

<style scoped>
.ar-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spatial-object {
  position: absolute;
  pointer-events: auto;
  transition: all 0.2s ease-out;
}

.depth-indicator {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #666;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 2px;
}

.eye-cursor {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid #00ff88;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1000;
  transition: all 0.1s ease-out;
}

.eye-cursor::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 2px;
  background: #00ff88;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>