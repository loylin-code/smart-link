# AI 聊天回复渲染 UI 组件功能设计文档

**日期**: 2026-04-20
**状态**: 已批准
**相关模块**: 探索中心 (Explore)

---

## 一、需求概述

在探索中心的聊天对话中，让 AI 回复时能够根据数据内容动态渲染 UI 组件库中的数据展示组件，实现结构化的数据可视化呈现。

### 用户决策

| 决策项 | 选择 |
|--------|------|
| AI 输出格式 | 纯 JSON `{ content, components }` |
| 组件交互 | 基本交互（按钮点击、表格行选择） |
| 组件范围 | 数据展示组件（SlStatCard + SlChart + SlTable + SlProgress） |
| 实现方式 | 扩展现有组件映射 + 新增解析服务 |

---

## 二、现有架构分析

### 已有基础设施（可直接复用）

1. **动态组件渲染机制** (`app/src/views/explore/ExploreView.vue:363-374`)
   - `<component :is="getComponentRenderer(component.type)" v-bind="component.props">`
   - 支持 message.components 数组动态渲染
   - 现有 `getComponentRenderer()` 映射 4 种聊天组件

2. **消息数据结构** (`app/src/types/index.ts`)
   - `ChatMessage.components?: ChatComponent[]`
   - `ChatComponent: { id, type, props }`

3. **组件元数据** (`packages/shared/src/constants/component-meta.ts`)
   - 39 个 UI 组件完整定义
   - 包含 props schema、default values、类型约束

4. **SSE 流式处理** (`app/src/store/modules/explore.ts:786-925`)
   - `sendSSEMessage()` 流式发送和接收
   - `onChunk` 回调增量内容
   - `onComplete` 回调处理完成消息

5. **现有聊天组件** (`app/src/components/chat/`)
   - `ChartCard.vue` - 图表（bar/line/pie）
   - `DataSummary.vue` - 数据摘要卡片
   - `TrendAnalysis.vue` - 趋势分析
   - `ConfirmDialog.vue` - 确认对话框

### 需要新增的部分

1. UI 组件库映射（SlStatCard, SlChart, SlTable, SlProgress）
2. AI JSON 输出解析服务
3. Props 校验逻辑（基于 component-meta）
4. 组件事件处理机制
5. Agent Prompt 工程配置

---

## 三、架构设计

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI 聊天组件渲染系统架构                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │ AI Response     │  { content, components: [{ type, props }] }           │
│  │ (JSON 输出)     │                                                        │
│  └─────────────────┘                                                        │
│         │                                                                   │
│         │ SSE 流式传输                                                       │
│         ▼                                                                   │
│  ┌─────────────────┐        ┌─────────────────┐                            │
│  │ explore.ts      │───────▶│ component-parser│                            │
│  │ sendSSEMessage  │        │ parseAIOutput() │                            │
│  │ onComplete      │        │ validateProps() │                            │
│  └─────────────────┘        └─────────────────┘                            │
│         │                           │                                       │
│         │ 添加 components           │ 校验                                  │
│         ▼                           ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ChatMessage                                                          │   │
│  │ { content, components: [{ id, type, props, events }] }              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         │ 渲染                                                              │
│         ▼                                                                   │
│  ┌─────────────────┐        ┌─────────────────┐                            │
│  │ ExploreView.vue │        │ UI 组件库       │                            │
│  │ getRenderer()   │───────▶│ SlStatCard      │                            │
│  │ <component :is> │        │ SlChart         │                            │
│  └─────────────────┘        │ SlTable         │                            │
│         │                   │ SlProgress      │                            │
│         │                   └─────────────────┘                            │
│         │                                                                   │
│         │ 事件                                                              │
│         ▼                                                                   │
│  ┌─────────────────┐                                                        │
│  │ handleEvent()   │  sendMessage / navigate / callback                   │
│  └─────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 四、改动清单

### 实施阶段

本项目分为两个阶段：

1. **Phase 1**: 在 UI 组件库中实现数据展示组件（SlStatCard, SlChart, SlTable, SlProgress）
2. **Phase 2**: 将组件集成到探索中心聊天系统

### Phase 1: UI 组件实现

| 序号 | 文件 | 改动类型 | 说明 |
|------|------|----------|------|
| 1 | `packages/ui/src/components/data/stat-card/stat-card.vue` | 新增 | 指标卡片组件 |
| 2 | `packages/ui/src/components/data/chart/chart.vue` | 新增 | 图表组件（折线/柱状/饼图） |
| 3 | `packages/ui/src/components/data/table/table.vue` | 新增 | 数据表格组件 |
| 4 | `packages/ui/src/components/data/progress/progress.vue` | 新增 | 进度条组件 |
| 5 | `packages/ui/src/components/index.ts` | 修改 | 导出新增组件 |

### Phase 2: 聊天系统集成

| 序号 | 文件 | 改动类型 | 说明 |
|------|------|----------|------|
| 1 | `app/src/services/component-parser.ts` | 新增 | AI JSON 解析 + Props 校验服务 |
| 2 | `app/src/views/explore/ExploreView.vue` | 修改 | 扩展 getComponentRenderer + 增强事件处理 |
| 3 | `app/src/store/modules/explore.ts` | 修改 | onComplete 添加组件解析逻辑 |
| 4 | `app/src/types/index.ts` | 修改 | ChatComponent 添加 events 字段 |
| 5 | Agent 配置 | 修改 | 系统提示添加组件知识 |

---

## 五、Phase 1: UI 组件实现

### 5.1 SlStatCard 组件

**文件**: `packages/ui/src/components/data/stat-card/stat-card.vue`

```vue
<template>
  <div class="sl-stat-card">
    <div class="sl-stat-card__header">
      <span v-if="icon" class="sl-stat-card__icon">{{ icon }}</span>
      <span class="sl-stat-card__title">{{ title }}</span>
    </div>
    <div class="sl-stat-card__body">
      <span class="sl-stat-card__value">{{ value }}</span>
      <span v-if="unit" class="sl-stat-card__unit">{{ unit }}</span>
    </div>
    <div v-if="trendValue" class="sl-stat-card__footer">
      <span class="sl-stat-card__trend" :class="`sl-stat-card__trend--${trend}`">
        <svg v-if="trend === 'up'" viewBox="0 0 24 24" width="12" height="12">
          <path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor"/>
        </svg>
        <svg v-else-if="trend === 'down'" viewBox="0 0 24 24" width="12" height="12">
          <path d="M12 20l8-8h-5v-8h-6v8h-5z" fill="currentColor"/>
        </svg>
        {{ trendValue }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: string
  icon?: string
  color?: string
}
withDefaults(defineProps<Props>(), { trend: 'flat' })
</script>

<style scoped lang="scss">
.sl-stat-card {
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
.sl-stat-card__value {
  font-size: 28px;
  font-weight: 700;
}
.sl-stat-card__trend--up { color: #10b981; }
.sl-stat-card__trend--down { color: #ef4444; }
</style>
```

### 5.2 SlChart 组件

**文件**: `packages/ui/src/components/data/chart/chart.vue`

基于现有 `ChartCard.vue` 的实现，迁移到 UI 组件库并标准化 Props。

### 5.3 SlTable 组件

**文件**: `packages/ui/src/components/data/table/table.vue`

```vue
<template>
  <div class="sl-table">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.title }}</th>
        </tr>
      </thead>
      <tbody :class="{ 'is-striped': striped }">
        <tr v-for="(row, index) in dataSource" :key="index"
            :class="{ 'is-hoverable': hoverable }"
            @click="$emit('rowClick', row)">
          <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  title: string
}
interface Props {
  dataSource: Record<string, any>[]
  columns: Column[]
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
}
withDefaults(defineProps<Props>(), { striped: true, hoverable: true })
defineEmits<{ rowClick: [row: any] }>()
</script>
```

### 5.4 SlProgress 组件

**文件**: `packages/ui/src/components/data/progress/progress.vue`

```vue
<template>
  <div class="sl-progress">
    <div v-if="type === 'line'" class="sl-progress--line">
      <div class="sl-progress__bar">
        <div class="sl-progress__inner" :style="{ width: `${percentage}%` }"
             :class="`sl-progress__inner--${status}`">
          <span v-if="showText" class="sl-progress__text">{{ percentage }}%</span>
        </div>
      </div>
    </div>
    <div v-else class="sl-progress--circle">
      <!-- Circle progress implementation -->
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentage: number
  status?: 'success' | 'warning' | 'error'
  type?: 'line' | 'circle'
  showText?: boolean
  strokeWidth?: number
}
withDefaults(defineProps<Props>(), { type: 'line', showText: true, strokeWidth: 6 })
</script>
```

### 5.5 组件导出

**文件**: `packages/ui/src/components/index.ts`

添加：

```typescript
// Data components
export { default as SlStatCard } from './data/stat-card'
export { default as SlChart } from './data/chart'
export { default as SlTable } from './data/table'
export { default as SlProgress } from './data/progress'
```

---

## 六、Phase 2: 聊天系统集成

### 6.1 新建组件解析服务 (`component-parser.ts`)

**文件**: `app/src/services/component-parser.ts`

```typescript
import { COMPONENT_META_LIST } from '@smart-link/shared'

/**
 * 解析 AI 输出的组件描述
 */
export function parseAIComponentOutput(rawContent: string): AIComponentOutput {
  // 尝试解析纯 JSON
  try {
    const parsed = JSON.parse(rawContent)
    if (parsed.content && parsed.components) {
      return parsed
    }
  } catch {
    // JSON 解析失败，返回纯文本
  }

  // 尝试从 Markdown 代码块提取 JSON
  const jsonMatch = rawContent.match(/```json\n([\s\S]+?)\n```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch {
      // 提取失败
    }
  }

  // 无法解析组件，返回纯文本
  return { content: rawContent, components: [] }
}

/**
 * 校验组件 Props，填充默认值
 */
export function validateComponentProps(type: string, props: Record<string, any>): Record<string, any> {
  const meta = COMPONENT_META_LIST.find(m => m.type === type)
  if (!meta) {
    console.warn(`Unknown component type: ${type}`)
    return props
  }

  const validated: Record<string, any> = {}
  meta.props.forEach(p => {
    if (props[p.name] !== undefined) {
      // 类型校验（简单版）
      validated[p.name] = props[p.name]
    } else if (p.default !== undefined) {
      validated[p.name] = p.default
    }
  })

  return validated
}

/**
 * 生成 ChatMessageComponent 结构
 */
export function createChatComponents(components: AIComponent[]): ChatMessageComponent[] {
  return components.map(c => ({
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: c.type,
    props: validateComponentProps(c.type, c.props),
    events: c.events || []
  }))
}

// 类型定义
interface AIComponentOutput {
  content: string
  components?: AIComponent[]
}

interface AIComponent {
  type: string
  props: Record<string, any>
  events?: ComponentEvent[]
}

interface ComponentEvent {
  name: string       // 'click' | 'rowClick'
  action: string     // 'sendMessage' | 'navigate' | 'callback'
  payload?: any
}
```

### 6.2 扩展组件渲染器 (`ExploreView.vue`)

**文件**: `app/src/views/explore/ExploreView.vue`

**改动位置**: 现有 `getComponentRenderer()` 函数（约第 858-866 行）

```typescript
import { markRaw } from 'vue'
import { SlStatCard, SlChart, SlTable, SlProgress } from '@smart-link/ui'

// 现有聊天组件
import ChartCard from '@/components/chat/ChartCard.vue'
import ConfirmDialog from '@/components/chat/ConfirmDialog.vue'
import TrendAnalysis from '@/components/chat/TrendAnalysis.vue'
import DataSummary from '@/components/chat/DataSummary.vue'

const getComponentRenderer = (type: string) => {
  // 1. 现有聊天组件（保持兼容）
  const chatComponents: Record<string, any> = {
    chart: markRaw(ChartCard),
    confirm: markRaw(ConfirmDialog),
    'trend-analysis': markRaw(TrendAnalysis),
    'data-summary': markRaw(DataSummary)
  }

  // 2. UI 组件库映射
  const uiComponents: Record<string, any> = {
    'SlStatCard': markRaw(SlStatCard),
    'SlChart': markRaw(SlChart),
    'SlTable': markRaw(SlTable),
    'SlProgress': markRaw(SlProgress),
    // 别名映射（支持简写）
    'stat-card': markRaw(SlStatCard),
    'statcard': markRaw(SlStatCard),
    'chart': markRaw(SlChart),  // 覆盖现有 ChartCard（可选）
    'table': markRaw(SlTable),
    'progress': markRaw(SlProgress)
  }

  // 3. 合并查找（聊天组件优先，保持向后兼容）
  return chatComponents[type] || uiComponents[type] || uiComponents[`Sl${type}`] || 'div'
}
```

### 6.3 增强事件处理 (`ExploreView.vue`)

**改动位置**: 现有 `handleComponentEvent()` 函数（约第 854-856 行）

```typescript
interface ComponentEventPayload {
  name: string
  action: 'sendMessage' | 'navigate' | 'callback'
  payload?: Record<string, any>
}

const handleComponentEvent = (messageId: string, event: ComponentEventPayload) => {
  const { action, payload } = event

  switch (action) {
    case 'sendMessage':
      // 将 payload.template 中的变量替换后发送新消息
      if (payload?.template) {
        const template = payload.template
        const message = template.replace(/\{(\w+)\}/g, (_, key) => payload[key] || '')
        sendUserMessage(message, activeConversationId.value)
      } else if (payload?.message) {
        sendUserMessage(payload.message, activeConversationId.value)
      }
      break

    case 'navigate':
      if (payload?.path) {
        router.push(payload.path)
      }
      break

    case 'callback':
      // 自定义回调（可扩展）
      console.log('Component callback:', payload)
      break

    default:
      console.warn('Unknown component action:', action)
  }
}
```

**模板绑定**:

```vue
<!-- 消息组件渲染（增强事件绑定） -->
<div v-if="message.components && message.components.length > 0" class="message-components">
  <component
    v-for="component in message.components"
    :key="component.id"
    :is="getComponentRenderer(component.type)"
    v-bind="component.props"
    @click="component.events?.find(e => e.name === 'click') && handleComponentEvent(message.id, component.events.find(e => e.name === 'click'))"
    @row-click="component.events?.find(e => e.name === 'rowClick') && handleComponentEvent(message.id, component.events.find(e => e.name === 'rowClick'))"
  />
</div>
```

### 6.4 Store 流式解析增强 (`explore.ts`)

**文件**: `app/src/store/modules/explore.ts`

**改动位置**: `sendSSEMessage()` 的 `onComplete` 回调（约第 907-924 行）

```typescript
import { parseAIComponentOutput, createChatComponents } from '@/services/component-parser'

// onComplete 回调增强
(_finishReason) => {
  this.isSSEStreaming = false
  this.currentStreamingMessageId = null

  const conv = this.conversations.find((c) => c.id === activeConvId)
  if (conv) {
    const aiMsg = conv.messages?.find((m) => m.id === aiMessageId)
    if (aiMsg) {
      aiMsg.isStreaming = false

      // 解析 AI 输出的组件描述
      try {
        const parsed = parseAIComponentOutput(aiMsg.content)
        if (parsed.components && parsed.components.length > 0) {
          aiMsg.components = createChatComponents(parsed.components)
          aiMsg.content = parsed.content  // 更新为纯文本内容
        }
      } catch (e) {
        console.warn('Failed to parse AI components:', e)
        // 解析失败不影响文本显示
      }

      if (this.accumulatedToolCalls.length > 0) {
        // tool_calls 处理（保持原有逻辑）
      }
    }
    conv.updatedAt = Date.now()
  }
}
```

### 6.5 类型定义扩展 (`types/index.ts`)

**文件**: `app/src/types/index.ts`

**改动内容**: 扩展 `ChatComponent` 接口

```typescript
interface ChatComponent {
  id: string
  type: string  // 'SlStatCard' | 'SlChart' | 'SlTable' | 'SlProgress' | 现有聊天组件类型
  props: Record<string, any>
  events?: ComponentEvent[]  // 新增：组件事件配置
}

interface ComponentEvent {
  name: string       // 事件名称：'click' | 'rowClick' | 'select'
  action: string     // 动作类型：'sendMessage' | 'navigate' | 'callback'
  payload?: any      // 附加数据
}
```

### 6.6 Agent Prompt 配置

**位置**: Agent 系统提示或 AI 服务配置

```markdown
你是数据分析助手。回复数据问题时可使用以下 UI 组件进行可视化展示：

## 可用组件

| 类型 | 用途 | 必填属性 | 可选属性 |
|------|------|----------|----------|
| SlStatCard | 单指标展示 | title, value | trend(up/down/flat), trendValue, unit, icon |
| SlChart | 数据可视化 | chartType(line/bar/pie), dataSource | title, colors, smooth |
| SlTable | 数据列表 | dataSource(array), columns(array) | striped, hoverable |
| SlProgress | 进度展示 | percentage(0-100) | status(success/warning/error), type(line/circle) |

## dataSource 格式示例

SlChart:
```json
{
  "labels": ["1月", "2月", "3月"],
  "datasets": [{ "data": [100, 120, 150] }]
}
```

SlTable:
```json
{
  "dataSource": [{ "name": "产品A", "sales": 1234 }],
  "columns": [{ "key": "name", "title": "产品名" }, { "key": "sales", "title": "销量" }]
}
```

## 输出格式

返回 JSON，格式如下：
```json
{
  "content": "Markdown 文本内容（数据分析说明）",
  "components": [
    { "type": "SlStatCard", "props": { "title": "销量", "value": 1234, "trend": "up" } },
    { "type": "SlChart", "props": { "chartType": "line", "dataSource": {...} } }
  ]
}
```

## 注意事项

1. components 数组可选，纯文本回复时不需要包含
2. props 必须符合组件定义，缺少必填属性会导致渲染失败
3. 数值类型不要加引号，字符串必须加引号
4. 建议每条回复最多 2-3 个组件，避免信息过载
```

---

## 七、AI 输出 JSON 格式示例

### 示例 1：销售数据分析

```json
{
  "content": "📊 **本月销售数据分析**\n\n整体表现良好，同比增长显著：",
  "components": [
    {
      "type": "SlStatCard",
      "props": {
        "title": "总销售额",
        "value": "￥125,680",
        "trend": "up",
        "trendValue": "+12.5%"
      }
    },
    {
      "type": "SlStatCard",
      "props": {
        "title": "订单数",
        "value": "1,234",
        "trend": "up",
        "trendValue": "+8.3%"
      }
    },
    {
      "type": "SlChart",
      "props": {
        "chartType": "line",
        "title": "销售趋势",
        "dataSource": {
          "labels": ["1月", "2月", "3月", "4月", "5月"],
          "datasets": [{ "data": [100, 120, 115, 145, 160] }]
        },
        "smooth": true
      }
    }
  ]
}
```

### 示例 2：数据表格 + 交互

```json
{
  "content": "📋 **产品销售排名**\n\n点击行可查看详情：",
  "components": [
    {
      "type": "SlTable",
      "props": {
        "dataSource": [
          { "name": "产品A", "sales": 1234, "growth": "+15%" },
          { "name": "产品B", "sales": 890, "growth": "+8%" },
          { "name": "产品C", "sales": 567, "growth": "-3%" }
        ],
        "columns": [
          { "key": "name", "title": "产品名" },
          { "key": "sales", "title": "销量" },
          { "key": "growth", "title": "增长率" }
        ],
        "hoverable": true
      },
      "events": [
        {
          "name": "rowClick",
          "action": "sendMessage",
          "payload": { "template": "查看 {name} 的详细销售数据" }
        }
      ]
    }
  ]
}
```

### 示例 3：进度展示

```json
{
  "content": "🎯 **目标完成进度**\n\n本月销售目标完成情况：",
  "components": [
    {
      "type": "SlProgress",
      "props": {
        "percentage": 78,
        "status": "success",
        "type": "line"
      }
    },
    {
      "type": "SlStatCard",
      "props": {
        "title": "目标金额",
        "value": "￥160,000",
        "unit": ""
      }
    }
  ]
}
```

---

## 八、数据流

```
用户发送消息 → SSE 流式请求 → AI 模型处理
                                         │
                                         │ AI 返回 JSON { content, components }
                                         ▼
                          SSE onComplete 回调
                                         │
                                         │ parseAIComponentOutput()
                                         ▼
                          解析 content + components
                                         │
                                         │ createChatComponents() + validateProps()
                                         ▼
                          生成 ChatMessage.components
                                         │
                                         │ 添加到 activeConversation.messages
                                         ▼
                          ExploreView 响应式更新
                                         │
                                         │ getComponentRenderer(type)
                                         ▼
                          映射到 UI 组件
                                         │
                                         │ <component :is="..." v-bind="props">
                                         ▼
                          渲染可视化组件
                                         │
                                         │ 用户交互（可选）
                                         ▼
                          handleComponentEvent()
                                         │
                                         │ sendMessage / navigate
                                         ▼
                          触发新的聊天或导航
```

---

## 九、测试要点

1. **功能测试**
   - AI 返回有效 JSON，组件正确渲染
   - AI 返回纯文本，无组件，正常显示
   - AI 返回格式错误，降级显示文本

2. **组件渲染测试**
   - SlStatCard 显示指标值、趋势图标
   - SlChart 显示折线图、柱状图、饼图
   - SlTable 显示数据列表、斑马纹
   - SlProgress 显示进度条

3. **Props 校验测试**
   - 缺少必填属性时使用默认值
   - 类型不匹配时日志警告
   - 未知组件类型时降级渲染

4. **交互测试**
   - 表格行点击触发 sendMessage
   - 消息模板变量正确替换
   - navigate 导航到指定路由

---

## 十一、风险与限制

1. **AI 输出格式不稳定**: 部分 AI 模型可能无法稳定输出 JSON 格式，需要 Prompt 强化 + fallback 解析

2. **组件 Props 类型校验**: 当前仅做简单校验，复杂类型（如数组嵌套对象）可能需要增强

3. **现有组件兼容性**: UI 组件库组件与现有聊天组件 API 可能不一致，需要统一或保持双轨

4. **事件处理复杂度**: 当前仅支持 3 种基本事件，复杂交互（如表单填写）需要后续扩展

---

## 十一、后续优化建议

1. 扩展支持更多组件（SlCard, SlList, SlMetricGrid）
2. 实现组件嵌套渲染（如 SlCard 包含 SlChart）
3. 添加组件状态管理（如表格选中状态）
4. 实现流式组件渲染（边输出边渲染）
5. 添加组件导出功能（生成分析报告）