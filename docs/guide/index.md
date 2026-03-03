# 介绍

SmartLink 是一个基于 Vue 3 的 AI 驱动页面编排平台，让你可以通过自然语言描述需求，AI 自动生成页面。

## 特性

- 🤖 **AI驱动** - 自然语言描述需求，AI自动生成页面结构
- 🧩 **组件丰富** - 提供丰富的基础组件、表单组件、业务组件
- 📦 **Monorepo** - 采用 pnpm monorepo 架构，包独立发布
- 🎨 **主题定制** - 支持 SCSS 变量自定义主题
- 🔧 **TypeScript** - 完整的 TypeScript 支持

## 架构

```
smart-link/
├── packages/           # 可发布到 npm 的包
│   ├── ui/            # @smart-link/ui - 组件库
│   ├── core/          # @smart-link/core - 页面编排引擎
│   ├── hooks/         # @smart-link/hooks - 组合式函数
│   ├── theme/         # @smart-link/theme - 主题样式
│   └── shared/        # @smart-link/shared - 共享工具
├── app/               # 主应用
├── play/              # 组件调试环境
└── docs/              # 文档站点
```

## 快速开始

请查看 [快速上手](/guide/quick-start) 章节。
