import { defineStore } from 'pinia'
import type { ChatMessage, ChatConversation, ChatTemplate, ConversationGroup } from '@/types'

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
  templates: ChatTemplate[]
}

export const useExploreStore = defineStore('explore', {
  state: (): ExploreState => ({
    conversations: [],
    activeConversationId: null,
    searchQuery: '',
    loading: false,
    templates: CHAT_TEMPLATES
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
          c.messages.some((m) => m.content.toLowerCase().includes(query))
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
              c.messages.some((m) =>
                m.content.toLowerCase().includes(state.searchQuery.toLowerCase())
              )
          )
        : state.conversations

      // 非归档的对话
      const activeConversations = conversations.filter((c) => !c.isArchived)

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
      return state.conversations.filter((c) => c.isArchived)
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
    // 创建新对话
    createConversation(options?: {
      title?: string
      templateId?: string
      initialMessage?: string
    }): ChatConversation {
      const template = options?.templateId ? this.getTemplateById(options.templateId) : undefined

      const conversation: ChatConversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: options?.title || template?.name || '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        templateId: options?.templateId,
        tags: template ? [template.category] : []
      }

      // 如果有初始消息，添加到对话中
      if (options?.initialMessage || template?.initialPrompt) {
        const initialContent = options?.initialMessage || template!.initialPrompt
        conversation.messages.push({
          id: `msg-${Date.now()}`,
          role: 'user',
          content: initialContent,
          timestamp: Date.now()
        })
      }

      this.conversations.unshift(conversation)
      this.activeConversationId = conversation.id

      return conversation
    },

    // 删除对话
    deleteConversation(id: string) {
      const index = this.conversations.findIndex((c) => c.id === id)
      if (index > -1) {
        this.conversations.splice(index, 1)
        if (this.activeConversationId === id) {
          this.activeConversationId = this.conversations[0]?.id || null
        }
      }
    },

    // 归档对话
    archiveConversation(id: string) {
      const conversation = this.conversations.find((c) => c.id === id)
      if (conversation) {
        conversation.isArchived = true
        if (this.activeConversationId === id) {
          this.activeConversationId = this.conversations.find((c) => !c.isArchived)?.id || null
        }
      }
    },

    // 恢复归档对话
    unarchiveConversation(id: string) {
      const conversation = this.conversations.find((c) => c.id === id)
      if (conversation) {
        conversation.isArchived = false
      }
    },

    // 添加消息
    addMessage(conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (conversation) {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: Date.now()
        }
        conversation.messages.push(newMessage)
        conversation.updatedAt = Date.now()

        // 如果是第一条用户消息，更新标题
        if (
          message.role === 'user' &&
          conversation.messages.filter((m) => m.role === 'user').length === 1
        ) {
          conversation.title =
            message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
        }

        return newMessage
      }
      return null
    },

    // 更新消息
    updateMessage(conversationId: string, messageId: string, updates: Partial<ChatMessage>) {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (conversation) {
        const message = conversation.messages.find((m) => m.id === messageId)
        if (message) {
          Object.assign(message, updates)
          conversation.updatedAt = Date.now()
        }
      }
    },

    // 删除消息
    deleteMessage(conversationId: string, messageId: string) {
      const conversation = this.conversations.find((c) => c.id === conversationId)
      if (conversation) {
        const index = conversation.messages.findIndex((m) => m.id === messageId)
        if (index > -1) {
          conversation.messages.splice(index, 1)
          conversation.updatedAt = Date.now()
        }
      }
    },

    // 设置活动对话
    setActiveConversation(id: string | null) {
      this.activeConversationId = id
    },

    // 更新对话标题
    updateConversationTitle(id: string, title: string) {
      const conversation = this.conversations.find((c) => c.id === id)
      if (conversation) {
        conversation.title = title
        conversation.updatedAt = Date.now()
      }
    },

    // 设置搜索查询
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // 设置加载状态
    setLoading(loading: boolean) {
      this.loading = loading
    },

    // 清空所有对话
    clearAllConversations() {
      this.conversations = []
      this.activeConversationId = null
    },

    // 清空归档对话
    clearArchivedConversations() {
      this.conversations = this.conversations.filter((c) => !c.isArchived)
    }
  },

  persist: {
    key: 'smart-link-explore',
    paths: ['conversations', 'activeConversationId']
  }
})
