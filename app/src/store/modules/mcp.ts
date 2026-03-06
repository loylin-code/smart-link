import { defineStore } from 'pinia'
import type { MCPServer, MCPServerStatus } from '@/types'

interface MCPState {
  servers: MCPServer[]
  currentServer: MCPServer | null
  loading: boolean
  filter: {
    status?: MCPServerStatus
    transport?: 'stdio' | 'http'
    keyword: string
  }
}

// Mock data for development
const mockServers: MCPServer[] = [
  {
    id: '1',
    name: 'Filesystem Server',
    uniqueId: 'io.github.mcp/filesystem',
    version: '0.6.3',
    description: '提供安全的文件系统访问能力',
    author: 'Model Context Protocol',
    transport: 'stdio',
    status: 'connected',
    responseTime: 12,
    capabilities: { tools: 3, resources: 2, prompts: 1 },
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/user/documents'],
      env: { ALLOWED_PATHS: '/home/user/documents' }
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
        description: '列出目录',
        inputSchema: { type: 'object', properties: { path: { type: 'string' } } }
      }
    ],
    resources: [
      { uri: 'file:///{path}', name: 'File Resources', mimeType: 'application/octet-stream' },
      { uri: 'directory:///{path}', name: 'Directory Resources' }
    ],
    prompts: [
      {
        name: 'file_analysis',
        description: '分析文件内容',
        arguments: [{ name: 'file_path', description: '文件路径', required: true }]
      }
    ],
    lastActive: Date.now() - 120000,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 3600000
  },
  {
    id: '2',
    name: 'PostgreSQL MCP',
    uniqueId: 'io.github.mcp/postgres',
    version: '0.5.0',
    description: 'PostgreSQL 数据库访问',
    author: 'Model Context Protocol',
    transport: 'http',
    status: 'connected',
    responseTime: 45,
    capabilities: { tools: 5, resources: 3, prompts: 0 },
    config: {
      endpoint: 'https://postgres-mcp.example.com',
      auth: { type: 'bearer', token: '***' }
    },
    lastActive: Date.now() - 300000,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 7200000
  },
  {
    id: '3',
    name: 'GitHub MCP',
    uniqueId: 'io.github.mcp/github',
    version: '0.4.0',
    description: 'GitHub API 集成',
    author: 'Model Context Protocol',
    transport: 'http',
    status: 'connecting',
    capabilities: { tools: 6, resources: 5, prompts: 2 },
    config: {
      endpoint: 'https://github-mcp.example.com',
      auth: { type: 'apiKey', apiKey: '***' }
    },
    lastActive: Date.now() - 30000,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now()
  },
  {
    id: '4',
    name: 'Sentry MCP',
    uniqueId: 'io.sentry/mcp',
    version: '0.3.0',
    description: 'Sentry 错误追踪',
    author: 'Sentry',
    transport: 'http',
    status: 'disconnected',
    errorCount: 5,
    lastError: 'Connection timeout',
    capabilities: { tools: 1, resources: 2, prompts: 0 },
    config: {
      endpoint: 'https://mcp.sentry.io/sentry-mcp',
      auth: { type: 'bearer', token: '***' },
      timeout: 30000
    },
    lastActive: Date.now() - 7200000,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000
  }
]

export const useMCPStore = defineStore('mcp', {
  state: (): MCPState => ({
    servers: mockServers,
    currentServer: null,
    loading: false,
    filter: {
      keyword: ''
    }
  }),

  getters: {
    // 获取过滤后的服务器列表
    filteredServers(state): MCPServer[] {
      let result = state.servers

      if (state.filter.status) {
        result = result.filter((s) => s.status === state.filter.status)
      }

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
      return {
        total: state.servers.length,
        connected: state.servers.filter((s) => s.status === 'connected').length,
        connecting: state.servers.filter((s) => s.status === 'connecting').length,
        disconnected: state.servers.filter((s) => s.status === 'disconnected').length,
        totalTools: state.servers.reduce((sum, s) => sum + s.capabilities.tools, 0),
        totalResources: state.servers.reduce((sum, s) => sum + s.capabilities.resources, 0),
        totalPrompts: state.servers.reduce((sum, s) => sum + s.capabilities.prompts, 0)
      }
    }
  },

  actions: {
    // 设置筛选条件
    setFilter(filter: Partial<MCPState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    // 获取服务器详情
    getServerById(id: string): MCPServer | undefined {
      return this.servers.find((s) => s.id === id)
    },

    // 设置当前服务器
    setCurrentServer(server: MCPServer | null) {
      this.currentServer = server
    },

    // 添加服务器
    addServer(server: MCPServer) {
      this.servers.push(server)
    },

    // 更新服务器
    updateServer(id: string, data: Partial<MCPServer>) {
      const index = this.servers.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.servers[index] = { ...this.servers[index], ...data, updatedAt: Date.now() }
      }
    },

    // 删除服务器
    deleteServer(id: string) {
      const index = this.servers.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.servers.splice(index, 1)
      }
    },

    // 测试连接
    async testConnection(id: string): Promise<{ success: boolean; message: string }> {
      const server = this.getServerById(id)
      if (!server) {
        return { success: false, message: '服务器不存在' }
      }

      // 模拟测试连接
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      const success = Math.random() > 0.3
      if (success) {
        this.updateServer(id, { status: 'connected', lastActive: Date.now(), errorCount: 0 })
        return { success: true, message: '连接成功' }
      } else {
        this.updateServer(id, { status: 'disconnected', lastError: 'Connection failed' })
        return { success: false, message: '连接失败' }
      }
    },

    // 刷新服务器状态
    async refreshServerStatus(id: string) {
      const server = this.getServerById(id)
      if (!server) return

      server.status = 'connecting'
      await this.testConnection(id)
    }
  }
})
