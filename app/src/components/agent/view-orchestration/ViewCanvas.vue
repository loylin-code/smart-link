<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    useViewStore,
    type ViewComponentNode,
    type ComponentMeta,
    WIDTH_PRESET_TO_COLS,
    type WidthPreset,
    type ComponentLayout
  } from '@/store/modules/view'
  import FloatingToolbar from './FloatingToolbar.vue'
  import AlignmentGuides from './AlignmentGuides.vue'

  const { t } = useI18n()
  const viewStore = useViewStore()

  // Props
  interface Props {
    enableAlignmentGuides?: boolean
    enableSnap?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    enableAlignmentGuides: true,
    enableSnap: true
  })

  // Emits
  const emit = defineEmits<{
    select: [componentId: string | null]
    drop: [component: Omit<ViewComponentNode, 'id'>, parentId?: string]
  }>()

  // Refs
  const canvasRef = ref<HTMLElement | null>(null)
  const alignmentGuidesRef = ref<InstanceType<typeof AlignmentGuides> | null>(null)

  // Layout component types
  const LAYOUT_TYPES = ['grid-layout', 'flex-row', 'flex-col', 'tabs']

  // State
  const isDragOver = ref(false)
  const hoveredComponentId = ref<string | null>(null)
  const dropTargetId = ref<string | null>(null)
  const dragPreviewWidth = ref<WidthPreset>('1/2')
  const showGrid = ref(true)

  // Multi-select state
  const isSelecting = ref(false)
  const selectionBox = ref<{ startX: number; startY: number; endX: number; endY: number } | null>(
    null
  )
  const selectedIds = ref<Set<string>>(new Set())

  // Floating toolbar state
  const showFloatingToolbar = ref(false)
  const toolbarPosition = ref({ x: 0, y: 0 })

  // Drag tracking state for alignment guides
  const isDraggingComponent = ref(false)
  const dragComponentRect = ref({ x: 0, y: 0, width: 0, height: 0 })

  // Computed
  const components = computed(() => viewStore.currentComponents)
  const selectedComponentId = computed(() => viewStore.selectedComponentId)
  const hasComponents = computed(() => components.value.length > 0)
  const currentSchema = computed(() => viewStore.currentSchema)

  // Grid settings
  const gridSettings = computed(() => ({
    showGrid: currentSchema.value?.layout?.showGrid ?? true,
    gap: currentSchema.value?.layout?.gap ?? 16
  }))

  // Selection count
  const selectedCount = computed(() => {
    if (selectedIds.value.size > 0) return selectedIds.value.size
    return selectedComponentId.value ? 1 : 0
  })

  // Watch for selection changes
  watch(selectedComponentId, (id) => {
    if (id) {
      selectedIds.value = new Set([id])
      updateToolbarPosition()
    } else {
      selectedIds.value = new Set()
      showFloatingToolbar.value = false
    }
  })

  // Update toolbar position
  function updateToolbarPosition() {
    nextTick(() => {
      if (!canvasRef.value || !selectedComponentId.value) return

      const componentEl = canvasRef.value.querySelector(
        `[data-component-id="${selectedComponentId.value}"]`
      )
      if (componentEl) {
        const rect = componentEl.getBoundingClientRect()
        toolbarPosition.value = {
          x: rect.left + rect.width / 2,
          y: rect.top - 8
        }
        showFloatingToolbar.value = true
      }
    })
  }

  // Check if component is a layout type
  function isLayoutComponent(type: string): boolean {
    return LAYOUT_TYPES.includes(type)
  }

  // Data component types (图表、表格、统计等)
  const DATA_TYPES = [
    'SlChart',
    'SlTable',
    'SlStatCard',
    'SlProgress',
    'SlList',
    'SlTreeView',
    'SlTimeline',
    'SlMarkdown'
  ]

  // Form component types
  const FORM_TYPES = [
    'SlInput',
    'SlSelect',
    'SlCheckbox',
    'SlRadio',
    'SlSwitch',
    'SlForm',
    'SlFormItem'
  ]

  // Business component types (智能体专用)
  const BUSINESS_TYPES = [
    'SlChatInterface',
    'SlMessageList',
    'SlInputBar',
    'SlThinkingProcess',
    'SlToolCall',
    'SlAgentStatus',
    'SlMetricGrid',
    'SlDashboardPanel'
  ]

  // Check if component is a data type
  function isDataComponent(type: string): boolean {
    return DATA_TYPES.includes(type)
  }

  // Check if component is a form type
  function isFormComponent(type: string): boolean {
    return FORM_TYPES.includes(type)
  }

  // Check if component is a business type
  function isBusinessComponent(type: string): boolean {
    return BUSINESS_TYPES.includes(type)
  }

  // Get component width as grid columns
  function getComponentCols(component: ViewComponentNode): number {
    if (component.layout?.width?.auto) return 12
    const preset = component.layout?.width?.preset
    if (preset && preset !== 'auto') {
      return WIDTH_PRESET_TO_COLS[preset] ?? 6
    }
    return component.layout?.width?.desktop ?? 6
  }

  // Get component style including height
  function getComponentStyle(component: ViewComponentNode): Record<string, string> {
    const cols = getComponentCols(component)
    const height = component.layout?.height?.value ?? 120
    const minHeight = component.layout?.height?.minHeight ?? 80

    return {
      gridColumn: `span ${cols}`,
      minHeight: `${minHeight}px`,
      ...(component.layout?.height?.mode === 'fixed' ? { height: `${height}px` } : {})
    }
  }

  // Get cols from preset safely
  function getPresetCols(preset: WidthPreset): number {
    if (preset === 'auto') return 6
    return WIDTH_PRESET_TO_COLS[preset] ?? 6
  }

  // Drag handlers
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    if (!dropTargetId.value) {
      isDragOver.value = true
      isDraggingComponent.value = true

      // Update drag position for alignment guides
      if (canvasRef.value && props.enableAlignmentGuides) {
        const rect = canvasRef.value.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        // Estimate component size based on preview width
        const canvasWidth = rect.width - 32 // padding
        const cols = getPresetCols(dragPreviewWidth.value)
        const width = (canvasWidth / 12) * cols
        const height = 120 // default height

        dragComponentRect.value = { x: x - width / 2, y: y - height / 2, width, height }
        alignmentGuidesRef.value?.updateDrag(
          dragComponentRect.value.x,
          dragComponentRect.value.y,
          width,
          height
        )
      }
    }
  }

  function handleDragLeave(event: DragEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      isDragOver.value = false
      dropTargetId.value = null
      isDraggingComponent.value = false
      alignmentGuidesRef.value?.endDrag()
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = false
    isDraggingComponent.value = false
    alignmentGuidesRef.value?.endDrag()

    let data = event.dataTransfer?.getData('application/json')
    if (!data) {
      data = event.dataTransfer?.getData('component')
    }

    if (data) {
      try {
        const componentMeta = JSON.parse(data) as ComponentMeta
        const parentId = dropTargetId.value

        const componentNode: Omit<ViewComponentNode, 'id'> = {
          type: componentMeta.type,
          name: componentMeta.name,
          icon: componentMeta.icon,
          props: { ...componentMeta.defaultProps },
          layout: {
            width: {
              preset: dragPreviewWidth.value,
              desktop: getPresetCols(dragPreviewWidth.value),
              tablet: 6,
              mobile: 12,
              auto: dragPreviewWidth.value === 'auto'
            },
            height: { mode: 'auto', value: 120, minHeight: 80 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            responsive: {
              hideOnMobile: false,
              hideOnTablet: false,
              hideOnDesktop: false,
              stackOrder: 0
            }
          },
          style: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderRadius: 8,
            shadow: 'none',
            opacity: 1
          }
        }

        emit('drop', componentNode, parentId ?? undefined)
        viewStore.addComponent(componentNode, parentId ?? undefined)

        dropTargetId.value = null
      } catch (e) {
        console.error('Failed to parse dropped component:', e)
      }
    }
  }

  // Layout component drag handlers
  function handleLayoutDragOver(event: DragEvent, componentId: string) {
    event.preventDefault()
    event.stopPropagation()
    isDragOver.value = false
    dropTargetId.value = componentId
  }

  function handleLayoutDragLeave(event: DragEvent) {
    event.stopPropagation()
    isDragOver.value = true
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      dropTargetId.value = null
    }
  }

  function handleLayoutDrop(event: DragEvent, parentId: string) {
    event.preventDefault()
    event.stopPropagation()
    dropTargetId.value = null

    let data = event.dataTransfer?.getData('application/json')
    if (!data) {
      data = event.dataTransfer?.getData('component')
    }

    if (data) {
      try {
        const componentMeta = JSON.parse(data) as ComponentMeta
        const componentNode: Omit<ViewComponentNode, 'id'> = {
          type: componentMeta.type,
          name: componentMeta.name,
          icon: componentMeta.icon,
          props: { ...componentMeta.defaultProps },
          layout: {
            width: { preset: '1/2', desktop: 6, tablet: 6, mobile: 12, auto: false },
            height: { mode: 'auto', value: 120, minHeight: 80 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            responsive: {
              hideOnMobile: false,
              hideOnTablet: false,
              hideOnDesktop: false,
              stackOrder: 0
            }
          },
          style: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderRadius: 8,
            shadow: 'none',
            opacity: 1
          }
        }

        emit('drop', componentNode, parentId)
        viewStore.addComponent(componentNode, parentId)
      } catch (e) {
        console.error('Failed to parse dropped component:', e)
      }
    }
  }

  // Selection handlers
  function handleSelect(componentId: string, event?: MouseEvent) {
    if (event?.ctrlKey || event?.metaKey) {
      // Toggle selection for multi-select
      if (selectedIds.value.has(componentId)) {
        selectedIds.value.delete(componentId)
        if (selectedIds.value.size === 0) {
          viewStore.selectComponent(null)
          showFloatingToolbar.value = false
        } else if (selectedIds.value.size === 1) {
          const [id] = selectedIds.value
          viewStore.selectComponent(id)
        }
      } else {
        selectedIds.value.add(componentId)
        viewStore.selectComponent(componentId)
      }
    } else {
      // Single selection
      selectedIds.value = new Set([componentId])
      viewStore.selectComponent(componentId)
      updateToolbarPosition()
    }
    emit('select', componentId)
  }

  function handleDeselect() {
    selectedIds.value = new Set()
    viewStore.selectComponent(null)
    showFloatingToolbar.value = false
    emit('select', null)
  }

  function handleRemove(componentId: string) {
    viewStore.removeComponent(componentId)
    if (selectedComponentId.value === componentId) {
      showFloatingToolbar.value = false
    }
  }

  // Multi-select with selection box
  function handleMouseDown(event: MouseEvent) {
    if (!canvasRef.value) return
    if ((event.target as HTMLElement).closest('.component-item')) return

    const rect = canvasRef.value.getBoundingClientRect()
    isSelecting.value = true
    selectionBox.value = {
      startX: event.clientX - rect.left,
      startY: event.clientY - rect.top,
      endX: event.clientX - rect.left,
      endY: event.clientY - rect.top
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isSelecting.value || !canvasRef.value || !selectionBox.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    selectionBox.value.endX = event.clientX - rect.left
    selectionBox.value.endY = event.clientY - rect.top
  }

  function handleMouseUp() {
    if (!selectionBox.value || !canvasRef.value) {
      isSelecting.value = false
      return
    }

    const box = selectionBox.value
    const minX = Math.min(box.startX, box.endX)
    const maxX = Math.max(box.startX, box.endX)
    const minY = Math.min(box.startY, box.endY)
    const maxY = Math.max(box.startY, box.endY)

    // Find components within selection box
    const componentElements = canvasRef.value.querySelectorAll('.component-item')
    const newSelection = new Set<string>()

    componentElements.forEach((el) => {
      const componentRect = el.getBoundingClientRect()
      const canvasRect = canvasRef.value!.getBoundingClientRect()
      const relativeRect = {
        left: componentRect.left - canvasRect.left,
        right: componentRect.right - canvasRect.left,
        top: componentRect.top - canvasRect.top,
        bottom: componentRect.bottom - canvasRect.top
      }

      if (
        relativeRect.left < maxX &&
        relativeRect.right > minX &&
        relativeRect.top < maxY &&
        relativeRect.bottom > minY
      ) {
        const id = el.getAttribute('data-component-id')
        if (id) newSelection.add(id)
      }
    })

    selectedIds.value = newSelection
    isSelecting.value = false
    selectionBox.value = null

    if (newSelection.size === 1) {
      const [id] = newSelection
      viewStore.selectComponent(id)
    } else if (newSelection.size > 1) {
      viewStore.selectComponent(null)
    }
  }

  // Selection box style
  function getSelectionBoxStyle() {
    if (!selectionBox.value) return null
    const box = selectionBox.value
    return {
      left: `${Math.min(box.startX, box.endX)}px`,
      top: `${Math.min(box.startY, box.endY)}px`,
      width: `${Math.abs(box.endX - box.startX)}px`,
      height: `${Math.abs(box.endY - box.startY)}px`
    }
  }

  // Floating toolbar actions
  function handleDeleteSelected() {
    if (selectedIds.value.size > 0) {
      selectedIds.value.forEach((id) => viewStore.removeComponent(id))
    } else if (selectedComponentId.value) {
      viewStore.removeComponent(selectedComponentId.value)
    }
    showFloatingToolbar.value = false
    selectedIds.value = new Set()
  }

  function handleDuplicateSelected() {
    const toDuplicate =
      selectedIds.value.size > 0
        ? Array.from(selectedIds.value)
        : selectedComponentId.value
          ? [selectedComponentId.value]
          : []

    toDuplicate.forEach((id) => {
      const comp = viewStore.findComponentById(components.value, id)
      if (comp) {
        viewStore.addComponent({
          type: comp.type,
          name: `${comp.name} (副本)`,
          icon: comp.icon,
          props: { ...comp.props },
          layout: JSON.parse(JSON.stringify(comp.layout)),
          style: { ...comp.style }
        })
      }
    })
  }

  function handleWidthChange(preset: WidthPreset) {
    if (!selectedComponentId.value) return

    viewStore.updateComponent(selectedComponentId.value, {
      layout: {
        ...viewStore.selectedComponent?.layout,
        width: {
          preset,
          desktop: getPresetCols(preset),
          tablet: 6,
          mobile: 12,
          auto: preset === 'auto'
        }
      } as ComponentLayout
    })
  }

  function handleToolbarClose() {
    showFloatingToolbar.value = false
  }

  // Keyboard shortcuts
  function handleKeyDown(event: KeyboardEvent) {
    // Shift key - cycle width during drag
    if (event.key === 'Shift' && isDragOver.value) {
      const presets: WidthPreset[] = ['1/4', '1/3', '1/2', '2/3', '3/4', 'full']
      const currentIndex = presets.indexOf(dragPreviewWidth.value)
      dragPreviewWidth.value = presets[(currentIndex + 1) % presets.length]
    }

    // Delete selected component(s)
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      handleDeleteSelected()
    }

    // Escape - deselect
    if (event.key === 'Escape') {
      handleDeselect()
    }

    // Ctrl+A - select all
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault()
      selectedIds.value = new Set(components.value.map((c) => c.id))
    }

    // Ctrl+D - duplicate
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault()
      handleDuplicateSelected()
    }
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
</script>

<template>
  <div
    ref="canvasRef"
    class="view-canvas"
    :class="{ 'drag-over': isDragOver, 'show-grid': showGrid }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleDeselect"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <!-- Grid Background -->
    <div v-if="showGrid && hasComponents" class="grid-background">
      <div class="grid-column" v-for="n in 12" :key="n" />
    </div>

    <!-- Empty State -->
    <div v-if="!hasComponents" class="canvas-empty" @click.stop>
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      </div>
      <h3 class="empty-title">{{ t('agent.design.view.canvasEmpty') }}</h3>
      <p class="empty-desc">{{ t('agent.design.view.canvasEmptyDesc') }}</p>
    </div>

    <!-- Components Grid -->
    <div v-else class="canvas-content" @click.stop>
      <div class="components-grid" :style="{ gap: `${gridSettings.gap}px` }">
        <template v-for="component in components" :key="component.id">
          <!-- Component Item -->
          <div
            class="component-item"
            :class="{
              selected: selectedComponentId === component.id || selectedIds.has(component.id),
              hovered: hoveredComponentId === component.id,
              'is-layout': isLayoutComponent(component.type),
              [`type-${component.type}`]: true
            }"
            :style="getComponentStyle(component)"
            :data-component-id="component.id"
            @click.stop="handleSelect(component.id, $event)"
            @mouseenter="hoveredComponentId = component.id"
            @mouseleave="hoveredComponentId = null"
          >
            <!-- Component Header -->
            <div class="component-header">
              <div class="component-info">
                <span class="component-icon">{{ component.icon }}</span>
                <span class="component-name">{{ component.name }}</span>
                <span class="component-width">{{ component.layout?.width?.preset || '1/2' }}</span>
              </div>
            </div>

            <!-- Component Body -->
            <div class="component-body">
              <!-- Layout Component Body -->
              <div
                v-if="isLayoutComponent(component.type)"
                class="layout-body"
                :class="{ 'drop-target': dropTargetId === component.id }"
                @dragover="handleLayoutDragOver($event, component.id)"
                @dragleave="handleLayoutDragLeave"
                @drop="handleLayoutDrop($event, component.id)"
              >
                <div v-if="component.children?.length" class="layout-children">
                  <div
                    v-for="child in component.children"
                    :key="child.id"
                    class="child-component"
                    :class="{ selected: selectedComponentId === child.id }"
                    @click.stop="handleSelect(child.id)"
                  >
                    <span class="child-icon">{{ child.icon }}</span>
                    <span class="child-name">{{ child.name }}</span>
                    <button class="child-delete" @click.stop="handleRemove(child.id)">✕</button>
                  </div>
                </div>
                <div v-else class="layout-drop-zone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>{{ t('agent.design.view.dropToLayout') }}</span>
                </div>
              </div>

              <!-- Chart Component Preview -->
              <div v-else-if="component.type === 'SlChart'" class="component-preview chart-preview">
                <div class="preview-chart">
                  <div class="chart-bars">
                    <div class="bar" :style="{ height: '60%' }" />
                    <div class="bar" :style="{ height: '80%' }" />
                    <div class="bar" :style="{ height: '45%' }" />
                    <div class="bar" :style="{ height: '90%' }" />
                    <div class="bar" :style="{ height: '70%' }" />
                  </div>
                  <div class="chart-axis" />
                </div>
              </div>

              <!-- Table Component Preview -->
              <div v-else-if="component.type === 'SlTable'" class="component-preview table-preview">
                <div class="preview-table">
                  <div class="table-header">
                    <span class="col">ID</span>
                    <span class="col">名称</span>
                    <span class="col">状态</span>
                  </div>
                  <div class="table-row" v-for="n in 3" :key="n">
                    <span class="col">{{ n }}</span>
                    <span class="col">数据{{ n }}</span>
                    <span class="col status">●</span>
                  </div>
                </div>
              </div>

              <!-- Stat Card Preview -->
              <div
                v-else-if="component.type === 'SlStatCard'"
                class="component-preview stat-preview"
              >
                <div class="stat-value">12,345</div>
                <div class="stat-label">指标名称</div>
                <div class="stat-trend up">↑ 12.5%</div>
              </div>

              <!-- Chat Interface Preview -->
              <div
                v-else-if="component.type === 'SlChatInterface'"
                class="component-preview chat-preview"
              >
                <div class="chat-messages">
                  <div class="chat-msg user">
                    <span>你好</span>
                  </div>
                  <div class="chat-msg agent">
                    <span>你好！有什么可以帮你的？</span>
                  </div>
                </div>
                <div class="chat-input" />
              </div>

              <!-- Business Component Preview -->
              <div
                v-else-if="isBusinessComponent(component.type)"
                class="component-preview business-preview"
              >
                <span class="preview-icon">{{ component.icon }}</span>
                <span class="preview-text">{{ component.name }}</span>
              </div>

              <!-- Data Component Preview -->
              <div
                v-else-if="isDataComponent(component.type)"
                class="component-preview data-preview"
              >
                <span class="preview-icon">{{ component.icon }}</span>
                <span class="preview-text">{{ component.name }}</span>
              </div>

              <!-- Form Component Preview -->
              <div
                v-else-if="isFormComponent(component.type)"
                class="component-preview form-preview"
              >
                <div class="form-field">
                  <span class="field-label">字段标签</span>
                  <div class="field-input" />
                </div>
              </div>

              <!-- Default Component Placeholder -->
              <div v-else class="component-placeholder">
                <span class="placeholder-icon">{{ component.icon }}</span>
                <span class="placeholder-text">{{ component.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Selection Box -->
    <div v-if="isSelecting && selectionBox" class="selection-box" :style="getSelectionBoxStyle()" />

    <!-- Drag Overlay -->
    <div v-if="isDragOver && !dropTargetId" class="drag-overlay">
      <div class="drag-overlay-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>{{ t('orchestrator.dropHere') }}</span>
        <div class="width-hint">
          <kbd>Shift</kbd> 切换宽度: <strong>{{ dragPreviewWidth }}</strong>
        </div>
      </div>
    </div>

    <!-- Alignment Guides -->
    <AlignmentGuides
      ref="alignmentGuidesRef"
      :components="components"
      :active-component-id="selectedComponentId"
      :canvas-ref="canvasRef"
      :enabled="enableAlignmentGuides && isDraggingComponent"
    />

    <!-- Floating Toolbar -->
    <FloatingToolbar
      :visible="showFloatingToolbar"
      :position="toolbarPosition"
      :selected-count="selectedCount"
      @delete="handleDeleteSelected"
      @duplicate="handleDuplicateSelected"
      @change-width="handleWidthChange"
      @close="handleToolbarClose"
    />
  </div>
</template>

<style scoped lang="scss">
  .view-canvas {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    background: $bg-secondary;
    position: relative;
    padding: $spacing-lg;
    user-select: none;

    &.drag-over {
      background: rgba($primary-color, 0.05);
    }
  }

  // Grid Background
  .grid-background {
    position: absolute;
    inset: $spacing-lg;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.2;
  }

  .grid-column {
    background: $border-color-base;
    border-radius: 1px;
  }

  // Empty State
  .canvas-empty {
    flex: 1;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: $bg-primary;
    border: 2px dashed $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-2xl;
    transition: all $transition-base $ease-out;

    &:hover {
      border-color: $primary-color;
      background: rgba($primary-color, 0.02);
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      color: $text-tertiary;
      margin-bottom: $spacing-lg;
      opacity: 0.6;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .empty-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    .empty-desc {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin: 0;
      text-align: center;
    }
  }

  // Canvas Content
  .canvas-content {
    position: relative;
    z-index: 5;
  }

  // Components Grid
  .components-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    min-height: 100%;
  }

  // Component Item
  .component-item {
    grid-column: span 6;
    background: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-lg;
    overflow: hidden;
    transition: all $transition-base $ease-out;
    cursor: pointer;
    position: relative;

    &:hover {
      border-color: $text-tertiary;
      box-shadow: $shadow-md;
    }

    &.selected {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.2);
    }

    &.is-layout .component-body {
      min-height: 120px;
    }
  }

  // Component Header
  .component-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-xs $spacing-sm;
    background: $bg-tertiary;
    border-bottom: 1px solid $border-color-lighter;
  }

  .component-info {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .component-icon {
    font-size: 14px;
    line-height: 1;
  }

  .component-name {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .component-width {
    font-size: 10px;
    padding: 2px 6px;
    background: $primary-muted;
    color: $primary-color;
    border-radius: $border-radius-sm;
    font-weight: $font-weight-medium;
  }

  // Component Body
  .component-body {
    padding: $spacing-md;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .component-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    color: $text-tertiary;

    .placeholder-icon {
      font-size: 28px;
      opacity: 0.5;
    }

    .placeholder-text {
      font-size: $font-size-xs;
    }
  }

  // Component Preview Styles
  .component-preview {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  // Chart Preview
  .chart-preview {
    padding: $spacing-sm;

    .preview-chart {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      height: 100%;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: calc(100% - 20px);

      .bar {
        flex: 1;
        background: linear-gradient(180deg, $primary-color 0%, $primary-light 100%);
        border-radius: $border-radius-xs $border-radius-xs 0 0;
        transition: height $transition-base;
      }
    }

    .chart-axis {
      height: 1px;
      background: $border-color-base;
    }
  }

  // Table Preview
  .table-preview {
    width: 100%;
    font-size: 10px;

    .table-header {
      display: flex;
      background: $bg-tertiary;
      padding: $spacing-xs;
      border-bottom: 1px solid $border-color-base;
      font-weight: $font-weight-medium;

      .col {
        flex: 1;
        text-align: left;
      }
    }

    .table-row {
      display: flex;
      padding: $spacing-xs;
      border-bottom: 1px solid $border-color-lighter;

      &:last-child {
        border-bottom: none;
      }

      .col {
        flex: 1;
        color: $text-secondary;

        &.status {
          color: $success;
        }
      }
    }
  }

  // Stat Card Preview
  .stat-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-md;
    text-align: center;

    .stat-value {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      line-height: 1;
    }

    .stat-label {
      font-size: $font-size-xs;
      color: $text-secondary;
      margin-top: $spacing-xs;
    }

    .stat-trend {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      margin-top: $spacing-xs;

      &.up {
        color: $success;
      }

      &.down {
        color: $error;
      }
    }
  }

  // Form Preview
  .form-preview {
    width: 100%;
    padding: $spacing-sm;

    .form-field {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }

    .field-label {
      font-size: $font-size-xs;
      color: $text-secondary;
    }

    .field-input {
      height: 32px;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
    }
  }

  // Chat Interface Preview
  .chat-preview {
    width: 100%;
    height: 100%;
    padding: $spacing-sm;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .chat-messages {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      overflow: hidden;
    }

    .chat-msg {
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      max-width: 80%;

      &.user {
        align-self: flex-end;
        background: $primary-color;
        color: white;
      }

      &.agent {
        align-self: flex-start;
        background: $bg-tertiary;
        color: $text-primary;
      }
    }

    .chat-input {
      height: 32px;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
    }
  }

  // Business/Data Preview
  .business-preview,
  .data-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    color: $text-tertiary;

    .preview-icon {
      font-size: 24px;
      opacity: 0.6;
    }

    .preview-text {
      font-size: $font-size-xs;
    }
  }

  // Layout Body
  .layout-body {
    width: 100%;
    min-height: 100px;
    padding: $spacing-sm;
    background: $bg-secondary;
    border-radius: $border-radius-sm;
    transition: all $transition-fast;

    &.drop-target {
      background: rgba($primary-color, 0.1);
      border: 2px dashed $primary-color;
    }
  }

  .layout-children {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .child-component {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;

    &.selected {
      border-color: $primary-color;
      background: rgba($primary-color, 0.1);
    }

    .child-delete {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: $border-radius-sm;
      color: $text-tertiary;
      cursor: pointer;
      opacity: 0;
      transition: all $transition-fast;

      &:hover {
        background: rgba($error, 0.1);
        color: $error;
      }
    }

    &:hover .child-delete {
      opacity: 1;
    }
  }

  .layout-drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    min-height: 80px;
    color: $text-tertiary;
    border: 2px dashed $border-color-base;
    border-radius: $border-radius-sm;

    svg {
      width: 24px;
      height: 24px;
      opacity: 0.5;
    }
    span {
      font-size: $font-size-xs;
    }
  }

  // Selection Box
  .selection-box {
    position: absolute;
    border: 1px dashed $primary-color;
    background: rgba($primary-color, 0.1);
    pointer-events: none;
    z-index: 100;
  }

  // Drag Overlay
  .drag-overlay {
    position: absolute;
    inset: 0;
    background: rgba($bg-primary, 0.95);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    pointer-events: none;
  }

  .drag-overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-xl;
    color: $primary-color;

    svg {
      width: 48px;
      height: 48px;
    }

    span {
      font-size: $font-size-lg;
      font-weight: $font-weight-medium;
    }
  }

  .width-hint {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-secondary;

    kbd {
      padding: 2px 6px;
      background: $bg-tertiary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
    }
  }
</style>
