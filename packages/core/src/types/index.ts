/**
 * SmartLink Core - Type Definitions
 * 渲染引擎核心类型定义
 */

// ============================================================
// 页面Schema类型
// ============================================================

/**
 * 页面Schema - 核心渲染数据结构
 */
export interface PageSchema {
  id: string
  version: string
  root: ComponentNode
  styles?: StyleDefinition[]
  scripts?: ScriptDefinition[]
}

/**
 * 组件节点 - 树形结构
 */
export interface ComponentNode {
  id: string
  type: string
  props?: PropConfig
  style?: StyleConfig
  condition?: ExpressionBinding
  loop?: LoopConfig
  events?: EventBinding[]
  slots?: Record<string, SlotContent>
  children?: ComponentNode[]
  position?: { x: number; y: number }
  size?: { width: number; height: number }
}

/**
 * 属性配置
 */
export interface PropConfig {
  static?: Record<string, any>
  bindings?: Record<string, ExpressionBinding>
  models?: Record<string, StateBinding>
}

/**
 * 表达式绑定 - 连接状态与视图
 */
export interface ExpressionBinding {
  type: 'expression' | 'state' | 'computed' | 'method'
  value: string
  formatter?: string
}

/**
 * 状态绑定
 */
export interface StateBinding {
  statePath: string
  transform?: {
    get?: string
    set?: string
  }
}

/**
 * 循环配置
 */
export interface LoopConfig {
  source: ExpressionBinding
  itemName: string
  indexName?: string
  key?: string
}

/**
 * 事件绑定
 */
export interface EventBinding {
  event: string
  handler: EventHandler
  modifiers?: string[]
}

/**
 * 事件处理器
 */
export interface EventHandler {
  type: 'builtin' | 'custom' | 'api' | 'state'
  action?: BuiltinAction
  code?: string
  api?: ApiCallConfig
  stateUpdate?: StateUpdateConfig
  params?: Record<string, any>
}

/**
 * 内置动作类型
 */
export type BuiltinAction =
  | 'navigate'
  | 'openModal'
  | 'closeModal'
  | 'openDrawer'
  | 'closeDrawer'
  | 'submitForm'
  | 'resetForm'
  | 'validateForm'
  | 'showMessage'
  | 'hideMessage'
  | 'downloadFile'
  | 'copyToClipboard'
  | 'setVariable'
  | 'refresh'
  | 'back'
  | 'print'
  | 'scrollTo'

/**
 * API调用配置
 */
export interface ApiCallConfig {
  id: string
  params?: Record<string, ExpressionBinding>
  success?: EventHandler
  error?: EventHandler
}

/**
 * 状态更新配置
 */
export interface StateUpdateConfig {
  path: string
  operation: 'set' | 'push' | 'pop' | 'splice' | 'merge'
  value: ExpressionBinding
}

/**
 * 插槽内容
 */
export interface SlotContent {
  type: 'components' | 'text' | 'expression'
  components?: ComponentNode[]
  text?: string
  expression?: string
}

/**
 * 样式配置
 */
export interface StyleConfig {
  static?: CSSProperties
  bindings?: Record<string, ExpressionBinding>
  class?: {
    static?: string[]
    bindings?: Record<string, ExpressionBinding>
  }
}

/**
 * CSS属性
 */
export interface CSSProperties {
  [key: string]: string | number | undefined
}

/**
 * 样式定义
 */
export interface StyleDefinition {
  id: string
  css: string
  scoped?: boolean
}

/**
 * 脚本定义
 */
export interface ScriptDefinition {
  id: string
  type: 'javascript' | 'typescript'
  code: string
}

// ============================================================
// 运行时类型
// ============================================================

/**
 * 渲染上下文
 */
export interface RenderContext {
  schema: PageSchema
  state: StateManager
  registry: ComponentRegistry
  evaluator: ExpressionEvaluator
  events: EventProcessor
  directives: DirectiveProcessor
  container: HTMLElement
  app?: any
}

/**
 * 运行时上下文
 */
export interface RuntimeContext {
  state: Record<string, any>
  methods: Record<string, (...args: any[]) => any>
  setState: (path: string, value: any) => void
  getState: (path: string) => any
  registerMethod: (name: string, fn: (...args: any[]) => any) => void
  emit: (event: string, payload?: any) => void
  api: ApiClient
  router: RouterContext
  message: MessageContext
}

/**
 * 路由上下文
 */
export interface RouterContext {
  push: (path: string) => void
  replace: (path: string) => void
  back: () => void
  forward: () => void
  currentPath: string
  params: Record<string, string>
  query: Record<string, string>
}

/**
 * 消息上下文
 */
export interface MessageContext {
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

/**
 * API客户端接口
 */
export interface ApiClient {
  call: (config: ApiCallConfig, context: RuntimeContext) => Promise<any>
  get: (id: string, params?: Record<string, any>) => Promise<any>
  post: (id: string, data?: Record<string, any>) => Promise<any>
}

// ============================================================
// 状态管理类型
// ============================================================

/**
 * 状态管理器接口
 */
export interface StateManager {
  state: Record<string, any>
  get: (path: string) => any
  set: (path: string, value: any) => void
  watch: (path: string, callback: WatchCallback) => () => void
  notify: (path: string) => void
  reset: () => void
  toRaw: () => Record<string, any>
}

/**
 * 监听回调
 */
export type WatchCallback = (newValue: any, oldValue: any) => void

/**
 * 状态操作
 */
export type StateOperation =
  | { type: 'set'; path: string; value: any }
  | { type: 'push'; path: string; value: any }
  | { type: 'pop'; path: string; value?: any }
  | { type: 'splice'; path: string; index: number; deleteCount: number; items?: any[] }
  | { type: 'merge'; path: string; value: Record<string, any> }
  | { type: 'delete'; path: string }

// ============================================================
// 组件注册类型
// ============================================================

/**
 * 组件注册表接口
 */
export interface ComponentRegistry {
  register: (type: string, component: any, meta?: ComponentMeta) => void
  registerAsync: (type: string, loader: () => Promise<any>, meta?: ComponentMeta) => void
  get: (type: string) => any
  getMeta: (type: string) => ComponentMeta | undefined
  has: (type: string) => boolean
  getAllTypes: () => string[]
  getByCategory: (category: string) => ComponentMeta[]
}

/**
 * 组件元数据
 */
export interface ComponentMeta {
  type: string
  name: string
  category: 'basic' | 'form' | 'layout' | 'data' | 'business'
  description: string
  icon: string
  props: PropMeta[]
  events: EventMeta[]
  slots: SlotMeta[]
  examples?: ExampleMeta[]
}

/**
 * 属性元数据
 */
export interface PropMeta {
  name: string
  type: string
  default?: any
  required?: boolean
  description: string
  options?: string[]
}

/**
 * 事件元数据
 */
export interface EventMeta {
  name: string
  params: string
  description: string
}

/**
 * 插槽元数据
 */
export interface SlotMeta {
  name: string
  description: string
}

/**
 * 示例元数据
 */
export interface ExampleMeta {
  title: string
  description?: string
  code: string
}

// ============================================================
// 表达式求值类型
// ============================================================

/**
 * 表达式求值器接口
 */
export interface ExpressionEvaluator {
  compile: (expression: string) => Function
  evaluate: (expression: string, context: EvaluationContext) => any
  evaluateBinding: (binding: ExpressionBinding, context: EvaluationContext) => any
}

/**
 * 求值上下文
 */
export interface EvaluationContext {
  state: Record<string, any>
  methods: Record<string, (...args: any[]) => any>
  $event?: any
  $item?: any
  $index?: number
  [key: string]: any
}

// ============================================================
// 事件处理类型
// ============================================================

/**
 * 事件处理器接口
 */
export interface EventProcessor {
  handle: (binding: EventBinding, context: RuntimeContext, event: any) => Promise<void>
  executeBuiltin: (
    action: BuiltinAction,
    params: Record<string, any>,
    context: RuntimeContext
  ) => Promise<void>
  executeCustom: (code: string, context: RuntimeContext, event: any) => Promise<any>
  executeApi: (config: ApiCallConfig, context: RuntimeContext) => Promise<any>
  applyStateUpdate: (config: StateUpdateConfig, context: RuntimeContext, event: any) => void
}

// ============================================================
// 指令处理类型
// ============================================================

/**
 * 指令处理器接口
 */
export interface DirectiveProcessor {
  processCondition: (node: ComponentNode, context: RuntimeContext) => boolean
  processLoop: (node: ComponentNode, context: RuntimeContext) => LoopResult[]
  processModel: (node: ComponentNode, context: RuntimeContext) => Record<string, any>
}

/**
 * 循环结果
 */
export interface LoopResult {
  $item: any
  $index: number
}

// ============================================================
// 渲染器类型
// ============================================================

/**
 * 渲染器配置
 */
export interface RendererConfig {
  registry: ComponentRegistry
  state: StateManager
  evaluator: ExpressionEvaluator
  events: EventProcessor
  directives: DirectiveProcessor
  plugins?: RendererPlugin[]
}

/**
 * 渲染器插件
 */
export interface RendererPlugin {
  name: string
  beforeRender?: (schema: PageSchema) => PageSchema
  afterRender?: (vnode: any, schema: PageSchema) => any
  beforeNodeRender?: (node: ComponentNode) => ComponentNode
  afterNodeRender?: (vnode: any, node: ComponentNode) => any
}

/**
 * 渲染器接口
 */
export interface Renderer {
  renderPage: (schema: PageSchema, context: RuntimeContext) => any
  renderNode: (node: ComponentNode, context: RuntimeContext) => any
  destroy: () => void
}

// ============================================================
// 工具类型
// ============================================================

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 可选类型
 */
export type Optional<T> = T | undefined

/**
 * 函数类型
 */
export type AnyFunction = (...args: any[]) => any
