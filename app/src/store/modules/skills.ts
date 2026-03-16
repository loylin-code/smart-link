import { defineStore } from 'pinia'
import type { Skill, SkillCategory, SkillStatus, SkillRiskLevel } from '@/types'
import { skillsApi, type SkillCreateParams, type SkillUpdateParams } from '@/services/resource'

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
    skills: [],
    currentSkill: null,
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
        const page = params?.page ?? this.pagination.page
        const pageSize = params?.pageSize ?? this.pagination.pageSize

        const response = await skillsApi.list({
          page,
          page_size: pageSize,
          status: params?.status || this.filter.status
        })

        // 转换后端数据格式到前端格式
        this.skills = response.list.map(this.transformSkillFromApi)
        this.pagination = {
          page: response.page,
          pageSize: response.page_size,
          total: response.total
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
        const skill = await skillsApi.get(id)
        this.currentSkill = this.transformSkillFromApi(skill)
        return this.currentSkill
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
