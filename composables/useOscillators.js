export const useOscillators = () => {
  const oscillators = ref(new Map())
  let animationFrame = null
  
  // Built-in oscillator types
  const oscillatorTypes = {
    sine: {
      name: 'Sine Wave',
      fn: (time, freq, amp, offset) => Math.sin(time * freq) * amp + offset
    },
    cosine: {
      name: 'Cosine Wave', 
      fn: (time, freq, amp, offset) => Math.cos(time * freq) * amp + offset
    },
    triangle: {
      name: 'Triangle',
      fn: (time, freq, amp, offset) => (2 * amp / Math.PI) * Math.asin(Math.sin(time * freq)) + offset
    },
    square: {
      name: 'Square Wave',
      fn: (time, freq, amp, offset) => (Math.sin(time * freq) > 0 ? amp : -amp) + offset
    },
    sawtooth: {
      name: 'Sawtooth',
      fn: (time, freq, amp, offset) => (2 * amp / Math.PI) * Math.atan(Math.tan(time * freq / 2)) + offset
    },
    rampUp: {
      name: 'Ramp Up',
      fn: (time, freq, amp, offset) => ((time * freq) % (2 * Math.PI) / (2 * Math.PI)) * amp + offset
    },
    rampDown: {
      name: 'Ramp Down',
      fn: (time, freq, amp, offset) => (1 - ((time * freq) % (2 * Math.PI) / (2 * Math.PI))) * amp + offset
    },
    noise: {
      name: 'Random Noise',
      fn: (time, freq, amp, offset) => (Math.random() - 0.5) * 2 * amp + offset
    },
    pulse: {
      name: 'Pulse',
      fn: (time, freq, amp, offset) => {
        const cycle = (time * freq) % (2 * Math.PI)
        return cycle < Math.PI * 0.2 ? amp : 0 + offset
      }
    },
    bounce: {
      name: 'Bounce',
      fn: (time, freq, amp, offset) => Math.abs(Math.sin(time * freq)) * amp + offset
    },
    heartbeat: {
      name: 'Heartbeat',
      fn: (time, freq, amp, offset) => {
        const t = (time * freq) % (2 * Math.PI)
        if (t < 0.3) return Math.sin(t * 10) * amp + offset
        if (t < 0.6) return Math.sin((t - 0.3) * 15) * amp * 0.7 + offset
        return 0 + offset
      }
    },
    breathe: {
      name: 'Breathing',
      fn: (time, freq, amp, offset) => {
        const breath = Math.sin(time * freq * 0.3)
        return Math.pow(Math.abs(breath), 2) * Math.sign(breath) * amp + offset
      }
    }
  }

  // Create oscillator instance
  const createOscillator = (id, config = {}) => {
    const oscillator = {
      id,
      type: config.type || 'sine',
      frequency: config.frequency || 1,
      amplitude: config.amplitude || 50,
      offset: config.offset || 50,
      min: config.min || 0,
      max: config.max || 100,
      phase: config.phase || 0,
      enabled: config.enabled !== false,
      value: 0,
      startTime: performance.now() / 1000
    }
    
    oscillators.value.set(id, oscillator)
    return oscillator
  }

  // Update oscillator config
  const updateOscillator = (id, config) => {
    const osc = oscillators.value.get(id)
    if (osc) {
      Object.assign(osc, config)
    }
  }

  // Get current oscillator value
  const getOscillatorValue = (id) => {
    const osc = oscillators.value.get(id)
    if (!osc || !osc.enabled) return 0
    
    const currentTime = performance.now() / 1000
    const elapsed = currentTime - osc.startTime + osc.phase
    const oscType = oscillatorTypes[osc.type]
    
    if (oscType) {
      let value = oscType.fn(elapsed, osc.frequency, osc.amplitude, osc.offset)
      // Clamp to min/max
      value = Math.max(osc.min, Math.min(osc.max, value))
      osc.value = value
      return value
    }
    
    return 0
  }

  // Update all oscillators
  const updateOscillators = () => {
    oscillators.value.forEach((osc, id) => {
      getOscillatorValue(id)
    })
  }

  // Start animation loop
  const startOscillators = () => {
    if (animationFrame) return
    
    const animate = () => {
      updateOscillators()
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
  }

  // Stop animation loop
  const stopOscillators = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }

  // Remove oscillator
  const removeOscillator = (id) => {
    oscillators.value.delete(id)
  }

  // Get oscillator list for UI
  const getOscillatorTypes = () => {
    return Object.entries(oscillatorTypes).map(([key, config]) => ({
      value: key,
      label: config.name
    }))
  }

  // Preset configurations
  const presets = {
    heartRate: {
      type: 'sine',
      frequency: 1.2,
      amplitude: 15,
      offset: 75,
      min: 60,
      max: 90
    },
    typing: {
      type: 'pulse',
      frequency: 2,
      amplitude: 100,
      offset: 20,
      min: 0,
      max: 120
    },
    breathing: {
      type: 'breathe',
      frequency: 0.3,
      amplitude: 30,
      offset: 50,
      min: 20,
      max: 80
    },
    cpu: {
      type: 'noise',
      frequency: 1,
      amplitude: 20,
      offset: 45,
      min: 25,
      max: 85
    }
  }

  // Auto-start oscillators
  onMounted(() => {
    startOscillators()
  })

  onUnmounted(() => {
    stopOscillators()
  })

  return {
    oscillators,
    oscillatorTypes,
    createOscillator,
    updateOscillator,
    getOscillatorValue,
    removeOscillator,
    getOscillatorTypes,
    presets,
    startOscillators,
    stopOscillators
  }
}