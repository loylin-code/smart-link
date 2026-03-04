# SmartLink

<div align="center">

**AI驱动的前端页面编排平台**

通过自然语言描述需求，AI自动生成页面结构，可视化编排器实时编辑预览

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0-orange.svg)](https://pnpm.io/)
[![Vue](https://img.shields.io/badge/vue-3.4-brightgreen.svg)](https://vuejs.org/)

</div>

---

## ✨ 核心特性

| 特性              | 描述                                   |
| ----------------- | -------------------------------------- |
| 🤖 **AI驱动**     | 自然语言描述需求，AI自动生成页面Schema |
| 🎨 **可视化编排** | 拖拽式组件编辑，所见即所得             |
| 📦 **Schema驱动** | JSON Schema描述页面，支持版本管理      |
| 🔄 **实时预览**   | 设计态与运行态无缝切换                 |
| 📤 **代码导出**   | 支持导出Vue/React/HTML代码             |
| 🔧 **TypeScript** | 完整的类型支持                         |

## 🏗️ 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        SmartLink Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  AI Service │    │  Orchestrator│   │   Export    │        │
│  │             │    │              │    │   Service   │        │
│  │ • OpenAI    │    │ • Drag&Drop  │    │             │        │
│  │ • Claude    │───▶│ • Props Edit │───▶│ • Vue SFC   │        │
│  │ • Ollama    │    │ • Style Edit │    │ • React JSX │        │
│  └─────────────┘    │ • Event Bind │    │ • HTML      │        │
│                     └─────────────┘    └─────────────┘        │
│                            │                                     │
│                            ▼                                     │
│                   ┌─────────────────┐                          │
│                   │  @smart-link/core │                          │
│                   │                   │                          │
│                   │  ┌─────────────┐  │                          │
│                   │  │  Renderer   │  │                          │
│                   │  │  Registry   │  │                          │
│                   │  │  Evaluator  │  │                          │
│                   │  │  State Mgr  │  │                          │
│                   │  │  Events     │  │                          │
│                   │  │  Directives │  │                          │
│                   │  └─────────────┘  │                          │
│                   └─────────────────┘                          │
│                            │                                     │
│                            ▼                                     │
│                   ┌─────────────────┐                          │
│                   │   @smart-link/ui  │                          │
│                   │   Component Library│                          │
│                   └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
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
│       ├── components/
│       │   ├── orchestrator/    # 编排器组件
│       │   │   ├── ComponentLibrary.vue
│       │   │   ├── DesignCanvas.vue
│       │   │   ├── RenderableNode.vue
│       │   │   ├── PropsPanel.vue
│       │   │   └── PreviewContainer.vue
│       │   └── ai/
│       │       └── AIChatPanel.vue
│       └── views/
│           └── application/
│               └── AppOrchestration.vue
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

### 1. AI Schema 生成

```typescript
import { aiService } from '@/services/ai'

// 配置AI服务
aiService.updateConfig({
  provider: 'openai',
  apiKey: 'your-api-key',
  model: 'gpt-4o'
})

// 生成页面Schema
const result = await aiService.generateSchema('创建一个用户登录表单')
if (result.success && result.schema) {
  // 使用生成的Schema
}
```

### 2. 渲染引擎

```typescript
import { createRenderer, createComponentRegistry, createStateManager } from '@smart-link/core'

// 创建渲染器
const renderer = createRenderer({
  registry: createComponentRegistry(),
  state: createStateManager()
  // ...
})

// 渲染页面
const vnode = renderer.renderPage(schema, context)
```

### 3. 代码导出

```typescript
import { codeExportService } from '@/services/code-export'

// 导出为Vue SFC
const result = codeExportService.export(schema, {
  format: 'vue-setup',
  componentName: 'LoginPage',
  includeStyle: true
})

console.log(result.code) // Vue SFC代码
console.log(result.filename) // 'LoginPage.vue'
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

## 📄 核心类型

```typescript
// 页面Schema
interface PageSchema {
  id: string
  version: string
  root: ComponentNode
  styles?: StyleDefinition[]
  scripts?: ScriptDefinition[]
}

// 组件节点
interface ComponentNode {
  id: string
  type: string
  props?: PropConfig
  style?: StyleConfig
  events?: EventBinding[]
  children?: ComponentNode[]
}

// 事件绑定
interface EventBinding {
  event: string
  handler: EventHandler
}
```

## 🗺️ 开发路线

### 已完成 ✅

- [x] 核心渲染引擎 (@smart-link/core)
- [x] UI组件库 (@smart-link/ui)
- [x] 可视化编排器
- [x] AI Schema生成集成
- [x] 代码导出功能
- [x] 属性/样式/事件编辑器

### 进行中 🚧

- [ ] 完善拖拽排序功能
- [ ] 真实组件渲染预览
- [ ] 更多AI模型支持

### 计划中 📋

- [ ] 协作编辑
- [ ] 版本历史管理
- [ ] 单元测试覆盖
- [ ] 国际化支持

## 📜 License

[MIT](LICENSE) © 2024 SmartLink

---

<div align="center">

**Made with ❤️ by SmartLink Team**

</div>
