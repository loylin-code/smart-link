import type { Application, AppFilter, PageResponse, AppRuntimeStatus } from '@/types'
import { AppStatus, AppType } from '@/types'

// Mock data
const mockApplications: Application[] = [
  {
    id: '1',
    name: '智能客服助手',
    description: '基于大语言模型的智能客服系统，支持多轮对话和知识库检索',
    icon: 'customer-service',
    type: AppType.WORKFLOW,
    status: AppStatus.PUBLISHED,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000,
    publishedAt: Date.now() - 86400000 * 3,
    version: '1.0.0'
  },
  {
    id: '2',
    name: '数据分析仪表盘',
    description: '自动化数据分析工具，支持数据清洗、可视化和报告生成',
    icon: 'chart',
    type: AppType.DASHBOARD,
    status: AppStatus.PUBLISHED,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    publishedAt: Date.now() - 86400000,
    version: '1.2.0'
  },
  {
    id: '3',
    name: '订单处理流程',
    description: '订单自动化处理，支持审批流程和状态跟踪',
    icon: 'workflow',
    type: AppType.WORKFLOW,
    status: AppStatus.DESIGNING,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    version: '0.5.0'
  },
  {
    id: '4',
    name: '用户反馈收集',
    description: '用户反馈收集表单，支持多渠道收集和自动分类',
    icon: 'form',
    type: AppType.FORM,
    status: AppStatus.DRAFT,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    version: '0.1.0'
  }
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const applicationApi = {
  /**
   * Get application list with filters
   */
  async getApplications(filter?: AppFilter): Promise<PageResponse<Application>> {
    await delay(300)

    let result = [...mockApplications]

    if (filter?.type) {
      result = result.filter((app) => app.type === filter.type)
    }
    if (filter?.status) {
      result = result.filter((app) => app.status === filter.status)
    }
    if (filter?.keyword) {
      const keyword = filter.keyword.toLowerCase()
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(keyword) ||
          app.description.toLowerCase().includes(keyword)
      )
    }

    return {
      list: result,
      total: result.length,
      page: 1,
      pageSize: 20
    }
  },

  /**
   * Get application by ID
   */
  async getApplicationById(id: string): Promise<Application | null> {
    await delay(200)
    return mockApplications.find((app) => app.id === id) || null
  },

  /**
   * Create new application
   */
  async createApplication(data: Partial<Application>): Promise<Application> {
    await delay(500)

    const newApp: Application = {
      id: `app_${Date.now()}`,
      name: data.name || '未命名应用',
      description: data.description || '',
      icon: data.icon || 'app',
      type: data.type || AppType.CUSTOM,
      status: AppStatus.DRAFT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '0.1.0',
      ...data
    }

    mockApplications.push(newApp)
    return newApp
  },

  /**
   * Update application
   */
  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
    await delay(400)

    const index = mockApplications.findIndex((app) => app.id === id)
    if (index === -1) return null

    mockApplications[index] = {
      ...mockApplications[index],
      ...updates,
      updatedAt: Date.now()
    }

    return mockApplications[index]
  },

  /**
   * Delete application
   */
  async deleteApplication(id: string): Promise<boolean> {
    await delay(300)

    const index = mockApplications.findIndex((app) => app.id === id)
    if (index === -1) return false

    mockApplications.splice(index, 1)
    return true
  },

  /**
   * Duplicate application
   */
  async duplicateApplication(id: string): Promise<Application | null> {
    await delay(500)

    const original = mockApplications.find((app) => app.id === id)
    if (!original) return null

    const duplicate: Application = {
      ...original,
      id: `app_${Date.now()}`,
      name: `${original.name} (副本)`,
      status: AppStatus.DRAFT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: undefined
    }

    mockApplications.push(duplicate)
    return duplicate
  },

  /**
   * Publish application
   */
  async publishApplication(id: string): Promise<Application | null> {
    await delay(400)

    const index = mockApplications.findIndex((app) => app.id === id)
    if (index === -1) return null

    mockApplications[index] = {
      ...mockApplications[index],
      status: AppStatus.PUBLISHED,
      publishedAt: Date.now(),
      updatedAt: Date.now()
    }

    return mockApplications[index]
  },

  /**
   * Get runtime status for published apps
   */
  async getRuntimeStatus(): Promise<AppRuntimeStatus[]> {
    await delay(200)

    return mockApplications
      .filter((app) => app.status === AppStatus.PUBLISHED)
      .map((app) => ({
        appId: app.id,
        lastAccessed: Date.now() - Math.random() * 86400000,
        usageCount: Math.floor(Math.random() * 1000),
        uptime: Math.floor(Math.random() * 7200),
        errorCount: Math.floor(Math.random() * 10)
      }))
  },

  /**
   * Get application schema for runtime
   */
  async getApplicationSchema(id: string): Promise<any> {
    await delay(200)

    // Return a simple schema for runtime rendering
    return {
      id: `schema_${id}`,
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'SlContainer',
        props: { static: { direction: 'vertical' } },
        children: []
      }
    }
  }
}
