import type { ChartFactory, ChartType } from '../types'

/**
 * Registry for chart type factories.
 * Supports registration, retrieval, and validation of chart types.
 */
export class ChartRegistry {
  private factories = new Map<string, ChartFactory>()

  /**
   * Register a chart factory for a given type.
   */
  register(type: string, factory: ChartFactory): void {
    this.factories.set(type, factory)
  }

  /**
   * Get a chart factory by type.
   * Returns undefined if not registered.
   */
  get(type: string): ChartFactory | undefined {
    return this.factories.get(type)
  }

  /**
   * Check if a chart type is registered.
   */
  has(type: string): boolean {
    return this.factories.has(type)
  }

  /**
   * Get all registered chart type names.
   */
  getAllTypes(): string[] {
    return Array.from(this.factories.keys())
  }

  /**
   * Unregister a chart type.
   */
  unregister(type: string): void {
    this.factories.delete(type)
  }

  /**
   * Clear all registered factories.
   */
  clear(): void {
    this.factories.clear()
  }

  /**
   * Batch register multiple chart factories from a record.
   */
  registerBatch(factories: Record<string, ChartFactory>): void {
    for (const [type, factory] of Object.entries(factories)) {
      this.register(type, factory)
    }
  }

  /**
   * Validate if a chart type string is a known ChartType union value.
   */
  static isValidChartType(type: string): type is ChartType {
    const validTypes: ChartType[] = [
      'line',
      'pie',
      'bar',
      'area',
      'scatter',
      'summary',
      'stat-card',
      'table',
    ]
    return validTypes.includes(type as ChartType)
  }
}
