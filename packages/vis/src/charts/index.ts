import type { ChartFactory } from '../types'
import { LineChart } from './line'
import { PieChart } from './pie'
import { BarChart } from './bar'

/**
 * Built-in chart factories for @smart-link/chat-vis.
 *
 * Usage:
 * ```ts
 * import { chartFactories } from '@smart-link/chat-vis/charts'
 * vis.registerTypes(chartFactories)
 * ```
 */
export const chartFactories: Record<string, ChartFactory> = {
  line: LineChart,
  pie: PieChart,
  bar: BarChart,
}

// Export individual factories
export { LineChart } from './line'
export { PieChart } from './pie'
export { BarChart } from './bar'

// Default export for convenience
export default chartFactories