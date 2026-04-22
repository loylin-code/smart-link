/**
 * Conversation API Service
 * 对接后端 /api/v1/conversations 接口
 */
import http, { type PageParams, type PageResponse, type ApiResponse } from '@/utils/http'
import type { ChatConversation, ChatMessage } from '@/types'

// ============================================================
// Conversation API Types
// ============================================================

export interface ConversationCreateParams {
  title?: string
  app_id?: string
  user_id?: string
}

export interface ConversationUpdateParams {
  title?: string
  status?: 'active' | 'archived'
}

export interface ConversationListParams extends PageParams {
  app_id?: string
  user_id?: string
  status?: string
}

export interface MessageListParams {
  limit?: number
  before_id?: string
}

// ============================================================
// Conversation API Service
// ============================================================

export const conversationApi = {
  /**
   * 获取对话列表
   */
  async getConversations(
    params: ConversationListParams = {}
  ): Promise<PageResponse<ChatConversation>> {
    const response = await http.get<ApiResponse<PageResponse<ChatConversation>>>(
      '/conversations/',
      {
        params: {
          page: params.page || 1,
          page_size: params.page_size || 20,
          app_id: params.app_id,
          user_id: params.user_id,
          status: params.status
        }
      }
    )

    const data = response.data.data
    return {
      list: data.list.map((item) => this.transformConversationFromApi(item)),
      total: data.total,
      page: data.page,
      page_size: data.page_size
    }
  },

  /**
   * 获取对话详情
   */
  async getConversation(id: string, includeMessages = false): Promise<ChatConversation | null> {
    try {
      const response = await http.get<ApiResponse<ChatConversation>>(`/conversations/${id}`, {
        params: { include_messages: includeMessages }
      })
      return this.transformConversationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 创建对话
   */
  async createConversation(params: ConversationCreateParams = {}): Promise<ChatConversation> {
    const response = await http.post<ApiResponse<ChatConversation>>('/conversations/', {
      title: params.title,
      app_id: params.app_id,
      user_id: params.user_id
    })
    return this.transformConversationFromApi(response.data.data)
  },

  /**
   * 更新对话
   */
  async updateConversation(
    id: string,
    params: ConversationUpdateParams
  ): Promise<ChatConversation | null> {
    try {
      const response = await http.put<ApiResponse<ChatConversation>>(`/conversations/${id}`, params)
      return this.transformConversationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 删除对话
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      await http.delete(`/conversations/${id}`)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 获取对话消息历史
   */
  async getMessages(
    conversationId: string,
    params: MessageListParams = {}
  ): Promise<ChatMessage[]> {
    const response = await http.get<ApiResponse<ChatMessage[]>>(
      `/conversations/${conversationId}/messages`,
      {
        params: {
          limit: params.limit || 50,
          before_id: params.before_id
        }
      }
    )
    return response.data.data.map((item) => this.transformMessageFromApi(item))
  },

  /**
   * 归档对话
   */
  async archiveConversation(id: string): Promise<ChatConversation | null> {
    try {
      const response = await http.post<ApiResponse<ChatConversation>>(
        `/conversations/${id}/archive`
      )
      return this.transformConversationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 恢复对话
   */
  async restoreConversation(id: string): Promise<ChatConversation | null> {
    try {
      const response = await http.post<ApiResponse<ChatConversation>>(
        `/conversations/${id}/restore`
      )
      return this.transformConversationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 重命名对话
   */
  async renameConversation(id: string, title: string): Promise<ChatConversation | null> {
    return this.updateConversation(id, { title })
  },

  /**
   * 添加消息到对话（保存到后端）
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system' | 'tool',
    content: string | Record<string, unknown>
  ): Promise<ChatMessage | null> {
    try {
      const response = await http.post<ApiResponse<ChatMessage>>(
        `/conversations/${conversationId}/messages`,
        { role, content }
      )
      return this.transformMessageFromApi(response.data.data)
    } catch (error) {
      console.error('Failed to add message:', error)
      return null
    }
  },

  /**
   * 转换后端数据格式到前端格式
   */
  transformConversationFromApi(apiConversation: any): ChatConversation {
    return {
      id: apiConversation.id,
      title: apiConversation.title || '新对话',
      appId: apiConversation.app_id,
      userId: apiConversation.user_id,
      status: apiConversation.status || 'active',
      messageCount: apiConversation.message_count || 0,
      lastMessageAt: apiConversation.updated_at
        ? new Date(apiConversation.updated_at).getTime()
        : undefined,
      createdAt: apiConversation.created_at
        ? new Date(apiConversation.created_at).getTime()
        : Date.now(),
      updatedAt: apiConversation.updated_at
        ? new Date(apiConversation.updated_at).getTime()
        : Date.now(),
      messages: apiConversation.messages?.map((m) => this.transformMessageFromApi(m)) || []
    }
  },

  /**
   * 转换消息数据格式
   */
  transformMessageFromApi(apiMessage: any): ChatMessage {
    return {
      id: apiMessage.id,
      conversationId: apiMessage.conversation_id,
      role: apiMessage.role,
      content: apiMessage.content,
      timestamp: apiMessage.created_at ? new Date(apiMessage.created_at).getTime() : Date.now(),
      components: apiMessage.components || [],
      tokens: apiMessage.tokens
    }
  }
}
