import { defineStore } from 'pinia'

// ============================================================================
// Type Definitions
// ============================================================================

export interface CallChainItem {
  step: number
  type: 'llm' | 'mcp' | 'skill' | 'api' | 'tool'
  name: string
  startTime: number
  endTime: number
  duration: number
  input: any
  output: any
  status: 'success' | 'failed' | 'skipped'
  error?: string
  tokens?: { input: number; output: number }
}

export interface AgentExecutionLog {
  id: string
  agentId: string
  agentName: string
  sessionId: string
  startTime: number
  endTime: number
  duration: number // 执行耗时（ms）
  status: 'success' | 'failed' | 'timeout' | 'cancelled'
  inputMessage: string // 用户输入
  outputMessage: string // Agent 输出
  tokens: { input: number; output: number; total: number }
  modelUsed: string // 使用模型
  callChain: CallChainItem[] // 调用链路
  error?: { code: string; message: string; stack?: string; retryCount: number }
  metadata: { userAgent?: string; ip?: string; source: 'web' | 'api' | 'schedule' }
}

export interface SystemOperationLog {
  id: string
  userId: string
  userName: string
  userRole?: string
  operation: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'publish' | 'config_change'
  resourceType: 'agent' | 'skill' | 'mcp' | 'model' | 'api' | 'semantic' | 'task' | 'settings'
  resourceId: string
  resourceName: string
  beforeValue?: object
  afterValue?: object
  timestamp: number
  ip: string
  userAgent: string
  result: 'success' | 'failed'
  errorMessage?: string
}

export interface AgentLogFilter {
  agentId?: string
  status?: AgentExecutionLog['status']
  source?: 'web' | 'api' | 'schedule'
  startTime?: number
  endTime?: number
  keyword?: string
}

export interface SystemLogFilter {
  userId?: string
  operation?: SystemOperationLog['operation']
  resourceType?: SystemOperationLog['resourceType']
  startTime?: number
  endTime?: number
  keyword?: string
}

export interface LogPagination {
  page: number
  pageSize: number
  total: number
}

export interface ErrorStats {
  totalCount: number
  byType: { type: string; count: number }[]
  byAgent: { agentId: string; agentName: string; count: number }[]
  topErrors: { message: string; count: number }[]
}

interface LogState {
  agentLogs: AgentExecutionLog[]
  systemLogs: SystemOperationLog[]
  agentFilter: AgentLogFilter
  systemFilter: SystemLogFilter
  pagination: LogPagination
  loading: boolean
  error: string | null
  errorStats: ErrorStats
  useMock: boolean
}

// ============================================================================
// Mock Data
// ============================================================================

const mockAgentLogs: AgentExecutionLog[] = [
  {
    id: 'log-agent-001',
    agentId: 'agent-001',
    agentName: '数据同步助手',
    sessionId: 'session-001',
    startTime: Date.now() - 7200000,
    endTime: Date.now() - 7198000,
    duration: 2000,
    status: 'success',
    inputMessage: '同步昨天的销售数据',
    outputMessage: '已成功同步 2026-04-19 的销售数据，共计 1,234 条记录',
    tokens: { input: 120, output: 85, total: 205 },
    modelUsed: 'gpt-4o',
    callChain: [
      {
        step: 1,
        type: 'llm',
        name: '意图识别',
        startTime: Date.now() - 7200000,
        endTime: Date.now() - 7199500,
        duration: 500,
        input: { message: '同步昨天的销售数据' },
        output: { intent: 'sync_data', targetType: 'sales' },
        status: 'success',
        tokens: { input: 120, output: 45 }
      },
      {
        step: 2,
        type: 'mcp',
        name: 'database-query',
        startTime: Date.now() - 7199500,
        endTime: Date.now() - 7198500,
        duration: 1000,
        input: { query: 'SELECT * FROM sales WHERE date = ?', params: ['2026-04-19'] },
        output: { rows: 1234 },
        status: 'success'
      },
      {
        step: 3,
        type: 'llm',
        name: '结果生成',
        startTime: Date.now() - 7198500,
        endTime: Date.now() - 7198000,
        duration: 500,
        input: { data: { rows: 1234 } },
        output: { message: '同步成功' },
        status: 'success',
        tokens: { input: 80, output: 40 }
      }
    ],
    metadata: { source: 'web', userAgent: 'Mozilla/5.0', ip: '192.168.1.100' }
  },
  {
    id: 'log-agent-002',
    agentId: 'agent-002',
    agentName: '报告助手',
    sessionId: 'session-002',
    startTime: Date.now() - 3600000,
    endTime: Date.now() - 3595000,
    duration: 5000,
    status: 'failed',
    inputMessage: '生成周报',
    outputMessage: '',
    tokens: { input: 200, output: 0, total: 200 },
    modelUsed: 'gpt-4o',
    callChain: [
      {
        step: 1,
        type: 'llm',
        name: '意图识别',
        startTime: Date.now() - 3600000,
        endTime: Date.now() - 3599000,
        duration: 1000,
        input: { message: '生成周报' },
        output: { intent: 'generate_report', reportType: 'weekly' },
        status: 'success',
        tokens: { input: 200, output: 50 }
      },
      {
        step: 2,
        type: 'api',
        name: 'fetch-report-data',
        startTime: Date.now() - 3599000,
        endTime: Date.now() - 3595000,
        duration: 4000,
        input: { type: 'weekly', dateRange: ['2026-04-13', '2026-04-19'] },
        output: null,
        status: 'failed',
        error: 'API timeout after 4000ms'
      }
    ],
    error: {
      code: 'API_TIMEOUT',
      message: '数据接口超时',
      stack: 'Error: API timeout\n    at fetchReportData',
      retryCount: 2
    },
    metadata: { source: 'schedule', userAgent: 'SmartLink-Scheduler/1.0', ip: '127.0.0.1' }
  },
  {
    id: 'log-agent-003',
    agentId: 'agent-003',
    agentName: '客服机器人',
    sessionId: 'session-003',
    startTime: Date.now() - 1800000,
    endTime: Date.now() - 1798500,
    duration: 1500,
    status: 'success',
    inputMessage: '如何处理退货申请？',
    outputMessage: '退货申请流程如下：1. 登录系统 2. 进入订单管理 3. 选择对应订单...',
    tokens: { input: 50, output: 180, total: 230 },
    modelUsed: 'gpt-4o-mini',
    callChain: [
      {
        step: 1,
        type: 'llm',
        name: '问答处理',
        startTime: Date.now() - 1800000,
        endTime: Date.now() - 1798500,
        duration: 1500,
        input: { message: '如何处理退货申请？' },
        output: { answer: '退货申请流程...' },
        status: 'success',
        tokens: { input: 50, output: 180 }
      }
    ],
    metadata: { source: 'api', userAgent: 'PostmanRuntime/7.32', ip: '10.0.0.50' }
  }
]

const mockSystemLogs: SystemOperationLog[] = [
  {
    id: 'sys-log-001',
    userId: 'user-001',
    userName: '管理员',
    userRole: 'admin',
    operation: 'create',
    resourceType: 'agent',
    resourceId: 'agent-004',
    resourceName: '智能客服',
    beforeValue: undefined,
    afterValue: { name: '智能客服', status: 'draft' },
    timestamp: Date.now() - 86400000,
    ip: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success'
  },
  {
    id: 'sys-log-002',
    userId: 'user-002',
    userName: '开发者',
    userRole: 'developer',
    operation: 'update',
    resourceType: 'skill',
    resourceId: 'skill-001',
    resourceName: '数据分析技能',
    beforeValue: { version: '1.0.0' },
    afterValue: { version: '1.1.0' },
    timestamp: Date.now() - 43200000,
    ip: '192.168.1.20',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    result: 'success'
  },
  {
    id: 'sys-log-003',
    userId: 'user-001',
    userName: '管理员',
    userRole: 'admin',
    operation: 'delete',
    resourceType: 'mcp',
    resourceId: 'mcp-003',
    resourceName: '废弃的 API 服务',
    beforeValue: { name: '废弃的 API 服务', status: 'paused' },
    afterValue: undefined,
    timestamp: Date.now() - 21600000,
    ip: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'failed',
    errorMessage: '资源仍被其他模块引用'
  },
  {
    id: 'sys-log-004',
    userId: 'user-003',
    userName: '测试员',
    userRole: 'tester',
    operation: 'publish',
    resourceType: 'agent',
    resourceId: 'agent-001',
    resourceName: '数据同步助手',
    beforeValue: { status: 'draft' },
    afterValue: { status: 'published' },
    timestamp: Date.now() - 10800000,
    ip: '192.168.1.30',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    result: 'success'
  },
  {
    id: 'sys-log-005',
    userId: 'user-001',
    userName: '管理员',
    userRole: 'admin',
    operation: 'config_change',
    resourceType: 'settings',
    resourceId: 'config-llm',
    resourceName: 'LLM 配置',
    beforeValue: { defaultModel: 'gpt-4o' },
    afterValue: { defaultModel: 'gpt-4o-mini' },
    timestamp: Date.now() - 3600000,
    ip: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    result: 'success'
  }
]

// ============================================================================
// Store Definition
// ============================================================================

export const useLogStore = defineStore('log', {
  state: (): LogState => ({
    agentLogs: [],
    systemLogs: [],
    agentFilter: {},
    systemFilter: {},
    pagination: { page: 1, pageSize: 12, total: 0 },
    loading: false,
    error: null,
    errorStats: {
      totalCount: 0,
      byType: [],
      byAgent: [],
      topErrors: []
    },
    useMock: true
  }),

  getters: {
    // Get agent log by ID
    getAgentLogById: (state) => (id: string) => {
      return state.agentLogs.find((log) => log.id === id)
    },

    // Get system log by ID
    getSystemLogById: (state) => (id: string) => {
      return state.systemLogs.find((log) => log.id === id)
    },

    // Get filtered agent logs
    filteredAgentLogs: (state) => {
      let result = [...state.agentLogs]

      if (state.agentFilter.agentId) {
        result = result.filter((log) => log.agentId === state.agentFilter.agentId)
      }

      if (state.agentFilter.status) {
        result = result.filter((log) => log.status === state.agentFilter.status)
      }

      if (state.agentFilter.source) {
        result = result.filter((log) => log.metadata.source === state.agentFilter.source)
      }

      if (state.agentFilter.startTime) {
        result = result.filter((log) => log.startTime >= state.agentFilter.startTime!)
      }

      if (state.agentFilter.endTime) {
        result = result.filter((log) => log.endTime <= state.agentFilter.endTime!)
      }

      if (state.agentFilter.keyword) {
        const keyword = state.agentFilter.keyword.toLowerCase()
        result = result.filter(
          (log) =>
            log.inputMessage.toLowerCase().includes(keyword) ||
            log.outputMessage.toLowerCase().includes(keyword) ||
            log.agentName.toLowerCase().includes(keyword)
        )
      }

      return result
    },

    // Get filtered system logs
    filteredSystemLogs: (state) => {
      let result = [...state.systemLogs]

      if (state.systemFilter.userId) {
        result = result.filter((log) => log.userId === state.systemFilter.userId)
      }

      if (state.systemFilter.operation) {
        result = result.filter((log) => log.operation === state.systemFilter.operation)
      }

      if (state.systemFilter.resourceType) {
        result = result.filter((log) => log.resourceType === state.systemFilter.resourceType)
      }

      if (state.systemFilter.startTime) {
        result = result.filter((log) => log.timestamp >= state.systemFilter.startTime!)
      }

      if (state.systemFilter.endTime) {
        result = result.filter((log) => log.timestamp <= state.systemFilter.endTime!)
      }

      if (state.systemFilter.keyword) {
        const keyword = state.systemFilter.keyword.toLowerCase()
        result = result.filter(
          (log) =>
            log.userName.toLowerCase().includes(keyword) ||
            log.resourceName.toLowerCase().includes(keyword)
        )
      }

      return result
    },

    // Stats
    stats: (state) => {
      const totalAgentLogs = state.pagination.total
      const totalSystemLogs = state.systemLogs.length

      const agentLogByStatus = state.agentLogs.reduce(
        (acc, log) => {
          acc[log.status] = (acc[log.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const systemLogByResult = state.systemLogs.reduce(
        (acc, log) => {
          acc[log.result] = (acc[log.result] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const totalErrors = agentLogByStatus['failed'] || 0
      const errorRate = totalAgentLogs > 0 ? totalErrors / totalAgentLogs : 0

      const avgDuration =
        state.agentLogs.length > 0
          ? state.agentLogs.reduce((sum, log) => sum + log.duration, 0) / state.agentLogs.length
          : 0

      const totalTokens = state.agentLogs.reduce(
        (sum, log) => sum + log.tokens.total,
        0
      )

      return {
        totalAgentLogs,
        totalSystemLogs,
        agentLogByStatus,
        systemLogByResult,
        totalErrors,
        errorRate,
        avgDuration,
        totalTokens
      }
    }
  },

  actions: {
    /**
     * Fetch agent execution logs
     */
    async fetchAgentLogs() {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Apply filter
          let result = [...mockAgentLogs]

          if (this.agentFilter.agentId) {
            result = result.filter((log) => log.agentId === this.agentFilter.agentId)
          }

          if (this.agentFilter.status) {
            result = result.filter((log) => log.status === this.agentFilter.status)
          }

          if (this.agentFilter.source) {
            result = result.filter((log) => log.metadata.source === this.agentFilter.source)
          }

          if (this.agentFilter.startTime) {
            result = result.filter((log) => log.startTime >= this.agentFilter.startTime!)
          }

          if (this.agentFilter.endTime) {
            result = result.filter((log) => log.endTime <= this.agentFilter.endTime!)
          }

          if (this.agentFilter.keyword) {
            const keyword = this.agentFilter.keyword.toLowerCase()
            result = result.filter(
              (log) =>
                log.inputMessage.toLowerCase().includes(keyword) ||
                log.outputMessage.toLowerCase().includes(keyword) ||
                log.agentName.toLowerCase().includes(keyword)
            )
          }

          // Apply pagination
          const total = result.length
          const start = (this.pagination.page - 1) * this.pagination.pageSize
          const end = start + this.pagination.pageSize
          const paginatedResult = result.slice(start, end)

          this.agentLogs = paginatedResult
          this.pagination.total = total

          // Update error stats
          this._calculateErrorStats()

          return
        }

        // Real API - placeholder for future implementation
        this.agentLogs = []
        this.pagination.total = 0
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取 Agent 执行日志失败'
        console.error('Failed to fetch agent logs:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch system operation logs
     */
    async fetchSystemLogs() {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Apply filter
          let result = [...mockSystemLogs]

          if (this.systemFilter.userId) {
            result = result.filter((log) => log.userId === this.systemFilter.userId)
          }

          if (this.systemFilter.operation) {
            result = result.filter((log) => log.operation === this.systemFilter.operation)
          }

          if (this.systemFilter.resourceType) {
            result = result.filter((log) => log.resourceType === this.systemFilter.resourceType)
          }

          if (this.systemFilter.startTime) {
            result = result.filter((log) => log.timestamp >= this.systemFilter.startTime!)
          }

          if (this.systemFilter.endTime) {
            result = result.filter((log) => log.timestamp <= this.systemFilter.endTime!)
          }

          if (this.systemFilter.keyword) {
            const keyword = this.systemFilter.keyword.toLowerCase()
            result = result.filter(
              (log) =>
                log.userName.toLowerCase().includes(keyword) ||
                log.resourceName.toLowerCase().includes(keyword)
            )
          }

          // Apply pagination
          const total = result.length
          const start = (this.pagination.page - 1) * this.pagination.pageSize
          const end = start + this.pagination.pageSize
          const paginatedResult = result.slice(start, end)

          this.systemLogs = paginatedResult
          this.pagination.total = total

          return
        }

        // Real API - placeholder for future implementation
        this.systemLogs = []
        this.pagination.total = 0
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取系统操作日志失败'
        console.error('Failed to fetch system logs:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch error statistics
     */
    async fetchErrorStats() {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          this._calculateErrorStats()
          return
        }

        // Real API - placeholder
        this.errorStats = {
          totalCount: 0,
          byType: [],
          byAgent: [],
          topErrors: []
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取错误统计失败'
        console.error('Failed to fetch error stats:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Export logs
     */
    async exportLogs(type: 'agent' | 'system', format: 'csv' | 'json'): Promise<string | null> {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 500))

          if (format === 'json') {
            const logs = type === 'agent' ? this.filteredAgentLogs : this.filteredSystemLogs
            return JSON.stringify(logs, null, 2)
          }

          if (format === 'csv' && type === 'agent') {
            const headers = ['ID', 'Agent', 'Status', 'Start Time', 'Duration', 'Input', 'Output']
            const rows = this.filteredAgentLogs.map((log) => [
              log.id,
              log.agentName,
              log.status,
              new Date(log.startTime).toISOString(),
              `${log.duration}ms`,
              log.inputMessage,
              log.outputMessage
            ])
            return [headers, ...rows].map((row) => row.join(',')).join('\n')
          }

          if (format === 'csv' && type === 'system') {
            const headers = [
              'ID',
              'User',
              'Operation',
              'Resource',
              'Timestamp',
              'Result',
              'Error'
            ]
            const rows = this.filteredSystemLogs.map((log) => [
              log.id,
              log.userName,
              log.operation,
              log.resourceName,
              new Date(log.timestamp).toISOString(),
              log.result,
              log.errorMessage || ''
            ])
            return [headers, ...rows].map((row) => row.join(',')).join('\n')
          }
        }

        return null
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '导出日志失败'
        console.error('Failed to export logs:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Calculate error statistics (internal helper)
     */
    _calculateErrorStats() {
      const failedLogs = this.agentLogs.filter((log) => log.status === 'failed')

      this.errorStats.totalCount = failedLogs.length

      // Group by error type
      const typeMap = new Map<string, number>()
      failedLogs.forEach((log) => {
        const type = log.error?.code || 'UNKNOWN'
        typeMap.set(type, (typeMap.get(type) || 0) + 1)
      })
      this.errorStats.byType = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count
      }))

      // Group by agent
      const agentMap = new Map<string, { count: number; name: string }>()
      failedLogs.forEach((log) => {
        const existing = agentMap.get(log.agentId)
        if (existing) {
          existing.count++
        } else {
          agentMap.set(log.agentId, { count: 1, name: log.agentName })
        }
      })
      this.errorStats.byAgent = Array.from(agentMap.entries()).map(([agentId, data]) => ({
        agentId,
        agentName: data.name,
        count: data.count
      }))

      // Top errors
      const errorMap = new Map<string, number>()
      failedLogs.forEach((log) => {
        const message = log.error?.message || 'Unknown error'
        errorMap.set(message, (errorMap.get(message) || 0) + 1)
      })
      this.errorStats.topErrors = Array.from(errorMap.entries())
        .map(([message, count]) => ({ message, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    },

    // Agent filter actions
    setAgentFilter(filter: Partial<AgentLogFilter>) {
      this.agentFilter = { ...this.agentFilter, ...filter }
    },

    resetAgentFilter() {
      this.agentFilter = {}
    },

    // System filter actions
    setSystemFilter(filter: Partial<SystemLogFilter>) {
      this.systemFilter = { ...this.systemFilter, ...filter }
    },

    resetSystemFilter() {
      this.systemFilter = {}
    },

    // Pagination
    setPage(page: number) {
      this.pagination.page = page
    },

    setPageSize(size: number) {
      this.pagination.pageSize = size
    },

    // Mock mode
    setMockMode(enabled: boolean) {
      this.useMock = enabled
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
    key: 'smart-link-log',
    paths: ['agentFilter', 'systemFilter', 'pagination']
  }
})
