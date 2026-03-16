import { defineStore } from 'pinia'
import type { ChatMessage, ChatConversation, ChatTemplate, ConversationGroup } from '@/types'
import { conversationApi, type ConversationCreateParams } from '@/services/conversation'
import { getWebSocket, type StreamResponseData } from '@/services/websocket'

// Mock 数据 - 用于演示
const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: '智能体性能分析',
    status: 'active',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000,
    messages: [
      {
        id: 'msg-1-1',
        conversationId: 'conv-1',
        role: 'user',
        content: '帮我分析一下最近一周智能体的使用情况',
        timestamp: Date.now() - 3600000
      },
      {
        id: 'msg-1-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '📊 **智能体使用分析报告**\n\n根据最近一周的数据统计，以下是关键指标：',
        timestamp: Date.now() - 3500000,
        components: [
          {
            id: 'comp-1-1',
            type: 'data-summary',
            props: {
              title: '核心指标概览',
              status: 'success',
              items: [
                { icon: '🤖', label: '活跃智能体', value: '12', unit: '个' },
                { icon: '📞', label: '总调用次数', value: '1,234', unit: '次' },
                { icon: '⚡', label: '平均响应', value: '1.2', unit: '秒' },
                { icon: '✅', label: '成功率', value: '98.5', unit: '%' }
              ],
              description: '数据更新时间：2024年1月15日 14:30'
            }
          }
        ]
      },
      {
        id: 'msg-1-3',
        conversationId: 'conv-1',
        role: 'user',
        content: '可以看看调用趋势吗？',
        timestamp: Date.now() - 3000000
      },
      {
        id: 'msg-1-4',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '📈 **最近7天调用趋势**\n\n整体呈上升趋势，周末达到峰值：',
        timestamp: Date.now() - 2900000,
        components: [
          {
            id: 'comp-1-2',
            type: 'trend-analysis',
            props: {
              title: '调用次数趋势',
              summaries: [
                { label: '日均调用', value: '176', change: '↑ 12%', trend: 'up', color: '#10b981' },
                { label: '峰值调用', value: '234', change: '周六', trend: 'up', color: '#3b82f6' },
                { label: '成功率', value: '98.5%', change: '↑ 0.5%', trend: 'up', color: '#8b5cf6' }
              ],
              chartData: [120, 145, 132, 167, 189, 234, 198],
              chartLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
              insights: [
                { type: 'positive', text: '周六调用达到峰值 234 次，用户活跃度最高' },
                { type: 'positive', text: '整体成功率稳定在 98% 以上' },
                { type: 'neutral', text: '建议在周末增加资源配置以应对高峰' }
              ]
            }
          }
        ]
      },
      {
        id: 'msg-1-5',
        conversationId: 'conv-1',
        role: 'user',
        content: '各智能体的使用分布是怎样的？',
        timestamp: Date.now() - 2400000
      },
      {
        id: 'msg-1-6',
        conversationId: 'conv-1',
        role: 'assistant',
        content: '📊 **智能体使用分布**\n\n客服智能体占比最高，达到 35%：',
        timestamp: Date.now() - 2300000,
        components: [
          {
            id: 'comp-1-3',
            type: 'chart',
            props: {
              title: '各智能体调用占比',
              type: 'pie',
              data: [35, 25, 18, 12, 10],
              labels: ['客服智能体', '数据分析', '文档处理', '内容生成', '业务分析'],
              legend: ['客服', '分析', '文档', '内容', '业务']
            }
          },
          {
            id: 'comp-1-4',
            type: 'chart',
            props: {
              title: '响应时间对比',
              type: 'bar',
              data: [0.8, 1.2, 3.5, 1.5, 2.1],
              labels: ['数据分析', '客服', '文档处理', '内容生成', '业务分析'],
              unit: '秒'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'conv-2',
    title: '创建新智能体咨询',
    status: 'active',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86000000,
    messages: [
      {
        id: 'msg-2-1',
        conversationId: 'conv-2',
        role: 'user',
        content: '我想创建一个智能客服机器人',
        timestamp: Date.now() - 86400000
      },
      {
        id: 'msg-2-2',
        conversationId: 'conv-2',
        role: 'assistant',
        content: '好的，我可以帮你创建智能客服机器人。首先需要确认以下配置：',
        timestamp: Date.now() - 86300000,
        components: [
          {
            id: 'comp-2-1',
            type: 'confirm',
            props: {
              title: '确认创建智能客服机器人',
              description: '将使用以下默认配置创建新的智能客服机器人',
              variant: 'info',
              items: [
                '名称：智能客服助手',
                '模型：GPT-4o',
                '知识库：自动从 FAQ 导入',
                '转人工：开启自动转接功能'
              ],
              confirmText: '确认创建',
              cancelText: '修改配置'
            }
          }
        ]
      },
      {
        id: 'msg-2-3',
        conversationId: 'conv-2',
        role: 'user',
        content: '确认创建',
        timestamp: Date.now() - 86200000
      },
      {
        id: 'msg-2-4',
        conversationId: 'conv-2',
        role: 'assistant',
        content:
          '✅ 智能客服机器人创建成功！\n\n现在需要进行以下配置：\n\n**步骤 1：知识库配置** 📚\n上传常见问题文档，支持 PDF、Word、Excel 格式\n\n**步骤 2：对话流程设计** 💬\n设置问候语、自动回复规则\n\n**步骤 3：测试发布** 🚀\n模拟对话测试后一键上线',
        timestamp: Date.now() - 86100000
      }
    ]
  },
  {
    id: 'conv-3',
    title: '资源监控告警',
    status: 'active',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172500000,
    messages: [
      {
        id: 'msg-3-1',
        conversationId: 'conv-3',
        role: 'assistant',
        content: '⚠️ **资源告警通知**\n\n检测到以下资源使用异常：',
        timestamp: Date.now() - 172800000,
        components: [
          {
            id: 'comp-3-1',
            type: 'data-summary',
            props: {
              title: '资源使用状态',
              status: 'warning',
              items: [
                {
                  icon: '💾',
                  label: '内存使用',
                  value: '85',
                  unit: '%',
                  change: '↑ 15%',
                  changeClass: 'negative'
                },
                {
                  icon: '💿',
                  label: '磁盘使用',
                  value: '72',
                  unit: '%',
                  change: '↑ 8%',
                  changeClass: 'negative'
                },
                {
                  icon: '🖥️',
                  label: 'CPU 使用',
                  value: '45',
                  unit: '%',
                  change: '稳定',
                  changeClass: 'neutral'
                },
                {
                  icon: '🌐',
                  label: '网络带宽',
                  value: '120',
                  unit: 'Mbps',
                  change: '正常',
                  changeClass: 'positive'
                }
              ],
              description: '内存使用率超过 80% 阈值，建议尽快处理'
            }
          }
        ]
      },
      {
        id: 'msg-3-2',
        conversationId: 'conv-3',
        role: 'user',
        content: '内存占用最高的进程是什么？',
        timestamp: Date.now() - 172700000
      },
      {
        id: 'msg-3-3',
        conversationId: 'conv-3',
        role: 'assistant',
        content: '📊 **内存占用 TOP 5 进程**',
        timestamp: Date.now() - 172600000,
        components: [
          {
            id: 'comp-3-2',
            type: 'chart',
            props: {
              title: '进程内存占用',
              type: 'bar',
              data: [2.4, 1.8, 1.2, 0.9, 0.6],
              labels: ['node-agent', 'redis-server', 'postgres', 'nginx', 'monitor'],
              unit: 'GB'
            }
          }
        ]
      },
      {
        id: 'msg-3-4',
        conversationId: 'conv-3',
        role: 'user',
        content: '帮我重启 node-agent 服务释放内存',
        timestamp: Date.now() - 172500000
      },
      {
        id: 'msg-3-5',
        conversationId: 'conv-3',
        role: 'assistant',
        content: '即将重启 node-agent 服务，请确认操作：',
        timestamp: Date.now() - 172400000,
        components: [
          {
            id: 'comp-3-3',
            type: 'confirm',
            props: {
              title: '确认重启服务',
              description: '重启 node-agent 服务将暂时中断相关功能',
              variant: 'warning',
              items: [
                '服务名称：node-agent',
                '预计中断时间：约 10 秒',
                '影响范围：智能体调用服务',
                '自动恢复：是'
              ],
              confirmText: '确认重启',
              cancelText: '取消'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'conv-4',
    title: '数据分析报告',
    status: 'active',
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259100000,
    messages: [
      {
        id: 'msg-4-1',
        conversationId: 'conv-4',
        role: 'user',
        content: '生成本周数据分析报告',
        timestamp: Date.now() - 259200000
      },
      {
        id: 'msg-4-2',
        conversationId: 'conv-4',
        role: 'assistant',
        content: '📈 **本周数据分析报告**\n\n数据周期：2024年1月8日 - 2024年1月14日',
        timestamp: Date.now() - 259150000,
        components: [
          {
            id: 'comp-4-1',
            type: 'trend-analysis',
            props: {
              title: '业务趋势分析',
              summaries: [
                {
                  label: '总请求量',
                  value: '8.5K',
                  change: '↑ 23%',
                  trend: 'up',
                  color: '#3b82f6'
                },
                {
                  label: '活跃用户',
                  value: '1,234',
                  change: '↑ 15%',
                  trend: 'up',
                  color: '#10b981'
                },
                { label: '平均延迟', value: '156ms', change: '↓ 8%', trend: 'up', color: '#8b5cf6' }
              ],
              chartData: [820, 932, 901, 934, 1290, 1330, 1320],
              chartLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
              insights: [
                { type: 'positive', text: '本周请求量较上周增长 23%，用户活跃度显著提升' },
                { type: 'positive', text: '系统响应延迟优化 8%，用户体验改善明显' },
                { type: 'neutral', text: '建议关注周六的流量峰值，考虑动态扩容' }
              ]
            }
          }
        ]
      }
    ]
  }
]

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
    conversations: MOCK_CONVERSATIONS,
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
      total: MOCK_CONVERSATIONS.length
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
      try {
        const template = options?.templateId ? this.getTemplateById(options.templateId) : undefined

        // 本地创建对话（mock 模式）
        const conversation: ChatConversation = {
          id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          title: options?.title || template?.name || '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'active',
          templateId: options?.templateId
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
