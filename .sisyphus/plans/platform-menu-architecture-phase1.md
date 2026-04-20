# 平台菜单架构优化实施计划（第一阶段）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构平台菜单结构，新增平台概览 Dashboard 和定时任务管理模块

**Architecture:** 渐进式重构 - 保持现有路由和组件结构，仅调整菜单层级和新增模块，最小化改动风险

**Tech Stack:** Vue 3.4 + TypeScript, Pinia, Vue Router 4, SCSS

---

## Phase 1: 路由与菜单重构（高优先级）

### Task 1: 新增路由定义

**Files:**
- Modify: `app/src/router/index.ts`
- Test: N/A (路由配置无需单元测试)

- [ ] **Step 1: 打开路由文件**

```bash
code app/src/router/index.ts
```

- [ ] **Step 2: 在 `/app` 路由 children 数组开头添加平台概览路由**

在现有 `explore` 路由之前添加：

```typescript
{
  path: 'overview',
  name: 'Overview',
  component: () => import('@/views/overview/OverviewDashboard.vue'),
  meta: {
    title: '平台概览',
    titleKey: 'route.overview',
    icon: 'dashboard'
  } as RouteMeta
},
```

- [ ] **Step 3: 修改 `/app` 默认跳转路由**

```typescript
// 原代码:
redirect: '/app/explore',

// 修改为:
redirect: '/app/overview',
```

- [ ] **Step 4: 修改工具管理路由，移除 models 子路由**

```typescript
// 删除以下子路由:
{
  path: 'models',
  name: 'Models',
  component: () => import('@/views/resource/ModelManagement.vue'),
  meta: { title: '模型管理', icon: 'model' }
},
{
  path: 'models/:id',
  name: 'ModelDetail',
  component: () => import('@/views/resource/ModelDetailPage.vue'),
  meta: { hidden: true }
}
```

- [ ] **Step 5: 在资源管理路由中添加 API 管理子路由**

在 `datamodel` 子路由之后添加：

```typescript
{
  path: 'api',
  name: 'APIManagement',
  component: () => import('@/views/resource/APIManagement.vue'),
  meta: {
    title: 'API 管理',
    titleKey: 'route.apiManagement',
    icon: 'api'
  } as RouteMeta
}
```

- [ ] **Step 6: 添加语义管理一级路由**

在 `resource` 路由之后添加：

```typescript
{
  path: 'semantic',
  name: 'Semantic',
  redirect: '/app/semantic/vocabulary',
  meta: {
    title: '语义管理',
    titleKey: 'route.semantic',
    icon: 'semantic'
  } as RouteMeta,
  children: [
    {
      path: 'vocabulary',
      name: 'Vocabulary',
      component: () => import('@/views/semantic/VocabularyManagement.vue'),
      meta: {
        title: '语义词库',
        titleKey: 'route.vocabulary',
        icon: 'vocabulary'
      } as RouteMeta
    },
    {
      path: 'config',
      name: 'SemanticConfig',
      component: () => import('@/views/semantic/SemanticConfig.vue'),
      meta: {
        title: '配置管理',
        titleKey: 'route.semanticConfig',
        icon: 'config'
      } as RouteMeta
    }
  ]
},
```

- [ ] **Step 7: 添加日志管理一级路由**

在 `semantic` 路由之后添加：

```typescript
{
  path: 'log',
  name: 'Log',
  redirect: '/app/log/agent',
  meta: {
    title: '日志管理',
    titleKey: 'route.log',
    icon: 'log'
  } as RouteMeta,
  children: [
    {
      path: 'agent',
      name: 'AgentLog',
      component: () => import('@/views/log/AgentLog.vue'),
      meta: {
        title: 'Agent 运行日志',
        titleKey: 'route.agentLog',
        icon: 'agent-log'
      } as RouteMeta
    },
    {
      path: 'system',
      name: 'SystemLog',
      component: () => import('@/views/log/SystemLog.vue'),
      meta: {
        title: '系统操作日志',
        titleKey: 'route.systemLog',
        icon: 'system-log'
      } as RouteMeta
    }
  ]
},
```

- [ ] **Step 8: 添加定时任务一级路由**

在 `log` 路由之后添加：

```typescript
{
  path: 'task',
  name: 'Task',
  component: () => import('@/views/task/ScheduledTaskManagement.vue'),
  meta: {
    title: '定时任务',
    titleKey: 'route.task',
    icon: 'schedule'
  } as RouteMeta
}
```

- [ ] **Step 9: 修改系统设置路由，移除 appearance 并添加 models**

```typescript
// 原 children 配置:
children: [
  {
    path: 'appearance',
    name: 'Appearance',
    component: () => import('@/views/settings/AppearanceSettings.vue'),
    meta: { title: '外观设置', icon: 'appearance' }
  },
  {
    path: 'providers',
    name: 'Providers',
    component: () => import('@/views/settings/ProviderSettings.vue'),
    meta: { title: '模型提供商', icon: 'provider' }
  }
]

// 修改为:
children: [
  {
    path: 'providers',
    name: 'Providers',
    component: () => import('@/views/settings/ProviderSettings.vue'),
    meta: {
      title: '模型提供商',
      titleKey: 'route.providers',
      icon: 'provider'
    } as RouteMeta
  },
  {
    path: 'models',
    name: 'Models',
    component: () => import('@/views/resource/ModelManagement.vue'),
    meta: {
      title: '模型管理',
      titleKey: 'route.models',
      icon: 'model'
    } as RouteMeta
  },
  {
    path: 'models/:id',
    name: 'ModelDetail',
    component: () => import('@/views/resource/ModelDetailPage.vue'),
    meta: {
      title: '模型详情',
      titleKey: 'route.modelDetail',
      icon: 'model',
      hidden: true
    } as RouteMeta
  }
]
```

- [ ] **Step 10: 验证路由文件语法**

```bash
cd app && pnpm run lint
```

Expected: 无错误

- [ ] **Step 11: 提交**

```bash
git add app/src/router/index.ts
git commit -m "feat(router): 重构路由结构，新增平台概览和定时任务路由"
```

---

### Task 2: 更新侧边栏菜单配置

**Files:**
- Modify: `app/src/components/layout/AppSidebar.vue`
- Test: N/A

- [ ] **Step 1: 打开侧边栏文件**

```bash
code app/src/components/layout/AppSidebar.vue
```

- [ ] **Step 2: 新增 Dashboard 图标组件**

在 `SettingsIcon` 之后添加：

```typescript
// Dashboard icon
const DashboardIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
    h('rect', {
      x: 3,
      y: 3,
      width: 7,
      height: 7,
      rx: 1,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('rect', {
      x: 14,
      y: 3,
      width: 7,
      height: 7,
      rx: 1,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('rect', {
      x: 3,
      y: 14,
      width: 7,
      height: 7,
      rx: 1,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('rect', {
      x: 14,
      y: 14,
      width: 7,
      height: 4,
      rx: 1,
      stroke: 'currentColor',
      'stroke-width': 2
    })
  ])

// Schedule/Task icon
const ScheduleIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
    h('circle', {
      cx: 12,
      cy: 12,
      r: 9,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('path', {
      d: 'M12 7V12L16 14',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round'
    })
  ])

// Semantic/Dictionary icon
const SemanticIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', {
      d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round'
    }),
    h('path', {
      d: 'M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z',
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('line', {
      x1: 8,
      y1: 7,
      x2: 16,
      y2: 7,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('line', {
      x1: 8,
      y1: 11,
      x2: 16,
      y2: 11,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('line', {
      x1: 8,
      y1: 15,
      x2: 12,
      y2: 15,
      stroke: 'currentColor',
      'stroke-width': 2
    })
  ])

// Log icon
const LogIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', {
      d: 'M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z',
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('polyline', {
      points: '14,2 14,8 20,8',
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('line', {
      x1: 8,
      y1: 13,
      x2: 16,
      y2: 13,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('line', {
      x1: 8,
      y1: 17,
      x2: 16,
      y2: 17,
      stroke: 'currentColor',
      'stroke-width': 2
    })
  ])

// API icon
const APIIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
    h('rect', {
      x: 2,
      y: 2,
      width: 20,
      height: 8,
      rx: 2,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('circle', { cx: 6, cy: 6, r: 1, fill: 'currentColor' }),
    h('circle', { cx: 10, cy: 6, r: 1, fill: 'currentColor' }),
    h('circle', { cx: 14, cy: 6, r: 1, fill: 'currentColor' }),
    h('rect', {
      x: 2,
      y: 14,
      width: 20,
      height: 8,
      rx: 2,
      stroke: 'currentColor',
      'stroke-width': 2
    }),
    h('path', {
      d: 'M7 18H17',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round'
    })
  ])
```

- [ ] **Step 3: 修改 expandedItems 默认展开项**

```typescript
// 原代码:
const expandedItems = ref<string[]>(['/app/agent', '/app/resource', '/app/tool', '/app/settings'])

// 修改为:
const expandedItems = ref<string[]>(['/app/agent', '/app/resource', '/app/tool', '/app/semantic', '/app/log', '/app/settings'])
```

- [ ] **Step 4: 修改 menuItems 配置**

替换整个 `menuItems` 计算属性为：

```typescript
const menuItems = computed(() => [
  {
    key: 'overview',
    icon: DashboardIcon,
    label: t('route.overview'),
    titleKey: 'route.overview',
    path: '/app/overview'
  },
  {
    key: 'explore',
    icon: ChatIcon,
    label: t('route.explore'),
    titleKey: 'route.explore',
    path: '/app/explore'
  },
  {
    key: 'agent',
    icon: AppIcon,
    label: t('sidebar.agent'),
    titleKey: 'route.agent',
    path: '/app/agent',
    children: [
      { key: 'agent-management', label: t('sidebar.agentManagement'), path: '/app/agent' }
    ]
  },
  {
    key: 'tool',
    icon: ToolIcon,
    label: t('sidebar.toolManagement'),
    titleKey: 'route.tool',
    path: '/app/tool',
    children: [
      { key: 'skills', label: t('sidebar.skillsManagement'), path: '/app/tool/skills' },
      { key: 'mcp', label: t('sidebar.mcpManagement'), path: '/app/tool/mcp' }
    ]
  },
  {
    key: 'resource',
    icon: ResourceIcon,
    label: t('sidebar.resource'),
    titleKey: 'route.resource',
    path: '/app/resource',
    children: [
      { key: 'components', label: t('sidebar.componentManagement'), path: '/app/resource/components' },
      { key: 'datamodel', label: t('sidebar.dataModel'), path: '/app/resource/datamodel' },
      { key: 'api', label: t('route.apiManagement'), path: '/app/resource/api' }
    ]
  },
  {
    key: 'semantic',
    icon: SemanticIcon,
    label: t('route.semantic'),
    titleKey: 'route.semantic',
    path: '/app/semantic',
    children: [
      { key: 'vocabulary', label: t('route.vocabulary'), path: '/app/semantic/vocabulary' },
      { key: 'semantic-config', label: t('route.semanticConfig'), path: '/app/semantic/config' }
    ]
  },
  {
    key: 'log',
    icon: LogIcon,
    label: t('route.log'),
    titleKey: 'route.log',
    path: '/app/log',
    children: [
      { key: 'agent-log', label: t('route.agentLog'), path: '/app/log/agent' },
      { key: 'system-log', label: t('route.systemLog'), path: '/app/log/system' }
    ]
  },
  {
    key: 'task',
    icon: ScheduleIcon,
    label: t('route.task'),
    titleKey: 'route.task',
    path: '/app/task'
  },
  {
    key: 'settings',
    icon: SettingsIcon,
    label: t('sidebar.settings'),
    titleKey: 'route.settings',
    path: '/app/settings',
    children: [
      { key: 'providers', label: t('sidebar.providers'), path: '/app/settings/providers' },
      { key: 'models', label: t('sidebar.modelManagement'), path: '/app/settings/models' }
    ]
  }
])
```

- [ ] **Step 5: 验证文件语法**

```bash
cd app && pnpm run lint
```

Expected: 无错误

- [ ] **Step 6: 启动应用验证菜单显示**

```bash
pnpm dev
```

Expected: 侧边栏显示新的菜单结构

- [ ] **Step 7: 提交**

```bash
git add app/src/components/layout/AppSidebar.vue
git commit -m "feat(sidebar): 更新菜单配置，新增平台概览和定时任务菜单项"
```

---

### Task 3: 新增国际化文案

**Files:**
- Modify: `app/src/locales/zh-CN.ts`
- Modify: `app/src/locales/en-US.ts`

- [ ] **Step 1: 打开中文语言文件**

```bash
code app/src/locales/zh-CN.ts
```

- [ ] **Step 2: 在 route 对象中新增文案**

```typescript
route: {
  // 新增
  overview: '平台概览',
  task: '定时任务',
  semantic: '语义管理',
  vocabulary: '语义词库',
  semanticConfig: '配置管理',
  log: '日志管理',
  agentLog: 'Agent 运行日志',
  systemLog: '系统操作日志',
  apiManagement: 'API 管理',
  agent: '数字员工',
  
  // 已有（保持）
  explore: '探索中心',
  // ...
}
```

- [ ] **Step 3: 在 sidebar 对象中新增文案**

```typescript
sidebar: {
  // 新增
  overview: '平台概览',
  task: '定时任务',
  semantic: '语义管理',
  vocabulary: '语义词库',
  semanticConfig: '配置管理',
  log: '日志管理',
  agentLog: 'Agent 运行日志',
  systemLog: '系统操作日志',
  apiManagement: 'API 管理',
  
  // 已有（保持）
  agentManagement: '数字员工管理',
  agent: '数字员工',
  // ...
}
```

- [ ] **Step 4: 新增模块文案对象**

在文件末尾 `agent` 对象之后添加：

```typescript
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
},

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
},

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
},

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
},

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

- [ ] **Step 5: 打开英文语言文件**

```bash
code app/src/locales/en-US.ts
```

- [ ] **Step 6: 添加对应的英文文案**

```typescript
route: {
  overview: 'Overview',
  task: 'Scheduled Tasks',
  semantic: 'Semantic Management',
  vocabulary: 'Vocabulary',
  semanticConfig: 'Configuration',
  log: 'Logs',
  agentLog: 'Agent Logs',
  systemLog: 'System Logs',
  apiManagement: 'API Management',
  agent: 'Agent',
  // ...existing
}

sidebar: {
  overview: 'Platform Overview',
  task: 'Scheduled Tasks',
  semantic: 'Semantic',
  vocabulary: 'Vocabulary',
  semanticConfig: 'Configuration',
  log: 'Logs',
  agentLog: 'Agent Logs',
  systemLog: 'System Logs',
  apiManagement: 'API Management',
  // ...existing
}

// 模块文案（英文）
overview: {
  title: 'Platform Overview',
  stats: {
    agents: 'Agents',
    skills: 'Skills',
    mcp: 'MCP Servers',
    components: 'Components',
    models: 'Models',
    sessions: 'Sessions',
    tokens: 'Token Usage',
    tasks: 'Tasks',
    systemStatus: 'System Status'
  },
  quickActions: 'Quick Actions',
  refresh: 'Refresh',
  timeRange: 'Time Range'
},
// (重复以上 pattern 翻译 semantic, api, log, task 对象)
```

- [ ] **Step 7: 验证语法**

```bash
pnpm run lint
```

- [ ] **Step 8: 提交**

```bash
git add app/src/locales/zh-CN.ts app/src/locales/en-US.ts
git commit -m "feat(i18n): 新增平台概览和定时任务相关国际化文案"
```

---

## Phase 2: 平台概览 Dashboard 页面

### Task 4: 创建平台概览页面框架

**Files:**
- Create: `app/src/views/overview/OverviewDashboard.vue`
- Create: `app/src/components/overview/StatCard.vue`
- Test: N/A

- [ ] **Step 1: 创建页面目录**

```bash
mkdir -p app/src/views/overview
```

- [ ] **Step 2: 创建 StatCard 组件文件**

```bash
mkdir -p app/src/components/overview
code app/src/components/overview/StatCard.vue
```

```vue
<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-icon" :class="`icon-${icon}`">
        <icon :name="icon" />
      </span>
      <span class="stat-trend" :class="trendClass">{{ trend }}</span>
    </div>
    <div class="stat-body">
      <span class="stat-title">{{ title }}</span>
      <span class="stat-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineProps<{
  title: string
  value: string | number
  trend?: string
  icon: string
}>()

const trendClass = computed(() => {
  return {
    'trend-positive': true
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.stat-card {
  background: $bg-primary;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  &:hover {
    border-color: $primary-color;
  }
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stat-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    background: $bg-secondary;
    color: $primary-color;
  }

  .stat-trend {
    font-size: $font-size-xs;
    color: #10b981;
    padding: $spacing-xs $spacing-sm;
    background: rgba(16, 185, 129, 0.1);
    border-radius: $border-radius-sm;
  }
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  .stat-title {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .stat-value {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }
}
</style>
```

- [ ] **Step 3: 创建平台概览主页面**

```bash
code app/src/views/overview/OverviewDashboard.vue
```

详细实现代码参考完整计划文档（因长度限制在此省略）

- [ ] **Step 4: 验证并启动应用**

```bash
pnpm dev
```

Expected: 访问 http://localhost:5173/app/overview 显示平台概览页面

- [ ] **Step 5: 提交**

```bash
git add app/src/views/overview/OverviewDashboard.vue app/src/components/overview/StatCard.vue
git commit -m "feat: 创建平台概览 Dashboard 页面框架"
```

---

## Phase 3: 定时任务 Store 和页面

### Task 5: 创建定时任务 Store

**Files:**
- Create: `app/src/store/modules/task.ts`
- Test: N/A

- [ ] **Step 1: 创建 Store 文件**

```bash
code app/src/store/modules/task.ts
```

- [ ] **Step 2: 实现 TaskStore**

参考完整计划文档中的 TaskStore 实现代码

- [ ] **Step 3: 验证类型**

```bash
cd app && pnpm run typecheck
```

- [ ] **Step 4: 提交**

```bash
git add app/src/store/modules/task.ts
git commit -m "feat(store): 新增定时任务 Store"
```

---

### Task 6: 创建定时任务页面

**Files:**
- Create: `app/src/views/task/ScheduledTaskManagement.vue`
- Test: N/A

实现任务管理页面，包含统计卡片、任务列表、筛选功能

- [ ] **Step 1: 创建页面文件**
- [ ] **Step 2: 实现页面模板和逻辑**
- [ ] **Step 3: 验证并启动**
- [ ] **Step 4: 提交**

---

## Self-Review Checklist

- [ ] **Spec coverage:** 所有路由、菜单、i18n、页面已实现
- [ ] **No placeholders:** 检查是否有 TBD/TODO（除 API 调用 stub 外）
- [ ] **Type consistency:** 所有 types 在各文件一致
- [ ] **Build passes:** `pnpm run build` 成功
- [ ] **Lint passes:** `pnpm run lint` 无错误