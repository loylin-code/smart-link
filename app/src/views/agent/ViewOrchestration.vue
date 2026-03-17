<template>
  <div class="view-orchestration">
    <!-- Header Toolbar -->
    <header class="orchestration-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="view-info">
          <h1 class="view-title">{{ viewData.name || t('agent.design.view.untitled') }}</h1>
          <span class="view-type-tag">{{ getViewTypeLabel(viewData.type) }}</span>
        </div>
      </div>

      <div class="header-center">
        <DeviceSelector v-model="previewDevice" />
      </div>

      <div class="header-right">
        <button class="action-btn" @click="handlePreview">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              stroke-width="2"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>{{ t('common.preview') }}</span>
        </button>
        <button class="action-btn action-btn--primary" @click="handleSave">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
            />
            <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>{{ t('common.save') }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="orchestration-main">
      <!-- Left Panel - Component Library -->
      <aside class="panel-left" :style="{ width: `${leftPanelWidth}px` }">
        <ComponentLibrary @drag-start="handleDragStart" @add-component="handleAddComponent" />
      </aside>

      <!-- Center - Canvas Area -->
      <main class="panel-center">
        <!-- Canvas Toolbar -->
        <CanvasToolbar
          v-model:show-grid="showGrid"
          v-model:snap-enabled="snapEnabled"
          v-model:zoom="canvasZoom"
          @undo="handleUndo"
          @redo="handleRedo"
        />

        <!-- Canvas Container (with device preview wrapper) -->
        <div class="canvas-wrapper" :class="`device-${previewDevice}`" :style="canvasWrapperStyle">
          <ViewCanvas @select-component="handleSelectComponent" @drop="handleDrop" />
        </div>
      </main>

      <!-- Right Panel - Property Panel -->
      <aside class="panel-right" :style="{ width: `${rightPanelWidth}px` }">
        <PropertyPanel @update-component="handleUpdateComponent" />
      </aside>
    </div>

    <!-- Keyboard Shortcuts Hint -->
    <div class="shortcuts-hint">
      <span>Ctrl+S {{ t('common.save') }}</span>
      <span>Ctrl+Z {{ t('common.undo') }}</span>
      <span>Ctrl+Y {{ t('common.redo') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useViewStore, type ViewSchema, type ViewComponentNode } from '@/store/modules/view'
  import type { InteractionView } from '@/types'

  // Subcomponents
  import ComponentLibrary from '@/components/agent/view-orchestration/ComponentLibrary.vue'
  import ViewCanvas from '@/components/agent/view-orchestration/ViewCanvas.vue'
  import PropertyPanel from '@/components/agent/view-orchestration/PropertyPanel.vue'
  import CanvasToolbar from '@/components/agent/view-orchestration/CanvasToolbar.vue'
  import DeviceSelector from '@/components/agent/view-orchestration/DeviceSelector.vue'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const viewStore = useViewStore()

  // Panel widths (configurable, will support drag resize in future)
  const leftPanelWidth = ref(240)
  const rightPanelWidth = ref(320)

  // Mode: 'design' | 'preview'
  const mode = ref<'design' | 'preview'>('design')

  // Preview device
  const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Canvas settings
  const showGrid = ref(true)
  const snapEnabled = ref(true)
  const canvasZoom = ref(100)

  // View data
  const viewData = ref<InteractionView>({
    id: '',
    name: '',
    description: '',
    type: 'dashboard',
    createdAt: Date.now(),
    updatedAt: Date.now()
  })

  // Computed: Canvas wrapper style for device preview
  const canvasWrapperStyle = computed(() => {
    if (previewDevice.value === 'desktop') {
      return { width: '100%', transform: `scale(${canvasZoom.value / 100})` }
    } else if (previewDevice.value === 'tablet') {
      return { width: '768px', transform: `scale(${canvasZoom.value / 100})` }
    } else {
      return { width: '375px', transform: `scale(${canvasZoom.value / 100})` }
    }
  })

  // Computed: Current schema from store
  const currentSchema = computed<ViewSchema | null>(() => {
    return viewStore.currentSchema
  })

  // Computed: Selected component ID from store
  const selectedComponentId = computed(() => {
    return viewStore.selectedComponentId
  })

  // Computed: Selected component details
  const selectedComponent = computed<ViewComponentNode | null>(() => {
    return viewStore.selectedComponent
  })

  // View types labels
  const viewTypes: { value: InteractionView['type']; label: string }[] = [
    { value: 'dashboard', label: t('agent.design.view.types.dashboard') },
    { value: 'chart', label: t('agent.design.view.types.chart') },
    { value: 'table', label: t('agent.design.view.types.table') },
    { value: 'form', label: t('agent.design.view.types.form') },
    { value: 'custom', label: t('agent.design.view.types.custom') }
  ]

  // Get view type label
  function getViewTypeLabel(type: InteractionView['type']): string {
    return viewTypes.find((item) => item.value === type)?.label || type
  }

  // Handle drag start from component library
  function handleDragStart(component: { type: string; name: string; icon: string }) {
    // Store drag data for canvas drop
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('draggingComponent', JSON.stringify(component))
    }
  }

  // Handle add component directly
  function handleAddComponent(component: Omit<ViewComponentNode, 'id'>) {
    viewStore.addComponent(component)
  }

  // Handle component selection
  function handleSelectComponent(componentId: string | null) {
    viewStore.selectComponent(componentId)
  }

  // Handle drop on canvas (component already added by ViewCanvas)
  function handleDrop(_component: Omit<ViewComponentNode, 'id'>, _parentId?: string) {
    // Component is already added in ViewCanvas.handleDrop
    // parentId is handled there as well
  }

  // Handle component update
  function handleUpdateComponent(componentId: string, updates: Partial<ViewComponentNode>) {
    viewStore.updateComponent(componentId, updates)
  }

  // Handle component deletion
  function handleDeleteComponent(componentId: string) {
    viewStore.removeComponent(componentId)
  }

  // Handle component move
  function handleMoveComponent(componentId: string, direction: 'up' | 'down') {
    viewStore.moveComponent(componentId, direction)
  }

  // Handle undo
  function handleUndo() {
    viewStore.undo()
  }

  // Handle redo
  function handleRedo() {
    viewStore.redo()
  }

  // Handle schema update
  function handleUpdateSchema(schema: ViewSchema) {
    if (viewData.value.id) {
      viewStore.updateViewSchema(viewData.value.id, schema)
    }
  }

  // Handle back navigation
  function handleBack() {
    router.push({
      path: '/app/agent/design',
      query: { tab: 'view' }
    })
  }

  // Handle preview toggle
  function handlePreview() {
    mode.value = mode.value === 'design' ? 'preview' : 'design'
  }

  // Handle save
  function handleSave() {
    // Update view data
    viewData.value.updatedAt = Date.now()

    // Save to store
    viewStore.setView({ ...viewData.value })

    // Navigate back
    router.push({
      path: '/app/agent/design',
      query: { tab: 'view' }
    })
  }

  // Keyboard shortcuts handler
  function handleKeyboardShortcuts(event: KeyboardEvent) {
    // Ctrl+S: Save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()
      handleSave()
      return
    }

    // Ctrl+Z: Undo
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      viewStore.undo()
      return
    }

    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if (
      (event.ctrlKey && event.key === 'y') ||
      (event.ctrlKey && event.shiftKey && event.key === 'z')
    ) {
      event.preventDefault()
      viewStore.redo()
      return
    }

    // Delete: Delete selected component
    if (event.key === 'Delete' && selectedComponentId.value) {
      event.preventDefault()
      viewStore.removeComponent(selectedComponentId.value)
      return
    }

    // Escape: Deselect component
    if (event.key === 'Escape' && selectedComponentId.value) {
      event.preventDefault()
      viewStore.selectComponent(null)
      return
    }
  }

  // Initialize
  onMounted(() => {
    const viewId = route.params.viewId as string

    // Load view data from store first
    const existingView = viewStore.getView(viewId)

    if (existingView) {
      // Load existing view data
      viewData.value = { ...existingView }

      // Ensure schema exists
      if (!viewData.value.schema) {
        const defaultSchema = viewStore.createDefaultSchema(viewData.value.type)
        viewData.value.schema = defaultSchema as unknown as Record<string, unknown>
        viewStore.setView({ ...viewData.value })
      }
    } else {
      // New view - initialize with defaults
      viewData.value = {
        id: viewId || `view-${Date.now()}`,
        name: t('agent.design.view.untitled'),
        type: 'dashboard',
        description: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      // Create default schema for new view
      const defaultSchema = viewStore.createDefaultSchema(viewData.value.type)
      viewData.value.schema = defaultSchema as unknown as Record<string, unknown>

      // Save to store
      viewStore.setView({ ...viewData.value })
    }

    // NOW set current view in store (after ensuring view exists)
    viewStore.setCurrentView(viewData.value.id)

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardShortcuts)
  })

  // Cleanup
  onUnmounted(() => {
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleKeyboardShortcuts)

    // Clear current view in store
    viewStore.setCurrentView(null)
  })
</script>

<style scoped lang="scss">
  .view-orchestration {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;
    overflow: hidden;
  }

  // Header Toolbar
  .orchestration-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-lg;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-base;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex-shrink: 0;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: $primary-surface;
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .view-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .view-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .view-type-tag {
    padding: 2px 10px;
    background: $primary-muted;
    color: $primary-color;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    border-radius: $border-radius-full;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .mode-switcher {
    display: flex;
    background: $bg-secondary;
    border-radius: $border-radius-md;
    padding: 3px;
    gap: 3px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: $text-primary;
      background: $bg-overlay;
    }

    &.active {
      background: $bg-primary;
      color: $primary-color;
      box-shadow: $shadow-sm;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-shrink: 0;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: $primary-surface;
    }

    &:active {
      transform: scale(0.96);
    }

    &--primary {
      background: $primary-color;
      border-color: $primary-color;
      color: $text-inverse;

      &:hover {
        background: $primary-dark;
        border-color: $primary-dark;
        color: $text-inverse;
        box-shadow: $shadow-primary;
      }

      &:active {
        background: $primary-dark;
        transform: scale(0.96);
      }
    }
  }

  // Main Content Area
  .orchestration-main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  // Left Panel - Component Library
  .panel-left {
    flex-shrink: 0;
    background: $bg-primary;
    border-right: 1px solid $border-color-base;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: width $transition-base $ease-out;
  }

  // Center Panel - View Canvas
  .panel-center {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;
  }

  // Canvas Wrapper for device preview
  .canvas-wrapper {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    padding: $spacing-lg;
    background: $bg-tertiary;
    transform-origin: top center;
    transition: width $transition-base $ease-out;

    // Device preview modes
    &.device-desktop {
      background: $bg-secondary;
    }

    &.device-tablet {
      background: color-mix(in srgb, $bg-tertiary 98%, black);
      box-shadow: inset 0 0 20px rgba($text-tertiary, 0.1);
    }

    &.device-mobile {
      background: color-mix(in srgb, $bg-tertiary 96%, black);
      box-shadow: inset 0 0 30px rgba($text-tertiary, 0.15);
    }
  }

  // Right Panel - Property Panel
  .panel-right {
    flex-shrink: 0;
    background: $bg-primary;
    border-left: 1px solid $border-color-base;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: width $transition-base $ease-out;
  }

  // Keyboard Shortcuts Hint
  .shortcuts-hint {
    position: fixed;
    bottom: $spacing-md;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-xs $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-full;
    box-shadow: $shadow-md;
    font-size: $font-size-xs;
    color: $text-tertiary;
    opacity: 0;
    transition: opacity $transition-base $ease-out;
    pointer-events: none;
    z-index: 100;

    span {
      white-space: nowrap;
    }
  }

  .view-orchestration:hover .shortcuts-hint {
    opacity: 1;
  }

  // Responsive adjustments
  @include respond-below(lg) {
    .header-center {
      display: none;
    }

    .panel-left,
    .panel-right {
      position: absolute;
      top: 60px;
      bottom: 0;
      z-index: 50;
      box-shadow: $shadow-lg;
      transform: translateX(-100%);
      transition: transform $transition-base $ease-out;
    }

    .panel-left {
      left: 0;
    }

    .panel-right {
      right: 0;
      left: auto;
      transform: translateX(100%);
    }
  }

  // Animation for mode transition
  .panel-center {
    ::v-deep(.canvas-wrapper) {
      transition: opacity $transition-base $ease-out;
    }
  }
</style>
