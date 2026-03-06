import { defineStore } from 'pinia'
import type { Skill, SkillCategory, SkillStatus, SkillRiskLevel } from '@/types'

interface SkillsState {
  skills: Skill[]
  currentSkill: Skill | null
  loading: boolean
  filter: {
    category?: SkillCategory
    riskLevel?: SkillRiskLevel
    status?: SkillStatus
    keyword: string
  }
}

// Mock data for development
const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'data-analytics',
    displayName: '数据分析 Skill',
    version: '2.1.0',
    category: 'analytics',
    status: 'enabled',
    author: '数据团队',
    maintainer: '张三',
    description: '对数据进行统计分析，生成可视化报告',
    tags: ['数据分析', '统计', '报表'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        dataset: { type: 'array', description: '待分析的数据集' },
        analysis_type: { type: 'string', enum: ['descriptive', 'diagnostic', 'predictive'] },
        output_format: { type: 'string', enum: ['json', 'csv', 'excel'], default: 'json' }
      },
      required: ['dataset', 'analysis_type']
    },
    outputSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        metrics: { type: 'array' },
        charts: { type: 'array' },
        insights: { type: 'array' }
      }
    },
    config: {
      model: 'claude-sonnet-4.5',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1.0,
      toolBindings: ['data-processor', 'chart-generator'],
      guardrails: {
        validateInput: true,
        privacyCheck: true,
        maxRetries: 3
      },
      resources: {
        timeout: 60,
        maxMemory: 512,
        maxConcurrency: 10
      }
    },
    dependencies: {
      skills: [{ id: 'data-preprocessor', version: '>=1.0.0' }],
      tools: ['pandas-executor', 'chart-renderer'],
      mcpServers: ['PostgreSQL MCP', 'Filesystem MCP']
    },
    stats: {
      totalCalls: 12345,
      successRate: 99.1,
      avgDuration: 2.3,
      last30Days: {
        calls: 3456,
        tokens: { input: 2100000, output: 1500000 },
        cost: 156.8
      }
    },
    lastUpdated: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 3600000
  },
  {
    id: '2',
    name: 'doc-processor',
    displayName: '文档处理 Skill',
    version: '1.5.2',
    category: 'processing',
    status: 'enabled',
    author: '平台团队',
    maintainer: '李四',
    description: '批量处理文档，支持格式转换、摘要生成',
    tags: ['文档处理', '格式转换', '摘要'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        documents: { type: 'array', items: { type: 'string' } },
        process_type: { type: 'string', enum: ['convert', 'summarize', 'extract'] },
        output_format: { type: 'string' }
      },
      required: ['documents', 'process_type']
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: { type: 'array' },
        errors: { type: 'array' }
      }
    },
    config: {
      model: 'claude-sonnet-4.5',
      temperature: 0.5,
      maxTokens: 2048,
      guardrails: { validateInput: true, privacyCheck: false, maxRetries: 2 },
      resources: { timeout: 120, maxMemory: 1024, maxConcurrency: 5 }
    },
    dependencies: { skills: [], tools: ['doc-converter'], mcpServers: ['Filesystem MCP'] },
    stats: {
      totalCalls: 8567,
      successRate: 98.5,
      avgDuration: 5.1,
      last30Days: { calls: 2100, tokens: { input: 1200000, output: 800000 }, cost: 89.5 }
    },
    lastUpdated: Date.now() - 7200000,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 7200000
  },
  {
    id: '3',
    name: 'api-invoker',
    displayName: 'API 调用 Skill',
    version: '3.0.1',
    category: 'invoker',
    status: 'enabled',
    author: '集成团队',
    description: '封装外部 API 调用，支持认证和错误处理',
    tags: ['API', '调用', '集成'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        api_config: { type: 'object' },
        request_params: { type: 'object' }
      },
      required: ['api_config']
    },
    outputSchema: {
      type: 'object',
      properties: {
        data: { type: 'object' },
        status: { type: 'number' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1024,
      guardrails: { validateInput: true, privacyCheck: false, maxRetries: 3 },
      resources: { timeout: 30, maxMemory: 256, maxConcurrency: 20 }
    },
    dependencies: { skills: [], tools: [], mcpServers: [] },
    stats: {
      totalCalls: 25678,
      successRate: 99.8,
      avgDuration: 0.8,
      last30Days: { calls: 6789, tokens: { input: 500000, output: 300000 }, cost: 23.4 }
    },
    lastUpdated: Date.now() - 1800000,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 1800000
  },
  {
    id: '4',
    name: 'code-executor',
    displayName: '代码执行 Skill',
    version: '1.2.0',
    category: 'transform',
    status: 'enabled',
    author: 'AI 团队',
    description: '安全执行用户代码片段',
    tags: ['代码执行', 'Python', '安全沙箱'],
    riskLevel: 'medium',
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        language: { type: 'string', enum: ['python', 'javascript', 'typescript'] }
      },
      required: ['code', 'language']
    },
    outputSchema: {
      type: 'object',
      properties: {
        output: { type: 'string' },
        error: { type: 'string' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 2048,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 1 },
      resources: { timeout: 60, maxMemory: 512, maxConcurrency: 5 }
    },
    dependencies: { skills: [], tools: ['code-runner'], mcpServers: [] },
    stats: {
      totalCalls: 3456,
      successRate: 95.2,
      avgDuration: 3.5,
      last30Days: { calls: 890, tokens: { input: 600000, output: 400000 }, cost: 67.2 }
    },
    lastUpdated: Date.now() - 86400000,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000
  },
  {
    id: '5',
    name: 'db-operator',
    displayName: '数据库操作 Skill',
    version: '2.0.0',
    category: 'analytics',
    status: 'enabled',
    author: '数据团队',
    description: '安全执行数据库操作',
    tags: ['数据库', 'SQL', 'CRUD'],
    riskLevel: 'high',
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['query', 'insert', 'update', 'delete'] },
        table: { type: 'string' },
        data: { type: 'object' }
      },
      required: ['operation', 'table']
    },
    outputSchema: {
      type: 'object',
      properties: {
        rows: { type: 'array' },
        affected: { type: 'number' }
      }
    },
    config: {
      model: 'claude-sonnet-4.5',
      temperature: 0.1,
      maxTokens: 2048,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 1 },
      resources: { timeout: 30, maxMemory: 256, maxConcurrency: 10 }
    },
    dependencies: { skills: [], tools: ['db-connector'], mcpServers: ['PostgreSQL MCP'] },
    stats: {
      totalCalls: 1234,
      successRate: 92.5,
      avgDuration: 1.2,
      last30Days: { calls: 300, tokens: { input: 200000, output: 150000 }, cost: 34.5 }
    },
    lastUpdated: Date.now() - 43200000,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 43200000
  },
  {
    id: '6',
    name: 'payment-processor',
    displayName: '支付处理 Skill',
    version: '1.0.0',
    category: 'invoker',
    status: 'enabled',
    author: '支付团队',
    description: '处理支付相关操作',
    tags: ['支付', '交易', '财务'],
    riskLevel: 'high',
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        currency: { type: 'string' },
        method: { type: 'string' }
      },
      required: ['amount', 'currency', 'method']
    },
    outputSchema: {
      type: 'object',
      properties: {
        transaction_id: { type: 'string' },
        status: { type: 'string' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0,
      maxTokens: 512,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 0 },
      resources: { timeout: 15, maxMemory: 128, maxConcurrency: 5 }
    },
    dependencies: { skills: [], tools: ['payment-gateway'], mcpServers: [] },
    stats: {
      totalCalls: 567,
      successRate: 97.8,
      avgDuration: 2.1,
      last30Days: { calls: 150, tokens: { input: 80000, output: 50000 }, cost: 12.3 }
    },
    lastUpdated: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 3600000
  }
]

export const useSkillsStore = defineStore('skills', {
  state: (): SkillsState => ({
    skills: mockSkills,
    currentSkill: null,
    loading: false,
    filter: {
      keyword: ''
    }
  }),

  getters: {
    filteredSkills(state): Skill[] {
      let result = state.skills

      if (state.filter.category) {
        result = result.filter((s) => s.category === state.filter.category)
      }

      if (state.filter.status) {
        result = result.filter((s) => s.status === state.filter.status)
      }

      if (state.filter.riskLevel) {
        result = result.filter((s) => s.riskLevel === state.filter.riskLevel)
      }

      if (state.filter.keyword) {
        const keyword = state.filter.keyword.toLowerCase()
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(keyword) ||
            s.displayName.toLowerCase().includes(keyword) ||
            s.description.toLowerCase().includes(keyword) ||
            s.tags.some((t) => t.toLowerCase().includes(keyword))
        )
      }

      return result
    },

    skillsByCategory(state): Record<SkillCategory, Skill[]> {
      return {
        analytics: state.skills.filter((s) => s.category === 'analytics'),
        processing: state.skills.filter((s) => s.category === 'processing'),
        invoker: state.skills.filter((s) => s.category === 'invoker'),
        transform: state.skills.filter((s) => s.category === 'transform')
      }
    },

    skillsByRiskLevel(state): Record<SkillRiskLevel, Skill[]> {
      return {
        low: state.skills.filter((s) => s.riskLevel === 'low'),
        medium: state.skills.filter((s) => s.riskLevel === 'medium'),
        high: state.skills.filter((s) => s.riskLevel === 'high')
      }
    },

    stats(state) {
      return {
        total: state.skills.length,
        enabled: state.skills.filter((s) => s.status === 'enabled').length,
        totalCalls: state.skills.reduce((sum, s) => sum + s.stats.totalCalls, 0),
        avgSuccessRate: (
          state.skills.reduce((sum, s) => sum + s.stats.successRate, 0) / state.skills.length
        ).toFixed(1)
      }
    }
  },

  actions: {
    setFilter(filter: Partial<SkillsState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    getSkillById(id: string): Skill | undefined {
      return this.skills.find((s) => s.id === id)
    },

    setCurrentSkill(skill: Skill | null) {
      this.currentSkill = skill
    },

    addSkill(skill: Skill) {
      this.skills.push(skill)
    },

    updateSkill(id: string, data: Partial<Skill>) {
      const index = this.skills.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.skills[index] = { ...this.skills[index], ...data, updatedAt: Date.now() }
      }
    },

    deleteSkill(id: string) {
      const index = this.skills.findIndex((s) => s.id === id)
      if (index !== -1) {
        this.skills.splice(index, 1)
      }
    },

    async testSkill(id: string): Promise<{ success: boolean; output?: any; error?: string }> {
      const skill = this.getSkillById(id)
      if (!skill) {
        return { success: false, error: 'Skill不存在' }
      }

      // 模拟测试
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      return { success: true, output: { message: 'Test executed successfully' } }
    }
  }
})
