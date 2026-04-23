import { Chart } from '@antv/g2'
import type { ChartFactory, ChartInstance, ChartOptions, VisConfig } from '../../types'

/**
 * Bar chart factory.
 * Creates and manages a bar chart instance using @antv/g2.
 *
 * Features:
 * - Supports stack mode for grouped bars
 * - Supports light/dark theme switching
 * - Supports custom axis field mapping
 * - Returns { render, destroy, getConfig } interface
 */
export const BarChart: ChartFactory = (options: ChartOptions): ChartInstance => {
  let chart: Chart | null = null
  let currentConfig: VisConfig | null = null

  /**
   * Resolve container element from options.
   */
  const resolveContainer = (): HTMLElement => {
    if (typeof options.container === 'string') {
      const el = document.querySelector(options.container)
      if (!el) {
        throw new Error(`Container not found: ${options.container}`)
      }
      return el as HTMLElement
    }
    return options.container
  }

  /**
   * Get theme configuration for G2.
   */
  const getThemeConfig = () => {
    return options.theme === 'dark' ? 'classicDark' : 'classic'
  }

  /**
   * Render the bar chart with given configuration.
   */
  const render = (config: VisConfig): void => {
    currentConfig = config

    // Destroy existing chart
    if (chart) {
      chart.destroy()
      chart = null
    }

    const container = resolveContainer()
    const theme = getThemeConfig()

    // Create G2 chart instance - fixed width, canvas renderer
    const fixedWidth = options.width ?? 400
    chart = new Chart({
      container,
      width: fixedWidth,
      height: options.height ?? 280,
      theme,
      autoFit: false
    })

    // Disable interactions to prevent potential render loops
    try {
      chart.interaction(false)
    } catch { /* ignore if not supported */ }

    // Determine field mappings
    const xField = config.xField ?? 'category'
    const yField = config.yField ?? 'value'
    const colorField = config.categoryField ?? undefined
    const isStack = config.stack ?? false

    // Configure bar chart using simpler API
    const interval = chart
      .interval()
      .data(config.data)
      .encode('x', xField)
      .encode('y', yField)
      .style('radius', 4)

    if (colorField) {
      interval.encode('color', colorField).legend(true)
    }

    if (isStack) {
      interval.transform({ type: 'stackY' })
    }

    // Add title if provided
    if (config.title) {
      chart.title({
        text: config.title,
        fontSize: 16,
        fontWeight: 'bold',
      })
    }

    // Render the chart
    chart.render()
  }

  /**
   * Destroy the chart and cleanup resources.
   */
  const destroy = (): void => {
    if (chart) {
      chart.destroy()
      chart = null
    }
    currentConfig = null
  }

  /**
   * Get current chart configuration.
   */
  const getConfig = (): VisConfig => {
    if (!currentConfig) {
      throw new Error('No configuration available. Call render() first.')
    }
    return currentConfig
  }

  /**
   * Export chart as PNG image (base64).
   */
  const exportImage = (): string => {
    if (!chart) {
      throw new Error('No chart available. Call render() first.')
    }
    // G2 Chart export - use native canvas if available
    const context = chart.getContext()
    const nativeCanvas = context?.canvas?.getConfig?.()?.canvas as unknown as HTMLCanvasElement | undefined
    if (nativeCanvas) {
      return nativeCanvas.toDataURL('image/png')
    }
    return ''
  }

  return {
    render,
    destroy,
    getConfig,
    exportImage,
  }
}

export default BarChart