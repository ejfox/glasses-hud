<template>
  <GlassesHUD>
    <!-- Left lens -->
    <template v-for="(field, position) in structure.left" :key="`left-${position}`" #[`left-hud-${kebabCase(position)}`]>
      <!-- Text content -->
      <div v-if="field.type === 'text'" :class="`hud-${kebabCase(position)}`">
        {{ field.content }}
      </div>
      <!-- Widget content -->
      <WidgetRenderer 
        v-else
        :widget="field" 
        :position="kebabCase(position)"
      />
    </template>

    <!-- Right lens -->  
    <template v-for="(field, position) in structure.right" :key="`right-${position}`" #[`right-hud-${kebabCase(position)}`]>
      <!-- Text content -->
      <div v-if="field.type === 'text'" :class="`hud-${kebabCase(position)}`">
        {{ field.content }}
      </div>
      <!-- Widget content -->
      <WidgetRenderer 
        v-else
        :widget="field"
        :position="kebabCase(position)" 
      />
    </template>
  </GlassesHUD>
</template>

<script setup>
const props = defineProps({
  layout: { type: String, default: 'corners-only' }
})

const { loadLayout, generateLayoutStructure } = useLayouts()
const structure = ref({ left: {}, right: {} })

const kebabCase = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

const updateLayout = async () => {
  await loadLayout(props.layout)
  structure.value = generateLayoutStructure()
}

watch(() => props.layout, updateLayout, { immediate: true })
</script>