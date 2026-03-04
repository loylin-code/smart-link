/**
 * SmartLink Core
 * 页面编排渲染引擎核心模块
 */

// 版本信息
export const version = '1.0.0'

// 类型导出
export * from './types'

// 核心模块导出
export { createExpressionEvaluator, createSimpleEvaluator } from './evaluator'
export { createStateManager, createStateManagerWithComputed } from './state'
export { createComponentRegistry, getGlobalRegistry, setGlobalRegistry } from './registry'
export { createEventProcessor } from './events'
export { createDirectiveProcessor } from './directives'
export { createRenderer, createFullRenderer } from './renderer'
