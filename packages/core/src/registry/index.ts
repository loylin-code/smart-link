/**
 * SmartLink Core - Component Registry
 * 组件注册与管理系统
 */

import { defineAsyncComponent, type Component, type AsyncComponentLoader } from 'vue'
import type { ComponentRegistry, ComponentMeta } from '../types'

/**
 * 组件缓存条目
 */
interface ComponentCacheEntry {
  component: Component | null
  loader?: AsyncComponentLoader
  meta?: ComponentMeta
  loading: boolean
  error: Error | null
}

/**
 * 创建组件注册表
 */
export function createComponentRegistry(): ComponentRegistry {
  // 组件缓存
  const components = new Map<string, ComponentCacheEntry>()

  // 元数据缓存
  const metas = new Map<string, ComponentMeta>()

  // 加载中Promise缓存
  const loadingPromises = new Map<string, Promise<Component>>()

  /**
   * 注册组件
   */
  function register(type: string, component: Component, meta?: ComponentMeta): void {
    if (components.has(type)) {
      console.warn(`[Registry] Component "${type}" already registered, overwriting`)
    }

    components.set(type, {
      component,
      meta,
      loading: false,
      error: null
    })

    if (meta) {
      metas.set(type, meta)
    }
  }

  /**
   * 注册异步组件
   */
  function registerAsync(type: string, loader: AsyncComponentLoader, meta?: ComponentMeta): void {
    if (components.has(type)) {
      console.warn(`[Registry] Component "${type}" already registered, overwriting`)
    }

    // 创建异步组件
    const asyncComponent = defineAsyncComponent({
      loader,
      loadingComponent: createLoadingComponent(type),
      errorComponent: createErrorComponent(type),
      delay: 200,
      timeout: 10000
    })

    components.set(type, {
      component: asyncComponent,
      loader,
      meta,
      loading: false,
      error: null
    })

    if (meta) {
      metas.set(type, meta)
    }
  }

  /**
   * 获取组件
   */
  function get(type: string): Component | null {
    const entry = components.get(type)

    if (!entry) {
      console.warn(`[Registry] Component "${type}" not found`)
      return createPlaceholderComponent(type)
    }

    if (entry.error) {
      console.error(`[Registry] Component "${type}" failed to load:`, entry.error)
      return createErrorComponent(type)
    }

    return entry.component
  }

  /**
   * 获取组件元数据
   */
  function getMeta(type: string): ComponentMeta | undefined {
    return metas.get(type)
  }

  /**
   * 检查组件是否存在
   */
  function has(type: string): boolean {
    return components.has(type)
  }

  /**
   * 获取所有组件类型
   */
  function getAllTypes(): string[] {
    return Array.from(components.keys())
  }

  /**
   * 按分类获取组件列表
   */
  function getByCategory(category: string): ComponentMeta[] {
    const result: ComponentMeta[] = []

    for (const [type, meta] of metas) {
      if (meta.category === category) {
        result.push(meta)
      }
    }

    return result
  }

  /**
   * 批量注册组件
   */
  function registerAll(componentMap: Record<string, Component>, metaList?: ComponentMeta[]): void {
    // 注册组件
    for (const [type, component] of Object.entries(componentMap)) {
      register(type, component)
    }

    // 注册元数据
    if (metaList) {
      for (const meta of metaList) {
        metas.set(meta.type, meta)

        // 更新组件缓存中的元数据
        const entry = components.get(meta.type)
        if (entry) {
          entry.meta = meta
        }
      }
    }
  }

  /**
   * 注销组件
   */
  function unregister(type: string): boolean {
    if (!components.has(type)) {
      return false
    }

    components.delete(type)
    metas.delete(type)
    loadingPromises.delete(type)
    return true
  }

  /**
   * 清空注册表
   */
  function clear(): void {
    components.clear()
    metas.clear()
    loadingPromises.clear()
  }

  /**
   * 预加载组件
   */
  async function preload(type: string): Promise<Component | null> {
    const entry = components.get(type)

    if (!entry) {
      return null
    }

    // 已经加载
    if (entry.component && !entry.loading) {
      return entry.component
    }

    // 正在加载
    if (entry.loading && loadingPromises.has(type)) {
      return loadingPromises.get(type)!
    }

    // 有加载器，执行加载
    if (entry.loader) {
      entry.loading = true
      entry.error = null

      const promise = entry
        .loader()
        .then((component) => {
          entry.component = component as Component
          entry.loading = false
          return component as Component
        })
        .catch((error) => {
          entry.error = error
          entry.loading = false
          console.error(`[Registry] Failed to load component "${type}":`, error)
          return null
        })

      loadingPromises.set(type, promise as Promise<any>)
      return promise
    }

    return entry.component
  }

  /**
   * 批量预加载
   */
  async function preloadAll(types?: string[]): Promise<void> {
    const typesToLoad = types || getAllTypes()
    await Promise.all(typesToLoad.map((type) => preload(type)))
  }

  /**
   * 获取组件统计信息
   */
  function getStats(): {
    total: number
    loaded: number
    loading: number
    error: number
    byCategory: Record<string, number>
  } {
    let loaded = 0
    let loading = 0
    let error = 0
    const byCategory: Record<string, number> = {}

    for (const [type, entry] of components) {
      if (entry.loading) loading++
      else if (entry.error) error++
      else if (entry.component) loaded++

      const meta = metas.get(type)
      if (meta) {
        byCategory[meta.category] = (byCategory[meta.category] || 0) + 1
      }
    }

    return {
      total: components.size,
      loaded,
      loading,
      error,
      byCategory
    }
  }

  // 返回注册表接口
  return {
    register,
    registerAsync,
    get,
    getMeta,
    has,
    getAllTypes,
    getByCategory,
    registerAll,
    unregister,
    clear,
    preload,
    preloadAll,
    getStats
  } as ComponentRegistry
}

/**
 * 创建占位符组件
 */
function createPlaceholderComponent(type: string): Component {
  return {
    name: `Placeholder_${type}`,
    template: `<div class="component-placeholder" data-type="${type}">
      <span class="placeholder-text">组件: ${type}</span>
    </div>`
  }
}

/**
 * 创建加载中组件
 */
function createLoadingComponent(type: string): Component {
  return {
    name: `Loading_${type}`,
    template: `<div class="component-loading" data-type="${type}">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>`
  }
}

/**
 * 创建错误组件
 */
function createErrorComponent(type: string): Component {
  return {
    name: `Error_${type}`,
    template: `<div class="component-error" data-type="${type}">
      <span class="error-icon">⚠️</span>
      <span class="error-text">组件加载失败: ${type}</span>
    </div>`
  }
}

/**
 * 全局组件注册表实例
 */
let globalRegistry: ComponentRegistry | null = null

/**
 * 获取全局组件注册表
 */
export function getGlobalRegistry(): ComponentRegistry {
  if (!globalRegistry) {
    globalRegistry = createComponentRegistry()
  }
  return globalRegistry
}

/**
 * 设置全局组件注册表
 */
export function setGlobalRegistry(registry: ComponentRegistry): void {
  globalRegistry = registry
}

/**
 * 组件注册装饰器
 */
export function ComponentRegister(type?: string) {
  return function (target: any) {
    const componentType = type || target.name || target.__name
    if (!componentType) {
      console.error('[Registry] Component type is required')
      return
    }
    getGlobalRegistry().register(componentType, target)
  }
}

/**
 * 默认导出
 */
export default createComponentRegistry
