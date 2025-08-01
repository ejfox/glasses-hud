export const useLayouts = () => {
  const currentLayout = ref('minimal')
  const layoutData = ref({})

  // Available content types
  const contentTypes = {
    text: (content) => content,
    time: (format = 'HH:mm') => {
      const now = new Date()
      return now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        ...(format.includes('ss') && { second: '2-digit' })
      })
    },
    counter: (content) => content,
    weather: (format) => {
      // Mock weather data
      return format === 'temp' ? '72°F' : 'Clear'
    },
    biometric: (content) => content,
    notification: (content) => content,
    // Widget types
    'decibel-meter': (config) => config,
    waveform: (config) => config,
    bars: (config) => config,
    dots: (config) => config
  }

  // Load layout from JSON
  const loadLayout = async (layoutName) => {
    try {
      const response = await fetch(`/layouts/${layoutName}.json`)
      const layout = await response.json()
      layoutData.value = layout
      currentLayout.value = layoutName
      return layout
    } catch (error) {
      console.error('Failed to load layout:', error)
      return null
    }
  }

  // Get processed content for a field
  const getContent = (field) => {
    if (!field) return ''
    
    const processor = contentTypes[field.type]
    if (processor) {
      return processor(field.content || field.format)
    }
    return field.content || ''
  }

  // Get all available layouts
  const getAvailableLayouts = () => {
    return [
      'corners-only',
      'four-corners', 
      'edges',
      'center-focus',
      'mixed-zones',
      'full-layout',
      'widget-demo',
      'oscillator-demo',
      'idea-1-focus-timer',
      'idea-2-walking-data', 
      'idea-3-code-mode',
      'pomodoro-1-minimal',
      'pomodoro-2-stacked',
      'pomodoro-3-corner',
      'pomodoro-4-dots',
      'pomodoro-5-wave',
      'pomodoro-6-full'
    ]
  }

  // Generate layout structure for Vue template
  const generateLayoutStructure = () => {
    if (!layoutData.value.left && !layoutData.value.right) {
      return { left: {}, right: {} }
    }

    const structure = {
      left: {},
      right: {}
    }

    // Process left eye
    if (layoutData.value.left) {
      Object.entries(layoutData.value.left).forEach(([position, field]) => {
        structure.left[position] = {
          content: getContent(field),
          type: field.type
        }
      })
    }

    // Process right eye  
    if (layoutData.value.right) {
      Object.entries(layoutData.value.right).forEach(([position, field]) => {
        structure.right[position] = {
          content: getContent(field),
          type: field.type
        }
      })
    }

    return structure
  }

  return {
    currentLayout,
    layoutData,
    loadLayout,
    getContent,
    getAvailableLayouts,
    generateLayoutStructure,
    contentTypes
  }
}