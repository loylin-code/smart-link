## 十五、企业级 Agent 应用管理平台架构

### 15.1 平台定位与愿景

#### 15.1.1 平台概述

SmartLink Enterprise Agent Platform 是一个智能企业级 Agent 应用管理平台，基于大模型以及确定性的组件、数据模型、MCP、Skills 等进行设计、编排 Agent 应用，发布应用支持企业级使用场景。

#### 15.1.2 核心价值

- **智能化设计**：基于大模型理解自然语言需求，自动生成 Agent 编排流程
- **企业级部署**：支持多租户、高并发、安全可靠的 Agent 应用托管
- **工具生态**：统一的 MCP、Skills、数据模型管理，支持能力复用
- **可视化编排**：拖拽式 Agent 流程设计，所见即所得
- **动态渲染**：LLM 生成前端页面 JSON，前端渲染器实时展示

#### 15.1.3 目标用户

- 企业 IT 部门：构建内部 Agent 应用
- 开发者：快速编排 Agent 流程
- 业务人员：通过自然语言描述需求，AI 辅助创建 Agent

### 15.2 系统架构设计

#### 15.2.1 整体架构 (OpenClaw-like)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SmartLink Enterprise Platform                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐ │
│   │   Web Client    │         │  Mobile Client  │         │   API Client    │ │
│   │   (Vue/React)   │         │  (iOS/Android)  │         │   (REST/WS)     │ │
│   └────────┬────────┘         └────────┬────────┘         └────────┬────────┘ │
│            │                             │                             │          │
│            └─────────────────────────────┼─────────────────────────────┘          │
│                                          │                                          │
│                                          ▼                                          │
│                              ┌─────────────────────┐                              │
│                              │    Gateway 网关     │                              │
│                              │  (负载均衡/鉴权/路由) │                              │
│                              └──────────┬──────────┘                              │
│                                         │                                          │
│                                         ▼                                          │
│                              ┌─────────────────────┐                              │
│                              │   Agent Proxy        │                              │
│                              │   (会话管理/分发)     │                              │
│                              └──────────┬──────────┘                              │
│                                         │                                          │
│         ┌──────────────────────────────┼──────────────────────────────┐        │
│         │                              │                              │        │
│         ▼                              ▼                              ▼        │
│  ┌─────────────┐              ┌─────────────┐              ┌─────────────┐   │
│  │ Agent A     │              │ Agent B     │              │ Agent N     │   │
│  │ (处理逻辑)   │              │ (处理逻辑)   │              │ (处理逻辑)   │   │
│  └──────┬──────┘              └──────┬──────┘              └──────┬──────┘   │
│         │                             │                             │          │
│         └─────────────────────────────┼─────────────────────────────┘          │
│                                          │                                          │
│                                          ▼                                          │
│                              ┌─────────────────────┐                              │
│                              │   LLM Service       │                              │
│                              │ (生成 JSON+ 数据)      │                              │
│                              └──────────┬──────────┘                              │
│                                         │                                          │
│                                         ▼                                          │
│                              ┌─────────────────────┐                              │
│                              │  Frontend Renderer   │                              │
│                              │  (Schema→VNode)      │                              │
│                              └─────────────────────┘                              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 15.2.2 调用流程详解

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              完整调用流程                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Client Request                                                              │
│     ┌─────────────┐                                                              │
│     │ User Input  │ ──▶ "帮我创建一个用户管理页面"                                │
│     └──────┬──────┘                                                              │
│            │                                                                     │
│            ▼                                                                     │
│  2. Gateway (WebSocket/HTTP)                                                    │
│     ┌─────────────┐                                                              │
│     │ Auth Check │ ──▶ JWT 验证、租户隔离                                         │
│     │ Route      │ ──▶ 路由到对应 Agent                                           │
│     └──────┬──────┘                                                              │
│            │                                                                     │
│            ▼                                                                     │
│  3. Agent Proxy (sessionKey/lane/queue)                                         │
│     ┌─────────────┐                                                              │
│     │ Session    │ ──▶ 创建会话、任务排队                                        │
│     │ Management │ ──▶ 多租户隔离 (tenant_id)                                    │
│     └──────┬──────┘                                                              │
│            │                                                                     │
│            ▼                                                                     │
│  4. Agent Logic                                                                  │
│     ┌─────────────┐                                                              │
│     │ Intent      │ ──▶ 解析用户意图                                             │
│     │ Recognition │                                                              │
│     ├─────────────┤                                                              │
│     │ Skill      │ ──▶ 选择执行 Skill                                            │
│     │ Selection  │                                                              │
│     ├─────────────┤                                                              │
│     │ Tool       │ ──▶ 调用 MCP 工具                                               │
│     │ Invocation │                                                              │
│     ├─────────────┤                                                              │
│     │ Data       │ ──▶ 处理业务数据                                             │
│     │ Processing │                                                              │
│     └──────┬──────┘                                                              │
│            │                                                                     │
│            ▼                                                                     │
│  5. LLM Service                                                                  │
│     ┌─────────────┐                                                              │
│     │ Prompt      │ ──▶ 构建上下文 prompt                                         │
│     │ Engineering│                                                              │
│     ├─────────────┤                                                              │
│     │ Schema     │ ──▶ 生成页面 Schema JSON                                      │
│     │ Generation │                                                              │
│     ├─────────────┤                                                              │
│     │ Data       │ ──▶ 生成业务数据                                             │
│     │ Generation │                                                              │
│     └──────┬──────┘                                                              │
│            │                                                                     │
│            ▼                                                                     │
│  6. Frontend Renderer                                                            │
│     ┌─────────────┐                                                              │
│     │ Parse       │ ──▶ 解析 Schema                                               │
│     │ Schema     │                                                              │
│     ├─────────────┤                                                              │
│     │ Render     │ ──▶ Schema → VNode                                           │
│     │ Components │                                                              │
│     ├─────────────┤                                                              │
│     │ Interactive│ ──▶ 处理用户交互                                              │
│     │ Events     │                                                              │
│     └─────────────┘                                                              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 15.2.3 核心模块架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            核心模块架构                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Platform Core                                    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │  应用管理     │  │  资源管理     │  │  工具管理     │  │  探索中心  │  │   │
│  │  │ Application  │  │  Resource    │  │  Tool Mgmt   │  │  Explore  │  │   │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├────────────┤  │   │
│  │  │ • 应用列表    │  │ • 组件管理    │  │ • MCP 管理    │  │ • 发现    │  │   │
│  │  │ • 应用设计    │  │ • 数据模型    │  │ • Skills 管理 │  │ • 模板    │  │   │
│  │  │ • 应用发布    │  │ • 组件市场    │  │ • 模型管理   │  │ • 推荐    │  │   │
│  │  │ • 版本管理    │  │              │  │              │  │           │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 15.3 功能模块设计

#### 15.3.1 资源管理模块

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              资源管理架构                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           资源管理 Resource Mgmt                         │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │   │
│  │  │    组件管理         │  │    数据模型         │  │   组件市场      │  │   │
│  │  │    Component      │  │    Data Model       │  │   Marketplace  │  │   │
│  │  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────┤  │   │
│  │  │ • 组件注册         │  │ • 模型定义          │  │ • 发现组件      │  │   │
│  │  │ • 组件版本        │  │ • 模型验证          │  │ • 安装/卸载     │  │   │
│  │  │ • 组件分类        │  │ • 模型发布          │  │ • 评分/评论     │  │   │
│  │  │ • 组件预览        │  │ • 模型导入/导出     │  │ • 收藏         │  │   │
│  │  │ • 组件配置        │  │                     │  │                 │  │   │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  组件类型分类:                                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │基础组件  │ │表单组件  │ │布局组件  │ │业务组件  │ │数据展示 │ │ 图表   │        │
│  │Button   │ │Input    │ │Container│ │Table    │ │List     │ │Chart   │        │
│  │Icon     │ │Select   │ │Row/Col  │ │Tree     │ │Card     │ │Graph   │        │
│  │Tag      │ │DatePicker│ │Grid    │ │Upload   │ │Calendar │ │Map     │        │
│  │Badge    │ │Cascader │ │Flex    │ │RichText │ │Timeline │ │Gantt   │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 15.3.2 工具管理模块

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              工具管理架构                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           工具管理 Tool Management                       │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │   │
│  │  │    MCP 管理          │  │   Skills 管理        │  │   模型管理      │  │   │
│  │  │    MCP Server      │  │   Skills            │  │   LLM Models   │  │   │
│  │  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────┤  │   │
│  │  │ • MCP 服务注册       │  │ • Skill 定义         │  │ • 模型配置      │  │   │
│  │  │ • 工具能力映射     │  │ • Skill 编排         │  │ • 模型调优     │  │   │
│  │  │ • 会话管理         │  │ • Skill 版本         │  │ • 使用统计     │  │   │
│  │  │ • 健康检查         │  │ • Skill 市场         │  │ • 成本分析     │  │   │
│  │  │ • 认证配置         │  │ • Skill 模板         │  │                 │  │   │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Skills 类型:                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  分析类      │ │  处理类      │ │  调用类      │ │  转换类      │            │
│  │  Analytics  │ │  Processor  │ │  Invoker    │ │  Transformer │            │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤            │
│  │• 数据分析    │ │• 文档处理    │ │• API 调用     │ │• 格式转换    │            │
│  │• 趋势预测    │ │• 数据清洗    │ │• MCP 调用     │ │• 数据映射    │            │
│  │• 报告生成    │ │• 文本处理    │ │• 函数执行    │ │• 结构转换    │            │
│  │• 可视化      │ │• 图像处理    │ │• 外部服务    │ │• 语言翻译    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 15.3.3 应用管理模块

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              应用管理架构                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           应用管理 Application Management               │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │   │
│  │  │    应用列表          │  │    应用设计         │  │   应用发布      │  │   │
│  │  │    App List         │  │    App Designer     │  │   App Publish  │  │   │
│  │  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────┤  │   │
│  │  │ • 应用卡片          │  │ • 流程画布          │  │ • 发布配置      │  │   │
│  │  │ • 搜索筛选         │  │ • 节点配置          │  │ • 版本管理      │  │   │
│  │  │ • 分类标签         │  │ • 变量管理          │  │ • 环境管理      │  │   │
│  │  │ • 收藏分享         │  │ • 预览测试          │  │ • 回滚         │  │   │
│  │  │ • 统计分析         │  │ • AI 辅助设计        │  │ • 监控告警     │  │   │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  支持节点类型:                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ LLM 节点  │ │ 条件节点 │ │ 循环节点 │ │ 工具节点 │ │ 输入节点 │              │
│  │LLM Node  │ │Condition│ │  Loop    │ │  Tool    │ │  Input   │              │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤              │
│  │• 模型选择│ │• 条件判断│ │• 循环执行│ │• 调用 MCP │ │• 表单输入│              │
│  │• Prompt │ │• 分支路由│ │• 退出条件│ │• 调用 API │ │• 文件上传│              │
│  │• 输出映射│ │• 默认分支│ │• 迭代变量│ │• 执行 Skill│ │• 参数验证│              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 15.3.4 探索模块

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              探索中心架构                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           探索中心 Explore                               │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                          │   │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │   │
│  │  │    发现             │  │    模板             │  │   推荐          │  │   │
│  │  │    Discover        │  │    Templates        │  │   Recommended  │  │   │
│  │  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────┤  │   │
│  │  │ • 热门应用         │  │ • 行业模板          │  │ • 猜你喜欢      │  │   │
│  │  │ • 最新上线         │  │ • 功能模板          │  │ • 相似应用      │  │   │
│  │  │ • 趋势分析         │  │ • 场景模板          │  │ • 智能推荐      │  │   │
│  │  │ • 分类浏览         │  │ • 模板市场          │  │ • 个性化        │  │   │
│  │  │ • 搜索             │  │ • 模板预览          │  │                 │  │   │
│  │  └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 15.4 核心数据模型

#### 15.4.1 Agent 模型

```typescript
// Agent 定义
interface Agent {
  id: string
  name: string
  description: string
  icon?: string
  category: AgentCategory
  tags: string[]

  // 核心配置
  config: AgentConfig

  // 编排信息
  workflow: WorkflowDefinition

  // 版本管理
  version: string
  versionHistory: VersionRecord[]

  // 发布状态
  status: AgentStatus
  publishedAt?: number
  publishedBy?: string

  // 统计
  stats: AgentStats

  // 权限
  visibility: 'public' | 'private' | 'organization'
  permissions: Permission[]

  // 时间
  createdAt: number
  updatedAt: number
}

type AgentCategory =
  | 'conversational' // 对话型
  | 'workflow' // 工作流型
  | 'data_processing' // 数据处理型
  | 'automation' // 自动化型
  | 'analysis' // 分析型

type AgentStatus =
  | 'draft' // 草稿
  | 'testing' // 测试中
  | 'published' // 已发布
  | 'deprecated' // 已废弃

interface AgentConfig {
  // 模型配置
  model: ModelConfig

  // 能力配置
  capabilities: {
    multiModal: boolean
    functionCall: boolean
    streaming: boolean
    rag: boolean
  }

  // 限制配置
  limits: {
    maxTokens: number
    temperature: number
    topP: number
    timeout: number
  }

  // 安全配置
  security: {
    inputFilter: boolean
    outputFilter: boolean
    piiDetection: boolean
  }
}
```

#### 15.4.2 Skill 模型

```typescript
// Skill 定义
interface Skill {
  id: string
  name: string
  description: string
  icon?: string
  category: SkillCategory

  // Skill 类型
  type: SkillType

  // 定义
  definition: SkillDefinition

  // 输入输出
  inputSchema: JSONSchema
  outputSchema: JSONSchema

  // 版本
  version: string

  // 状态
  status: SkillStatus

  // 使用统计
  usage: SkillUsage

  createdAt: number
  updatedAt: number
}

type SkillCategory =
  | 'analytics' // 分析类
  | 'processing' // 处理类
  | 'invoker' // 调用类
  | 'transformer' // 转换类

type SkillType =
  | 'builtin' // 内置 Skill
  | 'custom' // 自定义 Skill
  | 'template' // 模板 Skill

interface SkillDefinition {
  // 执行逻辑
  executor: {
    type: 'code' | 'workflow' | 'mcp'
    config: any
  }

  // 能力描述
  capabilities: string[]

  // 参数定义
  parameters: ParameterDefinition[]

  // 示例
  examples: SkillExample[]
}
```

#### 15.4.3 MCP 模型

```typescript
// MCP 服务器配置
interface MCPServer {
  id: string
  name: string
  description: string
  icon?: string

  // 连接配置
  connection: MCPConnectionConfig

  // 认证配置
  auth?: MCPAuthConfig

  // 能力定义
  capabilities: MCPCapability[]

  // 健康状态
  health: {
    status: 'healthy' | 'unhealthy' | 'unknown'
    lastCheck: number
    message?: string
  }

  // 使用统计
  usage: MCPUsage

  createdAt: number
  updatedAt: number
}

interface MCPConnectionConfig {
  // 连接模式
  transport: 'stdio' | 'sse' | 'http'

  // stdio 配置
  stdio?: {
    command: string
    args: string[]
    env?: Record<string, string>
  }

  // HTTP/SSE 配置
  url?: string
  headers?: Record<string, string>
}

interface MCPCapability {
  // 能力类型
  type: 'tool' | 'resource' | 'prompt'

  // 能力标识
  name: string

  // 能力描述
  description: string

  // 输入模式
  inputSchema: JSONSchema

  // 启用状态
  enabled: boolean
}
```

#### 15.4.4 Application 模型

```typescript
// 应用定义
interface Application {
  id: string
  name: string
  description: string
  icon?: string
  coverImage?: string

  // 关联 Agent
  agentId: string
  agentName: string

  // 编排信息
  orchestration: AppOrchestration

  // 发布配置
  publishConfig: PublishConfig

  // 版本管理
  versions: AppVersion[]
  currentVersion: string

  // 状态
  status: ApplicationStatus

  // 统计
  stats: AppStats

  // 权限
  visibility: 'public' | 'private' | 'organization'

  createdAt: number
  updatedAt: number
}

interface AppOrchestration {
  // 编排类型
  type: 'visual' | 'code' | 'hybrid'

  // 流程定义
  workflow?: WorkflowDefinition

  // 变量
  variables: Variable[]

  // 环境变量
  envVariables: EnvVariable[]
}

interface PublishConfig {
  // 发布模式
  mode: 'standard' | 'serverless' | 'embedded'

  // 访问配置
  access: {
    authentication: 'none' | 'api_key' | 'jwt' | 'oauth'
    rateLimit?: RateLimitConfig
    allowedOrigins?: string[]
  }

  // 域名配置
  domain?: {
    customDomain?: string
    pathPrefix?: string
  }

  // 高级配置
  advanced?: {
    retry: boolean
    timeout: number
    cache: boolean
  }
}
```

#### 15.4.5 组件模型

```typescript
// 前端组件
interface Component {
  id: string
  name: string
  displayName: string
  description: string
  icon?: string
  category: ComponentCategory
  tags: string[]

  // 组件类型
  type: ComponentType

  // 定义
  definition: ComponentDefinition

  // 版本
  version: string
  versionHistory: ComponentVersion[]

  // 状态
  status: ComponentStatus

  // 使用统计
  usage: ComponentUsage

  createdAt: number
  updatedAt: number
}

type ComponentCategory =
  | 'basic' // 基础组件
  | 'form' // 表单组件
  | 'layout' // 布局组件
  | 'data' // 数据展示
  | 'business' // 业务组件
  | 'chart' // 图表组件

type ComponentType =
  | 'builtin' // 内置组件
  | 'custom' // 自定义组件
  | 'mcp' // MCP 渲染组件

interface ComponentDefinition {
  // 渲染配置
  renderer: {
    type: string
    props: Record<string, PropDefinition>
  }

  // 事件定义
  events: EventDefinition[]

  // 插槽定义
  slots: SlotDefinition[]

  // 样式定义
  styles: StyleDefinition[]

  // 预览
  preview?: {
    thumbnail?: string
    code?: string
  }
}
```

#### 15.4.6 DataModel 模型

```typescript
// 数据模型
interface DataModel {
  id: string
  name: string
  displayName: string
  description: string
  category: DataModelCategory

  // Schema 定义
  schema: JSONSchema

  // 验证规则
  validation?: ValidationRule[]

  // 关系定义
  relations?: DataModelRelation[]

  // 版本
  version: string

  // 使用统计
  usage: DataModelUsage

  createdAt: number
  updatedAt: number
}

type DataModelCategory =
  | 'entity' // 实体模型
  | 'input' // 输入模型
  | 'output' // 输出模型
  | 'intermediate' // 中间模型

interface DataModelRelation {
  targetModelId: string
  type: 'one_to_one' | 'one_to_many' | 'many_to_many'
  foreignKey?: string
}
```

### 15.5 API 接口设计

#### 15.5.1 REST API

```
基础 URL: /api/v1

资源管理
───────────────────────────────────────────────────────────────────────────
GET    /components              获取组件列表
POST   /components              创建组件
GET    /components/:id          获取组件详情
PUT    /components/:id          更新组件
DELETE /components/:id          删除组件

GET    /data-models             获取数据模型列表
POST   /data-models             创建数据模型
GET    /data-models/:id         获取数据模型详情
PUT    /data-models/:id         更新数据模型
DELETE /data-models/:id         删除数据模型

工具管理
───────────────────────────────────────────────────────────────────────────
GET    /mcp-servers             获取 MCP 服务器列表
POST   /mcp-servers             创建 MCP 服务器
GET    /mcp-servers/:id         获取 MCP 服务器详情
PUT    /mcp-servers/:id         更新 MCP 服务器
DELETE /mcp-servers/:id         删除 MCP 服务器
POST   /mcp-servers/:id/test    测试 MCP 服务器连接

GET    /skills                  获取 Skill 列表
POST   /skills                  创建 Skill
GET    /skills/:id              获取 Skill 详情
PUT    /skills/:id              更新 Skill
DELETE /skills/:id              删除 Skill

GET    /models                  获取模型列表
POST   /models                  创建模型配置
GET    /models/:id              获取模型详情
PUT    /models/:id              更新模型配置
DELETE /models/:id              删除模型配置

应用管理
───────────────────────────────────────────────────────────────────────────
GET    /applications            获取应用列表
POST   /applications            创建应用
GET    /applications/:id        获取应用详情
PUT    /applications/:id        更新应用
DELETE /applications/:id        删除应用
POST   /applications/:id/publish 发布应用
POST   /applications/:id/unpublish 取消发布
GET    /applications/:id/versions 获取版本列表
POST   /applications/:id/rollback 回滚版本

探索中心
───────────────────────────────────────────────────────────────────────────
GET    /explore                 获取发现列表
GET    /explore/templates       获取模板列表
GET    /explore/recommended     获取推荐列表
GET    /explore/:id             获取详情
POST   /explore/:id/copy        复制应用

执行接口
───────────────────────────────────────────────────────────────────────────
POST   /execute/:appId          执行应用
GET    /execute/:appId/history  获取执行历史
GET    /execute/:sessionId      获取执行结果
```

#### 15.5.2 WebSocket API

```
WebSocket 端点：/ws/v1

连接消息
───────────────────────────────────────────────────────────────────────────
Client -> Server:
  {
    "type": "connect",
    "payload": {
      "sessionKey": "xxx",
      "tenantId": "xxx",
      "appId": "xxx"
    }
  }

Server -> Client:
  {
    "type": "connected",
    "payload": { "sessionId": "xxx" }
  }

执行消息
───────────────────────────────────────────────────────────────────────────
Client -> Server:
  {
    "type": "execute",
    "payload": {
      "appId": "xxx",
      "input": { ... }
    }
  }

Server -> Client (流式):
  {
    "type": "chunk",
    "payload": { "content": "xxx" }
  }

Server -> Client (完成):
  {
    "type": "complete",
    "payload": {
      "result": { ... },
      "schema": { ... }
    }
  }

错误消息
───────────────────────────────────────────────────────────────────────────
Server -> Client:
  {
    "type": "error",
    "payload": {
      "code": "xxx",
      "message": "xxx"
    }
  }

心跳消息
───────────────────────────────────────────────────────────────────────────
Client -> Server: {"type": "ping"}
Server -> Client: {"type": "pong"}
```

### 15.6 前端架构设计

#### 15.6.1 页面路由结构

```
/
├── /                         欢迎页 (WelcomePage)
│
├── /app                      主应用布局 (AppLayout)
│   │
│   ├── /app/conversation     对话页面 (ConversationPage)
│   │   • 对话列表
│   │   • 消息区域
│   │   • 输入区域
│   │
│   ├── /app/explore          探索中心 (ExplorePage)
│   │   • 发现
│   │   • 模板
│   │   • 推荐
│   │
│   ├── /app/applications     应用管理
│   │   ├── /app/applications/list    应用列表 (AppListPage)
│   │   ├── /app/applications/design/:id  应用设计 (AppDesignPage)
│   │   └── /app/applications/publish/:id  发布配置 (AppPublishPage)
│   │
│   ├── /app/resources        资源管理
│   │   ├── /app/resources/components    组件管理 (ComponentsPage)
│   │   ├── /app/resources/data-models   数据模型 (DataModelsPage)
│   │   └── /app/resources/market       组件市场 (MarketPage)
│   │
│   ├── /app/tools            工具管理
│   │   ├── /app/tools/mcp          MCP 管理 (MCPManagementPage)
│   │   ├── /app/tools/skills       Skills 管理 (SkillsPage)
│   │   └── /app/tools/models       模型管理 (ModelsPage)
│   │
│   └── /app/settings         系统设置 (SettingsPage)
│       • 个人设置
│       • 企业设置
│       • API 密钥管理
│
└── /play/:componentId       组件调试 (PlaygroundPage)
```

#### 15.6.2 状态管理架构

```
Store Modules
───────────────────────────────────────────────────────────────────────────

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ app store     │  │ user store     │  │ settings store │
│ • 侧边栏状态  │  │ • 用户信息     │  │ • 主题配置     │
│ • 控制台状态 │  │ • 权限信息     │  │ • 语言配置     │
│ • 通知状态   │  │ • 租户信息     │  │ • 企业配置     │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ applications   │  │ components    │  │ tools store   │
│ • 应用列表     │  │ • 组件列表     │  │ • MCP 服务器   │
│ • 当前应用     │  │ • 组件详情     │  │ • Skills      │
│ • 编排状态     │  │ • 组件版本     │  │ • 模型配置    │
│ • 执行状态     │  │ • 编辑状态     │  │                │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│ explore store │  │ execution     │
│ • 发现列表    │  │ • 执行历史    │
│ • 模板列表    │  │ • 执行状态    │
│ • 推荐列表    │  │ • 执行结果    │
│ • 搜索结果    │  │ • 流式输出    │
└────────────────┘  └────────────────┘
```

### 15.7 UI 设计规范 (White-Blue 主题)

#### 15.7.1 设计理念

```
核心风格：简约清晰、白蓝主题、Dify 风格
───────────────────────────────────────────────────────────────────────────

• 简洁纯净：大量留白，减少视觉噪音
• 清晰层级：明确的视觉层级，信息层次分明
• 专业感：白色为主，蓝色点缀，企业级品质
• 现代化：扁平化设计，卡片式布局
• 微交互：细腻的过渡动画，提升体验

设计参考：Dify, Linear, Vercel
```

#### 15.7.2 色彩系统

```scss
// 白色蓝色主题 (Dify 风格)
// ============================================

// 主色调 - 企业蓝
$primary-color: #3b82f6; // 主色 - 蓝色
$primary-hover: #2563eb; // 主色悬停
$primary-light: #60a5fa; // 主色浅
$primary-lightest: #dbeafe; // 主色最浅

// 辅助色
$secondary-color: #6366f1; // 紫色 (次要操作)
$accent-color: #10b981; // 绿色 (成功/强调)

// 背景色系
$bg-primary: #ffffff; // 主背景 - 纯白
$bg-secondary: #f8fafc; // 次级背景 - 极淡灰
$bg-tertiary: #f1f5f9; // 三级背景 - 淡灰
$bg-elevated: #ffffff; // 卡片背景
$bg-overlay: rgba(0, 0, 0, 0.5); // 遮罩层

// 边框色
$border-color: #e2e8f0; // 默认边框
$border-color-light: #f1f5f9; // 浅边框
$border-color-focus: #3b82f6; // 聚焦边框

// 文字色系
$text-primary: #1e293b; // 主文字 - 深灰蓝
$text-secondary: #64748b; // 次要文字
$text-tertiary: #94a3b8; // 辅助文字
$text-disabled: #cbd5e1; // 禁用文字

// 功能色
$success: #10b981; // 成功 - 绿色
$success-bg: #ecfdf5; // 成功背景
$warning: #f59e0b; // 警告 - 橙色
$warning-bg: #fffbeb; // 警告背景
$error: #ef4444; // 错误 - 红色
$error-bg: #fef2f2; // 错误背景
$info: #3b82f6; // 信息 - 蓝色
$info-bg: #eff6ff; // 信息背景

// 阴影系统
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

// 特定阴影
$shadow-card:
  0 1px 3px 0 rgba(0, 0, 0, 0.1),
  0 1px 2px -1px rgba(0, 0, 0, 0.1);
$shadow-dropdown:
  0 10px 15px -3px rgba(0, 0, 0, 0.1),
  0 4px 6px -4px rgba(0, 0, 0, 0.1);
$shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

#### 15.7.3 间距系统

```scss
$spacing-unit: 4px;

// 间距
$spacing-xs: 4px; // 0.25rem
$spacing-sm: 8px; // 0.5rem
$spacing-md: 16px; // 1rem
$spacing-lg: 24px; // 1.5rem
$spacing-xl: 32px; // 2rem
$spacing-2xl: 48px; // 3rem
$spacing-3xl: 64px; // 4rem
```

#### 15.7.4 字体系统

```scss
$font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'PingFang SC',
  'Microsoft YaHei',
  sans-serif;

$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;
$font-size-2xl: 20px;
$font-size-3xl: 24px;
$font-size-4xl: 30px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

#### 15.7.5 圆角系统

```scss
$border-radius-sm: 4px;
$border-radius-md: 6px;
$border-radius-lg: 8px;
$border-radius-xl: 12px;
$border-radius-2xl: 16px;
$border-radius-full: 9999px;
```

#### 15.7.6 按钮样式示例

```vue
<!-- 白色主题按钮组件示例 -->
<template>
  <button
    class="sl-button"
    :class="[`sl-button--${type}`, `sl-button--${size}`, { 'sl-button--disabled': disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="sl-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
  interface Props {
    type?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
  }

  withDefaults(defineProps<Props>(), {
    type: 'primary',
    size: 'medium',
    disabled: false
  })

  const emit = defineEmits<{ click: [event: MouseEvent] }>()

  const handleClick = (event: MouseEvent) => {
    if (!disabled) {
      emit('click', event)
    }
  }
</script>

<style lang="scss" scoped>
  .sl-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;

    &--primary {
      background-color: #3b82f6;
      color: #ffffff;
      border-color: #3b82f6;

      &:hover:not(:disabled) {
        background-color: #2563eb;
        border-color: #2563eb;
      }
    }

    &--secondary {
      background-color: #ffffff;
      color: #1e293b;
      border-color: #e2e8f0;

      &:hover:not(:disabled) {
        background-color: #f8fafc;
        border-color: #cbd5e1;
      }
    }

    &--ghost {
      background-color: transparent;
      color: #3b82f6;
      border-color: transparent;

      &:hover:not(:disabled) {
        background-color: #eff6ff;
      }
    }

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
```

### 15.8 集成模式

#### 15.8.1 MCP 集成

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MCP 集成架构                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  前端                                                                    │
│    │                                                                    │
│    │ WebSocket/stdio                                                    │
│    ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       MCP Client SDK                            │   │
│  │  • 连接管理                                                      │   │
│  │  • 工具调用                                                      │   │
│  │  • 资源访问                                                      │   │
│  │  • 会话管理                                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│    │                                                                    │
│    │ JSON-RPC 2.0                                                      │
│    ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     MCP Protocol Layer                          │   │
│  │                                                                  │   │
│  │  • tools/list        - 列出可用工具                              │   │
│  │  • tools/call        - 调用工具                                  │   │
│  │  • resources/*       - 资源操作                                 │   │
│  │  • prompts/*        - 提示词管理                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│    │                                                                    │
│    │ stdio / HTTP / SSE                                               │
│    ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     MCP Server                                  │   │
│  │  • 文件系统                                                      │   │
│  │  • 数据库                                                        │   │
│  │  • API 调用                                                       │   │
│  │  • 自定义工具                                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 15.8.2 LLM 集成

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LLM 集成架构                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        LLM Adapter Layer                       │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │   OpenAI     │  │   Claude     │  │   Ollama     │          │   │
│  │  │   Adapter    │  │   Adapter    │  │   Adapter    │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        LLM Service                              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                  │   │
│  │  • 模型选择                                                      │   │
│  │  • Prompt 工程                                                   │   │
│  │  • 参数调优                                                      │   │
│  │  • 结果解析                                                      │   │
│  │  • 流式输出                                                      │   │
│  │  • 成本计算                                                      │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       Agent Logic                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.9 部署架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              部署架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Client Layer                             │   │
│  │  • Web (Vue/React)                                              │   │
│  │  • Mobile (iOS/Android)                                        │   │
│  │  • API Client                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼ CDN / Load Balancer               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Gateway Layer                            │   │
│  │  • 负载均衡                                                      │   │
│  │  • 限流熔断                                                      │   │
│  │  • 身份认证                                                      │   │
│  │  • 请求路由                                                      │   │
│  │  • SSL Termination                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Application Layer                       │   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │   API Pod    │  │  Agent Pod   │  │  WebSocket  │          │   │
│  │  │  (REST API)  │  │  (Executor)  │  │   Pod       │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Data Layer                               │   │
│  │                                                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │  PostgreSQL  │  │    Redis     │  │  Object     │          │   │
│  │  │  (主数据)    │  │  (缓存/会话)  │  │  Storage    │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.10 安全与合规

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              安全架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  认证与授权                                                              │
│  ───────────────────────────────────────────────────────────────────   │
│  • JWT Token 认证                                                       │
│  • OAuth 2.0 / SSO                                                      │
│  • API Key 管理                                                         │
│  • 多租户隔离                                                            │
│  • 细粒度权限控制                                                        │
│                                                                          │
│  数据安全                                                                │
│  ───────────────────────────────────────────────────────────────────   │
│  • 传输加密 (TLS 1.3)                                                   │
│  • 存储加密 (AES-256)                                                  │
│  • 敏感数据脱敏                                                         │
│  • PII 检测与处理                                                        │
│                                                                          │
│  网络安全                                                                │
│  ───────────────────────────────────────────────────────────────────   │
│  • DDoS 防护                                                            │
│  • WAF 防火墙                                                           │
│  • IP 白名单                                                            │
│  • 请求限流                                                             │
│                                                                          │
│  合规性                                                                  │
│  ───────────────────────────────────────────────────────────────────   │
│  • GDPR 合规                                                            │
│  • SOC 2 认证                                                           │
│  • 日志审计                                                             │
│  • 数据保留策略                                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.11 开发计划

#### 15.11.1 第一阶段：基础架构

- [ ] 项目初始化与 Monorepo 结构完善
- [ ] 基础 UI 组件库 (White-Blue 主题)
- [ ] 布局组件 (AppLayout, Sidebar, Header)
- [ ] 基础路由配置

#### 15.11.2 第二阶段：资源管理

- [ ] 组件管理模块开发
- [ ] 数据模型模块开发
- [ ] 组件市场

#### 15.11.3 第三阶段：工具管理

- [ ] MCP 管理模块
- [ ] Skills 管理模块
- [ ] 模型管理模块

#### 15.11.4 第四阶段：应用管理

- [ ] 应用列表与详情
- [ ] 应用编排器 (可视化流程设计)
- [ ] 应用发布与版本管理

#### 15.11.5 第五阶段：探索与执行

- [ ] 探索中心
- [ ] 应用执行引擎
- [ ] WebSocket 实时通信
- [ ] 前端渲染器集成

#### 15.11.6 第六阶段：企业级特性

- [ ] 多租户支持
- [ ] 权限系统
- [ ] 监控与告警
- [ ] 性能优化

### 15.12 总结

本设计方案为企业级 Agent 应用管理平台提供了完整的架构规划：

**核心亮点：**

1. **OpenClaw-like 架构**：Client → Gateway → Agent Proxy → Agent Logic → LLM → Renderer 的完整调用链路
2. **模块化设计**：资源管理、工具管理、应用管理、探索中心四大模块清晰分离
3. **标准化集成**：MCP 协议支持、多种 LLM 适配器、统一的 API 设计
4. **企业级特性**：多租户、高并发、安全合规、监控运维
5. **White-Blue 主题**：简约清晰的 Dify 风格 UI 设计

**架构优势：**

- 前后端分离，前端专注渲染与交互
- Schema 驱动，LLM 生成页面结构
- MCP 生态支持，工具能力可扩展
- 工作流编排，复杂业务可配置
- 多租户隔离，企业级安全

---

_文档版本：2.0_  
_更新日期：2026-03-05_  
_文档状态：架构设计完成_
