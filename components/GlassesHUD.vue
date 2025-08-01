<template>
  <div class="glasses-container">
    <div class="lens" id="left-lens">
      <div class="lens-frame"></div>
      <canvas 
        ref="leftCanvas" 
        class="lens-canvas"
        :width="canvasWidth"
        :height="canvasHeight"
      />
      
      <div class="visualization-layer">
        <slot name="left-eye" />
        <slot name="left-hud-top-left" />
        <slot name="left-hud-top-right" />
        <slot name="left-hud-bottom-left" />
        <slot name="left-hud-bottom-right" />
        <slot name="left-hud-center" />
        <slot name="left-hud-edge-top" />
        <slot name="left-hud-edge-bottom" />
        <slot name="left-hud-edge-left" />
        <slot name="left-hud-edge-right" />
        
      </div>
    </div>
    
    <div class="bridge" />
    
    <div class="lens" id="right-lens">
      <div class="lens-frame"></div>
      <canvas 
        ref="rightCanvas" 
        class="lens-canvas"
        :width="canvasWidth"
        :height="canvasHeight"
      />
      
      <div class="visualization-layer">
        <slot name="right-eye" />
        <slot name="right-hud-top-left" />
        <slot name="right-hud-top-right" />
        <slot name="right-hud-bottom-left" />
        <slot name="right-hud-bottom-right" />
        <slot name="right-hud-center" />
        <slot name="right-hud-edge-top" />
        <slot name="right-hud-edge-bottom" />
        <slot name="right-hud-edge-left" />
        <slot name="right-hud-edge-right" />
      </div>
    </div>
  </div>
</template>

<script setup>
const leftCanvas = ref(null)
const rightCanvas = ref(null)
const canvasWidth = 312
const canvasHeight = 232

const hudPositions = {
  topLeft: 'hud-top-left',
  topRight: 'hud-top-right',
  bottomLeft: 'hud-bottom-left', 
  bottomRight: 'hud-bottom-right',
  center: 'hud-center',
  edgeTop: 'hud-edge-top',
  edgeBottom: 'hud-edge-bottom',
  edgeLeft: 'hud-edge-left',
  edgeRight: 'hud-edge-right'
}

defineExpose({
  leftCanvas,
  rightCanvas,
  leftContext: computed(() => leftCanvas.value?.getContext('2d')),
  rightContext: computed(() => rightCanvas.value?.getContext('2d')),
  hudPositions,
  canvasWidth,
  canvasHeight
})
</script>