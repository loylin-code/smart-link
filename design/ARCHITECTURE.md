# SmartLink Enterprise Agent Platform - 完整架构设计文档

> **文档版本**: 2.1  
> **更新日期**: 2026-03-18  
> **设计状态**: 架构设计完成，已根据前端实现更新  
> **架构模式**: 基于 Role 的数字员工智能体管理平台  
> **整合来源**: ROLE-BASED-AGENT-ARCHITECTURE.md + ARCHITECTURE.md + 前端实现代码

---

## 目录

### 第一部分：总体架构

1. [架构概述](#1-架构概述)
2. [核心概念](#2-核心概念)
3. [系统架构全景图](#3-系统架构全景图)

### 第二部分：核心模型设计

4. [Role 模型设计](#4-role-模型设计)
5. [路由智能体架构](#5-路由智能体架构)
6. [执行 Agent 架构](#6-执行-agent-架构)

### 第三部分：通信与交互

7. [双向通信架构](#7-双向通信架构)
8. [完整调用流程](#8-完整调用流程)

### 第四部分：可视化渲染

9. [可视化内容渲染](#9-可视化内容渲染)
10. [UI 设计规范](#10-ui-设计规范)
11. [UX 设计方案](#11-ux-设计方案)

### 第五部分：能力与集成

12. [能力层架构](#12-能力层架构)
13. [API 接口设计](#13-api-接口设计)
14. [集成模式](#14-集成模式)

### 第六部分：企业级特性

15. [工作流引擎](#15-工作流引擎)
16. [错误处理与容错](#16-错误处理与容错)
17. [缓存策略](#17-缓存策略)
18. [监控与可观测性](#18-监控与可观测性)

### 第七部分：部署与运维

19. [部署架构](#19-部署架构)
20. [安全与合规](#20-安全与合规)
21. [关键技术决策](#21-关键技术决策)
22. [风险与解决方案](#22-风险与解决方案)
23. [实施路线图](#23-实施路线图)

---

## 1. 架构概述

### 1.1 项目定位

SmartLink Enterprise Agent Platform 是一个**基于 Role（角色）的智能企业级 Agent 应用管理平台**，通过构建不同角色的智能体，打造体系化、规范化的数字员工，变革传统模式的数字化交互体系。

### 1.2 核心调用链

```
终端 (Web 浏览器/Mobile App) → 网关 → 路由智能体 → 执行 Agent → 意图识别/调用 MCP/SKILL/TOOL → LLM 响应 → 返回可视化内容 (文本、卡片、报表等)
```

### 1.3 交互模式

系统支持**双向交互模式**：

| 模式         | 描述                   | 场景示例                     |
| ------------ | ---------------------- | ---------------------------- |
| **主动推送** | 按角色主动推送预警信息 | 库存告警、销售日报、异常通知 |
| **用户问询** | 用户主动发起对话       | 数据查询、报表生成、业务咨询 |

### 1.4 核心能力

#### 1.4.1 智能化设计编排

| 能力                | 描述                                               |
| ------------------- | -------------------------------------------------- |
| **大模型驱动**      | 基于 LLM 理解自然语言需求，自动生成 Agent 编排流程 |
| **Role 体系化**     | 标准化的角色定义和能力封装，打造数字员工           |
| **确定性组件**      | 标准化前端组件库，支持 Schema 驱动渲染             |
| **MCP 协议集成**    | Model Context Protocol 工具生态无缝接入            |
| **Skills 能力复用** | 可组合的技能模块，支持复杂业务场景                 |

#### 1.4.2 企业级部署运维

| 能力           | 描述                                        |
| -------------- | ------------------------------------------- |
| **多租户架构** | 租户隔离、资源配额、独立命名空间            |
| **高并发支持** | WebSocket 实时通信、会话管理、任务队列      |
| **安全合规**   | JWT 认证、OAuth 2.0/SSO、数据加密、审计日志 |
| **监控运维**   | 应用监控、资源统计、告警通知                |

#### 1.4.3 可视化编排体验

| 能力               | 描述                                    |
| ------------------ | --------------------------------------- |
| **拖拽式流程设计** | 所见即所得的 Agent 工作流编排           |
| **实时预览调试**   | 设计态与运行态无缝切换                  |
| **版本管理**       | 应用版本控制、回滚、灰度发布            |
| **动态渲染**       | LLM 生成 Schema，前端渲染器实时渲染页面 |

### 1.5 目标用户

| 用户群体         | 使用场景            | 核心需求                         |
| ---------------- | ------------------- | -------------------------------- |
| **企业 IT 部门** | 构建内部 Agent 应用 | 企业级部署、安全合规、多租户管理 |
| **开发者**       | 快速编排 Agent 流程 | 可视化设计、MCP 集成、API 调试   |
| **业务人员**     | AI 辅助创建 Agent   | 自然语言交互、模板市场、一键部署 |

---

## 2. 核心概念

| 概念                | 说明                                             | 类比              |
| ------------------- | ------------------------------------------------ | ----------------- |
| **Role（角色）**    | 数字员工的完整定义，包含身份、能力、知识库、权限 | 岗位 JD+ 员工手册 |
| **Router Agent**    | 智能路由决策引擎，识别意图并分发到合适角色       | 前台接待 + 调度员 |
| **Execution Agent** | 角色的运行时实例，执行具体任务                   | 在岗员工          |
| **MCP**             | Model Context Protocol，标准化的工具/资源接口    | USB-C 接口        |
| **Skill**           | 可复用的工作流/能力模块                          | 职业技能          |
| **Tool**            | 单一功能的 API/函数调用                          | 工具软件          |

---

## 3. 系统架构全景图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │  Mobile App │  │   Mini App  │  │  Desktop/Embedded   │ │
│  │  (Vue 3.4)  │  │  (UniApp)   │  │    (Vue)    │  │    (Electron)       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                    │            │
│         └────────────────┴────────────────┴────────────────────┘            │
│                                   │                                         │
│                          ┌────────┴────────┐                                │
│                          │  Unified SDK    │                                │
│                          │ (Connection Mgr)│                                │
│                          └────────┬────────┘                                │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GATEWAY LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     API Gateway (Kong/AWS ALB)                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │   Auth      │  │   Rate      │  │   Load      │  │   Circuit       │ │ │
│  │  │  (JWT/OAuth)│  │   Limit     │  │   Balance   │  │   Breaker       │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────┬───────────────────────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────┴───────────────────────────────────────┐ │
│  │                     Realtime Gateway (WebSocket/ SSE)                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │ Connection  │  │   Room      │  │   Push      │  │   Presence      │ │ │
│  │  │    Pool     │  │   Manager   │  │   Router    │  │   (Online)      │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATION LAYER                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       Router Agent Core                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │ │
│  │  │                    Intent Classification                          │    │ │
│  │  │  • Rule-based (keywords, regex)                                   │    │ │
│  │  │  • LLM Few-shot (dynamic examples)                                │    │ │
│  │  │  • Embedding similarity                                           │    │ │
│  │  │  • Historical pattern learning                                    │    │ │
│  │  └─────────────────────────────────────────────────────────────────┘    │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │ │
│  │  │              Routing Strategy Engine                              │    │ │
│  │  │  Score = α·context + β·preference + γ·capability + δ·history     │    │ │
│  │  └─────────────────────────────────────────────────────────────────┘    │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐    │ │
│  │  │              Session & State Manager                              │    │ │
│  │  │  States: idle → routing → executing → responding → idle          │    │ │
│  │  └─────────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                      Agent Runtime Pool                                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │ │
│  │  │ Agent #1 │ │ Agent #2 │ │ Agent #3 │ │ Agent #N │ │  Warm Pool   │  │ │
│  │  │(Sales)   │ │(Support) │ │(Analyst) │ │(Custom)  │ │  (Pre-warm)  │  │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────────┘  │ │
│  │       └────────────┴────────────┴────────────┘                          │ │
│  │                         │                                               │ │
│  │              ┌──────────┴──────────┐                                    │ │
│  │              │    Agent Factory    │                                    │ │
│  │              │  (Create/Destroy)   │                                    │ │
│  │              └─────────────────────┘                                    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Event Bus (Async Communication)                      │ │
│  │  Redis Pub/Sub  │  Kafka Streams  │  Rabbit MQ  │  Scheduled Tasks     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPABILITY LAYER                                     │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │      MCP Hub        │  │     Skill Engine    │  │     Tool Registry   │  │
│  │  • MCP Client       │  │  • Skill Parser     │  │  • Tool Discovery   │  │
│  │  • Server Mgr       │  │  • Execution Engine │  │  • Execution Sandbox│  │
│  │  • Capability Reg   │  │  • Version Control  │  │  • Permission Check │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     LLM Gateway (Model Router)                          │ │
│  │  GPT-4 (OpenAI)  │  Claude (Anthropic)  │  Qwen (Aliyun)  │  Local    │ │
│  │  Features: Prompt Template | Token Usage | Cost Tracking | Caching      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Knowledge Base (RAG)                                 │ │
│  │  Document Parser  │  Embedding Service  │  Vector DB  │  Hybrid Search │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Role 模型设计

### 4.1 核心 Role 模型

```typescript
// ============ 基础定义 ============

enum RoleStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 激活可用
  PAUSED = 'paused', // 暂停
  DEPRECATED = 'deprecated' // 废弃
}

enum RoleType {
  SYSTEM = 'system', // 系统预置角色
  CUSTOM = 'custom', // 用户自定义角色
  TEMPLATE = 'template' // 模板角色（可复制）
}

// ============ 核心角色模型 ============

interface Role {
  // === 基础信息 ===
  id: string
  type: RoleType
  status: RoleStatus

  // === 身份定义 ===
  identity: {
    name: string // 显示名称
    code: string // 唯一编码（路由键）
    avatar: string // 头像 URL
    description: string // 角色描述
    persona: string // 人设 Prompt（系统提示词）
    welcomeMessage: string // 欢迎语
    responsibilities: Responsibility[] // 职责清单
    workingHours?: WorkingHours // 工作时间
  }

  // === 能力定义 ===
  capabilities: {
    mcpServers: MCPServerBinding[] // MCP 服务绑定
    skills: SkillBinding[] // 技能绑定
    tools: ToolBinding[] // 工具绑定
    llm: LLMConfig // LLM 配置
  }

  // === 知识库 ===
  knowledge: {
    documents: DocumentSource[] // 文档源
    databases: DatabaseSource[] // 数据库连接
    apis: APISource[] // API 数据源
    searchConfig: SearchConfig // 检索配置
  }

  // === 权限控制 ===
  permissions: {
    scope: PermissionScope // 权限范围
    resources: ResourcePermission[] // 资源权限
    operations: OperationPermission[] // 操作权限
    dataAccess: DataAccessRule[] // 数据访问规则
  }

  // === 交互配置 ===
  interaction: {
    channels: ChannelConfig[] // 支持的渠道
    responseMode: ResponseMode // 响应模式
    pushRules: PushRule[] // 主动推送规则
    handoffConfig: HandoffConfig // 转人工配置
  }

  // === 运行时配置 ===
  runtime: {
    maxConcurrent: number // 最大并发
    timeoutSeconds: number // 超时时间
    retryPolicy: RetryPolicy // 重试策略
    memoryLimit: MemoryLimit // 内存限制
  }

  // === 元数据 ===
  meta: {
    version: number // 版本号
    creator: string // 创建者
    createdAt: Date
    updatedAt: Date
    tags: string[] // 标签
    category: string // 分类
  }
}

// ============ 子模型 ============

interface Responsibility {
  id: string
  name: string // 职责名称
  description: string // 描述
  priority: number // 优先级（影响路由）
  keywords: string[] // 关键词（用于意图识别）
  examples: string[] // 示例问法
}

interface MCPServerBinding {
  serverId: string
  required: boolean
  fallbackAction: 'skip' | 'error' | 'wait'
  customConfig?: Record<string, unknown>
}

interface SkillBinding {
  skillId: string
  version: string
  enabled: boolean
  parameters: Record<string, unknown>
}

interface LLMConfig {
  provider: string
  model: string
  temperature: number
  maxTokens: number
  topP: number
  systemPrompt?: string
}

// ============ 运行时实例 ============

interface RoleInstance {
  instanceId: string
  roleId: string
  status: 'initializing' | 'ready' | 'busy' | 'error'

  session: {
    id: string
    userId: string
    context: ContextSnapshot
    history: Message[]
    state: WorkflowState
  }

  resources: {
    memory: number
    cpu: number
    tokensConsumed: number
    toolsActive: string[]
  }

  createdAt: Date
  lastActivity: Date
}
```

### 4.2 角色能力矩阵

```
┌──────────────────┬──────────────┬──────────────┬────────────────┐
│    Capability    │    MCP       │    Skill     │     Tool       │
├──────────────────┼──────────────┼──────────────┼────────────────┤
│  Granularity     │  Service     │  Workflow    │  Function      │
│  Protocol        │  MCP Std     │  Internal    │  HTTP/SDK      │
│  Lifecycle       │  Long-lived  │  On-demand   │  Stateless     │
│  Discovery       │  Registry    │  Versioned   │  Dynamic       │
│  Composition     │  Chain       │  DAG         │  Sequential    │
│  Error Handle    │  Reconnect   │  Retry       │  Fail-fast     │
└──────────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 5. 路由智能体架构

### 5.1 Router Agent 核心职责

1. **意图识别**：将用户输入映射到最匹配的 Role
2. **路由决策**：基于上下文、偏好、能力选择目标 Agent
3. **会话管理**：维护用户 -Role 的多对多关系
4. **协调调度**：处理多 Role 协同场景
5. **降级处理**：无匹配时的 fallback 策略

### 5.2 路由策略

```typescript
enum RoutingStrategy {
  BEST_MATCH = 'best_match', // 单一最佳匹配
  MULTI_AGENT = 'multi_agent', // 多 Role 协同（复杂任务）
  ROUND_ROBIN = 'round_robin', // 轮询（负载均衡）
  USER_SPECIFIED = 'user_specified', // 用户指定
  SMART_RECOMMEND = 'smart_recommend' // 智能推荐
}

interface RoutingDecision {
  sessionId: string
  decisionType: 'single' | 'multi' | 'clarify' | 'reject'

  targetRole?: {
    roleId: string
    confidence: number
    reason: string
  }

  targetRoles?: {
    roleId: string
    subtask: string
    order: number
  }[]

  clarification?: {
    candidates: RoleBrief[]
    question: string
  }

  context: {
    userIntent: string
    extractedEntities: Entity[]
    conversationHistory: Message[]
    userPreferences: UserPreference
  }

  timestamp: Date
}
```

### 5.3 多角色路由流程

```
User Input → Intent Analysis → Route Decision → Target Role(s)
     │              │                 │                │
     ▼              ▼                 ▼                ▼
┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│• Text   │  │• Keywords   │  │• Single     │  │• Execute    │
│• Context│  │• Embedding  │  │• Multi      │  │• Delegate   │
│• History│  │• LLM Class  │  │• Clarify    │  │• Queue      │
│         │  │• Similarity │  │• Reject     │  │• Notify     │
└─────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 6. 执行 Agent 架构

### 6.1 生命周期管理

```
CREATE → INIT → READY → EXECUTE → IDLE
   ↑       │       │        │       │
   │       ▼       ▼        ▼       │
   │    DESTROY ← ERROR ← PAUSE/BUSY│
   │         │                      │
   └─────────┴──────────────────────┘
```

### 6.2 执行 Agent 模型

```typescript
interface ExecutionAgent {
  instanceId: string
  roleId: string
  userId: string

  lifecycle: {
    state: AgentState
    createdAt: Date
    lastActivity: Date
    ttlSeconds: number
  }

  context: ExecutionContext

  runtime: {
    mcpClient: MCPClient
    skillEngine: SkillEngine
    toolExecutor: ToolExecutor
    llmClient: LLMClient
    knowledgeBase: KnowledgeBase
  }

  stateMachine: AgentStateMachine
}

interface TaskOrchestrator {
  decompose(input: string): TaskPlan
  executeStep(step: TaskStep): StepResult
  dependencies: DependencyGraph
  progress: {
    completed: number
    total: number
    failed: number
    retried: number
  }
}

interface TaskPlan {
  id: string
  goal: string
  steps: TaskStep[]
  parallelGroups: string[][]
  rollbackStrategy: RollbackAction
}

interface TaskStep {
  id: string
  type: 'llm' | 'tool' | 'skill' | 'mcp' | 'human'
  description: string
  input: unknown
  dependencies: string[]
  timeout: number
  retry: RetryPolicy
  result?: StepResult
  status: 'pending' | 'running' | 'completed' | 'failed'
}
```

### 6.3 复杂任务执行流程

```
Task Input → Decompose (LLM) → Schedule (DAG) → Execute Steps
                                              │
                    ┌─────────────────────────┘
                    ▼
           ┌─────────────┐
           │ Step Type   │
           ├─────────────┤
           │ • LLM Call  │──► LLM Gateway
           │ • Tool Call │──► Tool Executor
           │ • MCP Call  │──► MCP Client
           │ • Skill Run │──► Skill Engine
           │ • Human     │──► Handoff Queue
           └─────────────┘
                    │
                    ▼
           ┌─────────────┐
           │   Result    │──► Success → Continue
           │             │──► Fail → Retry → Rollback → Fallback
           │             │──► Partial → Merge
           └─────────────┘
```

---

## 7. 双向通信架构

### 7.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                   Bidirectional Communication                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Client Side                                                │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│   │  WebSocket  │  │    SSE      │  │  HTTP/2     │         │
│   │  Client     │  │   Client    │  │  Stream     │         │
│   └─────────────┘  └─────────────┘  └─────────────┘         │
│          │                │                │                  │
│          └────────────────┴────────────────┘                  │
│                           │                                   │
│                           ▼                                   │
│   Gateway Layer                                                │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│   │ Connection  │  │   Room      │  │   Push      │          │
│   │  Manager    │  │  Service    │  │  Router     │          │
│   └─────────────┘  └─────────────┘  └─────────────┘          │
│          │                │                │                   │
└──────────┼────────────────┼────────────────┼──────────────────┘
           │                │                │
           ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  User       │  │   Agent     │  │   System    │
    │  Inquiry    │  │   Push      │  │   Event     │
    │  (Pull)     │  │  (Push)     │  │  (Pub/Sub)  │
    └─────────────┘  └─────────────┘  └─────────────┘
```

### 7.2 主动推送架构

```typescript
interface PushSystem {
  triggers: {
    eventDriven: EventTrigger[] // 事件驱动
    ruleBased: RuleTrigger[] // 规则触发
    scheduled: ScheduledTrigger[] // 定时触发
    predictive: PredictiveTrigger[] // 预测触发（AI）
  }

  ruleEngine: {
    conditions: Condition[]
    actions: Action[]
    priority: number
    throttle: ThrottlePolicy
  }

  queue: {
    redis: RedisPubSub
    kafka: KafkaStreams
    priority: boolean
  }

  dispatcher: {
    channels: Channel[]
    userTargeting: UserTargeting
    deduplication: boolean
    rateLimit: RateLimitPolicy
  }
}

interface PushMessage {
  id: string
  type: 'alert' | 'notification' | 'report' | 'recommendation'

  content: {
    role: string
    title: string
    body: string
    data: unknown
    renderSchema: RenderSchema
  }

  targeting: {
    users: string[]
    filter?: UserFilter
    channels: string[]
  }

  scheduling: {
    priority: 'high' | 'normal' | 'low'
    deliverAt?: Date
    expireAt?: Date
    retry: RetryPolicy
  }

  tracking: {
    sent: boolean
    delivered: boolean
    read: boolean
    clicked: boolean
    converted: boolean
  }
}
```

### 7.3 消息优先级矩阵

```
┌──────────────┬──────────────┬──────────────┬────────────────┐
│    Type      │   Priority   │   Channel    │   Interrupt    │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ System Alert │     HIGH     │  All + SMS   │      Yes       │
│ Urgent Task  │     HIGH     │  WS + Push   │      Yes       │
│ Daily Report │   NORMAL     │  WS + Email  │      No        │
│ Suggestion   │    LOW       │  In-app      │      No        │
│ Marketing    │    LOW       │  Deferred    │      No        │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 8. 完整调用流程

### 8.1 用户问询流程

```
[1] 终端输入
    │
    ▼
    用户：「帮我查一下上个月销售额，并生成一个趋势图表」
    │
    ▼
[2] Gateway 层
    │
    ├── 身份认证 (JWT 验证)
    ├── 请求解析 (提取 UserID, SessionID)
    └── 路由到 Router Agent
    │
    ▼
[3] Router Agent - 意图识别
    │
    ├── 预处理：文本清洗、实体提取
    ├── 多路识别并行：
    │   ├── Rule Engine: 匹配关键词「销售额」「图表」
    │   ├── Embedding: 相似度计算
    │   └── LLM: Few-shot 分类
    └── 融合决策：Sales Analyst Role (置信度：0.92)
    │
    ▼
[4] Router Agent - 路由决策
    │
    ├── 检查用户会话历史
    ├── 查询 Sales Analyst Role 可用性
    ├── 获取或创建 Agent 实例
    └── 建立/恢复会话上下文
    │
    ▼
[5] 执行 Agent - Sales Analyst
    │
    ├── [5.1] 任务分解 (LLM Planning)
    │   └── 分解为：
    │       • Step 1: 查询销售数据库 (Tool)
    │       • Step 2: 计算月度汇总 (Skill)
    │       • Step 3: 生成趋势数据 (Calculation)
    │       • Step 4: 渲染图表 (Render)
    │
    ├── [5.2] 执行 Step 1 → 调用 Sales DB Tool
    ├── [5.3] 执行 Step 2 → 调用 Aggregation Skill
    ├── [5.4] 执行 Step 3 → LLM 生成趋势分析
    └── [5.5] 执行 Step 4 → 生成 Render Schema
    │
    ▼
[6] 响应组装
    │
    ├── 包装为统一响应格式
    ├── 记录会话历史
    └── 触发推送（如配置自动推送）
    │
    ▼
[7] 前端渲染
    │
    ├── 接收 Render Schema
    ├── Schema Parser 解析
    ├── Component Mapper 映射
    ├── Vue Renderer 渲染
    └── 用户交互：支持图表下钻、导出等
    │
    ▼
终端显示：[文字报告] + [交互式折线图] + [导出按钮]
```

### 8.2 主动推送流程

```
[1] 触发源
    │
    ├── Event: 库存系统告警（库存 < 阈值）
    ├── Rule: 每早 8 点推送销售日报
    └── Schedule: 定时任务触发
    │
    ▼
[2] 规则引擎处理
    │
    ├── 条件判断：告警级别 = HIGH
    ├── 目标筛选：关联采购经理、运营总监
    ├── 渠道选择：WebSocket > 短信
    └── 优先级：HIGH（可打断当前会话）
    │
    ▼
[3] 消息组装
    │
    ├── 选择 Role：Supply Chain Manager
    ├── 生成内容：标题、摘要、建议
    └── 生成 Render Schema（告警卡片）
    │
    ▼
[4] 分发执行
    │
    ├── 检查用户在线状态
    ├── WebSocket 推送至目标用户
    ├── 如果不在线 → 转 Push 通知
    └── 记录推送日志
    │
    ▼
[5] 前端处理
    │
    ├── 接收推送消息
    ├── 优先级判断：HIGH → 显示全局通知
    ├── 用户点击 → 打开详情会话
    └── 渲染告警卡片，支持快速操作
    │
    ▼
[6] 用户响应
    │
    ├── 选择「查看详情」→ 跳转报表
    ├── 选择「创建补货单」→ 触发工作流
    └── 选择「忽略」→ 记录用户行为
```

---

## 9. 可视化内容渲染

### 9.1 渲染架构

```
┌─────────────────────────────────────────────────────────────┐
│              Visualization Rendering Layer                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Schema Definition Layer                                    │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│   │   Base      │  │   Layout    │  │   Data      │         │
│   │   Schema    │◄─┤   Schema    │◄─┤   Schema    │         │
│   └─────────────┘  └─────────────┘  └─────────────┘         │
│          │                                                   │
│          ▼                                                   │
│   Component Registry                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│   │  Text    │ │  Card    │ │  Chart   │ │  Form    │       │
│   │  Render  │ │  Render  │ │  Render  │ │  Render  │       │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│          │                                                   │
│          ▼                                                   │
│   Rendering Engine (Vue 3)                                   │
│   Input: Schema → Parse → Transform → Render                │
│   Features: Lazy Loading, Virtual Scroll, Animation         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 渲染 Schema 定义

```typescript
interface RenderSchema {
  version: string
  type: RenderType

  layout?: {
    type: 'block' | 'inline' | 'grid' | 'flex'
    columns?: number
    gap?: number
    responsive?: ResponsiveConfig
  }

  style?: {
    theme?: string
    className?: string
    customCSS?: string
  }

  interaction?: {
    clickable: boolean
    expandable: boolean
    actions: ActionConfig[]
  }

  data?: DataSource | unknown
  children?: RenderSchema[]
}

enum RenderType {
  // 基础类型
  TEXT = 'text',
  MARKDOWN = 'markdown',
  HTML = 'html',

  // 卡片类型
  CARD = 'card',
  INFO_CARD = 'info_card',
  METRIC_CARD = 'metric_card',

  // 数据展示
  TABLE = 'table',
  LIST = 'list',
  TREE = 'tree',
  TIMELINE = 'timeline',

  // 图表类型
  CHART_LINE = 'chart_line',
  CHART_BAR = 'chart_bar',
  CHART_PIE = 'chart_pie',
  CHART_SCATTER = 'chart_scatter',
  CHART_CUSTOM = 'chart_custom',

  // 表单类型
  FORM = 'form',
  INPUT = 'input',
  SELECT = 'select',

  // 复合类型
  DASHBOARD = 'dashboard',
  REPORT = 'report',
  CONVERSATION = 'conversation',
  WORKFLOW = 'workflow'
}
```

### 9.3 Vue 3 渲染器架构

```
Schema Parser (@smart-link/core)
   │
   ▼
JSON Schema → Validation → Normalization → AST
   │
   ▼
Component Mapper
   │
   ▼
Schema.type → ComponentRegistry → Vue Component
   │
   ├─ 'card'    → SlCard.vue
   ├─ 'table'   → SlDataTable.vue
   ├─ 'chart_*' → SlChart.vue (dynamic)
   └─ 'form'    → SlDynamicForm.vue
   │
   ▼
Render Engine
   │
   ▼
<component
  :is="getComponent(schema.type)"
  v-bind="schema.props"
  v-on="schema.events"
>
  <render-schema
    v-for="child in schema.children"
    :key="child.id"
    :schema="child"
  />
</component>
```

---

## 10. UI 设计规范

### 10.1 设计理念

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

### 10.2 色彩系统

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

### 10.3 间距系统

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

### 10.4 字体系统

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

### 10.5 圆角系统

```scss
$border-radius-sm: 4px;
$border-radius-md: 6px;
$border-radius-lg: 8px;
$border-radius-xl: 12px;
$border-radius-2xl: 16px;
$border-radius-full: 9999px;
```

---

## 11. UX 设计方案

### 11.1 菜单结构

```
🏠 SmartLink Platform
├── 🏠 首页
│
├── 💬 探索中心
│   └── 📝 对话
│
├── 📱 应用管理
│   ├── 📋 应用列表
│   └── 🎨 应用设计
│
├── 🧩 资源管理
│   ├── 🎨 组件管理
│   └── 📊 数据模型
│
├── 🔧 工具管理
│   ├── 🔌 MCP 管理
│   ├── ⚡ Skills 管理
│   └── 🤖 模型管理
│
└── ⚙️ 系统设置
    ├── 🎨 外观设置
    └── 🤖 模型提供商
```

### 11.2 侧边栏设计规范

```
┌─────────────────────────────────────────┐
│  🏠 SmartLink                           │
├─────────────────────────────────────────┤
│                                          │
│  💬 探索中心                    [新建+] │
│  └─ 📝 对话                             │
│                                          │
│  📱 应用管理                    [新建+] │
│  ├─ 📋 应用列表                         │
│  └─ 🎨 应用设计                         │
│                                          │
│  🧩 资源管理                             │
│  ├─ 🎨 组件管理                         │
│  └─ 📊 数据模型                         │
│                                          │
│  🔧 工具管理                             │
│  ├─ 🔌 MCP 管理                         │
│  ├─ ⚡ Skills 管理                      │
│  └─ 🤖 模型管理                         │
│                                          │
├─────────────────────────────────────────┤
│  ⚙️ 系统设置           [收起侧边栏 ↙]  │
│  ├─ 🎨 外观设置                         │
│  └─ 🤖 模型提供商                       │
└─────────────────────────────────────────┘
```

**交互特性**：

- 支持展开/收起（宽度：240px ↔ 64px）
- 收起时仅显示图标，悬停显示 Tooltip
- 当前路由高亮显示
- 分组支持折叠/展开

---

## 12. 能力层架构

### 12.1 MCP Hub

```typescript
interface MCPHub {
  // MCP 服务器管理
  servers: {
    register: (config: MCPServerConfig) => Promise<string>
    unregister: (serverId: string) => Promise<void>
    list: () => Promise<MCPServer[]>
    getHealth: (serverId: string) => Promise<HealthStatus>
  }

  // 工具调用
  tools: {
    discover: (serverId: string) => Promise<Tool[]>
    call: (toolId: string, params: unknown) => Promise<ToolResult>
    cancel: (callId: string) => Promise<void>
  }

  // 资源访问
  resources: {
    list: (serverId: string) => Promise<Resource[]>
    read: (resourceId: string) => Promise<ResourceContent>
    subscribe: (resourceId: string) => AsyncIterable<ResourceUpdate>
  }
}
```

### 12.2 Skill Engine

```typescript
interface SkillEngine {
  // Skill 管理
  skills: {
    register: (definition: SkillDefinition) => Promise<string>
    unregister: (skillId: string) => Promise<void>
    execute: (skillId: string, input: unknown) => Promise<SkillResult>
  }

  // 工作流编排
  workflow: {
    create: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => Promise<string>
    execute: (workflowId: string, input: unknown) => Promise<WorkflowResult>
    pause: (executionId: string) => Promise<void>
    resume: (executionId: string) => Promise<void>
  }
}
```

### 12.3 Tool Registry

```typescript
interface ToolRegistry {
  // 工具发现
  discovery: {
    register: (tool: ToolDefinition) => Promise<void>
    unregister: (toolId: string) => Promise<void>
    search: (query: string) => Promise<Tool[]>
  }

  // 工具执行
  execution: {
    execute: (toolId: string, params: unknown) => Promise<ToolResult>
    validate: (toolId: string, params: unknown) => ValidationResult
    sandbox: (toolId: string, params: unknown) => Promise<SandboxResult>
  }
}
```

---

## 13. API 接口设计

> **注意**: 以下API接口基于前端 `app/src/services/` 目录下的实现代码定义，后端开发应遵循此规范。

### 13.1 通用规范

#### 基础 URL

```
生产环境: https://api.smartlink.com/api/v1
开发环境: http://localhost:8000/api/v1
```

#### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
X-API-Key: <api_key>
X-Tenant-Id: <tenant_id>
```

#### 响应格式

```typescript
// 成功响应
interface ApiResponse<T> {
  code: number // 0 或 200 表示成功
  message: string
  data: T
  timestamp: number
}

// 分页响应
interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

// 错误响应
interface ApiError {
  code: number
  message: string
  detail?: string
}
```

#### 状态码约定

| HTTP 状态码 | 业务码 | 含义              |
| ----------- | ------ | ----------------- |
| 200         | 0/200  | 成功              |
| 400         | 400001 | 请求参数错误      |
| 401         | 401001 | 未授权/Token 过期 |
| 403         | 403001 | 无权限            |
| 404         | 404001 | 资源不存在        |
| 429         | 429001 | 请求频率超限      |
| 500         | 500001 | 服务器内部错误    |

### 13.2 Agent API (智能体管理)

#### 数据模型

```typescript
// 智能体状态
enum AgentStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 激活可用
  PAUSED = 'paused', // 暂停
  DEPRECATED = 'deprecated' // 废弃
}

// 智能体类型
enum AgentType {
  SYSTEM = 'system', // 系统预置
  CUSTOM = 'custom', // 用户自定义
  TEMPLATE = 'template' // 模板（可复制）
}

// 核心智能体模型
interface Agent {
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
  pageSchema?: PageSchema

  // 元数据
  createdAt: number
  updatedAt: number
  tags: string[]
  version: string
  creator?: string
  category?: string
}
```

#### API 端点

| 方法   | 路径                        | 描述                   |
| ------ | --------------------------- | ---------------------- |
| GET    | `/agents/`                  | 获取智能体列表（分页） |
| POST   | `/agents/`                  | 创建智能体             |
| GET    | `/agents/{id}`              | 获取智能体详情         |
| PUT    | `/agents/{id}`              | 更新智能体             |
| DELETE | `/agents/{id}`              | 删除智能体             |
| POST   | `/agents/{id}/activate`     | 激活智能体             |
| POST   | `/agents/{id}/pause`        | 暂停智能体             |
| PUT    | `/agents/{id}/capabilities` | 更新能力配置           |
| PUT    | `/agents/{id}/knowledge`    | 更新知识库配置         |

#### 请求/响应示例

**获取智能体列表**

```http
GET /api/v1/agents/?page=1&page_size=20&status=active&type=custom&keyword=客服

Response:
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "agent_001",
        "name": "智能客服",
        "code": "smart_customer_service",
        "status": "active",
        "type": "custom",
        ...
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  },
  "timestamp": 1708234567890
}
```

**创建智能体**

```http
POST /api/v1/agents/
Content-Type: application/json

{
  "name": "智能客服",
  "code": "smart_customer_service",
  "description": "智能客服助手",
  "avatar": "https://example.com/avatar.png",
  "persona": "你是一个专业的客服助手...",
  "welcome_message": "您好，有什么可以帮您？",
  "tags": ["客服", "智能"],
  "category": "service"
}
```

### 13.3 Application API (应用管理)

#### 数据模型

```typescript
enum AppStatus {
  DRAFT = 'draft', // 草稿
  DESIGNING = 'designing', // 设计中
  PUBLISHED = 'published', // 已发布
  ARCHIVED = 'archived' // 已归档
}

enum AppType {
  WORKFLOW = 'workflow', // 工作流应用
  CHART = 'chart', // 图表应用
  FORM = 'form', // 表单应用
  DASHBOARD = 'dashboard', // 仪表盘
  CUSTOM = 'custom' // 自定义应用
}

interface Application {
  id: string
  name: string
  description: string
  icon: string
  type: AppType
  status: AppStatus
  version: string
  tags?: string[]
  schema?: PageSchema // 应用 Schema
  createdAt: number
  updatedAt: number
  publishedAt?: number
  isEnabled?: boolean
}
```

#### API 端点

| 方法   | 路径                         | 描述         |
| ------ | ---------------------------- | ------------ |
| GET    | `/applications/`             | 获取应用列表 |
| POST   | `/applications/`             | 创建应用     |
| GET    | `/applications/{id}`         | 获取应用详情 |
| PUT    | `/applications/{id}`         | 更新应用     |
| DELETE | `/applications/{id}`         | 删除应用     |
| POST   | `/applications/{id}/publish` | 发布应用     |
| POST   | `/applications/{id}/run`     | 运行应用     |

### 13.4 Conversation API (对话管理)

#### 数据模型

```typescript
interface ChatConversation {
  id: string
  title: string
  appId?: string
  userId?: string
  status: 'active' | 'archived'
  messageCount: number
  lastMessageAt?: number
  messages?: ChatMessage[]
  createdAt: number
  updatedAt: number
}

interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  components?: ChatComponent[] // 动态组件
  attachments?: MessageAttachment[] // 附件
  tokens?: { input: number; output: number }
}

interface ChatComponent {
  id: string
  type: 'stats-card' | 'form' | 'chart' | 'table' | 'list' | 'code' | 'image' | 'confirm'
  props: Record<string, any>
  events?: Record<string, string>
}
```

#### API 端点

| 方法   | 路径                           | 描述         |
| ------ | ------------------------------ | ------------ |
| GET    | `/conversations/`              | 获取对话列表 |
| POST   | `/conversations/`              | 创建对话     |
| GET    | `/conversations/{id}`          | 获取对话详情 |
| PUT    | `/conversations/{id}`          | 更新对话     |
| DELETE | `/conversations/{id}`          | 删除对话     |
| GET    | `/conversations/{id}/messages` | 获取消息历史 |
| POST   | `/conversations/{id}/archive`  | 归档对话     |
| POST   | `/conversations/{id}/restore`  | 恢复对话     |

### 13.5 Resource API (资源管理)

#### Skills API

| 方法   | 路径                          | 描述         |
| ------ | ----------------------------- | ------------ |
| GET    | `/resources/skills`           | 获取技能列表 |
| POST   | `/resources/skills`           | 创建技能     |
| GET    | `/resources/skills/{id}`      | 获取技能详情 |
| PUT    | `/resources/skills/{id}`      | 更新技能     |
| DELETE | `/resources/skills/{id}`      | 删除技能     |
| POST   | `/resources/skills/{id}/test` | 测试技能     |

#### MCP Server API

| 方法   | 路径                          | 描述                |
| ------ | ----------------------------- | ------------------- |
| GET    | `/resources/mcp`              | 获取 MCP 服务器列表 |
| POST   | `/resources/mcp`              | 创建 MCP 服务器     |
| GET    | `/resources/mcp/{id}`         | 获取详情            |
| PUT    | `/resources/mcp/{id}`         | 更新配置            |
| DELETE | `/resources/mcp/{id}`         | 删除服务器          |
| POST   | `/resources/mcp/{id}/test`    | 测试连接            |
| POST   | `/resources/mcp/{id}/refresh` | 刷新能力列表        |

#### Components API

| 方法 | 路径                    | 描述         |
| ---- | ----------------------- | ------------ |
| GET  | `/resources/components` | 获取组件列表 |

### 13.6 WebSocket API

#### 连接端点

```
ws://localhost:8000/ws/chat/{clientId}
```

#### 消息格式

```typescript
interface WSMessage<T = unknown> {
  type: 'chat' | 'stream' | 'ping' | 'pong' | 'tool_call' | 'status' | 'error'
  data: T
  timestamp?: number
}

// 聊天消息
interface ChatMessageData {
  message: string
  conversation_id?: string
  app_id?: string
  attachments?: File[]
}

// 流式响应
interface StreamResponseData {
  delta: string
  done: boolean
  conversation_id?: string
  message_id?: string
  component?: ChatComponent
}
```

#### 心跳机制

- 客户端每 30 秒发送 `ping` 消息
- 服务端响应 `pong` 消息
- 超时未响应则触发重连

#### 重连策略

- 最大重连次数: 5
- 重连间隔: 3 秒（指数退避）

### 13.7 旧版 API (向后兼容)

```
基础 URL: /api/v1

Role 管理 (已废弃，请使用 Agent API)
─────────────────────────────────────────────────────────────────────────
GET    /roles                   获取角色列表
POST   /roles                   创建角色
GET    /roles/:id               获取角色详情
PUT    /roles/:id               更新角色
DELETE /roles/:id               删除角色
POST   /roles/:id/activate      激活角色
POST   /roles/:id/deactivate    停用角色

执行管理
─────────────────────────────────────────────────────────────────────────
POST   /execute                 执行请求
GET    /execute/:sessionId      获取执行结果
GET    /execute/:sessionId/stream 流式输出
POST   /execute/:sessionId/cancel 取消执行
GET    /execute/history         执行历史

推送管理
─────────────────────────────────────────────────────────────────────────
GET    /push/rules              获取推送规则列表
POST   /push/rules              创建推送规则
PUT    /push/rules/:id          更新推送规则
DELETE /push/rules/:id          删除推送规则
POST   /push/test               测试推送
```

---

## 14. 集成模式

### 14.1 MCP 集成

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
│  │  • prompts/*         - 提示词管理                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│    │                                                                    │
│    │ stdio / HTTP / SSE                                                │
│    ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     MCP Server                                  │   │
│  │  • 文件系统                                                      │   │
│  │  • 数据库                                                        │   │
│  │  • API 调用                                                      │   │
│  │  • 自定义工具                                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 14.2 LLM 集成

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LLM 集成架构                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        LLM Adapter Layer                        │   │
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

---

## 15. 工作流引擎

### 15.1 工作流节点类型

```typescript
interface WorkflowNode {
  id: string
  type: NodeType
  name: string
  description?: string
  position: { x: number; y: number }

  inputs: NodePort[]
  outputs: NodePort[]
  config: Record<string, any>
  condition?: ExpressionConfig
  retry?: RetryConfig
  timeout?: number
}

type NodeType =
  | 'start' // 开始节点
  | 'end' // 结束节点
  | 'llm' // LLM 调用节点
  | 'tool' // 工具调用节点
  | 'condition' // 条件分支节点
  | 'loop' // 循环节点
  | 'parallel' // 并行执行节点
  | 'transform' // 数据转换节点
  | 'http' // HTTP 请求节点
  | 'code' // 代码执行节点
  | 'variable' // 变量操作节点
  | 'human' // 人工审批节点
  | 'subflow' // 子流程节点
  | 'mcp' // MCP 调用节点
  | 'skill' // Skill 执行节点
```

### 15.2 执行上下文

```typescript
interface ExecutionContext {
  executionId: string
  workflowId: string
  workflowVersion: string

  tenantId: string
  userId: string

  input: Record<string, any>
  variables: Map<string, any>
  nodeStates: Map<string, NodeExecutionState>
  history: ExecutionHistoryEntry[]

  status: ExecutionStatus
  startedAt: number
  completedAt?: number
  error?: ErrorInfo
}
```

---

## 16. 错误处理与容错

### 16.1 错误分类与策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Error Handling Architecture                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  错误分类：                                                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Transient Errors (瞬态错误)                                     │   │
│  │  • 网络超时/中断          • 服务暂时不可用       • 限流           │   │
│  │  策略：重试 (Retry with Backoff)                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Permanent Errors (永久错误)                                     │   │
│  │  • 验证失败              • 权限不足             • 资源不存在     │   │
│  │  策略：快速失败 (Fail Fast)                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Business Errors (业务错误)                                      │   │
│  │  • 业务规则校验失败       • 数据不一致           • 流程状态异常  │   │
│  │  策略：补偿/回滚 (Compensation)                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  System Errors (系统错误)                                        │   │
│  │  • 内存溢出              • 磁盘满               • 服务崩溃       │   │
│  │  策略：降级/熔断 (Circuit Breaker)                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.2 降级策略

```
Level 1: Graceful Degradation
├── LLM 超时 ──► 使用缓存模板响应
├── Tool 失败 ──► 返回部分结果 + 说明
└── MCP 断开 ──► 切换备用服务或直接 LLM

Level 2: Service Degradation
├── Router 过载 ──► 简化路由策略（Rule-based only）
├── Agent 满载 ──► 排队等待 + 返回等待提示
└── 存储故障 ──► 内存缓存模式（只读）

Level 3: Emergency Fallback
├── 全部故障 ──► 静态 FAQ + 人工客服入口
└── 推送故障 ──► 邮件/短信降级
```

---

## 17. 缓存策略

### 17.1 多层缓存架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Multi-Layer Cache Architecture                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Layer 1: Browser Cache (浏览器缓存)                                    │
│   • 静态资源 (JS/CSS/Images)    • Service Worker 缓存                   │
│   • LocalStorage / IndexedDB    TTL: 长期 (版本化)                       │
│                                                                          │
│   Layer 2: CDN Cache (CDN 缓存)                                          │
│   • 静态资源分发               • API 响应缓存 (GET 请求)                 │
│   • 边缘节点缓存               TTL: 分钟 ~ 小时                          │
│                                                                          │
│   Layer 3: Application Cache (应用缓存)                                  │
│   • 内存缓存 (进程内)           • 分布式缓存 (Redis)                     │
│   • 会话数据                   TTL: 秒 ~ 分钟                            │
│                                                                          │
│   Layer 4: Database Cache (数据库缓存)                                   │
│   • 查询缓存                   • 物化视图                                 │
│   • 只读副本                   TTL: 分钟 ~ 小时                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 17.2 缓存策略类型

```typescript
type CacheStrategy =
  | 'cache-first' // 优先缓存
  | 'network-first' // 优先网络
  | 'stale-while-revalidate' // 后台更新
  | 'cache-only' // 仅缓存
  | 'network-only' // 仅网络
```

---

## 18. 监控与可观测性

### 18.1 监控架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Observability Architecture                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Instrumentation Layer                                                   │
│  • OpenTelemetry SDK          • Auto-instrumentation (HTTP, DB, LLM)    │
│                                                                          │
│  Collection Layer                                                      │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                           │
│  │  Metrics  │  │   Logs    │  │  Traces   │                           │
│  └───────────┘  └───────────┘  └───────────┘                           │
│                                                                          │
│  Storage Layer                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                           │
│  │Prometheus │  │Elasticsearch│ │  Tempo/   │                           │
│  │           │  │           │  │  Jaeger   │                           │
│  └───────────┘  └───────────┘  └───────────┘                           │
│                                                                          │
│  Visualization Layer                                                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                           │
│  │ Grafana   │  │  Kibana   │  │  Jaeger   │                           │
│  │  Dashboards│ │  Queries  │  │   UI      │                           │
│  └───────────┘  └───────────┘  └───────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 18.2 核心指标

| 指标类别     | 指标名称                              | 说明             |
| ------------ | ------------------------------------- | ---------------- |
| **HTTP**     | `http_requests_total`                 | HTTP 请求总数    |
|              | `http_request_duration_seconds`       | HTTP 请求延迟    |
| **LLM**      | `llm_calls_total`                     | LLM 调用总数     |
|              | `llm_call_duration_seconds`           | LLM 调用延迟     |
|              | `llm_tokens_total`                    | Token 使用总量   |
| **Workflow** | `workflow_executions_total`           | 工作流执行总数   |
|              | `workflow_execution_duration_seconds` | 工作流执行延迟   |
| **MCP**      | `mcp_tool_calls_total`                | MCP 工具调用总数 |
|              | `mcp_tool_call_duration_seconds`      | MCP 工具调用延迟 |

---

## 19. 部署架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              部署架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Client Layer                                                            │
│  • Web (Vue/React)            • Mobile (iOS/Android)                    │
│  • API Client                                                              │
│                                                                          │
│  Gateway Layer                                                           │
│  • 负载均衡                   • 限流熔断                                  │
│  • 身份认证                   • 请求路由                                  │
│  • SSL Termination                                                         │
│                                                                          │
│  Application Layer                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   API Pod    │  │  Agent Pod   │  │  WebSocket   │                  │
│  │  (REST API)   │  │  (Executor)  │  │   Pod        │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
│  Data Layer                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  PostgreSQL  │  │    Redis     │  │  Object      │                  │
│  │  (主数据)     │  │  (缓存/会话)  │  │  Storage     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 20. 安全与合规

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              安全架构                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  认证与授权                                                              │
│  • JWT Token 认证               • OAuth 2.0 / SSO                       │
│  • API Key 管理                 • 多租户隔离                              │
│  • 细粒度权限控制                                                           │
│                                                                          │
│  数据安全                                                                │
│  • 传输加密 (TLS 1.3)           • 存储加密 (AES-256)                    │
│  • 敏感数据脱敏                 • PII 检测与处理                         │
│                                                                          │
│  网络安全                                                                │
│  • DDoS 防护                    • WAF 防火墙                             │
│  • IP 白名单                    • 请求限流                                │
│                                                                          │
│  合规性                                                                  │
│  • GDPR 合规                    • SOC 2 认证                             │
│  • 日志审计                     • 数据保留策略                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 21. 关键技术决策

### 21.1 决策矩阵

| 决策点          | 选择              | 理由                                 | 替代方案                     |
| --------------- | ----------------- | ------------------------------------ | ---------------------------- |
| **通信协议**    | WebSocket + SSE   | WebSocket 支持双向实时，SSE 作为降级 | HTTP/2 Stream（复杂度高）    |
| **会话存储**    | Redis + 持久化    | 高性能读写 + 数据可靠性              | 纯内存（丢失风险）           |
| **Agent 隔离**  | 进程级容器        | 资源隔离好，安全性高                 | 线程级（轻量但隔离差）       |
| **任务编排**    | DAG + 状态机      | 灵活、可扩展、支持回滚               | 简单队列（无法处理复杂依赖） |
| **Schema 格式** | JSON Schema       | 标准化、工具生态丰富                 | Protobuf（二进制，调试难）   |
| **LLM 路由**    | 网关统一调度      | 支持多模型、成本追踪、降级           | 直连模型（无管控）           |
| **推送策略**    | 优先级队列 + 抑制 | 避免消息轰炸，尊重用户体验           | 立即推送（可能打扰）         |

### 21.2 水平扩展架构

```
Gateway Layer
┌─────────┐ ┌─────────┐ ┌─────────┐         ┌─────────┐
│ GW #1   │ │ GW #2   │ │ GW #3   │ ─────► │  LB     │
│ WebSocket│ │ WebSocket│ │ WebSocket│        │ (Kong)  │
└─────────┘ └─────────┘ └─────────┘         └─────────┘
     │           │           │
     └───────────┴───────────┘
               │
Router Agent   │         ┌─────────┐ ┌─────────┐
┌─────────┐    │         │Router #1│ │Router #2│
│ HAProxy │◄───┘         │(Worker) │ │(Worker) │
│ (Queue) │              └─────────┘ └─────────┘
└────┬────┘
     │
Agent Pool   ┌─────────┐ ┌─────────┐ ┌─────────┐
┌─────────┐  │Agent Pod│ │Agent Pod│ │Agent Pod│
│K8s HPA  │◄─│  #1     │ │  #2     │ │  #N     │
│(Auto    │  │(10 inst)│ │(10 inst)│ │(scale)  │
│ scale)  │  └─────────┘ └─────────┘ └─────────┘
└─────────┘
```

---

## 22. 风险与解决方案

### 22.1 风险清单

| 风险               | 影响       | 概率 | 缓解方案                           |
| ------------------ | ---------- | ---- | ---------------------------------- |
| **LLM 响应延迟**   | 用户体验差 | 高   | 流式输出 + 骨架屏 + 超时降级       |
| **MCP 服务故障**   | 功能不可用 | 中   | 熔断机制 + 降级策略 + 健康检查     |
| **Agent 状态爆炸** | 内存溢出   | 中   | TTL 自动回收 + 状态归档 + 限流     |
| **消息乱序/丢失**  | 数据不一致 | 低   | 消息确认 + 重传机制 + 幂等设计     |
| **角色权限越界**   | 安全问题   | 中   | 前置鉴权 + 行为审计 + 最小权限     |
| **路由误判**       | 错误响应   | 高   | 多模型投票 + 置信度阈值 + 澄清机制 |
| **推送轰炸**       | 用户流失   | 中   | 频率限制 + 优先级 + 免打扰         |

---

## 23. 实施路线图

### 23.1 Phase 划分

```
Phase 1 - 核心框架（2 周）
├── Role 模型设计与实现
├── Router Agent 基础路由
├── Execution Agent 生命周期管理
└── 基础 MCP 集成

Phase 2 - 能力扩展（2 周）
├── MCP Hub 完整实现
├── Skill Engine 开发
├── Tool Registry 集成
└── LLM Gateway 多模型支持

Phase 3 - 双向通信（1 周）
├── WebSocket 网关
├── 推送系统
├── 优先级管理
└── 消息队列集成

Phase 4 - 可视化（1 周）
├── Schema 定义规范
├── 前端渲染器（Vue 3）
├── 组件库集成
└── 图表渲染

Phase 5 - 生产加固（1 周）
├── 监控告警
├── 降级策略实现
├── 性能优化
└── 压力测试
```

### 23.2 关键里程碑

| 里程碑 | 时间   | 交付物                       |
| ------ | ------ | ---------------------------- |
| M1     | Week 2 | Role 模型 + Router Agent MVP |
| M2     | Week 4 | 完整 MCP/Skill/Tool 集成     |
| M3     | Week 5 | 双向通信完整可用             |
| M4     | Week 6 | 可视化渲染完成               |
| M5     | Week 7 | 生产环境 Ready               |

---

## 24. 前端模块架构（基于当前实现）

> 本节基于 `app/src/` 目录下的代码实现，描述前端的实际架构。

### 24.1 Monorepo 结构

```
smart-link/
├── packages/                    # 可发布的 npm 包
│   ├── core/                    # @smart-link/core - 渲染引擎
│   ├── ui/                      # @smart-link/ui - UI 组件库
│   ├── shared/                  # @smart-link/shared - 共享类型/工具
│   ├── hooks/                   # @smart-link/hooks - Vue 组合式函数
│   └── theme/                   # @smart-link/theme - 主题样式
│
├── app/                         # 主应用
│   └── src/
│       ├── services/            # API 服务层
│       │   ├── agent.ts         # 智能体 API
│       │   ├── ai.ts            # AI 服务 (OpenAI/Claude/Ollama)
│       │   ├── application.ts   # 应用 API
│       │   ├── conversation.ts  # 对话 API
│       │   ├── resource.ts      # 资源管理 API
│       │   └── websocket.ts     # WebSocket 服务
│       ├── store/               # Pinia 状态管理
│       │   └── modules/
│       │       ├── agent.ts     # 智能体状态
│       │       ├── application.ts # 应用状态
│       │       ├── ai.ts        # AI 服务状态
│       │       ├── mcp.ts       # MCP 状态
│       │       ├── skills.ts    # Skills 状态
│       │       └── ...          # 其他模块
│       ├── components/          # 业务组件
│       ├── views/               # 页面视图
│       │   ├── agent/           # 智能体管理
│       │   ├── resource/        # 资源管理
│       │   ├── explore/         # 探索中心
│       │   └── settings/        # 系统设置
│       ├── router/              # 路由配置
│       ├── utils/               # 工具函数
│       │   └── http.ts          # Axios HTTP 客户端
│       └── types/               # 类型定义
│
├── play/                        # 组件调试环境
├── docs/                        # VitePress 文档站点
└── internal/build/              # 共享构建配置
```

### 24.2 技术栈

| 层级        | 技术                                |
| ----------- | ----------------------------------- |
| 前端框架    | Vue 3.4+ (Composition API)          |
| 类型系统    | TypeScript 5.0+                     |
| 状态管理    | Pinia + pinia-plugin-persistedstate |
| 路由        | Vue Router 4.x                      |
| HTTP 客户端 | Axios                               |
| 实时通信    | WebSocket                           |
| 构建工具    | Vite 5.0 + Rollup                   |
| 包管理      | pnpm monorepo + Turborepo           |
| 样式        | SCSS                                |
| 国际化      | vue-i18n                            |

### 24.3 核心模块职责

#### @smart-link/core - 渲染引擎

```
packages/core/src/
├── types/           # 核心类型定义 (PageSchema, ComponentNode 等)
├── evaluator/       # 表达式求值器 (动态属性绑定)
├── state/           # 状态管理器 (运行时状态)
├── registry/        # 组件注册表 (组件元数据管理)
├── events/          # 事件处理器 (内置动作 + 自定义事件)
├── directives/      # 指令处理器 (v-if, v-for, v-model)
└── renderer/        # 核心渲染器 (Schema → VNode)
```

### 24.4 状态管理架构

```typescript
// Store 模块划分 (app/src/store/modules/)
├── agent.ts           // 智能体状态
├── application.ts     // 应用状态
├── ai.ts              // AI 服务状态
├── mcp.ts             // MCP 服务器状态
├── skills.ts          // Skills 状态
├── model.ts           // 模型状态
├── orchestrator.ts    // 编排器状态
├── datamodel.ts       // 数据模型状态
├── explore.ts         // 探索中心状态
├── settings.ts        // 设置状态
├── view.ts            // 视图状态
└── components.ts      // 组件状态
```

### 24.5 HTTP 客户端配置

```typescript
// app/src/utils/http.ts
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器 - 自动添加认证头
config.headers['X-API-Key'] = apiKey // API Key 认证
config.headers['Authorization'] = `Bearer ${token}` // JWT Token
config.headers['X-Tenant-Id'] = tenantId // 租户隔离
```

---

## 25. 后端开发建议

### 25.1 推荐技术栈

| 组件       | 推荐技术                                                 |
| ---------- | -------------------------------------------------------- |
| Web 框架   | FastAPI (Python) / NestJS (Node.js) / Spring Boot (Java) |
| 数据库     | PostgreSQL                                               |
| 缓存       | Redis                                                    |
| 向量数据库 | Milvus / Pinecone                                        |
| 消息队列   | RabbitMQ / Kafka                                         |
| 容器化     | Docker + Kubernetes                                      |

### 25.2 API 开发优先级

1. **P0 - 核心功能**
   - Agent CRUD + 激活/暂停
   - Conversation 消息收发
   - WebSocket 流式响应

2. **P1 - 资源管理**
   - Skills 管理
   - MCP 服务器管理
   - Components 列表

3. **P2 - 高级功能**
   - 知识库 RAG
   - 模型管理
   - 数据模型

### 25.3 数据库表设计建议

```sql
-- 智能体表
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  identity JSONB NOT NULL,
  capabilities JSONB,
  knowledge JSONB,
  page_schema JSONB,
  tags TEXT[],
  version VARCHAR(50),
  creator VARCHAR(255),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 对话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  app_id UUID,
  user_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  components JSONB,
  attachments JSONB,
  tokens JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MCP 服务器表
CREATE TABLE mcp_servers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unique_id VARCHAR(100) UNIQUE NOT NULL,
  version VARCHAR(50),
  description TEXT,
  transport VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'disconnected',
  config JSONB NOT NULL,
  capabilities JSONB,
  tools JSONB,
  resources JSONB,
  prompts JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills 表
CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  version VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'disabled',
  description TEXT,
  tags TEXT[],
  risk_level VARCHAR(50) DEFAULT 'low',
  requires_approval BOOLEAN DEFAULT FALSE,
  input_schema JSONB,
  output_schema JSONB,
  config JSONB,
  dependencies JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 25.4 前端期望的数据格式示例

```typescript
// 智能体列表响应示例
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "agent_001",
        "name": "智能客服",
        "code": "smart_customer_service",
        "type": "custom",
        "status": "active",
        "avatar": "https://example.com/avatar.png",
        "description": "专业的智能客服助手",
        "persona": "你是一个专业的客服助手...",
        "welcome_message": "您好，有什么可以帮您？",
        "tags": ["客服", "智能"],
        "category": "service",
        "version": "1.0.0",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  },
  "timestamp": 1708234567890
}

// WebSocket 流式响应消息
{
  "type": "stream",
  "data": {
    "delta": "您好",
    "done": false,
    "conversation_id": "conv_001",
    "message_id": "msg_001"
  },
  "timestamp": 1708234567890
}

// 完成消息
{
  "type": "stream",
  "data": {
    "delta": "",
    "done": true,
    "conversation_id": "conv_001",
    "message_id": "msg_001",
    "component": {
      "id": "comp_001",
      "type": "table",
      "props": {
        "columns": [...],
        "data": [...]
      }
    }
  },
  "timestamp": 1708234567890
}

// 错误响应格式
{
  "code": 400001,
  "message": "请求参数错误",
  "detail": "name 字段不能为空",
  "timestamp": 1708234567890
}
```

---

## 总结

### 核心亮点

1. **Router Agent 多级路由决策**：规则 + 嵌入 +LLM 融合，置信度驱动
2. **Role 完整能力封装**：身份、能力、知识、权限、交互一体化
3. **双向通信统一抽象**：WebSocket 为主、SSE 降级、优先级管理
4. **Schema 驱动渲染**：继承@smart-link/core，支持丰富可视化类型
5. **企业级可靠性**：多层降级、熔断、限流、监控

### 架构优势

- 前后端分离，前端专注渲染与交互
- Schema 驱动，LLM 生成页面结构
- MCP 生态支持，工具能力可扩展
- 工作流编排，复杂业务可配置
- 多租户隔离，企业级安全

### 下一步行动

1. **评审架构设计**：确认技术选型和模块划分
2. **细化数据模型**：完善 TypeScript 类型定义
3. **搭建项目骨架**：创建 monorepo 结构和基础包
4. **实现 MVP**：Phase 1 核心框架

---

_文档版本：2.1_  
_更新日期：2026-03-18_  
_设计状态：架构设计完成，已根据前端实现更新_

_本文档整合自：_

- _ROLE-BASED-AGENT-ARCHITECTURE.md (1,018 行)_
- _ARCHITECTURE.md (1,973 行)_
- _前端实现代码 (app/src/services/, app/src/types/, app/src/store/)_

_更新记录：_

- _v2.1 (2026-03-18): 更新API接口设计，添加前端模块架构、后端开发建议章节_
- _v2.0 (2026-03-12): 整合 Role 模型设计，完善架构文档_
