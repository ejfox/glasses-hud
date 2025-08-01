export const useSimulation = () => {
  const currentMode = ref('office')
  const isActive = ref(false)
  const simulationData = ref({})

  // Simulation modes with realistic data patterns
  const modes = {
    office: {
      name: 'Office Work',
      description: 'Desk work with typing, meetings, focus sessions',
      dataSources: {
        wpm: () => Math.floor(Math.random() * 30) + 45, // 45-75 WPM
        heartRate: () => Math.floor(Math.random() * 15) + 65, // 65-80 BPM
        meetings: () => Math.random() > 0.7 ? 'MEETING IN 5MIN' : '',
        notifications: () => Math.floor(Math.random() * 8) + 1,
        batteryLevel: () => Math.max(20, 100 - Math.floor(Date.now() / 60000) % 80),
        focusScore: () => Math.floor(Math.random() * 30) + 70
      }
    },
    
    walking: {
      name: 'Walking/Outdoor',
      description: 'Walking around with GPS, fitness tracking',
      dataSources: {
        speed: () => (Math.random() * 2 + 2).toFixed(1) + ' mph',
        steps: () => Math.floor(Math.random() * 100) + 8200,
        heartRate: () => Math.floor(Math.random() * 25) + 85, // 85-110 BPM
        distance: () => (Math.random() * 0.5 + 2.1).toFixed(1) + ' mi',
        elevation: () => Math.floor(Math.random() * 10) + 2 + '%',
        weather: () => Math.floor(Math.random() * 15) + 68 + '°F',
        airQuality: () => Math.random() > 0.8 ? 'MODERATE' : 'GOOD'
      }
    },
    
    driving: {
      name: 'Driving/Navigation',
      description: 'Car navigation with traffic, ETA, speed',
      dataSources: {
        speed: () => Math.floor(Math.random() * 20) + 35 + ' mph',
        eta: () => Math.floor(Math.random() * 15) + 8 + ' min',
        nextTurn: () => ['→ 0.3mi', '← 0.7mi', '↑ 1.2mi'][Math.floor(Math.random() * 3)],
        traffic: () => Math.random() > 0.6 ? 'HEAVY' : 'LIGHT',
        fuelLevel: () => Math.floor(Math.random() * 30) + 45 + '%',
        temperature: () => Math.floor(Math.random() * 8) + 70 + '°F'
      }
    },
    
    gaming: {
      name: 'Gaming Session',
      description: 'Gaming with FPS, CPU, temperature monitoring',
      dataSources: {
        fps: () => Math.floor(Math.random() * 20) + 140,
        cpu: () => Math.floor(Math.random() * 30) + 45 + '%',
        gpu: () => Math.floor(Math.random() * 25) + 60 + '%',
        temp: () => Math.floor(Math.random() * 15) + 65 + '°C',
        ping: () => Math.floor(Math.random() * 40) + 12 + 'ms',
        kda: () => Math.floor(Math.random() * 15) + 8 + '/' + Math.floor(Math.random() * 8) + 2
      }
    },
    
    fitness: {
      name: 'Workout/Exercise',
      description: 'High intensity exercise with biometrics',
      dataSources: {
        heartRate: () => Math.floor(Math.random() * 40) + 130, // 130-170 BPM
        calories: () => Math.floor(Math.random() * 50) + 245,
        duration: () => Math.floor(Date.now() / 1000) % 3600 + 's',
        reps: () => Math.floor(Math.random() * 5) + 8,
        sets: () => '3/5',
        restTime: () => Math.floor(Math.random() * 60) + 30 + 's'
      }
    }
  }

  // Get current simulation data
  const getSimulationValue = (key) => {
    if (!isActive.value) return null
    
    const mode = modes[currentMode.value]
    if (!mode || !mode.dataSources[key]) return null
    
    return mode.dataSources[key]()
  }

  // Start simulation
  const startSimulation = (mode) => {
    currentMode.value = mode
    isActive.value = true
    
    // Update simulation data periodically
    const interval = setInterval(() => {
      if (!isActive.value) {
        clearInterval(interval)
        return
      }
      
      const mode = modes[currentMode.value]
      if (mode) {
        Object.keys(mode.dataSources).forEach(key => {
          simulationData.value[key] = mode.dataSources[key]()
        })
      }
    }, 1000)
  }

  // Stop simulation
  const stopSimulation = () => {
    isActive.value = false
    simulationData.value = {}
  }

  // Get available modes
  const getModes = () => {
    return Object.entries(modes).map(([key, mode]) => ({
      value: key,
      name: mode.name,
      description: mode.description
    }))
  }

  return {
    currentMode,
    isActive,
    simulationData,
    modes,
    getSimulationValue,
    startSimulation,
    stopSimulation,
    getModes
  }
}