# AI 聊天回复渲染 UI 组件实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现探索中心聊天中 AI 回复动态渲染数据展示组件（SlStatCard, SlChart, SlTable, SlProgress）的能力

**Architecture:** 分两阶段实施：Phase 1 实现 UI 组件库的数据展示组件；Phase 2 集成到聊天系统，扩展组件映射、增强事件处理、添加 JSON 解析服务

**Tech Stack:** Vue 3.4 + TypeScript + Pinia + SSE Streaming + @smart-link/ui 组件库

---

## 文件结构

### Phase 1: UI 组件实现（新增文件）

```
packages/ui/src/components/
├── data/
│   ├── stat-card/
│   │   ├── stat-card.vue       # 指标卡片组件
│   │   └── index.ts            # 导出 + install
│   ├── chart/
│   │   ├── chart.vue           # 图表组件（折线/柱状/饼图）
│   │   └── index.ts
│   ├── table/
│   │   ├── table.vue           # 数据表格组件
│   │   └── index.ts
│   └── progress/
│       ├── progress.vue        # 进度条组件
│       └── index.ts
└── index.ts                    # 添加 data 组件导出
```

### Phase 2: 聊天系统集成（修改文件）

```
app/src/
├── services/
│   └── component-parser.ts     # 新增：AI JSON 解析服务
├── views/explore/
│   └── ExploreView.vue         # 修改：扩展 getComponentRenderer + 事件处理
├── store/modules/
│   └── explore.ts              # 修改：onComplete 添加解析逻辑
└── types/
    └── index.ts                # 修改：ChatComponent 添加 events
```

---

## Phase 1: UI 组件实现

### Task 1: SlStatCard 组件

**Files:**
- Create: `packages/ui/src/components/data/stat-card/stat-card.vue`
- Create: `packages/ui/src/components/data/stat-card/index.ts`

- [ ] **Step 1: 创建组件目录结构**

```bash
mkdir -p packages/ui/src/components/data/stat-card
```

- [ ] **Step 2: 实现 SlStatCard 组件**

```vue
<!-- packages/ui/src/components/data/stat-card/stat-card.vue -->
<template>
  <div class="sl-stat-card" :style="{ borderColor: color }">
    <div class="sl-stat-card__header">
      <span v-if="icon" class="sl-stat-card__icon">{{ icon }}</span>
      <span class="sl-stat-card__title">{{ title }}</span>
    </div>
    <div class="sl-stat-card__body">
      <span class="sl-stat-card__value">{{ formattedValue }}</span>
      <span v-if="unit" class="sl-stat-card__unit">{{ unit }}</span>
    </div>
    <div v-if="trendValue" class="sl-stat-card__footer">
      <span class="sl-stat-card__trend" :class="trendClass">
        <svg v-if="trend === 'up'" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5l-8-8z"/>
        </svg>
        <svg v-else-if="trend === 'down'" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M12 20l8-8h-5v-8H9v8H4l8 8z"/>
        </svg>
        <span class="sl-stat-card__trend-value">{{ trendValue }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: string
  icon?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'flat',
  color: '#3b82f6'
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    if (props.value >= 1000000) return `${(props.value / 1000000).toFixed(1)}M`
    if (props.value >= 1000) return `${(props.value / 1000).toFixed(1)}K`
    return props.value.toString()
  }
  return props.value
})

const trendClass = computed(() => {
  switch (props.trend) {
    case 'up': return 'sl-stat-card__trend--up'
    case 'down': return 'sl-stat-card__trend--down'
    default: return 'sl-stat-card__trend--flat'
  }
})
</script>

<style scoped lang="scss">
.sl-stat-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  min-width: 120px;
}

.sl-stat-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sl-stat-card__icon {
  font-size: 20px;
}

.sl-stat-card__title {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.sl-stat-card__body {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.sl-stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
}

.sl-stat-card__unit {
  font-size: 12px;
  color: var(--text-tertiary, #9ca3af);
}

.sl-stat-card__footer {
  margin-top: 8px;
}

.sl-stat-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.sl-stat-card__trend--up {
  color: #10b981;
}

.sl-stat-card__trend--down {
  color: #ef4444;
}

.sl-stat-card__trend--flat {
  color: var(--text-tertiary, #9ca3af);
}
</style>
```

- [ ] **Step 3: 创建组件导出文件**

```typescript
// packages/ui/src/components/data/stat-card/index.ts
import SlStatCard from './stat-card.vue'

SlStatCard.install = (app: any) => {
  app.component('SlStatCard', SlStatCard)
}

export default SlStatCard
```

- [ ] **Step 4: 验证组件无 lint 错误**

Run: `pnpm lint`
Expected: 无 SlStatCard 相关错误

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/data/stat-card/
git commit -m "feat(ui): add SlStatCard component for stat display"
```

---

### Task 2: SlChart 组件

**Files:**
- Create: `packages/ui/src/components/data/chart/chart.vue`
- Create: `packages/ui/src/components/data/chart/index.ts`

- [ ] **Step 1: 创建组件目录结构**

```bash
mkdir -p packages/ui/src/components/data/chart
```

- [ ] **Step 2: 实现 SlChart 组件（基于现有 ChartCard 迁移）**

```vue
<!-- packages/ui/src/components/data/chart/chart.vue -->
<template>
  <div class="sl-chart">
    <div v-if="title" class="sl-chart__header">
      <span class="sl-chart__title">{{ title }}</span>
      <div v-if="showLegend && legend.length" class="sl-chart__legend">
        <span v-for="(item, idx) in legend" :key="idx" class="sl-chart__legend-item">
          <span class="sl-chart__legend-dot" :style="{ background: colors[idx % colors.length] }"></span>
          {{ item }}
        </span>
      </div>
    </div>
    <div class="sl-chart__body">
      <!-- Bar Chart -->
      <div v-if="chartType === 'bar'" class="sl-chart--bar">
        <div v-for="(val, idx) in chartData" :key="idx" class="sl-chart__bar-item">
          <div class="sl-chart__bar-label">{{ labels[idx] }}</div>
          <div class="sl-chart__bar-wrapper">
            <div class="sl-chart__bar"
                 :style="{ width: `${(val / maxValue) * 100}%`, background: colors[idx % colors.length] }">
              <span class="sl-chart__bar-value">{{ formatValue(val) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Line Chart -->
      <div v-else-if="chartType === 'line'" class="sl-chart--line">
        <svg viewBox="0 0 400 150" class="sl-chart__svg">
          <path :d="linePath" fill="none" :stroke="colors[0]" stroke-width="2" stroke-linecap="round"/>
          <path :d="areaPath" :fill="`${colors[0]}20`"/>
          <g>
            <circle v-for="(pt, idx) in linePoints" :key="idx"
                    :cx="pt.x" :cy="pt.y" r="4" :fill="colors[0]"/>
          </g>
        </svg>
        <div v-if="labels.length" class="sl-chart__x-labels">
          <span v-for="(label, idx) in labels" :key="idx">{{ label }}</span>
        </div>
      </div>
      <!-- Pie Chart -->
      <div v-else-if="chartType === 'pie'" class="sl-chart--pie">
        <svg viewBox="0 0 200 200" class="sl-chart__pie-svg">
          <g transform="translate(100, 100)">
            <path v-for="(seg, idx) in pieSegments" :key="idx"
                  :d="seg.path" :fill="colors[idx % colors.length]" class="sl-chart__pie-segment"/>
          </g>
        </svg>
        <div v-if="labels.length" class="sl-chart__pie-legend">
          <div v-for="(item, idx) in labels" :key="idx" class="sl-chart__pie-legend-item">
            <span class="sl-chart__pie-dot" :style="{ background: colors[idx % colors.length] }"></span>
            <span>{{ item }}</span>
            <span class="sl-chart__pie-value">{{ formatValue(chartData[idx]) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DataSource {
  labels?: string[]
  datasets?: { data: number[] }[]
  values?: number[]
}

interface Props {
  chartType: 'line' | 'bar' | 'pie'
  dataSource?: DataSource
  title?: string
  showLegend?: boolean
  smooth?: boolean
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  chartType: 'line',
  showLegend: true,
  smooth: true,
  colors: () => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
})

const chartData = computed(() => {
  if (props.dataSource?.datasets?.[0]?.data) {
    return props.dataSource.datasets[0].data
  }
  if (props.dataSource?.values) {
    return props.dataSource.values
  }
  return []
})

const labels = computed(() => props.dataSource?.labels || [])

const legend = computed(() => {
  if (props.dataSource?.datasets?.length > 1) {
    return props.dataSource.datasets.map((_, idx) => `Series ${idx + 1}`)
  }
  return labels.value.slice(0, 6)
})

const maxValue = computed(() => {
  if (chartData.value.length === 0) return 100
  return Math.max(...chartData.value) * 1.2
})

const formatValue = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return val.toString()
}

const linePoints = computed(() => {
  if (chartData.value.length === 0) return []
  const w = 350, h = 120, pad = 40
  const max = maxValue.value || 1
  return chartData.value.map((val, idx) => ({
    x: pad + (idx / Math.max(chartData.value.length - 1, 1)) * w,
    y: 10 + h - (val / max) * h
  }))
})

const linePath = computed(() => {
  if (linePoints.value.length === 0) return ''
  return linePoints.value.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
})

const areaPath = computed(() => {
  const pts = linePoints.value
  if (pts.length === 0) return ''
  const last = pts[pts.length - 1]
  return `${linePath.value} L ${last.x} 140 L ${pts[0].x} 140 Z`
})

const pieSegments = computed(() => {
  if (chartData.value.length === 0) return []
  const total = chartData.value.reduce((sum, v) => sum + v, 0) || 1
  let angle = -90
  const r = 80
  return chartData.value.map(val => {
    const a = (val / total) * 360
    const start = angle, end = angle + a
    angle = end
    const sRad = (start * Math.PI) / 180, eRad = (end * Math.PI) / 180
    const x1 = Math.cos(sRad) * r, y1 = Math.sin(sRad) * r
    const x2 = Math.cos(eRad) * r, y2 = Math.sin(eRad) * r
    return { path: `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${x2} ${y2} Z` }
  })
})
</script>

<style scoped lang="scss">
.sl-chart {
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

.sl-chart__header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color-light, #f3f4f6);
}

.sl-chart__title { font-weight: 600; }

.sl-chart__legend {
  display: flex;
  gap: 12px;
}

.sl-chart__legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.sl-chart__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sl-chart__body { padding: 16px; }

.sl-chart--bar { display: flex; flex-direction: column; gap: 12px; }

.sl-chart__bar-item { display: flex; align-items: center; gap: 12px; }

.sl-chart__bar-label { width: 80px; font-size: 12px; color: var(--text-secondary); }

.sl-chart__bar-wrapper {
  flex: 1;
  height: 24px;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 4px;
}

.sl-chart__bar {
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}

.sl-chart__bar-value { font-size: 11px; font-weight: 600; color: #fff; }

.sl-chart--line .sl-chart__svg { width: 100%; height: 150px; }

.sl-chart__x-labels {
  display: flex;
  justify-content: space-between;
  padding: 8px 40px 0;
  font-size: 11px;
  color: var(--text-tertiary);
}

.sl-chart--pie { display: flex; align-items: center; gap: 24px; }

.sl-chart__pie-svg { width: 160px; height: 160px; }

.sl-chart__pie-segment { transition: transform 0.2s; cursor: pointer; }

.sl-chart__pie-segment:hover { transform: scale(1.05); }

.sl-chart__pie-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }

.sl-chart__pie-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }

.sl-chart__pie-dot { width: 12px; height: 12px; border-radius: 3px; }

.sl-chart__pie-value { margin-left: auto; font-weight: 600; }
</style>
```

- [ ] **Step 3: 创建组件导出文件**

```typescript
// packages/ui/src/components/data/chart/index.ts
import SlChart from './chart.vue'

SlChart.install = (app: any) => {
  app.component('SlChart', SlChart)
}

export default SlChart
```

- [ ] **Step 4: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 SlChart 相关错误

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/data/chart/
git commit -m "feat(ui): add SlChart component for data visualization"
```

---

### Task 3: SlTable 组件

**Files:**
- Create: `packages/ui/src/components/data/table/table.vue`
- Create: `packages/ui/src/components/data/table/index.ts`

- [ ] **Step 1: 创建组件目录结构**

```bash
mkdir -p packages/ui/src/components/data/table
```

- [ ] **Step 2: 实现 SlTable 组件**

```vue
<!-- packages/ui/src/components/data/table/table.vue -->
<template>
  <div class="sl-table" :class="{ 'sl-table--bordered': bordered }">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" class="sl-table__th">
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody :class="{ 'sl-table--striped': striped }">
        <tr v-for="(row, idx) in dataSource" :key="idx"
            class="sl-table__tr"
            :class="{ 'sl-table__tr--hoverable': hoverable }"
            @click="handleRowClick(row)">
          <td v-for="col in columns" :key="col.key" class="sl-table__td">
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="dataSource.length === 0" class="sl-table__empty">
      <span>{{ emptyText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  title: string
  width?: string | number
}

interface Props {
  dataSource: Record<string, any>[]
  columns: Column[]
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  dataSource: () => [],
  columns: () => [],
  striped: true,
  hoverable: true,
  bordered: false,
  emptyText: '暂无数据'
})

const emit = defineEmits<{
  rowClick: [row: Record<string, any>]
}>()

const handleRowClick = (row: Record<string, any>) => {
  if (props.hoverable) {
    emit('rowClick', row)
  }
}
</script>

<style scoped lang="scss">
.sl-table {
  width: 100%;
  overflow: auto;
  border-radius: 8px;
}

.sl-table table {
  width: 100%;
  border-collapse: collapse;
}

.sl-table--bordered {
  border: 1px solid var(--border-color, #e5e7eb);
}

.sl-table__th {
  padding: 12px 16px;
  background: var(--bg-secondary, #f9fafb);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  text-align: left;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.sl-table--striped tr:nth-child(even) {
  background: var(--bg-tertiary, #f9fafb);
}

.sl-table__td {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-secondary, #374151);
  border-bottom: 1px solid var(--border-color-light, #f3f4f6);
}

.sl-table__tr--hoverable {
  cursor: pointer;
  transition: background 0.2s;
}

.sl-table__tr--hoverable:hover {
  background: var(--bg-hover, rgba(59, 130, 246, 0.05));
}

.sl-table__empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-tertiary, #9ca3af);
}
</style>
```

- [ ] **Step 3: 创建组件导出文件**

```typescript
// packages/ui/src/components/data/table/index.ts
import SlTable from './table.vue'

SlTable.install = (app: any) => {
  app.component('SlTable', SlTable)
}

export default SlTable
```

- [ ] **Step 4: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 SlTable 相关错误

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/data/table/
git commit -m "feat(ui): add SlTable component for data list display"
```

---

### Task 4: SlProgress 组件

**Files:**
- Create: `packages/ui/src/components/data/progress/progress.vue`
- Create: `packages/ui/src/components/data/progress/index.ts`

- [ ] **Step 1: 创建组件目录结构**

```bash
mkdir -p packages/ui/src/components/data/progress
```

- [ ] **Step 2: 实现 SlProgress 组件**

```vue
<!-- packages/ui/src/components/data/progress/progress.vue -->
<template>
  <div class="sl-progress">
    <!-- Line Progress -->
    <div v-if="type === 'line'" class="sl-progress--line">
      <div class="sl-progress__bar" :style="{ height: `${strokeWidth}px` }">
        <div class="sl-progress__inner"
             :style="{ width: `${percentage}%` }"
             :class="statusClass">
          <span v-if="showText && strokeWidth >= 20" class="sl-progress__text--inner">
            {{ percentage }}%
          </span>
        </div>
      </div>
      <span v-if="showText && strokeWidth < 20" class="sl-progress__text--outer">
        {{ percentage }}%
      </span>
    </div>
    <!-- Circle Progress -->
    <div v-else-if="type === 'circle'" class="sl-progress--circle">
      <svg :width="size" :height="size" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none"
                stroke="var(--border-color, #e5e7eb)"
                :stroke-width="strokeWidth"/>
        <circle cx="50" cy="50" r="45" fill="none"
                :stroke="progressColor"
                :stroke-width="strokeWidth"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"/>
        <text v-if="showText" x="50" y="50" text-anchor="middle" dominant-baseline="middle"
              class="sl-progress__text--circle">
          {{ percentage }}%
        </text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  status?: 'success' | 'warning' | 'error'
  type?: 'line' | 'circle'
  showText?: boolean
  strokeWidth?: number
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  status: undefined,
  type: 'line',
  showText: true,
  strokeWidth: 6,
  size: 120
})

const clampedPercentage = computed(() => Math.min(100, Math.max(0, props.percentage)))

const statusClass = computed(() => {
  if (props.status === 'success') return 'sl-progress__inner--success'
  if (props.status === 'warning') return 'sl-progress__inner--warning'
  if (props.status === 'error') return 'sl-progress__inner--error'
  return ''
})

const progressColor = computed(() => {
  if (props.status === 'success') return '#10b981'
  if (props.status === 'warning') return '#f59e0b'
  if (props.status === 'error') return '#ef4444'
  return '#3b82f6'
})

const circumference = computed(() => 2 * Math.PI * 45)
const dashOffset = computed(() => circumference.value * (1 - clampedPercentage.value / 100))
</script>

<style scoped lang="scss">
.sl-progress { display: flex; align-items: center; }

.sl-progress--line {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sl-progress__bar {
  flex: 1;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 100px;
  overflow: hidden;
}

.sl-progress__inner {
  height: 100%;
  background: #3b82f6;
  border-radius: 100px;
  transition: width 0.3s ease;
}

.sl-progress__inner--success { background: #10b981; }
.sl-progress__inner--warning { background: #f59e0b; }
.sl-progress__inner--error { background: #ef4444; }

.sl-progress__text--inner {
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding-left: 8px;
}

.sl-progress__text--outer {
  font-size: 14px;
  color: var(--text-secondary);
  min-width: 40px;
}

.sl-progress--circle {
  display: inline-flex;
}

.sl-progress__text--circle {
  font-size: 16px;
  font-weight: 600;
  fill: var(--text-primary);
}
</style>
```

- [ ] **Step 3: 创建组件导出文件**

```typescript
// packages/ui/src/components/data/progress/index.ts
import SlProgress from './progress.vue'

SlProgress.install = (app: any) => {
  app.component('SlProgress', SlProgress)
}

export default SlProgress
```

- [ ] **Step 4: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 SlProgress 相关错误

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/data/progress/
git commit -m "feat(ui): add SlProgress component for progress display"
```

---

### Task 5: 导出所有数据组件

**Files:**
- Modify: `packages/ui/src/components/index.ts`

- [ ] **Step 1: 添加 data 组件导出**

```typescript
// packages/ui/src/components/index.ts - 添加以下内容

// Data components
export { default as SlStatCard } from './data/stat-card'
export { default as SlChart } from './data/chart'
export { default as SlTable } from './data/table'
export { default as SlProgress } from './data/progress'
```

- [ ] **Step 2: 验证构建成功**

Run: `pnpm build:lib`
Expected: 所有 UI 组件成功构建

- [ ] **Step 3: 验证 lint 无错误**

Run: `pnpm lint`
Expected: 无错误

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/index.ts
git commit -m "feat(ui): export data components (SlStatCard, SlChart, SlTable, SlProgress)"
```

---

## Phase 2: 聊天系统集成

### Task 6: 创建组件解析服务

**Files:**
- Create: `app/src/services/component-parser.ts`

- [ ] **Step 1: 创建解析服务文件**

```typescript
// app/src/services/component-parser.ts
import { COMPONENT_META_LIST } from '@smart-link/shared'

/**
 * AI 输出 JSON 结构
 */
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

/**
 * Chat 消息组件结构
 */
interface ChatMessageComponent {
  id: string
  type: string
  props: Record<string, any>
  events: ComponentEvent[]
}

/**
 * 解析 AI 输出的组件描述
 */
export function parseAIComponentOutput(rawContent: string): AIComponentOutput {
  // 尝试解析纯 JSON
  try {
    const parsed = JSON.parse(rawContent)
    if (parsed && typeof parsed.content === 'string') {
      return {
        content: parsed.content,
        components: parsed.components || []
      }
    }
  } catch {
    // JSON 解析失败，继续尝试其他方式
  }

  // 尝试从 Markdown 代码块提取 JSON
  const jsonMatch = rawContent.match(/```json\s*\n([\s\S]+?)\n```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1])
      if (parsed && typeof parsed.content === 'string') {
        return {
          content: parsed.content,
          components: parsed.components || []
        }
      }
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
export function validateComponentProps(
  type: string,
  props: Record<string, any>
): Record<string, any> {
  const meta = COMPONENT_META_LIST.find((m) => m.type === type)
  if (!meta) {
    console.warn(`[component-parser] Unknown component type: ${type}`)
    return props
  }

  const validated: Record<string, any> = {}
  meta.props.forEach((p) => {
    if (props[p.name] !== undefined) {
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
export function createChatComponents(
  components: AIComponent[]
): ChatMessageComponent[] {
  return components.map((c) => ({
    id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: c.type,
    props: validateComponentProps(c.type, c.props),
    events: c.events || []
  }))
}

// 导出类型
export type { AIComponentOutput, AIComponent, ComponentEvent, ChatMessageComponent }
```

- [ ] **Step 2: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 component-parser 相关错误

- [ ] **Step 3: Commit**

```bash
git add app/src/services/component-parser.ts
git commit -m "feat(explore): add component-parser service for AI output parsing"
```

---

### Task 7: 扩展 ExploreView 组件渲染器

**Files:**
- Modify: `app/src/views/explore/ExploreView.vue` (约第 624-666 行 import 区域 + 第 858-866 行 getComponentRenderer)

- [ ] **Step 1: 添加 UI 组件导入**

```typescript
// app/src/views/explore/ExploreView.vue - 在现有导入后添加

import { markRaw } from 'vue'
import { SlStatCard, SlChart, SlTable, SlProgress } from '@smart-link/ui'
```

- [ ] **Step 2: 扩展 getComponentRenderer 函数**

```typescript
// app/src/views/explore/ExploreView.vue - 替换现有 getComponentRenderer 函数

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
    'table': markRaw(SlTable),
    'progress': markRaw(SlProgress)
  }

  // 3. 合并查找（聊天组件优先，保持向后兼容）
  return chatComponents[type] || uiComponents[type] || uiComponents[`Sl${type}`] || 'div'
}
```

- [ ] **Step 3: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 ExploreView 相关错误

- [ ] **Step 4: Commit**

```bash
git add app/src/views/explore/ExploreView.vue
git commit -m "feat(explore): extend getComponentRenderer with UI library components"
```

---

### Task 8: 增强事件处理

**Files:**
- Modify: `app/src/views/explore/ExploreView.vue` (约第 854-856 行 handleComponentEvent)

- [ ] **Step 1: 增强 handleComponentEvent 函数**

```typescript
// app/src/views/explore/ExploreView.vue - 替换现有 handleComponentEvent 函数

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
        if (activeConversationId.value) {
          sendUserMessage(message, activeConversationId.value)
        }
      } else if (payload?.message) {
        if (activeConversationId.value) {
          sendUserMessage(payload.message, activeConversationId.value)
        }
      }
      break

    case 'navigate':
      if (payload?.path) {
        router.push(payload.path)
      }
      break

    case 'callback':
      // 自定义回调（可扩展）
      console.log('[ExploreView] Component callback:', payload)
      break

    default:
      console.warn('[ExploreView] Unknown component action:', action)
  }
}
```

- [ ] **Step 2: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add app/src/views/explore/ExploreView.vue
git commit -m "feat(explore): enhance handleComponentEvent with sendMessage and navigate actions"
```

---

### Task 9: Store 流式解析增强

**Files:**
- Modify: `app/src/store/modules/explore.ts` (第 1 行 import 区域 + 第 907-924 行 onComplete 回调)

- [ ] **Step 1: 添加解析服务导入**

```typescript
// app/src/store/modules/explore.ts - 在现有导入后添加

import { parseAIComponentOutput, createChatComponents } from '@/services/component-parser'
```

- [ ] **Step 2: 增强 onComplete 回调**

```typescript
// app/src/store/modules/explore.ts - 在 sendSSEMessage 的 onComplete 回调中添加解析逻辑

// 完成回调（约第 907 行）
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
        console.warn('[explore] Failed to parse AI components:', e)
        // 解析失败不影响文本显示
      }

      // tool_calls 处理（保持原有逻辑）
      if (this.accumulatedToolCalls.length > 0) {
        // 现有 tool_calls 处理逻辑...
      }
    }
    conv.updatedAt = Date.now()
  }
}
```

- [ ] **Step 3: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 explore.ts 相关错误

- [ ] **Step 4: Commit**

```bash
git add app/src/store/modules/explore.ts
git commit -m "feat(explore): add AI component parsing in sendSSEMessage onComplete"
```

---

### Task 10: 类型定义扩展

**Files:**
- Modify: `app/src/types/index.ts`

- [ ] **Step 1: 扩展 ChatComponent 类型**

```typescript
// app/src/types/index.ts - 找到 ChatComponent 接口并扩展

// 如果 ChatComponent 已存在，添加 events 字段
// 如果不存在，添加完整定义

interface ComponentEvent {
  name: string       // 事件名称：'click' | 'rowClick' | 'select'
  action: string     // 动作类型：'sendMessage' | 'navigate' | 'callback'
  payload?: any      // 附加数据
}

interface ChatComponent {
  id: string
  type: string       // 'SlStatCard' | 'SlChart' | 'SlTable' | 'SlProgress' | 现有聊天组件类型
  props: Record<string, any>
  events?: ComponentEvent[]  // 新增：组件事件配置
}
```

- [ ] **Step 2: 验证无 lint 错误**

Run: `pnpm lint`
Expected: 无 types/index.ts 相关错误

- [ ] **Step 3: Commit**

```bash
git add app/src/types/index.ts
git commit -m "feat(types): extend ChatComponent with events field"
```

---

### Task 11: 最终验证

- [ ] **Step 1: 运行完整 lint 检查**

Run: `pnpm lint`
Expected: 无错误

- [ ] **Step 2: 运行完整构建**

Run: `pnpm build`
Expected: 所有 9 个包成功构建

- [ ] **Step 3: 本地测试**

Run: `pnpm dev`
Expected: 应用启动成功

- [ ] **Step 4: Commit 集成完成标记**

```bash
git add -A
git commit -m "feat(explore): complete AI chat component rendering integration

- Phase 1: Implement SlStatCard, SlChart, SlTable, SlProgress UI components
- Phase 2: Integrate component-parser service, extend ExploreView renderer,
  enhance event handling, add AI output parsing in explore store"
```

---

## 测试用例示例

### 手动测试步骤

1. 启动开发服务器：`pnpm dev`
2. 导航到探索中心
3. 创建新对话，发送测试消息：
   ```
   显示一个销量指标卡片，数值为 1234，趋势上涨 12.5%
   ```
4. 观察 AI 回复是否渲染 SlStatCard 组件

### 测试 JSON 输入（可在 mock 数据中使用）

```json
{
  "content": "📊 **销售数据分析**\n\n本月表现良好：",
  "components": [
    {
      "type": "SlStatCard",
      "props": {
        "title": "总销量",
        "value": 1234,
        "trend": "up",
        "trendValue": "+12.5%"
      }
    },
    {
      "type": "SlChart",
      "props": {
        "chartType": "line",
        "dataSource": {
          "labels": ["1月", "2月", "3月", "4月", "5月"],
          "datasets": [{ "data": [100, 120, 150, 180, 200] }]
        }
      }
    }
  ]
}
```