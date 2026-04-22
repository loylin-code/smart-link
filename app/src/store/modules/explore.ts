import { defineStore } from 'pinia'
import type { ChatMessage, ChatConversation, ChatTemplate, ConversationGroup } from '@/types'
import { conversationApi } from '@/services/conversation'
import { getWebSocket, type StreamResponseData } from '@/services/websocket'
import {
  getChatCompletionsSSE,
  buildMessages,
  accumulateToolCalls,
  type UsageInfo,
  type ToolCall,
  type ToolCallDelta
} from '@/services/chat-completions'
import { parseAIComponentOutput, createChatComponents } from '@/services/component-parser'

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
  // SSE streaming state
  isSSEStreaming: boolean
  currentStreamingMessageId: string | null
  accumulatedToolCalls: ToolCall[]
  lastUsage: UsageInfo | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export const useExploreStore = defineStore('explore', {
  state: (): ExploreState => ({
    conversations: [], // 从后端 API 加载，不再使用 Mock 数据
    activeConversationId: null,
    searchQuery: '',
    loading: false,
    error: null,
    templates: CHAT_TEMPLATES,
    wsConnected: false,
    streamingMessage: '',
    // SSE streaming state
    isSSEStreaming: false,
    currentStreamingMessageId: null,
    accumulatedToolCalls: [],
    lastUsage: null,
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
            // Patch existing conversation in-place to preserve reactive reference
            const existing = this.conversations[index]
            existing.title = conversation.title
            existing.messageCount = conversation.messageCount
            existing.updatedAt = conversation.updatedAt
            // Only update messages if they were empty or changed
            if (existing.messages.length === 0 || conversation.messages.length > 0) {
              existing.messages = conversation.messages
            }
          } else {
            this.conversations.unshift(conversation)
          }
          return this.conversations[index] ?? conversation
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

        // 调用后端 API 创建对话
        const backendConversation = await conversationApi.createConversation({
          title: options?.title || template?.name || '新对话',
          app_id: options?.appId
        })

        if (!backendConversation) {
          throw new Error('Failed to create conversation in backend')
        }

        // 使用后端返回的真实 ID
        const conversation: ChatConversation = {
          id: backendConversation.id,
          title: backendConversation.title,
          messages: [],
          createdAt: backendConversation.createdAt,
          updatedAt: backendConversation.updatedAt,
          status: backendConversation.status || 'active',
          templateId: options?.templateId,
          appId: options?.appId
        }

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
     * 通过 SSE 发送消息（OpenAI兼容流式接口）
     *
     * @param content 用户消息内容
     * @param agentId Agent ID（必须）
     * @param conversationId 对话ID（可选，用于多轮对话）
     */
    async sendSSEMessage(content: string, agentId: string, conversationId?: string): Promise<void> {
      // 取消之前的流式请求
      this.cancelSSEStream()

      this.isSSEStreaming = true
      this.accumulatedToolCalls = []
      this.error = null

      // 确保有活动对话
      let activeConvId = conversationId || this.activeConversationId

      if (!activeConvId) {
        // 创建新对话
        const newConv = await this.createConversation({ title: content.slice(0, 50) })
        if (newConv) {
          activeConvId = newConv.id
        } else {
          this.isSSEStreaming = false
          return
        }
      }

      const conversation = this.conversations.find((c) => c.id === activeConvId)

      // 记录当前消息的 ID，用于保存时精确定位
      const userMessageId = `msg-user-${Date.now()}`
      const aiMessageId = `msg-ai-${Date.now() + 1}`  // +1 防止 ID 冲突
      this.currentStreamingMessageId = aiMessageId

      // 添加用户消息到本地
      if (conversation) {
        const userMessage: ChatMessage = {
          id: userMessageId,
          conversationId: activeConvId,
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

      if (conversation) {
        const aiMessage: ChatMessage = {
          id: aiMessageId,
          conversationId: activeConvId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isStreaming: true
        }
        conversation.messages.push(aiMessage)
      }

      // 构建消息历史（排除刚添加的用户消息和 AI 占位符）
      const messages = buildMessages(content, conversation?.messages?.slice(0, -2))

      // 获取 SSE 客户端
      const sseClient = getChatCompletionsSSE()

      // 发起 SSE 流式请求
      await sseClient.streamChatCompletion(
        {
          model: agentId,
          messages,
          conversation_id: activeConvId,
          stream: true,
          stream_options: { include_usage: true }
        },
        // onChunk - 内容增量回调
        (deltaContent: string, toolCalls?: ToolCallDelta[]) => {
          const conv = this.conversations.find((c) => c.id === activeConvId)
          if (!conv) return

          const aiMsg = conv.messages?.find((m) => m.id === aiMessageId)
          if (aiMsg) {
            // 追加内容
            if (deltaContent) {
              aiMsg.content += deltaContent
            }

            // 处理 tool_calls
            if (toolCalls && toolCalls.length > 0) {
              this.accumulatedToolCalls = accumulateToolCalls(this.accumulatedToolCalls, toolCalls)
            }
          }

          conv.updatedAt = Date.now()
        },
        // onUsage - token 统计回调
        (usage: UsageInfo) => {
          this.lastUsage = usage

          const conv = this.conversations.find((c) => c.id === activeConvId)
          if (conv) {
            const aiMsg = conv.messages?.find((m) => m.id === aiMessageId)
            if (aiMsg) {
              aiMsg.tokens = {
                input: usage.prompt_tokens,
                output: usage.completion_tokens
              }
            }
          }
        },
        // onError - 错误回调
        (error) => {
          this.error = error.message
          this.isSSEStreaming = false

          const conv = this.conversations.find((c) => c.id === activeConvId)
          if (conv) {
            const aiMsg = conv.messages?.find((m) => m.id === aiMessageId)
            if (aiMsg) {
              aiMsg.isStreaming = false
              aiMsg.content += `\n\n❌ Error: ${error.message}`
            }
          }
        },
        // onComplete - 完成回调
        (_finishReason) => {
          this.isSSEStreaming = false
          this.currentStreamingMessageId = null

          const conv = this.conversations.find((c) => c.id === activeConvId)
          if (conv) {
            const aiMsg = conv.messages?.find((m) => m.id === aiMessageId)
            if (aiMsg) {
              aiMsg.isStreaming = false

              // 解析 AI 输出的组件描述
              try {
                const parsed = parseAIComponentOutput(aiMsg.content)
                if (parsed.components && parsed.components.length > 0) {
                  aiMsg.components = createChatComponents(parsed.components)
                  aiMsg.content = parsed.text || aiMsg.content // 更新为纯文本内容
                }
              } catch (e) {
                console.warn('[explore] Failed to parse AI components:', e)
                // 解析失败不影响文本显示
              }

              // 如果有累积的 tool_calls，添加到消息
              if (this.accumulatedToolCalls.length > 0) {
                // 可以在这里处理 tool call 结果
              }
            }
            conv.updatedAt = Date.now()

            // 保存消息到后端数据库（精确保存本次对话的用户消息和 AI 响应）
            this.saveMessagesToBackend(activeConvId, userMessageId, aiMessageId).catch((err) => {
              console.error('[explore] Failed to save messages:', err)
            })
          }
        }
      )
    },

    /**
     * 取消 SSE 流式请求
     */
    cancelSSEStream() {
      if (this.isSSEStreaming) {
        const sseClient = getChatCompletionsSSE()
        sseClient.cancel()
        this.isSSEStreaming = false
        this.currentStreamingMessageId = null
      }
    },

    /**
     * 是否正在 SSE 流式输出
     */
    isCurrentlyStreaming(): boolean {
      return this.isSSEStreaming
    },

    /**
     * 获取最后的 usage 信息
     */
    getLastUsage(): UsageInfo | null {
      return this.lastUsage
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
     * 设置活动对话（切换时自动加载历史消息）
     */
    async setActiveConversation(id: string | null) {
      this.activeConversationId = id

      // 如果切换到已有对话，且本地没有消息，则从后端加载历史消息
      if (id) {
        const conversation = this.conversations.find((c) => c.id === id)
        if (conversation && (!conversation.messages || conversation.messages.length === 0)) {
          await this.fetchConversation(id)
        }
      }
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
    },

    /**
     * 保存消息到后端数据库
     * 精确保存指定 ID 的用户消息和 AI 响应
     *
     * @param conversationId 对话 ID
     * @param userMessageId 用户消息 ID（本地生成的临时 ID）
     * @param aiMessageId AI 响应消息 ID（本地生成的临时 ID）
     */
    async saveMessagesToBackend(
      conversationId: string,
      userMessageId: string,
      aiMessageId: string
    ): Promise<void> {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (!conversation || !conversation.messages) return

      // 精确查找本次对话的用户消息和 AI 响应
      const userMsg = conversation.messages.find((m) => m.id === userMessageId)
      const aiMsg = conversation.messages.find((m) => m.id === aiMessageId)

      // 保存用户消息（如果还是本地临时 ID）
      if (userMsg && userMsg.id.startsWith('msg-user-')) {
        try {
          const savedMsg = await conversationApi.addMessage(
            conversationId,
            'user',
            userMsg.content
          )
          if (savedMsg) {
            // Store backend ID separately - DO NOT change the local ID
            // Changing the ID would cause v-for key mismatch → component remount → chart destroy/recreate
            userMsg.serverId = savedMsg.id
          }
        } catch (error) {
          console.error('[explore] Failed to save user message:', error)
        }
      }

      // 保存 AI 响应（如果还是本地临时 ID）
      if (aiMsg && aiMsg.id.startsWith('msg-ai-')) {
        try {
          const savedMsg = await conversationApi.addMessage(
            conversationId,
            'assistant',
            aiMsg.content
          )
          if (savedMsg) {
            // Store backend ID separately - DO NOT change the local ID
            aiMsg.serverId = savedMsg.id
          }
        } catch (error) {
          console.error('[explore] Failed to save AI message:', error)
        }
      }
    }
  },

  persist: {
    key: 'smart-link-explore',
    paths: ['activeConversationId', 'pagination']
  }
})
