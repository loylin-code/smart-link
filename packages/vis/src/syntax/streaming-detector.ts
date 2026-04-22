import type { ChartType, RenderState, StreamingConfig, VisConfig } from '../types'
import { ChartRegistry } from '../core/registry'

/**
 * Code block markers that indicate chart configuration
 */
const CODE_BLOCK_MARKERS = ['chart-json', 'vis', 'chart']

/**
 * Partial JSON patterns to detect chart type early
 * Matches: "type": "line", "type":"pie", etc.
 */
const TYPE_PATTERN = /"type"\s*:\s*"([^"]+)"/

/**
 * Data array start pattern
 * Matches: "data": [
 */
const DATA_START_PATTERN = /"data"\s*:\s*\[/

/**
 * StreamingDetector - State machine for detecting streaming JSON chart configs.
 *
 * States: idle → loading → partial → ready → error
 *
 * Usage:
 * ```ts
 * const detector = new StreamingDetector()
 * detector.reset()
 *
 * // Feed streaming chunks
 * detector.detect('Here is a chart:\n```chart-json\n')
 * // → { state: 'loading', detectedType: null, progress: 10 }
 *
 * detector.detect('{ "type": "line", ')
 * // → { state: 'partial', detectedType: 'line', progress: 30 }
 *
 * detector.detect('"data": [...] }```')
 * // → { state: 'ready', partialConfig: {...}, progress: 100 }
 * ```
 */
export class StreamingDetector {
  private state: RenderState = 'idle'
  private buffer: string = ''
  private detectedType: ChartType | null = null
  private codeBlockStartIndex: number = -1
  private codeBlockEndIndex: number = -1
  private partialConfig: VisConfig | null = null
  private lastError: string | undefined

  /**
   * Reset detector to initial state.
   * Call this before starting a new streaming session.
   */
  reset(): void {
    this.state = 'idle'
    this.buffer = ''
    this.detectedType = null
    this.codeBlockStartIndex = -1
    this.codeBlockEndIndex = -1
    this.partialConfig = null
    this.lastError = undefined
  }

  /**
   * Get current state without processing a chunk.
   */
  getState(): RenderState {
    return this.state
  }

  /**
   * Get current buffer content.
   */
  getBuffer(): string {
    return this.buffer
  }

  /**
   * Process a streaming chunk and return the current streaming config.
   *
   * @param chunk - The incoming text chunk from LLM stream
   * @returns StreamingConfig with current state, detected type, partial config, and progress
   */
  detect(chunk: string): StreamingConfig {
    // Append chunk to buffer
    this.buffer += chunk

    // Process buffer based on current state
    switch (this.state) {
      case 'idle':
        this.processIdleState()
        break
      case 'loading':
        this.processLoadingState()
        break
      case 'partial':
        this.processPartialState()
        break
      case 'ready':
        // Already complete, no further processing
        break
      case 'error':
        // Error state, wait for reset
        break
    }

    return this.buildStreamingConfig()
  }

  /**
   * Process idle state - look for code block start marker.
   */
  private processIdleState(): void {
    for (const marker of CODE_BLOCK_MARKERS) {
      const markerPattern = '```' + marker
      const startIndex = this.buffer.indexOf(markerPattern)
      if (startIndex !== -1) {
        this.codeBlockStartIndex = startIndex + markerPattern.length
        this.state = 'loading'
        return
      }
    }
  }

  /**
   * Process loading state - look for JSON content and detect type.
   */
  private processLoadingState(): void {
    // Check for code block end (``` after start)
    const endPattern = '```'
    const searchStart = this.codeBlockStartIndex
    const endIndex = this.buffer.indexOf(endPattern, searchStart)

    if (endIndex !== -1) {
      this.codeBlockEndIndex = endIndex
      // Extract JSON content
      const jsonContent = this.buffer
        .slice(this.codeBlockStartIndex, endIndex)
        .trim()

      // Try to parse complete JSON
      this.tryParseCompleteJson(jsonContent)
      return
    }

    // Look for type pattern in partial content
    const contentAfterStart = this.buffer.slice(this.codeBlockStartIndex)
    const typeMatch = TYPE_PATTERN.exec(contentAfterStart)

    if (typeMatch) {
      const typeStr = typeMatch[1]
      if (ChartRegistry.isValidChartType(typeStr)) {
        this.detectedType = typeStr
        this.state = 'partial'

        // Try to build partial config
        this.tryBuildPartialConfig()
      }
    }
  }

  /**
   * Process partial state - continue parsing until complete or error.
   */
  private processPartialState(): void {
    // Check for code block end
    const endPattern = '```'
    const searchStart = this.codeBlockStartIndex
    const endIndex = this.buffer.indexOf(endPattern, searchStart)

    if (endIndex !== -1) {
      this.codeBlockEndIndex = endIndex
      // Extract JSON content
      const jsonContent = this.buffer
        .slice(this.codeBlockStartIndex, endIndex)
        .trim()

      // Try to parse complete JSON
      this.tryParseCompleteJson(jsonContent)
      return
    }

    // Continue building partial config with more content
    this.tryBuildPartialConfig()
  }

  /**
   * Try to parse complete JSON and transition to ready or error state.
   */
  private tryParseCompleteJson(jsonContent: string): void {
    // Handle empty content
    if (!jsonContent) {
      this.state = 'error'
      this.lastError = 'Empty chart configuration'
      return
    }

    try {
      const parsed = JSON.parse(jsonContent) as VisConfig

      // Validate type
      if (!parsed.type || !ChartRegistry.isValidChartType(parsed.type)) {
        this.state = 'error'
        this.lastError = `Invalid chart type: ${parsed.type}`
        return
      }

      // Validate data
      if (!parsed.data || !Array.isArray(parsed.data)) {
        this.state = 'error'
        this.lastError = 'Missing or invalid data array'
        return
      }

      // Success - transition to ready
      this.state = 'ready'
      this.detectedType = parsed.type
      this.partialConfig = parsed
      this.lastError = undefined
    } catch (e) {
      this.state = 'error'
      this.lastError = `JSON parse error: ${(e as Error).message}`
    }
  }

  /**
   * Try to build a partial config from incomplete JSON.
   * Uses lenient parsing strategies for streaming tolerance.
   */
  private tryBuildPartialConfig(): void {
    const contentAfterStart = this.buffer.slice(this.codeBlockStartIndex)

    // Build partial config with detected values
    const partial: Partial<VisConfig> = {}

    // Extract type if detected
    if (this.detectedType) {
      partial.type = this.detectedType
    }

    // Try to extract title
    const titleMatch = /"title"\s*:\s*"([^"]+)"/.exec(contentAfterStart)
    if (titleMatch) {
      partial.title = titleMatch[1]
    }

    // Check for data array presence (indicates progress)
    const hasDataStart = DATA_START_PATTERN.test(contentAfterStart)

    // Try to parse partial data array
    // Look for patterns like "data": [ {...}, {...}
    const dataArrayMatch = /"data"\s*:\s*\[(.*)/.exec(contentAfterStart)
    if (dataArrayMatch) {
      const dataContent = dataArrayMatch[1]
      // Count opening braces to estimate data items
      const openBraces = (dataContent.match(/\{/g) || []).length
      const closeBraces = (dataContent.match(/\}/g) || []).length

      // If we have at least one complete object, try to parse it
      if (openBraces > 0 && closeBraces > 0) {
        try {
          // Attempt to construct a valid JSON array from partial content
          const partialArrayStr = '[' + dataContent.slice(0, dataContent.lastIndexOf('}') + 1) + ']'
          const partialData = JSON.parse(partialArrayStr)
          if (Array.isArray(partialData)) {
            partial.data = partialData
          }
        } catch {
          // Partial data parse failed, continue without data
        }
      }
    }

    // Build partial config if we have at least type
    if (partial.type) {
      this.partialConfig = partial as VisConfig
    }
  }

  /**
   * Calculate progress percentage based on current state and buffer.
   */
  private calculateProgress(): number {
    switch (this.state) {
      case 'idle':
        return 0
      case 'loading':
        return 10
      case 'partial':
        // Progress increases based on content completeness
        if (!this.detectedType) return 20

        const contentAfterStart = this.buffer.slice(this.codeBlockStartIndex)

        // Check for various completion indicators
        let progress = 30 // Base for having type

        if (this.partialConfig?.title) progress += 10

        // Check for data array presence
        if (DATA_START_PATTERN.test(contentAfterStart)) {
          progress += 20

          // Estimate data completeness by counting braces
          const openBraces = (contentAfterStart.match(/\{/g) || []).length
          const closeBraces = (contentAfterStart.match(/\}/g) || []).length

          // If close braces < open braces, we're still streaming data
          if (closeBraces > 0) {
            progress += Math.min(20, (closeBraces / openBraces) * 20)
          }
        }

        // Check for closing brace (indicating object completeness)
        if (contentAfterStart.includes('}')) {
          progress += 10
        }

        return Math.min(90, progress) // Cap at 90 for partial state
      case 'ready':
        return 100
      case 'error':
        return 0
      default:
        return 0
    }
  }

  /**
   * Build the StreamingConfig object for return.
   */
  private buildStreamingConfig(): StreamingConfig {
    return {
      state: this.state,
      detectedType: this.detectedType,
      partialConfig: this.partialConfig,
      progress: this.calculateProgress(),
      error: this.lastError,
    }
  }

  /**
   * Extract the complete JSON content from buffer if in ready state.
   * Returns null if not ready or extraction fails.
   */
  extractCompleteJson(): string | null {
    if (this.state !== 'ready' || this.codeBlockEndIndex === -1) {
      return null
    }

    return this.buffer
      .slice(this.codeBlockStartIndex, this.codeBlockEndIndex)
      .trim()
  }

  /**
   * Check if a string contains a valid chart code block marker.
   * Static utility for quick validation.
   */
  static hasChartMarker(text: string): boolean {
    for (const marker of CODE_BLOCK_MARKERS) {
      if (text.includes('```' + marker)) {
        return true
      }
    }
    return false
  }
}