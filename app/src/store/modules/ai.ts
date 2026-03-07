/**
 * AI Store - AI服务状态管理
 */

import { defineStore } from 'pinia'
import {
  aiService,
  type AIConfig,
  type AIResponse,
  type SchemaGenerationOptions
} from '@/services/ai'
import type { PageSchema } from '@smart-link/core'

export interface AIState {
  // 配置
  config: AIConfig

  // 对话状态
  messages: AIMessage[]

  // 生成状态
  isGenerating: boolean
  currentTask: string | null

  // 错误信息
  error: string | null

  // 面板状态
  panelVisible: boolean
  panelWidth: number
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status: 'pending' | 'success' | 'error'
  schema?: PageSchema
  error?: string
}

export const useAIStore = defineStore('ai', {
  state: (): AIState => ({
    config: {
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: '',
      baseUrl: ''
    },

    messages: [],

    isGenerating: false,
    currentTask: null,

    error: null,

    panelVisible: true,
    panelWidth: 400
  }),

  getters: {
    hasApiKey: (state) => !!state.config.apiKey,
    lastMessage: (state) => state.messages[state.messages.length - 1],
    conversationHistory: (state) => state.messages.filter((m) => m.role !== 'system')
  },

  actions: {
    /**
     * 更新AI配置
     */
    updateConfig(config: Partial<AIConfig>) {
      this.config = { ...this.config, ...config }
      aiService.updateConfig(this.config)
    },

    /**
     * 设置API Key
     */
    setApiKey(apiKey: string, provider: AIConfig['provider'] = 'openai') {
      this.config.apiKey = apiKey
      this.config.provider = provider
      aiService.updateConfig({ apiKey, provider })
    },

    /**
     * 生成页面Schema
     */
    async generateSchema(prompt: string, options: SchemaGenerationOptions = {}) {
      if (this.isGenerating) {
        return null
      }

      this.isGenerating = true
      this.currentTask = prompt
      this.error = null

      // 添加用户消息
      const userMessage: AIMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        status: 'success'
      }
      this.messages.push(userMessage)

      // 添加待处理的助手消息
      const assistantMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'pending'
      }
      this.messages.push(assistantMessage)

      try {
        const response: AIResponse = await aiService.generateSchema(prompt, options)

        if (response.success && response.schema) {
          // 更新助手消息
          const index = this.messages.findIndex((m) => m.id === assistantMessage.id)
          if (index !== -1) {
            this.messages[index] = {
              ...this.messages[index],
              content: response.content || '已生成页面Schema',
              status: 'success',
              schema: response.schema
            }
          }

          return response.schema
        } else {
          // 更新错误状态
          const index = this.messages.findIndex((m) => m.id === assistantMessage.id)
          if (index !== -1) {
            this.messages[index] = {
              ...this.messages[index],
              content: response.error || '生成失败',
              status: 'error',
              error: response.error
            }
          }
          this.error = response.error || '生成失败'

          return null
        }
      } catch (error: any) {
        const index = this.messages.findIndex((m) => m.id === assistantMessage.id)
        if (index !== -1) {
          this.messages[index] = {
            ...this.messages[index],
            content: error.message || '发生错误',
            status: 'error',
            error: error.message
          }
        }
        this.error = error.message

        return null
      } finally {
        this.isGenerating = false
        this.currentTask = null
      }
    },

    /**
     * 修改现有Schema
     */
    async modifySchema(currentSchema: PageSchema, instruction: string) {
      if (this.isGenerating) {
        return null
      }

      this.isGenerating = true
      this.currentTask = instruction
      this.error = null

      // 添加用户消息
      const userMessage: AIMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: instruction,
        timestamp: Date.now(),
        status: 'success'
      }
      this.messages.push(userMessage)

      // 添加待处理的助手消息
      const assistantMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'pending'
      }
      this.messages.push(assistantMessage)

      try {
        const response = await aiService.modifySchema(currentSchema, instruction)

        if (response.success && response.schema) {
          const index = this.messages.findIndex((m) => m.id === assistantMessage.id)
          if (index !== -1) {
            this.messages[index] = {
              ...this.messages[index],
              content: response.content || '已修改页面Schema',
              status: 'success',
              schema: response.schema
            }
          }

          return response.schema
        } else {
          const index = this.messages.findIndex((m) => m.id === assistantMessage.id)
          if (index !== -1) {
            this.messages[index] = {
              ...this.messages[index],
              content: response.error || '修改失败',
              status: 'error',
              error: response.error
            }
          }
          this.error = response.error || '修改失败'

          return null
        }
      } catch (error: any) {
        const index = this.messages.findIndex((m) => m.id === assistantMessage.id)
        if (index !== -1) {
          this.messages[index] = {
            ...this.messages[index],
            content: error.message || '发生错误',
            status: 'error',
            error: error.message
          }
        }
        this.error = error.message

        return null
      } finally {
        this.isGenerating = false
        this.currentTask = null
      }
    },

    /**
     * 清空对话历史
     */
    clearMessages() {
      this.messages = []
      this.error = null
      aiService.clearHistory()
    },

    /**
     * 删除消息
     */
    deleteMessage(id: string) {
      const index = this.messages.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.messages.splice(index, 1)
      }
    },

    /**
     * 切换面板可见性
     */
    togglePanel() {
      this.panelVisible = !this.panelVisible
    },

    /**
     * 设置面板可见性
     */
    setPanelVisible(visible: boolean) {
      this.panelVisible = visible
    },

    /**
     * 设置面板宽度
     */
    setPanelWidth(width: number) {
      this.panelWidth = Math.max(300, Math.min(600, width))
    }
  },

  persist: {
    key: 'smart-link-ai',
    paths: ['config', 'panelVisible', 'panelWidth']
  }
})
