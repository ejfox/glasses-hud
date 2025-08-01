<template>
  <div>
    <LayoutRenderer :layout="currentLayout" v-if="currentLayout" />
    
    <div class="preset-controls">
      <div class="preset-selector">
        <label>Preset:</label>
        <select v-model="selectedPreset" @change="changePreset">
          <option value="">Select preset...</option>
          <option v-for="preset in availablePresets" :key="preset" :value="preset">
            {{ preset }}
          </option>
        </select>
      </div>
      
      <div v-if="presetInfo" class="preset-info">
        <h3>{{ presetInfo.name }}</h3>
        <p>{{ presetInfo.description }}</p>
        <p>{{ presetInfo.current }} / {{ presetInfo.total }}</p>
        <p>Current: <strong>{{ presetInfo.currentLayout }}</strong></p>
      </div>
      
      <div class="preset-navigation" v-if="selectedPreset">
        <button @click="prevLayout">◀ Prev</button>
        <button @click="toggleCycle" :class="{ active: isPlaying }">
          {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
        </button>
        <button @click="nextLayout">Next ▶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { 
  loadPreset, 
  getCurrentLayout,
  nextLayout,
  prevLayout, 
  toggleCycle,
  getAvailablePresets,
  getPresetInfo,
  isPlaying
} = usePresets()

const selectedPreset = ref('')
const availablePresets = getAvailablePresets()
const currentLayout = ref(null)
const presetInfo = ref(null)

const changePreset = async () => {
  if (!selectedPreset.value) return
  
  await loadPreset(selectedPreset.value)
  updateCurrentLayout()
}

const updateCurrentLayout = () => {
  currentLayout.value = getCurrentLayout()
  presetInfo.value = getPresetInfo()
}

// Watch for layout changes during cycling
const layoutWatcher = setInterval(() => {
  if (selectedPreset.value) {
    updateCurrentLayout()
  }
}, 100)

onUnmounted(() => {
  clearInterval(layoutWatcher)
})
</script>

<style scoped>
.preset-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #333;
  font-family: monospace;
  color: #fff;
  text-align: center;
  min-width: 300px;
}

.preset-selector {
  margin-bottom: 12px;
}

.preset-info {
  margin: 12px 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.preset-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.preset-info p {
  margin: 2px 0;
  font-size: 11px;
  opacity: 0.8;
}

.preset-navigation {
  display: flex;
  gap: 8px;
  justify-content: center;
}

label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  color: #ccc;
}

select, button {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #555;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
  cursor: pointer;
}

button:hover {
  background: rgba(255, 255, 255, 0.1);
}

button.active {
  background: rgba(0, 150, 50, 0.8);
}
</style>