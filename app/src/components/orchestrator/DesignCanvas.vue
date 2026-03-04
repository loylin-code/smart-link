<template>
  <div
    ref="canvasRef"
    class="design-canvas"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @contextmenu.prevent
    @dragover.prevent="handleDragOver"
    @drop.prevent="handleDrop"
  >
    <!-- 工具栏 -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" @click="handleZoomOut" title="缩小">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path
              d="M21 21l-4.35-4.35M8 11h6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <span class="zoom-value">{{ Math.round(canvas.scale * 100) }}%</span>
        <button class="tool-btn" @click="handleZoomIn" title="放大">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path
              d="M21 21l-4.35-4.35M11 8v6M8 11h6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button class="tool-btn" @click="handleResetZoom" title="重置">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 3v5h5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="toolbar-center">
        <div class="device-selector">
          <button
            v-for="device in devices"
            :key="device.value"
            class="device-btn"
            :class="{ active: canvas.deviceMode === device.value }"
            @click="handleDeviceChange(device.value)"
          >
            <svg viewBox="0 0 24 24" fill="none" v-html="device.icon"></svg>
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <button
          class="tool-btn"
          :class="{ active: canvas.showGrid }"
          @click="toggleGrid"
          title="网格"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path
              d="M3 9h18M3 15h18M9 3v18M15 3v18"
              stroke="currentColor"
              stroke-width="1"
              opacity="0.5"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-viewport" :style="viewportStyle">
      <div class="canvas-container" :class="`device-${canvas.deviceMode}`">
        <!-- 网格背景 -->
        <div v-if="canvas.showGrid" class="canvas-grid"></div>

        <!-- 组件树 -->
        <div class="canvas-content">
          <template v-if="currentSchema">
            <RenderableNode
              v-if="currentSchema.root"
              :node="currentSchema.root"
              :depth="0"
              @select="handleSelect"
              @hover="handleHover"
            />
          </template>

          <!-- 空状态 -->
          <div v-else class="empty-canvas">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
                stroke-dasharray="4 2"
              />
              <path
                d="M12 8v8M8 12h8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <p>拖拽组件到此处开始编排</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 放置指示器 -->
    <div v-if="showDropIndicator" class="drop-indicator" :style="dropIndicatorStyle"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'
  import RenderableNode from './RenderableNode.vue'

  const store = useOrchestratorStore()

  // Refs
  const canvasRef = ref<HTMLElement | null>(null)

  // 设备预设
  const devices = [
    {
      value: 'desktop',
      icon: '<rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      value: 'tablet',
      icon: '<rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      value: 'mobile',
      icon: '<rect x="5" y="1" width="14" height="22" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 19h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    }
  ]

  // 计算属性
  const canvas = computed(() => store.canvas)
  const currentSchema = computed(() => store.currentSchema)

  const viewportStyle = computed(() => ({
    transform: `translate(${canvas.value.offsetX}px, ${canvas.value.offsetY}px) scale(${canvas.value.scale})`,
    transformOrigin: 'center top'
  }))

  // 放置指示器
  const showDropIndicator = ref(false)
  const dropIndicatorStyle = ref({})

  // 缩放控制
  function handleZoomIn() {
    store.zoomCanvas(0.1)
  }

  function handleZoomOut() {
    store.zoomCanvas(-0.1)
  }

  function handleResetZoom() {
    store.resetCanvas()
  }

  // 设备切换
  function handleDeviceChange(mode: string) {
    store.setDeviceMode(mode as 'desktop' | 'tablet' | 'mobile')
  }

  // 网格切换
  function toggleGrid() {
    store.canvas.showGrid = !store.canvas.showGrid
  }

  // 鼠标滚轮缩放
  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      store.zoomCanvas(delta)
    }
  }

  // 画布鼠标事件
  function handleMouseDown(event: MouseEvent) {
    // 点击空白处取消选择
    if (
      event.target === event.currentTarget ||
      (event.target as HTMLElement).classList.contains('canvas-content')
    ) {
      store.clearSelection()
    }
  }

  // 拖拽悬停
  function handleDragOver(event: DragEvent) {
    if (!store.drag.isDragging) return

    event.dataTransfer!.dropEffect = 'copy'
    showDropIndicator.value = true

    // 计算放置位置
    const rect = canvasRef.value?.getBoundingClientRect()
    if (rect) {
      dropIndicatorStyle.value = {
        left: `${event.clientX - rect.left}px`,
        top: `${event.clientY - rect.top}px`
      }
    }
  }

  // 放置组件
  function handleDrop(event: DragEvent) {
    showDropIndicator.value = false

    if (!store.drag.isDragging) return

    const componentType = event.dataTransfer?.getData('componentType')
    if (componentType) {
      // 添加到根节点
      store.addComponent(componentType, 'root')
    }

    store.endDrag()
  }

  // 节点选择
  function handleSelect(nodeId: string) {
    store.selectNode(nodeId)
  }

  // 节点悬停
  function handleHover(nodeId: string | null) {
    store.setHoveredNode(nodeId)
  }

  // 键盘快捷键
  function handleKeyDown(event: KeyboardEvent) {
    // 删除
    if ((event.key === 'Delete' || event.key === 'Backspace') && store.hasSelection) {
      if (!isInputFocused()) {
        event.preventDefault()
        store.deleteSelectedComponents()
      }
    }

    // 撤销
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault()
      store.undo()
    }

    // 重做
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === 'y' || (event.shiftKey && event.key === 'z'))
    ) {
      event.preventDefault()
      store.redo()
    }

    // 复制
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && store.hasSelection) {
      if (!isInputFocused()) {
        event.preventDefault()
        store.copyComponent()
      }
    }

    // 粘贴
    if ((event.ctrlKey || event.metaKey) && event.key === 'v' && store.clipboard) {
      if (!isInputFocused()) {
        event.preventDefault()
        store.pasteComponent()
      }
    }
  }

  function isInputFocused(): boolean {
    const active = document.activeElement as HTMLElement | null
    return (
      active?.tagName === 'INPUT' ||
      active?.tagName === 'TEXTAREA' ||
      active?.isContentEditable === true
    )
  }

  // 生命周期
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
</script>

<style scoped lang="scss">
  @import '@/assets/styles/variables.scss';

  .design-canvas {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f0f2f5;
    background-image:
      linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
      linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
      linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }

  .canvas-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-lg;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
    z-index: 10;
    box-shadow: $shadow-sm;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .zoom-value {
    font-size: $font-size-sm;
    color: $text-secondary;
    min-width: 48px;
    text-align: center;
    font-weight: $font-weight-medium;
  }

  .tool-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba($primary-color, 0.05);
    }

    &.active {
      background: rgba($primary-color, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .device-selector {
    display: flex;
    gap: $spacing-xs;
    background: $bg-secondary;
    padding: 4px;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-lighter;
  }

  .device-btn {
    width: 36px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: $text-primary;
      background: rgba($primary-color, 0.05);
    }

    &.active {
      background: $primary-color;
      color: #fff;
    }
  }

  .canvas-viewport {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    overflow: auto;
    padding: $spacing-lg;
  }

  .canvas-container {
    position: relative;
    background: #fff;
    border-radius: $border-radius-md;
    box-shadow: $shadow-lg;
    transition: width 0.3s ease;
    border: 1px solid $border-color-lighter;

    &.device-desktop {
      width: 100%;
      max-width: 1200px;
      min-height: 600px;
    }

    &.device-tablet {
      width: 768px;
      min-height: 1024px;
    }

    &.device-mobile {
      width: 375px;
      min-height: 667px;
    }
  }

  .canvas-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
    background-size: 8px 8px;
  }

  .canvas-content {
    position: relative;
    min-height: 100%;
    padding: $spacing-md;
  }

  .empty-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: $text-tertiary;
    font-size: $font-size-sm;

    svg {
      width: 64px;
      height: 64px;
      margin-bottom: $spacing-md;
      color: $text-tertiary;
      opacity: 0.5;
    }
  }

  .drop-indicator {
    position: absolute;
    width: 4px;
    height: 4px;
    background: $primary-color;
    border-radius: 50%;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 0 8px rgba($primary-color, 0.5);
  }
</style>
