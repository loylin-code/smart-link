/**
 * AI Service - LLM API 对接服务
 * 支持多种AI模型（OpenAI、Claude、本地模型等）
 */

import type { PageSchema, ComponentNode } from '@smart-link/core'

// AI服务配置
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
}

// 对话消息
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI响应
export interface AIResponse {
  success: boolean
  content?: string
  schema?: PageSchema
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Schema生成选项
export interface SchemaGenerationOptions {
  pageType?: 'form' | 'dashboard' | 'list' | 'detail' | 'custom'
  theme?: 'light' | 'dark'
  language?: 'zh-CN' | 'en-US'
  maxComponents?: number
}

// 默认配置
const DEFAULT_CONFIG: AIConfig = {
  provider: 'openai',
  model: 'gpt-4o'
}

// 系统提示词 - Schema生成
const SYSTEM_PROMPT_SCHEMA = `你是一个专业的前端页面Schema生成器。用户会描述他们想要的页面，你需要生成符合以下TypeScript类型的JSON Schema。

类型定义：
\`\`\`typescript
interface PageSchema {
  id: string
  version: string
  root: ComponentNode
  styles?: StyleDefinition[]
}

interface ComponentNode {
  id: string
  type: string  // 组件类型：SlButton, SlInput, SlContainer, SlText, SlCard, SlForm, SlTable 等
  props?: {
    static?: Record<string, any>
    bindings?: Record<string, ExpressionBinding>
  }
  style?: {
    static?: CSSProperties
    class?: { static?: string[] }
  }
  events?: EventBinding[]
  children?: ComponentNode[]
}

interface EventBinding {
  event: string
  handler: {
    type: 'builtin' | 'custom'
    action?: string  // navigate, showMessage, submitForm 等
    code?: string
  }
}
\`\`\`

可用组件：
- SlContainer: 容器组件，props: { direction: 'horizontal' | 'vertical', gap: number }
- SlText: 文本组件，props: { content: string, type: 'h1'|'h2'|'h3'|'p'|'span' }
- SlButton: 按钮组件，props: { type: 'primary'|'default'|'dashed'|'text', text: string }
- SlInput: 输入框组件，props: { placeholder: string, label: string }
- SlSelect: 选择器组件，props: { placeholder: string, options: Array<{label, value}> }
- SlCheckbox: 复选框组件，props: { label: string, checked: boolean }
- SlRadio: 单选框组件，props: { label: string, options: Array<{label, value}> }
- SlForm: 表单组件，props: { labelWidth: number }
- SlFormItem: 表单项，props: { label: string, required: boolean }
- SlTable: 表格组件，props: { columns: Array<{key, title}>, data: Array }
- SlCard: 卡片组件，props: { title: string, bordered: boolean }
- SlImage: 图片组件，props: { src: string, alt: string }
- SlIcon: 图标组件，props: { name: string, size: number }
- SlDivider: 分割线组件
- SlSpace: 间距组件，props: { size: number, direction: 'horizontal'|'vertical' }
- SlGrid: 栅格组件，props: { columns: number, gap: number }
- SlGridItem: 栅格项

规则：
1. 每个组件必须有唯一的id，格式为：组件类型_时间戳_随机数
2. version 固定为 "1.0.0"
3. 根节点通常是 SlContainer
4. 事件处理优先使用 builtin 类型
5. 样式使用简化的CSS属性名（如 backgroundColor, fontSize, padding, margin）
6. 只输出JSON，不要包含任何解释或markdown代码块标记

请根据用户描述生成对应的PageSchema JSON。`

class AIService {
  private config: AIConfig
  private conversationHistory: ChatMessage[] = []

  constructor(config: AIConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 生成页面Schema
   */
  async generateSchema(prompt: string, options: SchemaGenerationOptions = {}): Promise<AIResponse> {
    // 构建用户提示
    const userPrompt = this.buildUserPrompt(prompt, options)

    // 添加到对话历史
    this.conversationHistory.push({ role: 'user', content: userPrompt })

    try {
      // 调用LLM
      const response = await this.callLLM([
        { role: 'system', content: SYSTEM_PROMPT_SCHEMA },
        ...this.conversationHistory
      ])

      if (!response.success || !response.content) {
        return response
      }

      // 解析Schema
      const schema = this.parseSchemaFromResponse(response.content)

      if (schema) {
        // 添加到对话历史
        this.conversationHistory.push({ role: 'assistant', content: response.content })
        return { ...response, schema }
      }

      return {
        success: false,
        error: 'Failed to parse schema from AI response'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error'
      }
    }
  }

  /**
   * 迭代修改Schema
   */
  async modifySchema(currentSchema: PageSchema, instruction: string): Promise<AIResponse> {
    const modifyPrompt = `当前页面Schema如下：
\`\`\`json
${JSON.stringify(currentSchema, null, 2)}
\`\`\`

请根据以下要求修改：${instruction}

输出修改后的完整Schema JSON。`

    this.conversationHistory.push({ role: 'user', content: modifyPrompt })

    try {
      const response = await this.callLLM([
        { role: 'system', content: SYSTEM_PROMPT_SCHEMA },
        ...this.conversationHistory
      ])

      if (!response.success || !response.content) {
        return response
      }

      const schema = this.parseSchemaFromResponse(response.content)

      if (schema) {
        this.conversationHistory.push({ role: 'assistant', content: response.content })
        return { ...response, schema }
      }

      return {
        success: false,
        error: 'Failed to parse modified schema'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 清空对话历史
   */
  clearHistory() {
    this.conversationHistory = []
  }

  /**
   * 构建用户提示
   */
  private buildUserPrompt(prompt: string, options: SchemaGenerationOptions): string {
    let context = ''

    if (options.pageType) {
      context += `页面类型：${options.pageType}\n`
    }
    if (options.language) {
      context += `语言：${options.language}\n`
    }
    if (options.maxComponents) {
      context += `最大组件数量：${options.maxComponents}\n`
    }

    return context ? `${context}\n${prompt}` : prompt
  }

  /**
   * 调用LLM API
   */
  private async callLLM(messages: ChatMessage[]): Promise<AIResponse> {
    const { provider, apiKey, baseUrl, model } = this.config

    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(messages, apiKey!, baseUrl, model)
        case 'anthropic':
          return await this.callAnthropic(messages, apiKey!, baseUrl, model)
        case 'ollama':
          return await this.callOllama(messages, baseUrl, model)
        default:
          return await this.callCustom(messages, baseUrl!)
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * OpenAI API调用
   */
  private async callOpenAI(
    messages: ChatMessage[],
    apiKey: string,
    baseUrl?: string,
    model: string = 'gpt-4o'
  ): Promise<AIResponse> {
    const url = baseUrl || 'https://api.openai.com/v1/chat/completions'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'OpenAI API error' }
    }

    const data = await response.json()

    return {
      success: true,
      content: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  }

  /**
   * Anthropic Claude API调用
   */
  private async callAnthropic(
    messages: ChatMessage[],
    apiKey: string,
    baseUrl?: string,
    model: string = 'claude-3-5-sonnet-20241022'
  ): Promise<AIResponse> {
    const url = baseUrl || 'https://api.anthropic.com/v1/messages'

    // 转换消息格式
    const systemMessage = messages.find((m) => m.role === 'system')
    const otherMessages = messages.filter((m) => m.role !== 'system')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'Anthropic API error' }
    }

    const data = await response.json()

    return {
      success: true,
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  }

  /**
   * Ollama本地模型调用
   */
  private async callOllama(
    messages: ChatMessage[],
    baseUrl?: string,
    model: string = 'llama3'
  ): Promise<AIResponse> {
    const url = `${baseUrl || 'http://localhost:11434'}/api/chat`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      })
    })

    if (!response.ok) {
      return { success: false, error: 'Ollama API error' }
    }

    const data = await response.json()

    return {
      success: true,
      content: data.message?.content || ''
    }
  }

  /**
   * 自定义API调用
   */
  private async callCustom(messages: ChatMessage[], baseUrl: string): Promise<AIResponse> {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      return { success: false, error: 'Custom API error' }
    }

    const data = await response.json()

    return {
      success: true,
      content: data.content || data.response || ''
    }
  }

  /**
   * 从响应中解析Schema
   */
  private parseSchemaFromResponse(content: string): PageSchema | null {
    try {
      // 尝试直接解析
      let jsonStr = content.trim()

      // 如果包含markdown代码块，提取JSON
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim()
      }

      // 移除可能的前缀文本
      const jsonStart = jsonStr.indexOf('{')
      if (jsonStart > 0) {
        jsonStr = jsonStr.substring(jsonStart)
      }

      const schema = JSON.parse(jsonStr) as PageSchema

      // 验证基本结构
      if (!schema.id || !schema.version || !schema.root) {
        console.warn('Invalid schema structure:', schema)
        return null
      }

      // 修正组件ID格式
      this.normalizeSchema(schema)

      return schema
    } catch (error) {
      console.error('Failed to parse schema:', error)
      return null
    }
  }

  /**
   * 标准化Schema
   */
  private normalizeSchema(schema: PageSchema) {
    const timestamp = Date.now()

    const normalizeNode = (node: ComponentNode, index: number = 0) => {
      // 确保ID格式正确
      if (!node.id || !node.id.includes('_')) {
        node.id = `${node.type}_${timestamp}_${index}_${Math.random().toString(36).substr(2, 9)}`
      }

      // 递归处理子节点
      if (node.children?.length) {
        node.children.forEach((child, i) => normalizeNode(child, i))
      }
    }

    normalizeNode(schema.root)
  }
}

// 导出单例
export const aiService = new AIService()

// 导出类
export { AIService }
