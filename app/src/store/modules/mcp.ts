import { defineStore } from 'pinia'
import type { MCPServer, MCPServerStatus, MCPServerCapability } from '@/types'
import {
  mcpServerApi,
  type MCPServerCreateParams,
  type MCPServerUpdateParams
} from '@/services/resource'

// Mock MCP服务器数据
const mockMCPServers: MCPServer[] = [
  {
    id: 'mcp-001',
    name: 'PostgreSQL 数据库工具',
    uniqueId: 'postgres-tools',
    version: '1.2.0',
    description: '提供PostgreSQL数据库查询、插入、更新和删除操作能力',
    author: 'SmartLink Team',
    homepage: 'https://github.com/smartlink/mcp-postgres',
    transport: 'stdio',
    status: 'connected',
    responseTime: 45,
    errorCount: 0,
    capabilities: { tools: 8, resources: 3, prompts: 2 },
    config: {
      command: 'mcp-server-postgres',
      args: ['--connection-string', 'postgresql://localhost:5432/mydb'],
      timeout: 30000
    },
    tools: [
      {
        name: 'query',
        description: '执行SQL查询',
        inputSchema: { type: 'object', properties: { sql: { type: 'string' } } }
      },
      {
        name: 'insert',
        description: '插入数据',
        inputSchema: {
          type: 'object',
          properties: { table: { type: 'string' }, data: { type: 'object' } }
        }
      }
    ],
    resources: [{ uri: 'postgres://tables', name: '数据库表列表', mimeType: 'application/json' }],
    prompts: [{ name: 'generate_query', description: '根据自然语言生成SQL查询' }],
    lastActive: Date.now() - 1000 * 60 * 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'mcp-002',
    name: '文件系统操作',
    uniqueId: 'filesystem-tools',
    version: '2.0.1',
    description: '提供文件和目录的读写、搜索、监控等操作能力',
    author: 'MCP Community',
    homepage: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    transport: 'stdio',
    status: 'connected',
    responseTime: 12,
    errorCount: 0,
    capabilities: { tools: 12, resources: 5, prompts: 3 },
    config: {
      command: 'mcp-server-filesystem',
      args: ['--root', '/data'],
      timeout: 15000
    },
    tools: [
      {
        name: 'read_file',
        description: '读取文件内容',
        inputSchema: { type: 'object', properties: { path: { type: 'string' } } }
      },
      {
        name: 'write_file',
        description: '写入文件',
        inputSchema: {
          type: 'object',
          properties: { path: { type: 'string' }, content: { type: 'string' } }
        }
      },
      {
        name: 'list_directory',
        description: '列出目录内容',
        inputSchema: { type: 'object', properties: { path: { type: 'string' } } }
      }
    ],
    resources: [{ uri: 'file://root', name: '根目录', mimeType: 'application/json' }],
    prompts: [{ name: 'analyze_code', description: '分析代码文件结构' }],
    lastActive: Date.now() - 1000 * 60 * 30,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60 * 5
  },
  {
    id: 'mcp-003',
    name: 'GitHub API 集成',
    uniqueId: 'github-api',
    version: '1.5.0',
    description: '提供GitHub仓库、Issue、PR、Actions等操作能力',
    author: 'MCP Community',
    homepage: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    transport: 'http',
    status: 'connected',
    responseTime: 156,
    errorCount: 2,
    capabilities: { tools: 25, resources: 8, prompts: 5 },
    config: {
      endpoint: 'https://api.github.com/mcp',
      headers: { Authorization: 'Bearer ${GITHUB_TOKEN}' },
      timeout: 60000
    },
    tools: [
      {
        name: 'create_issue',
        description: '创建Issue',
        inputSchema: {
          type: 'object',
          properties: { repo: { type: 'string' }, title: { type: 'string' } }
        }
      },
      {
        name: 'create_pr',
        description: '创建Pull Request',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' }
          }
        }
      },
      {
        name: 'search_code',
        description: '搜索代码',
        inputSchema: { type: 'object', properties: { query: { type: 'string' } } }
      }
    ],
    resources: [{ uri: 'github://repos', name: '仓库列表', mimeType: 'application/json' }],
    prompts: [{ name: 'review_pr', description: '审查Pull Request' }],
    lastActive: Date.now() - 1000 * 60 * 60,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 'mcp-004',
    name: 'Slack 消息集成',
    uniqueId: 'slack-integration',
    version: '1.0.3',
    description: '提供Slack频道消息发送、读取、搜索等操作能力',
    author: 'SmartLink Team',
    transport: 'http',
    status: 'connecting',
    capabilities: { tools: 6, resources: 2, prompts: 1 },
    config: {
      endpoint: 'https://slack.com/api/mcp',
      headers: { Authorization: 'Bearer ${SLACK_TOKEN}' },
      timeout: 30000
    },
    tools: [
      {
        name: 'send_message',
        description: '发送消息到频道',
        inputSchema: {
          type: 'object',
          properties: { channel: { type: 'string' }, text: { type: 'string' } }
        }
      },
      {
        name: 'list_channels',
        description: '列出所有频道',
        inputSchema: { type: 'object', properties: {} }
      }
    ],
    resources: [{ uri: 'slack://channels', name: '频道列表', mimeType: 'application/json' }],
    prompts: [{ name: 'summarize_thread', description: '总结对话线程' }],
    lastActive: Date.now() - 1000 * 60 * 60 * 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3
  },
  {
    id: 'mcp-005',
    name: 'Redis 缓存服务',
    uniqueId: 'redis-cache',
    version: '1.1.0',
    description: '提供Redis缓存读写、过期管理、发布订阅等操作能力',
    author: 'MCP Community',
    transport: 'stdio',
    status: 'disconnected',
    errorCount: 5,
    lastError: 'Connection refused: localhost:6379',
    capabilities: { tools: 10, resources: 1, prompts: 0 },
    config: {
      command: 'mcp-server-redis',
      args: ['--host', 'localhost', '--port', '6379'],
      timeout: 10000
    },
    tools: [
      {
        name: 'get',
        description: '获取缓存值',
        inputSchema: { type: 'object', properties: { key: { type: 'string' } } }
      },
      {
        name: 'set',
        description: '设置缓存值',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            value: { type: 'string' },
            ttl: { type: 'number' }
          }
        }
      }
    ],
    resources: [{ uri: 'redis://info', name: 'Redis信息', mimeType: 'application/json' }],
    prompts: [],
    lastActive: Date.now() - 1000 * 60 * 60 * 24 * 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'mcp-006',
    name: 'Web 搜索服务',
    uniqueId: 'web-search',
    version: '2.1.0',
    description: '提供网络搜索、网页抓取、内容提取等操作能力',
    author: 'SmartLink Team',
    homepage: 'https://github.com/smartlink/mcp-websearch',
    transport: 'http',
    status: 'connected',
    responseTime: 320,
    errorCount: 1,
    capabilities: { tools: 5, resources: 0, prompts: 2 },
    config: {
      endpoint: 'https://api.search.example.com/mcp',
      timeout: 45000
    },
    tools: [
      {
        name: 'search',
        description: '网络搜索',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string' }, limit: { type: 'number' } }
        }
      },
      {
        name: 'fetch_page',
        description: '抓取网页内容',
        inputSchema: { type: 'object', properties: { url: { type: 'string' } } }
      }
    ],
    resources: [],
    prompts: [{ name: 'summarize_results', description: '总结搜索结果' }],
    lastActive: Date.now() - 1000 * 60 * 15,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    updatedAt: Date.now() - 1000 * 60 * 60
  }
]

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
        // API调用失败时使用mock数据
        console.warn('Failed to fetch MCP servers from API, using mock data:', error)
        this.servers = mockMCPServers
        this.pagination = {
          page: 1,
          pageSize: 20,
          total: mockMCPServers.length
        }
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
