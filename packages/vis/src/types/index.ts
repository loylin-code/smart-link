// Chart types supported by the visualization engine
export type ChartType =
  | 'line'
  | 'pie'
  | 'bar'
  | 'area'
  | 'scatter'
  | 'summary'
  | 'stat-card'
  | 'table'

// Rendering state for streaming
export type RenderState = 'idle' | 'loading' | 'partial' | 'ready' | 'error'

// Chart configuration (LLM output format)
export interface VisConfig {
  type: ChartType
  data: any[]
  title?: string
  // Common chart config
  xField?: string
  yField?: string
  categoryField?: string
  valueField?: string
  // Chart-specific config
  innerRadius?: number // Pie chart inner radius
  smooth?: boolean // Line chart smoothing
  stack?: boolean // Stack mode
  // Card config
  metric?: string
  value?: number
  unit?: string
  trend?: { direction: 'up' | 'down'; percentage: number }
  // Tab page template
  detailTemplate?: string // Template ID to open on click
}

// Streaming configuration
export interface StreamingConfig {
  state: RenderState
  detectedType: ChartType | null
  partialConfig: VisConfig | null
  progress: number // 0-100
  error?: string
}

// Tab page item
export interface TabItem {
  id: string
  title: string
  template: TabTemplate
  data: VisConfig
  closable: boolean
}

// Tab template definition
export interface TabTemplate {
  id: string
  name: string
  component: unknown // Vue component
  slots?: string[] // Required data fields
}

// Chart instance interface
export interface ChartInstance {
  render: (config: VisConfig) => void
  destroy: () => void
  getConfig: () => VisConfig
  exportImage?: () => string
}

// Chart factory options
export interface ChartOptions {
  container: HTMLElement | string
  width?: number
  height?: number
  theme?: 'light' | 'dark'
}

// Chart factory function type
export type ChartFactory = (options: ChartOptions) => ChartInstance

// SmartVis engine options
export interface SmartVisOptions {
  container: HTMLElement | string
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  onChartClick?: (chart: ChartInstance, config: VisConfig) => void
  streaming?: boolean
}

// Chart block config (from markdown parsing)
export interface ChartBlockConfig {
  config: VisConfig
  raw: string
  position: {
    start: number
    end: number
  }
}
