import { defineStore } from 'pinia'

// Domain definitions
export type SemanticDomain =
  | 'finance'
  | 'medical'
  | 'retail'
  | 'manufacture'
  | 'education'
  | 'other'

export type SemanticCategory = 'noun' | 'verb' | 'adjective' | 'phrase'

// Data models
export interface SemanticVocabulary {
  id: string
  word: string // 主词汇
  aliases: string[] // 别名/同义词
  domain: SemanticDomain // 所属领域
  category: SemanticCategory // 分类
  definition: string // 定义描述
  relatedWords: string[] // 相关词 ID
  examples: string[] // 使用示例
  priority: number // 优先级（1-100）
  createdAt: number
  updatedAt: number
  version: string
}

export interface MappingRule {
  id: string
  name: string // 规则名称
  pattern: string // 自然语言模式
  template: string // 映射模板
  variables: {
    name: string // 变量名
    type: string // 变量类型
    vocabularyRef?: string // 关联词库 ID
  }[]
  examples: string[] // 示例
  confidence: number // 置信度阈值
  enabled: boolean
}

export interface SemanticConfig {
  id: string
  domain: string
  domainName: string // 领域显示名称
  description: string
  priority: number // 领域优先级权重
  agentBindings: string[] // 关联的 Agent IDs
  mappingRules: MappingRule[]
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export interface DomainDefinition {
  id: string
  key: SemanticDomain
  name: string
  description: string
  vocabularyCount: number
}

export interface SemanticFilter {
  domain?: SemanticDomain
  category?: SemanticCategory
  keyword?: string
}

export interface SemanticPagination {
  page: number
  pageSize: number
  total: number
}

// State interface
interface SemanticState {
  vocabularies: SemanticVocabulary[]
  configs: SemanticConfig[]
  domains: DomainDefinition[]
  currentVocabulary: SemanticVocabulary | null
  currentConfig: SemanticConfig | null
  filter: SemanticFilter
  pagination: SemanticPagination
  loading: boolean
  error: string | null
}

// Mock data
const mockDomains: DomainDefinition[] = [
  {
    id: '1',
    key: 'finance',
    name: '金融',
    description: '银行、证券、保险等金融领域术语',
    vocabularyCount: 0
  },
  {
    id: '2',
    key: 'medical',
    name: '医疗',
    description: '医疗器械、药品、诊疗等医疗领域术语',
    vocabularyCount: 0
  },
  {
    id: '3',
    key: 'retail',
    name: '零售',
    description: '电商、商超、供应链等零售领域术语',
    vocabularyCount: 0
  },
  {
    id: '4',
    key: 'manufacture',
    name: '制造',
    description: '工业生产、智能制造等制造领域术语',
    vocabularyCount: 0
  },
  {
    id: '5',
    key: 'education',
    name: '教育',
    description: '教育培训、在线教育等教育领域术语',
    vocabularyCount: 0
  },
  {
    id: '6',
    key: 'other',
    name: '其他',
    description: '其他行业领域术语',
    vocabularyCount: 0
  }
]

const mockVocabularies: SemanticVocabulary[] = [
  {
    id: '1',
    word: '授信额度',
    aliases: ['信用额度', '额度', '信贷额度'],
    domain: 'finance',
    category: 'noun',
    definition: '银行或其他金融机构向客户提供的最高信用借款限额',
    relatedWords: [],
    examples: ['您的授信额度为 50 万元', '申请提高授信额度'],
    priority: 95,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: '1.0.0'
  },
  {
    id: '2',
    word: '贷款审批',
    aliases: ['贷款审核', '信贷审批'],
    domain: 'finance',
    category: 'noun',
    definition: '金融机构对贷款申请进行审核和批准的过程',
    relatedWords: ['1'],
    examples: ['贷款审批已通过', '等待贷款审批结果'],
    priority: 90,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: '1.0.0'
  },
  {
    id: '3',
    word: '处方药',
    aliases: ['处方药品', 'Rx 药'],
    domain: 'medical',
    category: 'noun',
    definition: '必须凭执业医师处方才能购买和使用的药品',
    relatedWords: [],
    examples: ['这是处方药，需要医生处方', '处方药不能随意购买'],
    priority: 95,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: '1.0.0'
  }
]

const mockConfigs: SemanticConfig[] = [
  {
    id: '1',
    domain: 'finance',
    domainName: '金融',
    description: '金融领域语义配置，包含银行、证券、保险等业务术语',
    priority: 90,
    agentBindings: [],
    mappingRules: [
      {
        id: 'rule-1',
        name: '查询额度',
        pattern: '查询{产品}的{指标}',
        template: '{"action": "query", "product": "${产品}", "metric": "${指标}"}',
        variables: [
          { name: '产品', type: 'string', vocabularyRef: '1' },
          { name: '指标', type: 'string', vocabularyRef: '2' }
        ],
        examples: ['查询信用卡的额度', '查询贷款的利率'],
        confidence: 0.85,
        enabled: true
      }
    ],
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

export const useSemanticStore = defineStore('semantic', {
  state: (): SemanticState => ({
    vocabularies: mockVocabularies,
    configs: mockConfigs,
    domains: mockDomains,
    currentVocabulary: null,
    currentConfig: null,
    filter: {},
    pagination: { page: 1, pageSize: 20, total: mockVocabularies.length },
    loading: false,
    error: null
  }),

  getters: {
    /**
     * 获取词汇总数
     */
    vocabularyCount(): number {
      return this.vocabularies.length
    },

    /**
     * 获取配置总数
     */
    configCount(): number {
      return this.configs.length
    },

    /**
     * 获取领域数
     */
    domainCount(): number {
      return this.domains.length
    },

    /**
     * 按领域筛选词汇
     */
    vocabulariesByDomain(): (domain: SemanticDomain) => SemanticVocabulary[] {
      return (domain: SemanticDomain) => {
        if (!domain) return this.vocabularies
        return this.vocabularies.filter((v) => v.domain === domain)
      }
    },

    /**
     * 按分类筛选词汇
     */
    vocabulariesByCategory(): (category: SemanticCategory) => SemanticVocabulary[] {
      return (category: SemanticCategory) => {
        if (!category) return this.vocabularies
        return this.vocabularies.filter((v) => v.category === category)
      }
    },

    /**
     * 关键词搜索
     */
    searchedVocabularies(): SemanticVocabulary[] {
      if (!this.filter.keyword) return this.vocabularies
      const keyword = this.filter.keyword.toLowerCase()
      return this.vocabularies.filter(
        (v) =>
          v.word.toLowerCase().includes(keyword) ||
          v.definition.toLowerCase().includes(keyword) ||
          v.aliases.some((alias) => alias.toLowerCase().includes(keyword))
      )
    },

    /**
     * 获取启用的配置
     */
    enabledConfigs(): SemanticConfig[] {
      return this.configs.filter((c) => c.enabled)
    },

    /**
     * 统计信息
     */
    stats(): {
      totalVocabularies: number
      totalConfigs: number
      totalDomains: number
      byDomain: Record<string, number>
    } {
      const byDomain: Record<string, number> = {}
      this.domains.forEach((d) => {
        byDomain[d.key] = this.vocabularies.filter((v) => v.domain === d.key).length
      })

      return {
        totalVocabularies: this.vocabularyCount,
        totalConfigs: this.configCount,
        totalDomains: this.domainCount,
        byDomain
      }
    },

    /**
     * 获取词库按领域统计
     */
    domainStats(): DomainDefinition[] {
      return this.domains.map((domain) => ({
        ...domain,
        vocabularyCount: this.vocabularies.filter((v) => v.domain === domain.key).length
      }))
    }
  },

  actions: {
    /**
     * 设置筛选条件
     */
    setFilter(filter: SemanticFilter) {
      this.filter = { ...this.filter, ...filter }
    },

    /**
     * 重置筛选条件
     */
    resetFilter() {
      this.filter = {}
    },

    /**
     * 设置分页
     */
    setPagination(pagination: Partial<SemanticPagination>) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    /**
     * 获取词库列表（Mock 模式）
     */
    async fetchVocabularies(domain?: SemanticDomain) {
      this.loading = true
      this.error = null

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (domain) {
          this.vocabularies = mockVocabularies.filter((v) => v.domain === domain)
        } else {
          this.vocabularies = mockVocabularies
        }

        this.pagination.total = this.vocabularies.length
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取词库失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取语义配置列表（Mock 模式）
     */
    async fetchConfigs() {
      this.loading = true
      this.error = null

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        this.configs = mockConfigs
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取配置失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置当前编辑的词库
     */
    setCurrentVocabulary(vocabulary: SemanticVocabulary | null) {
      this.currentVocabulary = vocabulary
    },

    /**
     * 设置当前编辑的配置
     */
    setCurrentConfig(config: SemanticConfig | null) {
      this.currentConfig = config
    },

    /**
     * 添加词库（预留）
     */
    async createVocabulary(_params: Partial<SemanticVocabulary>) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '添加词库失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新词库（预留）
     */
    async updateVocabulary(_id: string, _updates: Partial<SemanticVocabulary>) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新词库失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除词库（预留）
     */
    async deleteVocabulary(_id: string) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除词库失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建语义配置（预留）
     */
    async createConfig(_params: Partial<SemanticConfig>) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建配置失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新语义配置（预留）
     */
    async updateConfig(_id: string, _updates: Partial<SemanticConfig>) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新配置失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 绑定 Agent 到领域
     */
    async bindAgentToDomain(_domain: string, _agentId: string) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '绑定 Agent 失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 从领域解绑 Agent
     */
    async unbindAgentFromDomain(_domain: string, _agentId: string) {
      // TODO: Implement API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '解绑 Agent 失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 批量导入词库（预留）
     */
    async batchImportVocabularies(_file: File, _domain: SemanticDomain) {
      // TODO: Implement file parsing and API call
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '批量导入失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 导出词库（预留）
     */
    async exportVocabularies(_domain?: SemanticDomain, _format: 'csv' | 'json' = 'json') {
      // TODO: Implement export logic
      this.loading = true
      this.error = null

      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        // Mock implementation
      } catch (error) {
        this.error = error instanceof Error ? error.message : '导出词库失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 清除错误
     */
    clearError() {
      this.error = null
    }
  },

  // Enable persistence for filter and pagination
  persist: {
    key: 'smartlink-semantic',
    paths: ['filter', 'pagination']
  }
})
