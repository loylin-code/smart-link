/**
 * 资源管理 API 服务
 * 对接后端 /api/v1/resources 接口
 */
import http, { type PageParams, type PageResponse, type ApiResponse } from '@/utils/http'
import type {
  Skill,
  MCPServer,
  Component,
  SkillCategory,
  MCPServerStatus,
  SkillFileNode,
  SkillVersion
} from '@/types'

// ============================================================
// Skills API
// ============================================================

export interface SkillCreateParams {
  name: string
  description?: string
  type: 'builtin' | 'custom'
  config?: Record<string, unknown>
}

export interface SkillUpdateParams {
  name?: string
  description?: string
  status?: 'active' | 'inactive'
  config?: Record<string, unknown>
}

export interface SkillListParams extends PageParams {
  status?: 'active' | 'inactive'
  keyword?: string
  category?: SkillCategory
}

/**
 * Skills API 服务
 */
export const skillsApi = {
  /**
   * 获取技能列表
   */
  async list(params: SkillListParams = {}): Promise<PageResponse<Skill>> {
    const response = await http.get<ApiResponse<PageResponse<Skill>>>('/resources/skills', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status
      }
    })
    return response.data.data
  },

  /**
   * 获取技能详情
   */
  async get(skillId: string): Promise<Skill> {
    const response = await http.get<ApiResponse<Skill>>(`/resources/skills/${skillId}`)
    return response.data.data
  },

  /**
   * 创建技能
   */
  async create(params: SkillCreateParams): Promise<Skill> {
    const response = await http.post<ApiResponse<Skill>>('/resources/skills', params)
    return response.data.data
  },

  /**
   * 更新技能
   */
  async update(skillId: string, params: SkillUpdateParams): Promise<Skill> {
    const response = await http.put<ApiResponse<Skill>>(`/resources/skills/${skillId}`, params)
    return response.data.data
  },

  /**
   * 删除技能
   */
  async delete(skillId: string): Promise<void> {
    await http.delete(`/resources/skills/${skillId}`)
  },

  /**
   * 更新技能状态
   */
  async updateStatus(skillId: string, status: 'active' | 'inactive'): Promise<Skill> {
    return this.update(skillId, { status })
  },

  /**
   * 测试技能
   */
  async test(
    skillId: string,
    params: Record<string, unknown> = {}
  ): Promise<{
    success: boolean
    result?: unknown
    error?: string
  }> {
    const response = await http.post<
      ApiResponse<{
        success: boolean
        result?: unknown
        error?: string
      }>
    >(`/resources/skills/${skillId}/test`, params)
    return response.data.data
  },

  /**
   * 获取技能文件列表
   */
  async getFiles(skillId: string): Promise<{ tree: SkillFileNode[] }> {
    const response = await http.get<ApiResponse<{ tree: SkillFileNode[] }>>(
      `/resources/skills/${skillId}/files`
    )
    return response.data.data
  },

  /**
   * 获取技能版本列表
   */
  async getVersions(skillId: string): Promise<{ versions: SkillVersion[] }> {
    const response = await http.get<ApiResponse<{ versions: SkillVersion[] }>>(
      `/resources/skills/${skillId}/versions`
    )
    return response.data.data
  }
}

// ============================================================
// MCP Server API
// ============================================================

export interface MCPServerCreateParams {
  name: string
  description?: string
  type?: 'stdio' | 'sse' | 'http'
  endpoint?: string
  config?: Record<string, unknown>
}

export interface MCPServerUpdateParams {
  name?: string
  description?: string
  status?: 'active' | 'inactive' | MCPServerStatus
  endpoint?: string
  config?: Record<string, unknown>
}

export interface MCPServerListParams extends PageParams {
  status?: 'active' | 'inactive'
  keyword?: string
  transport?: 'stdio' | 'http'
}

/**
 * MCP Server API 服务
 */
export const mcpServerApi = {
  /**
   * 获取 MCP 服务器列表
   */
  async list(params: MCPServerListParams = {}): Promise<PageResponse<MCPServer>> {
    const response = await http.get<ApiResponse<PageResponse<MCPServer>>>('/resources/mcp', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status
      }
    })
    return response.data.data
  },

  /**
   * 获取 MCP 服务器详情
   */
  async get(serverId: string): Promise<MCPServer> {
    const response = await http.get<ApiResponse<MCPServer>>(`/resources/mcp/${serverId}`)
    return response.data.data
  },

  /**
   * 创建 MCP 服务器
   */
  async create(params: MCPServerCreateParams): Promise<MCPServer> {
    const response = await http.post<ApiResponse<MCPServer>>('/resources/mcp', params)
    return response.data.data
  },

  /**
   * 更新 MCP 服务器
   */
  async update(serverId: string, params: MCPServerUpdateParams): Promise<MCPServer> {
    const response = await http.put<ApiResponse<MCPServer>>(`/resources/mcp/${serverId}`, params)
    return response.data.data
  },

  /**
   * 删除 MCP 服务器
   */
  async delete(serverId: string): Promise<void> {
    await http.delete(`/resources/mcp/${serverId}`)
  },

  /**
   * 测试连接
   */
  async testConnection(serverId: string): Promise<{
    success: boolean
    responseTime?: number
    error?: string
  }> {
    const response = await http.post<
      ApiResponse<{
        success: boolean
        responseTime?: number
        error?: string
      }>
    >(`/resources/mcp/${serverId}/test`)
    return response.data.data
  },

  /**
   * 刷新能力
   */
  async refreshCapabilities(serverId: string): Promise<{
    tools: number
    resources: number
    prompts: number
  }> {
    const response = await http.post<
      ApiResponse<{
        tools: number
        resources: number
        prompts: number
      }>
    >(`/resources/mcp/${serverId}/refresh`)
    return response.data.data
  }
}

// ============================================================
// Components API
// ============================================================

export interface ComponentListParams extends PageParams {
  type?: string
  keyword?: string
  status?: 'active' | 'inactive'
}

/**
 * Components API 服务
 * 注意：后端目前仅实现了列表查询，缺少完整 CRUD
 */
export const componentsApi = {
  /**
   * 获取组件列表
   */
  async list(params: ComponentListParams = {}): Promise<PageResponse<Component>> {
    const response = await http.get<ApiResponse<PageResponse<Component>>>('/resources/components', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20
      }
    })
    return response.data.data
  }
}

// ============================================================
// Resource API 统一导出
// ============================================================

export const resourceApi = {
  skills: skillsApi,
  mcpServer: mcpServerApi,
  components: componentsApi
}

export default resourceApi
