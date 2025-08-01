<template>
  <div>
    <LayoutRenderer :layout="currentLayout" />
    
    <div class="controls">
      <select v-model="currentLayout">
        <option v-for="layout in availableLayouts" :key="layout" :value="layout">
          {{ layout }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
const { getAvailableLayouts } = useLayouts()

const currentLayout = ref('corners-only')
const availableLayouts = getAvailableLayouts()
</script>

<style scoped>
.controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.controls select {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}
</style>