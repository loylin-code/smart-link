// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应类型
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 对话相关类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

// ============================================================
// 应用相关类型
// ============================================================

// 应用状态枚举
export enum AppStatus {
  DRAFT = 'draft',
  DESIGNING = 'designing',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 应用类型枚举
export enum AppType {
  WORKFLOW = 'workflow',
  CHART = 'chart',
  FORM = 'form',
  DASHBOARD = 'dashboard',
  CUSTOM = 'custom'
}

// 应用接口
export interface Application {
  id: string
  name: string
  description: string
  icon: string
  type: AppType
  status: AppStatus
  version: string
  schema?: any
  createdAt: number
  updatedAt: number
  publishedAt?: number
}

// 应用筛选条件
export interface AppFilter {
  type?: AppType
  status?: AppStatus
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 应用分页
export interface AppPagination {
  page: number
  pageSize: number
  total?: number
}

// 应用运行时状态
export interface AppRuntimeStatus {
  appId: string
  usageCount: number
  uptime: number
  errorCount: number
  lastAccessed?: number
  lastActiveAt?: number
}

export interface AppNode {
  id: string
  type: 'agent' | 'skill' | 'tool' | 'input' | 'output'
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface AppFlow {
  id: string
  appId: string
  nodes: AppNode[]
  edges: { source: string; target: string }[]
}

// 资源相关类型
export interface Skill {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'inactive'
  config: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface MCP {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'inactive'
  endpoint: string
  createdAt: number
  updatedAt: number
}

export interface Component {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'inactive'
  path: string
  createdAt: number
  updatedAt: number
}

// 路由元信息类型
export type RouteMeta = {
  title: string
  icon?: string
  hidden?: boolean
} & Record<string, unknown>

// 控制台日志类型
export interface ConsoleLog {
  id: string
  type: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: number
}

// ============================================================
// 编排器相关类型 (从 @smart-link/core 重新导出)
// ============================================================

export type {
  PageSchema,
  ComponentNode,
  PropConfig,
  ExpressionBinding,
  StateBinding,
  LoopConfig,
  EventBinding,
  EventHandler,
  StateUpdateConfig,
  SlotContent,
  StyleConfig,
  CSSProperties,
  StyleDefinition,
  RuntimeContext,
  BuiltinAction,
  ApiCallConfig,
  ScriptDefinition,
  RenderContext,
  RouterContext,
  MessageContext,
  ApiClient,
  StateManager,
  WatchCallback,
  StateOperation,
  ComponentRegistry,
  ComponentMeta,
  PropMeta,
  EventMeta,
  SlotMeta,
  ExampleMeta,
  ExpressionEvaluator,
  EvaluationContext,
  EventProcessor,
  DirectiveProcessor,
  LoopResult,
  RendererConfig,
  RendererPlugin,
  Renderer,
  DeepPartial,
  Nullable,
  Optional,
  AnyFunction
} from '@smart-link/core'
