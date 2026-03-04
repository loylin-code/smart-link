import { defineStore } from 'pinia'
import type { Application, AppFilter, AppPagination, AppRuntimeStatus } from '@/types'
import { AppStatus, AppType } from '@/types'

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
    }
  },

  actions: {
    // CRUD Operations
    async fetchApplications() {
      this.loading = true
      try {
        // Will call API service
        // For now, set mock data
      } finally {
        this.loading = false
      }
    },

    async createApp(app: Partial<Application>) {
      // Create new application
    },

    async updateApp(id: string, updates: Partial<Application>) {
      // Update application
    },

    async deleteApp(id: string) {
      // Delete application
    },

    async duplicateApp(id: string) {
      // Duplicate application
    },

    async publishApp(id: string) {
      // Publish application (draft -> published)
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
      this.pagination.total = result.length
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
    }
  },

  persist: {
    key: 'smart-link-application',
    paths: ['filter', 'pagination']
  }
})
