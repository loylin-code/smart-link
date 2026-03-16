/**
 * SmartLink Core - State Manager
 * 响应式状态管理器
 */

import { reactive, watch as vueWatch, type Ref, ref, toRaw as vueToRaw, isRef, unref } from 'vue'
import type { StateManager, WatchCallback, StateOperation } from '../types'

/**
 * 监听器信息
 */
interface WatcherInfo {
  id: string
  path: string
  callback: WatchCallback
  unwatch: () => void
  deep: boolean
  immediate: boolean
}

/**
 * 历史记录
 */
interface HistoryRecord {
  timestamp: number
  operation: StateOperation
  snapshot: Record<string, any>
}

/**
 * 创建状态管理器
 */
export function createStateManager(initialState: Record<string, any> = {}): StateManager {
  // 响应式状态
  const state = reactive<Record<string, any>>(initialState)

  // 监听器集合
  const watchers = new Map<string, WatcherInfo>()

  // 监听器ID计数器
  let watcherIdCounter = 0

  // 历史记录
  const history: HistoryRecord[] = []
  const maxHistoryLength = 100

  // 是否启用历史记录
  let historyEnabled = false

  /**
   * 获取状态值（支持路径）
   */
  function get(path: string): any {
    if (!path) return vueToRaw(state)

    const keys = parsePath(path)
    let current: any = state

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined
      }

      if (isRef(current)) {
        current = current.value
      }

      current = current[key]
    }

    return unref(current)
  }

  /**
   * 设置状态值（支持路径）
   */
  function set(path: string, value: any): void {
    if (!path) {
      throw new Error('Path is required')
    }

    const keys = parsePath(path)

    if (keys.length === 0) {
      throw new Error('Invalid path')
    }

    let current: any = state
    const lastKey = keys.pop()!

    // 遍历到目标对象的父级
    for (const key of keys) {
      if (current[key] === undefined || current[key] === null) {
        current[key] = {}
      }
      current = current[key]
    }

    // 记录旧值
    const oldValue = current[lastKey]

    // 设置新值
    current[lastKey] = value

    // 记录历史
    if (historyEnabled) {
      recordHistory({
        type: 'set',
        path,
        value
      })
    }

    // 触发监听器
    notify(path)
  }

  /**
   * 监听状态变化
   */
  function watch(path: string, callback: WatchCallback): () => void {
    const id = `watcher_${++watcherIdCounter}`

    // 使用Vue的watch API
    const unwatch = vueWatch(
      () => get(path),
      (newValue, oldValue) => {
        callback(newValue, oldValue)
      },
      { deep: true }
    )

    const info: WatcherInfo = {
      id,
      path,
      callback,
      unwatch,
      deep: true,
      immediate: false
    }

    watchers.set(id, info)

    // 返回取消监听函数
    return () => {
      unwatch()
      watchers.delete(id)
    }
  }

  /**
   * 通知监听器
   */
  function notify(path: string): void {
    // Vue的reactive已经自动处理了依赖追踪
    // 这里主要用于手动触发一些需要额外处理的逻辑
    const watchersToNotify = Array.from(watchers.values()).filter(
      (w) => w.path === path || w.path.startsWith(path + '.') || path.startsWith(w.path + '.')
    )

    // 由于Vue的watch已经处理了响应式，这里不需要手动触发
    // 但可以用于调试或日志
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
      watchersToNotify.forEach((w) => {
        console.debug(`[StateManager] Path "${w.path}" changed`)
      })
    }
  }

  /**
   * 重置状态
   */
  function reset(): void {
    // 清空状态
    Object.keys(state).forEach((key) => {
      delete state[key]
    })

    // 合并初始状态
    Object.assign(state, initialState)

    // 清空监听器
    watchers.forEach((w) => w.unwatch())
    watchers.clear()

    // 清空历史
    history.length = 0
  }

  /**
   * 获取原始状态
   */
  function getRaw(): Record<string, any> {
    return vueToRaw(state)
  }

  /**
   * 批量更新
   */
  function batchUpdate(updates: Record<string, any>): void {
    // 暂停监听
    const unwatchers: (() => void)[] = []
    watchers.forEach((w) => {
      unwatchers.push(w.unwatch)
    })

    try {
      // 批量更新
      for (const [path, value] of Object.entries(updates)) {
        set(path, value)
      }
    } finally {
      // 恢复监听
      // Vue的reactive会自动处理批量更新
    }
  }

  /**
   * 深度合并
   */
  function merge(path: string, value: Record<string, any>): void {
    const currentValue = get(path) || {}

    if (typeof currentValue !== 'object' || currentValue === null) {
      set(path, value)
      return
    }

    const merged = deepMerge(currentValue, value)
    set(path, merged)
  }

  /**
   * 数组操作
   */
  function push(path: string, ...items: any[]): number {
    const arr = get(path)
    if (!Array.isArray(arr)) {
      throw new Error(`Path "${path}" is not an array`)
    }

    const result = arr.push(...items)

    if (historyEnabled) {
      recordHistory({
        type: 'push',
        path,
        value: items
      })
    }

    notify(path)
    return result
  }

  function pop(path: string): any {
    const arr = get(path)
    if (!Array.isArray(arr)) {
      throw new Error(`Path "${path}" is not an array`)
    }

    const result = arr.pop()

    if (historyEnabled) {
      recordHistory({
        type: 'pop',
        path,
        value: result
      })
    }

    notify(path)
    return result
  }

  function splice(path: string, index: number, deleteCount: number, ...items: any[]): any[] {
    const arr = get(path)
    if (!Array.isArray(arr)) {
      throw new Error(`Path "${path}" is not an array`)
    }

    const result = arr.splice(index, deleteCount, ...items)

    if (historyEnabled) {
      recordHistory({
        type: 'splice',
        path,
        index,
        deleteCount,
        items
      })
    }

    notify(path)
    return result
  }

  /**
   * 删除属性
   */
  function deleteProperty(path: string): boolean {
    const keys = parsePath(path)
    if (keys.length === 0) return false

    let current: any = state
    const lastKey = keys.pop()!

    for (const key of keys) {
      if (current === null || current === undefined) {
        return false
      }
      current = current[key]
    }

    if (current && lastKey in current) {
      delete current[lastKey]

      if (historyEnabled) {
        recordHistory({
          type: 'delete',
          path
        })
      }

      notify(path)
      return true
    }

    return false
  }

  /**
   * 历史记录管理
   */
  function enableHistory(): void {
    historyEnabled = true
  }

  function disableHistory(): void {
    historyEnabled = false
  }

  function recordHistory(operation: StateOperation): void {
    history.push({
      timestamp: Date.now(),
      operation,
      snapshot: { ...getRaw() }
    })

    // 限制历史长度
    if (history.length > maxHistoryLength) {
      history.shift()
    }
  }

  function getHistory(): HistoryRecord[] {
    return [...history]
  }

  function clearHistory(): void {
    history.length = 0
  }

  // 返回状态管理器接口
  return {
    state,
    get,
    set,
    watch,
    notify,
    reset,
    toRaw: getRaw,
    batchUpdate,
    merge,
    push,
    pop,
    splice,
    delete: deleteProperty,
    enableHistory,
    disableHistory,
    getHistory,
    clearHistory
  } as StateManager
}

/**
 * 解析路径
 */
function parsePath(path: string): string[] {
  // 支持点号和方括号两种路径格式
  // 例如: "user.name" 或 "user[name]" 或 "users[0].name"
  const keys: string[] = []
  let current = ''
  let inBracket = false

  for (let i = 0; i < path.length; i++) {
    const char = path[i]

    if (char === '[') {
      if (current) {
        keys.push(current)
        current = ''
      }
      inBracket = true
    } else if (char === ']') {
      if (current) {
        keys.push(current)
        current = ''
      }
      inBracket = false
    } else if (char === '.' && !inBracket) {
      if (current) {
        keys.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }

  if (current) {
    keys.push(current)
  }

  return keys
}

/**
 * 深度合并对象
 */
function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) {
    return source
  }
  if (typeof source !== 'object' || source === null) {
    return target
  }

  const result = { ...target }

  for (const key of Object.keys(source)) {
    if (key in result) {
      if (
        typeof result[key] === 'object' &&
        result[key] !== null &&
        typeof source[key] === 'object' &&
        source[key] !== null
      ) {
        result[key] = deepMerge(result[key], source[key])
      } else {
        result[key] = source[key]
      }
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * 创建状态管理器（带计算属性支持）
 */
export function createStateManagerWithComputed(
  initialState: Record<string, any> = {},
  computed: Record<string, (state: Record<string, any>) => any> = {}
): StateManager & { computed: Record<string, Ref<any>> } {
  const baseManager = createStateManager(initialState)

  // 创建计算属性
  const computedRefs: Record<string, Ref<any>> = {}

  for (const [name, getter] of Object.entries(computed)) {
    computedRefs[name] = ref(getter(baseManager.state))

    // 监听变化并更新计算属性
    baseManager.watch('.', () => {
      computedRefs[name].value = getter(baseManager.state)
    })
  }

  return {
    ...baseManager,
    computed: computedRefs
  } as any
}

/**
 * 默认导出
 */
export default createStateManager
