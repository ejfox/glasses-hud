<template>
  <div 
    class="spatial-widget"
    :class="[`widget-${type}`, { 'widget-active': active }]"
    :style="widgetStyle"
  >
    <!-- Ambient data widget -->
    <div v-if="type === 'ambient'" class="ambient-widget">
      <div class="ambient-icon">{{ icon }}</div>
      <div class="ambient-value">{{ value }}</div>
      <div class="ambient-label">{{ label }}</div>
    </div>
    
    <!-- Navigation arrow -->
    <div v-else-if="type === 'nav'" class="nav-widget">
      <div class="nav-arrow" :style="{ transform: `rotate(${direction}deg)` }">
        ↑
      </div>
      <div class="nav-distance">{{ distance }}</div>
    </div>
    
    <!-- AI context bubble -->
    <div v-else-if="type === 'ai'" class="ai-widget">
      <div class="ai-indicator">🤖</div>
      <div class="ai-text">{{ aiText }}</div>
    </div>
    
    <!-- Social notification -->
    <div v-else-if="type === 'social'" class="social-widget">
      <div class="social-avatar">{{ avatar }}</div>
      <div class="social-message">{{ message }}</div>
    </div>
    
    <!-- Health/fitness tracker -->
    <div v-else-if="type === 'health'" class="health-widget">
      <div class="health-metric">
        <span class="health-value">{{ healthValue }}</span>
        <span class="health-unit">{{ healthUnit }}</span>
      </div>
      <div class="health-trend" :class="trend">{{ trendIcon }}</div>
    </div>
    
    <!-- Custom content slot -->
    <div v-else class="custom-widget">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'custom' },
  active: { type: Boolean, default: false },
  opacity: { type: Number, default: 1 },
  
  // Ambient widget props
  icon: { type: String, default: '🌡️' },
  value: { type: String, default: '72°' },
  label: { type: String, default: 'TEMP' },
  
  // Navigation props
  direction: { type: Number, default: 0 },
  distance: { type: String, default: '0.2mi' },
  
  // AI context props
  aiText: { type: String, default: 'AI ready' },
  
  // Social props
  avatar: { type: String, default: '👤' },
  message: { type: String, default: 'New message' },
  
  // Health props
  healthValue: { type: String, default: '72' },
  healthUnit: { type: String, default: 'BPM' },
  trend: { type: String, default: 'stable' }, // up, down, stable
  
  // Visual props
  glowColor: { type: String, default: '#00ff88' }
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return '↗️'
    case 'down': return '↘️'
    default: return '→'
  }
})

const widgetStyle = computed(() => ({
  opacity: props.opacity,
  '--glow-color': props.glowColor
}))
</script>

<style scoped>
.spatial-widget {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  backdrop-filter: blur(4px);
  font-size: 10px;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
}

.widget-active {
  border-color: var(--glow-color);
  box-shadow: 0 0 12px var(--glow-color);
}

/* Ambient Widget */
.ambient-widget {
  text-align: center;
  min-width: 60px;
}

.ambient-icon {
  font-size: 16px;
  margin-bottom: 2px;
}

.ambient-value {
  font-weight: bold;
  color: var(--glow-color);
  font-size: 12px;
}

.ambient-label {
  font-size: 8px;
  opacity: 0.7;
  margin-top: 2px;
}

/* Navigation Widget */
.nav-widget {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-arrow {
  font-size: 18px;
  color: var(--glow-color);
  transition: transform 0.3s ease;
}

.nav-distance {
  font-weight: bold;
  color: #fff;
}

/* AI Widget */
.ai-widget {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 120px;
}

.ai-indicator {
  animation: pulse 2s infinite;
}

.ai-text {
  font-size: 9px;
  opacity: 0.9;
}

/* Social Widget */
.social-widget {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100px;
}

.social-avatar {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.social-message {
  font-size: 9px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Health Widget */
.health-widget {
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-metric {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.health-value {
  font-size: 14px;
  font-weight: bold;
  color: var(--glow-color);
}

.health-unit {
  font-size: 8px;
  opacity: 0.7;
}

.health-trend {
  font-size: 12px;
}

.health-trend.up { color: #00ff88; }
.health-trend.down { color: #ff4444; }
.health-trend.stable { color: #888; }

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.custom-widget {
  min-width: 40px;
  min-height: 20px;
}
</style>