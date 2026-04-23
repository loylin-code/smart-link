import { Chart } from '@antv/g2'
import type { ChartFactory, ChartInstance, ChartOptions, VisConfig } from '../../types'

/**
 * Pie chart factory.
 * Creates and manages a pie chart instance using @antv/g2.
 *
 * Features:
 * - Supports inner radius for donut charts
 * - Supports light/dark theme switching
 * - Supports custom value/category field mapping
 * - Returns { render, destroy, getConfig } interface
 */
export const PieChart: ChartFactory = (options: ChartOptions): ChartInstance => {
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
   * Render the pie chart with given configuration.
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
    const valueField = config.valueField ?? 'value'
    const categoryField = config.categoryField ?? 'category'
    const innerRadius = config.innerRadius ?? 0

    // Configure pie chart using simpler API
    chart.coordinate({ type: 'polar', innerRadius })

    chart
      .interval()
      .data(config.data)
      .encode('y', valueField)
      .encode('color', categoryField)
      .transform({ type: 'stackY' })
      .legend(true)
      .style('radius', 10)

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

export default PieChart