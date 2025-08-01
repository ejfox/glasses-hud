<template>
  <div class="template-library">
    <h3>Template Library</h3>
    
    <div class="template-categories">
      <button 
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="{ active: selectedCategory === category }"
        class="category-btn"
      >
        {{ category }}
      </button>
    </div>

    <div class="template-grid">
      <div 
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="$emit('apply-template', template)"
      >
        <div class="template-preview">
          <div class="mini-glasses">
            <div class="mini-lens left">
              <div v-for="item in template.preview.left" :key="item.pos" 
                   :class="`mini-item ${item.pos}`">
                {{ item.content }}
              </div>
            </div>
            <div class="mini-bridge"></div>
            <div class="mini-lens right">
              <div v-for="item in template.preview.right" :key="item.pos"
                   :class="`mini-item ${item.pos}`">
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="template-info">
          <h4>{{ template.name }}</h4>
          <p>{{ template.description }}</p>
          <div class="template-tags">
            <span v-for="tag in template.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['apply-template'])

const selectedCategory = ref('productivity')

const categories = [
  'productivity', 'fitness', 'navigation', 'gaming', 'ambient', 'minimal'
]

const templates = [
  {
    id: 'focus-pomodoro',
    name: 'Focus Timer',
    description: 'Pomodoro timer with productivity metrics',
    category: 'productivity',
    tags: ['timer', 'focus', 'WPM'],
    preview: {
      left: [{ pos: 'top-left', content: '24:17' }],
      right: [{ pos: 'bottom-right', content: '67 WPM' }]
    },
    layout: {
      left: { topLeft: { type: 'text', dataSource: 'osc:rampDown', content: '24:17' }},
      right: { bottomRight: { type: 'text', dataSource: 'osc:pulse', content: '67 WPM' }}
    }
  },
  
  {
    id: 'runner-hud',
    name: 'Runner HUD',
    description: 'Heart rate, pace, distance for running',
    category: 'fitness',
    tags: ['cardio', 'biometrics', 'GPS'],
    preview: {
      left: [{ pos: 'top-left', content: '142' }, { pos: 'bottom-left', content: '6.2' }],
      right: [{ pos: 'top-right', content: '7:32' }, { pos: 'bottom-right', content: '3.1mi' }]
    },
    layout: {
      left: { 
        topLeft: { type: 'text', dataSource: 'osc:heartbeat', content: '142' },
        bottomLeft: { type: 'text', dataSource: 'osc:bounce', content: '6.2' }
      },
      right: { 
        topRight: { type: 'text', content: '7:32' },
        bottomRight: { type: 'text', dataSource: 'osc:rampUp', content: '3.1mi' }
      }
    }
  },
  
  {
    id: 'driver-nav',
    name: 'Driver Navigation',
    description: 'Turn-by-turn navigation with speed',
    category: 'navigation',
    tags: ['GPS', 'speed', 'ETA'],
    preview: {
      left: [{ pos: 'center', content: '→ 0.3mi' }],
      right: [{ pos: 'top-right', content: '45mph' }, { pos: 'bottom-right', content: '8min' }]
    },
    layout: {
      left: { center: { type: 'text', content: '→ 0.3mi' }},
      right: { 
        topRight: { type: 'text', dataSource: 'osc:noise', content: '45mph' },
        bottomRight: { type: 'text', content: '8min' }
      }
    }
  },
  
  {
    id: 'gaming-overlay',
    name: 'Gaming Overlay',
    description: 'FPS, ping, system temps',
    category: 'gaming',
    tags: ['FPS', 'performance', 'temperature'],
    preview: {
      left: [{ pos: 'top-left', content: '144fps' }, { pos: 'bottom-left', content: '12ms' }],
      right: [{ pos: 'top-right', content: '67°C' }, { pos: 'bottom-right', content: '45%' }]
    },
    layout: {
      left: { 
        topLeft: { type: 'text', dataSource: 'osc:bounce', content: '144fps' },
        bottomLeft: { type: 'text', dataSource: 'osc:pulse', content: '12ms' }
      },
      right: { 
        topRight: { type: 'text', dataSource: 'osc:sine', content: '67°C' },
        bottomRight: { type: 'text', dataSource: 'osc:noise', content: '45%' }
      }
    }
  },
  
  {
    id: 'ambient-minimal',
    name: 'Ambient Minimal',
    description: 'Subtle environmental data',
    category: 'ambient',
    tags: ['weather', 'air quality', 'minimal'],
    preview: {
      left: [{ pos: 'edge-bottom', content: '72°F' }],
      right: [{ pos: 'edge-bottom', content: 'GOOD' }]
    },
    layout: {
      left: { edgeBottom: { type: 'text', dataSource: 'osc:sine', content: '72°F' }},
      right: { edgeBottom: { type: 'text', content: 'GOOD' }}
    }
  },
  
  {
    id: 'time-only',
    name: 'Time Only',
    description: 'Just the current time',
    category: 'minimal',
    tags: ['time', 'clean', 'simple'],
    preview: {
      left: [{ pos: 'top-left', content: '14:32' }]
    },
    layout: {
      left: { topLeft: { type: 'text', dataSource: 'time', content: '14:32' }}
    }
  }
]

const filteredTemplates = computed(() => {
  return templates.filter(t => t.category === selectedCategory.value)
})
</script>

<style scoped>
.template-library {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  color: #fff;
  font-family: monospace;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.template-categories {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.category-btn {
  background: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s;
}

.category-btn:hover,
.category-btn.active {
  background: #0ff;
  color: #000;
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.template-card {
  border: 1px solid #555;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #0ff;
  background: rgba(0, 255, 255, 0.05);
}

.template-preview {
  margin-bottom: 8px;
}

.mini-glasses {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
}

.mini-lens {
  width: 60px;
  height: 36px;
  border: 1px solid #666;
  border-radius: 6px;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
}

.mini-bridge {
  width: 8px;
  height: 4px;
  background: #666;
  border-radius: 2px;
}

.mini-item {
  position: absolute;
  font-size: 6px;
  color: #0ff;
  white-space: nowrap;
}

.mini-item.top-left { top: 2px; left: 2px; }
.mini-item.top-right { top: 2px; right: 2px; }
.mini-item.bottom-left { bottom: 2px; left: 2px; }
.mini-item.bottom-right { bottom: 2px; right: 2px; }
.mini-item.center { 
  top: 50%; left: 50%; 
  transform: translate(-50%, -50%); 
}
.mini-item.edge-bottom { 
  bottom: -8px; left: 50%; 
  transform: translateX(-50%); 
}

.template-info h4 {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #0ff;
}

.template-info p {
  margin: 0 0 8px 0;
  font-size: 9px;
  opacity: 0.8;
  line-height: 1.3;
}

.template-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  background: #444;
  color: #ccc;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 8px;
}

h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #0ff;
}
</style>