/**
 * Component Parser Service - AI 输出解析服务
 * 用于解析 AI 返回的 JSON 格式组件描述，校验并转换为聊天消息结构
 */

import { COMPONENT_META_LIST } from '@smart-link/shared'
import type { ComponentMeta, PropMeta } from '@smart-link/shared'

/**
 * AI 组件描述接口
 */
export interface AIComponent {
  type: string
  props?: Record<string, any>
  content?: string
  children?: AIComponent[]
}

/**
 * 聊天消息组件结构
 */
export interface ChatMessageComponent {
  id: string
  type: string
  props: Record<string, any>
  content?: string
  children?: ChatMessageComponent[]
}

/**
 * 解析结果
 */
export interface ParseResult {
  success: boolean
  components?: AIComponent[]
  text?: string
  error?: string
}

/**
 * 解析 AI 输出的 JSON 内容
 * 支持纯 JSON、Markdown 代码块包裹的 JSON、以及失败时返回纯文本
 */
export function parseAIComponentOutput(rawContent: string): ParseResult {
  try {
    let jsonStr = rawContent.trim()

    // 尝试从 Markdown 代码块提取 JSON
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    // 移除可能的前缀文本，找到 JSON 起始位置
    const jsonStart = jsonStr.indexOf('{')
    if (jsonStart > 0) {
      jsonStr = jsonStr.substring(jsonStart)
    }

    // 尝试解析为数组或对象
    let parsed: any
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      // 如果是纯文本，返回 text
      return {
        success: true,
        text: rawContent
      }
    }

    // 支持单个组件对象或组件数组
    const components: AIComponent[] = Array.isArray(parsed) ? parsed : [parsed]

    // 验证基本结构
    if (!components.every((c) => c.type)) {
      return {
        success: false,
        error: 'Invalid component structure: missing type field'
      }
    }

    return {
      success: true,
      components
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to parse AI output'
    }
  }
}

/**
 * 查找组件元数据
 */
function findComponentMeta(type: string): ComponentMeta | undefined {
  return COMPONENT_META_LIST.find((meta) => meta.type === type)
}

/**
 * 校验并填充组件 props 默认值
 * 基于 COMPONENT_META_LIST 校验 props，填充未提供的默认值
 */
export function validateComponentProps(
  type: string,
  props: Record<string, any> = {}
): Record<string, any> {
  const meta = findComponentMeta(type)

  if (!meta) {
    // 未知组件类型，返回原始 props
    return props
  }

  const validatedProps: Record<string, any> = {}

  // 处理每个 prop 定义
  meta.props.forEach((propMeta: PropMeta) => {
    const propName = propMeta.name

    // 如果用户提供了值，使用用户值
    if (propName in props) {
      validatedProps[propName] = props[propName]
    }
    // 否则使用默认值
    else if (propMeta.default !== undefined) {
      validatedProps[propName] = propMeta.default
    }
  })

  // 保留用户提供的但不在元数据中的 prop（兼容性）
  Object.keys(props).forEach((key) => {
    if (!(key in validatedProps)) {
      validatedProps[key] = props[key]
    }
  })

  return validatedProps
}

/**
 * 生成唯一的组件 ID
 */
function generateComponentId(type: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${type}_${timestamp}_${random}`
}

/**
 * 将 AI 组件数组转换为 ChatMessageComponent 结构
 * 自动校验 props 并填充默认值，生成唯一 ID
 */
export function createChatComponents(components: AIComponent[]): ChatMessageComponent[] {
  const convertComponent = (component: AIComponent, _index: number = 0): ChatMessageComponent => {
    // 校验并填充 props 默认值
    const validatedProps = validateComponentProps(component.type, component.props || {})

    // 递归处理子组件
    const children = component.children
      ? component.children.map((child, i) => convertComponent(child, i))
      : undefined

    return {
      id: generateComponentId(component.type),
      type: component.type,
      props: validatedProps,
      content: component.content,
      children
    }
  }

  return components.map((component) => convertComponent(component))
}

/**
 * 完整的解析流程：从原始 AI 输出到聊天消息组件
 */
export function processAIComponentOutput(rawContent: string): {
  success: boolean
  components?: ChatMessageComponent[]
  text?: string
  error?: string
} {
  const parseResult = parseAIComponentOutput(rawContent)

  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error
    }
  }

  // 如果是纯文本响应
  if (parseResult.text) {
    return {
      success: true,
      text: parseResult.text
    }
  }

  // 解析并转换组件
  const chatComponents = parseResult.components ? createChatComponents(parseResult.components) : []

  return {
    success: true,
    components: chatComponents
  }
}
