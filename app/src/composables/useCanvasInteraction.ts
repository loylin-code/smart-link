import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { useViewStore, type ViewComponentNode } from '@/store/modules/view'

export interface AlignmentLine {
  type: 'vertical' | 'horizontal'
  position: number
  start: number
  end: number
}

export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function useCanvasInteraction(canvasRef: Ref<HTMLElement | null>) {
  const viewStore = useViewStore()

  // Alignment state
  const alignmentLines = ref<AlignmentLine[]>([])
  const snapEnabled = ref(true)
  const snapThreshold = 8 // pixels

  // Selection state
  const isSelecting = ref(false)
  const selectionBox = ref<SelectionBox | null>(null)
  const selectedComponentIds = ref<Set<string>>(new Set())
  const isMultiSelectMode = ref(false)

  // Drag state
  const isDragging = ref(false)
  const dragStartPos = ref({ x: 0, y: 0 })

  // Clipboard for copy/paste
  const clipboard = ref<ViewComponentNode[]>([])

  // Computed
  const components = computed(() => viewStore.currentComponents)
  const hasMultiSelection = computed(() => selectedComponentIds.value.size > 1)

  // Calculate alignment lines for a component
  function calculateAlignmentLines(
    componentRect: DOMRect,
    allRects: { id: string; rect: DOMRect }[]
  ): AlignmentLine[] {
    if (!snapEnabled.value) return []

    const lines: AlignmentLine[] = []
    const componentCenterX = componentRect.left + componentRect.width / 2
    const componentCenterY = componentRect.top + componentRect.height / 2

    for (const { id, rect } of allRects) {
      // Skip self
      if (rect === componentRect) continue

      const otherCenterX = rect.left + rect.width / 2
      const otherCenterY = rect.top + rect.height / 2

      // Vertical alignment lines
      // Left edge alignment
      if (Math.abs(componentRect.left - rect.left) < snapThreshold) {
        lines.push({
          type: 'vertical',
          position: rect.left,
          start: Math.min(componentRect.top, rect.top),
          end: Math.max(componentRect.bottom, rect.bottom)
        })
      }

      // Right edge alignment
      if (Math.abs(componentRect.right - rect.right) < snapThreshold) {
        lines.push({
          type: 'vertical',
          position: rect.right,
          start: Math.min(componentRect.top, rect.top),
          end: Math.max(componentRect.bottom, rect.bottom)
        })
      }

      // Center alignment (vertical)
      if (Math.abs(componentCenterX - otherCenterX) < snapThreshold) {
        lines.push({
          type: 'vertical',
          position: otherCenterX,
          start: Math.min(componentRect.top, rect.top),
          end: Math.max(componentRect.bottom, rect.bottom)
        })
      }

      // Horizontal alignment lines
      // Top edge alignment
      if (Math.abs(componentRect.top - rect.top) < snapThreshold) {
        lines.push({
          type: 'horizontal',
          position: rect.top,
          start: Math.min(componentRect.left, rect.left),
          end: Math.max(componentRect.right, rect.right)
        })
      }

      // Bottom edge alignment
      if (Math.abs(componentRect.bottom - rect.bottom) < snapThreshold) {
        lines.push({
          type: 'horizontal',
          position: rect.bottom,
          start: Math.min(componentRect.left, rect.left),
          end: Math.max(componentRect.right, rect.right)
        })
      }

      // Center alignment (horizontal)
      if (Math.abs(componentCenterY - otherCenterY) < snapThreshold) {
        lines.push({
          type: 'horizontal',
          position: otherCenterY,
          start: Math.min(componentRect.left, rect.left),
          end: Math.max(componentRect.right, rect.right)
        })
      }
    }

    return lines
  }

  // Snap position to alignment lines
  function snapToAlignment(
    x: number,
    y: number,
    width: number,
    height: number,
    lines: AlignmentLine[]
  ): { x: number; y: number } {
    if (!snapEnabled.value) return { x, y }

    let snappedX = x
    let snappedY = y
    const centerX = x + width / 2
    const centerY = y + height / 2

    for (const line of lines) {
      if (line.type === 'vertical') {
        // Snap to left edge
        if (Math.abs(x - line.position) < snapThreshold) {
          snappedX = line.position
        }
        // Snap to right edge
        else if (Math.abs(x + width - line.position) < snapThreshold) {
          snappedX = line.position - width
        }
        // Snap to center
        else if (Math.abs(centerX - line.position) < snapThreshold) {
          snappedX = line.position - width / 2
        }
      } else {
        // Snap to top edge
        if (Math.abs(y - line.position) < snapThreshold) {
          snappedY = line.position
        }
        // Snap to bottom edge
        else if (Math.abs(y + height - line.position) < snapThreshold) {
          snappedY = line.position - height
        }
        // Snap to center
        else if (Math.abs(centerY - line.position) < snapThreshold) {
          snappedY = line.position - height / 2
        }
      }
    }

    return { x: snappedX, y: snappedY }
  }

  // Selection box handlers
  function startSelection(event: MouseEvent) {
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
    selectedComponentIds.value = new Set()
  }

  function updateSelection(event: MouseEvent) {
    if (!isSelecting.value || !canvasRef.value || !selectionBox.value) return

    const rect = canvasRef.value.getBoundingClientRect()
    selectionBox.value.endX = event.clientX - rect.left
    selectionBox.value.endY = event.clientY - rect.top
  }

  function endSelection() {
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

      // Check if component intersects with selection box
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

    selectedComponentIds.value = newSelection
    isSelecting.value = false
    selectionBox.value = null

    // If only one selected, use normal selection
    if (newSelection.size === 1) {
      const [id] = newSelection
      viewStore.selectComponent(id)
    } else if (newSelection.size > 1) {
      isMultiSelectMode.value = true
    }
  }

  // Multi-select operations
  function deleteSelectedComponents() {
    selectedComponentIds.value.forEach((id) => {
      viewStore.removeComponent(id)
    })
    clearSelection()
  }

  function duplicateSelectedComponents() {
    const newComponents: ViewComponentNode[] = []
    selectedComponentIds.value.forEach((id) => {
      const comp = viewStore.findComponentById(components.value, id)
      if (comp) {
        const newComp: ViewComponentNode = {
          ...JSON.parse(JSON.stringify(comp)),
          id: `${comp.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: `${comp.name} (副本)`
        }
        newComponents.push(newComp)
      }
    })

    newComponents.forEach((comp) => {
      viewStore.addComponent(comp)
    })
  }

  function copySelectedComponents() {
    clipboard.value = []
    selectedComponentIds.value.forEach((id) => {
      const comp = viewStore.findComponentById(components.value, id)
      if (comp) {
        clipboard.value.push(JSON.parse(JSON.stringify(comp)))
      }
    })
  }

  function pasteComponents() {
    clipboard.value.forEach((comp) => {
      viewStore.addComponent({
        type: comp.type,
        name: `${comp.name} (粘贴)`,
        icon: comp.icon,
        props: comp.props,
        layout: comp.layout,
        style: comp.style,
        dataSource: comp.dataSource,
        events: comp.events
      })
    })
  }

  function clearSelection() {
    selectedComponentIds.value = new Set()
    isMultiSelectMode.value = false
    viewStore.selectComponent(null)
  }

  function toggleComponentSelection(id: string) {
    if (selectedComponentIds.value.has(id)) {
      selectedComponentIds.value.delete(id)
    } else {
      selectedComponentIds.value.add(id)
    }
    isMultiSelectMode.value = selectedComponentIds.value.size > 1
  }

  // Get selection box style
  function getSelectionBoxStyle(): Record<string, string> | null {
    if (!selectionBox.value) return null

    const box = selectionBox.value
    const left = Math.min(box.startX, box.endX)
    const top = Math.min(box.startY, box.endY)
    const width = Math.abs(box.endX - box.startX)
    const height = Math.abs(box.endY - box.startY)

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`
    }
  }

  return {
    // Alignment
    alignmentLines,
    snapEnabled,
    calculateAlignmentLines,
    snapToAlignment,

    // Selection
    isSelecting,
    selectionBox,
    selectedComponentIds,
    isMultiSelectMode,
    hasMultiSelection,
    startSelection,
    updateSelection,
    endSelection,
    toggleComponentSelection,
    clearSelection,
    getSelectionBoxStyle,

    // Multi-select operations
    deleteSelectedComponents,
    duplicateSelectedComponents,
    copySelectedComponents,
    pasteComponents,

    // Clipboard
    clipboard
  }
}
