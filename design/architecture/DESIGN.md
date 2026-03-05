# SmartLink Enterprise Agent Platform - 设计方案

## 一、项目概述

### 1.1 项目定位

SmartLink Enterprise Agent Platform 是一个**智能企业级 Agent 应用管理平台**，实现基于大模型以及确定性的组件、数据模型、MCP、Skills 等进行设计、编排 Agent 应用，发布应用支持企业级使用场景。

平台采用 OpenClaw-like 架构模式，调用流程为：Client (Web/Mobile) → Gateway 网关 → Agent Proxy 分发 → Agent 逻辑处理 → LLM 生成前端页面 JSON + 数据 → 前端渲染器展示页面。

### 1.2 核心能力

#### 1.2.1 智能化设计编排

- **大模型驱动**：基于 LLM 理解自然语言需求，自动生成 Agent 编排流程
- **确定性组件**：标准化前端组件库，支持 Schema 驱动渲染
- **数据模型管理**：统一的数据模型定义与验证机制
- **MCP 协议集成**：Model Context Protocol 工具生态无缝接入
- **Skills 能力复用**：可组合的技能模块，支持复杂业务场景

#### 1.2.2 企业级部署运维

- **多租户架构**：租户隔离、资源配额、独立命名空间
- **高并发支持**：WebSocket 实时通信、会话管理、任务队列
- **安全合规**：JWT 认证、OAuth 2.0/SSO、数据加密、审计日志
- **监控运维**：应用监控、资源统计、告警通知

#### 1.2.3 可视化编排体验

- **拖拽式流程设计**：所见即所得的 Agent 工作流编排
- **实时预览调试**：设计态与运行态无缝切换
- **版本管理**：应用版本控制、回滚、灰度发布
- **动态渲染**：LLM 生成 Schema，前端渲染器实时渲染页面

### 1.3 平台架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SmartLink Enterprise Agent Platform                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     应用层 (Application Layer)                   │   │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│   │  │ 探索中心  │ │ 应用管理  │ │ 资源管理  │ │ 工具管理  │       │   │
│   │  │ Explore   │ │  App Mgmt │ │ Resource  │ │ Tool Mgmt │       │   │
│   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     编排层 (Orchestration Layer)                 │   │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│   │  │ Workflow  │ │  Agent    │ │   MCP     │ │  LLM      │       │   │
│   │  │ Designer  │ │  Runtime  │ │ Connector │ │ Adapter   │       │   │
│   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     渲染层 (Rendering Layer)                     │   │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│   │  │  Schema   │ │ Component │ │  State    │ │  Event    │       │   │
│   │  │  Engine   │ │  Registry │ │  Manager  │ │ Processor │       │   │
│   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.4 目标用户

| 用户群体         | 使用场景            | 核心需求                         |
| ---------------- | ------------------- | -------------------------------- |
| **企业 IT 部门** | 构建内部 Agent 应用 | 企业级部署、安全合规、多租户管理 |
| **开发者**       | 快速编排 Agent 流程 | 可视化设计、MCP 集成、API 调试   |
| **业务人员**     | AI 辅助创建 Agent   | 自然语言交互、模板市场、一键部署 |

### 1.5 与传统方案对比

| 维度     | 传统低代码平台      | SmartLink Agent Platform |
| -------- | ------------------- | ------------------------ |
| 交互方式 | 拖拽组件 + 属性配置 | 自然语言 + AI 理解       |
| 页面生成 | 预设模板有限        | LLM 动态生成 Schema      |
| 能力扩展 | 插件机制            | MCP 协议 + Skills 生态   |
| 部署模式 | 单体应用            | 微服务 + Agent 运行时    |
| 适用场景 | 固定业务流程        | 动态 Agent 对话场景      |

## 二、技术架构

### 2.1 技术栈

```
前端框架：Vue 3.4+ (Composition API)
构建工具：Vite 5.0+
包管理：pnpm monorepo
UI组件库：@smart-link/ui (自研)
核心引擎：@smart-link/core (渲染引擎)
共享模块：@smart-link/shared (类型、元数据)
状态管理：Pinia (支持持久化)
路由管理：Vue Router 4.x
样式预处理：Sass
代码规范：ESLint + Prettier
```

### 2.2 Monorepo 架构

```
smart-link/
├── packages/                    # 可发布到 npm 的包
│   ├── core/                    # @smart-link/core - 页面编排引擎
│   │   ├── src/
│   │   │   ├── types/           # 核心类型定义
│   │   │   ├── evaluator/       # 表达式求值器
│   │   │   ├── state/           # 状态管理器
│   │   │   ├── registry/        # 组件注册表
│   │   │   ├── events/          # 事件处理器
│   │   │   ├── directives/      # 指令处理器
│   │   │   ├── renderer/        # 核心渲染器
│   │   │   └── index.ts
│   │   └── dist/
│   ├── ui/                      # @smart-link/ui - UI组件库
│   ├── hooks/                   # @smart-link/hooks - 组合式函数
│   ├── theme/                   # @smart-link/theme - 主题样式
│   └── shared/                  # @smart-link/shared - 共享工具
├── app/                         # 主应用
│   ├── src/
│   │   ├── components/
│   │   │   └── orchestrator/    # 编排器组件
│   │   │       ├── ComponentLibrary.vue   # 组件库面板
│   │   │       ├── DesignCanvas.vue       # 设计画布
│   │   │       ├── RenderableNode.vue     # 可渲染节点
│   │   │       ├── PropsPanel.vue         # 属性面板
│   │   │       └── PreviewContainer.vue   # 预览容器
│   │   ├── store/modules/
│   │   │   └── orchestrator.ts  # 编排器状态
│   │   └── types/               # 类型定义
├── play/                        # 组件调试环境
├── docs/                        # VitePress 文档站点
└── internal/build/              # Rollup 构建配置
```

### 2.3 核心引擎架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      @smart-link/core                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Types     │    │  Evaluator  │    │   State     │        │
│  │             │    │             │    │  Manager    │        │
│  │ PageSchema  │───▶│ Expression  │───▶│  Reactive   │        │
│  │ Component   │    │ Binding     │    │  State      │        │
│  │ Props/Style │    │ Evaluation  │    │  Watch      │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                 │                   │                │
│         ▼                 ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────┐      │
│  │                    Renderer                          │      │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐       │      │
│  │  │ Registry  │  │  Events   │  │Directives │       │      │
│  │  │Component  │  │ Processor │  │ Processor │       │      │
│  │  │ Register  │  │ Handle    │  │ Condition │       │      │
│  │  │ Meta      │  │ Execute   │  │ Loop      │       │      │
│  │  └───────────┘  └───────────┘  └───────────┘       │      │
│  └─────────────────────────────────────────────────────┘      │
│                          │                                     │
│                          ▼                                     │
│                   ┌─────────────┐                             │
│                   │   VNode     │                             │
│                   │   Output    │                             │
│                   └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.3.1 核心类型定义 (Types)

```typescript
// 页面Schema - 核心渲染数据结构
interface PageSchema {
  id: string
  version: string
  root: ComponentNode
  styles?: StyleDefinition[]
  scripts?: ScriptDefinition[]
}

// 组件节点 - 树形结构
interface ComponentNode {
  id: string
  type: string
  props?: PropConfig
  style?: StyleConfig
  condition?: ExpressionBinding
  loop?: LoopConfig
  events?: EventBinding[]
  slots?: Record<string, SlotContent>
  children?: ComponentNode[]
}

// 表达式绑定 - 连接状态与视图
interface ExpressionBinding {
  type: 'expression' | 'state' | 'computed' | 'method'
  value: string
  formatter?: string
}

// 事件处理器
interface EventHandler {
  type: 'builtin' | 'custom' | 'api' | 'state'
  action?: BuiltinAction
  code?: string
  api?: ApiCallConfig
  stateUpdate?: StateUpdateConfig
}
```

#### 2.3.2 表达式求值器 (Evaluator)

```typescript
interface ExpressionEvaluator {
  // 编译表达式为可执行函数
  compile: (expression: string) => Function
  // 在上下文中求值
  evaluate: (expression: string, context: EvaluationContext) => any
  // 求值绑定配置
  evaluateBinding: (binding: ExpressionBinding, context: EvaluationContext) => any
}
```

支持的表达式类型：

- **expression**: JavaScript表达式，如 `state.count + 1`
- **state**: 状态路径引用，如 `state.user.name`
- **computed**: 计算属性，依赖其他状态
- **method**: 方法调用，如 `methods.handleSubmit()`

#### 2.3.3 状态管理器 (StateManager)

```typescript
interface StateManager {
  state: Record<string, any>
  get: (path: string) => any
  set: (path: string, value: any) => void
  watch: (path: string, callback: WatchCallback) => () => void
  notify: (path: string) => void
  reset: () => void
}
```

特性：

- 基于 Vue 3 reactive 实现
- 支持路径访问 (如 `user.profile.name`)
- 支持监听变化
- 支持状态快照与恢复

#### 2.3.4 组件注册表 (Registry)

```typescript
interface ComponentRegistry {
  register: (type: string, component: any, meta?: ComponentMeta) => void
  registerAsync: (type: string, loader: () => Promise<any>, meta?: ComponentMeta) => void
  get: (type: string) => any
  getMeta: (type: string) => ComponentMeta | undefined
  has: (type: string) => boolean
  getAllTypes: () => string[]
  getByCategory: (category: string) => ComponentMeta[]
}
```

组件元数据：

```typescript
interface ComponentMeta {
  type: string
  name: string
  category: 'basic' | 'form' | 'layout' | 'data' | 'business'
  description: string
  icon: string
  props: PropMeta[]
  events: EventMeta[]
  slots: SlotMeta[]
}
```

#### 2.3.5 事件处理器 (EventProcessor)

```typescript
interface EventProcessor {
  handle: (binding: EventBinding, context: RuntimeContext, event: any) => Promise<void>
  executeBuiltin: (
    action: BuiltinAction,
    params: Record<string, any>,
    context: RuntimeContext
  ) => Promise<void>
  executeCustom: (code: string, context: RuntimeContext, event: any) => Promise<any>
  executeApi: (config: ApiCallConfig, context: RuntimeContext) => Promise<any>
}
```

内置动作类型：

```typescript
type BuiltinAction =
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
```

#### 2.3.6 指令处理器 (DirectiveProcessor)

```typescript
interface DirectiveProcessor {
  processCondition: (node: ComponentNode, context: RuntimeContext) => boolean
  processLoop: (node: ComponentNode, context: RuntimeContext) => LoopResult[]
  processModel: (node: ComponentNode, context: RuntimeContext) => Record<string, any>
}
```

支持的指令：

- **v-if/v-show**: 条件渲染
- **v-for**: 循环渲染
- **v-model**: 双向绑定

#### 2.3.7 渲染器 (Renderer)

```typescript
interface Renderer {
  renderPage: (schema: PageSchema, context: RuntimeContext) => any
  renderNode: (node: ComponentNode, context: RuntimeContext) => any
  destroy: () => void
}
```

渲染流程：

1. 解析 Schema 结构
2. 创建运行时上下文
3. 递归渲染节点树
4. 处理条件、循环、事件
5. 生成 VNode 并挂载

### 2.4 系统架构设计 (OpenClaw-like)

#### 2.4.1 整体架构

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

## 三、功能模块设计

#### 3.1 资源管理模块

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

#### 3.2 工具管理模块

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

#### 3.3 应用管理模块

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

#### 3.4 探索模块

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

## 四、核心数据模型

#### 4.1 Agent 模型

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

#### 4.2 Skill 模型

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

#### 4.3 MCP 模型

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

#### 4.4 Application 模型

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

#### 4.5 组件模型

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
}
```

#### 4.6 DataModel 模型

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

## 五、API 接口设计

#### 5.1 REST API

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

#### 5.2 WebSocket API

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

## 六、前端架构设计

#### 6.1 页面路由结构

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

#### 6.2 状态管理架构

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

## 七、UI 设计规范

#### 7.1 设计理念

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

#### 7.2 色彩系统

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

#### 7.3 间距系统

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

#### 7.4 字体系统

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

#### 7.5 圆角系统

```scss
$border-radius-sm: 4px;
$border-radius-md: 6px;
$border-radius-lg: 8px;
$border-radius-xl: 12px;
$border-radius-2xl: 16px;
$border-radius-full: 9999px;
```

## 八、集成模式

#### 8.1 MCP 集成

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

#### 8.2 LLM 集成

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

## 九、部署与安全

### 9.1 部署架构

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

### 9.2 安全与合规

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

### 9.3 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          ui: ['@opentiny/vue']
        }
      }
    }
  }
})
```

### 9.4 环境配置

```env
# .env.development
VITE_APP_TITLE=SmartLink
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development

# .env.production
VITE_APP_TITLE=SmartLink
VITE_API_BASE_URL=https://api.smartlink.com
VITE_APP_ENV=production
```

## 十、开发规范

### 10.1 命名规范

- **文件命名**：kebab-case (如: `app-layout.vue`)
- **组件命名**：PascalCase (如: `AppLayout`)
- **变量命名**：camelCase (如: `isActive`)
- **常量命名**：UPPER_SNAKE_CASE (如: `API_BASE_URL`)
- **CSS类名**：BEM规范 (如: `.block__element--modifier`)

### 10.2 代码规范

- 使用TypeScript严格模式
- 使用Composition API
- 使用`<script setup>`语法
- Props必须定义类型
- 统一使用ESLint + Prettier格式化

### 10.3 Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 十一、性能优化策略

### 11.1 代码分割

- 路由懒加载
- 组件按需加载
- 第三方库按需引入

### 11.2 资源优化

- 图片懒加载
- 图片压缩
- 使用WebP格式
- 开启Gzip压缩

### 11.3 渲染优化

- 虚拟滚动 (长列表)
- 防抖节流
- 使用v-show替代v-if (频繁切换)
- 合理使用computed和watch

### 11.4 缓存策略

- 组件缓存 (keep-alive)
- API响应缓存
- 静态资源缓存

## 十二、开发计划

### 12.1 第一阶段：基础架构

- [ ] 项目初始化与 Monorepo 结构完善
- [ ] 基础 UI 组件库 (White-Blue 主题)
- [ ] 布局组件 (AppLayout, Sidebar, Header)
- [ ] 基础路由配置

### 12.2 第二阶段：资源管理

- [ ] 组件管理模块开发
- [ ] 数据模型模块开发
- [ ] 组件市场

### 12.3 第三阶段：工具管理

- [ ] MCP 管理模块
- [ ] Skills 管理模块
- [ ] 模型管理模块

### 12.4 第四阶段：应用管理

- [ ] 应用列表与详情
- [ ] 应用编排器 (可视化流程设计)
- [ ] 应用发布与版本管理

### 12.5 第五阶段：探索与执行

- [ ] 探索中心
- [ ] 应用执行引擎
- [ ] WebSocket 实时通信
- [ ] 前端渲染器集成

### 12.6 第六阶段：企业级特性

- [ ] 多租户支持
- [ ] 权限系统
- [ ] 监控与告警
- [ ] 性能优化

## 十三、总结

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

## 十四、Agent Workflow Engine 架构

### 14.1 工作流引擎概述

工作流引擎是 Agent 应用编排的核心，负责解析、调度和执行复杂的工作流定义。

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Workflow Engine Architecture                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Workflow Definition                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │  Nodes    │  │  Edges    │  │ Variables │  │ Triggers  │    │   │
│  │  │  节点定义  │  │  边定义    │  │  变量定义  │  │  触发器    │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Execution Engine                            │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │  Parser   │  │ Scheduler │  │  Executor │  │  Monitor  │    │   │
│  │  │  解析器    │  │  调度器    │  │  执行器    │  │  监控器    │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     State Management                            │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │  Context  │  │  Memory   │  │  Checkpoint│ │  Recovery │    │   │
│  │  │  上下文    │  │  内存      │  │  检查点    │  │  恢复      │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 14.2 工作流节点类型

#### 14.2.1 节点类型定义

```typescript
// 工作流节点基类
interface WorkflowNode {
  id: string
  type: NodeType
  name: string
  description?: string
  position: { x: number; y: number }

  // 输入输出
  inputs: NodePort[]
  outputs: NodePort[]

  // 配置
  config: Record<string, any>

  // 执行条件
  condition?: ExpressionConfig

  // 重试策略
  retry?: RetryConfig

  // 超时配置
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

// 节点端口
interface NodePort {
  id: string
  name: string
  type: 'data' | 'control'
  dataType?: string
  required: boolean
  description?: string
}
```

#### 14.2.2 核心节点详解

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           核心节点类型详解                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LLM Node (大模型节点)                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  功能: 调用大语言模型进行推理                                      │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  输入:                                                            │   │
│  │    • prompt: 提示词模板                                           │   │
│  │    • model: 模型标识 (gpt-4o, claude-3-opus, etc.)               │   │
│  │    • context: 上下文变量                                          │   │
│  │  输出:                                                            │   │
│  │    • content: 生成内容                                            │   │
│  │    • schema: 生成的 Schema JSON (可选)                            │   │
│  │    • tokens: Token 使用统计                                       │   │
│  │  配置:                                                            │   │
│  │    • temperature: 温度参数 (0-2)                                  │   │
│  │    • maxTokens: 最大 Token 数                                     │   │
│  │    • streaming: 是否流式输出                                      │   │
│  │    • jsonMode: JSON 输出模式                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Condition Node (条件分支节点)                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  功能: 根据条件执行不同分支                                        │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  配置:                                                            │   │
│  │    • branches: 分支列表                                           │   │
│  │      - condition: 条件表达式                                      │   │
│  │      - target: 目标节点 ID                                        │   │
│  │    • defaultBranch: 默认分支                                      │   │
│  │  支持的表达式:                                                    │   │
│  │    • ${variable} == 'value'                                       │   │
│  │    • ${count} > 10                                                │   │
│  │    • ${status} in ['active', 'pending']                           │   │
│  │    • contains(${text}, 'keyword')                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Parallel Node (并行执行节点)                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  功能: 并行执行多个分支                                            │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  配置:                                                            │   │
│  │    • branches: 并行分支列表                                       │   │
│  │    • mode: 执行模式                                               │   │
│  │      - all: 等待所有分支完成                                      │   │
│  │      - any: 任一分支完成即继续                                    │   │
│  │      - race: 竞争模式，最快者胜                                   │   │
│  │    • timeout: 整体超时时间                                        │   │
│  │    • errorHandling: 错误处理策略                                  │   │
│  │      - failFast: 任一失败立即终止                                 │   │
│  │      - continue: 继续执行其他分支                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Tool Node (工具调用节点)                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  功能: 调用 MCP 工具或内部工具                                     │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  输入:                                                            │   │
│  │    • toolId: 工具标识                                             │   │
│  │    • toolType: 'mcp' | 'builtin' | 'custom'                       │   │
│  │    • params: 工具参数                                             │   │
│  │  输出:                                                            │   │
│  │    • result: 执行结果                                             │   │
│  │    • metadata: 元数据 (耗时、状态等)                              │   │
│  │  配置:                                                            │   │
│  │    • timeout: 超时时间                                            │   │
│  │    • retry: 重试策略                                              │   │
│  │    • fallback: 降级策略                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Loop Node (循环节点)                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  功能: 循环执行子节点                                              │   │
│  │  ─────────────────────────────────────────────────────────────   │   │
│  │  配置:                                                            │   │
│  │    • type: 循环类型                                               │   │
│  │      - forEach: 遍历数组                                          │   │
│  │      - while: 条件循环                                            │   │
│  │      - times: 固定次数                                            │   │
│  │    • iterator: 迭代变量名                                         │   │
│  │    • index: 索引变量名                                            │   │
│  │    • maxIterations: 最大迭代次数 (安全限制)                       │   │
│  │    • exitCondition: 退出条件                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 14.3 工作流定义模型

```typescript
// 工作流定义
interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  version: string

  // 节点列表
  nodes: WorkflowNode[]

  // 边列表
  edges: WorkflowEdge[]

  // 变量定义
  variables: VariableDefinition[]

  // 触发器
  triggers: TriggerConfig[]

  // 全局配置
  settings: WorkflowSettings

  // 元数据
  metadata: {
    createdAt: number
    updatedAt: number
    author?: string
    tags?: string[]
  }
}

// 工作流边
interface WorkflowEdge {
  id: string
  source: string // 源节点 ID
  sourcePort?: string // 源端口
  target: string // 目标节点 ID
  targetPort?: string // 目标端口
  label?: string // 边标签
  condition?: ExpressionConfig // 边条件
}

// 变量定义
interface VariableDefinition {
  name: string
  type: string
  defaultValue?: any
  description?: string
  scope: 'workflow' | 'node' | 'global'
}

// 触发器配置
interface TriggerConfig {
  type: 'manual' | 'schedule' | 'webhook' | 'event' | 'api'
  config: Record<string, any>
}

// 工作流设置
interface WorkflowSettings {
  // 超时设置
  timeout: number

  // 重试策略
  retry: RetryConfig

  // 并发控制
  concurrency: {
    maxExecutions: number
    strategy: 'queue' | 'reject' | 'replace'
  }

  // 错误处理
  errorHandling: {
    strategy: 'stop' | 'continue' | 'compensate'
    notifyOnFailure: boolean
  }

  // 日志级别
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
```

### 14.4 执行引擎设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Workflow Execution Engine                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  执行流程:                                                               │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  1. 解析阶段 (Parse Phase)                                               │
│     ┌─────────────┐                                                      │
│     │  Workflow   │    ┌─────────────┐    ┌─────────────┐              │
│     │ Definition  │───▶│   Parser    │───▶│  Execution  │              │
│     │  (JSON)     │    │   解析验证   │    │    Plan     │              │
│     └─────────────┘    └─────────────┘    └─────────────┘              │
│                                                                          │
│  2. 调度阶段 (Schedule Phase)                                            │
│     ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│     │  Execution  │───▶│  Scheduler  │───▶│  Execution  │              │
│     │    Plan     │    │   节点调度   │    │   Context   │              │
│     └─────────────┘    └─────────────┘    └─────────────┘              │
│                                                                          │
│  3. 执行阶段 (Execute Phase)                                             │
│     ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│     │   Ready     │───▶│  Executor   │───▶│  Completed  │              │
│     │   Queue     │    │  节点执行器  │    │   Nodes     │              │
│     └─────────────┘    └─────────────┘    └─────────────┘              │
│            │                  │                                         │
│            │                  ▼                                         │
│            │           ┌─────────────┐                                  │
│            └──────────▶│   Failed    │                                  │
│                        │   Nodes     │                                  │
│                        └─────────────┘                                  │
│                                                                          │
│  4. 状态管理 (State Management)                                          │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │                                                              │    │
│     │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │    │
│     │  │ pending │─▶│ running │─▶│ success │  │ failed  │        │    │
│     │  └─────────┘  └─────────┘  └─────────┘  └────┬────┘        │    │
│     │       │            │                         │              │    │
│     │       │            │                         ▼              │    │
│     │       │            │                   ┌─────────┐          │    │
│     │       │            └──────────────────▶│ retry   │          │    │
│     │       │                                └─────────┘          │    │
│     │       │                                      │              │    │
│     │       │                                      ▼              │    │
│     │       │                                ┌─────────┐          │    │
│     │       └────────────────────────────────▶│ skipped │          │    │
│     │                                        └─────────┘          │    │
│     │                                                              │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 14.5 执行上下文与状态管理

```typescript
// 执行上下文
interface ExecutionContext {
  // 执行标识
  executionId: string
  workflowId: string
  workflowVersion: string

  // 租户信息
  tenantId: string
  userId: string

  // 输入数据
  input: Record<string, any>

  // 变量存储
  variables: Map<string, any>

  // 节点状态
  nodeStates: Map<string, NodeExecutionState>

  // 执行历史
  history: ExecutionHistoryEntry[]

  // 当前状态
  status: ExecutionStatus

  // 时间信息
  startedAt: number
  completedAt?: number

  // 错误信息
  error?: ErrorInfo
}

// 节点执行状态
interface NodeExecutionState {
  nodeId: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'retrying'

  // 输入输出
  input?: any
  output?: any

  // 时间信息
  startedAt?: number
  completedAt?: number

  // 重试信息
  retryCount?: number
  maxRetry?: number

  // 错误信息
  error?: ErrorInfo
}

// 执行状态
type ExecutionStatus =
  | 'pending' // 等待执行
  | 'running' // 执行中
  | 'paused' // 暂停
  | 'success' // 成功
  | 'failed' // 失败
  | 'cancelled' // 取消
  | 'timeout' // 超时

// 检查点
interface Checkpoint {
  id: string
  executionId: string
  nodeId: string
  timestamp: number
  context: ExecutionContext
  variables: Record<string, any>
}
```

### 14.6 错误处理与补偿机制

```typescript
// 错误处理策略
interface ErrorHandlingStrategy {
  // 错误类型映射
  errorMappings: {
    type: string // 错误类型
    action: 'retry' | 'skip' | 'fail' | 'compensate'
    retryConfig?: RetryConfig
    compensateFlow?: string // 补偿流程 ID
  }[]

  // 全局错误处理
  globalHandler: {
    action: 'stop' | 'continue'
    notifyConfig?: NotifyConfig
  }
}

// 补偿事务
interface CompensationTransaction {
  id: string
  workflowId: string
  executionId: string

  // 已完成节点（按执行顺序倒序）
  completedNodes: {
    nodeId: string
    compensateAction?: string // 补偿动作 ID
  }[]

  // 补偿状态
  status: 'pending' | 'running' | 'success' | 'failed'
}

// 补偿执行流程
// ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
// │ Node A  │───▶│ Node B  │───▶│ Node C  │───▶│ FAILED  │
// │ success │    │ success │    │ success │    │ Node D  │
// └─────────┘    └─────────┘    └─────────┘    └─────────┘
//      ▲              ▲              ▲
//      │              │              │
//      └──────────────┴──────────────┘
//         补偿执行 (C → B → A)
```

## 十五、错误处理与容错架构

### 15.1 错误处理策略总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Error Handling Architecture                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  错误分类:                                                               │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Transient Errors (瞬态错误)                                     │   │
│  │  • 网络超时/中断                                                 │   │
│  │  • 服务暂时不可用                                               │   │
│  │  • 限流/Rate Limit                                              │   │
│  │  策略: 重试 (Retry with Backoff)                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Permanent Errors (永久错误)                                     │   │
│  │  • 验证失败                                                     │   │
│  │  • 权限不足                                                     │   │
│  │  • 资源不存在                                                   │   │
│  │  策略: 快速失败 (Fail Fast)                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Business Errors (业务错误)                                      │   │
│  │  • 业务规则校验失败                                             │   │
│  │  • 数据不一致                                                   │   │
│  │  • 流程状态异常                                                 │   │
│  │  策略: 补偿/回滚 (Compensation)                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  System Errors (系统错误)                                        │   │
│  │  • 内存溢出                                                     │   │
│  │  • 磁盘满                                                       │   │
│  │  • 服务崩溃                                                     │   │
│  │  策略: 降级/熔断 (Circuit Breaker)                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 15.2 重试策略

```typescript
// 重试配置
interface RetryConfig {
  // 最大重试次数
  maxRetries: number

  // 初始延迟 (毫秒)
  initialDelay: number

  // 最大延迟 (毫秒)
  maxDelay: number

  // 退避策略
  backoffStrategy: 'fixed' | 'linear' | 'exponential' | 'jittered'

  // 退避因子 (用于 exponential)
  backoffFactor: number

  // 可重试错误类型
  retryableErrors: string[]

  // 重试条件函数
  retryCondition?: (error: Error) => boolean
}

// 重试策略实现
class RetryStrategy {
  async execute<T>(operation: () => Promise<T>, config: RetryConfig): Promise<T> {
    let lastError: Error
    let delay = config.initialDelay

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // 检查是否可重试
        if (!this.isRetryable(error, config)) {
          throw error
        }

        // 最后一次尝试不等待
        if (attempt === config.maxRetries) {
          break
        }

        // 计算延迟
        delay = this.calculateDelay(delay, attempt, config)

        // 等待后重试
        await this.sleep(delay)
      }
    }

    throw lastError
  }

  private calculateDelay(currentDelay: number, attempt: number, config: RetryConfig): number {
    let delay: number

    switch (config.backoffStrategy) {
      case 'fixed':
        delay = config.initialDelay
        break
      case 'linear':
        delay = config.initialDelay * (attempt + 1)
        break
      case 'exponential':
        delay = config.initialDelay * Math.pow(config.backoffFactor, attempt)
        break
      case 'jittered':
        // 指数退避 + 随机抖动
        const base = config.initialDelay * Math.pow(config.backoffFactor, attempt)
        delay = base + Math.random() * base * 0.1
        break
    }

    return Math.min(delay, config.maxDelay)
  }
}

// 重试策略时序图:
// ┌─────────┐      ┌─────────┐      ┌─────────┐
// │ Client  │      │ Service │      │  Retry  │
// └────┬────┘      └────┬────┘      │ Manager │
//      │                │           └────┬────┘
//      │  Request       │                │
//      │───────────────▶│                │
//      │                │                │
//      │  Error (500)   │                │
//      │◀───────────────│                │
//      │                │                │
//      │         Retry (delay: 1s)       │
//      │─────────────────────────────────▶
//      │                │                │
//      │  Request       │                │
//      │───────────────▶│                │
//      │                │                │
//      │  Error (503)   │                │
//      │◀───────────────│                │
//      │                │                │
//      │         Retry (delay: 2s)       │
//      │─────────────────────────────────▶
//      │                │                │
//      │  Request       │                │
//      │───────────────▶│                │
//      │                │                │
//      │  Success       │                │
//      │◀───────────────│                │
```

### 15.3 断路器模式

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Circuit Breaker Pattern                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  状态机:                                                                 │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│           ┌──────────────────────────────────────────┐                  │
│           │                                          │                  │
│           │         failure threshold reached        │                  │
│           │                                          │                  │
│           ▼                                          │                  │
│   ┌─────────────┐         timeout          ┌────────┴──────┐           │
│   │   CLOSED    │◀────────────────────────│    OPEN       │           │
│   │   (关闭)    │                          │   (打开)      │           │
│   └──────┬──────┘                          └───────┬───────┘           │
│          │                                         │                    │
│          │ success                                 │ half-open          │
│          │                                         │ request            │
│          │                                         ▼                    │
│          │                                 ┌─────────────┐              │
│          │                                 │ HALF-OPEN   │              │
│          │                                 │ (半开)       │              │
│          │                                 └──────┬──────┘              │
│          │                                        │                      │
│          │              ┌─────────────────────────┤                      │
│          │              │                         │                      │
│          │        success                   failure                      │
│          │              │                         │                      │
│          └──────────────┘                         │                      │
│                                                   │                      │
│                                                   └──────────────┐      │
│                                                                  │      │
│                                                                  ▼      │
│                                                          back to OPEN   │
│                                                                          │
│  配置参数:                                                               │
│  ─────────────────────────────────────────────────────────────────────  │
│  • failureThreshold: 触发断路的失败阈值 (默认: 5)                        │
│  • successThreshold: 恢复关闭状态的成功阈值 (默认: 3)                    │
│  • timeout: 断路器打开后的超时时间 (默认: 60s)                           │
│  • volumeThreshold: 最小请求量阈值 (默认: 10)                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

```typescript
// 断路器配置
interface CircuitBreakerConfig {
  name: string

  // 失败阈值
  failureThreshold: number

  // 成功阈值 (半开状态)
  successThreshold: number

  // 超时时间
  timeout: number

  // 最小请求量
  volumeThreshold: number

  // 状态变更回调
  onStateChange?: (from: CircuitState, to: CircuitState) => void

  // 降级函数
  fallback?: () => Promise<any>
}

// 断路器状态
type CircuitState = 'closed' | 'open' | 'half-open'

// 断路器实现
class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures: number = 0
  private successes: number = 0
  private lastFailureTime: number = 0

  async execute<T>(operation: () => Promise<T>, config: CircuitBreakerConfig): Promise<T> {
    // 检查状态
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= config.timeout) {
        this.transitionTo('half-open', config)
      } else {
        // 断路器打开，执行降级
        if (config.fallback) {
          return config.fallback()
        }
        throw new CircuitBreakerOpenError(config.name)
      }
    }

    try {
      const result = await operation()

      // 成功处理
      this.handleSuccess(config)

      return result
    } catch (error) {
      // 失败处理
      this.handleFailure(config)

      throw error
    }
  }

  private handleSuccess(config: CircuitBreakerConfig): void {
    this.failures = 0

    if (this.state === 'half-open') {
      this.successes++
      if (this.successes >= config.successThreshold) {
        this.transitionTo('closed', config)
      }
    }
  }

  private handleFailure(config: CircuitBreakerConfig): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.state === 'half-open') {
      this.transitionTo('open', config)
    } else if (this.failures >= config.failureThreshold) {
      this.transitionTo('open', config)
    }
  }

  private transitionTo(newState: CircuitState, config: CircuitBreakerConfig): void {
    const oldState = this.state
    this.state = newState

    if (newState === 'closed') {
      this.failures = 0
      this.successes = 0
    } else if (newState === 'half-open') {
      this.successes = 0
    }

    config.onStateChange?.(oldState, newState)
  }
}
```

### 15.4 降级策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Fallback/Degradation Strategy                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  降级场景:                                                               │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  1. 服务降级 (Service Degradation)                                       │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  正常: 调用 AI 服务生成完整响应                               │    │
│     │  降级: 返回预定义模板响应 / 使用缓存结果                     │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  2. 功能降级 (Feature Degradation)                                       │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  正常: 完整功能 (Schema 生成 + 实时预览 + 代码导出)          │    │
│     │  降级: 核心功能 (仅 Schema 生成)                             │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  3. 数据降级 (Data Degradation)                                          │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  正常: 实时数据                                              │    │
│     │  降级: 缓存数据 / 默认数据 / 空数据                          │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  4. 体验降级 (UX Degradation)                                            │
│     ┌─────────────────────────────────────────────────────────────┐    │
│     │  正常: 流式输出 + 实时渲染                                   │    │
│     │  降级: 批量返回 + 静态展示                                   │    │
│     └─────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

```typescript
// 降级策略配置
interface FallbackConfig {
  // 降级类型
  type: 'cache' | 'default' | 'mock' | 'custom'

  // 缓存配置
  cache?: {
    ttl: number
    key: string
  }

  // 默认值
  defaultValue?: any

  // Mock 数据
  mockData?: any

  // 自定义降级函数
  customFallback?: (context: FallbackContext) => Promise<any>

  // 降级条件
  condition: {
    errorTypes: string[]
    timeout?: number
    circuitState?: 'open' | 'half-open'
  }
}

// 降级管理器
class FallbackManager {
  private fallbacks: Map<string, FallbackConfig> = new Map()

  register(serviceName: string, config: FallbackConfig): void {
    this.fallbacks.set(serviceName, config)
  }

  async execute<T>(serviceName: string, operation: () => Promise<T>): Promise<T> {
    const config = this.fallbacks.get(serviceName)

    try {
      return await operation()
    } catch (error) {
      if (!config) {
        throw error
      }

      return this.handleFallback<T>(serviceName, config, error)
    }
  }

  private async handleFallback<T>(
    serviceName: string,
    config: FallbackConfig,
    error: Error
  ): Promise<T> {
    switch (config.type) {
      case 'cache':
        return this.getFromCache<T>(config.cache.key)

      case 'default':
        return config.defaultValue as T

      case 'mock':
        return config.mockData as T

      case 'custom':
        return config.customFallback({
          serviceName,
          error,
          timestamp: Date.now()
        }) as Promise<T>

      default:
        throw error
    }
  }
}
```

### 15.5 全局异常处理

```typescript
// 全局错误类型
enum ErrorCode {
  // 客户端错误 (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',

  // 服务端错误 (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // 业务错误
  WORKFLOW_ERROR = 'WORKFLOW_ERROR',
  AGENT_ERROR = 'AGENT_ERROR',
  LLM_ERROR = 'LLM_ERROR',
  MCP_ERROR = 'MCP_ERROR',

  // 系统错误
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  TIMEOUT = 'TIMEOUT',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED'
}

// 统一错误响应
interface ErrorResponse {
  code: ErrorCode
  message: string
  details?: Record<string, any>
  requestId: string
  timestamp: number
  stack?: string // 仅开发环境
}

// 全局异常处理器
class GlobalExceptionHandler {
  handle(error: unknown, context: RequestContext): ErrorResponse {
    const requestId = context.requestId
    const timestamp = Date.now()

    // 已知错误类型
    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
        timestamp
      }
    }

    // 验证错误
    if (error instanceof ValidationError) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: { errors: error.errors },
        requestId,
        timestamp
      }
    }

    // 网络错误
    if (error instanceof NetworkError) {
      return {
        code: ErrorCode.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable',
        requestId,
        timestamp
      }
    }

    // 未知错误
    console.error('Unhandled error:', error)
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      requestId,
      timestamp,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }
  }
}
```

### 15.6 错误监控与告警

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Error Monitoring Pipeline                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│   │  Error   │───▶│  Collect │───▶│ Aggregate│───▶│  Alert   │        │
│   │  Source  │    │  收集     │    │  聚合     │    │  告警     │        │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘        │
│        │                                                   │            │
│        │                                                   │            │
│   ┌────┴────┐                                         ┌────┴────┐      │
│   │         │                                         │         │      │
│   │ • API   │                                         │ Email   │      │
│   │ • LLM   │                                         │ Slack   │      │
│   │ • MCP   │                                         │ Webhook │      │
│   │ • Agent │                                         │ SMS     │      │
│   │         │                                         │         │      │
│   └─────────┘                                         └─────────┘      │
│                                                                          │
│   告警规则:                                                               │
│   ──────────────────────────────────────────────────────────────────── │
│   • 错误率 > 5%  → 警告                                                  │
│   • 错误率 > 10% → 严重                                                  │
│   • 单一错误 1分钟内 > 100次 → 紧急                                      │
│   • 断路器打开 → 立即通知                                                │
│   • LLM 调用失败率 > 20% → 警告                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 十六、缓存策略设计

### 16.1 多层缓存架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Multi-Layer Cache Architecture                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Layer 1: Browser Cache (浏览器缓存)                                    │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  • 静态资源 (JS/CSS/Images)                                      │   │
│   │  • Service Worker 缓存                                          │   │
│   │  • LocalStorage / IndexedDB                                     │   │
│   │  TTL: 长期 (版本化)                                              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   Layer 2: CDN Cache (CDN 缓存)                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  • 静态资源分发                                                  │   │
│   │  • API 响应缓存 (GET 请求)                                       │   │
│   │  • 边缘节点缓存                                                  │   │
│   │  TTL: 分钟 ~ 小时                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   Layer 3: Application Cache (应用缓存)                                  │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  • 内存缓存 (进程内)                                             │   │
│   │  • 分布式缓存 (Redis)                                            │   │
│   │  • 会话数据                                                      │   │
│   │  TTL: 秒 ~ 分钟                                                   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│   Layer 4: Database Cache (数据库缓存)                                   │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  • 查询缓存                                                      │   │
│   │  • 物化视图                                                      │   │
│   │  • 只读副本                                                      │   │
│   │  TTL: 分钟 ~ 小时                                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.2 缓存策略分类

```typescript
// 缓存策略类型
type CacheStrategy =
  | 'cache-first' // 优先缓存
  | 'network-first' // 优先网络
  | 'stale-while-revalidate' // 后台更新
  | 'cache-only' // 仅缓存
  | 'network-only' // 仅网络

// 缓存配置
interface CacheConfig {
  // 缓存键
  key: string

  // 策略
  strategy: CacheStrategy

  // TTL (毫秒)
  ttl: number

  // 是否启用压缩
  compress?: boolean

  // 缓存标签 (用于批量失效)
  tags?: string[]

  // 缓存条件
  condition?: (response: any) => boolean

  // 序列化器
  serializer?: {
    serialize: (data: any) => string
    deserialize: (data: string) => any
  }
}

// 缓存策略详解
// ─────────────────────────────────────────────────────────────────────────
//
// Cache-First (缓存优先)
// ┌──────────┐     ┌──────────┐     ┌──────────┐
// │ Request  │────▶│  Cache   │────▶│ Response │
// └──────────┘     └────┬─────┘     └──────────┘
//                       │ miss
//                       ▼
//                  ┌──────────┐
//                  │ Network  │
//                  └──────────┘
// 适用: 静态资源、组件元数据、配置信息
//
// Network-First (网络优先)
// ┌──────────┐     ┌──────────┐     ┌──────────┐
// │ Request  │────▶│ Network  │────▶│ Response │
// └──────────┘     └────┬─────┘     └──────────┘
//                       │ fail
//                       ▼
//                  ┌──────────┐
//                  │  Cache   │
//                  └──────────┘
// 适用: 用户数据、实时状态、动态内容
//
// Stale-While-Revalidate (后台更新)
// ┌──────────┐     ┌──────────┐     ┌──────────┐
// │ Request  │────▶│  Cache   │────▶│ Response │
// └──────────┘     └────┬─────┘     └──────────┘
//                       │
//                       ▼ background
//                  ┌──────────┐
//                  │ Network  │────▶ Update Cache
//                  └──────────┘
// 适用: 应用列表、模板列表、统计数据
```

### 16.3 缓存数据分类

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Cache Data Categories                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  静态资源缓存 (Static Assets)                                            │
│  ─────────────────────────────────────────────────────────────────────  │
│  | 数据类型        | TTL      | 策略               | 存储位置         |   │
│  |----------------|----------|-------------------|-----------------|   │
│  | JS/CSS 文件     | 1 年     | Cache-First      | Browser + CDN   |   │
│  | 图片资源        | 30 天    | Cache-First      | Browser + CDN   |   │
│  | 字体文件        | 1 年     | Cache-First      | Browser + CDN   |   │
│  | 组件元数据      | 1 小时   | SWR              | Redis           |   │
│                                                                          │
│  API 响应缓存 (API Response)                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  | 数据类型        | TTL      | 策略               | 存储位置         |   │
│  |----------------|----------|-------------------|-----------------|   │
│  | 组件列表        | 5 分钟   | SWR              | Redis           |   │
│  | 应用列表        | 1 分钟   | SWR              | Redis           |   │
│  | 模板列表        | 10 分钟  | SWR              | Redis           |   │
│  | MCP 工具列表    | 5 分钟   | Network-First    | Redis           |   │
│                                                                          │
│  LLM 响应缓存 (LLM Response)                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  | 数据类型        | TTL      | 策略               | 存储位置         |   │
│  |----------------|----------|-------------------|-----------------|   │
│  | Schema 生成     | 1 小时   | Cache-First      | Redis           |   │
│  | Embedding 结果  | 24 小时  | Cache-First      | Redis           |   │
│  | 相似查询结果    | 1 小时   | Cache-First      | Redis           |   │
│                                                                          │
│  会话数据缓存 (Session Data)                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  | 数据类型        | TTL      | 策略               | 存储位置         |   │
│  |----------------|----------|-------------------|-----------------|   │
│  | 用户会话        | 30 分钟  | Memory           | Redis           |   │
│  | 工作流状态      | 1 小时   | Memory           | Redis           |   │
│  | 执行历史        | 24 小时  | Memory           | Redis           |   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.4 缓存失效策略

```typescript
// 缓存失效触发器
interface CacheInvalidation {
  // 失效类型
  type: 'ttl' | 'manual' | 'event' | 'dependency'

  // 失效范围
  scope: 'key' | 'tag' | 'pattern' | 'all'

  // 失效配置
  config: {
    // 事件触发
    events?: string[]

    // 依赖键
    dependencies?: string[]

    // 模式匹配
    pattern?: string
  }
}

// 缓存管理器
class CacheManager {
  private cache: RedisClient
  private localCache: LRUCache<string, any>

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    // 先查本地缓存
    const local = this.localCache.get(key)
    if (local !== undefined) {
      return local
    }

    // 查 Redis
    const data = await this.cache.get(key)
    if (data) {
      const parsed = JSON.parse(data)
      // 回填本地缓存
      this.localCache.set(key, parsed)
      return parsed
    }

    return null
  }

  // 设置缓存
  async set<T>(key: string, value: T, config: CacheConfig): Promise<void> {
    const serialized = JSON.stringify(value)

    // 设置 Redis
    await this.cache.set(key, serialized, 'PX', config.ttl)

    // 设置标签关联
    if (config.tags) {
      for (const tag of config.tags) {
        await this.cache.sadd(`tag:${tag}`, key)
      }
    }

    // 设置本地缓存
    this.localCache.set(key, value, { ttl: config.ttl })
  }

  // 通过标签失效
  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.cache.smembers(`tag:${tag}`)

    // 批量删除
    if (keys.length > 0) {
      await this.cache.del(...keys)
      await this.cache.del(`tag:${tag}`)

      // 清理本地缓存
      for (const key of keys) {
        this.localCache.delete(key)
      }
    }
  }

  // 模式匹配失效
  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await this.cache.keys(pattern)

    if (keys.length > 0) {
      await this.cache.del(...keys)

      for (const key of keys) {
        this.localCache.delete(key)
      }
    }
  }
}
```

### 16.5 LLM 响应缓存

```typescript
// LLM 缓存键生成
interface LLMCacheKey {
  // 模型标识
  model: string

  // 提示词哈希
  promptHash: string

  // 参数哈希
  paramsHash: string

  // 上下文哈希 (可选)
  contextHash?: string
}

// LLM 缓存管理
class LLMCacheManager {
  // 生成缓存键
  generateCacheKey(config: LLMCacheKey): string {
    const parts = ['llm', config.model, config.promptHash, config.paramsHash]

    if (config.contextHash) {
      parts.push(config.contextHash)
    }

    return parts.join(':')
  }

  // 计算 Prompt 哈希
  hashPrompt(prompt: string): string {
    // 标准化 prompt (去除空白、统一格式)
    const normalized = prompt.trim().replace(/\s+/g, ' ')
    return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16)
  }

  // 缓存 LLM 响应
  async cacheResponse(
    key: string,
    response: LLMResponse,
    ttl: number = 3600000 // 1 小时
  ): Promise<void> {
    await this.cache.set(key, JSON.stringify(response), 'PX', ttl)
  }

  // 获取缓存的响应
  async getCachedResponse(key: string): Promise<LLMResponse | null> {
    const data = await this.cache.get(key)
    return data ? JSON.parse(data) : null
  }
}
```

## 十七、测试策略

### 17.1 测试金字塔

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Test Pyramid                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         ┌─────────────────┐                             │
│                         │   E2E Tests     │                             │
│                         │   (端到端测试)   │                             │
│                         │   ~10%          │                             │
│                         └────────┬────────┘                             │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    Integration Tests      │                        │
│                    │    (集成测试)              │                        │
│                    │    ~20%                   │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│           ┌──────────────────────┴──────────────────────┐              │
│           │              Unit Tests                      │              │
│           │              (单元测试)                       │              │
│           │              ~70%                            │              │
│           └─────────────────────────────────────────────┘              │
│                                                                          │
│   测试类型说明:                                                          │
│   ──────────────────────────────────────────────────────────────────── │
│   • E2E Tests: 完整用户流程测试，模拟真实用户行为                         │
│   • Integration Tests: 模块间协作测试，API 集成测试                       │
│   • Unit Tests: 单个函数/组件测试，快速反馈                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 17.2 单元测试规范

```typescript
// 单元测试示例 - 表达式求值器
import { describe, it, expect, beforeEach } from 'vitest'
import { ExpressionEvaluator } from '@smart-link/core/evaluator'

describe('ExpressionEvaluator', () => {
  let evaluator: ExpressionEvaluator

  beforeEach(() => {
    evaluator = new ExpressionEvaluator()
  })

  describe('compile', () => {
    it('should compile simple expression', () => {
      const fn = evaluator.compile('state.count + 1')
      expect(typeof fn).toBe('function')
    })

    it('should throw on invalid expression', () => {
      expect(() => evaluator.compile('invalid..syntax')).toThrow()
    })
  })

  describe('evaluate', () => {
    it('should evaluate state reference', () => {
      const result = evaluator.evaluate('state.user.name', {
        state: { user: { name: 'John' } }
      })
      expect(result).toBe('John')
    })

    it('should evaluate computed expression', () => {
      const result = evaluator.evaluate('state.items.length > 0', {
        state: { items: [1, 2, 3] }
      })
      expect(result).toBe(true)
    })

    it('should handle null/undefined gracefully', () => {
      const result = evaluator.evaluate('state.missing?.value', {
        state: {}
      })
      expect(result).toBeUndefined()
    })
  })

  describe('evaluateBinding', () => {
    it('should handle expression type binding', () => {
      const result = evaluator.evaluateBinding(
        { type: 'expression', value: 'state.a + state.b' },
        { state: { a: 1, b: 2 } }
      )
      expect(result).toBe(3)
    })

    it('should handle state type binding', () => {
      const result = evaluator.evaluateBinding(
        { type: 'state', value: 'user.profile.age' },
        { state: { user: { profile: { age: 25 } } } }
      )
      expect(result).toBe(25)
    })
  })
})
```

### 17.3 集成测试规范

```typescript
// 集成测试示例 - API 端点测试
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '@/app'
import { setupTestDB, teardownTestDB } from '@/test/helpers'

describe('Applications API', () => {
  let app: Express.Application

  beforeAll(async () => {
    await setupTestDB()
    app = await createApp()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  describe('GET /api/v1/applications', () => {
    it('should return applications list', async () => {
      const response = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', 'Bearer test-token')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
    })

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/applications?status=published')
        .set('Authorization', 'Bearer test-token')
        .expect(200)

      response.body.data.forEach((app: any) => {
        expect(app.status).toBe('published')
      })
    })

    it('should return 401 without auth', async () => {
      await request(app).get('/api/v1/applications').expect(401)
    })
  })

  describe('POST /api/v1/applications', () => {
    it('should create application', async () => {
      const response = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer test-token')
        .send({
          name: 'Test App',
          description: 'Test Description'
        })
        .expect(201)

      expect(response.body.name).toBe('Test App')
    })

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(400)
    })
  })
})
```

### 17.4 E2E 测试规范

```typescript
// E2E 测试示例 - 应用创建流程
import { test, expect } from '@playwright/test'

test.describe('Application Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/app')
  })

  test('should create a new application', async ({ page }) => {
    // 导航到应用列表
    await page.click('[data-testid="nav-applications"]')
    await expect(page).toHaveURL('/app/applications')

    // 点击创建按钮
    await page.click('[data-testid="create-application"]')

    // 填写表单
    await page.fill('[name="name"]', 'E2E Test App')
    await page.fill('[name="description"]', 'Created by E2E test')

    // 提交表单
    await page.click('button[type="submit"]')

    // 验证创建成功
    await expect(page.locator('.toast-success')).toBeVisible()
    await expect(page.locator('h1')).toContainText('E2E Test App')
  })

  test('should design application workflow', async ({ page }) => {
    // 打开应用设计页
    await page.goto('/app/applications/design/app-123')

    // 拖拽 LLM 节点
    const llmNode = page.locator('[data-testid="node-llm"]')
    const canvas = page.locator('[data-testid="design-canvas"]')

    await llmNode.dragTo(canvas)

    // 验证节点已添加
    await expect(canvas.locator('.workflow-node')).toHaveCount(1)

    // 配置节点
    await canvas.locator('.workflow-node').click()
    await page.fill('[name="prompt"]', 'Generate a user profile page')
    await page.click('[data-testid="save-config"]')

    // 验证保存成功
    await expect(page.locator('.toast-success')).toBeVisible()
  })
})
```

### 17.5 测试覆盖率目标

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Test Coverage Targets                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  模块覆盖率要求:                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Core Packages (核心包):                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  @smart-link/core                                                │   │
│  │  • Statements: ≥ 90%                                             │   │
│  │  • Branches: ≥ 85%                                               │   │
│  │  • Functions: ≥ 95%                                              │   │
│  │  • Lines: ≥ 90%                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  UI Components (UI 组件):                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  @smart-link/ui                                                  │   │
│  │  • Statements: ≥ 80%                                             │   │
│  │  • Branches: ≥ 75%                                               │   │
│  │  • Functions: ≥ 85%                                              │   │
│  │  • Lines: ≥ 80%                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Application (应用层):                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  app/src                                                         │   │
│  │  • Statements: ≥ 70%                                             │   │
│  │  • Branches: ≥ 65%                                               │   │
│  │  • Functions: ≥ 75%                                              │   │
│  │  • Lines: ≥ 70%                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  关键路径覆盖:                                                            │
│  ─────────────────────────────────────────────────────────────────────  │
│  • 用户认证流程: 100%                                                    │
│  • Schema 渲染流程: 100%                                                 │
│  • 工作流执行流程: 100%                                                  │
│  • API 错误处理: 100%                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 17.6 测试工具配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*', '**/types/**'],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 75,
        lines: 70
      }
    },
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}']
  }
})

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

## 十八、监控与可观测性

### 18.1 监控架构总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Observability Architecture                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Instrumentation Layer                        │   │
│  │  • OpenTelemetry SDK                                            │   │
│  │  • Auto-instrumentation (HTTP, DB, LLM)                         │   │
│  │  • Custom instrumentation                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Collection Layer                             │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                   │   │
│  │  │  Metrics  │  │   Logs    │  │  Traces   │                   │   │
│  │  │  指标     │  │   日志     │  │  链路     │                   │   │
│  │  └───────────┘  └───────────┘  └───────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Storage Layer                                │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                   │   │
│  │  │Prometheus │  │Elasticsearch│ │  Tempo/   │                   │   │
│  │  │           │  │           │  │  Jaeger   │                   │   │
│  │  └───────────┘  └───────────┘  └───────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Visualization Layer                          │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                   │   │
│  │  │ Grafana   │  │  Kibana   │  │  Jaeger   │                   │   │
│  │  │  Dashboards│ │  Queries  │  │   UI      │                   │   │
│  │  └───────────┘  └───────────┘  └───────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 18.2 核心指标 (Metrics)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Core Metrics                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  应用层指标 (Application Metrics)                                        │
│  ─────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  http_requests_total                                             │   │
│  │  • Labels: method, path, status_code, tenant_id                 │   │
│  │  • Type: Counter                                                 │   │
│  │                                                                  │   │
│  │  http_request_duration_seconds                                   │   │
│  │  • Labels: method, path                                          │   │
│  │  • Type: Histogram (buckets: 0.01, 0.05, 0.1, 0.5, 1, 5, 10)   │   │
│  │                                                                  │   │
│  │  http_requests_in_flight                                         │   │
│  │  • Labels: method                                                │   │
│  │  • Type: Gauge                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  LLM 调用指标 (LLM Metrics)                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  llm_calls_total                                                │   │
│  │  • Labels: model, provider, status                             │   │
│  │  • Type: Counter                                                 │   │
│  │                                                                  │   │
│  │  llm_call_duration_seconds                                       │   │
│  │  • Labels: model, provider                                       │   │
│  │  • Type: Histogram                                               │   │
│  │                                                                  │   │
│  │  llm_tokens_total                                                │   │
│  │  • Labels: model, type (prompt/completion)                       │   │
│  │  • Type: Counter                                                 │   │
│  │                                                                  │   │
│  │  llm_calls_failed_total                                          │   │
│  │  • Labels: model, error_type                                     │   │
│  │  • Type: Counter                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  工作流执行指标 (Workflow Metrics)                                       │
│  ─────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  workflow_executions_total                                       │   │
│  │  • Labels: workflow_id, status                                  │   │
│  │  • Type: Counter                                                 │   │
│  │                                                                  │   │
│  │  workflow_execution_duration_seconds                             │   │
│  │  • Labels: workflow_id                                           │   │
│  │  • Type: Histogram                                               │   │
│  │                                                                  │   │
│  │  workflow_node_executions_total                                  │   │
│  │  • Labels: workflow_id, node_type, status                        │   │
│  │  • Type: Counter                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  MCP 调用指标 (MCP Metrics)                                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  mcp_tool_calls_total                                            │   │
│  │  • Labels: server_name, tool_name, status                        │   │
│  │  • Type: Counter                                                 │   │
│  │                                                                  │   │
│  │  mcp_tool_call_duration_seconds                                  │   │
│  │  • Labels: server_name, tool_name                                │   │
│  │  • Type: Histogram                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 18.3 指标收集配置

```typescript
// Prometheus 指标定义
import { Registry, Counter, Histogram, Gauge } from 'prom-client'

const register = new Registry()

// HTTP 请求指标
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  registers: [register],
  labelNames: ['method', 'path', 'status_code', 'tenant_id'] as const
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  registers: [register],
  labelNames: ['method', 'path'] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10]
})

// LLM 调用指标
export const llmCallsTotal = new Counter({
  name: 'llm_calls_total',
  help: 'Total number of LLM calls',
  registers: [register],
  labelNames: ['model', 'provider', 'status'] as const
})

export const llmCallDuration = new Histogram({
  name: 'llm_call_duration_seconds',
  help: 'LLM call duration in seconds',
  registers: [register],
  labelNames: ['model', 'provider'] as const,
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
})

export const llmTokensTotal = new Counter({
  name: 'llm_tokens_total',
  help: 'Total number of tokens used',
  registers: [register],
  labelNames: ['model', 'type'] as const
})

// 工作流执行指标
export const workflowExecutionsTotal = new Counter({
  name: 'workflow_executions_total',
  help: 'Total number of workflow executions',
  registers: [register],
  labelNames: ['workflow_id', 'status'] as const
})

export const workflowExecutionDuration = new Histogram({
  name: 'workflow_execution_duration_seconds',
  help: 'Workflow execution duration in seconds',
  registers: [register],
  labelNames: ['workflow_id'] as const,
  buckets: [1, 5, 10, 30, 60, 300, 600]
})

// 中间件 - 自动收集 HTTP 指标
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000

    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path || req.path,
      status_code: res.statusCode,
      tenant_id: (req as any).tenantId
    })

    httpRequestDuration.observe(
      {
        method: req.method,
        path: req.route?.path || req.path
      },
      duration
    )
  })

  next()
}
```

### 18.4 分布式链路追踪

```typescript
// OpenTelemetry 配置
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

export function setupTracing() {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'smart-link-platform',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV
    })
  })

  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  })

  provider.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
      maxQueueSize: 1000,
      maxExportBatchSize: 64,
      scheduledDelayMillis: 5000
    })
  )

  provider.register()

  return provider
}
```

### 18.5 日志规范

```typescript
// 结构化日志配置
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'ISO8601' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'smart-link-platform',
    version: '1.0.0'
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

// 日志上下文
interface LogContext {
  requestId: string
  tenantId?: string
  userId?: string
  workflowId?: string
  executionId?: string
}
```

## 十九、国际化设计

### 19.1 国际化架构

```typescript
// i18n 配置
interface I18nConfig {
  // 支持的语言
  locales: string[]

  // 默认语言
  defaultLocale: string

  // 语言检测
  detection: {
    order: string[] // 'querystring' | 'cookie' | 'localStorage' | 'navigator'
    caches: string[]
  }

  // 懒加载
  lazyLoad: boolean

  // 回退语言
  fallbackLng: string | false
}

// 多语言资源
interface LocaleResource {
  common: {
    loading: string
    save: string
    cancel: string
    delete: string
    edit: string
    confirm: string
    search: string
    noData: string
  }

  nav: {
    home: string
    applications: string
    resources: string
    tools: string
    explore: string
    settings: string
  }

  application: {
    create: string
    edit: string
    delete: string
    publish: string
    unpublish: string
    design: string
  }

  // ... 更多模块
}
```

### 19.2 翻译文件结构

```
locales/
├── en-US.json
├── zh-CN.json
└── ja-JP.json

// en-US.json 示例
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "application": {
    "create": "Create Application",
    "name": "Application Name",
    "description": "Description"
  }
}
```

## 二十、插件系统架构

### 20.1 插件类型

```typescript
// 插件基类
abstract class Plugin {
  abstract id: string
  abstract name: string
  abstract version: string

  // 生命周期
  async install(context: PluginContext): Promise<void> {}
  async uninstall(): Promise<void> {}
  async enable(): Promise<void> {}
  async disable(): Promise<void> {}
}

// 插件类型
type PluginType =
  | 'component' // UI 组件插件
  | 'tool' // 工具插件
  | 'theme' // 主题插件
  | 'adapter' // 适配器插件 (LLM/MCP)
  | 'middleware' // 中间件插件
```

## 二十一、API 版本策略

### 21.1 版本控制方式

```
API Versioning Strategies
──────────────────────────────────────────────────────────────────────────

1. URL Path Versioning (推荐)
   /api/v1/applications
   /api/v2/applications

2. Query Parameter Versioning
   /api/applications?version=1

3. Header Versioning
   Accept: application/vnd.smart-link.v1+json

4. Content Negotiation
   Accept: application/json
   X-API-Version: 1
```

### 21.2 版本兼容性

```typescript
// API 版本配置
interface ApiVersionConfig {
  version: string
  path: string
  status: 'current' | 'stable' | 'deprecated' | 'sunset'
  sunsetDate?: Date
  migrationGuide?: string
}
```

---

_文档版本：3.0_
_更新日期：2026-03-05_
_文档状态：技术架构设计完成_

_本文档包含 21 个完整章节，涵盖企业级 Agent 平台的完整技术架构设计_
