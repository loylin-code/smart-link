# SmartLink Agent编排管理平台 - 设计方案

## 一、项目概述

### 1.1 项目定位
SmartLink是一个现代化的Agent编排管理平台，提供对话、应用管理、应用编排、资源管理等核心功能，采用科技感、现代感、简约的设计风格，具有清晰的层级结构。

### 1.2 核心价值
- **智能化编排**：可视化Agent工作流编排
- **统一资源管理**：集中管理Skills、MCP、前端组件
- **开箱即用**：提供完整的对话和应用管理能力
- **现代体验**：流畅的动画和交互体验

## 二、技术架构

### 2.1 技术栈
```
前端框架：Vue 3.4+ (Composition API)
构建工具：Vite 5.0+
UI组件库：OpenTiny Vue 3.x
开发语言：TypeScript 5.0+
状态管理：Pinia
路由管理：Vue Router 4.x
动画库：@vueuse/motion + CSS3
图表库：ECharts (可选)
代码规范：ESLint + Prettier
```

### 2.2 项目结构
```
smart-link/
├── public/                    # 静态资源
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── assets/               # 资源文件
│   │   ├── styles/          # 全局样式
│   │   │   ├── variables.scss
│   │   │   ├── animations.scss
│   │   │   └── global.scss
│   │   └── images/          # 图片资源
│   ├── components/          # 公共组件
│   │   ├── layout/         # 布局组件
│   │   │   ├── AppLayout.vue
│   │   │   ├── Sidebar.vue
│   │   │   ├── Header.vue
│   │   │   └── Console.vue
│   │   ├── common/         # 通用组件
│   │   │   ├── TechButton.vue
│   │   │   ├── GlowCard.vue
│   │   │   └── LoadingSpinner.vue
│   │   └── business/       # 业务组件
│   ├── views/              # 页面视图
│   │   ├── welcome/       # 欢迎页
│   │   │   └── WelcomePage.vue
│   │   ├── conversation/   # 对话模块
│   │   │   └── ConversationView.vue
│   │   ├── application/    # 应用管理
│   │   │   ├── AppManagement.vue
│   │   │   └── AppOrchestration.vue
│   │   ├── resource/       # 资源管理
│   │   │   ├── SkillsManagement.vue
│   │   │   ├── MCPManagement.vue
│   │   │   └── ComponentManagement.vue
│   │   └── console/       # 控制台
│   │       └── ConsoleView.vue
│   ├── router/            # 路由配置
│   │   └── index.ts
│   ├── store/             # 状态管理
│   │   ├── modules/
│   │   │   ├── app.ts
│   │   │   ├── conversation.ts
│   │   │   └── resource.ts
│   │   └── index.ts
│   ├── api/               # API接口
│   │   ├── conversation.ts
│   │   ├── application.ts
│   │   └── resource.ts
│   ├── utils/             # 工具函数
│   │   ├── request.ts
│   │   └── helpers.ts
│   ├── types/             # 类型定义
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
├── vite.config.ts         # Vite配置
├── tsconfig.json          # TypeScript配置
└── package.json
```

## 三、页面结构与路由规划

### 3.1 页面层级结构
```
欢迎页 (Welcome)
└── 主应用布局 (AppLayout)
    ├── 侧边栏导航 (Sidebar)
    ├── 顶部栏 (Header)
    ├── 内容区域
    │   ├── 对话 (Conversation)
    │   ├── 应用管理 (Application)
    │   │   ├── 应用列表
    │   │   └── 应用编排
    │   └── 资源管理 (Resource)
    │       ├── Skills管理
    │       ├── MCP管理
    │       └── 前端组件管理
    └── 控制台面板 (Console - 全局)
```

### 3.2 路由配置
```typescript
const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/welcome/WelcomePage.vue'),
    meta: { title: '欢迎 - SmartLink' }
  },
  {
    path: '/app',
    component: () => import('@/components/layout/AppLayout.vue'),
    redirect: '/app/conversation',
    children: [
      {
        path: 'conversation',
        name: 'Conversation',
        component: () => import('@/views/conversation/ConversationView.vue'),
        meta: { title: '对话 - SmartLink', icon: 'chat' }
      },
      {
        path: 'application',
        name: 'Application',
        redirect: '/app/application/list',
        children: [
          {
            path: 'list',
            name: 'AppList',
            component: () => import('@/views/application/AppManagement.vue'),
            meta: { title: '应用管理', icon: 'app' }
          },
          {
            path: 'orchestration/:id?',
            name: 'AppOrchestration',
            component: () => import('@/views/application/AppOrchestration.vue'),
            meta: { title: '应用编排', icon: 'flow', hidden: true }
          }
        ]
      },
      {
        path: 'resource',
        name: 'Resource',
        redirect: '/app/resource/skills',
        children: [
          {
            path: 'skills',
            name: 'Skills',
            component: () => import('@/views/resource/SkillsManagement.vue'),
            meta: { title: 'Skills管理', icon: 'skill' }
          },
          {
            path: 'mcp',
            name: 'MCP',
            component: () => import('@/views/resource/MCPManagement.vue'),
            meta: { title: 'MCP管理', icon: 'mcp' }
          },
          {
            path: 'components',
            name: 'Components',
            component: () => import('@/views/resource/ComponentManagement.vue'),
            meta: { title: '前端组件管理', icon: 'component' }
          }
        ]
      }
    ]
  }
]
```

## 四、UI设计规范

### 4.1 设计理念
- **科技感**：深色主题、发光效果、渐变色彩
- **现代感**：扁平化设计、卡片式布局、微交互
- **简约**：留白充足、信息层次清晰、减少视觉噪音
- **层级清晰**：明确的视觉层级、一致的间距系统

### 4.2 色彩系统
```scss
// 主色调 - 科技蓝
$primary-color: #00D4FF;
$primary-light: #4DE8FF;
$primary-dark: #00A8CC;

// 辅助色 - 紫色系
$secondary-color: #7C3AED;
$secondary-light: #A78BFA;
$secondary-dark: #5B21B6;

// 背景色系
$bg-primary: #0A0E27;      // 主背景
$bg-secondary: #151B3D;    // 次级背景
$bg-tertiary: #1E2447;     // 卡片背景
$bg-elevated: #252B4E;     // 悬浮背景

// 文字色系
$text-primary: #FFFFFF;
$text-secondary: #B4B9D4;
$text-tertiary: #6B7194;
$text-disabled: #3D4266;

// 功能色
$success: #10B981;
$warning: #F59E0B;
$error: #EF4444;
$info: #3B82F6;

// 发光效果色
$glow-primary: rgba(0, 212, 255, 0.5);
$glow-secondary: rgba(124, 58, 237, 0.5);
```

### 4.3 间距系统
```scss
$spacing-unit: 4px;
$spacing-xs: 4px;    // 0.25rem
$spacing-sm: 8px;    // 0.5rem
$spacing-md: 16px;   // 1rem
$spacing-lg: 24px;   // 1.5rem
$spacing-xl: 32px;   // 2rem
$spacing-2xl: 48px;  // 3rem
$spacing-3xl: 64px;  // 4rem
```

### 4.4 字体系统
```scss
$font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;

$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-2xl: 24px;
$font-size-3xl: 30px;
$font-size-4xl: 36px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 4.5 圆角系统
```scss
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;
$border-radius-2xl: 24px;
$border-radius-full: 9999px;
```

### 4.6 阴影系统
```scss
// 基础阴影
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
$shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
$shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.25);

// 发光阴影
$glow-shadow-primary: 0 0 20px rgba(0, 212, 255, 0.3);
$glow-shadow-secondary: 0 0 20px rgba(124, 58, 237, 0.3);
$glow-shadow-success: 0 0 20px rgba(16, 185, 129, 0.3);
```

## 五、核心页面设计

### 5.1 欢迎页 (Welcome Page)

#### 布局结构
```
┌─────────────────────────────────────────┐
│                                         │
│         背景动画 (粒子/网格)              │
│                                         │
│    ┌─────────────────────────────┐     │
│    │      SmartLink Logo         │     │
│    │      (发光动画效果)           │     │
│    └─────────────────────────────┘     │
│                                         │
│         智能Agent编排管理平台             │
│                                         │
│    ┌─────────────────────────────┐     │
│    │      开始探索按钮             │     │
│    │   (悬停发光+缩放动画)         │     │
│    └─────────────────────────────┘     │
│                                         │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐           │
│    │对 │ │应 │ │资 │ │控 │           │
│    │话 │ │用 │ │源 │ │制 │           │
│    └───┘ └───┘ └───┘ └───┘           │
│                                         │
└─────────────────────────────────────────┘
```

#### 设计要点
- **背景**：动态粒子效果或网格动画，营造科技感
- **Logo**：居中显示，带有呼吸发光效果
- **标题**：简洁有力的slogan
- **按钮**：主要CTA按钮，带有悬停动画
- **功能预览**：底部展示4个核心功能图标

### 5.2 主应用布局 (App Layout)

#### 布局结构
```
┌──────────────────────────────────────────────────┐
│  Header (60px)                                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Logo  │  面包屑  │  搜索框  │  用户信息     │ │
│  └────────────────────────────────────────────┘ │
├─────────┬────────────────────────────────────────┤
│         │                                        │
│ Sidebar │         Content Area                   │
│ (240px) │                                        │
│         │   ┌────────────────────────────────┐  │
│  ┌───┐  │   │                                │  │
│  │对 │  │   │      页面内容区域               │  │
│  │话 │  │   │                                │  │
│  └───┘  │   │                                │  │
│  ┌───┐  │   │                                │  │
│  │应 │  │   │                                │  │
│  │用 │  │   │                                │  │
│  └───┘  │   └────────────────────────────────┘  │
│  ┌───┐  │                                        │
│  │资 │  │                                        │
│  │源 │  │                                        │
│  └───┘  │                                        │
├─────────┴────────────────────────────────────────┤
│  Console Panel (可折叠, 200px)                   │
│  ┌────────────────────────────────────────────┐ │
│  │ Console │ Logs │ Output │ Terminal        │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### 设计要点
- **Header**：固定顶部，包含Logo、面包屑导航、全局搜索、用户信息
- **Sidebar**：可折叠侧边栏，图标+文字导航，支持hover高亮
- **Content**：主内容区域，根据路由动态加载
- **Console**：底部控制台面板，可折叠，支持多标签页

### 5.3 对话页面 (Conversation)

#### 布局结构
```
┌──────────────────────────────────────────────────┐
│  对话列表 (左侧 300px)  │  对话区域 (右侧)        │
│  ┌──────────────────┐  │  ┌──────────────────┐  │
│  │ 🔍 搜索对话       │  │  │  Agent信息卡片    │  │
│  ├──────────────────┤  │  └──────────────────┘  │
│  │ + 新建对话        │  │                        │
│  ├──────────────────┤  │  ┌──────────────────┐  │
│  │ 对话1            │  │  │                  │  │
│  │ 对话2            │  │  │  对话消息区域     │  │
│  │ 对话3            │  │  │  (用户+Agent)    │  │
│  │ ...              │  │  │                  │  │
│  └──────────────────┘  │  └──────────────────┘  │
│                        │  ┌──────────────────┐  │
│                        │  │  输入框 + 工具栏  │  │
│                        │  └──────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 5.4 应用管理页面

#### 应用列表
```
┌──────────────────────────────────────────────────┐
│  应用管理                    [+ 创建应用]         │
├──────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ App 1  │  │ App 2  │  │ App 3  │  │ App 4  ││
│  │        │  │        │  │        │  │        ││
│  │ 图标   │  │ 图标   │  │ 图标   │  │ 图标   ││
│  │        │  │        │  │        │  │        ││
│  │ 名称   │  │ 名称   │  │ 名称   │  │ 名称   ││
│  │ 描述   │  │ 描述   │  │ 描述   │  │ 描述   ││
│  │ [编排] │  │ [编排] │  │ [编排] │  │ [编排] ││
│  └────────┘  └────────┘  └────────┘  └────────┘│
└──────────────────────────────────────────────────┘
```

#### 应用编排
```
┌──────────────────────────────────────────────────┐
│  应用编排 - [应用名称]           [保存] [运行]    │
├──────────────┬───────────────────────────────────┤
│  组件库      │   画布区域                        │
│  ┌────────┐  │   ┌─────────────────────────────┐│
│  │ Agent  │  │   │                             ││
│  ├────────┤  │   │   ┌──────┐    ┌──────┐    ││
│  │ Skill  │  │   │   │Node1 │───▶│Node2 │    ││
│  ├────────┤  │   │   └──────┘    └──────┘    ││
│  │ Tool   │  │   │       │            │       ││
│  ├────────┤  │   │       ▼            ▼       ││
│  │ Input  │  │   │   ┌──────┐    ┌──────┐    ││
│  ├────────┤  │   │   │Node3 │───▶│Node4 │    ││
│  │ Output │  │   │   └──────┘    └──────┘    ││
│  └────────┘  │   │                             ││
│              │   └─────────────────────────────┘│
└──────────────┴───────────────────────────────────┘
```

### 5.5 资源管理页面

#### Skills管理
```
┌──────────────────────────────────────────────────┐
│  Skills管理                  [+ 创建Skill]        │
├──────────────────────────────────────────────────┤
│  筛选: [类型 ▼] [状态 ▼]    搜索: [________]     │
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ │
│  │ Skill名称        类型      状态    操作     │ │
│  ├────────────────────────────────────────────┤ │
│  │ 数据分析Skill    分析      启用    编辑 删除│ │
│  │ 文档处理Skill    处理      启用    编辑 删除│ │
│  │ API调用Skill     调用      禁用    编辑 删除│ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 5.6 控制台 (Console)

#### 设计方案
```
┌──────────────────────────────────────────────────┐
│  Console面板 (可折叠)           [—] [□] [×]      │
├──────────────────────────────────────────────────┤
│  [Console] [Logs] [Output] [Terminal]            │
├──────────────────────────────────────────────────┤
│  > Agent initialized successfully                │
│  > Loading skills...                             │
│  > Skill "数据分析" loaded                        │
│  > Executing workflow...                         │
│  > [INFO] Processing node 1                      │
│  > [WARN] Timeout detected, retrying...          │
│  > [ERROR] Connection failed                     │
│  > _                                             │
└──────────────────────────────────────────────────┘
```

## 六、动画效果设计

### 6.1 页面过渡动画
```scss
// 页面切换动画
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// 路由切换动画
.route-enter-active,
.route-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.route-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.route-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
```

### 6.2 组件交互动画

#### 按钮动画
```scss
.tech-button {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active {
    transform: translateY(0);
  }
}
```

#### 卡片动画
```scss
.glow-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
                0 0 20px rgba(0, 212, 255, 0.2);
  }
}
```

#### 列表动画
```scss
.list-item {
  animation: slideIn 0.3s ease forwards;
  opacity: 0;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 6.3 加载动画

#### 骨架屏
```scss
.skeleton {
  background: linear-gradient(
    90deg,
    $bg-tertiary 25%,
    $bg-elevated 50%,
    $bg-tertiary 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

#### 加载旋转
```scss
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid $bg-tertiary;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### 6.4 特殊效果

#### 发光效果
```scss
.glow-effect {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3),
                0 0 20px rgba(0, 212, 255, 0.2);
  }
  to {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.5),
                0 0 40px rgba(0, 212, 255, 0.3);
  }
}
```

#### 粒子背景
```typescript
// 使用Canvas实现粒子效果
const initParticles = () => {
  const canvas = document.getElementById('particle-canvas')
  const ctx = canvas.getContext('2d')
  const particles = []

  // 创建粒子
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    })
  }

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy

      // 边界检测
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1

      // 绘制粒子
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 212, 255, 0.5)'
      ctx.fill()
    })

    // 绘制连线
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(0, 212, 255, ${1 - dist / 100})`
          ctx.stroke()
        }
      })
    })

    requestAnimationFrame(animate)
  }

  animate()
}
```

## 七、组件设计规范

### 7.1 基础组件

#### TechButton - 科技按钮
```vue
<template>
  <button
    class="tech-button"
    :class="[`tech-button--${type}`, `tech-button--${size}`]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="tech-button__content">
      <slot />
    </span>
    <span class="tech-button__glow"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

#### GlowCard - 发光卡片
```vue
<template>
  <div class="glow-card" :class="{ 'glow-card--hoverable': hoverable }">
    <div v-if="$slots.header" class="glow-card__header">
      <slot name="header" />
    </div>
    <div class="glow-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="glow-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: true
})
</script>
```

### 7.2 布局组件

#### AppLayout - 应用布局
```vue
<template>
  <div class="app-layout">
    <app-header />
    <div class="app-layout__container">
      <app-sidebar />
      <main class="app-layout__content">
        <router-view v-slot="{ Component }">
          <transition name="route" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <app-console />
  </div>
</template>
```

#### Sidebar - 侧边栏
```vue
<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <div class="sidebar__menu">
      <sidebar-item
        v-for="item in menuItems"
        :key="item.path"
        :item="item"
        :collapsed="collapsed"
      />
    </div>
    <div class="sidebar__toggle" @click="toggleCollapse">
      <icon :name="collapsed ? 'expand' : 'collapse'" />
    </div>
  </aside>
</template>
```

### 7.3 业务组件

#### ConversationMessage - 对话消息
```vue
<template>
  <div class="conversation-message" :class="`conversation-message--${role}`">
    <div class="conversation-message__avatar">
      <img :src="avatar" :alt="role" />
    </div>
    <div class="conversation-message__content">
      <div class="conversation-message__header">
        <span class="conversation-message__name">{{ name }}</span>
        <span class="conversation-message__time">{{ time }}</span>
      </div>
      <div class="conversation-message__text">
        {{ content }}
      </div>
    </div>
  </div>
</template>
```

## 八、状态管理设计

### 8.1 Store结构

#### App Store
```typescript
// store/modules/app.ts
import { defineStore } from 'pinia'

interface AppState {
  sidebar: {
    collapsed: boolean
  }
  console: {
    visible: boolean
    height: number
    activeTab: string
  }
  theme: 'dark' | 'light'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      collapsed: false
    },
    console: {
      visible: true,
      height: 200,
      activeTab: 'console'
    },
    theme: 'dark'
  }),

  actions: {
    toggleSidebar() {
      this.sidebar.collapsed = !this.sidebar.collapsed
    },

    toggleConsole() {
      this.console.visible = !this.console.visible
    },

    setConsoleHeight(height: number) {
      this.console.height = height
    },

    setConsoleTab(tab: string) {
      this.console.activeTab = tab
    }
  }
})
```

#### Conversation Store
```typescript
// store/modules/conversation.ts
import { defineStore } from 'pinia'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
}

export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => ({
    conversations: [],
    activeConversationId: null
  }),

  getters: {
    activeConversation(state) {
      return state.conversations.find(
        c => c.id === state.activeConversationId
      )
    }
  },

  actions: {
    createConversation(title: string) {
      const conversation: Conversation = {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.conversations.unshift(conversation)
      this.activeConversationId = conversation.id
    },

    addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.messages.push({
          ...message,
          id: Date.now().toString(),
          timestamp: Date.now()
        })
        conversation.updatedAt = Date.now()
      }
    },

    setActiveConversation(id: string) {
      this.activeConversationId = id
    }
  }
})
```

## 九、API接口设计

### 9.1 接口规范

#### 统一响应格式
```typescript
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}
```

#### 分页响应格式
```typescript
interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

### 9.2 核心接口

#### 对话接口
```typescript
// api/conversation.ts
export const conversationApi = {
  // 创建对话
  create: (data: { title: string }) =>
    request.post<ApiResponse<Conversation>>('/conversation', data),

  // 发送消息
  sendMessage: (conversationId: string, message: string) =>
    request.post<ApiResponse<Message>>(`/conversation/${conversationId}/message`, {
      content: message
    }),

  // 获取对话列表
  getList: (params?: { page?: number; pageSize?: number }) =>
    request.get<ApiResponse<PageResponse<Conversation>>>('/conversation', { params }),

  // 获取对话详情
  getDetail: (id: string) =>
    request.get<ApiResponse<Conversation>>(`/conversation/${id}`)
}
```

#### 应用接口
```typescript
// api/application.ts
export const applicationApi = {
  // 创建应用
  create: (data: CreateAppParams) =>
    request.post<ApiResponse<Application>>('/application', data),

  // 获取应用列表
  getList: (params?: { page?: number; pageSize?: number }) =>
    request.get<ApiResponse<PageResponse<Application>>>('/application', { params }),

  // 获取应用详情
  getDetail: (id: string) =>
    request.get<ApiResponse<Application>>(`/application/${id}`),

  // 更新应用
  update: (id: string, data: UpdateAppParams) =>
    request.put<ApiResponse<Application>>(`/application/${id}`, data),

  // 删除应用
  delete: (id: string) =>
    request.delete<ApiResponse<void>>(`/application/${id}`),

  // 运行应用
  run: (id: string, params: RunAppParams) =>
    request.post<ApiResponse<RunResult>>(`/application/${id}/run`, params)
}
```

#### 资源接口
```typescript
// api/resource.ts
export const resourceApi = {
  // Skills相关
  skills: {
    getList: (params?: QueryParams) =>
      request.get<ApiResponse<PageResponse<Skill>>>('/resource/skills', { params }),
    create: (data: CreateSkillParams) =>
      request.post<ApiResponse<Skill>>('/resource/skills', data),
    update: (id: string, data: UpdateSkillParams) =>
      request.put<ApiResponse<Skill>>(`/resource/skills/${id}`, data),
    delete: (id: string) =>
      request.delete<ApiResponse<void>>(`/resource/skills/${id}`)
  },

  // MCP相关
  mcp: {
    getList: (params?: QueryParams) =>
      request.get<ApiResponse<PageResponse<MCP>>>('/resource/mcp', { params }),
    create: (data: CreateMCPParams) =>
      request.post<ApiResponse<MCP>>('/resource/mcp', data),
    update: (id: string, data: UpdateMCPParams) =>
      request.put<ApiResponse<MCP>>(`/resource/mcp/${id}`, data),
    delete: (id: string) =>
      request.delete<ApiResponse<void>>(`/resource/mcp/${id}`)
  },

  // 组件相关
  components: {
    getList: (params?: QueryParams) =>
      request.get<ApiResponse<PageResponse<Component>>>('/resource/components', { params }),
    create: (data: CreateComponentParams) =>
      request.post<ApiResponse<Component>>('/resource/components', data),
    update: (id: string, data: UpdateComponentParams) =>
      request.put<ApiResponse<Component>>(`/resource/components/${id}`, data),
    delete: (id: string) =>
      request.delete<ApiResponse<void>>(`/resource/components/${id}`)
  }
}
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

## 十二、部署方案

### 12.1 构建配置
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

### 12.2 环境配置
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

## 十三、开发计划

### 13.1 第一阶段：基础框架搭建
- 项目初始化
- 路由配置
- 布局组件开发
- 基础组件开发
- 全局样式配置

### 13.2 第二阶段：核心功能开发
- 欢迎页开发
- 对话功能开发
- 应用管理开发
- 资源管理开发
- 控制台开发

### 13.3 第三阶段：优化与完善
- 动画效果优化
- 性能优化
- 响应式适配
- 错误处理
- 单元测试

### 13.4 第四阶段：部署上线
- 生产环境配置
- 构建优化
- 部署脚本
- 监控配置

## 十四、总结

本设计方案从技术架构、页面设计、UI规范、动画效果、组件设计等多个维度对SmartLink平台进行了全面规划。设计遵循科技感、现代感、简约、层级清晰的原则，采用Vue3 + OpenTiny + TypeScript技术栈，确保系统的可维护性和扩展性。

通过模块化的组件设计、统一的状态管理、规范的API接口，为后续开发提供了清晰的指导。动画效果的设计将提升用户体验，使平台更具科技感和现代感。
