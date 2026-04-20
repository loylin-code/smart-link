import { defineStore } from 'pinia'

export interface ScheduledTask {
  id: string
  name: string
  agentId: string
  agentName: string
  schedule: string
  scheduleType: 'cron' | 'once' | 'manual'
  scheduleConfig: {
    cron?: string
    onceTime?: number
  }
  status: 'running' | 'paused' | 'completed' | 'failed'
  nextRunTime: number
  lastRunTime: number
  lastRunStatus: 'success' | 'failed' | null
  runCount: number
  successCount: number
  failCount: number
  defaultInput?: string
  paramsTemplate?: object
  validFrom?: number
  validTo?: number
  createdAt: number
  updatedAt: number
}

export interface TaskFilter {
  status?: ScheduledTask['status']
  agentId?: string
  keyword?: string
}

export interface TaskPagination {
  page: number
  pageSize: number
  total: number
}

interface TaskState {
  tasks: ScheduledTask[]
  filteredTasks: ScheduledTask[]
  filter: TaskFilter
  pagination: TaskPagination
  loading: boolean
  error: string | null
  useMock: boolean
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    tasks: [],
    filteredTasks: [],
    filter: {},
    pagination: { page: 1, pageSize: 12, total: 0 },
    loading: false,
    error: null,
    useMock: true
  }),

  getters: {
    // Get task by ID
    getTaskById: (state) => (id: string) => {
      return state.tasks.find((task) => task.id === id)
    },

    // Get tasks by agent ID
    getTasksByAgentId: (state) => (agentId: string) => {
      return state.filteredTasks.filter((task) => task.agentId === agentId)
    },

    // Get tasks by status
    getTasksByStatus: (state) => (status: ScheduledTask['status']) => {
      return state.filteredTasks.filter((task) => task.status === status)
    },

    // Running tasks
    runningTasks: (state) => {
      return state.tasks.filter((task) => task.status === 'running')
    },

    // Pending tasks (running && nextRunTime > now)
    pendingTasks: (state) => {
      const now = Date.now()
      return state.tasks.filter(
        (task) => task.status === 'running' && task.nextRunTime > now
      )
    },

    // Stats
    stats: (state) => {
      const total = state.pagination.total
      const running = state.tasks.filter((task) => task.status === 'running').length
      const paused = state.tasks.filter((task) => task.status === 'paused').length
      const now = Date.now()
      const pending = state.tasks.filter(
        (task) => task.status === 'running' && task.nextRunTime > now
      ).length

      const totalRunCount = state.tasks.reduce((sum, task) => sum + task.runCount, 0)
      const totalSuccessCount = state.tasks.reduce((sum, task) => sum + task.successCount, 0)
      const successRate = totalRunCount > 0 ? totalSuccessCount / totalRunCount : 0

      return {
        total,
        running,
        paused,
        pending,
        successRate
      }
    }
  },

  actions: {
    /**
     * 获取定时任务列表
     */
    async fetchTasks() {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Mock data
          const mockTasks: ScheduledTask[] = [
            {
              id: 'task-001',
              name: '每日数据同步',
              agentId: 'agent-001',
              agentName: '数据同步助手',
              schedule: '0 2 * * *',
              scheduleType: 'cron',
              scheduleConfig: {
                cron: '0 2 * * *'
              },
              status: 'running',
              nextRunTime: Date.now() + 86400000,
              lastRunTime: Date.now() - 3600000,
              lastRunStatus: 'success',
              runCount: 42,
              successCount: 41,
              failCount: 1,
              defaultInput: 'sync daily data',
              createdAt: Date.now() - 86400000 * 30,
              updatedAt: Date.now()
            },
            {
              id: 'task-002',
              name: '周报生成',
              agentId: 'agent-002',
              agentName: '报告助手',
              schedule: '0 9 * * 1',
              scheduleType: 'cron',
              scheduleConfig: {
                cron: '0 9 * * 1'
              },
              status: 'paused',
              nextRunTime: 0,
              lastRunTime: Date.now() - 604800000,
              lastRunStatus: 'success',
              runCount: 12,
              successCount: 12,
              failCount: 0,
              createdAt: Date.now() - 86400000 * 60,
              updatedAt: Date.now()
            },
            {
              id: 'task-003',
              name: '临时清理任务',
              agentId: 'agent-003',
              agentName: '清理助手',
              schedule: '',
              scheduleType: 'once',
              scheduleConfig: {
                onceTime: Date.now() + 3600000
              },
              status: 'running',
              nextRunTime: Date.now() + 3600000,
              lastRunTime: 0,
              lastRunStatus: null,
              runCount: 0,
              successCount: 0,
              failCount: 0,
              createdAt: Date.now() - 300000,
              updatedAt: Date.now()
            }
          ]

          // Apply filter
          let result = [...mockTasks]

          if (this.filter.status) {
            result = result.filter((task) => task.status === this.filter.status)
          }

          if (this.filter.agentId) {
            result = result.filter((task) => task.agentId === this.filter.agentId)
          }

          if (this.filter.keyword) {
            const keyword = this.filter.keyword.toLowerCase()
            result = result.filter(
              (task) =>
                task.name.toLowerCase().includes(keyword) ||
                task.agentName.toLowerCase().includes(keyword)
            )
          }

          // Apply pagination
          const total = result.length
          const start = (this.pagination.page - 1) * this.pagination.pageSize
          const end = start + this.pagination.pageSize
          const paginatedResult = result.slice(start, end)

          this.tasks = paginatedResult
          this.pagination.total = total
          this.filteredTasks = paginatedResult
          return
        }

        // Real API - placeholder for future implementation
        this.tasks = []
        this.filteredTasks = []
        this.pagination.total = 0
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取定时任务列表失败'
        console.error('Failed to fetch tasks:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建定时任务
     */
    async createTask(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'failCount'>): Promise<ScheduledTask | null> {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 500))

          const newTask: ScheduledTask = {
            ...task,
            id: `task-${Date.now()}`,
            runCount: 0,
            successCount: 0,
            failCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }

          this.tasks.push(newTask)
          this.pagination.total = (this.pagination.total || 0) + 1
          this.filteredTasks = [...this.tasks]
          return newTask
        }

        return null
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '创建定时任务失败'
        console.error('Failed to create task:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新定时任务
     */
    async updateTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask | null> {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const index = this.tasks.findIndex((task) => task.id === id)
          if (index === -1) {
            throw new Error('Task not found')
          }

          const updatedTask: ScheduledTask = {
            ...this.tasks[index],
            ...updates,
            updatedAt: Date.now()
          }

          this.tasks[index] = updatedTask
          this.filteredTasks = [...this.tasks]
          return updatedTask
        }

        return null
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '更新定时任务失败'
        console.error('Failed to update task:', error)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除定时任务
     */
    async deleteTask(id: string): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        if (this.useMock) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          const index = this.tasks.findIndex((task) => task.id === id)
          if (index !== -1) {
            this.tasks.splice(index, 1)
            this.pagination.total = Math.max(0, (this.pagination.total || 0) - 1)
            this.filteredTasks = [...this.tasks]
          }
          return true
        }

        return false
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '删除定时任务失败'
        console.error('Failed to delete task:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * 启动定时任务
     */
    async startTask(id: string): Promise<ScheduledTask | null> {
      return await this.updateTask(id, { status: 'running' })
    },

    /**
     * 暂停定时任务
     */
    async pauseTask(id: string): Promise<ScheduledTask | null> {
      return await this.updateTask(id, { status: 'paused' })
    },

    // Filter
    setFilter(filter: TaskFilter) {
      this.filter = { ...this.filter, ...filter }
    },

    resetFilter() {
      this.filter = {}
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
    key: 'smart-link-task',
    paths: ['filter', 'pagination']
  }
})
