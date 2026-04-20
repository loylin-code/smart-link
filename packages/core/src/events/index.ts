/**
 * SmartLink Core - Event Processor
 * 事件处理系统
 */

import type {
  EventProcessor,
  EventBinding,
  EventHandler,
  RuntimeContext,
  BuiltinAction,
  ApiCallConfig,
  StateUpdateConfig
} from '../types'

/**
 * 内置动作处理器映射
 */
type BuiltinActionHandler = (
  params: Record<string, any>,
  context: RuntimeContext
) => Promise<void> | void

/**
 * 创建事件处理器
 */
export function createEventProcessor(): EventProcessor {
  // 内置动作处理器
  const builtinHandlers = new Map<BuiltinAction, BuiltinActionHandler>()

  // 注册内置动作
  registerBuiltinActions(builtinHandlers)

  /**
   * 处理事件绑定
   */
  async function handle(binding: EventBinding, context: RuntimeContext, event: any): Promise<void> {
    // 应用修饰符
    if (binding.modifiers) {
      applyModifiers(binding.modifiers, event)
    }

    // 执行处理器
    await executeHandler(binding.handler, context, event)
  }

  /**
   * 执行事件处理器
   */
  async function executeHandler(
    handler: EventHandler,
    context: RuntimeContext,
    event: any
  ): Promise<void> {
    switch (handler.type) {
      case 'builtin':
        await executeBuiltin(handler.action!, handler.params || {}, context)
        break

      case 'custom':
        await executeCustom(handler.code!, context, event)
        break

      case 'api':
        await executeApi(handler.api!, context)
        break

      case 'state':
        applyStateUpdate(handler.stateUpdate!, context, event)
        break
    }
  }

  /**
   * 执行内置动作
   */
  async function executeBuiltin(
    action: BuiltinAction,
    params: Record<string, any>,
    context: RuntimeContext
  ): Promise<void> {
    const handler = builtinHandlers.get(action)

    if (!handler) {
      console.warn(`[EventProcessor] Unknown builtin action: ${action}`)
      return
    }

    try {
      await handler(params, context)
    } catch (error) {
      console.error(`[EventProcessor] Builtin action "${action}" failed:`, error)
      context.message.error(`操作失败: ${error}`)
    }
  }

  /**
   * 执行自定义代码
   */
  async function executeCustom(code: string, context: RuntimeContext, event: any): Promise<any> {
    try {
      // 创建安全执行环境
      const fn = new Function(
        'state',
        'methods',
        '$event',
        'context',
        `"use strict"; return (${code})`
      )

      return fn(context.state, context.methods, event, context)
    } catch (error) {
      console.error('[EventProcessor] Custom code execution failed:', error)
      throw error
    }
  }

  /**
   * 执行API调用
   */
  async function executeApi(config: ApiCallConfig, context: RuntimeContext): Promise<any> {
    try {
      const result = await context.api.call(config, context)

      // 执行成功回调
      if (config.success) {
        await executeHandler(config.success, context, result)
      }

      return result
    } catch (error) {
      // 执行错误回调
      if (config.error) {
        await executeHandler(config.error, context, error)
      }

      throw error
    }
  }

  /**
   * 应用状态更新
   */
  function applyStateUpdate(config: StateUpdateConfig, context: RuntimeContext, event: any): void {
    // 解析值
    let value: any

    if (config.value.type === 'expression') {
      // 执行表达式
      value = executeCustom(config.value.value, context, event)
    } else if (config.value.type === 'state') {
      // 获取状态值
      value = context.getState(config.value.value)
    } else {
      value = config.value.value
    }

    // 应用操作
    switch (config.operation) {
      case 'set':
        context.setState(config.path, value)
        break

      case 'push': {
        const arr = context.getState(config.path)
        if (Array.isArray(arr)) {
          arr.push(value)
        } else {
          context.setState(config.path, [value])
        }
        break
      }

      case 'pop': {
        const arrPop = context.getState(config.path)
        if (Array.isArray(arrPop)) {
          arrPop.pop()
        }
        break
      }

      case 'splice': {
        const arrSplice = context.getState(config.path)
        if (Array.isArray(arrSplice)) {
          const index = typeof value === 'number' ? value : arrSplice.length - 1
          arrSplice.splice(index, 1)
        }
        break
      }

      case 'merge': {
        const obj = context.getState(config.path) || {}
        context.setState(config.path, { ...obj, ...value })
        break
      }
    }
  }

  /**
   * 注册自定义动作
   */
  function registerAction(action: BuiltinAction, handler: BuiltinActionHandler): void {
    builtinHandlers.set(action, handler)
  }

  return {
    handle,
    executeBuiltin,
    executeCustom,
    executeApi,
    applyStateUpdate,
    registerAction
  } as EventProcessor
}

/**
 * 应用事件修饰符
 */
function applyModifiers(modifiers: string[], event: any): void {
  for (const modifier of modifiers) {
    switch (modifier) {
      case 'prevent':
        event?.preventDefault?.()
        break
      case 'stop':
        event?.stopPropagation?.()
        break
      case 'self':
        // 在调用方处理
        break
      case 'once':
        // 在绑定方处理
        break
      case 'capture':
        // 在绑定方处理
        break
      case 'passive':
        // 在绑定方处理
        break
    }
  }
}

/**
 * 注册内置动作处理器
 */
function registerBuiltinActions(handlers: Map<BuiltinAction, BuiltinActionHandler>): void {
  // 页面导航
  handlers.set('navigate', async (params, context) => {
    const { path, query } = params
    const queryString = query ? '?' + new URLSearchParams(query).toString() : ''
    context.router.push(path + queryString)
  })

  handlers.set('back', async (_, context) => {
    context.router.back()
  })

  handlers.set('refresh', async () => {
    window.location.reload()
  })

  // 模态框
  handlers.set('openModal', async (params, context) => {
    const { modalId, data } = params
    context.setState(`modals.${modalId}.visible`, true)
    if (data) {
      context.setState(`modals.${modalId}.data`, data)
    }
  })

  handlers.set('closeModal', async (params, context) => {
    const { modalId } = params
    context.setState(`modals.${modalId}.visible`, false)
  })

  // 抽屉
  handlers.set('openDrawer', async (params, context) => {
    const { drawerId, data } = params
    context.setState(`drawers.${drawerId}.visible`, true)
    if (data) {
      context.setState(`drawers.${drawerId}.data`, data)
    }
  })

  handlers.set('closeDrawer', async (params, context) => {
    const { drawerId } = params
    context.setState(`drawers.${drawerId}.visible`, false)
  })

  // 消息提示
  handlers.set('showMessage', async (params, context) => {
    const { type = 'info', message, duration = 3000 } = params

    switch (type) {
      case 'success':
        context.message.success(message, duration)
        break
      case 'error':
        context.message.error(message, duration)
        break
      case 'warning':
        context.message.warning(message, duration)
        break
      case 'info':
      default:
        context.message.info(message, duration)
        break
    }
  })

  handlers.set('hideMessage', async () => {
    // 隐藏消息（如果有消息组件支持）
  })

  // 表单
  handlers.set('submitForm', async (params, _context) => {
    const { formId } = params
    // 触发表单提交事件
    const form = document.querySelector(`[data-form-id="${formId}"]`)
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }))
    }
  })

  handlers.set('resetForm', async (params, _context) => {
    const { formId } = params
    // 重置表单
    const form = document.querySelector(`[data-form-id="${formId}"]`) as HTMLFormElement
    if (form) {
      form.reset()
    }
  })

  handlers.set('validateForm', async (params, context) => {
    const { formId } = params
    // 表单验证逻辑（需要在表单组件中实现）
    context.setState(`forms.${formId}.validating`, true)
  })

  // 文件操作
  handlers.set('downloadFile', async (params) => {
    const { url, filename } = params

    const link = document.createElement('a')
    link.href = url
    link.download = filename || ''
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })

  handlers.set('copyToClipboard', async (params, context) => {
    const { text } = params

    try {
      await navigator.clipboard.writeText(text)
      context.message.success('已复制到剪贴板')
    } catch (error) {
      console.error('[EventProcessor] Copy failed:', error)
      context.message.error('复制失败')
    }
  })

  // 变量设置
  handlers.set('setVariable', async (params, context) => {
    const { name, value } = params
    context.setState(name, value)
  })

  // 打印
  handlers.set('print', async () => {
    window.print()
  })

  // 滚动
  handlers.set('scrollTo', async (params) => {
    const { target, offset = 0, behavior = 'smooth' } = params

    let element: Element | null = null

    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: behavior as ScrollBehavior })
      return
    }

    if (target === 'bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: behavior as ScrollBehavior })
      return
    }

    if (typeof target === 'string') {
      element = document.querySelector(target)
    } else if (typeof target === 'object') {
      element = document.getElementById(target.id) || null
    }

    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset + offset
      window.scrollTo({ top, behavior: behavior as ScrollBehavior })
    }
  })
}

/**
 * 默认导出
 */
export default createEventProcessor
