import { defineStore } from 'pinia'
import type { MCPServer, MCPServerStatus, MCPServerCapability } from '@/types'
import {
  mcpServerApi,
  type MCPServerCreateParams,
  type MCPServerUpdateParams
} from '@/services/resource'

interface MCPState {
  servers: MCPServer[]
  currentServer: MCPServer | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  filter: {
    status?: 'active' | 'inactive'
    transport?: 'stdio' | 'http'
    keyword: string
  }
}

export const useMCPStore = defineStore('mcp', {
  state: (): MCPState => ({
    servers: [],
    currentServer: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    },
    filter: {
      keyword: ''
    }
  }),

  getters: {
    // 获取过滤后的服务器列表
    filteredServers(state): MCPServer[] {
      let result = state.servers

      if (state.filter.transport) {
        result = result.filter((s) => s.transport === state.filter.transport)
      }

      if (state.filter.keyword) {
        const keyword = state.filter.keyword.toLowerCase()
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(keyword) ||
            s.description.toLowerCase().includes(keyword) ||
            s.uniqueId.toLowerCase().includes(keyword)
        )
      }

      return result
    },

    // 按状态分组
    serversByStatus(state): Record<string, MCPServer[]> {
      return {
        connected: state.servers.filter((s) => s.status === 'connected'),
        connecting: state.servers.filter((s) => s.status === 'connecting'),
        disconnected: state.servers.filter((s) => s.status === 'disconnected'),
        degraded: state.servers.filter((s) => s.status === 'degraded')
      }
    },

    // 统计信息
    stats(state) {
      const connectedCount = state.servers.filter((s) => s.status === 'connected').length
      return {
        total: state.pagination.total || state.servers.length,
        connected: connectedCount,
        connecting: state.servers.filter((s) => s.status === 'connecting').length,
        disconnected: state.servers.filter((s) => s.status === 'disconnected').length,
        totalTools: state.servers.reduce((sum, s) => sum + (s.capabilities?.tools || 0), 0),
        totalResources: state.servers.reduce((sum, s) => sum + (s.capabilities?.resources || 0), 0),
        totalPrompts: state.servers.reduce((sum, s) => sum + (s.capabilities?.prompts || 0), 0)
      }
    }
  },

  actions: {
    // 设置筛选条件
    setFilter(filter: Partial<MCPState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    setPagination(pagination: Partial<MCPState['pagination']>) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    setError(error: string | null) {
      this.error = error
    },

    // 获取服务器详情
    getServerById(id: string): MCPServer | undefined {
      return this.servers.find((s) => s.id === id)
    },

    // 设置当前服务器
    setCurrentServer(server: MCPServer | null) {
      this.currentServer = server
    },

    /**
     * 从 API 获取 MCP 服务器列表
     */
    async fetchServers(params?: {
      page?: number
      pageSize?: number
      status?: 'active' | 'inactive'
    }) {
      this.loading = true
      this.error = null

      try {
        const page = params?.page ?? this.pagination.page
        const pageSize = params?.pageSize ?? this.pagination.pageSize

        const response = await mcpServerApi.list({
          page,
          page_size: pageSize,
          status: params?.status || this.filter.status
        })

        // 转换后端数据格式到前端格式
        this.servers = response.list.map(this.transformServerFromApi)
        this.pagination = {
          page: response.page,
          pageSize: response.page_size,
          total: response.total
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取服务器列表失败'
        console.error('Failed to fetch MCP servers:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取服务器详情
     */
    async fetchServer(id: string) {
      this.loading = true
      this.error = null

      try {
        const server = await mcpServerApi.get(id)
        this.currentServer = this.transformServerFromApi(server)
        return this.currentServer
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取服务器详情失败'
        console.error('Failed to fetch MCP server:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建服务器
     */
    async createServer(params: MCPServerCreateParams) {
      this.loading = true
      this.error = null

      try {
        const server = await mcpServerApi.create(params)
        const transformedServer = this.transformServerFromApi(server)
        this.servers.push(transformedServer)
        this.pagination.total += 1
        return transformedServer
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '创建服务器失败'
        console.error('Failed to create MCP server:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新服务器
     */
    async updateServer(id: string, data: MCPServerUpdateParams) {
      this.loading = true
      this.error = null

      try {
        const server = await mcpServerApi.update(id, data)
        const transformedServer = this.transformServerFromApi(server)

        const index = this.servers.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.servers[index] = transformedServer
        }

        if (this.currentServer?.id === id) {
          this.currentServer = transformedServer
        }

        return transformedServer
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新服务器失败'
        console.error('Failed to update MCP server:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除服务器
     */
    async deleteServer(id: string) {
      this.loading = true
      this.error = null

      try {
        await mcpServerApi.delete(id)

        const index = this.servers.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.servers.splice(index, 1)
          this.pagination.total -= 1
        }

        if (this.currentServer?.id === id) {
          this.currentServer = null
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '删除服务器失败'
        console.error('Failed to delete MCP server:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 测试连接
     */
    async testConnection(
      id: string
    ): Promise<{ success: boolean; message: string; responseTime?: number }> {
      this.loading = true
      this.error = null

      try {
        const result = await mcpServerApi.testConnection(id)

        if (result.success) {
          // 更新服务器状态
          const index = this.servers.findIndex((s) => s.id === id)
          if (index !== -1) {
            this.servers[index] = {
              ...this.servers[index],
              status: 'connected',
              lastActive: Date.now(),
              responseTime: result.responseTime
            }
          }
        }

        return {
          success: result.success,
          message: result.success ? '连接成功' : result.error || '连接失败',
          responseTime: result.responseTime
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '测试连接失败'
        console.error('Failed to test MCP connection:', error)
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新服务器状态
     */
    async refreshServerStatus(id: string) {
      // Try to reconnect and check status
      return this.testConnection(id)
    },

    /**
     * 刷新能力
     */
    async refreshCapabilities(id: string) {
      this.loading = true
      this.error = null

      try {
        const result = await mcpServerApi.refreshCapabilities(id)

        // 更新服务器的能力信息
        const index = this.servers.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.servers[index] = {
            ...this.servers[index],
            capabilities: {
              tools: result.tools,
              resources: result.resources,
              prompts: result.prompts
            }
          }
        }

        return result
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '刷新能力失败'
        console.error('Failed to refresh capabilities:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 转换后端数据格式到前端格式
     */
    transformServerFromApi(apiServer: any): MCPServer {
      // 计算状态映射
      let status: MCPServerStatus = 'disconnected'
      if (apiServer.status === 'active') {
        status = 'connected'
      } else if (apiServer.status === 'inactive') {
        status = 'disconnected'
      }

      // 计算传输类型
      const transport = apiServer.type === 'stdio' ? 'stdio' : 'http'

      // 计算能力
      const capabilities: MCPServerCapability = apiServer.config?.capabilities || {
        tools: 0,
        resources: 0,
        prompts: 0
      }

      return {
        id: apiServer.id,
        name: apiServer.name,
        uniqueId: apiServer.config?.uniqueId || apiServer.id,
        version: apiServer.config?.version || '1.0.0',
        description: apiServer.description || '',
        author: apiServer.config?.author || 'Unknown',
        homepage: apiServer.config?.homepage,
        transport,
        status,
        responseTime: apiServer.config?.responseTime,
        errorCount: apiServer.config?.errorCount || 0,
        capabilities,
        config: {
          command: apiServer.config?.command,
          args: apiServer.config?.args,
          workingDir: apiServer.config?.workingDir,
          env: apiServer.config?.env,
          endpoint: apiServer.endpoint || apiServer.config?.endpoint,
          headers: apiServer.config?.headers,
          timeout: apiServer.config?.timeout,
          auth: apiServer.config?.auth,
          ssl: apiServer.config?.ssl
        },
        tools: apiServer.config?.tools || [],
        resources: apiServer.config?.resources || [],
        prompts: apiServer.config?.prompts || [],
        lastActive: apiServer.config?.lastActive
          ? new Date(apiServer.config.lastActive).getTime()
          : undefined,
        lastError: apiServer.config?.lastError,
        createdAt: apiServer.created_at ? new Date(apiServer.created_at).getTime() : Date.now(),
        updatedAt: apiServer.updated_at ? new Date(apiServer.updated_at).getTime() : Date.now()
      }
    }
  }
})
