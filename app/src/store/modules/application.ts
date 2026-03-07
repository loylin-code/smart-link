import { defineStore } from 'pinia'
import type { Application, AppFilter, AppPagination, AppRuntimeStatus } from '@/types'
import { AppStatus, AppType } from '@/types'
import {
  applicationApi,
  type ApplicationCreateParams,
  type ApplicationUpdateParams
} from '@/services/application'

interface ApplicationState {
  // List state
  applications: Application[]
  filteredApplications: Application[]

  // Filter and pagination
  filter: AppFilter
  pagination: AppPagination

  // Current editing
  currentApp: Application | null
  isEditing: boolean

  // Runtime state
  runtimeApps: AppRuntimeStatus[]

  // Loading states
  loading: boolean
  error: string | null
}

export const useApplicationStore = defineStore('application', {
  state: (): ApplicationState => ({
    applications: [],
    filteredApplications: [],
    filter: {},
    pagination: { page: 1, pageSize: 12, total: 0 },
    currentApp: null,
    isEditing: false,
    runtimeApps: [],
    loading: false,
    error: null
  }),

  getters: {
    // Get app by ID
    getAppById: (state) => (id: string) => {
      return state.applications.find((app) => app.id === id)
    },

    // Get apps by type
    getAppsByType: (state) => (type: AppType) => {
      return state.filteredApplications.filter((app) => app.type === type)
    },

    // Get apps by status
    getAppsByStatus: (state) => (status: AppStatus) => {
      return state.filteredApplications.filter((app) => app.status === status)
    },

    // Published apps (for runtime management)
    publishedApps: (state) => {
      return state.applications.filter((app) => app.status === AppStatus.PUBLISHED)
    },

    // Draft apps
    draftApps: (state) => {
      return state.applications.filter((app) => app.status === AppStatus.DRAFT)
    },

    // Designing apps
    designingApps: (state) => {
      return state.applications.filter((app) => app.status === AppStatus.DESIGNING)
    },

    // Stats
    stats: (state) => ({
      total: state.pagination.total,
      published: state.applications.filter((app) => app.status === AppStatus.PUBLISHED).length,
      draft: state.applications.filter((app) => app.status === AppStatus.DRAFT).length,
      designing: state.applications.filter((app) => app.status === AppStatus.DESIGNING).length
    })
  },

  actions: {
    /**
     * 获取应用列表
     */
    async fetchApplications() {
      this.loading = true
      this.error = null

      try {
        const response = await applicationApi.getApplications({
          page: this.pagination.page,
          page_size: this.pagination.pageSize,
          ...this.filter
        })

        this.applications = response.list
        this.pagination.total = response.total
        this.applyFilter()
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取应用列表失败'
        console.error('Failed to fetch applications:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建应用
     */
    async createApp(params: ApplicationCreateParams): Promise<Application | null> {
      this.loading = true
      this.error = null

      try {
        const newApp = await applicationApi.createApplication(params)
        this.applications.push(newApp)
        this.pagination.total = (this.pagination.total || 0) + 1
        this.applyFilter()
        return newApp
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '创建应用失败'
        console.error('Failed to create application:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新应用
     */
    async updateApp(id: string, updates: ApplicationUpdateParams): Promise<Application | null> {
      this.loading = true
      this.error = null

      try {
        const updatedApp = await applicationApi.updateApplication(id, updates)
        if (updatedApp) {
          const index = this.applications.findIndex((app) => app.id === id)
          if (index !== -1) {
            this.applications[index] = updatedApp
          }
          this.applyFilter()

          if (this.currentApp?.id === id) {
            this.currentApp = updatedApp
          }
        }
        return updatedApp
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新应用失败'
        console.error('Failed to update application:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除应用
     */
    async deleteApp(id: string): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        const success = await applicationApi.deleteApplication(id)
        if (success) {
          const index = this.applications.findIndex((app) => app.id === id)
          if (index !== -1) {
            this.applications.splice(index, 1)
            this.pagination.total = Math.max(0, (this.pagination.total || 0) - 1)
          }
          this.applyFilter()

          if (this.currentApp?.id === id) {
            this.currentApp = null
            this.isEditing = false
          }
        }
        return success
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '删除应用失败'
        console.error('Failed to delete application:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 复制应用
     */
    async duplicateApp(id: string): Promise<Application | null> {
      this.loading = true
      this.error = null

      try {
        const newApp = await applicationApi.duplicateApplication(id)
        if (newApp) {
          this.applications.push(newApp)
          this.pagination.total = (this.pagination.total || 0) + 1
          this.applyFilter()
        }
        return newApp
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '复制应用失败'
        console.error('Failed to duplicate application:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 发布应用
     */
    async publishApp(id: string): Promise<Application | null> {
      this.loading = true
      this.error = null

      try {
        const publishedApp = await applicationApi.publishApplication(id)
        if (publishedApp) {
          const index = this.applications.findIndex((app) => app.id === id)
          if (index !== -1) {
            this.applications[index] = publishedApp
          }
          this.applyFilter()

          if (this.currentApp?.id === id) {
            this.currentApp = publishedApp
          }
        }
        return publishedApp
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '发布应用失败'
        console.error('Failed to publish application:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取应用详情
     */
    async fetchApplication(id: string): Promise<Application | null> {
      this.loading = true
      this.error = null

      try {
        const app = await applicationApi.getApplicationById(id)
        if (app) {
          // 更新列表中的数据
          const index = this.applications.findIndex((a) => a.id === id)
          if (index !== -1) {
            this.applications[index] = app
          } else {
            this.applications.push(app)
          }
          this.currentApp = app
        }
        return app
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取应用详情失败'
        console.error('Failed to fetch application:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 运行应用
     */
    async runApp(
      id: string,
      inputData?: Record<string, unknown>
    ): Promise<Record<string, unknown> | null> {
      this.loading = true
      this.error = null

      try {
        const result = await applicationApi.runApplication(id, { input_data: inputData })
        return result
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '运行应用失败'
        console.error('Failed to run application:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取运行时状态
     */
    async fetchRuntimeStatus(): Promise<AppRuntimeStatus[]> {
      try {
        const status = await applicationApi.getRuntimeStatus()
        this.runtimeApps = status
        return status
      } catch (error: unknown) {
        console.error('Failed to fetch runtime status:', error)
        return []
      }
    },

    // Filter & Sort
    setFilter(filter: AppFilter) {
      this.filter = { ...this.filter, ...filter }
      this.applyFilter()
    },

    resetFilter() {
      this.filter = {}
      this.applyFilter()
    },

    applyFilter() {
      let result = [...this.applications]

      // Apply type filter
      if (this.filter.type) {
        result = result.filter((app) => app.type === this.filter.type)
      }

      // Apply status filter
      if (this.filter.status) {
        result = result.filter((app) => app.status === this.filter.status)
      }

      // Apply keyword search
      if (this.filter.keyword) {
        const keyword = this.filter.keyword.toLowerCase()
        result = result.filter(
          (app) =>
            app.name.toLowerCase().includes(keyword) ||
            app.description.toLowerCase().includes(keyword)
        )
      }

      // Apply sorting
      if (this.filter.sortBy) {
        const sortKey = this.filter.sortBy as keyof Application
        result.sort((a, b) => {
          const aVal = a[sortKey]
          const bVal = b[sortKey]
          const order = this.filter.sortOrder === 'desc' ? -1 : 1
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal) * order
          }
          return (aVal > bVal ? 1 : -1) * order
        })
      }

      this.filteredApplications = result
    },

    // Pagination
    setPage(page: number) {
      this.pagination.page = page
    },

    setPageSize(size: number) {
      this.pagination.pageSize = size
    },

    // Current editing
    setCurrentApp(app: Application | null) {
      this.currentApp = app
      this.isEditing = !!app
    },

    clearCurrentApp() {
      this.currentApp = null
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
    key: 'smart-link-application',
    paths: ['filter', 'pagination']
  }
})
