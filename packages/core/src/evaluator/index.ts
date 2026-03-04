/**
 * SmartLink Core - Expression Evaluator
 * 安全的表达式求值引擎
 */

import type { ExpressionBinding, EvaluationContext, ExpressionEvaluator } from '../types'

/**
 * 允许的全局对象白名单
 */
const ALLOWED_GLOBALS = new Set([
  // 内置对象
  'Math',
  'Date',
  'JSON',
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Map',
  'Set',
  'Promise',
  'RegExp',
  'Error',
  'URL',
  'URLSearchParams',
  // 内置函数
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURIComponent',
  'decodeURIComponent',
  'encodeURI',
  'decodeURI',
  // 常量
  'undefined',
  'null',
  'true',
  'false',
  'NaN',
  'Infinity',
  // 控制台（仅开发环境）
  'console'
])

/**
 * 禁止的访问路径
 */
const FORBIDDEN_PATHS = [
  'window',
  'document',
  'globalThis',
  'eval',
  'Function',
  'constructor',
  '__proto__',
  'prototype'
]

/**
 * 创建安全的表达式求值器
 */
export function createExpressionEvaluator(): ExpressionEvaluator {
  // 表达式编译缓存
  const cache = new Map<string, Function>()

  // 格式化器注册表
  const formatters = new Map<string, (value: any, ...args: any[]) => any>()

  // 注册内置格式化器
  registerBuiltInFormatters(formatters)

  /**
   * 编译表达式为函数
   */
  function compile(expression: string): Function {
    // 检查缓存
    if (cache.has(expression)) {
      return cache.get(expression)!
    }

    // 安全检查
    validateExpression(expression)

    // 创建安全的执行函数
    const fn = createSafeFunction(expression)

    // 缓存结果
    cache.set(expression, fn)
    return fn
  }

  /**
   * 求值表达式
   */
  function evaluate(expression: string, context: EvaluationContext): any {
    try {
      const fn = compile(expression)
      return fn(context)
    } catch (error) {
      console.error(`[Evaluator] Expression evaluation error: "${expression}"`, error)
      return undefined
    }
  }

  /**
   * 求值绑定
   */
  function evaluateBinding(binding: ExpressionBinding, context: EvaluationContext): any {
    // 求值表达式
    let value = evaluate(binding.value, context)

    // 应用格式化器
    if (binding.formatter && formatters.has(binding.formatter)) {
      const formatter = formatters.get(binding.formatter)!
      value = formatter(value)
    }

    return value
  }

  /**
   * 注册格式化器
   */
  function registerFormatter(name: string, fn: (value: any, ...args: any[]) => any): void {
    formatters.set(name, fn)
  }

  /**
   * 获取格式化器
   */
  function getFormatter(name: string): ((value: any, ...args: any[]) => any) | undefined {
    return formatters.get(name)
  }

  /**
   * 清除缓存
   */
  function clearCache(): void {
    cache.clear()
  }

  return {
    compile,
    evaluate,
    evaluateBinding,
    registerFormatter: registerFormatter as any,
    getFormatter: getFormatter as any,
    clearCache
  } as ExpressionEvaluator
}

/**
 * 创建安全的执行函数
 */
function createSafeFunction(expression: string): Function {
  // 构建安全的执行环境
  const safeCode = `
    return (function(__ctx__) {
      'use strict';
      
      const { state, methods, $event, $item, $index, ...rest } = __ctx__;
      
      // 创建安全的访问代理
      const safeAccess = new Proxy({}, {
        has: () => true,
        get: (_, key) => {
          // 禁止访问危险路径
          if (${JSON.stringify(Array.from(FORBIDDEN_PATHS))}.includes(key)) {
            throw new Error(\`Access denied: \${key}\`);
          }
          
          // 优先级: 特殊变量 > 状态 > 方法 > rest > 全局
          if (key === 'state') return state;
          if (key === 'methods') return methods;
          if (key === '$event') return $event;
          if (key === '$item') return $item;
          if (key === '$index') return $index;
          
          if (state && key in state) {
            const value = state[key];
            return typeof value === 'function' ? value.bind(state) : value;
          }
          
          if (methods && key in methods) {
            return methods[key];
          }
          
          if (rest && key in rest) {
            return rest[key];
          }
          
          // 允许的全局对象
          if (${JSON.stringify(Array.from(ALLOWED_GLOBALS))}.includes(key)) {
            if (typeof window !== 'undefined' && key in window) {
              return window[key as keyof Window];
            }
            if (typeof globalThis !== 'undefined' && key in globalThis) {
              return globalThis[key as keyof typeof globalThis];
            }
          }
          
          return undefined;
        },
        set: (_, key, value) => {
          if (state && key in state) {
            state[key] = value;
            return true;
          }
          return false;
        }
      });
      
      // 在安全环境中执行表达式
      with (safeAccess) {
        try {
          return ${expression};
        } catch (error) {
          console.error('[Evaluator] Runtime error:', error);
          return undefined;
        }
      }
    })(__ctx__);
  `

  try {
    return new Function('__ctx__', safeCode)
  } catch (error) {
    console.error(`[Evaluator] Compilation error: "${expression}"`, error)
    return () => undefined
  }
}

/**
 * 验证表达式安全性
 */
function validateExpression(expression: string): void {
  // 检查长度
  if (expression.length > 10000) {
    throw new Error('Expression too long')
  }

  // 检查禁止的模式
  const forbiddenPatterns = [
    /\beval\s*\(/,
    /Function\s*\(/,
    /new\s+Function/,
    /__proto__/,
    /\.constructor/,
    /\.prototype/,
    /window\s*\[/,
    /document\s*\[/,
    /globalThis/,
    /import\s*\(/,
    /require\s*\(/
  ]

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(expression)) {
      throw new Error(`Forbidden pattern in expression: ${pattern}`)
    }
  }
}

/**
 * 注册内置格式化器
 */
function registerBuiltInFormatters(
  formatters: Map<string, (value: any, ...args: any[]) => any>
): void {
  // 字符串格式化
  formatters.set('upper', (v: string) => String(v).toUpperCase())
  formatters.set('lower', (v: string) => String(v).toLowerCase())
  formatters.set('capitalize', (v: string) => {
    const s = String(v)
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  })
  formatters.set('trim', (v: string) => String(v).trim())
  formatters.set('slice', (v: string, start: number, end?: number) => String(v).slice(start, end))

  // 数字格式化
  formatters.set('toFixed', (v: number, digits: number = 2) => Number(v).toFixed(digits))
  formatters.set('toPrecision', (v: number, digits: number) => Number(v).toPrecision(digits))
  formatters.set(
    'currency',
    (v: number, symbol: string = '¥') => `${symbol}${Number(v).toFixed(2)}`
  )
  formatters.set(
    'percent',
    (v: number, digits: number = 2) => `${(Number(v) * 100).toFixed(digits)}%`
  )
  formatters.set('round', (v: number) => Math.round(Number(v)))
  formatters.set('floor', (v: number) => Math.floor(Number(v)))
  formatters.set('ceil', (v: number) => Math.ceil(Number(v)))

  // 日期格式化
  formatters.set('date', (v: any, format: string = 'YYYY-MM-DD') => {
    const date = new Date(v)
    if (isNaN(date.getTime())) return ''

    const pad = (n: number) => String(n).padStart(2, '0')

    return format
      .replace('YYYY', String(date.getFullYear()))
      .replace('MM', pad(date.getMonth() + 1))
      .replace('DD', pad(date.getDate()))
      .replace('HH', pad(date.getHours()))
      .replace('mm', pad(date.getMinutes()))
      .replace('ss', pad(date.getSeconds()))
  })

  // 数组格式化
  formatters.set('join', (v: any[], separator: string = ',') =>
    Array.isArray(v) ? v.join(separator) : ''
  )
  formatters.set('first', (v: any[]) => (Array.isArray(v) ? v[0] : undefined))
  formatters.set('last', (v: any[]) => (Array.isArray(v) ? v[v.length - 1] : undefined))
  formatters.set('length', (v: any[] | string) => v?.length ?? 0)
  formatters.set('reverse', (v: any[]) => (Array.isArray(v) ? [...v].reverse() : []))
  formatters.set('sort', (v: any[], key?: string) => {
    if (!Array.isArray(v)) return []
    const sorted = [...v]
    if (key) {
      sorted.sort((a, b) => (a[key] > b[key] ? 1 : -1))
    } else {
      sorted.sort()
    }
    return sorted
  })

  // 布尔格式化
  formatters.set('bool', (v: any) => Boolean(v))
  formatters.set('not', (v: any) => !Boolean(v))

  // 默认值
  formatters.set('default', (v: any, defaultValue: any) => v ?? defaultValue)

  // JSON
  formatters.set('json', (v: any, indent?: number) => JSON.stringify(v, null, indent))
  formatters.set('parse', (v: string) => JSON.parse(v))
}

/**
 * 创建简易求值器（不使用with，性能更好但功能受限）
 */
export function createSimpleEvaluator(): ExpressionEvaluator {
  const cache = new Map<string, Function>()

  function compile(expression: string): Function {
    if (cache.has(expression)) {
      return cache.get(expression)!
    }

    validateExpression(expression)

    // 简单表达式直接求值
    const fn = (context: EvaluationContext) => {
      const { state, methods, $event, $item, $index, ...rest } = context

      try {
        // 创建求值函数
        const evalFn = new Function(
          'state',
          'methods',
          '$event',
          '$item',
          '$index',
          'rest',
          `
          "use strict";
          try {
            return ${expression};
          } catch (e) {
            return undefined;
          }
        `
        )
        return evalFn(state, methods, $event, $item, $index, rest)
      } catch {
        return undefined
      }
    }

    cache.set(expression, fn)
    return fn
  }

  function evaluate(expression: string, context: EvaluationContext): any {
    try {
      const fn = compile(expression)
      return fn(context)
    } catch (error) {
      console.error(`[SimpleEvaluator] Error: "${expression}"`, error)
      return undefined
    }
  }

  function evaluateBinding(binding: ExpressionBinding, context: EvaluationContext): any {
    return evaluate(binding.value, context)
  }

  return {
    compile,
    evaluate,
    evaluateBinding
  } as ExpressionEvaluator
}

/**
 * 默认导出
 */
export default createExpressionEvaluator
