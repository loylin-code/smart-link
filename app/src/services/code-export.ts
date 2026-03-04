/**
 * Code Export Service - Schema转代码导出服务
 * 支持导出Vue SFC、React JSX、HTML等格式
 */

import type {
  PageSchema,
  ComponentNode,
  PropConfig,
  StyleConfig,
  EventBinding
} from '@smart-link/core'

// 导出格式
export type ExportFormat = 'vue-sfc' | 'vue-setup' | 'react-jsx' | 'html'

// 导出选项
export interface ExportOptions {
  format: ExportFormat
  componentName?: string
  includeStyle?: boolean
  includeScript?: boolean
  indentSize?: number
}

// 导出结果
export interface ExportResult {
  code: string
  filename: string
  language: string
}

/**
 * Schema转代码导出服务
 */
class CodeExportService {
  private indent: string

  constructor(indentSize: number = 2) {
    this.indent = ' '.repeat(indentSize)
  }

  /**
   * 导出Schema为代码
   */
  export(schema: PageSchema, options: ExportOptions): ExportResult {
    const { format, componentName = 'GeneratedPage', indentSize = 2 } = options
    this.indent = ' '.repeat(indentSize)

    switch (format) {
      case 'vue-sfc':
        return this.exportVueSFC(schema, componentName, options)
      case 'vue-setup':
        return this.exportVueSetup(schema, componentName, options)
      case 'react-jsx':
        return this.exportReactJSX(schema, componentName, options)
      case 'html':
        return this.exportHTML(schema, componentName, options)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 导出Vue SFC (Options API)
   */
  private exportVueSFC(
    schema: PageSchema,
    componentName: string,
    options: ExportOptions
  ): ExportResult {
    const template = this.generateVueTemplate(schema.root)
    const script = this.generateVueScript(schema, componentName, false)
    const style = options.includeStyle ? this.generateVueStyle(schema) : ''

    const code = `<template>
${template}
</template>

<script>
${script}
</script>
${style}`

    return {
      code,
      filename: `${componentName}.vue`,
      language: 'vue'
    }
  }

  /**
   * 导出Vue SFC (Composition API + script setup)
   */
  private exportVueSetup(
    schema: PageSchema,
    componentName: string,
    options: ExportOptions
  ): ExportResult {
    const template = this.generateVueTemplate(schema.root)
    const script = this.generateVueScript(schema, componentName, true)
    const style = options.includeStyle ? this.generateVueStyle(schema) : ''

    const code = `<template>
${template}
</template>

<script setup lang="ts">
${script}
</script>
${style}`

    return {
      code,
      filename: `${componentName}.vue`,
      language: 'vue'
    }
  }

  /**
   * 导出React JSX
   */
  private exportReactJSX(
    schema: PageSchema,
    componentName: string,
    options: ExportOptions
  ): ExportResult {
    const jsx = this.generateReactJSX(schema.root)
    const imports = this.generateReactImports(schema)
    const hooks = this.generateReactHooks(schema)

    const code = `import React, { useState, useCallback } from 'react'
${imports}

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
${hooks}

  return (
${jsx}
  )
}

export default ${componentName}`

    return {
      code,
      filename: `${componentName}.tsx`,
      language: 'typescript'
    }
  }

  /**
   * 导出HTML
   */
  private exportHTML(
    schema: PageSchema,
    componentName: string,
    options: ExportOptions
  ): ExportResult {
    const html = this.generateHTML(schema.root)

    const code = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`

    return {
      code,
      filename: `${componentName}.html`,
      language: 'html'
    }
  }

  // ==================== Vue模板生成 ====================

  /**
   * 生成Vue模板
   */
  private generateVueTemplate(node: ComponentNode, depth: number = 1): string {
    const indent = this.indent.repeat(depth)
    const tagName = this.getComponentTagName(node.type)

    // 生成属性
    const attrs = this.generateVueAttrs(node)
    // 生成样式
    const styleAttr = this.generateVueStyleAttr(node)
    // 生成事件
    const events = this.generateVueEvents(node)
    // 生成条件
    const vIf = node.condition ? `v-if="${this.formatExpression(node.condition)}"` : ''
    // 生成循环
    const vFor = node.loop
      ? `v-for="${node.loop.itemName} in ${this.formatExpression(node.loop.source)}"`
      : ''

    // 生成子节点
    const children = node.children?.length
      ? '\n' +
        node.children.map((child) => this.generateVueTemplate(child, depth + 1)).join('\n') +
        '\n' +
        indent
      : ''

    // 组合所有属性
    const allAttrs = [vIf, vFor, attrs, styleAttr, events].filter(Boolean).join(' ')

    if (children) {
      return `${indent}<${tagName}${allAttrs ? ' ' + allAttrs : ''}>${children}</${tagName}>`
    } else {
      return `${indent}<${tagName}${allAttrs ? ' ' + allAttrs : ''} />`
    }
  }

  /**
   * 生成Vue属性
   */
  private generateVueAttrs(node: ComponentNode): string {
    const attrs: string[] = []

    if (node.props?.static) {
      for (const [key, value] of Object.entries(node.props.static)) {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            if (value) attrs.push(key)
          } else if (typeof value === 'object') {
            attrs.push(`:${key}="${JSON.stringify(value)}"`)
          } else {
            attrs.push(`${key}="${value}"`)
          }
        }
      }
    }

    if (node.props?.bindings) {
      for (const [key, binding] of Object.entries(node.props.bindings)) {
        attrs.push(`:${key}="${this.formatExpression(binding)}"`)
      }
    }

    if (node.props?.models) {
      for (const [key, model] of Object.entries(node.props.models)) {
        attrs.push(`v-model:${key}="${model.statePath}"`)
      }
    }

    return attrs.join(' ')
  }

  /**
   * 生成Vue样式属性
   */
  private generateVueStyleAttr(node: ComponentNode): string {
    if (!node.style?.static || Object.keys(node.style.static).length === 0) {
      return ''
    }

    const styleStr = this.styleObjectToString(node.style.static)
    return `style="${styleStr}"`
  }

  /**
   * 生成Vue事件
   */
  private generateVueEvents(node: ComponentNode): string {
    if (!node.events?.length) return ''

    return node.events
      .map((event) => {
        const handler = this.generateVueEventHandler(event)
        return `@${event.event}="${handler}"`
      })
      .join(' ')
  }

  /**
   * 生成Vue事件处理器
   */
  private generateVueEventHandler(event: EventBinding): string {
    const { handler } = event

    if (handler.type === 'builtin') {
      switch (handler.action) {
        case 'navigate':
          return `() => router.push('${handler.params?.path || '/'}')`
        case 'showMessage':
          return `() => message.success('${handler.params?.text || ''}')`
        case 'submitForm':
          return 'handleSubmit'
        case 'resetForm':
          return 'handleReset'
        default:
          return '() => {}'
      }
    } else if (handler.type === 'custom' && handler.code) {
      return handler.code
    }

    return '() => {}'
  }

  /**
   * 生成Vue脚本
   */
  private generateVueScript(schema: PageSchema, componentName: string, isSetup: boolean): string {
    const state = this.generateVueState(schema, isSetup)
    const methods = this.generateVueMethods(schema, isSetup)

    if (isSetup) {
      return `import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
${this.generateComponentImports(schema)}

const router = useRouter()

${state}

${methods}
`
    } else {
      return `import { defineComponent, ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
${this.generateComponentImports(schema)}

export default defineComponent({
  name: '${componentName}',
  setup() {
    const router = useRouter()

${state}

${methods}

    return {
${this.getStateReturns(schema)}
    }
  }
})
`
    }
  }

  /**
   * 生成Vue状态
   */
  private generateVueState(schema: PageSchema, isSetup: boolean): string {
    const indent = isSetup ? '' : this.indent.repeat(2)
    const lines: string[] = []

    // 默认状态
    lines.push(`${indent}const loading = ref(false)`)

    return lines.join('\n')
  }

  /**
   * 生成Vue方法
   */
  private generateVueMethods(schema: PageSchema, isSetup: boolean): string {
    const indent = isSetup ? '' : this.indent.repeat(2)
    const lines: string[] = []

    // 提取事件处理方法
    const handlers = this.extractEventHandlers(schema)

    if (handlers.has('submitForm')) {
      lines.push(`${indent}const handleSubmit = async () => {
${indent}${this.indent}loading.value = true
${indent}${this.indent}try {
${indent}${this.indent}${this.indent}// 提交逻辑
${indent}${this.indent}} finally {
${indent}${this.indent}${this.indent}loading.value = false
${indent}${this.indent}}
${indent}}`)
    }

    if (handlers.has('resetForm')) {
      lines.push(`${indent}const handleReset = () => {
${indent}${this.indent}// 重置逻辑
${indent}}`)
    }

    return lines.join('\n\n')
  }

  /**
   * 获取状态返回列表
   */
  private getStateReturns(schema: PageSchema): string {
    const indent = this.indent.repeat(3)
    const returns = ['loading', 'handleSubmit', 'handleReset']
    return returns.map((r) => `${indent}${r}`).join(',\n')
  }

  /**
   * 生成组件导入
   */
  private generateComponentImports(schema: PageSchema): string {
    const components = this.extractComponentTypes(schema)
    const imports = Array.from(components)
      .map((type) => `import ${type} from '@smart-link/ui'`)
      .join('\n')
    return imports
  }

  /**
   * 生成Vue样式
   */
  private generateVueStyle(schema: PageSchema): string {
    if (!schema.styles?.length) return ''

    const styles = schema.styles
      .map((style) => {
        if (style.scoped) {
          return `<style scoped>
${style.css}
</style>`
        }
        return `<style>
${style.css}
</style>`
      })
      .join('\n\n')

    return '\n' + styles
  }

  // ==================== React JSX生成 ====================

  /**
   * 生成React JSX
   */
  private generateReactJSX(node: ComponentNode, depth: number = 1): string {
    const indent = this.indent.repeat(depth + 1)
    const tagName = this.getComponentTagName(node.type, true)

    // 生成props
    const props = this.generateReactProps(node)
    // 生成样式
    const styleProp = this.generateReactStyleProp(node)
    // 生成事件
    const events = this.generateReactEvents(node)
    // 生成条件
    const condition = node.condition ? this.formatExpression(node.condition) : null

    // 生成子节点
    let children = ''
    if (node.children?.length) {
      if (node.loop) {
        children = `\n${indent}{${node.loop.source}?.map((${node.loop.itemName}) => (
${node.children.map((child) => this.generateReactJSX(child, depth + 2)).join('\n')}
${indent}))}
${this.indent.repeat(depth)}`
      } else {
        children =
          '\n' +
          node.children.map((child) => this.generateReactJSX(child, depth + 1)).join('\n') +
          '\n' +
          this.indent.repeat(depth)
      }
    }

    // 组合所有props
    const allProps = [props, styleProp, events].filter(Boolean).join(' ')

    const element = children
      ? `${indent}<${tagName}${allProps ? ' ' + allProps : ''}>${children}</${tagName}>`
      : `${indent}<${tagName}${allProps ? ' ' + allProps : ''} />`

    // 处理条件渲染
    if (condition) {
      return `${indent}{${condition} && (\n${element}\n${indent})}`
    }

    return element
  }

  /**
   * 生成React Props
   */
  private generateReactProps(node: ComponentNode): string {
    const props: string[] = []

    if (node.props?.static) {
      for (const [key, value] of Object.entries(node.props.static)) {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            if (value) props.push(key)
          } else if (typeof value === 'object') {
            props.push(`${key}={${JSON.stringify(value)}}`)
          } else {
            props.push(`${key}="${value}"`)
          }
        }
      }
    }

    if (node.props?.bindings) {
      for (const [key, binding] of Object.entries(node.props.bindings)) {
        props.push(`${key}={${this.formatExpression(binding)}}`)
      }
    }

    return props.join(' ')
  }

  /**
   * 生成React样式属性
   */
  private generateReactStyleProp(node: ComponentNode): string {
    if (!node.style?.static || Object.keys(node.style.static).length === 0) {
      return ''
    }

    const styleObj = JSON.stringify(node.style.static)
    return `style={${styleObj}}`
  }

  /**
   * 生成React事件
   */
  private generateReactEvents(node: ComponentNode): string {
    if (!node.events?.length) return ''

    return node.events
      .map((event) => {
        const eventName = 'on' + event.event.charAt(0).toUpperCase() + event.event.slice(1)
        const handler = this.generateReactEventHandler(event)
        return `${eventName}={${handler}}`
      })
      .join(' ')
  }

  /**
   * 生成React事件处理器
   */
  private generateReactEventHandler(event: EventBinding): string {
    const { handler } = event

    if (handler.type === 'builtin') {
      switch (handler.action) {
        case 'navigate':
          return `() => navigate('${handler.params?.path || '/'}')`
        case 'showMessage':
          return `() => message.success('${handler.params?.text || ''}')`
        case 'submitForm':
          return 'handleSubmit'
        case 'resetForm':
          return 'handleReset'
        default:
          return '() => {}'
      }
    } else if (handler.type === 'custom' && handler.code) {
      return handler.code
    }

    return '() => {}'
  }

  /**
   * 生成React导入
   */
  private generateReactImports(schema: PageSchema): string {
    const components = this.extractComponentTypes(schema)
    const imports = Array.from(components)
      .map((type: string) => `import { ${type} } from '@smart-link/ui'`)
      .join('\n')
    return imports
  }

  /**
   * 生成React Hooks
   */
  private generateReactHooks(schema: PageSchema): string {
    const indent = this.indent
    const lines: string[] = []

    lines.push(`${indent}const [loading, setLoading] = useState(false)`)
    lines.push(`${indent}const navigate = useNavigate()`)

    // 提取事件处理方法
    const handlers = this.extractEventHandlers(schema)

    if (handlers.has('submitForm')) {
      lines.push(``)
      lines.push(`${indent}const handleSubmit = useCallback(async () => {
${indent}${this.indent}setLoading(true)
${indent}${this.indent}try {
${indent}${this.indent}${this.indent}// 提交逻辑
${indent}${this.indent}} finally {
${indent}${this.indent}${this.indent}setLoading(false)
${indent}${this.indent}}
${indent}}, [])`)
    }

    if (handlers.has('resetForm')) {
      lines.push(``)
      lines.push(`${indent}const handleReset = useCallback(() => {
${indent}${this.indent}// 重置逻辑
${indent}}, [])`)
    }

    return lines.join('\n')
  }

  // ==================== HTML生成 ====================

  /**
   * 生成HTML
   */
  private generateHTML(node: ComponentNode, depth: number = 0): string {
    const indent = this.indent.repeat(depth)
    const tagName = this.getHTMLTagName(node.type)

    // 生成属性
    const attrs = this.generateHTMLAttrs(node)
    // 生成样式
    const style = this.generateHTMLStyle(node)
    // 生成子节点
    const children = node.children?.length
      ? '\n' +
        node.children.map((child) => this.generateHTML(child, depth + 1)).join('\n') +
        '\n' +
        indent
      : ''

    const allAttrs = [attrs, style].filter(Boolean).join(' ')

    if (children) {
      return `${indent}<${tagName}${allAttrs ? ' ' + allAttrs : ''}>${children}</${tagName}>`
    } else if (this.isVoidElement(tagName)) {
      return `${indent}<${tagName}${allAttrs ? ' ' + allAttrs : ''} />`
    } else {
      return `${indent}<${tagName}${allAttrs ? ' ' + allAttrs : ''}></${tagName}>`
    }
  }

  /**
   * 生成HTML属性
   */
  private generateHTMLAttrs(node: ComponentNode): string {
    const attrs: string[] = []

    if (node.props?.static) {
      for (const [key, value] of Object.entries(node.props.static)) {
        if (key === 'text' || key === 'content') continue
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            if (value) attrs.push(key)
          } else {
            attrs.push(`${key}="${value}"`)
          }
        }
      }
    }

    // 特殊处理文本内容
    if (node.props?.static?.text) {
      // 文本内容会在children中处理
    }

    return attrs.join(' ')
  }

  /**
   * 生成HTML样式
   */
  private generateHTMLStyle(node: ComponentNode): string {
    if (!node.style?.static || Object.keys(node.style.static).length === 0) {
      return ''
    }

    const styleStr = this.styleObjectToString(node.style.static)
    return `style="${styleStr}"`
  }

  // ==================== 工具方法 ====================

  /**
   * 获取组件标签名
   */
  private getComponentTagName(type: string, isReact: boolean = false): string {
    // 移除Sl前缀
    const name = type.replace(/^Sl/, '')
    return isReact ? name : name
  }

  /**
   * 获取HTML标签名
   */
  private getHTMLTagName(type: string): string {
    const mapping: Record<string, string> = {
      SlButton: 'button',
      SlInput: 'input',
      SlContainer: 'div',
      SlCard: 'div',
      SlText: 'p',
      SlImage: 'img',
      SlIcon: 'span',
      SlTag: 'span',
      SlDivider: 'hr',
      SlRow: 'div',
      SlCol: 'div',
      SlForm: 'form',
      SlFormItem: 'div',
      SlSelect: 'select',
      SlCheckbox: 'input',
      SlRadio: 'input',
      SlSwitch: 'input'
    }
    return mapping[type] || 'div'
  }

  /**
   * 判断是否为自闭合元素
   */
  private isVoidElement(tagName: string): boolean {
    const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link']
    return voidElements.includes(tagName)
  }

  /**
   * 格式化表达式
   */
  private formatExpression(binding: any): string {
    if (typeof binding === 'string') return binding
    if (binding.value) return binding.value
    return ''
  }

  /**
   * 样式对象转字符串
   */
  private styleObjectToString(style: Record<string, any>): string {
    return Object.entries(style)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
        return `${cssKey}: ${value}`
      })
      .join('; ')
  }

  /**
   * 提取组件类型
   */
  private extractComponentTypes(schema: PageSchema): Set<string> {
    const types = new Set<string>()

    const traverse = (node: ComponentNode) => {
      types.add(node.type)
      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    if (schema.root) {
      traverse(schema.root)
    }

    return types
  }

  /**
   * 提取事件处理器
   */
  private extractEventHandlers(schema: PageSchema): Set<string> {
    const handlers = new Set<string>()

    const traverse = (node: ComponentNode) => {
      if (node.events) {
        node.events.forEach((event) => {
          if (event.handler.action) {
            handlers.add(event.handler.action)
          }
        })
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    if (schema.root) {
      traverse(schema.root)
    }

    return handlers
  }
}

// 导出单例
export const codeExportService = new CodeExportService()

// 导出类
export { CodeExportService }
