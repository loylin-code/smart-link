# SmartLink Enterprise Agent Platform

<div align="center">

**智能企业级 Agent 应用管理平台**

基于大模型以及确定性的组件、数据模型、MCP、Skills 等进行设计、编排 Agent 应用，发布应用支持企业级使用场景

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange.svg)](https://pnpm.io/)
[![Vue](https://img.shields.io/badge/vue-3.4-brightgreen.svg)](https://vuejs.org/)

</div>

---

## ✨ 核心特性

| 特性                   | 描述                                               |
| ---------------------- | -------------------------------------------------- |
| 🤖 **大模型驱动**      | 基于 LLM 理解自然语言需求，自动生成 Agent 编排流程 |
| 🔧 **MCP 协议集成**    | Model Context Protocol 工具生态无缝接入            |
| 🧩 **Skills 能力复用** | 可组合的技能模块，支持复杂业务场景                 |
| 🎨 **可视化编排**      | 拖拽式 Agent 流程设计，所见即所得                  |
| 🏢 **企业级部署**      | 多租户架构、高并发支持、安全合规                   |
| 📦 **Schema 驱动渲染** | LLM 生成前端页面 JSON，渲染器实时展示              |

## 🏗️ 架构概览

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

### 调用流程 (OpenClaw-like)

```
Client (Web/Mobile) → Gateway 网关 → Agent Proxy 分发 → Agent 逻辑处理 → LLM 生成 JSON + 数据 → 前端渲染器展示
```

## 📁 项目结构

```
smart-link/
├── packages/                    # 可发布到 npm 的包
│   ├── core/                    # @smart-link/core - 页面渲染引擎
│   │   └── src/
│   │       ├── types/           # 核心类型定义
│   │       ├── evaluator/       # 表达式求值器
│   │       ├── state/           # 状态管理器
│   │       ├── registry/        # 组件注册表
│   │       ├── events/          # 事件处理器
│   │       ├── directives/      # 指令处理器
│   │       └── renderer/        # 核心渲染器
│   │
│   ├── ui/                      # @smart-link/ui - UI组件库
│   │   └── src/components/
│   │       ├── basic/           # 基础组件 (Button, Icon, Tag...)
│   │       ├── form/            # 表单组件 (Input, Select...)
│   │       ├── layout/          # 布局组件 (Container, Row...)
│   │       └── feedback/        # 反馈组件 (Modal, Message...)
│   │
│   ├── shared/                  # @smart-link/shared - 共享模块
│   │   └── src/
│   │       ├── types/           # 共享类型
│   │       ├── constants/       # 组件元数据定义
│   │       └── utils/           # 工具函数
│   │
│   ├── hooks/                   # @smart-link/hooks - Vue组合式函数
│   └── theme/                   # @smart-link/theme - 主题样式
│
├── app/                         # 主应用
│   └── src/
│       ├── services/            # 服务层
│       │   ├── ai.ts            # AI服务 (OpenAI/Claude/Ollama)
│       │   └── code-export.ts   # 代码导出服务
│       ├── store/modules/       # 状态管理
│       │   ├── orchestrator.ts  # 编排器状态
│       │   └── ai.ts            # AI服务状态
│       ├── components/          # 组件
│       │   ├── orchestrator/    # 编排器组件
│       │   └── ai/              # AI组件
│       └── views/               # 页面视图
│           ├── application/     # 应用管理
│           ├── resource/        # 资源管理 (组件/MCP/Skills)
│           ├── explore/         # 探索中心
│           └── welcome/         # 欢迎页
│
├── play/                        # 组件调试环境
├── docs/                        # VitePress 文档站点
└── internal/build/              # Rollup 构建配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9.0

### 安装

```bash
# 克隆项目
git clone https://github.com/loylin-code/smart-link.git
cd smart-link

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动主应用
pnpm dev

# 启动组件调试环境
pnpm play

# 启动文档站点
pnpm docs
```

### 构建

```bash
# 构建所有项目
pnpm build

# 仅构建 packages
pnpm build:lib
```

## 📦 包说明

| 包名               | 版本  | 说明                            |
| ------------------ | ----- | ------------------------------- |
| @smart-link/core   | 1.0.0 | 页面渲染引擎，Schema到VNode转换 |
| @smart-link/ui     | 1.0.0 | Vue 3 UI组件库                  |
| @smart-link/shared | 1.0.0 | 共享类型、组件元数据、工具函数  |
| @smart-link/hooks  | 1.0.0 | Vue组合式函数                   |
| @smart-link/theme  | 1.0.0 | 主题样式                        |

## 🧩 功能模块

### 资源管理

- **组件管理**：前端组件的注册、版本管理、分类预览
- **数据模型**：统一的数据模型定义与验证机制

### 工具管理

- **MCP 管理**：Model Context Protocol 服务器配置与健康检查
- **Skills 管理**：可组合技能模块的定义与编排
- **模型管理**：LLM 模型配置与调优

### 应用管理

- **应用列表**：应用卡片展示、搜索筛选、分类标签
- **应用设计**：可视化流程画布、节点配置、变量管理
- **应用发布**：版本管理、环境配置、监控告警

### 探索中心

- **发现**：热门应用、最新上线、趋势分析
- **模板**：行业模板、功能模板、场景模板
- **推荐**：智能推荐、个性化推荐

## 🧩 组件库

### 基础组件

`Button` `Icon` `Tag` `Badge` `Avatar` `Divider` `Link` `Image` `Typography`

### 表单组件

`Input` `Select` `Checkbox` `Radio` `Switch` `Form` `FormItem`

### 布局组件

`Container` `Row` `Col` `Card` `Space` `Drawer` `Modal` `Tooltip`

### 反馈组件

`Message`

## 🎯 核心功能

### 1. Agent 编排

```typescript
// 创建 Agent 应用
const agent = {
  id: 'agent-001',
  name: '智能客服',
  workflow: {
    nodes: [
      { type: 'input', config: { ... } },
      { type: 'llm', config: { model: 'gpt-4o', prompt: '...' } },
      { type: 'tool', config: { mcp: 'database-query' } },
      { type: 'output', config: { renderer: 'page-schema' } }
    ]
  }
}
```

### 2. MCP 集成

```typescript
// 配置 MCP 服务器
const mcpServer = {
  name: 'database-tools',
  transport: 'stdio',
  command: 'mcp-server-postgres',
  capabilities: ['query', 'insert', 'update']
}
```

### 3. 渲染引擎

```typescript
import { createRenderer, createComponentRegistry } from '@smart-link/core'

// 创建渲染器
const renderer = createRenderer({
  registry: createComponentRegistry(),
  state: createStateManager()
})

// 渲染 LLM 生成的 Schema
const vnode = renderer.renderPage(schema, context)
```

## 🔧 技术栈

| 类别     | 技术                       |
| -------- | -------------------------- |
| 框架     | Vue 3.4+ (Composition API) |
| 构建     | Vite 5.0 + Rollup          |
| 状态管理 | Pinia (支持持久化)         |
| 路由     | Vue Router 4.x             |
| 类型     | TypeScript 5.0+            |
| 样式     | SCSS                       |
| 文档     | VitePress                  |
| 包管理   | pnpm monorepo              |
| CI/CD    | Turbo                      |

## 📄 核心数据模型

```typescript
// Agent 定义
interface Agent {
  id: string
  name: string
  category: 'conversational' | 'workflow' | 'automation'
  workflow: WorkflowDefinition
  status: 'draft' | 'published' | 'deprecated'
}

// Skill 定义
interface Skill {
  id: string
  name: string
  category: 'analytics' | 'processing' | 'invoker'
  inputSchema: JSONSchema
  outputSchema: JSONSchema
}

// MCP 服务器
interface MCPServer {
  id: string
  name: string
  transport: 'stdio' | 'sse' | 'http'
  capabilities: MCPCapability[]
}
```

## 🗺️ 开发路线

### 已完成 ✅

- [x] 核心渲染引擎 (@smart-link/core)
- [x] UI组件库 (@smart-link/ui)
- [x] 可视化编排器
- [x] AI Schema 生成集成
- [x] 代码导出功能
- [x] White-Blue 主题设计规范

### 进行中 🚧

- [ ] MCP 协议集成
- [ ] Skills 管理模块
- [ ] Agent 编排器

### 计划中 📋

- [ ] 多租户支持
- [ ] WebSocket 实时通信
- [ ] 企业级权限管理
- [ ] 监控与告警

## 📜 License

[MIT](LICENSE) © 2026 SmartLink

---

<div align="center">

**Made with ❤️ by SmartLink Team**

</div>
