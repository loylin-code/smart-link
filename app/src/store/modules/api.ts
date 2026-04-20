/**
 * API 管理 Store
 * 管理外部 API 配置、连接测试与调用统计
 */

import { defineStore } from 'pinia'

/**
 * API 参数定义
 */
export interface APIParam {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  location: 'query' | 'header' | 'body' | 'path'
  defaultValue?: any
  description?: string
}

/**
 * 外部 API 配置
 */
export interface ExternalAPI {
  id: string
  name: string                    // API 名称
  category: string                // 分类：weather/payment/map/notification/other
  provider: string                // 服务提供商
  endpoint: string                // API 端点 URL
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  authType: 'none' | 'apiKey' | 'oauth2' | 'basic' | 'jwt'
  authConfig: {
    apiKey?: string               // API Key（加密存储）
    apiKeyHeader?: string
    oauthClientId?: string
    oauthClientSecret?: string
    basicUsername?: string
    basicPassword?: string
    jwtToken?: string
  }
  requestParams: APIParam[]
  timeout: number                 // 默认 10000
  retryConfig: { maxRetries: number, retryDelay: number }
  status: 'available' | 'degraded' | 'unavailable'
  stats: {
    totalCalls: number
    successCalls: number
    failCalls: number
    avgLatency: number
    lastCallTime: number
    lastError?: string
  }
  description?: string
  createdAt: number
  updatedAt: number
}

/**
 * API 状态
 */
export interface APIState {
  apis: ExternalAPI[]
  currentAPI: ExternalAPI | null
  filter: { category?: string, status?: string, keyword?: string }
  pagination: { page: number, pageSize: number, total: number }
  loading: boolean
  error: string | null
}

export const useAPIStore = defineStore('api', {
  state: (): APIState => ({
    apis: [],
    currentAPI: null,
    filter: {
      category: undefined,
      status: undefined,
      keyword: undefined
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    /**
     * 计算 API 统计信息
     */
    stats(): { total: number, available: number, degraded: number, unavailable: number } {
      const total = this.apis.length
      const available = this.apis.filter(api => api.status === 'available').length
      const degraded = this.apis.filter(api => api.status === 'degraded').length
      const unavailable = this.apis.filter(api => api.status === 'unavailable').length
      return { total, available, degraded, unavailable }
    },

    /**
     * 获取过滤后的 API 列表
     */
    filteredAPIs(): ExternalAPI[] {
      return this.apis.filter(api => {
        if (this.filter.category && api.category !== this.filter.category) {
          return false
        }
        if (this.filter.status && api.status !== this.filter.status) {
          return false
        }
        if (this.filter.keyword) {
          const keyword = this.filter.keyword.toLowerCase()
          return api.name.toLowerCase().includes(keyword) ||
                 api.provider.toLowerCase().includes(keyword) ||
                 api.description?.toLowerCase().includes(keyword)
        }
        return true
      })
    }
  },

  actions: {
    /**
     * 设置当前选中的 API
     */
    setCurrentAPI(api: ExternalAPI | null) {
      this.currentAPI = api
    },

    /**
     * 更新过滤条件
     */
    setFilter(filter: Partial<APIState['filter']>) {
      this.filter = { ...this.filter, ...filter }
    },

    /**
     * 更新分页配置
     */
    setPagination(pagination: Partial<APIState['pagination']>) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    /**
     * 获取 API 列表（Mock 模式）
     */
    async fetchAPIs() {
      this.loading = true
      this.error = null
      try {
        // Mock 延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock 数据
        this.apis = [
          {
            id: 'api-001',
            name: '天气查询 API',
            category: 'weather',
            provider: 'OpenWeatherMap',
            endpoint: 'https://api.openweathermap.org/data/2.5/weather',
            method: 'GET',
            authType: 'apiKey',
            authConfig: {
              apiKey: 'mock_api_key_123',
              apiKeyHeader: 'Authorization'
            },
            requestParams: [
              { name: 'q', type: 'string', required: true, location: 'query', description: '城市名称' },
              { name: 'units', type: 'string', required: false, location: 'query', defaultValue: 'metric', description: '温度单位' }
            ],
            timeout: 10000,
            retryConfig: { maxRetries: 3, retryDelay: 1000 },
            status: 'available',
            stats: {
              totalCalls: 150,
              successCalls: 148,
              failCalls: 2,
              avgLatency: 234,
              lastCallTime: Date.now() - 3600000
            },
            description: '提供全球天气信息查询服务',
            createdAt: Date.now() - 86400000 * 30,
            updatedAt: Date.now() - 3600000
          },
          {
            id: 'api-002',
            name: '支付网关 API',
            category: 'payment',
            provider: 'Stripe',
            endpoint: 'https://api.stripe.com/v1/charges',
            method: 'POST',
            authType: 'apiKey',
            authConfig: {
              apiKey: 'sk_test_mock_key',
              apiKeyHeader: 'Authorization'
            },
            requestParams: [
              { name: 'amount', type: 'number', required: true, location: 'body', description: '支付金额（分）' },
              { name: 'currency', type: 'string', required: true, location: 'body', defaultValue: 'usd', description: '货币类型' },
              { name: 'source', type: 'string', required: true, location: 'body', description: '支付来源 ID' }
            ],
            timeout: 15000,
            retryConfig: { maxRetries: 2, retryDelay: 2000 },
            status: 'available',
            stats: {
              totalCalls: 89,
              successCalls: 87,
              failCalls: 2,
              avgLatency: 456,
              lastCallTime: Date.now() - 7200000
            },
            description: '处理在线支付请求',
            createdAt: Date.now() - 86400000 * 15,
            updatedAt: Date.now() - 7200000
          },
          {
            id: 'api-003',
            name: '地图服务 API',
            category: 'map',
            provider: 'Google Maps',
            endpoint: 'https://maps.googleapis.com/maps/api/geocode/json',
            method: 'GET',
            authType: 'apiKey',
            authConfig: {
              apiKey: 'AIzaSy_mock_key',
              apiKeyHeader: 'Authorization'
            },
            requestParams: [
              { name: 'address', type: 'string', required: true, location: 'query', description: '地址' },
              { name: 'key', type: 'string', required: true, location: 'query', description: 'API 密钥' }
            ],
            timeout: 10000,
            retryConfig: { maxRetries: 3, retryDelay: 1000 },
            status: 'degraded',
            stats: {
              totalCalls: 234,
              successCalls: 220,
              failCalls: 14,
              avgLatency: 678,
              lastCallTime: Date.now() - 1800000,
              lastError: 'Rate limit exceeded'
            },
            description: '地理编码与地图服务',
            createdAt: Date.now() - 86400000 * 60,
            updatedAt: Date.now() - 1800000
          }
        ]
        
        this.pagination.total = this.apis.length
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取 API 列表失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * 测试 API 连接（Mock 模式）
     */
    async testConnection(apiId: string) {
      const api = this.apis.find(a => a.id === apiId)
      if (!api) {
        throw new Error('API 不存在')
      }

      this.loading = true
      this.error = null
      try {
        // Mock 延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock 测试结果（随机成功/失败）
        const success = Math.random() > 0.2
        if (success) {
          api.status = 'available'
          api.stats.successCalls++
          api.stats.totalCalls++
          api.stats.avgLatency = Math.round((api.stats.avgLatency * api.stats.successCalls + 200) / api.stats.totalCalls)
          api.stats.lastCallTime = Date.now()
        } else {
          api.status = 'unavailable'
          api.stats.failCalls++
          api.stats.totalCalls++
          api.stats.lastCallTime = Date.now()
          api.stats.lastError = 'Connection timeout'
        }
        
        api.updatedAt = Date.now()
        return success
      } catch (err) {
        this.error = err instanceof Error ? err.message : '连接测试失败'
        api.stats.failCalls++
        api.stats.totalCalls++
        api.stats.lastCallTime = Date.now()
        api.stats.lastError = err instanceof Error ? err.message : 'Unknown error'
        return false
      } finally {
        this.loading = false
      }
    }
  },

  persist: {
    key: 'smart-link-api',
    paths: ['filter']
  }
})
