// @smart-link/chat-vis - LLM-driven chat visualization engine

// Types
export type {
  ChartType,
  RenderState,
  VisConfig,
  StreamingConfig,
  TabItem,
  TabTemplate,
  ChartInstance,
  ChartOptions,
  ChartFactory,
  SmartVisOptions,
  ChartBlockConfig,
} from './types'

// Core
export { ChartRegistry, SmartVis } from './core'
export type { PlaceholderCallbacks } from './core'

// Syntax
export { StreamingDetector } from './syntax/streaming-detector'

// Charts
export { chartFactories, LineChart, PieChart, BarChart } from './charts'

// Tabs
export { TabManager } from './tabs/TabManager'
export type { TabEvent, TabEventCallback, OpenTabOptions } from './tabs/TabManager'

// Vue Components
export { ChartPlaceholder, MarkdownWithCharts, VisRenderer, TabPanel } from './vue'
