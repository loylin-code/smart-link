import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InteractionView } from '@/types'
import {
  COMPONENT_META_LIST,
  COMPONENT_LAYOUT_PRESETS,
  type ComponentMeta as SharedComponentMeta
} from '@smart-link/shared'

// ============================================
// 12 栅格系统相关类型定义
// ============================================

// 宽度比例预设
export type WidthPreset = '1/4' | '1/3' | '1/2' | '2/3' | '3/4' | 'full' | 'auto'

// 宽度配置（响应式）
export interface WidthConfig {
  preset: WidthPreset
  desktop: number // 栅格数 (1-12)
  tablet: number // 平板端栅格数
  mobile: number // 移动端栅格数
  auto: boolean // 自适应宽度
}

// 高度配置
export interface HeightConfig {
  mode: 'auto' | 'fixed' | 'min'
  value: number // px
  minHeight: number
}

// 间距配置
export interface SpacingConfig {
  top: number
  right: number
  bottom: number
  left: number
}

// 响应式配置
export interface ResponsiveConfig {
  hideOnMobile: boolean
  hideOnTablet: boolean
  hideOnDesktop: boolean
  stackOrder: number // 移动端堆叠顺序
}

// 样式配置
export interface StyleConfig {
  backgroundColor: string
  borderColor: string
  borderRadius: number
  shadow: 'none' | 'sm' | 'md' | 'lg'
  opacity: number
}

// 组件布局配置
export interface ComponentLayout {
  width: WidthConfig
  height: HeightConfig
  margin: SpacingConfig
  padding: SpacingConfig
  responsive: ResponsiveConfig
}

// ============================================
// 组件节点定义
// ============================================

export interface ViewComponentNode {
  id: string
  type: string
  name: string
  icon: string
  props: Record<string, unknown>

  // 布局配置（新增）
  layout: ComponentLayout

  // 样式配置（新增）
  style: StyleConfig

  dataSource?: DataBinding
  events?: EventBinding[]
  children?: ViewComponentNode[]

  // 保留兼容旧数据
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

// ============================================
// 数据绑定和事件定义
// ============================================

export interface DataBinding {
  type: 'llm' | 'api' | 'static' | 'database'
  field: string
  transformer?: string
  defaultValue?: unknown
  config?: Record<string, unknown>
}

export interface EventBinding {
  name: string
  action: 'navigate' | 'submit' | 'custom' | 'update-state'
  config: Record<string, unknown>
}

// ============================================
// 视图 Schema 定义
// ============================================

export interface ViewSchema {
  version: string
  type: InteractionView['type']
  layout: LayoutConfig
  components: ViewComponentNode[]
  globalDataSource?: DataBinding
  globalEvents?: EventBinding[]
  styles?: Record<string, unknown>
}

export interface LayoutConfig {
  columns: number // 12 栅格系统固定为 12
  gap: number // 组件间距
  padding: number // 画布内边距
  responsive: boolean // 是否启用响应式
  showGrid: boolean // 是否显示栅格背景
  snapToGrid: boolean // 是否吸附到栅格
}

// ============================================
// 宽度预设到栅格数的映射
// ============================================

export const WIDTH_PRESET_TO_COLS: Record<Exclude<WidthPreset, 'auto'>, number> = {
  '1/4': 3,
  '1/3': 4,
  '1/2': 6,
  '2/3': 8,
  '3/4': 9,
  full: 12
}

// 创建默认布局配置
export function createDefaultLayout(): ComponentLayout {
  return {
    width: {
      preset: '1/2',
      desktop: 6,
      tablet: 6,
      mobile: 12,
      auto: false
    },
    height: {
      mode: 'auto',
      value: 120,
      minHeight: 80
    },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
    responsive: {
      hideOnMobile: false,
      hideOnTablet: false,
      hideOnDesktop: false,
      stackOrder: 0
    }
  }
}

// ============================================
// 组件高度配置（基于业界低代码平台最佳实践）
// ============================================

export interface ComponentHeightPreset {
  mode: 'auto' | 'fixed' | 'min'
  default: number // 默认高度 px
  min: number // 最小高度 px
  max?: number // 最大高度 px（可选）
}

// 各类型组件的高度预设
export const COMPONENT_HEIGHT_PRESETS: Record<string, ComponentHeightPreset> = {
  // 图表类组件 - 中等高度，需要空间展示数据
  'line-chart': { mode: 'fixed', default: 320, min: 250, max: 600 },
  'bar-chart': { mode: 'fixed', default: 320, min: 250, max: 600 },
  'pie-chart': { mode: 'fixed', default: 280, min: 200, max: 400 },
  'area-chart': { mode: 'fixed', default: 320, min: 250, max: 600 },

  // 数据展示类组件
  'stat-card': { mode: 'fixed', default: 140, min: 100, max: 200 },
  'data-table': { mode: 'fixed', default: 360, min: 200, max: 600 },
  'progress-bar': { mode: 'fixed', default: 80, min: 60, max: 120 },
  'text-block': { mode: 'auto', default: 150, min: 80 },

  // 表单类组件 - 紧凑高度
  input: { mode: 'fixed', default: 80, min: 60, max: 120 },
  select: { mode: 'fixed', default: 80, min: 60, max: 120 },
  switch: { mode: 'fixed', default: 60, min: 48, max: 80 },
  button: { mode: 'fixed', default: 56, min: 40, max: 80 },

  // 布局类组件 - 自适应高度
  'grid-layout': { mode: 'auto', default: 200, min: 120 },
  'flex-row': { mode: 'auto', default: 120, min: 80 },
  'flex-col': { mode: 'auto', default: 240, min: 120 },
  tabs: { mode: 'auto', default: 300, min: 200 }
}

// 获取组件的高度预设
export function getComponentHeightPreset(type: string): ComponentHeightPreset {
  return (
    COMPONENT_HEIGHT_PRESETS[type] || {
      mode: 'auto',
      default: 120,
      min: 80
    }
  )
}

// 创建默认样式配置
export function createDefaultStyle(): StyleConfig {
  return {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 8,
    shadow: 'none',
    opacity: 1
  }
}

// ============================================
// 组件元数据定义
// ============================================

export interface ComponentMeta {
  type: string
  name: string
  icon: string
  category: 'basic' | 'form' | 'layout' | 'data' | 'business'
  description: string
  defaultProps: Record<string, unknown>
  defaultLayout?: Partial<ComponentLayout>
  propsSchema: PropSchemaItem[]
}

export interface PropSchemaItem {
  key: string
  label: string
  type: 'string' | 'number' | 'select' | 'boolean' | 'color' | 'json'
  default?: unknown
  options?: { label: string; value: unknown }[]
  required?: boolean
}

// ============================================
// 从共享组件库生成视图编排组件
// ============================================

// 图标映射：组件类型到 emoji 图标
const ICON_MAP: Record<string, string> = {
  // 基础组件
  SlButton: '🔘',
  SlIcon: '🎨',
  SlTag: '🏷️',
  SlBadge: '🔴',
  SlAvatar: '👤',
  SlDivider: '➖',
  SlLink: '🔗',
  SlImage: '🖼️',
  // 表单组件
  SlInput: '✏️',
  SlSelect: '📋',
  SlCheckbox: '☑️',
  SlRadio: '🔘',
  SlSwitch: '🎚️',
  SlForm: '📝',
  SlFormItem: '📋',
  // 布局组件
  SlContainer: '📦',
  SlRow: '↔️',
  SlCol: '↕️',
  SlCard: '🃏',
  SlSpace: '␣',
  SlDrawer: '📂',
  SlModal: '🪟',
  SlMessage: '💬',
  SlTooltip: '💡',
  // 数据组件
  SlChart: '📊',
  SlTable: '📋',
  SlStatCard: '🔢',
  SlProgress: '📈',
  SlList: '📑',
  SlTreeView: '🌳',
  SlTimeline: '⏱️',
  SlMarkdown: '📄',
  // 智能体组件
  SlChatInterface: '💬',
  SlMessageList: '📨',
  SlInputBar: '⌨️',
  SlThinkingProcess: '🧠',
  SlToolCall: '🔧',
  SlAgentStatus: '🤖',
  SlMetricGrid: '📊',
  SlDashboardPanel: '🎛️'
}

// 从共享组件属性生成 PropsSchema
function generatePropsSchema(props: SharedComponentMeta['props']): PropSchemaItem[] {
  return props.map((prop) => ({
    key: prop.name,
    label: prop.description || prop.name,
    type: mapPropType(prop.type),
    default: prop.default,
    options: prop.options?.map((opt) => ({ label: String(opt), value: opt })),
    required: prop.required
  }))
}

// 映射属性类型
function mapPropType(type: string): PropSchemaItem['type'] {
  if (type.includes('boolean')) return 'boolean'
  if (type.includes('number')) return 'number'
  if (type.includes('color')) return 'color'
  if (type === 'object' || type.includes('array')) return 'json'
  return 'string'
}

// 从共享组件生成视图编排组件元数据
function generateViewComponentMeta(sharedMeta: SharedComponentMeta): ComponentMeta {
  const layoutPreset = COMPONENT_LAYOUT_PRESETS[sharedMeta.type]
  const defaultProps: Record<string, unknown> = {}

  // 生成默认属性
  sharedMeta.props.forEach((prop) => {
    if (prop.default !== undefined) {
      defaultProps[prop.name] = prop.default
    }
  })

  // 生成默认布局
  let defaultLayout: Partial<ComponentLayout> | undefined
  if (layoutPreset) {
    defaultLayout = {
      width: {
        preset: layoutPreset.width.preset,
        desktop: layoutPreset.width.desktop,
        tablet: layoutPreset.width.tablet,
        mobile: layoutPreset.width.mobile,
        auto: false
      },
      height: {
        mode: layoutPreset.height.mode,
        value: layoutPreset.height.value,
        minHeight: layoutPreset.height.minHeight
      }
    }
  }

  return {
    type: sharedMeta.type,
    name: sharedMeta.name,
    icon: ICON_MAP[sharedMeta.type] || sharedMeta.icon,
    category: sharedMeta.category as ComponentMeta['category'],
    description: sharedMeta.description,
    defaultProps,
    defaultLayout,
    propsSchema: generatePropsSchema(sharedMeta.props)
  }
}

// 视图编排可用的组件类型
const VIEW_COMPONENT_TYPES = [
  // 基础组件
  'SlButton',
  'SlTag',
  'SlAvatar',
  'SlDivider',
  'SlImage',
  // 表单组件
  'SlInput',
  'SlSelect',
  'SlCheckbox',
  'SlRadio',
  'SlSwitch',
  'SlForm',
  // 布局组件
  'SlContainer',
  'SlRow',
  'SlCol',
  'SlCard',
  'SlSpace',
  'SlDrawer',
  'SlModal',
  // 数据组件
  'SlChart',
  'SlTable',
  'SlStatCard',
  'SlProgress',
  'SlList',
  'SlTreeView',
  'SlTimeline',
  'SlMarkdown',
  // 智能体组件
  'SlChatInterface',
  'SlMessageList',
  'SlInputBar',
  'SlThinkingProcess',
  'SlToolCall',
  'SlAgentStatus',
  'SlMetricGrid',
  'SlDashboardPanel'
]

// 从共享组件库生成视图编排组件库
export const COMPONENT_LIBRARY: ComponentMeta[] = COMPONENT_META_LIST.filter((meta) =>
  VIEW_COMPONENT_TYPES.includes(meta.type)
).map(generateViewComponentMeta)

// 获取组件的布局预设
export function getComponentLayoutPreset(type: string): ComponentLayout | undefined {
  const preset = COMPONENT_LAYOUT_PRESETS[type]
  if (!preset) return undefined

  return {
    width: {
      preset: preset.width.preset,
      desktop: preset.width.desktop,
      tablet: preset.width.tablet,
      mobile: preset.width.mobile,
      auto: false
    },
    height: {
      mode: preset.height.mode,
      value: preset.height.value,
      minHeight: preset.height.minHeight
    },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
    responsive: {
      hideOnMobile: false,
      hideOnTablet: false,
      hideOnDesktop: false,
      stackOrder: 0
    }
  }
}

export const useViewStore = defineStore('view', () => {
  // State
  const views = ref<Map<string, InteractionView>>(new Map())
  const currentViewId = ref<string | null>(null)
  const selectedComponentId = ref<string | null>(null)
  const clipboard = ref<ViewComponentNode | null>(null)
  const history = ref<ViewSchema[]>([])
  const historyIndex = ref(-1)

  // Getters
  const allViews = computed(() => Array.from(views.value.values()))

  const currentView = computed(() => {
    if (!currentViewId.value) return null
    return views.value.get(currentViewId.value) || null
  })

  const currentSchema = computed((): ViewSchema | null => {
    if (!currentView.value?.schema) return null
    return currentView.value.schema as unknown as ViewSchema
  })

  const currentComponents = computed(() => {
    return currentSchema.value?.components || []
  })

  const selectedComponent = computed(() => {
    if (!selectedComponentId.value || !currentComponents.value.length) return null
    return findComponentById(currentComponents.value, selectedComponentId.value)
  })

  // Helper: Find component by ID recursively
  function findComponentById(
    components: ViewComponentNode[],
    id: string
  ): ViewComponentNode | null {
    for (const comp of components) {
      if (comp.id === id) return comp
      if (comp.children) {
        const found = findComponentById(comp.children, id)
        if (found) return found
      }
    }
    return null
  }

  // Helper: Generate unique component ID
  function generateComponentId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  // Actions
  function getView(id: string): InteractionView | undefined {
    return views.value.get(id)
  }

  function setView(view: InteractionView) {
    views.value.set(view.id, { ...view, updatedAt: Date.now() })
  }

  function updateViewSchema(id: string, schema: ViewSchema) {
    const view = views.value.get(id)
    if (view) {
      view.schema = schema as unknown as Record<string, unknown>
      view.updatedAt = Date.now()
      // Add to history
      pushHistory(schema)
    }
  }

  function deleteView(id: string) {
    views.value.delete(id)
    if (currentViewId.value === id) {
      currentViewId.value = null
    }
  }

  function setViews(newViews: InteractionView[]) {
    views.value.clear()
    newViews.forEach((view) => {
      views.value.set(view.id, view)
    })
  }

  function getViewsAsArray(): InteractionView[] {
    return Array.from(views.value.values())
  }

  // Component operations
  function setCurrentView(viewId: string | null) {
    currentViewId.value = viewId
    selectedComponentId.value = null
    // Reset history for new view
    history.value = []
    historyIndex.value = -1
    if (viewId) {
      const view = views.value.get(viewId)
      if (view?.schema) {
        pushHistory(view.schema as unknown as ViewSchema)
      }
    }
  }

  function selectComponent(componentId: string | null) {
    selectedComponentId.value = componentId
  }

  function addComponent(component: Omit<ViewComponentNode, 'id'>, parentId?: string) {
    if (!currentViewId.value) {
      console.warn('addComponent: No currentViewId set')
      return
    }

    // Find component meta from library for type-specific defaults
    const componentMeta = COMPONENT_LIBRARY.find((m) => m.type === component.type)

    // Create layout with component-specific defaults
    const baseLayout = createDefaultLayout()
    const metaLayout = componentMeta?.defaultLayout || {}
    const providedLayout = component.layout || {}

    const layout: ComponentLayout = {
      ...baseLayout,
      ...metaLayout,
      ...providedLayout,
      width: {
        ...baseLayout.width,
        ...(metaLayout.width || {}),
        ...(providedLayout.width || {})
      },
      height: {
        ...baseLayout.height,
        ...(metaLayout.height || {}),
        ...(providedLayout.height || {})
      },
      margin: {
        ...baseLayout.margin,
        ...(metaLayout.margin || {}),
        ...(providedLayout.margin || {})
      },
      padding: {
        ...baseLayout.padding,
        ...(metaLayout.padding || {}),
        ...(providedLayout.padding || {})
      },
      responsive: {
        ...baseLayout.responsive,
        ...(metaLayout.responsive || {}),
        ...(providedLayout.responsive || {})
      }
    }

    const style = component.style || createDefaultStyle()

    const newComponent: ViewComponentNode = {
      ...component,
      id: generateComponentId(component.type),
      name: component.name || componentMeta?.name || component.type,
      icon: component.icon || componentMeta?.icon || '📦',
      layout,
      style
    }

    const view = views.value.get(currentViewId.value)
    if (!view) {
      console.warn('addComponent: View not found for ID:', currentViewId.value)
      return
    }

    const schema = (view.schema as unknown as ViewSchema) || createDefaultSchema(view.type)

    if (parentId) {
      const parent = findComponentById(schema.components, parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(newComponent)
      }
    } else {
      schema.components.push(newComponent)
    }

    updateViewSchema(currentViewId.value, schema)
    selectComponent(newComponent.id)
  }

  function updateComponent(componentId: string, updates: Partial<ViewComponentNode>) {
    if (!currentViewId.value) return

    const view = views.value.get(currentViewId.value)
    if (!view?.schema) return

    const schema = view.schema as unknown as ViewSchema
    const component = findComponentById(schema.components, componentId)
    if (component) {
      Object.assign(component, updates)
      updateViewSchema(currentViewId.value, schema)
    }
  }

  function removeComponent(componentId: string) {
    if (!currentViewId.value) return

    const view = views.value.get(currentViewId.value)
    if (!view?.schema) return

    const schema = view.schema as unknown as ViewSchema
    schema.components = removeComponentFromList(schema.components, componentId)
    updateViewSchema(currentViewId.value, schema)

    if (selectedComponentId.value === componentId) {
      selectedComponentId.value = null
    }
  }

  function removeComponentFromList(
    components: ViewComponentNode[],
    id: string
  ): ViewComponentNode[] {
    return components.filter((comp) => {
      if (comp.id === id) return false
      if (comp.children) {
        comp.children = removeComponentFromList(comp.children, id)
      }
      return true
    })
  }

  function moveComponent(componentId: string, direction: 'up' | 'down') {
    if (!currentViewId.value) return

    const view = views.value.get(currentViewId.value)
    if (!view?.schema) return

    const schema = view.schema as unknown as ViewSchema
    const index = schema.components.findIndex((c) => c.id === componentId)

    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= schema.components.length) return

    const temp = schema.components[index]
    schema.components[index] = schema.components[newIndex]
    schema.components[newIndex] = temp

    updateViewSchema(currentViewId.value, schema)
  }

  function copyComponent(componentId: string) {
    if (!currentComponents.value.length) return

    const component = findComponentById(currentComponents.value, componentId)
    if (component) {
      clipboard.value = JSON.parse(JSON.stringify(component))
    }
  }

  function pasteComponent(parentId?: string) {
    if (!clipboard.value || !currentViewId.value) return

    const newComponent: ViewComponentNode = {
      ...JSON.parse(JSON.stringify(clipboard.value)),
      id: generateComponentId(clipboard.value.type),
      name: `${clipboard.value.name} (副本)`
    }

    addComponent(newComponent, parentId)
  }

  function duplicateComponent(componentId: string) {
    copyComponent(componentId)
    pasteComponent()
  }

  // History operations
  function pushHistory(schema: ViewSchema) {
    // Remove any future history if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(JSON.parse(JSON.stringify(schema)))
    historyIndex.value = history.value.length - 1

    // Limit history size
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }

  function undo() {
    if (!currentViewId.value || historyIndex.value <= 0) return

    historyIndex.value--
    const schema = history.value[historyIndex.value]
    const view = views.value.get(currentViewId.value)
    if (view && schema) {
      view.schema = schema as unknown as Record<string, unknown>
      view.updatedAt = Date.now()
    }
  }

  function redo() {
    if (!currentViewId.value || historyIndex.value >= history.value.length - 1) return

    historyIndex.value++
    const schema = history.value[historyIndex.value]
    const view = views.value.get(currentViewId.value)
    if (view && schema) {
      view.schema = schema as unknown as Record<string, unknown>
      view.updatedAt = Date.now()
    }
  }

  function canUndo(): boolean {
    return historyIndex.value > 0
  }

  function canRedo(): boolean {
    return historyIndex.value < history.value.length - 1
  }

  // Create default schema for new view
  function createDefaultSchema(type: InteractionView['type']): ViewSchema {
    const baseSchema: ViewSchema = {
      version: '1.0',
      type,
      layout: {
        columns: 12, // 12 栅格系统
        gap: 16,
        padding: 24,
        responsive: true,
        showGrid: true,
        snapToGrid: true
      },
      components: []
    }

    return baseSchema
  }

  // Create a new view with default schema
  function createView(params: {
    name: string
    description?: string
    type: InteractionView['type']
  }): InteractionView {
    const id = `view-${Date.now()}`
    const view: InteractionView = {
      id,
      name: params.name,
      description: params.description || '',
      type: params.type,
      schema: createDefaultSchema(params.type) as unknown as Record<string, unknown>,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setView(view)
    return view
  }

  return {
    // State
    views,
    currentViewId,
    selectedComponentId,
    clipboard,
    history,
    historyIndex,

    // Getters
    allViews,
    currentView,
    currentSchema,
    currentComponents,
    selectedComponent,

    // View Actions
    getView,
    setView,
    updateViewSchema,
    deleteView,
    setViews,
    getViewsAsArray,
    createView,

    // Component Actions
    setCurrentView,
    selectComponent,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponent,
    copyComponent,
    pasteComponent,
    duplicateComponent,

    // History Actions
    undo,
    redo,
    canUndo,
    canRedo,

    // Utilities
    findComponentById,
    generateComponentId,
    createDefaultSchema
  }
})
