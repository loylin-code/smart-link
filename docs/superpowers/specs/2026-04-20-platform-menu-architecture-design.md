# SmartLink 平台菜单架构优化设计

**创建时间**: 2026-04-20
**状态**: Draft
**作者**: Sisyphus (AI Assistant)

---

## 1. 概述

### 1.1 背景

SmartLink 当前平台菜单结构需要优化，以更好地组织平台管理功能，提升用户体验和系统可维护性。

### 1.2 目标

重构平台菜单结构，新增关键管理模块，建立清晰的功能分区。

### 1.3 新菜单结构

| 序号 | 菜单项 | 子菜单 | 变更说明 |
|-----|-------|-------|---------|
| 1 | 平台概览 | - | 新增，Dashboard 入口 |
| 2 | 探索中心 | - | 保持不变 |
| 3 | 数字员工 | 数字员工管理 | 保持不变 |
| 4 | 工具管理 | Skills管理, MCP管理 | 模型管理移出 |
| 5 | 资源管理 | 组件管理, 数据模型, API管理 | 新增API管理 |
| 6 | 语义管理 | 语义词库, 配置管理 | 新增，Agent语义理解配置 |
| 7 | 日志管理 | Agent运行日志, 系统操作日志 | 新增，全量日志管理 |
| 8 | 定时任务 | - | 新增，Agent定时执行任务管理 |
| 9 | 系统配置 | 模型提供商, 模型管理 | 外观设置移除，模型管理整合 |

---

## 2. 平台概览（Dashboard）

### 2.1 页面位置

- **路由**: `/app/overview`
- **默认入口**: 用户登录后默认进入此页面（替代原 `/app/explore`）

### 2.2 页面布局

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 平台概览                                              [刷新] [时间范围筛选] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ 数字员工 │ │ Skills  │ │ MCP     │ │ 组件    │ │ 模型    │               │
│ │   12    │ │   8     │ │   5     │ │   42    │ │   15    │               │
│ │ +2 今日 │ │ 98.5%   │ │ 4 连接  │ │         │ │ 3 可用  │               │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                             │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐           │
│ │ 会话统计                    │ │ Token 消耗                  │           │
│ │ 今日: 128 活跃会话          │ │ [折线图 - 近7天消耗趋势]     │           │
│ │ 本周: 542 总会话            │ │ 今日: 45,230 tokens          │           │
│ │ 本月: 1,890                 │ │ 本月: 892,450 tokens         │           │
│ │                             │ │ 成本: $127.50                │           │
│ └─────────────────────────────┘ └─────────────────────────────┘           │
│                                                                             │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐           │
│ │ 定时任务                    │ │ 系统状态                    │           │
│ │ 运行中: 3  待执行: 5        │ │ LLM Provider: 3/4 正常      │           │
│ │ 成功: 89   失败: 2          │ │ MCP Servers: 4/5 连接       │           │
│ │ [查看全部 →]                │ │ Skills: 1 高风险待审批      │           │
│ └─────────────────────────────┘ └─────────────────────────────┘           │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ 快捷入口                                                                ││
│ │ [创建数字员工] [新建Skill] [配置MCP] [添加API] [管理语义] [查看日志]   ││
│ └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 数据来源

| 统计项 | Store | Getter/字段 |
|-------|-------|-------------|
| 数字员工数量 | `agentStore` | `stats.total`, `stats.byDomain` |
| Skills数量/成功率 | `skillsStore` | `stats.total`, `stats.avgSuccessRate` |
| MCP服务器状态 | `mcpStore` | `stats.total`, `stats.connected` |
| 组件数量 | `componentsStore` | `stats.total`, `stats.byCategory` |
| 模型数量/可用 | `modelStore` | `stats.total`, `stats.available` |
| 会话统计 | `exploreStore` | 需新增 `getSessionStats()` getter |
| Token消耗 | 多Store聚合 | `agent.runtimeAgents.tokensConsumed`, `skill.stats.tokens`, `model.stats.calls` |
| 定时任务 | `taskStore` (新增) | `stats.running`, `stats.pending`, `stats.successRate` |
| 系统状态 | 聚合 | `settings.configuredProviders`, `mcp.stats.connected`, `skills.highRisk` |

### 2.4 新增Store模块

#### TaskStore (`app/src/store/modules/task.ts`)

```typescript
interface TaskState {
  tasks: ScheduledTask[]
  filter: TaskFilter
  pagination: Pagination
  loading: boolean
  error: string | null
}

interface ScheduledTask {
  id: string
  name: string
  agentId: string           // 关联的数字员工ID
  agentName: string         // 数字员工名称（显示用）
  schedule: string          // Cron表达式
  scheduleType: 'cron' | 'once' | 'manual'
  scheduleConfig: {
    cron?: string
    onceTime?: number
  }
  status: 'running' | 'paused' | 'completed' | 'failed'
  nextRunTime: number       // 下次执行时间戳
  lastRunTime: number       // 上次执行时间戳
  lastRunStatus: 'success' | 'failed' | null
  runCount: number          // 总执行次数
  successCount: number      // 成功次数
  failCount: number         // 失败次数
  defaultInput?: string     // 默认输入消息
  paramsTemplate?: object   // 参数模板（支持动态变量）
  validFrom?: number        // 有效期开始
  validTo?: number          // 有效期结束
  createdAt: number
  updatedAt: number
}

interface TaskFilter {
  status?: ScheduledTask['status']
  agentId?: string
  keyword?: string
}

// stats getter
stats: {
  total: number
  running: number
  paused: number
  pending: number           // nextRunTime > now 且 status === 'running'
  successRate: number       // successCount / runCount
}
```

---

## 3. API管理（资源管理子模块）

### 3.1 页面位置

- **路由**: `/app/resource/api`
- **父模块**: 资源管理

### 3.2 功能清单

| 功能 | 说明 |
|-----|-----|
| API列表 | 展示已配置的外部API，支持搜索、分类筛选 |
| API详情 | 查看配置、调用统计、健康状态 |
| 新增API | 配置名称、端点、认证方式、请求参数 |
| 编辑API | 修改配置、更新认证信息 |
| 删除API | 移除API配置 |
| 测试连接 | 发送测试请求验证API可用性 |
| 调用统计 | 调用次数、成功率、平均耗时、错误分布 |

### 3.3 数据模型

```typescript
interface ExternalAPI {
  id: string
  name: string                    // API名称（如"天气查询API"）
  category: string                // 分类：weather/payment/map/notification/other
  provider: string                // 服务提供商
  endpoint: string                // API端点URL
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  authType: 'none' | 'apiKey' | 'oauth2' | 'basic' | 'jwt'
  authConfig: {
    apiKey?: string               // API Key（加密存储）
    apiKeyHeader?: string         // Key所在Header名
    apiKeyLocation?: 'header' | 'query'
    oauthClientId?: string
    oauthClientSecret?: string
    oauthTokenUrl?: string
    basicUsername?: string
    basicPassword?: string
    jwtToken?: string
    jwtHeaderName?: string
  }
  requestParams: APIParam[]       // 请求参数定义
  responseSchema?: object         // 响应结构（JSON Schema）
  timeout: number                 // 超时时间（ms），默认10000
  retryConfig: {
    maxRetries: number            // 最大重试次数，默认3
    retryDelay: number            // 重试间隔（ms），默认1000
  }
  status: 'available' | 'degraded' | 'unavailable'
  stats: {
    totalCalls: number
    successCalls: number
    failCalls: number
    avgLatency: number            // 平均耗时（ms）
    lastCallTime: number
    lastError?: string
  }
  description?: string
  createdAt: number
  updatedAt: number
}

interface APIParam {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  location: 'query' | 'header' | 'body' | 'path'
  defaultValue?: any
  description?: string
  example?: any
}
```

### 3.4 新增Store模块

#### APIStore (`app/src/store/modules/api.ts`)

```typescript
interface APIState {
  apis: ExternalAPI[]
  currentAPI: ExternalAPI | null
  filter: {
    category?: string
    status?: ExternalAPI['status']
    keyword?: string
  }
  pagination: { page: number, pageSize: number, total: number }
  loading: boolean
  error: string | null
}

// Key Actions
- fetchAPIs()
- fetchAPIById(id: string)
- createAPI(params: APICreateParams)
- updateAPI(id: string, updates: Partial<ExternalAPI>)
- deleteAPI(id: string)
- testConnection(id: string): Promise<{ success: boolean, latency: number, message: string }>
```

---

## 4. 语义管理（新增一级模块）

### 4.1 模块位置

- **路由**: `/app/semantic`
- **子页面**:
  - `/app/semantic/vocabulary` - 语义词库
  - `/app/semantic/config` - 配置管理

### 4.2 业务定位

为数字员工配置领域术语、业务词汇，提升LLM对行业语言的理解准确度。

### 4.3 语义词库

#### 功能清单

| 功能 | 说明 |
|-----|-----|
| 词库列表 | 展示语义词汇，支持按领域、类型筛选 |
| 词汇分类 | 按业务领域组织：finance/medical/retail/manufacture/education/other |
| 新增词汇 | 添加业务术语、别名、同义词 |
| 编辑词汇 | 修改词汇定义、关联词 |
| 删除词汇 | 移除词汇 |
| 批量导入 | CSV/JSON批量导入词汇 |
| 批量导出 | 导出词库为CSV/JSON |
| 词汇关联 | 定义同义词、近义词、上下位关系 |
| 版本管理 | 词库版本记录，支持回滚 |

#### 数据模型

```typescript
interface SemanticVocabulary {
  id: string
  word: string                    // 主词汇（如"授信额度"）
  aliases: string[]               // 别名/同义词（如["信用额度", "额度"]）
  domain: string                  // 所属领域：finance/medical/retail/manufacture/education/other
  category: string                // 分类：noun/verb/adjective/phrase
  definition: string              // 定义描述
  relatedWords: string[]          // 相关词ID（上下位、关联词）
  examples: string[]              // 使用示例句子
  priority: number                // 优先级（1-100，用于歧义消解）
  metadata?: {
    source?: string               // 来源
    tags?: string[]               // 标签
  }
  createdAt: number
  updatedAt: number
  version: string                 // 版本号
}
```

### 4.4 语义配置

#### 功能清单

| 功能 | 说明 |
|-----|-----|
| 领域配置 | 配置业务领域及其描述 |
| 优先级规则 | 不同领域词汇的优先级权重 |
| 映射规则 | 自然语言→结构化参数的映射规则 |
| Agent绑定 | 将词库绑定到特定数字员工 |
| 效果评估 | 语义理解准确率统计 |

#### 数据模型

```typescript
interface SemanticConfig {
  id: string
  domain: string                  // 领域标识
  domainName: string              // 领域显示名称
  description: string             // 领域描述
  priority: number                // 该领域优先级权重（1-100）
  agentBindings: string[]         // 关联的Agent IDs
  mappingRules: MappingRule[]     // 映射规则
  enabled: boolean
  createdAt: number
  updatedAt: number
}

interface MappingRule {
  id: string
  name: string                    // 规则名称
  pattern: string                 // 自然语言模式（如"查询{产品}的{指标}"）
  template: string                // 映射模板（JSON结构化输出）
  variables: {
    name: string                  // 变量名（如"产品"、"指标"）
    type: string                  // 变量类型
    vocabularyRef?: string        // 关联词库ID
  }[]
  examples: string[]              // 示例
  confidence: number              // 置信度阈值
  enabled: boolean
}
```

### 4.5 新增Store模块

#### SemanticStore (`app/src/store/modules/semantic.ts`)

```typescript
interface SemanticState {
  vocabularies: SemanticVocabulary[]
  configs: SemanticConfig[]
  domains: DomainDefinition[]
  currentVocabulary: SemanticVocabulary | null
  currentConfig: SemanticConfig | null
  filter: {
    domain?: string
    category?: string
    keyword?: string
  }
  pagination: { page: number, pageSize: number, total: number }
  loading: boolean
  error: string | null
  selectedVersion: string         // 当前选择的词库版本
  versions: VocabularyVersion[]
}

interface DomainDefinition {
  id: string
  key: string                     // 领域标识
  name: string                    // 领域名称
  description: string
  vocabularyCount: number         // 该领域词汇数量
}

interface VocabularyVersion {
  version: string
  createdAt: number
  changeCount: number
  changes: {
    type: 'add' | 'update' | 'delete'
    wordId: string
    wordName: string
  }[]
}

// Key Actions
- fetchVocabularies(domain?: string)
- createVocabulary(params: VocabularyCreateParams)
- updateVocabulary(id: string, updates: Partial<SemanticVocabulary>)
- deleteVocabulary(id: string)
- batchImportVocabularies(file: File, domain: string)
- exportVocabularies(domain?: string, format: 'csv' | 'json')
- fetchConfigs()
- createConfig(params: ConfigCreateParams)
- updateConfig(id: string, updates: Partial<SemanticConfig>)
- bindAgentToDomain(domain: string, agentId: string)
- unbindAgentFromDomain(domain: string, agentId: string)
- rollbackVocabularyVersion(version: string)
```

---

## 5. 日志管理（新增一级模块）

### 5.1 模块位置

- **路由**: `/app/log`
- **子页面**:
  - `/app/log/agent` - Agent运行日志
  - `/app/log/system` - 系统操作日志

### 5.2 业务定位

全量日志管理：Agent运行日志 + 系统操作日志，支持检索、过滤、导出。

### 5.3 Agent运行日志

#### 功能清单

| 功能 | 说明 |
|-----|-----|
| 日志列表 | 展示Agent执行记录，支持时间/Agent/状态筛选 |
| 日志详情 | 查看完整执行过程、输入输出、错误信息 |
| 调用链路 | 展示Agent调用的MCP/Skills/API链路 |
| Token统计 | 每次执行的token消耗明细 |
| 错误分析 | 错误类型统计、高频错误识别 |
| 日志导出 | 导出为CSV/JSON格式 |

#### 数据模型

```typescript
interface AgentExecutionLog {
  id: string
  agentId: string
  agentName: string
  sessionId: string               // 会话ID
  startTime: number               // 开始时间戳
  endTime: number                 // 结束时间戳
  duration: number                // 执行耗时（ms）
  status: 'success' | 'failed' | 'timeout' | 'cancelled'
  inputMessage: string            // 用户输入
  outputMessage: string           // Agent输出
  tokens: {
    input: number
    output: number
    total: number
  }
  modelUsed: string               // 使用模型（如gpt-4o）
  callChain: CallChainItem[]      // 调用链路
  error?: {
    code: string
    message: string
    stack?: string
    retryCount: number
    occurredAt: number
  }
  metadata: {
    userAgent?: string            // 浏览器UA
    ip?: string                   // IP地址
    source: 'web' | 'api' | 'schedule'  // 来源
    deviceId?: string
  }
}

interface CallChainItem {
  step: number                    // 步骤序号
  type: 'llm' | 'mcp' | 'skill' | 'api' | 'tool'
  name: string                    // 调用目标名称
  startTime: number
  endTime: number
  duration: number
  input: any                      // 输入数据
  output: any                     // 输出数据
  status: 'success' | 'failed' | 'skipped'
  error?: string
  tokens?: { input: number, output: number }  // 仅LLM类型有
}
```

### 5.4 系统操作日志

#### 功能清单

| 功能 | 说明 |
|-----|-----|
| 日志列表 | 展示用户操作记录，支持用户/操作类型/时间筛选 |
| 操作类型 | 登录、配置变更、资源增删改、发布等 |
| 详情查看 | 操作前后的数据对比 |
| 用户追踪 | 按用户维度聚合操作历史 |
| 审计报表 | 生成审计报告 |
| 日志导出 | 导出为CSV/JSON |

#### 数据模型

```typescript
interface SystemOperationLog {
  id: string
  userId: string
  userName: string
  userRole?: string               // 用户角色
  operation: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'config_change' | 'export' | 'import'
  resourceType: 'agent' | 'skill' | 'mcp' | 'model' | 'api' | 'semantic' | 'task' | 'settings' | 'user'
  resourceId: string
  resourceName: string            // 资源名称（显示用）
  beforeValue?: object            // 操作前的值（用于对比）
  afterValue?: object             // 操作后的值
  timestamp: number
  ip: string
  userAgent: string
  device?: string
  result: 'success' | 'failed'
  errorMessage?: string
  duration?: number               // 操作耗时（ms）
  metadata?: object               // 扩展信息
}
```

### 5.5 新增Store模块

#### LogStore (`app/src/store/modules/log.ts`)

```typescript
interface LogState {
  agentLogs: AgentExecutionLog[]
  systemLogs: SystemOperationLog[]
  
  // Agent日志筛选
  agentFilter: {
    agentId?: string
    status?: AgentExecutionLog['status']
    source?: 'web' | 'api' | 'schedule'
    startTime?: number
    endTime?: number
    keyword?: string
  }
  
  // 系统日志筛选
  systemFilter: {
    userId?: string
    operation?: SystemOperationLog['operation']
    resourceType?: SystemOperationLog['resourceType']
    startTime?: number
    endTime?: number
    keyword?: string
  }
  
  pagination: { page: number, pageSize: number, total: number }
  loading: boolean
  error: string | null
  
  // 错误分析统计
  errorStats: {
    totalCount: number
    byType: { type: string, count: number }[]
    byAgent: { agentId: string, agentName: string, count: number }[]
    topErrors: { message: string, count: number }[]
  }
}

// Key Actions
- fetchAgentLogs(filter?: Partial<AgentLogFilter>)
- fetchAgentLogDetail(id: string)
- fetchSystemLogs(filter?: Partial<SystemLogFilter>)
- fetchSystemLogDetail(id: string)
- fetchErrorStats(startTime?: number, endTime?: number)
- exportAgentLogs(format: 'csv' | 'json')
- exportSystemLogs(format: 'csv' | 'json')
```

---

## 6. 定时任务管理（新增一级模块）

### 6.1 页面位置

- **路由**: `/app/task`

### 6.2 功能清单

| 功能 | 说明 |
|-----|-----|
| 任务列表 | 展示所有定时任务，支持状态筛选、搜索 |
| 新建任务 | 选择Agent、配置执行计划、设置参数 |
| 编辑任务 | 修改执行周期、调整参数、暂停/恢复 |
| 任务详情 | 查看执行历史、成功/失败记录、参数配置 |
| 手动执行 | 立即触发一次执行（调试用） |
| 执行历史 | 每次执行的详细记录、输入输出日志 |
| 删除任务 | 移除定时任务配置 |

### 6.3 执行计划配置

#### 调度类型

| 类型 | 说明 | 配置方式 |
|-----|-----|---------|
| 周期执行 | 按固定周期重复执行 | Cron表达式 或 可视化配置 |
| 一次性 | 仅执行一次 | 指定执行时间点 |
| 手动触发 | 不自动执行，需人工触发 | 无自动调度 |

#### 可视化Cron配置

```
预设选项：每分钟/每小时/每天/每周/每月/自定义

[每天] 执行时间: [08] : [00]
生成的Cron: 0 8 * * *

[每周] 执行时间: 周一/周二/... 时间: [09] : [00]
生成的Cron: 0 9 * * 1

[自定义] 输入Cron表达式: [0 8 * * *]
```

### 6.4 新建任务流程

**步骤1**: 选择数字员工
- 从现有Agent列表中选择要定时执行的Agent
- 显示Agent名称、类型、状态

**步骤2**: 配置执行计划
- 选择调度类型（周期/一次性/手动）
- 配置执行时间（可视化Cron或直接输入）
- 设置有效期（可选）

**步骤3**: 配置执行参数
- 默认输入消息（Agent启动时的输入）
- 参数模板（支持动态变量如 `${today}`, `${yesterday}`）

**步骤4**: 确认创建
- 输入任务名称
- 确认配置信息
- 创建任务

### 6.5 执行历史与日志关联

每次任务执行生成 `AgentExecutionLog` 记录：
- `metadata.source = 'schedule'`
- 与日志管理模块联动
- 可在日志管理中按 `source='schedule'` 筛选定时任务执行记录

---

## 7. 路由重构详情

### 7.1 修改文件

- `app/src/router/index.ts` - 路由定义
- `app/src/components/layout/AppSidebar.vue` - 侧边栏菜单配置
- `app/src/locales/zh-CN.ts` - 中文国际化
- `app/src/locales/en-US.ts` - 英文国际化

### 7.2 新增页面组件文件

| 文件路径 | 说明 |
|---------|-----|
| `app/src/views/overview/OverviewDashboard.vue` | 平台概览Dashboard |
| `app/src/views/resource/APIManagement.vue` | API管理 |
| `app/src/views/semantic/VocabularyManagement.vue` | 语义词库管理 |
| `app/src/views/semantic/SemanticConfig.vue` | 语义配置管理 |
| `app/src/views/log/AgentLog.vue` | Agent运行日志 |
| `app/src/views/log/SystemLog.vue` | 系统操作日志 |
| `app/src/views/task/ScheduledTaskManagement.vue` | 定时任务管理 |

### 7.3 新增Store模块文件

| 文件路径 | 说明 |
|---------|-----|
| `app/src/store/modules/task.ts` | 定时任务状态管理 |
| `app/src/store/modules/api.ts` | API管理状态管理 |
| `app/src/store/modules/semantic.ts` | 语义管理状态管理 |
| `app/src/store/modules/log.ts` | 日志管理状态管理 |

### 7.4 新增Service文件

| 文件路径 | 说明 |
|---------|-----|
| `app/src/services/task.ts` | 定时任务API服务 |
| `app/src/services/api.ts` | 外部API管理API服务 |
| `app/src/services/semantic.ts` | 语义管理API服务 |
| `app/src/services/log.ts` | 日志查询API服务 |

### 7.5 路由改动清单

| 改动类型 | 原路由 | 新路由 | 说明 |
|---------|-------|-------|-----|
| 新增 | - | `/app/overview` | 平台概览 |
| 新增 | - | `/app/resource/api` | API管理 |
| 新增 | - | `/app/semantic/vocabulary` | 语义词库 |
| 新增 | - | `/app/semantic/config` | 语义配置 |
| 新增 | - | `/app/log/agent` | Agent运行日志 |
| 新增 | - | `/app/log/system` | 系统操作日志 |
| 新增 | - | `/app/task` | 定时任务 |
| 移除 | `/app/tool/models` | - | 模型管理移出 |
| 移除 | `/app/tool/models/:id` | - | 模型详情移出 |
| 移除 | `/app/settings/appearance` | - | 外观设置移除 |
| 整合 | - | `/app/settings/models` | 模型管理移至设置 |
| 调整 | redirect `/app/explore` | redirect `/app/overview` | 默认进入概览 |

### 7.6 侧边栏菜单配置

```typescript
const menuItems = [
  { key: 'overview', icon: 'dashboard', label: '平台概览', path: '/app/overview' },
  { key: 'explore', icon: 'chat', label: '探索中心', path: '/app/explore' },
  {
    key: 'agent',
    icon: 'app',
    label: '数字员工',
    path: '/app/agent',
    children: [{ key: 'agent-management', label: '数字员工管理', path: '/app/agent' }]
  },
  {
    key: 'tool',
    icon: 'tool',
    label: '工具管理',
    path: '/app/tool',
    children: [
      { key: 'skills', label: 'Skills 管理', path: '/app/tool/skills' },
      { key: 'mcp', label: 'MCP 管理', path: '/app/tool/mcp' }
    ]
  },
  {
    key: 'resource',
    icon: 'resource',
    label: '资源管理',
    path: '/app/resource',
    children: [
      { key: 'components', label: '组件管理', path: '/app/resource/components' },
      { key: 'datamodel', label: '数据模型', path: '/app/resource/datamodel' },
      { key: 'api', label: 'API 管理', path: '/app/resource/api' }
    ]
  },
  {
    key: 'semantic',
    icon: 'semantic',
    label: '语义管理',
    path: '/app/semantic',
    children: [
      { key: 'vocabulary', label: '语义词库', path: '/app/semantic/vocabulary' },
      { key: 'semantic-config', label: '配置管理', path: '/app/semantic/config' }
    ]
  },
  {
    key: 'log',
    icon: 'log',
    label: '日志管理',
    path: '/app/log',
    children: [
      { key: 'agent-log', label: 'Agent 运行日志', path: '/app/log/agent' },
      { key: 'system-log', label: '系统操作日志', path: '/app/log/system' }
    ]
  },
  { key: 'task', icon: 'schedule', label: '定时任务', path: '/app/task' },
  {
    key: 'settings',
    icon: 'settings',
    label: '系统配置',
    path: '/app/settings',
    children: [
      { key: 'providers', label: '模型提供商', path: '/app/settings/providers' },
      { key: 'models', label: '模型管理', path: '/app/settings/models' }
    ]
  }
]
```

---

## 8. 国际化文案新增

### 8.1 zh-CN 新增文案

```typescript
// 路由标题
route: {
  overview: '平台概览',
  task: '定时任务',
  semantic: '语义管理',
  vocabulary: '语义词库',
  semanticConfig: '配置管理',
  log: '日志管理',
  agentLog: 'Agent 运行日志',
  systemLog: '系统操作日志',
  apiManagement: 'API 管理',
}

// 模块文案
overview: {
  title: '平台概览',
  stats: {
    agents: '数字员工',
    skills: 'Skills',
    mcp: 'MCP 服务器',
    components: '组件',
    models: '模型',
    sessions: '会话统计',
    tokens: 'Token 消耗',
    tasks: '定时任务',
    systemStatus: '系统状态'
  },
  quickActions: '快捷入口',
  refresh: '刷新',
  timeRange: '时间范围'
}

semantic: {
  vocabulary: {
    title: '语义词库',
    addWord: '添加词汇',
    import: '批量导入',
    export: '导出词库',
    domain: '所属领域',
    aliases: '别名/同义词',
    definition: '定义',
    examples: '使用示例',
    priority: '优先级'
  },
  config: {
    title: '语义配置',
    domainConfig: '领域配置',
    priority: '优先级规则',
    agentBinding: 'Agent 绑定',
    mappingRules: '映射规则'
  }
}

api: {
  title: 'API 管理',
  addApi: '添加 API',
  testConnection: '测试连接',
  endpoint: 'API 端点',
  authType: '认证方式',
  category: '分类',
  provider: '服务提供商',
  timeout: '超时时间',
  retry: '重试配置'
}

log: {
  agent: {
    title: 'Agent 运行日志',
    executionTime: '执行时间',
    duration: '执行耗时',
    callChain: '调用链路',
    tokenUsage: 'Token 消耗',
    inputOutput: '输入输出'
  },
  system: {
    title: '系统操作日志',
    operation: '操作类型',
    resourceType: '资源类型',
    operator: '操作人',
    beforeAfter: '数据对比'
  },
  export: '导出日志',
  filter: '筛选'
}

task: {
  title: '定时任务',
  createTask: '创建任务',
  schedule: '执行周期',
  nextRun: '下次执行',
  lastRun: '上次执行',
  executionHistory: '执行历史',
  manualExecute: '手动执行',
  status: {
    running: '运行中',
    paused: '已暂停',
    pending: '待执行',
    completed: '已完成',
    failed: '执行失败'
  },
  scheduleType: {
    cron: '周期执行',
    once: '一次性',
    manual: '手动触发'
  }
}
```

---

## 9. 实施阶段建议

### 阶段一：路由与菜单重构（优先级：高）
- 修改路由配置
- 修改侧边栏菜单配置
- 移除外观设置路由
- 模型管理路由迁移
- 默认路由调整为 `/app/overview`

### 阶段二：平台概览Dashboard（优先级：高）
- 创建 OverviewDashboard 页面组件
- 实现统计卡片展示
- 聚合各Store的统计数据
- 实现快捷入口功能

### 阶段三：定时任务模块（优先级：高）
- 创建 TaskStore
- 创建定时任务管理页面
- 实现新建/编辑/删除任务
- 实现执行历史查看

### 阶段四：日志管理模块（优先级：中）
- 创建 LogStore
- 创建 Agent运行日志页面
- 创建 系统操作日志页面
- 实现日志检索、导出

### 阶段五：API管理模块（优先级：中）
- 创建 APIStore
- 创建 API管理页面
- 实现API配置、测试连接

### 阶段六：语义管理模块（优先级：中）
- 创建 SemanticStore
- 创建语义词库管理页面
- 创建语义配置页面
- 实现词汇导入导出

---

## 10. 附录

### 10.1 现有Store模块参考

| Store文件 | 状态管理内容 | 代码行数 |
|---------|------------|---------|
| `agent.ts` | Agent管理、运行状态 | 834 |
| `skills.ts` | Skills管理、统计 | 800 |
| `model.ts` | LLM模型管理 | 461 |
| `mcp.ts` | MCP服务器管理 | 653 |
| `explore.ts` | 探索会话管理 | 1110 |
| `settings.ts` | 系统设置、Provider配置 | 156 |
| `components.ts` | UI组件注册表 | 196 |
| `datamodel.ts` | 数据模型管理 | 503 |

### 10.2 现有API Service参考

| Service文件 | API端点 |
|------------|--------|
| `agent.ts` | `/agents/`, `/agents/:id` |
| `resource.ts` | `/resources/skills`, `/resources/mcp`, `/resources/components` |
| `conversation.ts` | `/conversations/` |
| `chat-completions.ts` | `/v1/chat/completions` (SSE) |
| `ai.ts` | 各Provider API直接调用 |

### 10.3 代码风格约定

- Vue组件：`<script setup lang="ts"`
- Props：`defineProps<Props>()` + `withDefaults()`
- Store：Pinia Options API风格（state/getters/actions）
- 持久化：`pinia-plugin-persistedstate`，仅持久化必要字段
- 无分号、单引号、2空格缩进（Prettier）