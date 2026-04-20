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
- Test: N/A

- [ ] **Step 1: 创建页面目录**

```bash
mkdir -p app/src/views/overview
```

- [ ] **Step 2: 创建页面文件**

```bash
code app/src/views/overview/OverviewDashboard.vue
```

- [ ] **Step 3: 编写页面模板**

```vue
<template>
  <div class="overview-dashboard">
    <header class="dashboard-header">
      <h1 class="dashboard-title">{{ t('overview.title') }}</h1>
      <div class="header-actions">
        <select v-model="timeRange" class="time-range-select">
          <option value="today">{{ t('common.today') }}</option>
          <option value="week">{{ t('common.thisWeek') }}</option>
          <option value="month">{{ t('common.thisMonth') }}</option>
        </select>
        <button class="refresh-btn" @click="refreshStats">
          <icon name="refresh" />
          {{ t('overview.refresh') }}
        </button>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- 统计卡片 -->
      <section class="stats-section">
        <div class="stats-grid">
          <stat-card
            v-for="stat in resourceStats"
            :key="stat.key"
            :title="stat.title"
            :value="stat.value"
            :trend="stat.trend"
            :icon="stat.icon"
          />
        </div>
      </section>

      <!-- 会话和 Token -->
      <section class="charts-section">
        <div class="chart-card session-stats">
          <h2>{{ t('overview.stats.sessions') }}</h2>
          <div class="chart-content">
            <div class="session-summary">
              <div class="stat-item">
                <span class="label">{{ t('common.today') }}</span>
                <span class="value">{{ sessionStats.today }}</span>
              </div>
              <div class="stat-item">
                <span class="label">{{ t('common.thisWeek') }}</span>
                <span class="value">{{ sessionStats.week }}</span>
              </div>
              <div class="stat-item">
                <span class="label">{{ t('common.thisMonth') }}</span>
                <span class="value">{{ sessionStats.month }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card token-usage">
          <h2>{{ t('overview.stats.tokens') }}</h2>
          <div class="chart-content">
            <!-- TODO: 添加 token 趋势图 -->
            <p>Token 趋势图占位</p>
          </div>
        </div>
      </section>

      <!-- 定时任务和系统状态 -->
      <section class="status-section">
        <div class="status-card task-status">
          <div class="card-header">
            <h2>{{ t('overview.stats.tasks') }}</h2>
            <router-link to="/app/task" class="view-all">{{ t('common.viewAll') }}</router-link>
          </div>
          <div class="status-content">
            <div class="task-summary">
              <span class="task-running">🟢 {{ t('task.status.running') }}: {{ taskStats.running }}</span>
              <span class="task-pending">🟡 {{ t('task.status.pending') }}: {{ taskStats.pending }}</span>
            </div>
            <div class="task-stats">
              <span>✅ {{ taskStats.success }}</span>
              <span>❌ {{ taskStats.failed }}</span>
            </div>
          </div>
        </div>

        <div class="status-card system-status">
          <div class="card-header">
            <h2>{{ t('overview.stats.systemStatus') }}</h2>
          </div>
          <div class="status-content">
            <div class="status-item">
              <span class="status-icon">✅</span>
              <span>LLM Provider: {{ systemStatus.providers }}/{{ systemStatus.totalProviders }} {{ t('common.normal') }}</span>
            </div>
            <div class="status-item">
              <span class="status-icon">✅</span>
              <span>MCP Servers: {{ systemStatus.mcpConnected }}/{{ systemStatus.totalMcp }} {{ t('mcp.status.connected') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 快捷入口 -->
      <section class="quick-actions-section">
        <h2>{{ t('overview.quickActions') }}</h2>
        <div class="quick-actions">
          <router-link to="/app/agent" class="action-btn">
            <icon name="app" />
            {{ t('agent.create.title') }}
          </router-link>
          <router-link to="/app/tool/skills" class="action-btn">
            <icon name="skill" />
            {{ t('skills.create') }}
          </router-link>
          <router-link to="/app/tool/mcp" class="action-btn">
            <icon name="mcp" />
            {{ t('resource.createMCP') }}
          </router-link>
          <router-link to="/app/resource/api" class="action-btn">
            <icon name="api" />
            {{ t('api.addApi') }}
          </router-link>
          <router-link to="/app/semantic/vocabulary" class="action-btn">
            <icon name="vocabulary" />
            {{ t('semantic.vocabulary.addWord') }}
          </router-link>
          <router-link to="/app/log/agent" class="action-btn">
            <icon name="log" />
            {{ t('log.filter') }}
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAgentStore } from '@/store/modules/agent'
import { useSkillsStore } from '@/store/modules/skills'
import { useMCPStore } from '@/store/modules/mcp'
import { useComponentsStore } from '@/store/modules/components'
import { useModelStore } from '@/store/modules/model'
import { useExploreStore } from '@/store/modules/explore'

const { t } = useI18n()

// Store 引用
const agentStore = useAgentStore()
const skillsStore = useSkillsStore()
const mcpStore = useMCPStore()
const componentsStore = useComponentsStore()
const modelStore = useModelStore()
const exploreStore = useExploreStore()

// 时间范围
const timeRange = ref<'today' | 'week' | 'month'>('today')

// 资源统计
const resourceStats = computed(() => [
  {
    key: 'agents',
    title: t('overview.stats.agents'),
    value: agentStore.agents.length,
    trend: '+2 今日',
    icon: 'app'
  },
  {
    key: 'skills',
    title: t('overview.stats.skills'),
    value: skillsStore.skills.length,
    trend: `${(skillsStore.stats.avgSuccessRate * 100).toFixed(1)}% 成功率`,
    icon: 'skill'
  },
  {
    key: 'mcp',
    title: t('overview.stats.mcp'),
    value: mcpStore.servers.length,
    trend: `${mcpStore.stats.connected} 连接`,
    icon: 'mcp'
  },
  {
    key: 'components',
    title: t('overview.stats.components'),
    value: componentsStore.staticComponents.length,
    trend: '',
    icon: 'component'
  },
  {
    key: 'models',
    title: t('overview.stats.models'),
    value: modelStore.models.length,
    trend: `${modelStore.stats.available} 可用`,
    icon: 'model'
  }
])

// 会话统计
const sessionStats = ref({
  today: 128,
  week: 542,
  month: 1890
})

// 定时任务统计
const taskStats = ref({
  running: 3,
  pending: 5,
  success: 89,
  failed: 2
})

// 系统状态
const systemStatus = computed(() => ({
  providers: modelStore.configuredProviders.length,
  totalProviders: modelStore.models.length,
  mcpConnected: mcpStore.stats.connected,
  totalMcp: mcpStore.stats.total
}))

// 刷新统计
const refreshStats = async () => {
  await Promise.all([
    agentStore.fetchAgents(),
    skillsStore.fetchSkills(),
    mcpStore.fetchServers(),
    modelStore.fetchModels()
  ])
}

onMounted(() => {
  refreshStats()
})
</script>

<style scoped lang="scss">
.overview-dashboard {
  padding: $spacing-lg;
  min-height: calc(100vh - #{$header-height});
  background: $bg-primary;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  .dashboard-title {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .header-actions {
    display: flex;
    gap: $spacing-md;

    .time-range-select {
      padding: $spacing-xs $spacing-md;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      background: $bg-primary;
      color: $text-secondary;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-md;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      background: $bg-primary;
      color: $text-secondary;
      cursor: pointer;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-md;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.status-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.quick-actions-section {
  h2 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-md;
  }

  .quick-actions {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;

    .action-btn {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-sm $spacing-md;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      background: $bg-primary;
      color: $text-secondary;
      text-decoration: none;
      transition: all $transition-fast $ease-out;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
        background: $primary-surface;
      }
    }
  }
}

.chart-card,
.status-card {
  background: $bg-primary;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;

  h2 {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-md;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .view-all {
    color: $primary-color;
    text-decoration: none;
    font-size: $font-size-sm;

    &:hover {
      text-decoration: underline;
    }
  }
}

.session-summary,
.task-summary {
  display: flex;
  gap: $spacing-lg;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  .label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .value {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.status-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-xs 0;
}

.task-running,
.task-pending {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
}

.task-running {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.task-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
</style>
```

- [ ] **Step 4: 创建 StatCard 组件**

```bash
mkdir -p app/src/components/overview
```

```bash
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

- [ ] **Step 5: 启动应用验证页面显示**

```bash
pnpm dev
```

Expected: 访问 http://localhost:5173/app/overview 显示平台概览页面

- [ ] **Step 6: 提交**

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

```typescript
import { defineStore } from 'pinia'

export interface ScheduledTask {
  id: string
  name: string
  agentId: string
  agentName: string
  schedule: string // Cron 表达式
  scheduleType: 'cron' | 'once' | 'manual'
  status: 'running' | 'paused' | 'completed' | 'failed'
  nextRunTime: number
  lastRunTime: number
  lastRunStatus: 'success' | 'failed' | null
  runCount: number
  successCount: number
  failCount: number
  createdAt: number
  updatedAt: number
}

interface TaskState {
  tasks: ScheduledTask[]
  filter: {
    status?: ScheduledTask['status']
    agentId?: string
    keyword?: string
  }
  pagination: { page: number; pageSize: number; total: number }
  loading: boolean
  error: string | null
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    filter: {},
    pagination: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null
  }),

  getters: {
    stats: (state) => ({
      total: state.pagination.total,
      running: state.tasks.filter((t) => t.status === 'running').length,
      paused: state.tasks.filter((t) => t.status === 'paused').length,
      pending: state.tasks.filter(
        (t) => t.status === 'running' && t.nextRunTime > Date.now()
      ).length,
      success: state.tasks.reduce((sum, t) => sum + t.successCount, 0),
      failed: state.tasks.reduce((sum, t) => sum + t.failCount, 0),
      successRate:
        state.tasks.reduce((sum, t) => sum + t.successCount, 0) /
        Math.max(state.tasks.reduce((sum, t) => sum + t.runCount, 0), 1)
    })
  },

  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null

      try {
        // TODO: 实现 API 调用
        // const response = await taskApi.getTasks(this.filter)
        
        // Mock 数据
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        this.tasks = []
        this.pagination.total = 0
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取定时任务失败'
      } finally {
        this.loading = false
      }
    },

    setFilter(filter: typeof this.filter) {
      this.filter = { ...this.filter, ...filter }
    }
  },

  persist: {
    key: 'smart-link-task',
    paths: ['filter']
  }
})
```

- [ ] **Step 3: 更新 store 导出**

打开 `app/src/store/modules/index.ts`（如果存在）或在 `app/src/store/index.ts` 中添加：

```typescript
export { useTaskStore } from './modules/task'
```

- [ ] **Step 4: 验证类型**

```bash
cd app && pnpm run typecheck
```

Expected: 无类型错误

- [ ] **Step 5: 提交**

```bash
git add app/src/store/modules/task.ts
git commit -m "feat(store): 新增定时任务 Store"
```

---

### Task 6: 创建定时任务页面

**Files:**
- Create: `app/src/views/task/ScheduledTaskManagement.vue`
- Test: N/A

- [ ] **Step 1: 创建页面目录和文件**

```bash
mkdir -p app/src/views/task
code app/src/views/task/ScheduledTaskManagement.vue
```

- [ ] **Step 2: 实现页面组件**

```vue
<template>
  <div class="task-management">
    <header class="page-header">
      <h1 class="page-title">{{ t('task.title') }}</h1>
      <div class="header-actions">
        <button class="create-btn" @click="showCreateModal = true">
          <icon name="plus" />
          {{ t('task.createTask') }}
        </button>
      </div>
    </header>

    <main class="page-content">
      <!-- 统计卡片 -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">{{ t('task.status.total') }}</span>
            <span class="stat-value">{{ taskStore.stats.total }}</span>
          </div>
          <div class="stat-card running">
            <span class="stat-label">{{ t('task.status.running') }}</span>
            <span class="stat-value">{{ taskStore.stats.running }}</span>
          </div>
          <div class="stat-card paused">
            <span class="stat-label">{{ t('task.status.paused') }}</span>
            <span class="stat-value">{{ taskStore.stats.paused }}</span>
          </div>
          <div class="stat-card pending">
            <span class="stat-label">{{ t('task.status.pending') }}</span>
            <span class="stat-value">{{ taskStore.stats.pending }}</span>
          </div>
        </div>
      </section>

      <!-- 任务列表 -->
      <section class="task-section">
        <div class="section-header">
          <h2>{{ t('task.title') }}</h2>
          <div class="filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="">{{ t('common.all') }}</option>
              <option value="running">{{ t('task.status.running') }}</option>
              <option value="paused">{{ t('task.status.paused') }}</option>
              <option value="completed">{{ t('task.status.completed') }}</option>
              <option value="failed">{{ t('task.status.failed') }}</option>
            </select>
          </div>
        </div>

        <div v-if="taskStore.loading" class="loading">
          {{ t('common.loading') }}
        </div>

        <div v-else-if="taskStore.tasks.length === 0" class="empty">
          <p>{{ t('task.empty') }}</p>
        </div>

        <table v-else class="task-table">
          <thead>
            <tr>
              <th>{{ t('common.status') }}</th>
              <th>{{ t('task.name') }}</th>
              <th>{{ t('agent.label') }}</th>
              <th>{{ t('task.schedule') }}</th>
              <th>{{ t('task.nextRun') }}</th>
              <th>{{ t('task.executionStats') }}</th>
              <th>{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in taskStore.tasks" :key="task.id">
              <td>
                <span class="status-badge" :class="`status-${task.status}`">
                  {{ t(`task.status.${task.status}`) }}
                </span>
              </td>
              <td>{{ task.name }}</td>
              <td>{{ task.agentName }}</td>
              <td>{{ formatSchedule(task.schedule) }}</td>
              <td>{{ formatTime(task.nextRunTime) }}</td>
              <td>
                {{ task.successCount }} / {{ task.runCount }}
                ({{ ((task.successCount / task.runCount) * 100).toFixed(0) }}%)
              </td>
              <td>
                <button class="action-btn" @click="executeTask(task.id)">
                  {{ t('task.manualExecute') }}
                </button>
                <button class="action-btn" @click="viewHistory(task.id)">
                  {{ t('task.executionHistory') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/store/modules/task'

const { t } = useI18n()
const taskStore = useTaskStore()

const statusFilter = ref('')
const showCreateModal = ref(false)

watch(statusFilter, (newVal) => {
  taskStore.setFilter({ status: newVal as any })
  taskStore.fetchTasks()
})

const formatSchedule = (schedule: string) => {
  // TODO: 格式化 cron 表达式
  return schedule
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const executeTask = (taskId: string) => {
  // TODO: 实现手动执行
  console.log('Execute task:', taskId)
}

const viewHistory = (taskId: string) => {
  // TODO: 查看执行历史
  console.log('View history:', taskId)
}

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped lang="scss">
.task-management {
  padding: $spacing-lg;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  .page-title {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    color: white;
    border: none;
    border-radius: $border-radius-md;
    cursor: pointer;

    &:hover {
      background: darken($primary-color, 10%);
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.stat-card {
  background: $bg-primary;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  &.running { border-left: 3px solid #10b981; }
  &.paused { border-left: 3px solid #f59e0b; }
  &.pending { border-left: 3px solid #3b82f6; }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .stat-value {
    font-size: $font-size-xxl;
    font-weight: $font-weight-bold;
  }
}

.task-section {
  background: $bg-primary;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;

    h2 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
    }
  }
}

.task-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: $spacing-sm;
    text-align: left;
    border-bottom: 1px solid $border-color-base;
  }

  th {
    font-weight: $font-weight-semibold;
    color: $text-secondary;
  }

  .status-badge {
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;

    &.status-running { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.status-paused { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    &.status-completed { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    &.status-failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  }

  .action-btn {
    padding: $spacing-xs $spacing-sm;
    margin-right: $spacing-xs;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    cursor: pointer;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }
}
</style>
```

- [ ] **Step 3: 验证并启动应用**

```bash
pnpm dev
```

Expected: 访问 http://localhost:5173/app/task 显示定时任务页面

- [ ] **Step 4: 提交**

```bash
git add app/src/views/task/ScheduledTaskManagement.vue
git commit -m "feat: 创建定时任务管理页面"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** 所有路由、菜单、i18n、页面已实现
- [ ] **No placeholders:** 检查是否有 TBD/TODO（除 API 调用stub外）
- [ ] **Type consistency:** 所有 types 在各文件一致
- [ ] **Build passes:** `pnpm run build` 成功
- [ ] **Lint passes:** `pnpm run lint` 无错误

---

**Plan saved to:** `docs/superpowers/plans/2026-04-20-platform-menu-architecture-phase1.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** - 每个 task 派遣独立 subagent 执行，快速迭代
2. **Inline Execution** - 在当前 session 中批量执行 tasks

**Which approach?**