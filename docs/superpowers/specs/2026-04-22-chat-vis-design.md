# LLM 驱动的聊天组件渲染设计

**Date:** 2026-04-22
**Status:** Draft - Pending Review
**Author:** Sisyphus

## Overview

设计一个独立包 `@smart-link/chat-vis`，实现 LLM 在聊天内容区域主动返回可视化图表和 UI 组件，并支持点击图表后在右侧打开 Tab 页面展示详细分析视图。

参考项目：[antvis/gpt-vis](https://github.com/antvis/GPT-Vis)

## Requirements Summary

| 维度 | 决定 |
|------|------|
| 组件类型 | 聊天内：数据卡片 + 图表；点击后：Tab 页面 |
| 触发方式 | AI 主动返回图表配置 |
| 输出格式 | Markdown 代码块（```chart-json） |
| Tab 内容 | 前端预定义模板 + 图表数据填充 |
| 流式体验 | 检测到图表配置时立即显示 Loading 占位符 |

## Architecture

### Package Structure

```
packages/vis/                        # @smart-link/chat-vis
├── src/
│   ├── index.ts                    # 导出 SmartVis 类 + 类型
│   │
│   ├── core/
│   │   ├── SmartVis.ts             # 主引擎类
│   │   ├── registry.ts             # 图表类型注册表
│   │   └── context.ts              # 渲染上下文
│   │
│   ├── syntax/
│   │   ├── parser.ts               # vis 语法 → JSON 解析器
│   │   ├── streaming-detector.ts   # 流式检测器（含 Loading 状态）
│   │   └── tokens.ts               # 语法 token 定义
│   │
│   ├── charts/                     # 图表工厂
│   │   ├── index.ts
│   │   ├── line/
│   │   ├── pie/
│   │   ├── bar/
│   │   ├── area/
│   │   └── summary/
│   │
│   ├── cards/                      # 数据卡片
│   │   ├── StatCard/
│   │   ├── TableCard/
│   │   └── ProgressCard/
│   │
│   ├── markdown/
│   │   ├── code-block-handler.ts   # ```chart-json 解析
│   │   └── renderer-plugin.ts      # markdown-it 插件
│   │
│   ├── tabs/
│   │   ├── TabManager.ts           # Tab 容器管理
│   │   ├── templates/              # 预定义页面模板
│   │   │   ├── ChartDetail.vue
│   │   │   ├── DataAnalysis.vue
│   │   │   └── Comparison.vue
│   │
│   ├── types/
│   │   ├── index.ts                # VisConfig, ChartType, TabTemplate
│   │   └── schemas.ts              # JSON Schema 验证
│   │
│   ├── vue/
│   │   ├── VisRenderer.vue         # 渲染器组件
│   │   ├── ChartPlaceholder.vue    # Loading 占位组件
│   │   ├── MarkdownWithCharts.vue  # Markdown + 图表渲染
│   │   ├── ChartCard.vue           # 可点击图表卡片
│   │   └── TabPanel.vue            # Tab 页面容器
│   │
│   └── utils/
│       ├── container.ts            # DOM 容器解析
│       └── streaming.ts            # 流式渲染缓冲
│
├── package.json
└── README.md
```

**设计理念**：
- **框架无关核心**：`core/`、`syntax/`、`charts/` 纯 TS/JS，不依赖 Vue
- **Vue 适配层**：`vue/` 提供组件封装，便于在 ExploreView 中使用
- **模板分离**：`tabs/templates/` 存放预定义页面模板

### Core Types

```typescript
// 图表类型
export type ChartType = 'line' | 'pie' | 'bar' | 'area' | 'scatter' | 'summary' | 'stat-card' | 'table'

// 图表配置（LLM 输出格式）
export interface VisConfig {
  type: ChartType
  data: any[]
  title?: string
  // 图表通用配置
  xField?: string
  yField?: string
  categoryField?: string
  valueField?: string
  // 图表特定配置
  innerRadius?: number       // 饼图内半径
  smooth?: boolean           // 折线平滑
  stack?: boolean            // 堆叠
  // 卡片配置
  metric?: string
  value?: number
  unit?: string
  trend?: { direction: 'up' | 'down', percentage: number }
  // Tab 页面模板
  detailTemplate?: string    // 点击后打开的模板 ID
}

// 流式渲染状态
export type RenderState = 'idle' | 'loading' | 'partial' | 'ready' | 'error'

export interface StreamingConfig {
  state: RenderState
  detectedType: ChartType | null
  partialConfig: VisConfig | null
  progress: number           // 0-100
  error?: string
}

// Tab 页面项
export interface TabItem {
  id: string
  title: string
  template: TabTemplate
  data: VisConfig
  closable: boolean
}

// Tab 模板定义
export interface TabTemplate {
  id: string
  name: string
  component: any             // Vue 组件
  slots?: string[]           // 需要的数据字段
}
```

### SmartVis Engine API

```typescript
export interface SmartVisOptions {
  container: HTMLElement | string
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  onChartClick?: (chart: ChartInstance, config: VisConfig) => void
  streaming?: boolean
}

export class SmartVis {
  constructor(options: SmartVisOptions)

  // 核心渲染方法
  render(config: string | VisConfig): void

  // 流式渲染（增量更新）
  renderStream(chunk: string): void

  // 检测是否为有效图表配置
  isValidConfig(input: string): boolean

  // 销毁
  destroy(): void

  // 注册自定义图表类型
  registerType(type: string, factory: ChartFactory): void

  // 获取当前图表实例
  getCurrentChart(): ChartInstance | null

  // 触发 Tab 页面打开
  openDetailTab(templateId: string, data: any): void
}
```

### Chart Factory Pattern

每个图表类型是一个工厂函数，返回统一接口：

```typescript
export interface ChartInstance {
  render: (config: VisConfig) => void
  destroy: () => void
  getConfig: () => VisConfig
  exportImage?: () => string
}

export interface ChartFactory {
  (options: ChartOptions): ChartInstance
}
```

**工厂示例（折线图）**：

```typescript
export const LineChart: ChartFactory = (options: ChartOptions): ChartInstance => {
  let chart: Chart | null = null
  let currentConfig: VisConfig | null = null
  
  const render = (config: VisConfig): void => {
    currentConfig = config
    if (chart) chart.destroy()
    
    chart = new Chart({ container: options.container, ... })
    chart.options({ type: 'line', data: config.data, encode: { x: 'category', y: 'value' } })
    chart.render()
  }
  
  const destroy = (): void => { chart?.destroy(); chart = null }
  const getConfig = (): VisConfig => currentConfig!
  
  return { render, destroy, getConfig }
}
```

### Markdown Integration

使用 markdown-it 插件解析 ```chart-json 代码块：

```typescript
export function createChartPlugin(md: MarkdownIt, options: {
  onChartBlock?: (config: ChartBlockConfig) => void
  renderChart?: (config: VisConfig) => string
}) {
  md.block.ruler.before('fence', 'chart-block', (state, startLine, endLine) => {
    // 检测 ```chart-json 或 ```vis 或 ```chart
    // 解析 JSON 内容
    // 生成占位 HTML（Vue 组件会替换）
  })
}
```

**Vue 组件集成**：

```vue
<MarkdownWithCharts 
  :content="message.content" 
  :streaming="message.isStreaming"
  @chart-click="handleChartClick"
/>
```

### Streaming Loading Placeholder

流式渲染时，检测到图表配置开始立即显示 Loading 占位符：

```typescript
export class StreamingDetector {
  detect(chunk: string): StreamingConfig {
    // 阶段1: idle → loading（检测到 ```chart-json）
    // 阶段2: loading → partial（解析出 type 和部分 data）
    // 阶段3: partial → ready（JSON 完整）
    // 阶段4: error（解析失败）
  }
}
```

**占位组件状态**：
- `idle`: 无图表
- `loading`: 检测到代码块，显示骨架动画 + 10% 进度
- `partial`: 解析出图表类型，更新提示 + 显示预览图表
- `ready`: 完整配置，移除占位符，正式渲染
- `error`: 解析失败，显示错误提示

### Tab Page Interaction

点击聊天区域图表 → 右侧打开 Tab 页面：

```typescript
export class TabManager {
  openTab(templateId: string, data: VisConfig, options?: {
    title?: string
    replaceExisting?: boolean
  }): TabItem
  
  closeTab(tabId: string): void
  switchTab(tabId: string): void
  getActiveTab(): TabItem | null
  registerTemplate(template: TabTemplate): void
}
```

**预定义模板**：
- `chart-detail`: 图表详情（大尺寸图表 + 统计摘要 + 数据表格）
- `data-analysis`: 数据分析（图表 + 趋势解读 + 洞察）
- `comparison`: 对比分析（多图表对比）

## Data Flow

```
LLM Response → SSE Stream → chat-completions.ts → explore store → Message.content
                                                           ↓
                              MarkdownWithCharts.vue → markdown-it render
                                                           ↓
                              chart-plugin → 检测 ```chart-json → ChartPlaceholder
                                                           ↓
                              StreamingDetector → partial → 预览图表
                                                           ↓
                              ready → SmartVis.render() → 正式图表
                                                           ↓
                              点击 → TabManager.openTab() → TabPanel（右侧）
```

**流式渲染时序**：

```
Time:  0ms    100ms   200ms   300ms   400ms   500ms   600ms   Complete

LLM:   "请看"  "下面"  "```ch" "art-j" "son"   "{type" ":line" "[DONE]"

State: idle    idle    loading loading partial partial ready   complete

UI:    文本    文本    ┌─────────────────────┐  ┌──────────────┐
                       │ 📊 图表加载中...    │  │              │
                       │ ████████░░░░ 30%   │  │  完整图表    │
                       │ [骨架动画]          │  │  正式渲染    │
                       └─────────────────────┘  └──────────────┘
```

## Integration Points

### ExploreView.vue Changes

1. **替换 renderMarkdown stub**（第 360 行）：
   ```vue
   <MarkdownWithCharts 
     :content="message.content"
     :streaming="message.isStreaming"
     @chart-click="handleChartClick"
   />
   ```

2. **新增右侧 Tab 面板**：
   ```vue
   <aside v-if="tabManager.getAllTabs().length" class="explore-tabs">
     <TabPanel :manager="tabManager" />
   </aside>
   ```

3. **处理图表点击**：
   ```typescript
   const tabManager = new TabManager()
   
   const handleChartClick = (config: VisConfig) => {
     tabManager.openTab(
       config.detailTemplate || 'chart-detail',
       config,
       { title: config.title || '图表详情' }
     )
   }
   ```

### chat-completions.ts Changes

无需修改，SSE 流式机制已支持增量内容传递。

### explore.ts Store Changes

可选：在 `onComplete` 时调用 `parseAIComponentOutput` 检测图表配置，提前准备 Tab 数据。

## Implementation Phases

### Phase 1: Core Package (High Priority)

- 创建 `packages/vis/` 目录结构
- 实现 `SmartVis` 类和 `registry`
- 实现 `StreamingDetector` 和 `parser`
- 实现 3 个基础图表工厂：line、pie、bar
- 实现 `ChartPlaceholder.vue` 占位组件

### Phase 2: Markdown Integration (High Priority)

- 实现 `createChartPlugin` markdown-it 插件
- 实现 `MarkdownWithCharts.vue` 组件
- 替换 ExploreView 的 `renderMarkdown`

### Phase 3: Tab System (Medium Priority)

- 实现 `TabManager` 类
- 实现 3 个预定义模板：ChartDetail、DataAnalysis、Comparison
- 实现 `TabPanel.vue` 组件
- 集成到 ExploreView 右侧

### Phase 4: Additional Charts (Low Priority)

- 添加 area、scatter 图表
- 添加 stat-card、table-card 数据卡片
- 添加 Comparison 对比模板

## Dependencies

| Package | Purpose |
|---------|---------|
| `@antv/g2` | 图表渲染引擎（可选 ECharts） |
| `markdown-it` | Markdown 解析 |
| `vue` | Vue 组件封装 |

## Testing Strategy

1. **单元测试**：`StreamingDetector` 各状态转换
2. **组件测试**：`ChartPlaceholder` 骨架动画、进度更新
3. **集成测试**：SSE 流式 → 占位 → 正式渲染 → Tab 打开
4. **E2E 测试**：聊天中图表交互完整流程

## Open Questions

1. 图表库选择：G2 vs ECharts？（建议 G2，与 gpt-vis 一致）
2. Tab 页面是否需要支持 LLM 动态生成 Schema？（当前设计为预定义模板）
3. 是否需要支持多图表组合？（当前设计为单图表）

## References

- [antvis/gpt-vis](https://github.com/antvis/GPT-Vis) - 参考架构
- [gpt-vis v1.0 engine](https://github.com/antvis/GPT-Vis/tree/ai/src) - 框架无关引擎
- [gpt-vis SKILL.md](https://github.com/antvis/GPT-Vis/blob/ai/skills/chart-visualization/SKILL.md) - LLM 输出格式规范