/**
 * Agent API Service
 * 对接后端 /api/v1/agents 接口
 */
import http, { type PageParams, type PageResponse, type ApiResponse } from '@/utils/http'
import type { Agent, AgentRuntimeStatus, AgentCreateParams, AgentUpdateParams } from '@/types'
import { AgentStatus, AgentType, AgentDomain } from '@/types'

// ============================================================
// Agent API Types
// ============================================================

export interface AgentListParams extends PageParams {
  status?: AgentStatus | ''
  type?: AgentType | ''
  keyword?: string
  category?: string
}

// ============================================================
// Agent API Service
// ============================================================

export const agentApi = {
  /**
   * 获取智能体列表
   */
  async getAgents(params: AgentListParams = {}): Promise<PageResponse<Agent>> {
    const response = await http.get<ApiResponse<PageResponse<Agent>>>('/agents/', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status,
        type: params.type,
        keyword: params.keyword,
        category: params.category
      }
    })

    // 转换响应格式
    const data = response.data.data
    return {
      list: data.list.map(this.transformAgentFromApi),
      total: data.total,
      page: data.page,
      page_size: data.page_size
    }
  },

  /**
   * 获取智能体详情
   */
  async getAgentById(id: string): Promise<Agent | null> {
    try {
      const response = await http.get<ApiResponse<Agent>>(`/agents/${id}`)
      return this.transformAgentFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 创建智能体
   */
  async createAgent(data: AgentCreateParams): Promise<Agent> {
    const response = await http.post<ApiResponse<Agent>>('/agents/', {
      name: data.name,
      code: data.code,
      description: data.description || '',
      avatar: data.avatar,
      persona: data.persona,
      welcome_message: data.welcomeMessage,
      tags: data.tags || [],
      category: data.category
    })
    return this.transformAgentFromApi(response.data.data)
  },

  /**
   * 更新智能体
   */
  async updateAgent(id: string, updates: AgentUpdateParams): Promise<Agent | null> {
    try {
      const response = await http.put<ApiResponse<Agent>>(`/agents/${id}`, updates)
      return this.transformAgentFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 删除智能体
   */
  async deleteAgent(id: string): Promise<boolean> {
    try {
      await http.delete(`/agents/${id}`)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 复制智能体
   */
  async duplicateAgent(id: string): Promise<Agent | null> {
    try {
      // 先获取原智能体
      const original = await this.getAgentById(id)
      if (!original) return null

      // 创建新智能体
      const newAgent = await this.createAgent({
        name: `${original.identity.name} (副本)`,
        code: `${original.identity.code}_copy_${Date.now()}`,
        description: original.identity.description,
        avatar: original.identity.avatar,
        persona: original.identity.persona,
        welcomeMessage: original.identity.welcomeMessage,
        tags: original.tags
      })

      return newAgent
    } catch (error) {
      return null
    }
  },

  /**
   * 激活智能体
   */
  async activateAgent(id: string): Promise<Agent | null> {
    try {
      const response = await http.post<ApiResponse<Agent>>(`/agents/${id}/activate`)
      return this.transformAgentFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 暂停智能体
   */
  async pauseAgent(id: string): Promise<Agent | null> {
    try {
      const response = await http.post<ApiResponse<Agent>>(`/agents/${id}/pause`)
      return this.transformAgentFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 获取运行时状态
   */
  async getRuntimeStatus(): Promise<AgentRuntimeStatus[]> {
    // 获取活跃的智能体列表
    const response = await this.getAgents({ status: AgentStatus.ACTIVE })

    // 转换为运行时状态
    return response.list.map((agent) => ({
      agentId: agent.id,
      status: 'idle' as const,
      sessionCount: 0,
      lastActiveAt: agent.updatedAt,
      tokensConsumed: 0,
      avgLatency: 0
    }))
  },

  /**
   * 获取智能体 Schema
   */
  async getAgentSchema(id: string): Promise<Record<string, unknown> | null> {
    try {
      const agent = await this.getAgentById(id)
      if (!agent) return null

      // 返回智能体的 pageSchema 或默认空 schema
      return (
        agent.pageSchema || {
          id: `schema_${id}`,
          version: '1.0.0',
          root: {
            id: 'root',
            type: 'SlContainer',
            props: { static: { direction: 'vertical' } },
            children: []
          }
        }
      )
    } catch (error) {
      return null
    }
  },

  /**
   * 更新智能体能力配置
   */
  async updateCapabilities(
    id: string,
    capabilities: Partial<Agent['capabilities']>
  ): Promise<Agent | null> {
    try {
      const response = await http.put<ApiResponse<Agent>>(
        `/agents/${id}/capabilities`,
        capabilities
      )
      return this.transformAgentFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 更新智能体知识库配置
   */
  async updateKnowledge(id: string, knowledge: Partial<Agent['knowledge']>): Promise<Agent | null> {
    try {
      const response = await http.put<ApiResponse<Agent>>(`/agents/${id}/knowledge`, knowledge)
      return this.transformAgentFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 转换后端数据格式到前端格式
   */
  transformAgentFromApi(apiAgent: any): Agent {
    return {
      id: apiAgent.id,
      type: apiAgent.type || AgentType.CUSTOM,
      status: apiAgent.status || AgentStatus.DRAFT,
      domain: apiAgent.domain || AgentDomain.INFRASTRUCTURE,
      version: apiAgent.version || '0.1.0',
      tags: apiAgent.tags || [],
      createdAt: apiAgent.created_at ? new Date(apiAgent.created_at).getTime() : Date.now(),
      updatedAt: apiAgent.updated_at ? new Date(apiAgent.updated_at).getTime() : Date.now(),
      creator: apiAgent.creator,
      category: apiAgent.category,
      pageSchema: apiAgent.page_schema || apiAgent.pageSchema,
      identity: {
        name: apiAgent.name,
        code: apiAgent.code,
        avatar: apiAgent.avatar,
        description: apiAgent.description || '',
        persona: apiAgent.persona || '',
        welcomeMessage: apiAgent.welcome_message || apiAgent.welcomeMessage || '',
        responsibilities: apiAgent.responsibilities || []
      },
      capabilities: {
        mcpServers: apiAgent.mcp_servers || apiAgent.mcpServers || [],
        skills: apiAgent.skills || [],
        tools: apiAgent.tools || [],
        llm: apiAgent.llm || {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 4096,
          topP: 1
        }
      },
      knowledge: {
        documents: apiAgent.documents || [],
        databases: apiAgent.databases || [],
        apis: apiAgent.apis || [],
        searchConfig: apiAgent.search_config ||
          apiAgent.searchConfig || {
            enabled: false,
            topK: 10,
            similarityThreshold: 0.7,
            rerankEnabled: false
          }
      }
    }
  }
}

export default agentApi
