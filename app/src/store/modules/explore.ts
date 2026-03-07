import { defineStore } from 'pinia'
import type { ChatMessage, ChatConversation, ChatTemplate, ConversationGroup } from '@/types'
import { conversationApi, type ConversationCreateParams } from '@/services/conversation'
import { getWebSocket, type StreamResponseData } from '@/services/websocket'

// 预定义对话模板
const CHAT_TEMPLATES: ChatTemplate[] = [
  {
    id: 'customer-service',
    name: '智能客服',
    icon: '🤖',
    description: '自动回复客户常见问题',
    features: ['常见问题自动回复', '智能转人工', '知识库检索'],
    initialPrompt: '我想创建一个智能客服系统...',
    category: 'service'
  },
  {
    id: 'data-analysis',
    name: '数据分析',
    icon: '📊',
    description: '数据统计分析与可视化',
    features: ['数据统计分析', '可视化报告', '趋势预测'],
    initialPrompt: '请帮我分析以下数据...',
    category: 'analytics'
  },
  {
    id: 'document-processing',
    name: '文档处理',
    icon: '📄',
    description: '文档摘要、格式转换',
    features: ['文档摘要提取', '格式转换', '内容理解'],
    initialPrompt: '请处理这份文档...',
    category: 'document'
  },
  {
    id: 'workflow',
    name: '工作流',
    icon: '🔄',
    description: '业务流程编排与自动化',
    features: ['业务流程编排', '自动化任务', '条件分支'],
    initialPrompt: '我需要设计一个工作流...',
    category: 'workflow'
  },
  {
    id: 'content-generation',
    name: '内容生成',
    icon: '🎨',
    description: '营销文案、创意写作',
    features: ['营销文案生成', '创意写作', '多风格输出'],
    initialPrompt: '请帮我生成...',
    category: 'content'
  },
  {
    id: 'business-analysis',
    name: '业务分析',
    icon: '💼',
    description: '业务数据洞察与决策',
    features: ['业务数据洞察', '决策支持', '风险评估'],
    initialPrompt: '请分析业务数据...',
    category: 'business'
  }
]

interface ExploreState {
  conversations: ChatConversation[]
  activeConversationId: string | null
  searchQuery: string
  loading: boolean
  error: string | null
  templates: ChatTemplate[]
  wsConnected: boolean
  streamingMessage: string
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export const useExploreStore = defineStore('explore', {
  state: (): ExploreState => ({
    conversations: [],
    activeConversationId: null,
    searchQuery: '',
    loading: false,
    error: null,
    templates: CHAT_TEMPLATES,
    wsConnected: false,
    streamingMessage: '',
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    }
  }),

  getters: {
    // 当前活动对话
    activeConversation: (state): ChatConversation | undefined => {
      return state.conversations.find((c) => c.id === state.activeConversationId)
    },

    // 所有对话列表
    allConversations: (state): ChatConversation[] => {
      return state.conversations
    },

    // 过滤后的对话（根据搜索词）
    filteredConversations(state): ChatConversation[] {
      if (!state.searchQuery.trim()) {
        return state.conversations
      }
      const query = state.searchQuery.toLowerCase()
      return state.conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          (c.messages && c.messages.some((m) => m.content.toLowerCase().includes(query)))
      )
    },

    // 按时间分组的对话
    groupedConversations(state): ConversationGroup[] {
      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const thirtyDaysMs = 30 * oneDayMs

      const groups: ConversationGroup[] = [
        { label: '今天', key: 'today', conversations: [] },
        { label: '昨天', key: 'yesterday', conversations: [] },
        { label: '最近7天', key: 'week', conversations: [] },
        { label: '最近30天', key: 'month', conversations: [] },
        { label: '更早', key: 'older', conversations: [] }
      ]

      // 过滤搜索词
      const conversations = state.searchQuery.trim()
        ? state.conversations.filter(
            (c) =>
              c.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
              (c.messages &&
                c.messages.some((m) =>
                  m.content.toLowerCase().includes(state.searchQuery.toLowerCase())
                ))
          )
        : state.conversations

      // 非归档的对话
      const activeConversations = conversations.filter((c) => c.status !== 'archived')

      activeConversations.forEach((conv) => {
        const diff = now - conv.updatedAt

        if (diff < oneDayMs) {
          groups[0].conversations.push(conv)
        } else if (diff < 2 * oneDayMs) {
          groups[1].conversations.push(conv)
        } else if (diff < 7 * oneDayMs) {
          groups[2].conversations.push(conv)
        } else if (diff < thirtyDaysMs) {
          groups[3].conversations.push(conv)
        } else {
          groups[4].conversations.push(conv)
        }
      })

      // 只返回有对话的分组
      return groups.filter((g) => g.conversations.length > 0)
    },

    // 归档的对话
    archivedConversations(state): ChatConversation[] {
      return state.conversations.filter((c) => c.status === 'archived')
    },

    // 所有模板
    allTemplates: (state): ChatTemplate[] => {
      return state.templates
    },

    // 根据ID获取模板
    getTemplateById: (state) => {
      return (id: string): ChatTemplate | undefined => {
        return state.templates.find((t) => t.id === id)
      }
    },

    // 是否正在加载
    isLoading: (state): boolean => {
      return state.loading
    }
  },

  actions: {
    /**
     * 从后端获取对话列表
     */
    async fetchConversations() {
      this.loading = true
      this.error = null

      try {
        const response = await conversationApi.getConversations({
          page: this.pagination.page,
          page_size: this.pagination.pageSize
        })

        this.conversations = response.list
        this.pagination.total = response.total
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取对话列表失败'
        console.error('Failed to fetch conversations:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取对话详情
     */
    async fetchConversation(id: string) {
      this.loading = true
      this.error = null

      try {
        const conversation = await conversationApi.getConversation(id, true)
        if (conversation) {
          const index = this.conversations.findIndex((c) => c.id === id)
          if (index !== -1) {
            this.conversations[index] = conversation
          } else {
            this.conversations.unshift(conversation)
          }
          return conversation
        }
        return null
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取对话详情失败'
        console.error('Failed to fetch conversation:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建新对话
     */
    async createConversation(options?: {
      title?: string
      templateId?: string
      initialMessage?: string
      appId?: string
    }): Promise<ChatConversation | null> {
      this.loading = true
      this.error = null

      try {
        const template = options?.templateId ? this.getTemplateById(options.templateId) : undefined

        const params: ConversationCreateParams = {
          title: options?.title || template?.name || '新对话',
          app_id: options?.appId
        }

        const conversation = await conversationApi.createConversation(params)
        this.conversations.unshift(conversation)
        this.activeConversationId = conversation.id
        this.pagination.total += 1

        return conversation
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '创建对话失败'
        console.error('Failed to create conversation:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除对话
     */
    async deleteConversation(id: string) {
      this.loading = true
      this.error = null

      try {
        const success = await conversationApi.deleteConversation(id)
        if (success) {
          const index = this.conversations.findIndex((c) => c.id === id)
          if (index > -1) {
            this.conversations.splice(index, 1)
            this.pagination.total -= 1
          }
          if (this.activeConversationId === id) {
            this.activeConversationId = this.conversations[0]?.id || null
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '删除对话失败'
        console.error('Failed to delete conversation:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 归档对话
     */
    async archiveConversation(id: string) {
      this.loading = true
      this.error = null

      try {
        const updated = await conversationApi.archiveConversation(id)
        if (updated) {
          const index = this.conversations.findIndex((c) => c.id === id)
          if (index !== -1) {
            this.conversations[index] = updated
          }
          if (this.activeConversationId === id) {
            this.activeConversationId =
              this.conversations.find((c) => c.status !== 'archived')?.id || null
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '归档对话失败'
        console.error('Failed to archive conversation:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 恢复归档对话
     */
    async unarchiveConversation(id: string) {
      this.loading = true
      this.error = null

      try {
        const updated = await conversationApi.restoreConversation(id)
        if (updated) {
          const index = this.conversations.findIndex((c) => c.id === id)
          if (index !== -1) {
            this.conversations[index] = updated
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '恢复对话失败'
        console.error('Failed to restore conversation:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 发送消息（通过 WebSocket）
     */
    async sendMessage(content: string, attachments?: File[]) {
      const ws = getWebSocket()

      // 确保连接
      if (!ws.isConnected) {
        await ws.connect()
      }

      // 确保有活动对话
      let conversationId = this.activeConversationId
      if (!conversationId) {
        const newConv = await this.createConversation({ title: content.slice(0, 50) })
        if (newConv) {
          conversationId = newConv.id
        } else {
          return
        }
      }

      // 添加用户消息到本地
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (conversation) {
        const userMessage: ChatMessage = {
          id: `msg-local-${Date.now()}`,
          conversationId,
          role: 'user',
          content,
          timestamp: Date.now()
        }
        if (!conversation.messages) {
          conversation.messages = []
        }
        conversation.messages.push(userMessage)
        conversation.updatedAt = Date.now()
      }

      // 发送到 WebSocket
      ws.sendChat({
        message: content,
        conversation_id: conversationId,
        attachments
      })
    },

    /**
     * 处理流式响应
     */
    handleStreamResponse(data: StreamResponseData) {
      const conversation = this.conversations.find((c) => c.id === data.conversation_id)
      if (!conversation) return

      // 找到或创建 AI 消息
      let aiMessage = conversation.messages?.find((m) => m.id === data.message_id)
      if (!aiMessage) {
        aiMessage = {
          id: data.message_id || `msg-ai-${Date.now()}`,
          conversationId: data.conversation_id!,
          role: 'assistant',
          content: '',
          timestamp: Date.now()
        }
        if (!conversation.messages) {
          conversation.messages = []
        }
        conversation.messages.push(aiMessage)
      }

      // 追加内容
      if (aiMessage) {
        aiMessage.content += data.delta
      }

      // 如果完成，添加组件
      if (data.done && data.component && aiMessage) {
        aiMessage.components = [data.component as any]
      }

      conversation.updatedAt = Date.now()
    },

    /**
     * 初始化 WebSocket 连接
     */
    async initWebSocket() {
      const ws = getWebSocket()

      // 设置事件处理器
      ws.on('connected', () => {
        this.wsConnected = true
      })

      ws.on('disconnected', () => {
        this.wsConnected = false
      })

      ws.on('stream', (data: StreamResponseData) => {
        this.handleStreamResponse(data)
      })

      ws.on('error', (error: unknown) => {
        console.error('WebSocket error:', error)
        this.error = '连接错误'
      })

      // 连接
      await ws.connect()
    },

    /**
     * 设置活动对话
     */
    setActiveConversation(id: string | null) {
      this.activeConversationId = id
    },

    /**
     * 更新对话标题
     */
    async updateConversationTitle(id: string, title: string) {
      this.loading = true
      this.error = null

      try {
        const updated = await conversationApi.renameConversation(id, title)
        if (updated) {
          const index = this.conversations.findIndex((c) => c.id === id)
          if (index !== -1) {
            this.conversations[index] = updated
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新标题失败'
        console.error('Failed to update title:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置搜索查询
     */
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * 清空所有对话
     */
    clearAllConversations() {
      this.conversations = []
      this.activeConversationId = null
    },

    /**
     * 清空归档对话
     */
    clearArchivedConversations() {
      this.conversations = this.conversations.filter((c) => c.status !== 'archived')
    },

    /**
     * 添加消息到对话
     */
    addMessage(conversationId: string, message: Partial<ChatMessage>) {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (conversation) {
        const newMessage: ChatMessage = {
          id: message.id || `msg-${Date.now()}`,
          role: message.role || 'user',
          content: message.content || '',
          timestamp: message.timestamp || Date.now(),
          ...message
        }
        if (!conversation.messages) {
          conversation.messages = []
        }
        conversation.messages.push(newMessage)
        conversation.updatedAt = Date.now()
      }
    }
  },

  persist: {
    key: 'smart-link-explore',
    paths: ['activeConversationId', 'pagination']
  }
})
