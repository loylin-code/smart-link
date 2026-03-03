# 快速上手

## 环境准备

- Node.js >= 18
- pnpm >= 9.0

## 安装

```bash
# 克隆项目
git clone https://github.com/loylin-code/smart-link.git
cd smart-link

# 安装依赖
pnpm install
```

## 开发

```bash
# 启动主应用
pnpm dev

# 启动组件调试环境
pnpm play

# 启动文档站点
pnpm docs
```

## 构建

```bash
# 构建所有项目
pnpm build

# 仅构建组件库
pnpm build:lib
```

## 目录说明

| 目录              | 说明               |
| ----------------- | ------------------ |
| `packages/ui`     | UI 组件库          |
| `packages/core`   | 页面编排引擎       |
| `packages/hooks`  | 组合式函数         |
| `packages/theme`  | 主题样式           |
| `packages/shared` | 共享工具函数和类型 |
| `app`             | 主应用             |
| `play`            | 组件调试环境       |
| `docs`            | 文档站点           |
