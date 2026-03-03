# SmartLink

AI驱动的页面编排平台 - 基于大模型的前端组件自动编排系统

## 特性

- 🤖 **AI驱动** - 自然语言描述需求，AI自动生成页面结构
- 🧩 **组件丰富** - 提供丰富的基础组件、表单组件、业务组件
- 📦 **Monorepo** - 采用 pnpm monorepo 架构，包独立发布
- 🎨 **主题定制** - 支持 SCSS 变量自定义主题
- 🔧 **TypeScript** - 完整的 TypeScript 支持

## 项目结构

```
smart-link/
├── packages/                    # 可发布到 npm 的包
│   ├── ui/                      # @smart-link/ui - 组件库
│   ├── core/                    # @smart-link/core - 页面编排引擎
│   ├── hooks/                   # @smart-link/hooks - 组合式函数
│   ├── theme/                   # @smart-link/theme - 主题样式
│   └── shared/                  # @smart-link/shared - 共享工具
├── app/                         # 主应用
├── play/                        # 组件调试环境
├── docs/                        # VitePress 文档站点
└── internal/build/              # Rollup 构建配置
```

## 开发

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
| @smart-link/core   | 页面编排引擎       |
| @smart-link/hooks  | Vue 组合式函数     |
| @smart-link/theme  | 主题样式           |
| @smart-link/shared | 共享工具函数和类型 |

## 技术栈

- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- VitePress
- Rollup

## License

MIT
