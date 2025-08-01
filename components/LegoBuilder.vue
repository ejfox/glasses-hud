<template>
  <div class="lego-builder">
    <GlassesHUD>
      <!-- Left lens canvas -->
      <template #left-eye>
        <div 
          class="build-area" 
          @click="handleAreaClick($event, 'left')"
          @drop="handleDrop($event, 'left')"
          @dragover.prevent
        >
          <component
            v-for="widget in leftWidgets"
            :key="widget.id"
            :is="getWidgetComponent(widget.type)"
            v-bind="widget.props"
            :is-selected="selectedWidget?.id === widget.id"
            :show-handle="true"
            @select="selectWidget(widget)"
            @mousedown="startDrag($event, widget)"
          />
        </div>
      </template>
      
      <!-- Right lens canvas -->
      <template #right-eye>
        <div 
          class="build-area"
          @click="handleAreaClick($event, 'right')"
          @drop="handleDrop($event, 'right')"
          @dragover.prevent
        >
          <component
            v-for="widget in rightWidgets"
            :key="widget.id"
            :is="getWidgetComponent(widget.type)"
            v-bind="widget.props"
            :is-selected="selectedWidget?.id === widget.id"
            :show-handle="true"
            @select="selectWidget(widget)"
            @mousedown="startDrag($event, widget)"
          />
        </div>
      </template>
    </GlassesHUD>

    <!-- Widget Palette -->
    <div class="widget-palette">
      <h3>Widget Legos</h3>
      <div class="palette-grid">
        <div
          v-for="widget in widgetTypes"
          :key="widget.type"
          class="palette-item"
          draggable="true"
          @dragstart="startPaletteDrag($event, widget)"
          @click="addWidget(widget)"
        >
          <div class="widget-preview" :style="widget.style">
            {{ widget.icon }}
          </div>
          <span>{{ widget.name }}</span>
        </div>
      </div>
    </div>

    <!-- Property Editor -->
    <div class="property-editor" v-if="selectedWidget">
      <h3>Properties</h3>
      <div class="prop-group">
        <label>Position</label>
        <input type="number" v-model.number="selectedWidget.props.x" @input="updateWidget">
        <input type="number" v-model.number="selectedWidget.props.y" @input="updateWidget">
      </div>
      
      <div class="prop-group">
        <label>Size</label>
        <input type="number" v-model.number="selectedWidget.props.width" @input="updateWidget">
        <input type="number" v-model.number="selectedWidget.props.height" @input="updateWidget">
      </div>
      
      <div class="prop-group" v-if="selectedWidget.type === 'text'">
        <label>Text</label>
        <input type="text" v-model="selectedWidget.props.text" @input="updateWidget">
        <label>Data Source</label>
        <select v-model="selectedWidget.props.dataSource" @change="updateWidget">
          <option value="">Static</option>
          <option value="time">Current Time</option>
          <option value="random">Random Number</option>
          <optgroup label="Oscillators">
            <option value="osc:sine">Sine Wave</option>
            <option value="osc:rampUp">Ramp Up</option>
            <option value="osc:rampDown">Ramp Down</option>
            <option value="osc:heartbeat">Heartbeat</option>
            <option value="osc:breathe">Breathing</option>
            <option value="osc:noise">Random Noise</option>
            <option value="osc:pulse">Pulse</option>
            <option value="osc:bounce">Bounce</option>
          </optgroup>
        </select>
      </div>
      
      <div class="prop-group" v-if="selectedWidget.type === 'bars'">
        <label>Bar Count</label>
        <input type="number" v-model.number="selectedWidget.props.barCount" @input="updateWidget">
        <label>Data Source</label>
        <select v-model="selectedWidget.props.dataSource" @change="updateWidget">
          <option value="random">Random</option>
          <option value="static">Static</option>
          <optgroup label="Oscillators">
            <option value="osc:sine">Sine Wave</option>
            <option value="osc:rampUp">Ramp Up</option>
            <option value="osc:rampDown">Ramp Down</option>
            <option value="osc:heartbeat">Heartbeat</option>
            <option value="osc:breathe">Breathing</option>
            <option value="osc:noise">Random Noise</option>
            <option value="osc:pulse">Pulse</option>
            <option value="osc:bounce">Bounce</option>
          </optgroup>
        </select>
      </div>
      
      <button @click="deleteWidget" class="delete-btn">Delete Widget</button>
    </div>

    <!-- Template Library -->
    <TemplateLibrary 
      v-if="showTemplates"
      @apply-template="applyTemplate"
      class="template-library-panel"
    />

    <!-- Export/Import -->
    <div class="export-panel">
      <button @click="showTemplates = !showTemplates">
        {{ showTemplates ? 'Hide' : 'Templates' }}
      </button>
      <button @click="exportLayout">Export JSON</button>
      <button @click="clearAll">Clear All</button>
      <textarea 
        v-model="exportedJSON" 
        v-if="exportedJSON"
        rows="8" 
        cols="30"
        readonly
      />
    </div>

    <!-- Performance Overlay -->
    <PerformanceOverlay />
  </div>
</template>

<script setup>
const leftWidgets = ref([])
const rightWidgets = ref([])
const selectedWidget = ref(null)
const exportedJSON = ref('')
const showTemplates = ref(false)
let draggedWidget = null
let widgetIdCounter = 0

const widgetTypes = [
  {
    type: 'text',
    name: 'Text',
    icon: 'Aa',
    style: { fontSize: '12px' },
    defaultProps: {
      x: 50, y: 50, width: 60, height: 16,
      text: 'TEXT', fontSize: 11, dataSource: null
    }
  },
  {
    type: 'bars',
    name: 'Bars', 
    icon: '▃▅▇',
    style: { fontSize: '10px' },
    defaultProps: {
      x: 50, y: 50, width: 32, height: 16,
      barCount: 8, dataSource: 'random'
    }
  }
]

const getWidgetComponent = (type) => {
  const components = {
    text: 'TextWidget',
    bars: 'BarWidget'
  }
  return components[type] || 'WidgetBase'
}

const createWidget = (type, props = {}) => {
  const widgetType = widgetTypes.find(w => w.type === type)
  return {
    id: ++widgetIdCounter,
    type,
    props: { ...widgetType.defaultProps, ...props }
  }
}

const addWidget = (widgetType, eye = 'right', position = { x: 50, y: 50 }) => {
  const widget = createWidget(widgetType.type, position)
  
  if (eye === 'left') {
    leftWidgets.value.push(widget)
  } else {
    rightWidgets.value.push(widget)
  }
  
  selectWidget(widget)
}

const selectWidget = (widget) => {
  selectedWidget.value = widget
}

const updateWidget = () => {
  // Trigger reactivity
  if (selectedWidget.value) {
    const widgets = selectedWidget.value.eye === 'left' ? leftWidgets : rightWidgets
    const index = widgets.value.findIndex(w => w.id === selectedWidget.value.id)
    if (index >= 0) {
      widgets.value[index] = { ...selectedWidget.value }
    }
  }
}

const deleteWidget = () => {
  if (!selectedWidget.value) return
  
  leftWidgets.value = leftWidgets.value.filter(w => w.id !== selectedWidget.value.id)
  rightWidgets.value = rightWidgets.value.filter(w => w.id !== selectedWidget.value.id)
  
  selectedWidget.value = null
}

const handleAreaClick = (event, eye) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Deselect if clicking empty area
  selectedWidget.value = null
}

const startPaletteDrag = (event, widgetType) => {
  event.dataTransfer.setData('widget-type', widgetType.type)
}

const handleDrop = (event, eye) => {
  const widgetType = event.dataTransfer.getData('widget-type')
  if (widgetType) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const widgetTypeObj = widgetTypes.find(w => w.type === widgetType)
    addWidget(widgetTypeObj, eye, { x, y })
  }
}

const startDrag = (event, widget) => {
  draggedWidget = widget
  // TODO: Implement widget dragging
}

const exportLayout = () => {
  const layout = {
    name: 'custom-layout',
    left: leftWidgets.value,
    right: rightWidgets.value
  }
  exportedJSON.value = JSON.stringify(layout, null, 2)
}

const clearAll = () => {
  leftWidgets.value = []
  rightWidgets.value = []
  selectedWidget.value = null
  exportedJSON.value = ''
}

const applyTemplate = (template) => {
  clearAll()
  
  // Apply template layout
  if (template.layout.left) {
    Object.entries(template.layout.left).forEach(([position, config]) => {
      const widget = createWidget(config.type, {
        ...getPositionCoords(position),
        ...config
      })
      leftWidgets.value.push(widget)
    })
  }
  
  if (template.layout.right) {
    Object.entries(template.layout.right).forEach(([position, config]) => {
      const widget = createWidget(config.type, {
        ...getPositionCoords(position),
        ...config
      })
      rightWidgets.value.push(widget)
    })
  }
  
  showTemplates.value = false
}

const getPositionCoords = (position) => {
  const positions = {
    topLeft: { x: 10, y: 10 },
    topRight: { x: 200, y: 10 },
    bottomLeft: { x: 10, y: 150 },
    bottomRight: { x: 200, y: 150 },
    center: { x: 100, y: 80 },
    edgeBottom: { x: 100, y: 180 }
  }
  return positions[position] || { x: 50, y: 50 }
}
</script>

<style scoped>
.lego-builder {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
}

.build-area {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.widget-palette {
  position: fixed;
  left: 20px;
  top: 20px;
  width: 200px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: monospace;
}

.palette-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.palette-item {
  padding: 8px;
  border: 1px solid #555;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.palette-item:hover {
  border-color: #0ff;
  background: rgba(0, 255, 255, 0.1);
}

.widget-preview {
  margin-bottom: 4px;
  font-weight: bold;
}

.property-editor {
  position: fixed;
  right: 20px;
  top: 20px;
  width: 200px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: monospace;
  font-size: 11px;
}

.prop-group {
  margin-bottom: 12px;
}

.prop-group label {
  display: block;
  margin-bottom: 4px;
  color: #ccc;
}

.prop-group input,
.prop-group select {
  width: 100%;
  background: #222;
  border: 1px solid #555;
  color: #fff;
  padding: 4px;
  border-radius: 2px;
  margin-bottom: 4px;
}

.delete-btn {
  background: #800;
  border: 1px solid #a00;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.export-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-family: monospace;
}

.export-panel button {
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
}

.export-panel textarea {
  width: 100%;
  background: #222;
  border: 1px solid #555;
  color: #fff;
  font-family: monospace;
  font-size: 9px;
  padding: 8px;
}

.template-library-panel {
  position: fixed;
  left: 240px;
  top: 20px;
}

h3 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #0ff;
}
</style>