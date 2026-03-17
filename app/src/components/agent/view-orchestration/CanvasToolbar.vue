<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  // Props
  interface Props {
    showGrid: boolean
    snapEnabled: boolean
    zoom: number
  }

  const props = withDefaults(defineProps<Props>(), {
    showGrid: true,
    snapEnabled: true,
    zoom: 100
  })

  // Emits
  const emit = defineEmits<{
    'update:showGrid': [value: boolean]
    'update:snapEnabled': [value: boolean]
    'update:zoom': [value: number]
    undo: []
    redo: []
  }>()

  // Zoom options
  const zoomOptions = [50, 75, 100, 125, 150, 200]

  // Current zoom index
  const currentZoomIndex = computed(() => {
    const index = zoomOptions.indexOf(props.zoom)
    return index >= 0 ? index : 2 // default to 100%
  })

  // Toggle grid
  function toggleGrid() {
    emit('update:showGrid', !props.showGrid)
  }

  // Toggle snap
  function toggleSnap() {
    emit('update:snapEnabled', !props.snapEnabled)
  }

  // Zoom controls
  function zoomOut() {
    if (currentZoomIndex.value > 0) {
      emit('update:zoom', zoomOptions[currentZoomIndex.value - 1])
    }
  }

  function zoomIn() {
    if (currentZoomIndex.value < zoomOptions.length - 1) {
      emit('update:zoom', zoomOptions[currentZoomIndex.value + 1])
    }
  }

  function resetZoom() {
    emit('update:zoom', 100)
  }

  // Actions
  function handleUndo() {
    emit('undo')
  }

  function handleRedo() {
    emit('redo')
  }
</script>

<template>
  <div class="canvas-toolbar">
    <!-- Undo/Redo -->
    <div class="toolbar-group">
      <button class="toolbar-btn" :title="`${t('common.undo')} (Ctrl+Z)`" @click="handleUndo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 7" />
        </svg>
      </button>
      <button class="toolbar-btn" :title="`${t('common.redo')} (Ctrl+Y)`" @click="handleRedo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 7v6h-6M21 13a9 9 0 1 1-3-7.7L21 7" />
        </svg>
      </button>
    </div>

    <div class="toolbar-divider" />

    <!-- Zoom Controls -->
    <div class="toolbar-group zoom-group">
      <button class="toolbar-btn" :disabled="zoom <= 50" @click="zoomOut">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35M8 11h6" />
        </svg>
      </button>
      <button class="zoom-value" @click="resetZoom">{{ zoom }}%</button>
      <button class="toolbar-btn" :disabled="zoom >= 200" @click="zoomIn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
        </svg>
      </button>
    </div>

    <div class="toolbar-divider" />

    <!-- Grid Toggle -->
    <div class="toolbar-group">
      <button
        class="toolbar-btn toggle-btn"
        :class="{ active: showGrid }"
        :title="t('agent.design.view.gridVisible')"
        @click="toggleGrid"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>

      <!-- Snap Toggle -->
      <button
        class="toolbar-btn toggle-btn"
        :class="{ active: snapEnabled }"
        :title="t('agent.design.view.snapToGrid')"
        @click="toggleSnap"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .canvas-toolbar {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-base;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: $border-color-base;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover:not(:disabled) {
      background: $bg-secondary;
      border-color: $border-color-base;
      color: $text-primary;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &.toggle-btn.active {
      background: $primary-muted;
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .zoom-group {
    .zoom-value {
      min-width: 48px;
      padding: $spacing-xs $spacing-sm;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: $text-primary;
      cursor: pointer;

      &:hover {
        border-color: $primary-light;
      }
    }
  }
</style>
