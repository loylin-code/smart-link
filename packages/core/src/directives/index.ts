/**
 * SmartLink Core - Directive Processor
 * 指令处理系统
 */

import type {
  DirectiveProcessor,
  ComponentNode,
  RuntimeContext,
  LoopResult,
  ExpressionBinding,
  StateBinding,
  PropConfig
} from '../types'

/**
 * 创建指令处理器
 */
export function createDirectiveProcessor(evaluator: any): DirectiveProcessor {
  /**
   * 处理条件渲染指令
   */
  function processCondition(node: ComponentNode, context: RuntimeContext): boolean {
    if (!node.condition) {
      return true
    }

    try {
      const result = evaluator.evaluateBinding(node.condition, {
        state: context.state,
        methods: context.methods
      })

      // 转换为布尔值
      return Boolean(result)
    } catch (error) {
      console.error('[DirectiveProcessor] Condition evaluation failed:', error)
      return false
    }
  }

  /**
   * 处理循环渲染指令
   */
  function processLoop(node: ComponentNode, context: RuntimeContext): LoopResult[] {
    if (!node.loop) {
      return [{ $item: undefined, $index: 0 }]
    }

    try {
      // 获取数据源
      const source = evaluator.evaluateBinding(node.loop!.source, {
        state: context.state,
        methods: context.methods
      })

      // 确保是数组
      const items = Array.isArray(source) ? source : []

      // 生成循环结果
      return items.map((item, index) => ({
        $item: item,
        $index: index
      }))
    } catch (error) {
      console.error('[DirectiveProcessor] Loop processing failed:', error)
      return []
    }
  }

  /**
   * 处理双向绑定指令
   */
  function processModel(node: ComponentNode, context: RuntimeContext): Record<string, any> {
    if (!node.props?.models) {
      return {}
    }

    const modelProps: Record<string, any> = {}

    for (const [propName, binding] of Object.entries(node.props.models)) {
      const stateBinding = binding as StateBinding

      // 获取当前值
      const currentValue = context.getState(stateBinding.statePath)

      // 应用getter转换
      let value = currentValue
      if (stateBinding.transform?.get) {
        try {
          value = evaluator.evaluate(stateBinding.transform.get, {
            state: context.state,
            methods: context.methods,
            $value: currentValue
          })
        } catch (error) {
          console.error('[DirectiveProcessor] Model getter transform failed:', error)
        }
      }

      modelProps[propName] = value

      // 创建更新回调
      const updateEventName = `onUpdate:${propName}`
      modelProps[updateEventName] = (newValue: any) => {
        // 应用setter转换
        let valueToSet = newValue
        if (stateBinding.transform?.set) {
          try {
            valueToSet = evaluator.evaluate(stateBinding.transform.set, {
              state: context.state,
              methods: context.methods,
              $value: newValue
            })
          } catch (error) {
            console.error('[DirectiveProcessor] Model setter transform failed:', error)
          }
        }

        context.setState(stateBinding.statePath, valueToSet)
      }
    }

    return modelProps
  }

  /**
   * 处理属性绑定
   */
  function processBindings(
    bindings: Record<string, ExpressionBinding>,
    context: RuntimeContext,
    loopContext?: LoopResult
  ): Record<string, any> {
    const props: Record<string, any> = {}

    for (const [propName, binding] of Object.entries(bindings)) {
      try {
        const evaluationContext: any = {
          state: context.state,
          methods: context.methods
        }

        // 添加循环上下文
        if (loopContext) {
          evaluationContext.$item = loopContext.$item
          evaluationContext.$index = loopContext.$index
        }

        props[propName] = evaluator.evaluateBinding(binding, evaluationContext)
      } catch (error) {
        console.error(`[DirectiveProcessor] Binding evaluation failed for "${propName}":`, error)
      }
    }

    return props
  }

  /**
   * 处理样式绑定
   */
  function processStyleBindings(
    styleBindings: Record<string, ExpressionBinding>,
    context: RuntimeContext
  ): Record<string, any> {
    const styles: Record<string, any> = {}

    for (const [styleName, binding] of Object.entries(styleBindings)) {
      try {
        styles[styleName] = evaluator.evaluateBinding(binding, {
          state: context.state,
          methods: context.methods
        })
      } catch (error) {
        console.error(
          `[DirectiveProcessor] Style binding evaluation failed for "${styleName}":`,
          error
        )
      }
    }

    return styles
  }

  /**
   * 处理类绑定
   */
  function processClassBindings(
    classBindings: Record<string, ExpressionBinding>,
    context: RuntimeContext
  ): string[] {
    const classes: string[] = []

    for (const [className, binding] of Object.entries(classBindings)) {
      try {
        const result = evaluator.evaluateBinding(binding, {
          state: context.state,
          methods: context.methods
        })

        if (result) {
          classes.push(className)
        }
      } catch (error) {
        console.error(
          `[DirectiveProcessor] Class binding evaluation failed for "${className}":`,
          error
        )
      }
    }

    return classes
  }

  return {
    processCondition,
    processLoop,
    processModel,
    processBindings,
    processStyleBindings,
    processClassBindings
  } as DirectiveProcessor
}

/**
 * 默认导出
 */
export default createDirectiveProcessor
