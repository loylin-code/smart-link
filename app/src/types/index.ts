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
  page_size?: number // API 返回的字段名
}

// ============================================================
// 对话相关类型
// ============================================================

// 文件附件类型
export interface MessageAttachment {
  id: string
  name: string
  type: string
  size: number
  url?: string
  base64?: string
}

// 动态组件类型（用于聊天消息中的动态组件渲染）
export interface ChatComponent {
  id: string
  type: 'stats-card' | 'form' | 'chart' | 'table' | 'list' | 'code' | 'image'
  props: Record<string, any>
  events?: Record<string, string>
}

// 消息交互事件
export interface MessageEvent {
  type: 'form_submit' | 'button_click' | 'selection_change'
  componentId: string
  data: Record<string, any>
}

// 消息接口（扩展版）
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  // 所属对话ID
  conversationId?: string
  // 动态组件
  components?: ChatComponent[]
  // 组件交互状态
  interactionState?: Record<string, any>
  // 文件附件
  attachments?: MessageAttachment[]
  // 是否正在生成
  isStreaming?: boolean
  // Token使用量
  tokens?: {
    input: number
    output: number
  }
}

// 对话模板类型
export interface ChatTemplate {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
  initialPrompt: string
  category: 'service' | 'analytics' | 'document' | 'workflow' | 'content' | 'business'
}

// 对话分组类型
export interface ConversationGroup {
  label: string
  key: string
  conversations: ChatConversation[]
}

// 对话接口（扩展版）
export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  // 关联应用
  appId?: string
  // 用户ID
  userId?: string
  // 状态
  status?: 'active' | 'archived' | 'deleted'
  // 消息数量
  messageCount?: number
  // 最后消息时间
  lastMessageAt?: number
  // 使用的模板ID
  templateId?: string
  // 是否已归档
  isArchived?: boolean
  // 标签
  tags?: string[]
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
  tags?: string[]
  schema?: any
  createdAt: number
  updatedAt: number
  publishedAt?: number
  isEnabled?: boolean // 应用启用状态
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

// ============================================================
// 智能体相关类型 (基于架构设计文档 Role 模型)
// ============================================================

// 智能体状态枚举
export enum AgentStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 激活可用
  PAUSED = 'paused', // 暂停
  DEPRECATED = 'deprecated' // 废弃
}

// 智能体类型枚举
export enum AgentType {
  SYSTEM = 'system', // 系统预置角色
  CUSTOM = 'custom', // 用户自定义角色
  TEMPLATE = 'template' // 模板角色（可复制）
}

// 职责定义
export interface AgentResponsibility {
  id: string
  name: string
  description: string
  priority: number
  keywords: string[]
  examples: string[]
}

// MCP 服务绑定
export interface MCPServerBinding {
  serverId: string
  required: boolean
  fallbackAction: 'skip' | 'error' | 'wait'
  customConfig?: Record<string, unknown>
}

// Skill 绑定
export interface SkillBinding {
  skillId: string
  version: string
  enabled: boolean
  parameters: Record<string, unknown>
}

// Tool 绑定
export interface ToolBinding {
  toolId: string
  enabled: boolean
  parameters?: Record<string, unknown>
}

// 交互视图
export interface InteractionView {
  id: string
  name: string
  description: string
  type: 'chart' | 'table' | 'form' | 'dashboard' | 'custom'
  schema?: Record<string, unknown>
  thumbnail?: string
  createdAt: number
  updatedAt: number
}

// LLM 配置
export interface AgentLLMConfig {
  provider: string
  model: string
  temperature: number
  maxTokens: number
  topP: number
  systemPrompt?: string
}

// 能力定义
export interface AgentCapabilities {
  mcpServers: MCPServerBinding[]
  skills: SkillBinding[]
  tools: ToolBinding[]
  llm: AgentLLMConfig
}

// 文档源
export interface DocumentSource {
  id: string
  name: string
  type: 'file' | 'url' | 'text'
  source: string
  enabled: boolean
}

// 数据库源
export interface DatabaseSource {
  id: string
  name: string
  type: 'mysql' | 'postgresql' | 'mongodb' | 'redis'
  connectionString: string
  enabled: boolean
}

// API 数据源
export interface APISource {
  id: string
  name: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  enabled: boolean
}

// 检索配置
export interface SearchConfig {
  enabled: boolean
  topK: number
  similarityThreshold: number
  rerankEnabled: boolean
}

// 知识库配置
export interface AgentKnowledge {
  documents: DocumentSource[]
  databases: DatabaseSource[]
  apis: APISource[]
  searchConfig: SearchConfig
}

// 身份定义
export interface AgentIdentity {
  name: string
  code: string
  avatar: string
  description: string
  persona: string // 系统提示词
  welcomeMessage: string
  responsibilities: AgentResponsibility[]
}

// 智能体运行时状态
export interface AgentRuntimeStatus {
  agentId: string
  status: 'idle' | 'busy' | 'error'
  sessionCount: number
  lastActiveAt?: number
  tokensConsumed: number
  avgLatency: number
}

// 核心智能体模型
export interface Agent {
  id: string
  type: AgentType
  status: AgentStatus

  // 身份定义
  identity: AgentIdentity

  // 能力定义
  capabilities: AgentCapabilities

  // 知识库 (RAG)
  knowledge: AgentKnowledge

  // 页面设计 Schema
  pageSchema?: any

  // 元数据
  createdAt: number
  updatedAt: number
  tags: string[]
  version: string
  creator?: string
  category?: string
}

// 智能体筛选条件
export interface AgentFilter {
  type?: AgentType | ''
  status?: AgentStatus | ''
  keyword?: string
  category?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 智能体分页
export interface AgentPagination {
  page: number
  pageSize: number
  total?: number
}

// 智能体创建参数
export interface AgentCreateParams {
  name: string
  code: string
  description: string
  avatar?: string
  persona?: string
  welcomeMessage?: string
  tags?: string[]
  category?: string
}

// 智能体更新参数
export interface AgentUpdateParams {
  name?: string
  description?: string
  avatar?: string
  persona?: string
  welcomeMessage?: string
  identity?: Partial<AgentIdentity>
  capabilities?: Partial<AgentCapabilities>
  knowledge?: Partial<AgentKnowledge>
  pageSchema?: any
  tags?: string[]
  status?: AgentStatus
}

// ============================================================
// MCP 服务器相关类型
// ============================================================

export interface MCPServerCapability {
  tools: number
  resources: number
  prompts: number
}

export interface MCPServerConfig {
  // stdio 配置
  command?: string
  args?: string[]
  workingDir?: string
  env?: Record<string, string>
  // HTTP 配置
  endpoint?: string
  headers?: Record<string, string>
  timeout?: number
  // 认证配置
  auth?: {
    type: 'bearer' | 'apiKey' | 'oauth2' | 'none'
    token?: string
    apiKey?: string
  }
  // SSL 配置
  ssl?: {
    verify?: boolean
    caCert?: string
  }
}

export interface MCPServerTool {
  name: string
  description: string
  inputSchema: Record<string, any>
}

export interface MCPServerResource {
  uri: string
  name: string
  mimeType?: string
  description?: string
}

export interface MCPServerPrompt {
  name: string
  description: string
  arguments?: Array<{ name: string; description: string; required: boolean }>
}

export type MCPServerStatus = 'connected' | 'connecting' | 'disconnected' | 'degraded'

export interface MCPServer {
  id: string
  name: string
  uniqueId: string
  version: string
  description: string
  author: string
  homepage?: string
  transport: 'stdio' | 'http'
  status: MCPServerStatus
  responseTime?: number
  errorCount?: number
  capabilities: MCPServerCapability
  config: MCPServerConfig
  tools?: MCPServerTool[]
  resources?: MCPServerResource[]
  prompts?: MCPServerPrompt[]
  lastActive?: number
  lastError?: string
  createdAt: number
  updatedAt: number
}

// ============================================================
// Skills 相关类型
// ============================================================

export type SkillCategory = 'analytics' | 'processing' | 'invoker' | 'transform'
export type SkillStatus = 'enabled' | 'partial' | 'disabled'
export type SkillRiskLevel = 'low' | 'medium' | 'high'

export interface SkillStats {
  totalCalls: number
  successRate: number
  avgDuration: number
  last30Days: {
    calls: number
    tokens: { input: number; output: number }
    cost: number
  }
}

export interface SkillDependencies {
  skills: Array<{ id: string; version: string }>
  tools: string[]
  mcpServers: string[]
}

export interface SkillConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  toolBindings?: string[]
  guardrails?: {
    validateInput: boolean
    privacyCheck: boolean
    maxRetries: number
  }
  resources?: {
    timeout: number
    maxMemory: number
    maxConcurrency: number
  }
}

export interface Skill {
  id: string
  name: string
  displayName: string
  version: string
  category: SkillCategory
  status: SkillStatus
  author: string
  maintainer?: string
  description: string
  tags: string[]
  riskLevel: SkillRiskLevel
  requiresApproval: boolean
  inputSchema: Record<string, any>
  outputSchema: Record<string, any>
  config: SkillConfig
  dependencies: SkillDependencies
  stats: SkillStats
  lastUpdated: number
  createdAt: number
  updatedAt: number
}

// ============================================================
// LLM 模型相关类型
// ============================================================

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'alibaba' | 'ollama' | 'custom'
export type ModelType = 'chat' | 'completion' | 'image' | 'audio'
export type ModelStatus = 'available' | 'degraded' | 'unavailable' | 'quota-warning'

export interface ModelCapabilities {
  chat: boolean
  streaming: boolean
  vision: boolean
  tools: boolean
  json: boolean
  audio: boolean
  video: boolean
  reasoning: boolean
}

export interface ModelPricing {
  input: number
  output: number
  currency: 'USD' | 'CNY'
  unit: '1M' | '1K'
}

export interface ModelConfig {
  apiKey: string
  baseUrl?: string
  organizationId?: string
  defaultParams: {
    temperature: number
    maxTokens: number
    topP: number
    frequencyPenalty?: number
    presencePenalty?: number
    stopSequences?: string[]
  }
  rateLimit: {
    rpm: number
    tpm: number
    currentRpm?: number
    currentTpm?: number
  }
  quota: {
    daily?: number
    monthly?: number
    remaining?: number
    alertThreshold: number
  }
}

export interface ModelStats {
  monthlyCost: number
  monthlyCalls: number
  successRate: number
  avgLatency: number
  p50Latency?: number
  p90Latency?: number
  p99Latency?: number
  throughput: number
}

export interface LLMModel {
  id: string
  name: string
  uniqueId: string
  provider: ModelProvider
  series: string
  type: ModelType
  version: string
  status: ModelStatus
  contextWindow: number
  maxOutput: number
  pricing: ModelPricing
  capabilities: ModelCapabilities
  config: ModelConfig
  fallbackChain: string[]
  stats: ModelStats
  accessControl?: {
    mode: 'allow' | 'deny'
    teams: string[]
    fallbackModel?: string
  }
  deployment?: {
    type: 'cloud' | 'local' | 'hybrid'
    region?: string
    environments: string[]
  }
  createdAt: number
  updatedAt: number
}

// ============================================================
// 数据模型相关类型
// ============================================================

export type DataModelType = 'entity' | 'input' | 'output' | 'intermediate'
export type DataModelFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'object'
  | 'array'

export interface DataModelValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  enumValues?: string[]
}

export interface DataModelField {
  id: string
  name: string
  displayName: string
  type: DataModelFieldType
  required: boolean
  defaultValue?: any
  description: string
  validation?: DataModelValidation
}

export type DataModelRelationType = '1:1' | '1:N' | 'N:1' | 'N:N'

export interface DataModelRelation {
  id: string
  targetModel: string
  relationType: DataModelRelationType
  foreignKey: string
  targetKey: string
  cascadeDelete: boolean
  cascadeUpdate: boolean
}

export interface DataModelCategory {
  id: string
  name: string
  icon: string
  description?: string
  parentId?: string
  modelCount: number
  children?: DataModelCategory[]
}

export interface DataModel {
  id: string
  name: string
  displayName: string
  type: DataModelType
  category: string
  description: string
  version: string
  fields: DataModelField[]
  relations: DataModelRelation[]
  createdAt: number
  updatedAt: number
}

// ============================================================
// 系统设置相关类型
// ============================================================

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  primaryColor: string
  language: 'zh-CN' | 'en-US'
  fontSize: 'small' | 'medium' | 'large'
}

export interface ModelProviderConfig {
  id: string
  name: string
  provider: ModelProvider
  apiKey: string
  baseUrl?: string
  organizationId?: string
  availableModels: string[]
  configured: boolean
}

export interface Settings {
  appearance: AppearanceSettings
  modelProviders: ModelProviderConfig[]
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
  titleKey?: string
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
