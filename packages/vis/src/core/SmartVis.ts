import type {
  ChartFactory,
  ChartInstance,
  ChartOptions,
  ChartType,
  SmartVisOptions,
  StreamingConfig,
  VisConfig,
} from '../types'
import { ChartRegistry } from './registry'
import { StreamingDetector } from '../syntax/streaming-detector'

/**
 * Placeholder render callback types
 */
export interface PlaceholderCallbacks {
  onLoading?: (progress: number) => void
  onPartial?: (config: StreamingConfig) => void
  onReady?: (config: VisConfig) => void
  onError?: (error: string) => void
}

/**
 * SmartVis - Main engine for rendering LLM-generated chart configurations.
 *
 * Features:
 * - Static rendering from complete JSON or VisConfig object
 * - Streaming rendering with placeholder/preview updates
 * - Chart type registration and factory management
 * - Tab page integration for detail views
 *
 * Usage:
 * ```ts
 * const vis = new SmartVis({
 *   container: '#chart-container',
 *   onChartClick: (chart, config) => {
 *     console.log('Chart clicked:', config.title)
 *   }
 * })
 *
 * // Static render
 * vis.render('{ "type": "line", "data": [...] }')
 *
 * // Streaming render
 * for (const chunk of stream) {
 *   vis.renderStream(chunk)
 * }
 *
 * // Clean up
 * vis.destroy()
 * ```
 */
export class SmartVis {
  private container: HTMLElement
  private registry: ChartRegistry
  private detector: StreamingDetector
  private currentChart: ChartInstance | null = null
  private currentConfig: VisConfig | null = null
  private options: SmartVisOptions
  private placeholderCallbacks: PlaceholderCallbacks | null = null
  private isStreaming: boolean = false

  constructor(options: SmartVisOptions) {
    // Resolve container
    if (typeof options.container === 'string') {
      const el = document.querySelector(options.container)
      if (!el) {
        throw new Error(`Container not found: ${options.container}`)
      }
      this.container = el as HTMLElement
    } else {
      this.container = options.container
    }

    this.options = options
    this.registry = new ChartRegistry()
    this.detector = new StreamingDetector()
    this.isStreaming = options.streaming ?? false
  }

  /**
   * Render a chart from a JSON string or VisConfig object.
   * This is the primary static rendering method.
   *
   * @param config - JSON string or VisConfig object
   */
  render(config: string | VisConfig): void {
    // Parse if string
    const parsedConfig: VisConfig = typeof config === 'string' ? this.parseConfig(config) : config

    // Validate
    if (!this.validateConfig(parsedConfig)) {
      throw new Error('Invalid chart configuration')
    }

    // Get factory for chart type
    const factory = this.registry.get(parsedConfig.type)
    if (!factory) {
      throw new Error(`Chart type not registered: ${parsedConfig.type}`)
    }

    // Destroy existing chart
    this.destroyCurrentChart()

    // Build chart options
    const chartOptions: ChartOptions = {
      container: this.container,
      width: this.options.width,
      height: this.options.height,
      theme: this.options.theme,
    }

    // Create and render chart
    this.currentChart = factory(chartOptions)
    this.currentChart.render(parsedConfig)
    this.currentConfig = parsedConfig

    // Bind click handler if provided
    if (this.options.onChartClick && this.container) {
      this.bindClickHandler(parsedConfig)
    }
  }

  /**
   * Process a streaming chunk and update rendering state.
   * Handles placeholder rendering during streaming.
   *
   * @param chunk - Streaming text chunk
   * @param callbacks - Optional callbacks for placeholder states
   */
  renderStream(chunk: string, callbacks?: PlaceholderCallbacks): void {
    this.placeholderCallbacks = callbacks ?? null

    // Detect streaming state
    const streamingConfig = this.detector.detect(chunk)

    // Handle different states
    switch (streamingConfig.state) {
      case 'idle':
        // No chart detected yet, nothing to do
        break

      case 'loading':
        // Chart block detected, show loading placeholder
        this.handleLoading(streamingConfig)
        break

      case 'partial':
        // Partial config available, show preview
        this.handlePartial(streamingConfig)
        break

      case 'ready':
        // Complete config available, render final chart
        this.handleReady(streamingConfig)
        break

      case 'error':
        // Error occurred
        this.handleError(streamingConfig)
        break
    }
  }

  /**
   * Reset streaming detector state.
   * Call this before starting a new streaming session.
   */
  resetStream(): void {
    this.detector.reset()
    this.placeholderCallbacks = null
  }

  /**
   * Check if input string is a valid chart configuration.
   *
   * @param input - JSON string to validate
   * @returns true if valid, false otherwise
   */
  isValidConfig(input: string): boolean {
    try {
      const config = this.parseConfig(input)
      return this.validateConfig(config)
    } catch {
      return false
    }
  }

  /**
   * Destroy the engine and cleanup resources.
   */
  destroy(): void {
    this.destroyCurrentChart()
    this.registry.clear()
    this.detector.reset()
    this.placeholderCallbacks = null
    this.currentConfig = null
  }

  /**
   * Register a custom chart type with its factory.
   *
   * @param type - Chart type name
   * @param factory - Chart factory function
   */
  registerType(type: string, factory: ChartFactory): void {
    this.registry.register(type, factory)
  }

  /**
   * Batch register multiple chart types.
   *
   * @param factories - Record of type to factory mappings
   */
  registerTypes(factories: Record<string, ChartFactory>): void {
    this.registry.registerBatch(factories)
  }

  /**
   * Get the current chart instance.
   * Returns null if no chart is currently rendered.
   */
  getCurrentChart(): ChartInstance | null {
    return this.currentChart
  }

  /**
   * Get the current chart configuration.
   * Returns null if no chart is currently rendered.
   */
  getCurrentConfig(): VisConfig | null {
    return this.currentConfig
  }

  /**
   * Open a detail tab page for the current chart.
   * This triggers the onChartClick callback if provided.
   *
   * @param templateId - Template ID for the tab page
   * @param data - Additional data to pass to the tab
   */
  openDetailTab(templateId: string, data?: unknown): void {
    if (!this.currentChart || !this.currentConfig) {
      console.warn('No chart currently rendered')
      return
    }

    if (this.options.onChartClick) {
      // Merge template ID into config
      const configWithTemplate: VisConfig = {
        ...this.currentConfig,
        detailTemplate: templateId,
      }

      // Trigger callback
      this.options.onChartClick(this.currentChart, configWithTemplate)
    }
  }

  /**
   * Get the underlying registry for direct manipulation.
   */
  getRegistry(): ChartRegistry {
    return this.registry
  }

  /**
   * Get the streaming detector instance.
   */
  getDetector(): StreamingDetector {
    return this.detector
  }

  /**
   * Get the container element.
   */
  getContainer(): HTMLElement {
    return this.container
  }

  // === Private Methods ===

  /**
   * Parse JSON string to VisConfig.
   */
  private parseConfig(input: string): VisConfig {
    // Try to extract JSON from markdown code block
    let jsonContent = input.trim()

    // Check for code block wrapper
    const codeBlockMatch = /^```(?:chart-json|vis|chart)?\s*\n(.+)\n```$/s.exec(jsonContent)
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1]
    }

    // Parse JSON
    const parsed = JSON.parse(jsonContent)

    // Ensure required fields
    if (!parsed.type) {
      throw new Error('Missing chart type in configuration')
    }

    if (!parsed.data) {
      parsed.data = []
    }

    return parsed as VisConfig
  }

  /**
   * Validate VisConfig object.
   */
  private validateConfig(config: VisConfig): boolean {
    // Check type validity
    if (!config.type || !ChartRegistry.isValidChartType(config.type)) {
      return false
    }

    // Check data presence (can be empty array for placeholder)
    if (!Array.isArray(config.data)) {
      return false
    }

    return true
  }

  /**
   * Destroy current chart instance if exists.
   */
  private destroyCurrentChart(): void {
    if (this.currentChart) {
      this.currentChart.destroy()
      this.currentChart = null
      this.currentConfig = null
    }
  }

  /**
   * Bind click handler to container for chart interaction.
   */
  private bindClickHandler(config: VisConfig): void {
    const handler = () => {
      if (this.currentChart && this.options.onChartClick) {
        this.options.onChartClick(this.currentChart, config)
      }
    }

    this.container.addEventListener('click', handler)
  }

  /**
   * Handle loading state - show loading placeholder.
   */
  private handleLoading(config: StreamingConfig): void {
    if (this.placeholderCallbacks?.onLoading) {
      this.placeholderCallbacks.onLoading(config.progress)
    }
  }

  /**
   * Handle partial state - show preview with detected type.
   */
  private handlePartial(config: StreamingConfig): void {
    if (this.placeholderCallbacks?.onPartial) {
      this.placeholderCallbacks.onPartial(config)
    }
  }

  /**
   * Handle ready state - render final chart.
   */
  private handleReady(config: StreamingConfig): void {
    // Reset detector for next use
    this.detector.reset()

    if (config.partialConfig) {
      // Render complete chart
      try {
        this.render(config.partialConfig)

        // Notify ready callback
        if (this.placeholderCallbacks?.onReady) {
          this.placeholderCallbacks.onReady(config.partialConfig)
        }
      } catch (e) {
        // Render failed, notify error
        if (this.placeholderCallbacks?.onError) {
          this.placeholderCallbacks.onError((e as Error).message)
        }
      }
    }
  }

  /**
   * Handle error state.
   */
  private handleError(config: StreamingConfig): void {
    if (this.placeholderCallbacks?.onError && config.error) {
      this.placeholderCallbacks.onError(config.error)
    }
  }
}