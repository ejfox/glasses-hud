<template>
  <div>
    <LayoutRenderer :layout="currentLayout" />
    
    <div class="dev-panel">
      <div class="panel-section">
        <label>Layout:</label>
        <select v-model="currentLayout">
          <option v-for="layout in availableLayouts" :key="layout" :value="layout">
            {{ layout }}
          </option>
        </select>
      </div>
      
      <div class="panel-section">
        <label>Quick Add Widget:</label>
        <select v-model="quickWidget">
          <option value="">Select widget...</option>
          <option value="decibel-meter">Decibel Meter (64x4)</option>
          <option value="waveform">Waveform (32x8)</option>
          <option value="bars">Bar Chart (24x16)</option>
          <option value="dots">Dot Matrix (16x16)</option>
        </select>
        
        <select v-model="quickPosition">
          <option value="bottom-center">Bottom Center</option>
          <option value="center">Center</option>
          <option value="top-center">Top Center</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
        
        <select v-model="quickEye">
          <option value="right">Right Eye</option>
          <option value="left">Left Eye</option>
        </select>
        
        <button @click="addQuickWidget">Add</button>
      </div>
      
      <div class="panel-section">
        <textarea 
          v-model="jsonLayout" 
          @input="updateFromJSON"
          rows="12"
          cols="40"
          placeholder="Edit JSON directly..."
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const { getAvailableLayouts, loadLayout, layoutData } = useLayouts()

const currentLayout = ref('widget-demo')
const availableLayouts = getAvailableLayouts()
const jsonLayout = ref('')
const quickWidget = ref('')
const quickPosition = ref('bottom-center')
const quickEye = ref('right')

// Load initial layout and populate JSON editor
const initLayout = async () => {
  await loadLayout(currentLayout.value)
  jsonLayout.value = JSON.stringify(layoutData.value, null, 2)
}

// Update layout when dropdown changes
watch(currentLayout, async (newLayout) => {
  await loadLayout(newLayout)
  jsonLayout.value = JSON.stringify(layoutData.value, null, 2)
})

// Update from JSON editor
const updateFromJSON = () => {
  try {
    const parsed = JSON.parse(jsonLayout.value)
    layoutData.value = parsed
  } catch (e) {
    // Invalid JSON, ignore
  }
}

// Quick widget addition
const addQuickWidget = () => {
  if (!quickWidget.value) return
  
  const widgetConfig = {
    type: quickWidget.value,
    ...(quickWidget.value === 'decibel-meter' && { width: 64, height: 4, value: 65 }),
    ...(quickWidget.value === 'waveform' && { width: 32, height: 8 }),
    ...(quickWidget.value === 'bars' && { width: 24, height: 16 }),
    ...(quickWidget.value === 'dots' && { width: 16, height: 16 })
  }
  
  // Convert position format
  const positionMap = {
    'bottom-center': 'bottomCenter',
    'top-center': 'topCenter',
    'bottom-left': 'bottomLeft',
    'bottom-right': 'bottomRight',
    'center': 'center'
  }
  
  const position = positionMap[quickPosition.value] || 'center'
  
  // Add to layout
  if (!layoutData.value[quickEye.value]) {
    layoutData.value[quickEye.value] = {}
  }
  
  layoutData.value[quickEye.value][position] = widgetConfig
  
  // Update JSON display
  jsonLayout.value = JSON.stringify(layoutData.value, null, 2)
  
  // Reset selections
  quickWidget.value = ''
}

onMounted(initLayout)
</script>

<style scoped>
.dev-panel {
  position: fixed;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.9);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #333;
  font-family: monospace;
  font-size: 11px;
  color: #fff;
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #333;
}

.panel-section:last-child {
  border-bottom: none;
}

label {
  display: block;
  margin-bottom: 4px;
  color: #ccc;
}

select, button, textarea {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #555;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 10px;
  margin: 2px 4px 2px 0;
}

button {
  background: rgba(0, 150, 50, 0.8);
  cursor: pointer;
}

button:hover {
  background: rgba(0, 200, 50, 0.8);
}

textarea {
  width: 100%;
  resize: vertical;
  font-size: 9px;
  line-height: 1.2;
}
</style>