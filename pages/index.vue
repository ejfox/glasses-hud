<template>
  <div>
    <!-- Glasses Display -->
    <div style="height: 40vh; background: black; display: flex; justify-content: center; align-items: center; gap: 20px;">
      <!-- Left Lens -->
      <div style="width: 300px; height: 200px; border: 2px solid #333; border-radius: 20px; position: relative;">
        <div v-for="(widget, key) in leftWidgets" :key="key" :style="getPosition(widget.position)" style="position: absolute; color: white; font-family: monospace; font-size: 12px;">
          <div v-if="widget.type === 'text'">{{widget.text}}</div>
          <div v-else-if="widget.type === 'decibel'" style="width: 64px; height: 4px; background: #333; position: relative;">
            <div :style="`width: ${getDecibelLevel(widget.id)}%; height: 100%; background: white;`"></div>
          </div>
          <svg v-else-if="widget.type === 'sparkline'" :ref="el => setWidgetRef(widget.id, el)" width="80" height="30"></svg>
          <svg v-else-if="widget.type === 'barchart'" :ref="el => setWidgetRef(widget.id, el)" width="80" height="40"></svg>
          <svg v-else-if="widget.type === 'areachart'" :ref="el => setWidgetRef(widget.id, el)" width="80" height="30"></svg>
        </div>
      </div>
      
      <!-- Bridge -->
      <div style="width: 20px; height: 6px; background: #333; margin-top: -100px;"></div>
      
      <!-- Right Lens -->
      <div style="width: 300px; height: 200px; border: 2px solid #333; border-radius: 20px; position: relative;">
        <div v-for="(widget, key) in rightWidgets" :key="key" :style="getPosition(widget.position)" style="position: absolute; color: white; font-family: monospace; font-size: 12px;">
          <div v-if="widget.type === 'text'">{{widget.text}}</div>
          <div v-else-if="widget.type === 'decibel'" style="width: 64px; height: 4px; background: #333; position: relative;">
            <div :style="`width: ${getDecibelLevel(widget.id)}%; height: 100%; background: white;`"></div>
          </div>
          <svg v-else-if="widget.type === 'sparkline'" :ref="el => setWidgetRef(widget.id, el)" width="80" height="30"></svg>
          <svg v-else-if="widget.type === 'barchart'" :ref="el => setWidgetRef(widget.id, el)" width="80" height="40"></svg>
          <svg v-else-if="widget.type === 'areachart'" :ref="el => setWidgetRef(widget.id, el)" width="80" height="30"></svg>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div style="height: 60vh; background: white; padding: 40px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; max-width: 800px;">
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">EYE</label>
          <select v-model="selectedEye" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="left">LEFT</option>
            <option value="right">RIGHT</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">TYPE</label>
          <select v-model="widgetType" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="text">TEXT</option>
            <option value="decibel">DECIBEL METER</option>
            <option value="sparkline">SPARKLINE</option>
            <option value="barchart">BAR CHART</option>
            <option value="areachart">AREA CHART</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">POSITION</label>
          <select v-model="selectedPosition" style="width: 100%; padding: 8px; font-family: monospace;">
            <option value="top-left">TOP LEFT</option>
            <option value="top-right">TOP RIGHT</option>
            <option value="bottom-left">BOTTOM LEFT</option>
            <option value="bottom-right">BOTTOM RIGHT</option>
            <option value="center">CENTER</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 10px; font-family: monospace;">TEXT</label>
          <input v-model="widgetText" style="width: 100%; padding: 8px; font-family: monospace;" placeholder="Enter text">
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <button @click="addWidget" style="padding: 10px 20px; background: black; color: white; border: none; font-family: monospace; cursor: pointer;">
          ADD WIDGET
        </button>
        <button @click="clearAll" style="padding: 10px 20px; background: #999; color: white; border: none; font-family: monospace; cursor: pointer; margin-left: 10px;">
          CLEAR ALL
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRafFn } from '@vueuse/core'
import * as d3 from 'd3'

const selectedEye = ref('left')
const selectedPosition = ref('top-left')
const widgetType = ref('text')
const widgetText = ref('')
const leftWidgets = ref([])
const rightWidgets = ref([])
let widgetIdCounter = 0

// Store decibel values for each widget
const decibelValues = ref(new Map())

// Store D3 chart data for each widget
const chartData = ref(new Map())

// Store SVG element refs for D3 widgets
const widgetRefs = ref(new Map())

const setWidgetRef = (widgetId, el) => {
  if (el) {
    widgetRefs.value.set(widgetId, el)
  }
}

const getPosition = (position) => {
  const positions = {
    'top-left': 'top: 10px; left: 10px;',
    'top-right': 'top: 10px; right: 10px;',
    'bottom-left': 'bottom: 10px; left: 10px;',
    'bottom-right': 'bottom: 10px; right: 10px;',
    'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
  }
  return positions[position] || positions['top-left']
}

const addWidget = () => {
  if (widgetType.value === 'text' && !widgetText.value.trim()) return
  
  const widget = {
    id: ++widgetIdCounter,
    type: widgetType.value,
    position: selectedPosition.value,
    text: widgetText.value
  }
  
  // Initialize chart data for D3 widgets
  if (['sparkline', 'barchart', 'areachart'].includes(widgetType.value)) {
    // Generate initial data points
    const dataPoints = Array.from({ length: 20 }, () => Math.random() * 100)
    chartData.value.set(widget.id, dataPoints)
  }
  
  if (selectedEye.value === 'left') {
    leftWidgets.value.push(widget)
  } else {
    rightWidgets.value.push(widget)
  }
  
  widgetText.value = ''
  
  // Render D3 chart on next tick
  if (['sparkline', 'barchart', 'areachart'].includes(widget.type)) {
    nextTick(() => renderD3Widget(widget))
  }
}

const getDecibelLevel = (widgetId) => {
  return decibelValues.value.get(widgetId) || 0
}

// D3 Rendering Functions
const renderD3Widget = (widget) => {
  const svg = widgetRefs.value.get(widget.id)
  if (!svg) return
  
  const data = chartData.value.get(widget.id)
  if (!data) return
  
  // Clear previous content
  d3.select(svg).selectAll('*').remove()
  
  if (widget.type === 'sparkline') {
    renderSparkline(svg, data)
  } else if (widget.type === 'barchart') {
    renderBarChart(svg, data)
  } else if (widget.type === 'areachart') {
    renderAreaChart(svg, data)
  }
}

const renderSparkline = (svg, data) => {
  const width = 80
  const height = 30
  const margin = 2
  
  const x = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin, width - margin])
  
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin, margin])
  
  const line = d3.line()
    .x((d, i) => x(i))
    .y(d => y(d))
    .curve(d3.curveMonotoneX)
  
  d3.select(svg)
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-width', 1.5)
    .attr('d', line)
}

const renderBarChart = (svg, data) => {
  const width = 80
  const height = 40
  const margin = 2
  
  // Only show last 10 data points for bars
  const displayData = data.slice(-10)
  
  const x = d3.scaleBand()
    .domain(d3.range(displayData.length))
    .range([margin, width - margin])
    .padding(0.1)
  
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin, margin])
  
  d3.select(svg)
    .selectAll('rect')
    .data(displayData)
    .join('rect')
    .attr('x', (d, i) => x(i))
    .attr('y', d => y(d))
    .attr('width', x.bandwidth())
    .attr('height', d => height - margin - y(d))
    .attr('fill', 'white')
}

const renderAreaChart = (svg, data) => {
  const width = 80
  const height = 30
  const margin = 2
  
  const x = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin, width - margin])
  
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin, margin])
  
  const area = d3.area()
    .x((d, i) => x(i))
    .y0(height - margin)
    .y1(d => y(d))
    .curve(d3.curveMonotoneX)
  
  d3.select(svg)
    .append('path')
    .datum(data)
    .attr('fill', 'white')
    .attr('fill-opacity', 0.7)
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('d', area)
}

// Update decibel values every second
const updateDecibelValues = () => {
  const allWidgets = [...leftWidgets.value, ...rightWidgets.value]
  allWidgets.forEach(widget => {
    if (widget.type === 'decibel') {
      // Generate realistic decibel reading (30-90 dB range)
      const baseLevel = Math.floor(Math.random() * 61) + 30 // 30-90
      // Add some fluctuation
      const fluctuation = Math.floor(Math.random() * 11) - 5 // -5 to +5
      const finalLevel = Math.max(0, Math.min(100, baseLevel + fluctuation))
      
      // Convert to percentage for the bar
      const percentage = finalLevel
      decibelValues.value.set(widget.id, percentage)
    }
    
    // Update D3 chart data
    if (['sparkline', 'barchart', 'areachart'].includes(widget.type)) {
      const data = chartData.value.get(widget.id) || []
      // Add new data point and keep last 20 points
      const newValue = Math.random() * 100
      const newData = [...data, newValue].slice(-20)
      chartData.value.set(widget.id, newData)
      
      // Re-render the chart
      renderD3Widget(widget)
    }
  })
}

const clearAll = () => {
  leftWidgets.value = []
  rightWidgets.value = []
  decibelValues.value.clear()
  chartData.value.clear()
  widgetRefs.value.clear()
}

// Animation control refs
let intervalId = null
let rafPause = null

// Only run animations on client-side
onMounted(() => {
  // Update every second
  intervalId = setInterval(updateDecibelValues, 1000)
  
  // Also use RAF for smooth updates
  const { pause } = useRafFn(() => {
    // Slight random fluctuations between second updates
    const allWidgets = [...leftWidgets.value, ...rightWidgets.value]
    allWidgets.forEach(widget => {
      if (widget.type === 'decibel') {
        const currentValue = decibelValues.value.get(widget.id) || 0
        const microFluctuation = (Math.random() - 0.5) * 4 // -2 to +2
        const newValue = Math.max(0, Math.min(100, currentValue + microFluctuation))
        decibelValues.value.set(widget.id, newValue)
      }
    })
  })
  rafPause = pause
})

// Cleanup on unmount
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (rafPause) rafPause()
})
</script>