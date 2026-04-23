import type { TabItem, TabTemplate, VisConfig } from '../types'

/**
 * Event types for TabManager.
 */
export type TabEvent = 'open' | 'close' | 'switch'

/**
 * Tab event callback type.
 */
export type TabEventCallback = (event: TabEvent, tab: TabItem | null) => void

/**
 * Options for opening a tab.
 */
export interface OpenTabOptions {
  title?: string
  replaceExisting?: boolean
  closable?: boolean
}

/**
 * TabManager - manages tab pages for chart detail views.
 *
 * Features:
 * - Open, close, switch tabs
 * - Register custom templates
 * - Event-based notification
 * - Active tab tracking
 *
 * Usage:
 * ```ts
 * const tabManager = new TabManager()
 *
 * // Register templates
 * tabManager.registerTemplate({
 *   id: 'chart-detail',
 *   name: 'Chart Detail',
 *   component: ChartDetailVue
 * })
 *
 * // Open tab
 * const tab = tabManager.openTab('chart-detail', chartConfig, {
 *   title: 'Sales Analysis'
 * })
 *
 * // Listen to events
 * tabManager.on('switch', (event, tab) => {
 *   console.log('Switched to:', tab?.title)
 * })
 * ```
 */
export class TabManager {
  private tabs: Map<string, TabItem> = new Map()
  private templates: Map<string, TabTemplate> = new Map()
  private activeTabId: string | null = null
  private eventCallbacks: Map<TabEvent, TabEventCallback[]> = new Map()
  private tabIdCounter: number = 0

  constructor() {
    // Initialize event callback maps
    this.eventCallbacks.set('open', [])
    this.eventCallbacks.set('close', [])
    this.eventCallbacks.set('switch', [])
  }

  /**
   * Generate a unique tab ID.
   */
  private generateTabId(): string {
    this.tabIdCounter += 1
    return `tab-${Date.now()}-${this.tabIdCounter}`
  }

  /**
   * Register a tab template.
   *
   * @param template - Template definition
   */
  registerTemplate(template: TabTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * Batch register templates.
   *
   * @param templates - Array of templates
   */
  registerTemplates(templates: TabTemplate[]): void {
    templates.forEach((t) => this.registerTemplate(t))
  }

  /**
   * Get a registered template by ID.
   *
   * @param templateId - Template ID
   * @returns Template or undefined if not found
   */
  getTemplate(templateId: string): TabTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Open a new tab with given template and data.
   *
   * @param templateId - Template ID to use
   * @param data - Chart configuration data
   * @param options - Optional settings (title, replaceExisting, closable)
   * @returns The created TabItem
   */
  openTab(templateId: string, data: VisConfig, options?: OpenTabOptions): TabItem {
    // Check if template exists
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Generate title
    const title = options?.title ?? data.title ?? template.name

    // 优先按 chartId 查找已有 TAB（同一消息的多个图表可分别打开）
    // chartId = chart-${messageId}-${index}，精确匹配到具体图表
    if (data.chartId) {
      const existingTab = this.findTabByChartId(data.chartId)
      if (existingTab) {
        this.switchTab(existingTab.id)
        return existingTab
      }
    }
    // 兼容旧调用方：无 chartId 时按 messageId 去重
    else if (data.messageId) {
      const existingTab = this.findTabByMessageId(data.messageId)
      if (existingTab) {
        this.switchTab(existingTab.id)
        return existingTab
      }
    }

    // Check if should replace existing tab with same template
    if (options?.replaceExisting) {
      const existingTab = this.findTabByTemplate(templateId)
      if (existingTab) {
        this.closeTab(existingTab.id)
      }
    }

    // Create new tab
    const tabId = this.generateTabId()
    const tab: TabItem = {
      id: tabId,
      title,
      template,
      data,
      closable: options?.closable ?? true,
    }

    // Add to tabs map
    this.tabs.set(tabId, tab)

    // Set as active tab
    this.activeTabId = tabId

    // Emit open event
    this.emit('open', tab)

    return tab
  }

  /**
   * Close a tab by ID.
   *
   * @param tabId - Tab ID to close
   */
  closeTab(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) {
      return
    }

    // Remove from tabs map
    this.tabs.delete(tabId)

    // Emit close event
    this.emit('close', tab)

    // If this was the active tab, switch to another
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys())
      if (remainingTabs.length > 0) {
        this.switchTab(remainingTabs[remainingTabs.length - 1])
      } else {
        this.activeTabId = null
        this.emit('switch', null)
      }
    }
  }

  /**
   * Close all tabs.
   */
  closeAllTabs(): void {
    const tabIds = Array.from(this.tabs.keys())
    tabIds.forEach((id) => this.closeTab(id))
    this.activeTabId = null
  }

  /**
   * Switch active tab by ID.
   *
   * @param tabId - Tab ID to switch to
   */
  switchTab(tabId: string): void {
    const tab = this.tabs.get(tabId)
    if (!tab) {
      throw new Error(`Tab not found: ${tabId}`)
    }

    // Update active tab
    this.activeTabId = tabId

    // Emit switch event
    this.emit('switch', tab)
  }

  /**
   * Get the currently active tab.
   *
   * @returns Active TabItem or null if none
   */
  getActiveTab(): TabItem | null {
    if (!this.activeTabId) {
      return null
    }
    return this.tabs.get(this.activeTabId) ?? null
  }

  /**
   * Get active tab ID.
   *
   * @returns Active tab ID or null
   */
  getActiveTabId(): string | null {
    return this.activeTabId
  }

  /**
   * Get all tabs.
   *
   * @returns Array of all TabItems
   */
  getAllTabs(): TabItem[] {
    return Array.from(this.tabs.values())
  }

  /**
   * Get tab by ID.
   *
   * @param tabId - Tab ID
   * @returns TabItem or undefined
   */
  getTab(tabId: string): TabItem | undefined {
    return this.tabs.get(tabId)
  }

  /**
   * Check if a tab exists.
   *
   * @param tabId - Tab ID
   * @returns true if exists
   */
  hasTab(tabId: string): boolean {
    return this.tabs.has(tabId)
  }

  /**
   * Get number of open tabs.
   *
   * @returns Tab count
   */
  getTabCount(): number {
    return this.tabs.size
  }

  /**
   * Subscribe to tab events.
   *
   * @param event - Event type ('open', 'close', 'switch')
   * @param callback - Callback function
   */
  on(event: TabEvent, callback: TabEventCallback): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.push(callback)
    }
  }

  /**
   * Unsubscribe from tab events.
   *
   * @param event - Event type
   * @param callback - Callback function to remove
   */
  off(event: TabEvent, callback: TabEventCallback): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Clear all event listeners.
   */
  clearListeners(): void {
    this.eventCallbacks.forEach((callbacks) => {
      callbacks.length = 0
    })
  }

  /**
   * Find a tab by template ID.
   *
   * @param templateId - Template ID
   * @returns TabItem or undefined
   */
  private findTabByTemplate(templateId: string): TabItem | undefined {
    for (const tab of this.tabs.values()) {
      if (tab.template.id === templateId) {
        return tab
      }
    }
    return undefined
  }

  /**
   * Find a tab by messageId.
   *
   * @param messageId - Message ID
   * @returns TabItem or undefined
   */
  private findTabByMessageId(messageId: string): TabItem | undefined {
    for (const tab of this.tabs.values()) {
      if (tab.data.messageId === messageId) {
        return tab
      }
    }
    return undefined
  }

  /**
   * Find a tab by chartId.
   * chartId = chart-${messageId}-${index}，用于同一消息内多图表的精确匹配。
   *
   * @param chartId - Chart unique ID
   * @returns TabItem or undefined
   */
  private findTabByChartId(chartId: string): TabItem | undefined {
    for (const tab of this.tabs.values()) {
      if (tab.data.chartId === chartId) {
        return tab
      }
    }
    return undefined
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param event - Event type
   * @param tab - Tab involved in the event
   */
  private emit(event: TabEvent, tab: TabItem | null): void {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => cb(event, tab))
    }
  }

  /**
   * Destroy the manager and cleanup.
   */
  destroy(): void {
    this.closeAllTabs()
    this.templates.clear()
    this.clearListeners()
  }
}

export default TabManager