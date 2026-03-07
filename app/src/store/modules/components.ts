/**
 * Components Store
 * 管理前端组件状态
 *
 * 注意：组件元数据主要来自 @smart-link/shared 包
 * 后端 API 目前仅支持列表查询
 */
import { defineStore } from 'pinia'
import { componentsApi, type ComponentListParams } from '@/services/resource'
import { COMPONENT_META_LIST, COMPONENT_CATEGORIES } from '@smart-link/shared'
import type { ComponentMeta } from '@smart-link/core'

interface ComponentState {
  // 从 shared 包获取的组件列表（静态）
  staticComponents: ComponentMeta[]
  // 从后端 API 获取的组件列表（动态，如果需要）
  apiComponents: any[]
  // 当前选中的组件
  currentComponent: ComponentMeta | null
  // 加载状态
  loading: boolean
  // 错误信息
  error: string | null
  // 分类列表
  categories: typeof COMPONENT_CATEGORIES
  // 筛选条件
  filter: {
    category?: string
    keyword: string
  }
  // 分页
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export const useComponentsStore = defineStore('components', {
  state: (): ComponentState => ({
    staticComponents: COMPONENT_META_LIST,
    apiComponents: [],
    currentComponent: null,
    loading: false,
    error: null,
    categories: COMPONENT_CATEGORIES,
    filter: {
      keyword: ''
    },
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    }
  }),

  getters: {
    /**
     * 获取所有组件（合并静态和动态）
     */
    allComponents(state): ComponentMeta[] {
      // 优先使用静态组件列表
      return state.staticComponents
    },

    /**
     * 获取过滤后的组件列表
     */
    filteredComponents(state): ComponentMeta[] {
      let result = state.staticComponents

      // 按分类筛选
      if (state.filter.category) {
        result = result.filter((c) => c.category === state.filter.category)
      }

      // 按关键词搜索
      if (state.filter.keyword) {
        const keyword = state.filter.keyword.toLowerCase()
        result = result.filter(
          (c) =>
            c.name.toLowerCase().includes(keyword) ||
            c.type.toLowerCase().includes(keyword) ||
            c.description.toLowerCase().includes(keyword)
        )
      }

      return result
    },

    /**
     * 按分类分组
     */
    componentsByCategory(state): Record<string, ComponentMeta[]> {
      const result: Record<string, ComponentMeta[]> = {}

      for (const cat of state.categories) {
        if (cat.value !== 'all') {
          result[cat.value] = state.staticComponents.filter((c) => c.category === cat.value)
        }
      }

      return result
    },

    /**
     * 统计信息
     */
    stats(state) {
      const byCategory: { category: string; count: number }[] = []

      for (const cat of state.categories) {
        if (cat.value !== 'all') {
          const count = state.staticComponents.filter((c) => c.category === cat.value).length
          byCategory.push({ category: cat.value, count })
        }
      }

      return {
        total: state.staticComponents.length,
        byCategory
      }
    },

    /**
     * 获取组件数量
     */
    getCategoryCount: (state) => (category: string) => {
      return state.staticComponents.filter((c) => c.category === category).length
    }
  },

  actions: {
    /**
     * 设置筛选条件
     */
    setFilter(filter: Partial<ComponentState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    /**
     * 设置当前组件
     */
    setCurrentComponent(component: ComponentMeta | null) {
      this.currentComponent = component
    },

    /**
     * 根据 type 获取组件
     */
    getComponentByType(type: string): ComponentMeta | undefined {
      return this.staticComponents.find((c) => c.type === type)
    },

    /**
     * 从后端 API 获取组件列表
     * 注意：后端目前仅支持列表查询
     */
    async fetchComponents(params?: ComponentListParams) {
      this.loading = true
      this.error = null

      try {
        const response = await componentsApi.list({
          page: params?.page || this.pagination.page,
          page_size: params?.page_size || this.pagination.pageSize,
          ...params
        })

        this.apiComponents = response.list
        this.pagination = {
          page: response.page,
          pageSize: response.page_size,
          total: response.total
        }
      } catch (error: unknown) {
        const err = error as { message?: string }
        this.error = err.message || '获取组件列表失败'
        console.error('Failed to fetch components:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载组件详情
     */
    loadComponentDetail(type: string) {
      const component = this.getComponentByType(type)
      if (component) {
        this.setCurrentComponent(component)
      }
      return component
    }
  }
})
