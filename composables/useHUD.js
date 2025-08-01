export const useHUD = () => {
  // 2026 HUD positioning - multi-layer spatial computing
  const hudZones = {
    // Corner positions - status & system info
    topLeft: 'hud-top-left',
    topRight: 'hud-top-right', 
    bottomLeft: 'hud-bottom-left',
    bottomRight: 'hud-bottom-right',
    
    // Center for critical alerts & AI interactions
    center: 'hud-center',
    
    // Edge positions for ambient data streams
    edgeTop: 'hud-edge-top',
    edgeBottom: 'hud-edge-bottom',
    edgeLeft: 'hud-edge-left',
    edgeRight: 'hud-edge-right'
  }

  // Spatial depth layers for 2026 AR
  const depthLayers = {
    immediate: 0.5,    // 0.5m - urgent alerts, direct interactions
    personal: 1.0,     // 1m - personal data, notifications  
    contextual: 2.0,   // 2m - contextual AI, ambient info
    environmental: 5.0, // 5m - world-anchored data
    background: 10.0   // 10m+ - atmospheric visualizations
  }

  // Text utilities for different contexts
  const textStyles = {
    status: 'text-xs font-medium opacity-70',
    notification: 'text-sm font-semibold',
    ambient: 'text-xs opacity-50',
    alert: 'text-sm font-bold text-red-400',
    info: 'text-xs text-blue-400'
  }

  // Color schemes inspired by smart glasses UX patterns
  const colorSchemes = {
    default: '#ffffff',
    success: '#00ff88',
    warning: '#ff8800', 
    error: '#ff4444',
    info: '#0088ff',
    ambient: '#888888'
  }

  // Helper to create positioned text elements
  const createHUDText = (text, zone, style = 'status', color = 'default') => {
    return {
      text,
      zone: hudZones[zone],
      class: textStyles[style],
      style: `color: ${colorSchemes[color]}`
    }
  }

  // Canvas drawing utilities for complex visualizations
  const drawCircle = (ctx, x, y, radius, color = '#ffffff', alpha = 1) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  const drawLine = (ctx, x1, y1, x2, y2, color = '#ffffff', alpha = 1, width = 1) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
  }

  const drawText = (ctx, text, x, y, color = '#ffffff', alpha = 1, font = '12px monospace') => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.font = font
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  // Animation helpers for smooth transitions
  const fadeIn = (element, duration = 300) => {
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ease-in-out`
    setTimeout(() => element.style.opacity = '1', 10)
  }

  const slideIn = (element, direction = 'left', duration = 300) => {
    const transforms = {
      left: 'translateX(-20px)',
      right: 'translateX(20px)', 
      top: 'translateY(-20px)',
      bottom: 'translateY(20px)'
    }
    
    element.style.transform = transforms[direction]
    element.style.opacity = '0'
    element.style.transition = `all ${duration}ms ease-out`
    
    setTimeout(() => {
      element.style.transform = 'translateX(0) translateY(0)'
      element.style.opacity = '1'
    }, 10)
  }

  // 2026 Advanced AR utilities
  const createSpatialWidget = (type, props, position, depth = depthLayers.personal) => {
    return {
      type,
      props,
      x: position.x || 0,
      y: position.y || 0,
      depth,
      component: 'SpatialWidget',
      interactive: true,
      id: Date.now() + Math.random()
    }
  }

  // AI context detection patterns
  const contextPatterns = {
    navigation: /\b(directions?|navigate|route|turn|left|right|straight)\b/i,
    social: /\b(message|call|text|notification|friend)\b/i,
    health: /\b(heart rate|steps|calories|health|fitness)\b/i,
    weather: /\b(weather|temperature|rain|sunny|cloudy)\b/i,
    time: /\b(time|clock|schedule|meeting|appointment)\b/i
  }

  // Gesture simulation for interaction testing
  const simulateGesture = (type, data = {}) => {
    const gestures = {
      tap: { x: data.x || 150, y: data.y || 100, duration: 100 },
      swipe: { 
        start: { x: data.startX || 50, y: data.startY || 100 },
        end: { x: data.endX || 250, y: data.endY || 100 },
        duration: 300
      },
      pinch: { scale: data.scale || 0.8, duration: 200 },
      gaze: { x: data.x || 160, y: data.y || 120, duration: 1000 }
    }
    
    return gestures[type] || gestures.tap
  }

  // Eye tracking zones for 2026 interaction
  const gazeZones = {
    topBand: { y: [0, 60], priority: 'high' },
    centerFocus: { x: [100, 220], y: [80, 160], priority: 'immediate' },
    bottomBand: { y: [180, 240], priority: 'ambient' },
    leftPeripheral: { x: [0, 80], priority: 'contextual' },
    rightPeripheral: { x: [240, 320], priority: 'contextual' }
  }

  // Biometric feedback simulation
  const biometricStates = {
    focused: { heartRate: 75, eyeMovement: 'steady', attention: 0.9 },
    distracted: { heartRate: 80, eyeMovement: 'rapid', attention: 0.3 },
    excited: { heartRate: 95, eyeMovement: 'wide', attention: 0.8 },
    calm: { heartRate: 65, eyeMovement: 'slow', attention: 0.7 }
  }

  return {
    hudZones,
    depthLayers,
    textStyles, 
    colorSchemes,
    createHUDText,
    createSpatialWidget,
    contextPatterns,
    simulateGesture,
    gazeZones,
    biometricStates,
    drawCircle,
    drawLine,
    drawText,
    fadeIn,
    slideIn
  }
}