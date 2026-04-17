import { defineStore } from 'pinia'
import type {
  Agent,
  AgentFilter,
  AgentPagination,
  AgentRuntimeStatus,
  AgentCreateParams,
  AgentUpdateParams
} from '@/types'
import { AgentStatus, AgentType, AgentDomain } from '@/types'
import { agentApi } from '@/services/agent'
import { mockAgents, mockRuntimeStatus } from '@/mocks/agent'

interface AgentState {
  // List state
  agents: Agent[]
  filteredAgents: Agent[]

  // Filter and pagination
  filter: AgentFilter
  pagination: AgentPagination

  // Current editing
  currentAgent: Agent | null
  isEditing: boolean

  // Runtime state
  runtimeAgents: AgentRuntimeStatus[]

  // Loading states
  loading: boolean
  error: string | null

  // Mock mode flag
  useMock: boolean
}

export const useAgentStore = defineStore('agent', {
  state: (): AgentState => ({
    agents: [],
    filteredAgents: [],
    filter: {},
    pagination: { page: 1, pageSize: 12, total: 0 },
    currentAgent: null,
    isEditing: false,
    runtimeAgents: [],
    loading: false,
    error: null,
    useMock: true // Enable mock mode by default
  }),

  getters: {
    // Get agent by ID
    getAgentById: (state) => (id: string) => {
      return state.agents.find((agent) => agent.id === id)
    },

    // Get agents by type
    getAgentsByType: (state) => (type: AgentType) => {
      return state.filteredAgents.filter((agent) => agent.type === type)
    },

    // Get agents by status
    getAgentsByStatus: (state) => (status: AgentStatus) => {
      return state.filteredAgents.filter((agent) => agent.status === status)
    },

    // Active agents (for runtime management)
    activeAgents: (state) => {
      return state.agents.filter((agent) => agent.status === AgentStatus.ACTIVE)
    },

    // Draft agents
    draftAgents: (state) => {
      return state.agents.filter((agent) => agent.status === AgentStatus.DRAFT)
    },

    // Paused agents
    pausedAgents: (state) => {
      return state.agents.filter((agent) => agent.status === AgentStatus.PAUSED)
    },

    // Stats - 按领域统计
    stats: (state) => ({
      total: state.pagination.total,
      resource: state.agents.filter((agent) => agent.domain === AgentDomain.RESOURCE).length,
      asset: state.agents.filter((agent) => agent.domain === AgentDomain.ASSET).length,
      operation: state.agents.filter((agent) => agent.domain === AgentDomain.OPERATION).length,
      infrastructure: state.agents.filter((agent) => agent.domain === AgentDomain.INFRASTRUCTURE)
        .length
    })
  },

  actions: {
    /**
     * 获取智能体列表
     */
    async fetchAgents() {
      this.loading = true
      this.error = null

      try {
        // Use mock data if mock mode is enabled
        if (this.useMock) {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Apply filter
          let result = [...mockAgents]

          // Apply type filter
          if (this.filter.type) {
            result = result.filter((agent) => agent.type === this.filter.type)
          }

          // Apply status filter
          if (this.filter.status) {
            result = result.filter((agent) => agent.status === this.filter.status)
          }

          // Apply keyword search
          if (this.filter.keyword) {
            const keyword = this.filter.keyword.toLowerCase()
            result = result.filter(
              (agent) =>
                agent.identity.name.toLowerCase().includes(keyword) ||
                agent.identity.description.toLowerCase().includes(keyword) ||
                agent.identity.code.toLowerCase().includes(keyword)
            )
          }

          // Apply category filter
          if (this.filter.category) {
            result = result.filter((agent) => agent.category === this.filter.category)
          }

          // Apply pagination
          const total = result.length
          const start = (this.pagination.page - 1) * this.pagination.pageSize
          const end = start + this.pagination.pageSize
          const paginatedResult = result.slice(start, end)

          this.agents = paginatedResult
          this.pagination.total = total
          this.applyFilter()
          return
        }

        // Use real API
        const response = await agentApi.getAgents({
          page: this.pagination.page,
          page_size: this.pagination.pageSize,
          ...this.filter
        })

        this.agents = response.list
        this.pagination.total = response.total
        this.applyFilter()
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取智能体列表失败'
        console.error('Failed to fetch agents:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建智能体
     */
    async createAgent(params: AgentCreateParams): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 500))

          const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            type: AgentType.CUSTOM,
            status: AgentStatus.DRAFT,
            domain: params.domain || AgentDomain.RESOURCE,
            version: '0.1.0',
            tags: params.tags || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            creator: '当前用户',
            category: params.category,
            identity: {
              name: params.name,
              code: params.code,
              avatar: params.avatar || '🤖',
              description: params.description || '',
              persona: params.persona || '',
              welcomeMessage: params.welcomeMessage || '',
              responsibilities: []
            },
            capabilities: {
              mcpServers: [],
              skills: [],
              tools: [],
              llm: {
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 4096,
                topP: 1
              }
            },
            knowledge: {
              documents: [],
              databases: [],
              apis: [],
              searchConfig: {
                enabled: false,
                topK: 5,
                similarityThreshold: 0.7,
                rerankEnabled: false
              }
            }
          }

          mockAgents.push(newAgent)
          this.agents.push(newAgent)
          this.pagination.total = (this.pagination.total || 0) + 1
          this.applyFilter()
          return newAgent
        }

        // Real API
        const newAgent = await agentApi.createAgent(params)
        this.agents.push(newAgent)
        this.pagination.total = (this.pagination.total || 0) + 1
        this.applyFilter()
        return newAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '创建智能体失败'
        console.error('Failed to create agent:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新智能体
     */
    async updateAgent(id: string, updates: AgentUpdateParams): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 500))

          const mockIndex = mockAgents.findIndex((agent) => agent.id === id)
          if (mockIndex === -1) {
            throw new Error('Agent not found')
          }

          const existingAgent = mockAgents[mockIndex]
          const updatedAgent: Agent = {
            ...existingAgent,
            updatedAt: Date.now(),
            ...(updates.status && { status: updates.status }),
            ...(updates.tags && { tags: updates.tags }),
            ...(updates.pageSchema && { pageSchema: updates.pageSchema }),
            ...(updates.identity && {
              identity: { ...existingAgent.identity, ...updates.identity }
            }),
            ...(updates.capabilities && {
              capabilities: { ...existingAgent.capabilities, ...updates.capabilities }
            }),
            ...(updates.knowledge && {
              knowledge: { ...existingAgent.knowledge, ...updates.knowledge }
            })
          }

          mockAgents[mockIndex] = updatedAgent

          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = updatedAgent
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = updatedAgent
          }
          return updatedAgent
        }

        // Real API
        const updatedAgent = await agentApi.updateAgent(id, updates)
        if (updatedAgent) {
          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = updatedAgent
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = updatedAgent
          }
        }
        return updatedAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新智能体失败'
        console.error('Failed to update agent:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除智能体
     */
    async deleteAgent(id: string): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 500))

          const mockIndex = mockAgents.findIndex((agent) => agent.id === id)
          if (mockIndex !== -1) {
            mockAgents.splice(mockIndex, 1)
          }

          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents.splice(index, 1)
            this.pagination.total = Math.max(0, (this.pagination.total || 0) - 1)
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = null
            this.isEditing = false
          }
          return true
        }

        // Real API
        const success = await agentApi.deleteAgent(id)
        if (success) {
          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents.splice(index, 1)
            this.pagination.total = Math.max(0, (this.pagination.total || 0) - 1)
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = null
            this.isEditing = false
          }
        }
        return success
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '删除智能体失败'
        console.error('Failed to delete agent:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 复制智能体
     */
    async duplicateAgent(id: string): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 500))

          const original = mockAgents.find((agent) => agent.id === id)
          if (!original) {
            throw new Error('Agent not found')
          }

          const newAgent: Agent = {
            ...original,
            id: `agent-${Date.now()}`,
            status: AgentStatus.DRAFT,
            version: '0.1.0',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            identity: {
              ...original.identity,
              name: `${original.identity.name} (副本)`,
              code: `${original.identity.code}_copy_${Date.now()}`
            }
          }

          mockAgents.push(newAgent)
          this.agents.push(newAgent)
          this.pagination.total = (this.pagination.total || 0) + 1
          this.applyFilter()
          return newAgent
        }

        // Real API
        const newAgent = await agentApi.duplicateAgent(id)
        if (newAgent) {
          this.agents.push(newAgent)
          this.pagination.total = (this.pagination.total || 0) + 1
          this.applyFilter()
        }
        return newAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '复制智能体失败'
        console.error('Failed to duplicate agent:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 激活智能体
     */
    async activateAgent(id: string): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const mockIndex = mockAgents.findIndex((agent) => agent.id === id)
          if (mockIndex === -1) {
            throw new Error('Agent not found')
          }

          mockAgents[mockIndex].status = AgentStatus.ACTIVE
          mockAgents[mockIndex].updatedAt = Date.now()

          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = { ...mockAgents[mockIndex] }
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = { ...mockAgents[mockIndex] }
          }
          return mockAgents[mockIndex]
        }

        // Real API
        const activatedAgent = await agentApi.activateAgent(id)
        if (activatedAgent) {
          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = activatedAgent
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = activatedAgent
          }
        }
        return activatedAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '激活智能体失败'
        console.error('Failed to activate agent:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 暂停智能体
     */
    async pauseAgent(id: string): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const mockIndex = mockAgents.findIndex((agent) => agent.id === id)
          if (mockIndex === -1) {
            throw new Error('Agent not found')
          }

          mockAgents[mockIndex].status = AgentStatus.PAUSED
          mockAgents[mockIndex].updatedAt = Date.now()

          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = { ...mockAgents[mockIndex] }
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = { ...mockAgents[mockIndex] }
          }
          return mockAgents[mockIndex]
        }

        // Real API
        const pausedAgent = await agentApi.pauseAgent(id)
        if (pausedAgent) {
          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = pausedAgent
          }
          this.applyFilter()

          if (this.currentAgent?.id === id) {
            this.currentAgent = pausedAgent
          }
        }
        return pausedAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '暂停智能体失败'
        console.error('Failed to pause agent:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取智能体详情
     */
    async fetchAgent(id: string): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const agent = mockAgents.find((a) => a.id === id)
          if (agent) {
            const index = this.agents.findIndex((a) => a.id === id)
            if (index !== -1) {
              this.agents[index] = agent
            } else {
              this.agents.push(agent)
            }
            this.currentAgent = agent
          }
          return agent || null
        }

        // Real API
        const agent = await agentApi.getAgentById(id)
        if (agent) {
          const index = this.agents.findIndex((a) => a.id === id)
          if (index !== -1) {
            this.agents[index] = agent
          } else {
            this.agents.push(agent)
          }
          this.currentAgent = agent
        }
        return agent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取智能体详情失败'
        console.error('Failed to fetch agent:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新能力配置
     */
    async updateCapabilities(
      id: string,
      capabilities: Partial<Agent['capabilities']>
    ): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const mockIndex = mockAgents.findIndex((agent) => agent.id === id)
          if (mockIndex === -1) {
            throw new Error('Agent not found')
          }

          mockAgents[mockIndex].capabilities = {
            ...mockAgents[mockIndex].capabilities,
            ...capabilities
          }
          mockAgents[mockIndex].updatedAt = Date.now()

          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = { ...mockAgents[mockIndex] }
          }
          if (this.currentAgent?.id === id) {
            this.currentAgent = { ...mockAgents[mockIndex] }
          }
          return mockAgents[mockIndex]
        }

        // Real API
        const updatedAgent = await agentApi.updateCapabilities(id, capabilities)
        if (updatedAgent) {
          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = updatedAgent
          }
          if (this.currentAgent?.id === id) {
            this.currentAgent = updatedAgent
          }
        }
        return updatedAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新能力配置失败'
        console.error('Failed to update capabilities:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新知识库配置
     */
    async updateKnowledge(
      id: string,
      knowledge: Partial<Agent['knowledge']>
    ): Promise<Agent | null> {
      this.loading = true
      this.error = null

      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const mockIndex = mockAgents.findIndex((agent) => agent.id === id)
          if (mockIndex === -1) {
            throw new Error('Agent not found')
          }

          mockAgents[mockIndex].knowledge = {
            ...mockAgents[mockIndex].knowledge,
            ...knowledge
          }
          mockAgents[mockIndex].updatedAt = Date.now()

          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = { ...mockAgents[mockIndex] }
          }
          if (this.currentAgent?.id === id) {
            this.currentAgent = { ...mockAgents[mockIndex] }
          }
          return mockAgents[mockIndex]
        }

        // Real API
        const updatedAgent = await agentApi.updateKnowledge(id, knowledge)
        if (updatedAgent) {
          const index = this.agents.findIndex((agent) => agent.id === id)
          if (index !== -1) {
            this.agents[index] = updatedAgent
          }
          if (this.currentAgent?.id === id) {
            this.currentAgent = updatedAgent
          }
        }
        return updatedAgent
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新知识库配置失败'
        console.error('Failed to update knowledge:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取运行时状态
     */
    async fetchRuntimeStatus(): Promise<AgentRuntimeStatus[]> {
      try {
        // Mock mode
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          this.runtimeAgents = mockRuntimeStatus
          return mockRuntimeStatus
        }

        // Real API
        const status = await agentApi.getRuntimeStatus()
        this.runtimeAgents = status
        return status
      } catch (error: unknown) {
        console.error('Failed to fetch runtime status:', error)
        return []
      }
    },

    /**
     * 切换 Mock 模式
     */
    setMockMode(enabled: boolean) {
      this.useMock = enabled
    },

    // Filter & Sort
    setFilter(filter: AgentFilter) {
      this.filter = { ...this.filter, ...filter }
      this.applyFilter()
    },

    resetFilter() {
      this.filter = {}
      this.applyFilter()
    },

    applyFilter() {
      let result = [...this.agents]

      // Apply type filter
      if (this.filter.type) {
        result = result.filter((agent) => agent.type === this.filter.type)
      }

      // Apply status filter
      if (this.filter.status) {
        result = result.filter((agent) => agent.status === this.filter.status)
      }

      // Apply keyword search
      if (this.filter.keyword) {
        const keyword = this.filter.keyword.toLowerCase()
        result = result.filter(
          (agent) =>
            agent.identity.name.toLowerCase().includes(keyword) ||
            agent.identity.description.toLowerCase().includes(keyword)
        )
      }

      // Apply sorting
      if (this.filter.sortBy) {
        result.sort((a, b) => {
          const sortKey = this.filter.sortBy as string
          let aVal: any
          let bVal: any

          // Handle nested properties
          if (sortKey.startsWith('identity.')) {
            const prop = sortKey.split('.')[1]
            aVal = (a.identity as any)[prop]
            bVal = (b.identity as any)[prop]
          } else {
            aVal = (a as any)[sortKey]
            bVal = (b as any)[sortKey]
          }

          const order = this.filter.sortOrder === 'desc' ? -1 : 1
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal) * order
          }
          return ((aVal || 0) > (bVal || 0) ? 1 : -1) * order
        })
      }

      this.filteredAgents = result
    },

    // Pagination
    setPage(page: number) {
      this.pagination.page = page
    },

    setPageSize(size: number) {
      this.pagination.pageSize = size
    },

    // Current editing
    setCurrentAgent(agent: Agent | null) {
      this.currentAgent = agent
      this.isEditing = !!agent
    },

    clearCurrentAgent() {
      this.currentAgent = null
      this.isEditing = false
    },

    // Error handling
    setError(error: string | null) {
      this.error = error
    },

    clearError() {
      this.error = null
    }
  },

  persist: {
    key: 'smart-link-agent',
    paths: ['filter', 'pagination']
  }
})
