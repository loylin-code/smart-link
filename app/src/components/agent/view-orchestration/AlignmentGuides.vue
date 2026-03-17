<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import type { ViewComponentNode } from '@/store/modules/view'

  // Props
  interface Props {
    components: ViewComponentNode[]
    activeComponentId: string | null
    canvasRef: HTMLElement | null
    enabled?: boolean
    threshold?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    enabled: true,
    threshold: 5
  })

  // Emits
  const emit = defineEmits<{
    align: [axis: 'x' | 'y', position: number]
  }>()

  // Guide lines state
  interface GuideLine {
    type: 'horizontal' | 'vertical'
    position: number
    start: number
    end: number
    source: 'center' | 'edge' | 'distribution'
  }

  const guides = ref<GuideLine[]>([])
  const isDragging = ref(false)
  const dragPosition = ref({ x: 0, y: 0 })
  const dragSize = ref({ width: 0, height: 0 })

  // Component positions cache
  const componentPositions = ref<
    Map<
      string,
      { x: number; y: number; width: number; height: number; centerX: number; centerY: number }
    >
  >(new Map())

  // Update component positions
  function updateComponentPositions() {
    if (!props.canvasRef) return

    const newPositions = new Map<
      string,
      { x: number; y: number; width: number; height: number; centerX: number; centerY: number }
    >()

    props.components.forEach((component) => {
      if (component.id === props.activeComponentId) return

      const el = props.canvasRef?.querySelector(`[data-component-id="${component.id}"]`)
      if (el) {
        const rect = el.getBoundingClientRect()
        const canvasRect = props.canvasRef!.getBoundingClientRect()

        const x = rect.left - canvasRect.left
        const y = rect.top - canvasRect.top
        const width = rect.width
        const height = rect.height

        newPositions.set(component.id, {
          x,
          y,
          width,
          height,
          centerX: x + width / 2,
          centerY: y + height / 2
        })
      }
    })

    componentPositions.value = newPositions
  }

  // Calculate guides for current drag position
  function calculateGuides(x: number, y: number, width: number, height: number) {
    if (!props.enabled || !props.canvasRef) {
      guides.value = []
      return
    }

    const newGuides: GuideLine[] = []
    const threshold = props.threshold

    const dragCenterX = x + width / 2
    const dragCenterY = y + height / 2
    const dragRight = x + width
    const dragBottom = y + height

    // Canvas center
    const canvasRect = props.canvasRef.getBoundingClientRect()
    const canvasCenterX = canvasRect.width / 2
    const canvasCenterY = canvasRect.height / 2

    // Check canvas center alignment
    if (Math.abs(dragCenterX - canvasCenterX) < threshold) {
      newGuides.push({
        type: 'vertical',
        position: canvasCenterX,
        start: 0,
        end: canvasRect.height,
        source: 'center'
      })
    }

    if (Math.abs(dragCenterY - canvasCenterY) < threshold) {
      newGuides.push({
        type: 'horizontal',
        position: canvasCenterY,
        start: 0,
        end: canvasRect.width,
        source: 'center'
      })
    }

    // Check alignment with other components
    componentPositions.value.forEach((pos, _id) => {
      // Vertical guides (X axis alignment)
      // Left edge alignment
      if (Math.abs(x - pos.x) < threshold) {
        newGuides.push({
          type: 'vertical',
          position: pos.x,
          start: Math.min(y, pos.y),
          end: Math.max(dragBottom, pos.y + pos.height),
          source: 'edge'
        })
      }

      // Right edge alignment
      if (Math.abs(dragRight - (pos.x + pos.width)) < threshold) {
        newGuides.push({
          type: 'vertical',
          position: pos.x + pos.width,
          start: Math.min(y, pos.y),
          end: Math.max(dragBottom, pos.y + pos.height),
          source: 'edge'
        })
      }

      // Center X alignment
      if (Math.abs(dragCenterX - pos.centerX) < threshold) {
        newGuides.push({
          type: 'vertical',
          position: pos.centerX,
          start: Math.min(y, pos.y),
          end: Math.max(dragBottom, pos.y + pos.height),
          source: 'center'
        })
      }

      // Left to right edge alignment
      if (Math.abs(x - (pos.x + pos.width)) < threshold) {
        newGuides.push({
          type: 'vertical',
          position: pos.x + pos.width,
          start: Math.min(y, pos.y),
          end: Math.max(dragBottom, pos.y + pos.height),
          source: 'edge'
        })
      }

      // Right to left edge alignment
      if (Math.abs(dragRight - pos.x) < threshold) {
        newGuides.push({
          type: 'vertical',
          position: pos.x,
          start: Math.min(y, pos.y),
          end: Math.max(dragBottom, pos.y + pos.height),
          source: 'edge'
        })
      }

      // Horizontal guides (Y axis alignment)
      // Top edge alignment
      if (Math.abs(y - pos.y) < threshold) {
        newGuides.push({
          type: 'horizontal',
          position: pos.y,
          start: Math.min(x, pos.x),
          end: Math.max(dragRight, pos.x + pos.width),
          source: 'edge'
        })
      }

      // Bottom edge alignment
      if (Math.abs(dragBottom - (pos.y + pos.height)) < threshold) {
        newGuides.push({
          type: 'horizontal',
          position: pos.y + pos.height,
          start: Math.min(x, pos.x),
          end: Math.max(dragRight, pos.x + pos.width),
          source: 'edge'
        })
      }

      // Center Y alignment
      if (Math.abs(dragCenterY - pos.centerY) < threshold) {
        newGuides.push({
          type: 'horizontal',
          position: pos.centerY,
          start: Math.min(x, pos.x),
          end: Math.max(dragRight, pos.x + pos.width),
          source: 'center'
        })
      }

      // Top to bottom edge alignment
      if (Math.abs(y - (pos.y + pos.height)) < threshold) {
        newGuides.push({
          type: 'horizontal',
          position: pos.y + pos.height,
          start: Math.min(x, pos.x),
          end: Math.max(dragRight, pos.x + pos.width),
          source: 'edge'
        })
      }

      // Bottom to top edge alignment
      if (Math.abs(dragBottom - pos.y) < threshold) {
        newGuides.push({
          type: 'horizontal',
          position: pos.y,
          start: Math.min(x, pos.x),
          end: Math.max(dragRight, pos.x + pos.width),
          source: 'edge'
        })
      }
    })

    // Remove duplicate guides
    const uniqueGuides = newGuides.filter((guide, index, self) => {
      const key = `${guide.type}-${guide.position}-${guide.source}`
      return self.findIndex((g) => `${g.type}-${g.position}-${g.source}` === key) === index
    })

    guides.value = uniqueGuides
  }

  // Start drag tracking
  function startDrag(x: number, y: number, width: number, height: number) {
    isDragging.value = true
    dragPosition.value = { x, y }
    dragSize.value = { width, height }
    updateComponentPositions()
    calculateGuides(x, y, width, height)
  }

  // Update drag position
  function updateDrag(x: number, y: number, width: number, height: number) {
    if (!isDragging.value) return
    dragPosition.value = { x, y }
    dragSize.value = { width, height }
    calculateGuides(x, y, width, height)
  }

  // End drag tracking
  function endDrag() {
    isDragging.value = false
    guides.value = []
  }

  // Get snap position if near a guide
  function getSnapPosition(
    x: number,
    y: number,
    width: number,
    height: number
  ): { x: number; y: number } | null {
    if (!props.enabled || guides.value.length === 0) return null

    let snapX: number | null = null
    let snapY: number | null = null

    const dragCenterX = x + width / 2
    const dragCenterY = y + height / 2
    const dragRight = x + width
    const dragBottom = y + height

    guides.value.forEach((guide) => {
      if (guide.type === 'vertical') {
        // Check if this guide matches any edge or center
        if (Math.abs(x - guide.position) < props.threshold) {
          snapX = guide.position
        } else if (Math.abs(dragRight - guide.position) < props.threshold) {
          snapX = guide.position - width
        } else if (Math.abs(dragCenterX - guide.position) < props.threshold) {
          snapX = guide.position - width / 2
        }
      } else {
        // Horizontal guide
        if (Math.abs(y - guide.position) < props.threshold) {
          snapY = guide.position
        } else if (Math.abs(dragBottom - guide.position) < props.threshold) {
          snapY = guide.position - height
        } else if (Math.abs(dragCenterY - guide.position) < props.threshold) {
          snapY = guide.position - height / 2
        }
      }
    })

    if (snapX !== null || snapY !== null) {
      return {
        x: snapX ?? x,
        y: snapY ?? y
      }
    }

    return null
  }

  // Expose methods
  defineExpose({
    startDrag,
    updateDrag,
    endDrag,
    getSnapPosition,
    updateComponentPositions
  })

  // Watch for component changes
  watch(
    () => props.components,
    () => {
      if (isDragging.value) {
        updateComponentPositions()
      }
    },
    { deep: true }
  )

  // Update positions on mount
  onMounted(() => {
    updateComponentPositions()
  })
</script>

<template>
  <div v-if="enabled && guides.length > 0" class="alignment-guides" aria-hidden="true">
    <div
      v-for="(guide, index) in guides"
      :key="index"
      class="guide-line"
      :class="[guide.type, guide.source]"
      :style="
        guide.type === 'vertical'
          ? {
              left: `${guide.position}px`,
              top: `${guide.start}px`,
              height: `${guide.end - guide.start}px`
            }
          : {
              top: `${guide.position}px`,
              left: `${guide.start}px`,
              width: `${guide.end - guide.start}px`
            }
      "
    />
  </div>
</template>

<style scoped lang="scss">
  .alignment-guides {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
    overflow: hidden;
  }

  .guide-line {
    position: absolute;
    pointer-events: none;

    &.vertical {
      width: 1px;
      transform: translateX(-50%);
    }

    &.horizontal {
      height: 1px;
      transform: translateY(-50%);
    }

    // Center alignment - primary color
    &.center {
      background: $primary-color;

      &::before {
        content: '';
        position: absolute;
        background: $primary-color;
      }

      &.vertical::before {
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.horizontal::before {
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }

    // Edge alignment - secondary color
    &.edge {
      background: $success;

      &.vertical {
        box-shadow: 0 0 4px rgba($success, 0.5);
      }

      &.horizontal {
        box-shadow: 0 0 4px rgba($success, 0.5);
      }
    }

    // Distribution alignment - warning color
    &.distribution {
      background: $warning;
      border-style: dashed;
    }
  }
</style>
