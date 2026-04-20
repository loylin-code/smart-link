/**
 * SmartLink Core - Renderer
 * 核心渲染引擎
 */

import { h, defineComponent, type VNode, Fragment } from 'vue'
import type {
  Renderer,
  RendererConfig,
  PageSchema,
  ComponentNode,
  RuntimeContext,
  SlotContent
} from '../types'
import { createExpressionEvaluator } from '../evaluator'
import { createComponentRegistry } from '../registry'
import { createEventProcessor } from '../events'
import { createDirectiveProcessor } from '../directives'

/**
 * 创建渲染器
 */
export function createRenderer(config: Partial<RendererConfig> = {}): Renderer {
  // 创建核心组件
  const evaluator = config.evaluator || createExpressionEvaluator()
  const registry = config.registry || createComponentRegistry()
  const events = config.events || createEventProcessor()
  const directives = config.directives || createDirectiveProcessor(evaluator)
  const plugins = config.plugins || []

  /**
   * 渲染页面
   */
  function renderPage(schema: PageSchema, context: RuntimeContext): VNode {
    let processedSchema = schema
    for (const plugin of plugins) {
      if (plugin.beforeRender) {
        processedSchema = plugin.beforeRender(processedSchema)
      }
    }

    const PageComponent = defineComponent({
      name: `Page_${schema.id}`,
      setup() {
        return () => {
          const vnode = renderNode(processedSchema.root, context)
          let processedVNode = vnode
          for (const plugin of plugins) {
            if (plugin.afterRender) {
              processedVNode = plugin.afterRender(processedVNode, processedSchema)
            }
          }
          return processedVNode
        }
      }
    })

    return h(PageComponent)
  }

  /**
   * 渲染节点
   */
  function renderNode(node: ComponentNode, context: RuntimeContext): VNode | VNode[] | null {
    if (!node) return null

    let processedNode = node
    for (const plugin of plugins) {
      if (plugin.beforeNodeRender) {
        processedNode = plugin.beforeNodeRender(processedNode)
      }
    }

    if (processedNode.condition) {
      const shouldRender = directives.processCondition(processedNode, context)
      if (!shouldRender) return null
    }

    if (processedNode.loop) {
      const loopResults = directives.processLoop(processedNode, context)
      if (loopResults.length === 0) return null

      const vnodes: VNode[] = []
      for (const loopItem of loopResults) {
        const loopContext = createLoopContext(context, loopItem)
        const vnode = renderSingleNode(processedNode, loopContext)
        if (vnode) {
          if (processedNode.loop!.key) {
            vnode.key = loopItem.$item[processedNode.loop!.key] ?? loopItem.$index
          } else {
            vnode.key = loopItem.$index
          }
          vnodes.push(vnode)
        }
      }
      return vnodes.length === 1 ? vnodes[0] : h(Fragment, {}, vnodes)
    }

    return renderSingleNode(processedNode, context)
  }

  /**
   * 渲染单个节点
   */
  function renderSingleNode(node: ComponentNode, context: RuntimeContext): VNode | null {
    const component = registry.get(node.type)
    if (!component) {
      console.warn(`[Renderer] Component not found: ${node.type}`)
      return createPlaceholderVNode(node)
    }

    const props = resolveProps(node, context)
    const { style, className } = resolveStyle(node, context)
    const eventHandlers = resolveEvents(node, context)

    const mergedProps: Record<string, any> = { ...props, style, ...eventHandlers }
    if (className) mergedProps.class = className

    const slots = resolveSlots(node, context)
    const children = resolveChildren(node, context)

    const vnode = h(component, mergedProps, slots || children)

    let processedVNode = vnode
    for (const plugin of plugins) {
      if (plugin.afterNodeRender) {
        processedVNode = plugin.afterNodeRender(processedVNode, node)
      }
    }
    return processedVNode
  }

  function resolveProps(node: ComponentNode, context: RuntimeContext): Record<string, any> {
    const props: Record<string, any> = {}
    if (!node.props) return props
    if (node.props.static) Object.assign(props, node.props.static)
    if (node.props.bindings) {
      const bindings = (directives as any).processBindings?.(node.props.bindings, context) || {}
      Object.assign(props, bindings)
    }
    if (node.props.models) {
      const modelProps = (directives as any).processModel?.(node, context) || {}
      Object.assign(props, modelProps)
    }
    return props
  }

  function resolveStyle(
    node: ComponentNode,
    context: RuntimeContext
  ): { style: Record<string, any>; className: string } {
    const result: { style: Record<string, any>; className: string } = { style: {}, className: '' }
    if (!node.style) return result
    if (node.style.static) Object.assign(result.style, node.style.static)
    if (node.style.bindings) {
      const dynamicStyles =
        (directives as any).processStyleBindings?.(node.style.bindings, context) || {}
      Object.assign(result.style, dynamicStyles)
    }
    if (node.style.class) {
      const classes: string[] = []
      if (node.style.class.static) classes.push(...node.style.class.static)
      if (node.style.class.bindings) {
        const dynamicClasses =
          (directives as any).processClassBindings?.(node.style.class.bindings, context) || []
        classes.push(...dynamicClasses)
      }
      result.className = classes.join(' ')
    }
    return result
  }

  function resolveEvents(node: ComponentNode, context: RuntimeContext): Record<string, any> {
    if (!node.events || node.events.length === 0) return {}
    const eventHandlers: Record<string, any> = {}
    for (const binding of node.events) {
      const eventName = `on${capitalize(binding.event)}`
      eventHandlers[eventName] = async (event: any) => {
        if (binding.modifiers) applyEventModifiers(binding.modifiers, event)
        await events.handle(binding, context, event)
      }
    }
    return eventHandlers
  }

  function resolveSlots(
    node: ComponentNode,
    context: RuntimeContext
  ): Record<string, any> | undefined {
    if (!node.slots || Object.keys(node.slots).length === 0) return undefined
    const slots: Record<string, any> = {}
    for (const [slotName, slotContent] of Object.entries(node.slots)) {
      slots[slotName] = () => renderSlotContent(slotContent, context)
    }
    return slots
  }

  function renderSlotContent(
    content: SlotContent,
    context: RuntimeContext
  ): VNode | VNode[] | string | null {
    switch (content.type) {
      case 'text':
        return content.text || ''
      case 'expression':
        if (content.expression) {
          const result = evaluator.evaluate(content.expression, {
            state: context.state,
            methods: context.methods
          })
          return String(result)
        }
        return ''
      case 'components':
        if (content.components && content.components.length > 0) {
          const vnodes = content.components
            .map((child) => renderNode(child, context))
            .filter(Boolean) as VNode[]
          return vnodes.length === 1 ? vnodes[0] : vnodes
        }
        return null
      default:
        return null
    }
  }

  function resolveChildren(node: ComponentNode, context: RuntimeContext): VNode[] | undefined {
    if (!node.children || node.children.length === 0) return undefined
    return node.children.map((child) => renderNode(child, context)).filter(Boolean) as VNode[]
  }

  function createLoopContext(
    context: RuntimeContext,
    loopItem: { $item: any; $index: number }
  ): RuntimeContext {
    return {
      ...context,
      state: { ...context.state, $item: loopItem.$item, $index: loopItem.$index }
    }
  }

  function createPlaceholderVNode(node: ComponentNode): VNode {
    return h(
      'div',
      { class: 'component-placeholder', 'data-type': node.type, 'data-id': node.id },
      `Component: ${node.type}`
    )
  }

  function destroy(): void {}

  return { renderPage, renderNode, destroy }
}

function applyEventModifiers(modifiers: string[], event: any): void {
  for (const modifier of modifiers) {
    if (modifier === 'prevent') event?.preventDefault?.()
    if (modifier === 'stop') event?.stopPropagation?.()
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function createFullRenderer(): Renderer & {
  evaluator: ReturnType<typeof createExpressionEvaluator>
  registry: ReturnType<typeof createComponentRegistry>
  events: ReturnType<typeof createEventProcessor>
  directives: ReturnType<typeof createDirectiveProcessor>
} {
  const evaluator = createExpressionEvaluator()
  const registry = createComponentRegistry()
  const events = createEventProcessor()
  const directives = createDirectiveProcessor(evaluator)
  const renderer = createRenderer({ evaluator, registry, events, directives })
  return { ...renderer, evaluator, registry, events, directives }
}

export default createRenderer
