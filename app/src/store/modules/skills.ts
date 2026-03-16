import { defineStore } from 'pinia'
import type { Skill, SkillCategory, SkillStatus, SkillRiskLevel } from '@/types'
import { skillsApi, type SkillCreateParams, type SkillUpdateParams } from '@/services/resource'

// Mock 数据
const mockSkills: Skill[] = [
  {
    id: 'skill_001',
    name: 'data_analyzer',
    displayName: '数据分析器',
    version: '2.1.0',
    category: 'analytics',
    status: 'enabled',
    author: 'SmartLink Team',
    maintainer: 'AI Team',
    description:
      '智能数据分析技能，支持多维度数据统计、可视化和洞察生成。可处理结构化和半结构化数据。',
    tags: ['数据分析', '统计', '可视化', '洞察'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        dataSource: { type: 'string', description: '数据源路径' },
        analysisType: { type: 'string', enum: ['statistical', 'trend', 'comparison'] },
        dimensions: { type: 'array', items: { type: 'string' } }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        insights: { type: 'array' },
        charts: { type: 'array' },
        summary: { type: 'string' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 4096,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 3 },
      resources: { timeout: 120, maxMemory: 1024, maxConcurrency: 5 }
    },
    dependencies: { skills: [], tools: ['database-query'], mcpServers: [] },
    stats: {
      totalCalls: 15420,
      successRate: 98.5,
      avgDuration: 2.3,
      last30Days: { calls: 3200, tokens: { input: 450000, output: 320000 }, cost: 125.5 }
    },
    lastUpdated: Date.now() - 86400000,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'skill_002',
    name: 'text_processor',
    displayName: '文本处理器',
    version: '1.5.2',
    category: 'processing',
    status: 'enabled',
    author: 'NLP Lab',
    description: '高级文本处理技能，支持分词、实体识别、情感分析、关键词提取和文本摘要。',
    tags: ['NLP', '文本处理', '情感分析', '摘要'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: '待处理文本' },
        operations: {
          type: 'array',
          items: { type: 'string', enum: ['tokenize', 'ner', 'sentiment', 'keywords', 'summarize'] }
        }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        tokens: { type: 'array' },
        entities: { type: 'array' },
        sentiment: { type: 'object' },
        keywords: { type: 'array' },
        summary: { type: 'string' }
      }
    },
    config: {
      model: 'claude-3-sonnet',
      temperature: 0.2,
      maxTokens: 2048,
      guardrails: { validateInput: true, privacyCheck: false, maxRetries: 3 },
      resources: { timeout: 60, maxMemory: 512, maxConcurrency: 10 }
    },
    dependencies: { skills: [], tools: [], mcpServers: [] },
    stats: {
      totalCalls: 28930,
      successRate: 99.2,
      avgDuration: 1.5,
      last30Days: { calls: 5800, tokens: { input: 890000, output: 450000 }, cost: 89.3 }
    },
    lastUpdated: Date.now() - 2 * 86400000,
    createdAt: Date.now() - 45 * 86400000,
    updatedAt: Date.now() - 2 * 86400000
  },
  {
    id: 'skill_003',
    name: 'api_connector',
    displayName: 'API连接器',
    version: '3.0.1',
    category: 'invoker',
    status: 'enabled',
    author: 'Integration Team',
    description: '通用API调用技能，支持REST/GraphQL API的自动发现、参数验证和响应解析。',
    tags: ['API', '集成', 'REST', 'GraphQL'],
    riskLevel: 'medium',
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string', format: 'uri' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        headers: { type: 'object' },
        body: { type: 'object' }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        status: { type: 'number' },
        headers: { type: 'object' },
        data: { type: 'object' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      maxTokens: 1024,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 2 },
      resources: { timeout: 30, maxMemory: 256, maxConcurrency: 20 }
    },
    dependencies: { skills: [], tools: ['http-client'], mcpServers: ['api-gateway'] },
    stats: {
      totalCalls: 45680,
      successRate: 96.8,
      avgDuration: 0.8,
      last30Days: { calls: 9200, tokens: { input: 120000, output: 98000 }, cost: 45.2 }
    },
    lastUpdated: Date.now() - 4 * 3600000,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 4 * 3600000
  },
  {
    id: 'skill_004',
    name: 'data_transformer',
    displayName: '数据转换器',
    version: '1.2.0',
    category: 'transform',
    status: 'enabled',
    author: 'Data Engineering',
    description: '灵活的数据格式转换技能，支持JSON/XML/CSV/YAML等格式互转，以及自定义映射规则。',
    tags: ['数据转换', 'ETL', '格式转换'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        sourceFormat: { type: 'string', enum: ['json', 'xml', 'csv', 'yaml'] },
        targetFormat: { type: 'string', enum: ['json', 'xml', 'csv', 'yaml'] },
        data: { type: 'string' },
        mapping: { type: 'object' }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        result: { type: 'string' },
        errors: { type: 'array' }
      }
    },
    config: {
      model: 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 8192,
      guardrails: { validateInput: true, privacyCheck: false, maxRetries: 5 },
      resources: { timeout: 90, maxMemory: 2048, maxConcurrency: 8 }
    },
    dependencies: { skills: [], tools: [], mcpServers: [] },
    stats: {
      totalCalls: 12340,
      successRate: 99.8,
      avgDuration: 0.5,
      last30Days: { calls: 2800, tokens: { input: 340000, output: 280000 }, cost: 32.1 }
    },
    lastUpdated: Date.now() - 86400000,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'skill_005',
    name: 'code_generator',
    displayName: '代码生成器',
    version: '2.0.0',
    category: 'processing',
    status: 'partial',
    author: 'Developer Tools',
    maintainer: 'Code Gen Team',
    description: '智能代码生成技能，支持多种编程语言，可根据自然语言描述生成代码片段。',
    tags: ['代码生成', '编程', '自动化'],
    riskLevel: 'medium',
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          enum: ['python', 'javascript', 'typescript', 'java', 'go', 'rust']
        },
        description: { type: 'string', description: '功能描述' },
        context: { type: 'object' }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        explanation: { type: 'string' },
        dependencies: { type: 'array' }
      }
    },
    config: {
      model: 'claude-3-opus',
      temperature: 0.4,
      maxTokens: 4096,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 2 },
      resources: { timeout: 180, maxMemory: 1024, maxConcurrency: 3 }
    },
    dependencies: { skills: [], tools: ['code-validator'], mcpServers: [] },
    stats: {
      totalCalls: 8920,
      successRate: 94.2,
      avgDuration: 3.8,
      last30Days: { calls: 1800, tokens: { input: 280000, output: 420000 }, cost: 168.4 }
    },
    lastUpdated: Date.now() - 3 * 86400000,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 3 * 86400000
  },
  {
    id: 'skill_006',
    name: 'report_generator',
    displayName: '报告生成器',
    version: '1.8.5',
    category: 'analytics',
    status: 'enabled',
    author: 'BI Team',
    description: '自动化报告生成技能，支持多种报告模板，可从数据源自动提取并生成专业报告。',
    tags: ['报告', 'BI', '自动化', '文档'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        template: { type: 'string', enum: ['standard', 'executive', 'detailed', 'custom'] },
        dataSources: { type: 'array' },
        dateRange: { type: 'object' },
        sections: { type: 'array' }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        reportUrl: { type: 'string' },
        format: { type: 'string' },
        pages: { type: 'number' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 8192,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 3 },
      resources: { timeout: 300, maxMemory: 2048, maxConcurrency: 2 }
    },
    dependencies: {
      skills: [{ id: 'skill_001', version: '2.1.0' }],
      tools: ['document-processor'],
      mcpServers: ['storage']
    },
    stats: {
      totalCalls: 4560,
      successRate: 97.6,
      avgDuration: 5.2,
      last30Days: { calls: 980, tokens: { input: 156000, output: 234000 }, cost: 78.9 }
    },
    lastUpdated: Date.now() - 12 * 3600000,
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 12 * 3600000
  },
  {
    id: 'skill_007',
    name: 'workflow_executor',
    displayName: '工作流执行器',
    version: '2.5.0',
    category: 'invoker',
    status: 'disabled',
    author: 'Automation Team',
    description: '复杂工作流编排与执行技能，支持条件分支、循环、并行执行等高级流程控制。',
    tags: ['工作流', '编排', '自动化', 'BPM'],
    riskLevel: 'high',
    requiresApproval: true,
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string' },
        inputs: { type: 'object' },
        executionMode: { type: 'string', enum: ['sequential', 'parallel', 'async'] }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        executionId: { type: 'string' },
        status: { type: 'string' },
        results: { type: 'object' }
      }
    },
    config: {
      model: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 2048,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 1 },
      resources: { timeout: 600, maxMemory: 4096, maxConcurrency: 1 }
    },
    dependencies: {
      skills: [],
      tools: ['workflow-engine'],
      mcpServers: ['message-queue', 'database']
    },
    stats: {
      totalCalls: 2340,
      successRate: 89.5,
      avgDuration: 12.5,
      last30Days: { calls: 420, tokens: { input: 89000, output: 67000 }, cost: 56.7 }
    },
    lastUpdated: Date.now() - 7 * 86400000,
    createdAt: Date.now() - 120 * 86400000,
    updatedAt: Date.now() - 7 * 86400000
  },
  {
    id: 'skill_008',
    name: 'image_analyzer',
    displayName: '图像分析器',
    version: '1.3.2',
    category: 'analytics',
    status: 'enabled',
    author: 'Vision Team',
    description: '智能图像分析技能，支持物体检测、场景识别、OCR文字提取和图像描述生成。',
    tags: ['图像', '视觉', 'OCR', '检测'],
    riskLevel: 'low',
    requiresApproval: false,
    inputSchema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', format: 'uri' },
        operations: {
          type: 'array',
          items: { type: 'string', enum: ['detect', 'ocr', 'describe', 'classify'] }
        }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        objects: { type: 'array' },
        text: { type: 'string' },
        description: { type: 'string' },
        labels: { type: 'array' }
      }
    },
    config: {
      model: 'gpt-4o-vision',
      temperature: 0.3,
      maxTokens: 2048,
      guardrails: { validateInput: true, privacyCheck: true, maxRetries: 3 },
      resources: { timeout: 60, maxMemory: 1024, maxConcurrency: 5 }
    },
    dependencies: { skills: [], tools: ['image-processor'], mcpServers: [] },
    stats: {
      totalCalls: 18760,
      successRate: 98.9,
      avgDuration: 1.8,
      last30Days: { calls: 4100, tokens: { input: 680000, output: 290000 }, cost: 145.6 }
    },
    lastUpdated: Date.now() - 6 * 3600000,
    createdAt: Date.now() - 40 * 86400000,
    updatedAt: Date.now() - 6 * 3600000
  }
]

interface SkillsState {
  skills: Skill[]
  currentSkill: Skill | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  filter: {
    category?: SkillCategory
    riskLevel?: SkillRiskLevel
    status?: 'active' | 'inactive'
    keyword: string
  }
}

export const useSkillsStore = defineStore('skills', {
  state: (): SkillsState => ({
    skills: [...mockSkills], // 初始化时直接使用 mock 数据
    currentSkill: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 20,
      total: mockSkills.length
    },
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
        result = result.filter(
          (s) => s.status === (state.filter.status === 'active' ? 'enabled' : 'disabled')
        )
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
      const enabledCount = state.skills.filter((s) => s.status === 'enabled').length
      return {
        total: state.pagination.total || state.skills.length,
        enabled: enabledCount,
        totalCalls: state.skills.reduce((sum, s) => sum + (s.stats?.totalCalls || 0), 0),
        avgSuccessRate:
          state.skills.length > 0
            ? (
                state.skills.reduce((sum, s) => sum + (s.stats?.successRate || 0), 0) /
                state.skills.length
              ).toFixed(1)
            : '0.0'
      }
    }
  },

  actions: {
    setFilter(filter: Partial<SkillsState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    setPagination(pagination: Partial<SkillsState['pagination']>) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    setError(error: string | null) {
      this.error = error
    },

    getSkillById(id: string): Skill | undefined {
      return this.skills.find((s) => s.id === id)
    },

    setCurrentSkill(skill: Skill | null) {
      this.currentSkill = skill
    },

    /**
     * 从 API 获取技能列表
     */
    async fetchSkills(params?: {
      page?: number
      pageSize?: number
      status?: 'active' | 'inactive'
    }) {
      this.loading = true
      this.error = null

      try {
        // 使用 mock 数据
        await new Promise((resolve) => setTimeout(resolve, 300)) // 模拟网络延迟

        const page = params?.page ?? this.pagination.page
        const pageSize = params?.pageSize ?? this.pagination.pageSize

        // 根据状态筛选 mock 数据
        let filteredMockSkills = [...mockSkills]
        if (params?.status || this.filter.status) {
          const status = params?.status || this.filter.status
          filteredMockSkills = filteredMockSkills.filter(
            (s) => s.status === (status === 'active' ? 'enabled' : 'disabled')
          )
        }

        // 分页处理
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const paginatedSkills = filteredMockSkills.slice(start, end)

        this.skills = paginatedSkills
        this.pagination = {
          page,
          pageSize,
          total: filteredMockSkills.length
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取技能列表失败'
        console.error('Failed to fetch skills:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取技能详情
     */
    async fetchSkill(id: string) {
      this.loading = true
      this.error = null

      try {
        // 使用 mock 数据
        await new Promise((resolve) => setTimeout(resolve, 200)) // 模拟网络延迟
        const skill = mockSkills.find((s) => s.id === id)
        if (skill) {
          this.currentSkill = skill
          return this.currentSkill
        }
        throw new Error('Skill not found')
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取技能详情失败'
        console.error('Failed to fetch skill:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建技能
     */
    async createSkill(params: SkillCreateParams) {
      this.loading = true
      this.error = null

      try {
        const skill = await skillsApi.create(params)
        const transformedSkill = this.transformSkillFromApi(skill)
        this.skills.push(transformedSkill)
        this.pagination.total += 1
        return transformedSkill
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '创建技能失败'
        console.error('Failed to create skill:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新技能
     */
    async updateSkill(id: string, data: SkillUpdateParams) {
      this.loading = true
      this.error = null

      try {
        const skill = await skillsApi.update(id, data)
        const transformedSkill = this.transformSkillFromApi(skill)

        const index = this.skills.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.skills[index] = transformedSkill
        }

        if (this.currentSkill?.id === id) {
          this.currentSkill = transformedSkill
        }

        return transformedSkill
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新技能失败'
        console.error('Failed to update skill:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除技能
     */
    async deleteSkill(id: string) {
      this.loading = true
      this.error = null

      try {
        await skillsApi.delete(id)

        const index = this.skills.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.skills.splice(index, 1)
          this.pagination.total -= 1
        }

        if (this.currentSkill?.id === id) {
          this.currentSkill = null
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '删除技能失败'
        console.error('Failed to delete skill:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新技能状态
     */
    async updateSkillStatus(id: string, status: 'active' | 'inactive') {
      return this.updateSkill(id, { status })
    },

    /**
     * 测试技能
     */
    async testSkill(id: string, params: Record<string, unknown> = {}) {
      this.loading = true
      this.error = null

      try {
        const result = await skillsApi.test(id, params)
        return result
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '测试技能失败'
        console.error('Failed to test skill:', error)
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    /**
     * 转换后端技能数据格式到前端格式
     * 后端 Skill 模型：id, name, description, type, status, config
     * 前端 Skill 类型：更丰富的字段
     */
    transformSkillFromApi(apiSkill: any): Skill {
      // 计算风险等级
      let riskLevel: SkillRiskLevel = 'low'
      if (apiSkill.config?.riskLevel) {
        riskLevel = apiSkill.config.riskLevel
      } else if (apiSkill.type === 'custom') {
        riskLevel = 'medium'
      }

      // 计算状态
      const status: SkillStatus = apiSkill.status === 'active' ? 'enabled' : 'disabled'

      return {
        id: apiSkill.id,
        name: apiSkill.name,
        displayName: apiSkill.config?.displayName || apiSkill.name,
        version: apiSkill.config?.version || '1.0.0',
        category: apiSkill.config?.category || 'processing',
        status,
        author: apiSkill.config?.author || 'Unknown',
        maintainer: apiSkill.config?.maintainer,
        description: apiSkill.description || '',
        tags: apiSkill.config?.tags || [],
        riskLevel,
        requiresApproval: apiSkill.config?.requiresApproval || riskLevel === 'high',
        inputSchema: apiSkill.config?.inputSchema || { type: 'object', properties: {} },
        outputSchema: apiSkill.config?.outputSchema || { type: 'object', properties: {} },
        config: {
          model: apiSkill.config?.model,
          temperature: apiSkill.config?.temperature,
          maxTokens: apiSkill.config?.maxTokens,
          topP: apiSkill.config?.topP,
          toolBindings: apiSkill.config?.toolBindings || [],
          guardrails: apiSkill.config?.guardrails || {
            validateInput: true,
            privacyCheck: false,
            maxRetries: 3
          },
          resources: apiSkill.config?.resources || {
            timeout: 60,
            maxMemory: 512,
            maxConcurrency: 10
          }
        },
        dependencies: apiSkill.config?.dependencies || {
          skills: [],
          tools: [],
          mcpServers: []
        },
        stats: apiSkill.config?.stats || {
          totalCalls: 0,
          successRate: 100,
          avgDuration: 0,
          last30Days: {
            calls: 0,
            tokens: { input: 0, output: 0 },
            cost: 0
          }
        },
        lastUpdated: apiSkill.updated_at ? new Date(apiSkill.updated_at).getTime() : Date.now(),
        createdAt: apiSkill.created_at ? new Date(apiSkill.created_at).getTime() : Date.now(),
        updatedAt: apiSkill.updated_at ? new Date(apiSkill.updated_at).getTime() : Date.now()
      }
    }
  }
})
