/**
 * HTTP Client - Axios 实例配置
 * 用于与后端 API 通信
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

// API 响应结构
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: number
}

// 分页响应结构
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

// 分页请求参数
export interface PageParams {
  page?: number
  page_size?: number
}

// 错误响应结构
export interface ApiError {
  code: number
  message: string
  detail?: string
}

// 创建 axios 实例
const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 添加 API Key 认证头
      const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('api_key')
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey
      }

      // 添加 JWT Token（如果存在）
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 添加租户 ID（如果存在）
      const tenantId = localStorage.getItem('tenant_id')
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const { data } = response

      // 如果是文件下载，直接返回
      if (response.config.responseType === 'blob') {
        return response
      }

      // 检查业务状态码
      if (data.code !== undefined && data.code !== 0 && data.code !== 200) {
        const error: ApiError = {
          code: data.code,
          message: data.message || 'Request failed',
          detail: data.detail
        }
        return Promise.reject(error)
      }

      return response
    },
    (error) => {
      // 处理 HTTP 错误
      const apiError: ApiError = {
        code: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Network Error',
        detail: error.response?.data?.detail || error.response?.data?.error
      }

      // 处理特定状态码
      switch (apiError.code) {
        case 401:
          // 未授权，清除 token 并跳转登录
          localStorage.removeItem('token')
          localStorage.removeItem('api_key')
          // 可以在这里触发登录弹窗或跳转
          console.warn('Unauthorized, please login again')
          break
        case 403:
          console.warn('Forbidden, no permission')
          break
        case 404:
          console.warn('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
      }

      return Promise.reject(apiError)
    }
  )

  return client
}

// 导出 HTTP 客户端实例
export const httpClient = createHttpClient()

// 便捷方法封装
export const http = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return httpClient.get<T>(url, config)
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClient.post<T>(url, data, config)
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClient.put<T>(url, data, config)
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return httpClient.patch<T>(url, data, config)
  },

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return httpClient.delete<T>(url, config)
  }
}

export default http
