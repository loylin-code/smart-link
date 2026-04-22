import { Chart } from '@antv/g2'
import type { ChartFactory, ChartInstance, ChartOptions, VisConfig } from '../../types'

/**
 * Line chart factory.
 * Creates and manages a line chart instance using @antv/g2.
 *
 * Features:
 * - Supports smooth curve rendering
 * - Supports light/dark theme switching
 * - Supports custom axis field mapping
 * - Returns { render, destroy, getConfig } interface
 */
export const LineChart: ChartFactory = (options: ChartOptions): ChartInstance => {
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
   * Render the line chart with given configuration.
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

    // Create G2 chart instance
    chart = new Chart({
      container,
      width: options.width ?? container.clientWidth,
      height: options.height ?? 400,
      theme,
      autoFit: false,  // Disable autoFit to prevent ResizeObserver loop
    })

    // Determine field mappings
    const xField = config.xField ?? 'category'
    const yField = config.yField ?? 'value'
    const colorField = config.categoryField ?? undefined

    // Configure line chart using simpler API
    const line = chart
      .line()
      .data(config.data)
      .encode('x', xField)
      .encode('y', yField)
      .style('smooth', config.smooth ?? false)
      .style('lineWidth', 2)

    if (colorField) {
      line.encode('color', colorField).legend(true)
    }

    // Add point markers
    chart
      .point()
      .data(config.data)
      .encode('x', xField)
      .encode('y', yField)
      .style('r', 3)

    if (colorField) {
      chart.point().encode('color', colorField)
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

export default LineChart