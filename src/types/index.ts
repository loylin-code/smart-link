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

// 应用相关类型
export interface Application {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'inactive'
  createdAt: number
  updatedAt: number
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
export interface RouteMeta {
  title: string
  icon?: string
  hidden?: boolean
}

// 控制台日志类型
export interface ConsoleLog {
  id: string
  type: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: number
}
