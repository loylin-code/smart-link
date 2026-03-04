/**
 * 编排器状态管理 Store
 * 管理应用编排器的核心状态
 */

import { defineStore } from 'pinia'
import { COMPONENT_META_LIST, type ComponentMeta } from '@smart-link/shared'

// 从 types 导入本地定义的类型
import type { ComponentNode, PageSchema, PropConfig, StyleConfig } from '@/types'

/**
 * 编辑器模式
 */
export type EditorMode = 'design' | 'preview' | 'code'

/**
 * 选择状态
 */
export interface SelectionState {
  selectedNodeId: string | null
  selectedNodeIds: string[]
  hoveredNodeId: string | null
}

/**
 * 历史记录
 */
export interface HistoryRecord {
  id: string
  timestamp: number
  action: string
  schema: PageSchema
}

/**
 * 拖拽状态
 */
export interface DragState {
  isDragging: boolean
  draggedComponentType: string | null
  draggedNodeId: string | null
  dropTarget: {
    nodeId: string | null
    slotName: string | null
    position: 'before' | 'after' | 'inside' | null
  }
}

/**
 * 剪贴板
 */
export interface ClipboardData {
  type: 'cut' | 'copy'
  nodes: ComponentNode[]
}

/**
 * 画布状态
 */
export interface CanvasState {
  scale: number
  offsetX: number
  offsetY: number
  showGrid: boolean
  deviceMode: 'desktop' | 'tablet' | 'mobile'
}

/**
 * 编排器状态
 */
export interface OrchestratorState {
  // 当前编辑的页面Schema
  currentSchema: PageSchema | null

  // 编辑器模式
  mode: EditorMode

  // 选择状态
  selection: SelectionState

  // 拖拽状态
  drag: DragState

  // 历史记录
  history: {
    records: HistoryRecord[]
    currentIndex: number
    maxRecords: number
  }

  // 剪贴板
  clipboard: ClipboardData | null

  // 画布状态
  canvas: CanvasState

  // 面板状态
  panels: {
    leftVisible: boolean
    leftWidth: number
    rightVisible: boolean
    rightWidth: number
  }

  // 加载状态
  loading: boolean
  saving: boolean
}

/**
 * 编排器Store
 */
export const useOrchestratorStore = defineStore('orchestrator', {
  state: (): OrchestratorState => ({
    currentSchema: null,
    mode: 'design',

    selection: {
      selectedNodeId: null,
      selectedNodeIds: [],
      hoveredNodeId: null
    },

    drag: {
      isDragging: false,
      draggedComponentType: null,
      draggedNodeId: null,
      dropTarget: {
        nodeId: null,
        slotName: null,
        position: null
      }
    },

    history: {
      records: [],
      currentIndex: -1,
      maxRecords: 50
    },

    clipboard: null,

    canvas: {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      showGrid: true,
      deviceMode: 'desktop'
    },

    panels: {
      leftVisible: true,
      leftWidth: 280,
      rightVisible: true,
      rightWidth: 320
    },

    loading: false,
    saving: false
  }),

  getters: {
    // 选中的节点
    selectedNode: (state): ComponentNode | null => {
      if (!state.selection.selectedNodeId || !state.currentSchema) return null
      return findNodeById(state.currentSchema.root, state.selection.selectedNodeId)
    },

    // 是否可撤销
    canUndo: (state): boolean => {
      return state.history.currentIndex > 0
    },

    // 是否可重做
    canRedo: (state): boolean => {
      return state.history.currentIndex < state.history.records.length - 1
    },

    // 是否有选中
    hasSelection: (state): boolean => {
      return state.selection.selectedNodeId !== null
    },

    // 选中的组件元数据
    selectedComponentMeta: (state): ComponentMeta | undefined => {
      const node = findNodeById(
        state.currentSchema?.root as any,
        state.selection.selectedNodeId as any
      )
      if (!node) return undefined
      return COMPONENT_META_LIST.find((m) => m.type === node.type)
    }
  },

  actions: {
    // ==================== Schema管理 ====================

    /**
     * 初始化Schema
     */
    initSchema(schema?: PageSchema) {
      if (schema) {
        this.currentSchema = schema
      } else {
        // 创建默认Schema
        this.currentSchema = {
          id: `page_${Date.now()}`,
          version: '1.0.0',
          root: {
            id: 'root',
            type: 'SlContainer',
            props: {
              static: {
                direction: 'vertical'
              }
            },
            children: []
          }
        }
      }

      // 清空历史
      this.clearHistory()
      this.saveHistory('初始化页面')
    },

    /**
     * 重置Schema
     */
    resetSchema() {
      this.initSchema()
      this.clearSelection()
    },

    // ==================== 选择管理 ====================

    /**
     * 选中节点
     */
    selectNode(nodeId: string | null, append: boolean = false) {
      if (nodeId === null) {
        this.clearSelection()
        return
      }

      if (append) {
        if (!this.selection.selectedNodeIds.includes(nodeId)) {
          this.selection.selectedNodeIds.push(nodeId)
        }
      } else {
        this.selection.selectedNodeIds = [nodeId]
      }

      this.selection.selectedNodeId = nodeId
    },

    /**
     * 取消选择
     */
    clearSelection() {
      this.selection.selectedNodeId = null
      this.selection.selectedNodeIds = []
    },

    /**
     * 设置悬停节点
     */
    setHoveredNode(nodeId: string | null) {
      this.selection.hoveredNodeId = nodeId
    },

    // ==================== 组件操作 ====================

    /**
     * 添加组件
     */
    addComponent(
      componentType: string,
      parentId: string | null,
      slotName: string = 'default',
      index: number = -1
    ): ComponentNode | null {
      if (!this.currentSchema) return null

      // 创建新节点
      const newNode = this.createComponentNode(componentType)

      // 保存历史
      this.saveHistory('添加组件')

      // 获取父节点
      const parentNode = parentId
        ? findNodeById(this.currentSchema.root, parentId)
        : this.currentSchema.root

      if (!parentNode) return null

      // 添加子节点
      if (!parentNode.children) {
        parentNode.children = []
      }

      if (index === -1) {
        parentNode.children.push(newNode)
      } else {
        parentNode.children.splice(index, 0, newNode)
      }

      // 选中新节点
      this.selectNode(newNode.id)

      return newNode
    },

    /**
     * 删除组件
     */
    deleteComponent(nodeId: string) {
      if (!this.currentSchema) return
      if (nodeId === 'root') return

      // 保存历史
      this.saveHistory('删除组件')

      // 从树中移除
      this.removeNodeFromTree(this.currentSchema.root, nodeId)

      // 清除选择
      if (this.selection.selectedNodeId === nodeId) {
        this.clearSelection()
      }
    },

    /**
     * 删除选中的组件
     */
    deleteSelectedComponents() {
      const ids = [...this.selection.selectedNodeIds]
      for (const id of ids) {
        this.deleteComponent(id)
      }
    },

    /**
     * 复制组件
     */
    copyComponent() {
      const node = this.selectedNode
      if (!node) return

      this.clipboard = {
        type: 'copy',
        nodes: [JSON.parse(JSON.stringify(node))]
      }
    },

    /**
     * 剪切组件
     */
    cutComponent() {
      const node = this.selectedNode
      if (!node) return

      this.clipboard = {
        type: 'cut',
        nodes: [JSON.parse(JSON.stringify(node))]
      }
      this.deleteComponent(node.id)
    },

    /**
     * 粘贴组件
     */
    pasteComponent(parentId: string | null = null) {
      if (!this.currentSchema || !this.clipboard) return

      this.saveHistory('粘贴组件')

      for (const node of this.clipboard.nodes) {
        const newNode = this.regenerateIds(node)
        const parent = parentId
          ? findNodeById(this.currentSchema.root, parentId)
          : this.currentSchema.root

        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(newNode)
          this.selectNode(newNode.id)
        }
      }
    },

    /**
     * 移动组件
     */
    moveComponent(nodeId: string, newParentId: string | null, newIndex: number = -1) {
      if (!this.currentSchema) return

      // 不能移动到自己的子节点下
      if (this.isDescendant(nodeId, newParentId)) return

      // 保存历史
      this.saveHistory('移动组件')

      // 获取节点
      const node = findNodeById(this.currentSchema.root, nodeId)
      if (!node) return

      // 从原位置移除
      this.removeNodeFromTree(this.currentSchema.root, nodeId)

      // 添加到新位置
      const parent = newParentId
        ? findNodeById(this.currentSchema.root, newParentId)
        : this.currentSchema.root

      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        if (newIndex === -1) {
          parent.children.push(node)
        } else {
          parent.children.splice(newIndex, 0, node)
        }
      }
    },

    /**
     * 更新组件属性
     */
    updateComponentProps(nodeId: string, props: Partial<PropConfig>) {
      if (!this.currentSchema) return

      const node = findNodeById(this.currentSchema.root, nodeId)
      if (node) {
        this.saveHistory('更新属性')
        node.props = {
          ...node.props,
          ...props
        } as PropConfig
      }
    },

    /**
     * 更新组件样式
     */
    updateComponentStyle(nodeId: string, style: Partial<StyleConfig>) {
      if (!this.currentSchema) return

      const node = findNodeById(this.currentSchema.root, nodeId)
      if (node) {
        this.saveHistory('更新样式')
        node.style = {
          ...node.style,
          ...style
        } as StyleConfig
      }
    },

    /**
     * 更新静态属性值
     */
    updateStaticProp(nodeId: string, propName: string, value: any) {
      if (!this.currentSchema) return

      const node = findNodeById(this.currentSchema.root, nodeId)
      if (node) {
        if (!node.props) node.props = {}
        if (!node.props.static) node.props.static = {}

        this.saveHistory('更新属性')
        node.props.static[propName] = value
      }
    },

    // ==================== 历史记录 ====================

    /**
     * 保存历史
     */
    saveHistory(action: string) {
      if (!this.currentSchema) return

      const record: HistoryRecord = {
        id: `history_${Date.now()}`,
        timestamp: Date.now(),
        action,
        schema: JSON.parse(JSON.stringify(this.currentSchema))
      }

      // 如果当前不在最新位置，删除后面的记录
      if (this.history.currentIndex < this.history.records.length - 1) {
        this.history.records = this.history.records.slice(0, this.history.currentIndex + 1)
      }

      // 添加新记录
      this.history.records.push(record)

      // 限制记录数量
      if (this.history.records.length > this.history.maxRecords) {
        this.history.records.shift()
      } else {
        this.history.currentIndex++
      }
    },

    /**
     * 撤销
     */
    undo() {
      if (!this.canUndo || !this.currentSchema) return

      this.history.currentIndex--
      const record = this.history.records[this.history.currentIndex]

      if (record) {
        this.currentSchema = JSON.parse(JSON.stringify(record.schema))
        this.clearSelection()
      }
    },

    /**
     * 重做
     */
    redo() {
      if (!this.canRedo || !this.currentSchema) return

      this.history.currentIndex++
      const record = this.history.records[this.history.currentIndex]

      if (record) {
        this.currentSchema = JSON.parse(JSON.stringify(record.schema))
        this.clearSelection()
      }
    },

    /**
     * 清除历史
     */
    clearHistory() {
      this.history.records = []
      this.history.currentIndex = -1
    },

    // ==================== 画布操作 ====================

    /**
     * 缩放画布
     */
    zoomCanvas(delta: number) {
      const newScale = Math.max(0.25, Math.min(2, this.canvas.scale + delta))
      this.canvas.scale = newScale
    },

    /**
     * 重置画布
     */
    resetCanvas() {
      this.canvas.scale = 1
      this.canvas.offsetX = 0
      this.canvas.offsetY = 0
    },

    /**
     * 设置设备模式
     */
    setDeviceMode(mode: 'desktop' | 'tablet' | 'mobile') {
      this.canvas.deviceMode = mode
    },

    // ==================== 拖拽管理 ====================

    /**
     * 开始拖拽组件
     */
    startDragComponent(componentType: string) {
      this.drag.isDragging = true
      this.drag.draggedComponentType = componentType
      this.drag.draggedNodeId = null
    },

    /**
     * 开始拖拽节点
     */
    startDragNode(nodeId: string) {
      this.drag.isDragging = true
      this.drag.draggedNodeId = nodeId
      this.drag.draggedComponentType = null
    },

    /**
     * 结束拖拽
     */
    endDrag() {
      this.drag.isDragging = false
      this.drag.draggedComponentType = null
      this.drag.draggedNodeId = null
      this.drag.dropTarget = {
        nodeId: null,
        slotName: null,
        position: null
      }
    },

    /**
     * 设置放置目标
     */
    setDropTarget(
      nodeId: string | null,
      slotName: string | null = 'default',
      position: 'before' | 'after' | 'inside' | null = 'inside'
    ) {
      this.drag.dropTarget = { nodeId, slotName, position }
    },

    // ==================== 辅助方法 ====================

    /**
     * 创建组件节点
     */
    createComponentNode(componentType: string): ComponentNode {
      const meta = COMPONENT_META_LIST.find((m) => m.type === componentType)

      return {
        id: `${componentType}_${Date.now()}`,
        type: componentType,
        props: {
          static: this.getDefaultProps(meta)
        },
        children: []
      }
    },

    /**
     * 获取默认属性
     */
    getDefaultProps(meta?: ComponentMeta): Record<string, any> {
      if (!meta) return {}

      const props: Record<string, any> = {}
      for (const prop of meta.props) {
        if (prop.default !== undefined) {
          props[prop.name] = prop.default
        }
      }
      return props
    },

    /**
     * 从树中移除节点
     */
    removeNodeFromTree(root: ComponentNode, nodeId: string): boolean {
      if (root.children) {
        const index = root.children.findIndex((c: ComponentNode) => c.id === nodeId)
        if (index > -1) {
          root.children.splice(index, 1)
          return true
        }

        for (const child of root.children) {
          if (this.removeNodeFromTree(child, nodeId)) {
            return true
          }
        }
      }
      return false
    },

    /**
     * 重新生成ID
     */
    regenerateIds(node: ComponentNode): ComponentNode {
      const newNode = {
        ...node,
        id: `${node.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      if (newNode.children) {
        newNode.children = newNode.children.map((c: ComponentNode) => this.regenerateIds(c))
      }

      return newNode
    },

    /**
     * 检查是否为后代节点
     */
    isDescendant(nodeId: string, potentialAncestorId: string | null): boolean {
      if (!this.currentSchema || !potentialAncestorId) return false

      const ancestor = findNodeById(this.currentSchema.root, potentialAncestorId)
      if (!ancestor) return false

      return checkDescendant(ancestor, nodeId)
    }
  },

  persist: {
    key: 'smart-link-orchestrator',
    paths: [
      'panels.leftVisible',
      'panels.leftWidth',
      'panels.rightVisible',
      'panels.rightWidth',
      'canvas.showGrid',
      'canvas.deviceMode'
    ]
  }
})

// ==================== 辅助函数 ====================

/**
 * 通过ID查找节点
 */
function findNodeById(
  root: ComponentNode | null | undefined,
  nodeId: string | null | undefined
): ComponentNode | null {
  if (!root || !nodeId) return null
  if (root.id === nodeId) return root

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, nodeId)
      if (found) return found
    }
  }

  return null
}

/**
 * 检查后代节点
 */
function checkDescendant(node: ComponentNode, targetId: string): boolean {
  if (node.id === targetId) return true

  if (node.children) {
    for (const child of node.children) {
      if (checkDescendant(child, targetId)) {
        return true
      }
    }
  }

  return false
}
