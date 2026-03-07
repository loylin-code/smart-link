/**
 * Application API Service
 * 对接后端 /api/v1/applications 接口
 */
import http, { type PageParams, type PageResponse, type ApiResponse } from '@/utils/http'
import type { Application, AppFilter, AppRuntimeStatus } from '@/types'
import { AppStatus, AppType } from '@/types'

// ============================================================
// Application API Types
// ============================================================

export interface ApplicationCreateParams {
  name: string
  description?: string
  icon?: string
  type?: AppType
  schema?: Record<string, unknown>
}

export interface ApplicationUpdateParams {
  name?: string
  description?: string
  icon?: string
  type?: AppType
  status?: AppStatus
  schema?: Record<string, unknown>
}

export interface ApplicationListParams extends PageParams {
  status?: AppStatus
  type?: AppType
  keyword?: string
}

export interface RunApplicationParams {
  input_data?: Record<string, unknown>
}

// ============================================================
// Application API Service
// ============================================================

export const applicationApi = {
  /**
   * 获取应用列表
   */
  async getApplications(params: ApplicationListParams = {}): Promise<PageResponse<Application>> {
    const response = await http.get<ApiResponse<PageResponse<Application>>>('/applications/', {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20,
        status: params.status,
        type: params.type,
        keyword: params.keyword
      }
    })

    // 转换响应格式
    const data = response.data.data
    return {
      list: data.list.map(this.transformApplicationFromApi),
      total: data.total,
      page: data.page,
      page_size: data.page_size
    }
  },

  /**
   * 获取应用详情
   */
  async getApplicationById(id: string): Promise<Application | null> {
    try {
      const response = await http.get<ApiResponse<Application>>(`/applications/${id}`)
      return this.transformApplicationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 创建应用
   */
  async createApplication(data: ApplicationCreateParams): Promise<Application> {
    const response = await http.post<ApiResponse<Application>>('/applications/', {
      name: data.name,
      description: data.description,
      icon: data.icon,
      type: data.type || AppType.CUSTOM,
      schema: data.schema || {}
    })
    return this.transformApplicationFromApi(response.data.data)
  },

  /**
   * 更新应用
   */
  async updateApplication(
    id: string,
    updates: ApplicationUpdateParams
  ): Promise<Application | null> {
    try {
      const response = await http.put<ApiResponse<Application>>(`/applications/${id}`, updates)
      return this.transformApplicationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 删除应用
   */
  async deleteApplication(id: string): Promise<boolean> {
    try {
      await http.delete(`/applications/${id}`)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * 复制应用
   */
  async duplicateApplication(id: string): Promise<Application | null> {
    try {
      // 先获取原应用
      const original = await this.getApplicationById(id)
      if (!original) return null

      // 创建新应用
      const newApp = await this.createApplication({
        name: `${original.name} (副本)`,
        description: original.description,
        icon: original.icon,
        type: original.type,
        schema: original.schema
      })

      return newApp
    } catch (error) {
      return null
    }
  },

  /**
   * 发布应用
   */
  async publishApplication(id: string): Promise<Application | null> {
    try {
      const response = await http.post<ApiResponse<Application>>(`/applications/${id}/publish`)
      return this.transformApplicationFromApi(response.data.data)
    } catch (error) {
      return null
    }
  },

  /**
   * 运行应用
   */
  async runApplication(
    id: string,
    params: RunApplicationParams = {}
  ): Promise<Record<string, unknown>> {
    const response = await http.post<Record<string, unknown>>(`/applications/${id}/run`, params)
    return response.data
  },

  /**
   * 获取运行时状态
   */
  async getRuntimeStatus(): Promise<AppRuntimeStatus[]> {
    // 获取已发布的应用列表
    const response = await this.getApplications({ status: AppStatus.PUBLISHED })

    // 转换为运行时状态
    return response.list.map((app) => ({
      appId: app.id,
      lastAccessed: app.updatedAt,
      usageCount: 0,
      uptime: 0,
      errorCount: 0
    }))
  },

  /**
   * 获取应用 Schema
   */
  async getApplicationSchema(id: string): Promise<Record<string, unknown> | null> {
    try {
      const app = await this.getApplicationById(id)
      if (!app) return null

      // 返回应用的 schema 或默认空 schema
      return (
        app.schema || {
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
   * 转换后端数据格式到前端格式
   */
  transformApplicationFromApi(apiApp: any): Application {
    return {
      id: apiApp.id,
      name: apiApp.name,
      description: apiApp.description || '',
      icon: apiApp.icon || 'app',
      type: apiApp.type || AppType.CUSTOM,
      status: apiApp.status || AppStatus.DRAFT,
      version: apiApp.version || '0.1.0',
      schema: apiApp.schema || {},
      tags: apiApp.tags || [],
      createdAt: apiApp.created_at ? new Date(apiApp.created_at).getTime() : Date.now(),
      updatedAt: apiApp.updated_at ? new Date(apiApp.updated_at).getTime() : Date.now(),
      publishedAt: apiApp.published_at ? new Date(apiApp.published_at).getTime() : undefined,
      isEnabled: apiApp.status === AppStatus.PUBLISHED
    }
  }
}

export default applicationApi
