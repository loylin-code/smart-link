# SmartLink - AI驱动的页面编排平台

## 项目简介

SmartLink是一个AI驱动的前端组件自动编排系统，用户通过自然语言描述需求，AI自动生成页面结构（Schema JSON），渲染引擎将Schema渲染为可交互的前端页面，同时提供可视化编排器进行拖拽编辑。

## 核心特性

- 🤖 **AI驱动** - 自然语言描述需求，AI自动生成页面结构
- 🧩 **组件丰富** - 提供基础组件、表单组件、布局组件、业务组件
- 🎨 **可视化编排** - 拖拽式组件编辑，所见即所得
- 📦 **Schema驱动** - JSON Schema描述页面，支持版本管理和协作
- 🔧 **TypeScript** - 完整的TypeScript支持

## 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.0+
- **UI组件库**: @smart-link/ui (自研组件库)
- **开发语言**: TypeScript 5.0+
- **状态管理**: Pinia
- **路由管理**: Vue Router 4.x
- **样式预处理**: Sass
- **包管理**: pnpm monorepo

## 项目结构

```
smart-link/
├── packages/                    # 可发布到 npm 的包
│   ├── ui/                      # @smart-link/ui - UI组件库
│   ├── core/                    # @smart-link/core - 页面渲染引擎
│   ├── hooks/                   # @smart-link/hooks - Vue组合式函数
│   ├── theme/                   # @smart-link/theme - 主题样式
│   └── shared/                  # @smart-link/shared - 共享工具和类型
├── app/                         # 主应用
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   │   └── orchestrator/    # 可视化编排器组件
│   │   │       ├── ComponentLibrary.vue    # 组件库面板
│   │   │       ├── DesignCanvas.vue        # 设计画布
│   │   │       ├── RenderableNode.vue      # 可渲染节点
│   │   │       ├── PropsPanel.vue          # 属性面板
│   │   │       └── PreviewContainer.vue    # 预览容器
│   │   ├── views/              # 页面视图
│   │   │   └── application/
│   │   │       └── AppOrchestration.vue    # 应用编排页面
│   │   ├── store/             # 状态管理
│   │   │   └── modules/
│   │   │       └── orchestrator.ts         # 编排器Store
│   │   └── types/             # 类型定义
│   └── ...
├── play/                        # 组件调试环境
├── docs/                        # VitePress 文档站点
└── internal/build/              # Rollup 构建配置
```

## 核心模块

### 1. @smart-link/core - 渲染引擎

渲染引擎是整个系统的核心，负责将Schema JSON渲染为Vue组件树。

**核心能力**:

- **Schema解析** - 解析PageSchema结构
- **组件注册** - 动态注册和管理组件
- **表达式求值** - 支持表达式绑定和状态计算
- **状态管理** - 运行时状态管理
- **事件处理** - 内置动作和自定义事件
- **指令处理** - v-if、v-for、v-model等指令

**核心API**:

```typescript
import {
  createRenderer,
  createComponentRegistry,
  createExpressionEvaluator,
  createStateManager,
  createEventProcessor,
  createDirectiveProcessor
} from '@smart-link/core'

// 创建渲染器
const renderer = createRenderer({
  registry,
  state,
  evaluator,
  events,
  directives
})

// 渲染页面
const vnode = renderer.renderPage(schema, context)
```

### 2. @smart-link/shared - 共享模块

提供组件元数据定义和共享工具。

```typescript
import { COMPONENT_META_LIST, type ComponentMeta } from '@smart-link/shared'

// 组件元数据示例
const meta: ComponentMeta = {
  type: 'SlButton',
  name: '按钮',
  category: 'basic',
  description: '基础按钮组件',
  icon: 'button',
  props: [
    { name: 'type', type: 'string', default: 'default', description: '按钮类型' },
    { name: 'size', type: 'string', default: 'medium', description: '按钮尺寸' }
  ],
  events: [{ name: 'click', params: 'Event', description: '点击事件' }],
  slots: [{ name: 'default', description: '默认插槽' }]
}
```

### 3. @smart-link/ui - UI组件库

自研Vue 3组件库，提供丰富的UI组件。

### 4. 可视化编排器

提供拖拽式可视化编辑能力。

**核心组件**:

- `ComponentLibrary` - 组件库面板，展示可用组件
- `DesignCanvas` - 设计画布，组件拖放目标
- `RenderableNode` - 可渲染节点，递归渲染组件树
- `PropsPanel` - 属性面板，编辑组件属性
- `PreviewContainer` - 预览容器，实时预览渲染结果

## 开发指南

### 环境要求

- Node.js >= 18
- pnpm >= 9.0

### 安装依赖

```bash
pnpm install
```

### 开发命令

```bash
# 启动主应用
pnpm dev

# 启动组件调试环境
pnpm play

# 启动文档站点
pnpm docs

# 构建所有项目
pnpm build

# 仅构建 packages
pnpm build:lib

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 包说明

| 包名               | 说明               |
| ------------------ | ------------------ |
| @smart-link/ui     | Vue 3 UI 组件库    |
| @smart-link/core   | 页面渲染引擎       |
| @smart-link/hooks  | Vue 组合式函数     |
| @smart-link/theme  | 主题样式           |
| @smart-link/shared | 共享工具函数和类型 |

## License

MIT
