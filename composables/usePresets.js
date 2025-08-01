export const usePresets = () => {
  const currentPreset = ref(null)
  const presetData = ref({})
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  let cycleInterval = null

  // Load preset from JSON
  const loadPreset = async (presetName) => {
    try {
      const response = await fetch(`/presets/${presetName}.json`)
      const preset = await response.json()
      presetData.value = preset
      currentPreset.value = presetName
      currentIndex.value = 0
      return preset
    } catch (error) {
      console.error('Failed to load preset:', error)
      return null
    }
  }

  // Get current layout in preset
  const getCurrentLayout = () => {
    if (!presetData.value.layouts || presetData.value.layouts.length === 0) {
      return null
    }
    return presetData.value.layouts[currentIndex.value]
  }

  // Go to next layout
  const nextLayout = () => {
    if (!presetData.value.layouts) return
    currentIndex.value = (currentIndex.value + 1) % presetData.value.layouts.length
  }

  // Go to previous layout
  const prevLayout = () => {
    if (!presetData.value.layouts) return
    currentIndex.value = currentIndex.value === 0 
      ? presetData.value.layouts.length - 1 
      : currentIndex.value - 1
  }

  // Start autoplay cycle
  const startCycle = () => {
    if (cycleInterval) return
    
    isPlaying.value = true
    cycleInterval = setInterval(() => {
      nextLayout()
    }, presetData.value.cycleDuration || 3000)
  }

  // Stop autoplay cycle
  const stopCycle = () => {
    if (cycleInterval) {
      clearInterval(cycleInterval)
      cycleInterval = null
    }
    isPlaying.value = false
  }

  // Toggle autoplay
  const toggleCycle = () => {
    if (isPlaying.value) {
      stopCycle()
    } else {
      startCycle()
    }
  }

  // Get available presets
  const getAvailablePresets = () => {
    return [
      'pomodoro-set',
      'display-forms'
    ]
  }

  // Get preset info
  const getPresetInfo = () => {
    if (!presetData.value.layouts) return null
    
    return {
      name: presetData.value.name,
      description: presetData.value.description,
      current: currentIndex.value + 1,
      total: presetData.value.layouts.length,
      currentLayout: getCurrentLayout()
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopCycle()
  })

  return {
    currentPreset,
    presetData,
    currentIndex,
    isPlaying,
    loadPreset,
    getCurrentLayout,
    nextLayout,
    prevLayout,
    startCycle,
    stopCycle,
    toggleCycle,
    getAvailablePresets,
    getPresetInfo
  }
}