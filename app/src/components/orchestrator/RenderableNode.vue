<template>
  <div
    class="renderable-node"
    :class="nodeClasses"
    :data-node-id="node.id"
    :data-node-type="node.type"
    @click.stop="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dragover.prevent.stop="handleDragOver"
    @drop.prevent.stop="handleDrop"
  >
    <!-- 选中指示器 -->
    <div v-if="isSelected" class="selection-overlay">
      <div class="selection-border"></div>
      <div class="selection-label">
        {{ componentMeta?.name || node.type }}
      </div>
      <div class="selection-actions">
        <button class="action-btn" @click.stop="handleCopy" title="复制">
          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
        <button class="action-btn action-btn--danger" @click.stop="handleDelete" title="删除">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 悬停指示器 -->
    <div v-if="isHovered && !isSelected" class="hover-overlay"></div>

    <!-- 组件内容 -->
    <div class="node-content">
      <!-- 渲染子节点 -->
      <template v-if="node.children && node.children.length > 0">
        <RenderableNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          @select="$emit('select', $event)"
          @hover="$emit('hover', $event)"
        />
      </template>

      <!-- 空容器提示 -->
      <div
        v-else-if="isEmptyContainer"
        class="empty-container"
        @dragover.prevent.stop
        @drop.prevent.stop="handleEmptyDrop"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span>拖入组件</span>
      </div>

      <!-- 渲染真实组件 -->
      <component v-else-if="hasRealComponent" :is="renderedComponent" class="real-component" />

      <!-- 未知组件占位符 -->
      <div v-else class="leaf-node">
        <span class="leaf-label">{{ componentMeta?.name || node.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, type VNode, type Component, defineComponent } from 'vue'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'
  import { COMPONENT_META_LIST, type ComponentMeta } from '@smart-link/shared'
  import type { ComponentNode } from '@/types'

  // 导入所有 UI 组件
  import * as UIComponents from '@smart-link/ui'

  // 组件自引用类型
  interface RenderableNodeProps {
    node: ComponentNode
    depth: number
  }

  const props = defineProps<{
    node: ComponentNode
    depth: number
  }>()

  const emit = defineEmits<{
    select: [nodeId: string]
    hover: [nodeId: string | null]
  }>()

  const store = useOrchestratorStore()

  // 容器类型组件
  const containerTypes = ['SlContainer', 'SlCard', 'SlRow', 'SlCol', 'SlSpace', 'SlForm']

  // 计算属性
  const isSelected = computed(() => {
    return store.selection.selectedNodeId === props.node.id
  })

  const isHovered = computed(() => {
    return store.selection.hoveredNodeId === props.node.id
  })

  const isContainer = computed(() => {
    return containerTypes.includes(props.node.type)
  })

  const isEmptyContainer = computed(() => {
    return isContainer.value && (!props.node.children || props.node.children.length === 0)
  })

  const componentMeta = computed<ComponentMeta | undefined>(() => {
    return COMPONENT_META_LIST.find((m) => m.type === props.node.type)
  })

  const nodeClasses = computed(() => ({
    'renderable-node--selected': isSelected.value,
    'renderable-node--hovered': isHovered.value,
    'renderable-node--container': isContainer.value,
    'renderable-node--empty': isEmptyContainer.value,
    [`renderable-node--depth-${props.depth}`]: true
  }))

  // 获取真实组件
  function getRealComponent(type: string): Component | null {
    const components = UIComponents as unknown as Record<string, Component>
    return components[type] || null
  }

  // 计算组件属性
  function getComponentProps(): Record<string, any> {
    const node = props.node
    const propsObj: Record<string, any> = {}

    // 合并静态属性
    if (node.props?.static) {
      Object.assign(propsObj, node.props.static)
    }

    // 合并样式
    if (node.style?.static) {
      propsObj.style = node.style.static
    }

    return propsObj
  }

  // 渲染真实组件
  const renderedComponent = computed<VNode | null>(() => {
    const component = getRealComponent(props.node.type)
    if (!component) return null

    const componentProps = getComponentProps()

    // 在编辑态，阻止组件的默认交互行为
    const editModeProps = {
      ...componentProps,
      disabled: true, // 禁用表单元素
      onClick: (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
        emit('select', props.node.id)
      },
      onInput: (e: Event) => {
        e.stopPropagation()
      },
      onChange: (e: Event) => {
        e.stopPropagation()
      }
    }

    // 渲染叶子组件（容器组件在模板中处理子节点）
    return h(component, editModeProps)
  })

  // 是否有可渲染的真实组件
  const hasRealComponent = computed(() => {
    return !isContainer.value && getRealComponent(props.node.type) !== null
  })

  // 点击处理
  function handleClick(event: MouseEvent) {
    emit('select', props.node.id)
  }

  // 鼠标进入
  function handleMouseEnter() {
    emit('hover', props.node.id)
  }

  // 鼠标离开
  function handleMouseLeave() {
    emit('hover', null)
  }

  // 拖拽悬停
  function handleDragOver(event: DragEvent) {
    if (!store.drag.isDragging) return
    if (!isContainer.value) return

    event.dataTransfer!.dropEffect = 'copy'
    store.setDropTarget(props.node.id, 'default', 'inside')
  }

  // 放置处理
  function handleDrop(event: DragEvent) {
    const componentType = event.dataTransfer?.getData('componentType')
    if (componentType) {
      store.addComponent(componentType, props.node.id)
    }
    store.endDrag()
  }

  // 空容器放置
  function handleEmptyDrop(event: DragEvent) {
    const componentType = event.dataTransfer?.getData('componentType')
    if (componentType) {
      store.addComponent(componentType, props.node.id)
    }
    store.endDrag()
  }

  // 复制
  function handleCopy() {
    store.selectNode(props.node.id)
    store.copyComponent()
  }

  // 删除
  function handleDelete() {
    store.selectNode(props.node.id)
    store.deleteSelectedComponents()
  }
</script>

<style scoped lang="scss">
  .renderable-node {
    position: relative;
    min-height: 32px;
    border: 2px solid transparent;
    border-radius: $border-radius-sm;
    transition: all 0.15s ease;
    cursor: pointer;

    &:hover {
      border-color: rgba($primary-color, 0.3);
      background: rgba($primary-color, 0.02);
    }

    &--selected {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);

      &:hover {
        border-color: $primary-color;
      }
    }

    &--hovered:not(&--selected) {
      border-color: rgba($primary-color, 0.5);
      background: rgba($primary-color, 0.02);
    }

    &--container {
      min-height: 60px;
      padding: $spacing-sm;

      &.renderable-node--empty {
        border: 2px dashed $border-color-base;
        background: rgba(0, 0, 0, 0.02);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    // 非容器节点（叶子节点）的默认样式
    &:not(&--container) {
      min-height: 40px;
      padding: $spacing-sm;
    }
  }

  .selection-overlay {
    position: absolute;
    inset: -2px;
    pointer-events: none;
    z-index: 10;
  }

  .selection-border {
    position: absolute;
    inset: 0;
    border: 2px solid $primary-color;
    border-radius: $border-radius-sm;
    pointer-events: none;
  }

  .selection-label {
    position: absolute;
    top: -20px;
    left: 0;
    padding: 2px 8px;
    background: $primary-color;
    border-radius: $border-radius-sm $border-radius-sm 0 0;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: #fff;
    white-space: nowrap;
  }

  .selection-actions {
    position: absolute;
    top: -20px;
    right: 0;
    display: flex;
    gap: 2px;
    pointer-events: auto;
  }

  .action-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.15s;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }

    &--danger:hover {
      background: $error;
      border-color: $error;
      color: #fff;
    }
  }

  .hover-overlay {
    position: absolute;
    inset: -2px;
    border: 2px solid rgba($primary-color, 0.5);
    border-radius: $border-radius-sm;
    pointer-events: none;
  }

  .node-content {
    width: 100%;
    min-height: inherit;
    pointer-events: auto;
  }

  .real-component {
    width: 100%;
    pointer-events: none; // 禁止组件内部交互，只允许外层选中

    // 覆盖禁用状态样式，保持组件可见性
    :deep(.is-disabled),
    :deep([disabled]) {
      opacity: 0.85;
      cursor: default;
    }
  }

  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    min-height: 80px;
    color: $text-tertiary;
    font-size: $font-size-sm;

    svg {
      width: 24px;
      height: 24px;
      opacity: 0.5;
    }
  }

  .leaf-node {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: $spacing-md;
    background: rgba($primary-color, 0.03);
    border-radius: $border-radius-sm;
    border: 1px solid $border-color-lighter;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: rgba($primary-color, 0.08);
      border-color: rgba($primary-color, 0.3);
    }
  }

  .leaf-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
</style>
