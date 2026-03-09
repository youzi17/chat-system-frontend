import type { RequestConfig, ApiResponse } from '../types/api'

// HTTP客户端类
class HttpClient {
  private baseURL: string
  private defaultConfig: RequestConfig

  constructor(baseURL: string, defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL
    this.defaultConfig = {
      timeout: 30000,
      retryCount: 3,
      ...defaultConfig,
    }
  }

  // 发送请求
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const requestConfig = { ...this.defaultConfig, ...config }

    try {
      const response = await this.fetchWithRetry(url, requestConfig)
      const data = await this.parseResponseBody(response)

      if (!response.ok) {
        const errorMessage = this.extractErrorMessage(data, response.status)
        throw new Error(errorMessage)
      }

      // 根据后端返回的数据判断成功状态
      // 通常后端会返回success字段，但如果没有，根据HTTP状态码判断
      const success =
        typeof data === 'object' &&
        data !== null &&
        typeof (data as { success?: unknown }).success === 'boolean'
          ? (data as { success: boolean }).success
          : response.ok

      const responseData =
        typeof data === 'object' && data !== null && 'data' in data
          ? (data as { data: T }).data
          : (data as T)

      const message =
        typeof data === 'object' &&
        data !== null &&
        typeof (data as { message?: unknown }).message === 'string'
          ? (data as { message: string }).message
          : success
            ? 'success'
            : '未知错误'

      // 包装成 ApiResponse 格式
      return {
        success,
        data: responseData,
        message,
      }
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // 带重试的fetch
  private async fetchWithRetry(
    url: string,
    config: RequestConfig,
    attempt: number = 1,
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout)

    try {
      const isFormData = config.body instanceof FormData
      let body: BodyInit | undefined
      if (config.body instanceof FormData) {
        body = config.body
      } else if (config.body !== undefined) {
        body = JSON.stringify(config.body)
      }
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          // FormData 不设置 Content-Type，让浏览器自动设置 multipart/form-data
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...config.headers,
        },
        body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (attempt < (config.retryCount || 3)) {
        await this.delay(1000 * attempt)
        return this.fetchWithRetry(url, config, attempt + 1)
      }

      throw error
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const raw = await response.text()
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }

  private extractErrorMessage(data: unknown, status: number): string {
    if (typeof data === 'string' && data.trim()) {
      return data
    }

    if (typeof data === 'object' && data !== null) {
      const obj = data as {
        message?: unknown
        error?: unknown
        errors?: unknown
      }

      if (typeof obj.message === 'string' && obj.message.trim()) {
        return obj.message
      }
      if (Array.isArray(obj.message)) {
        const messages = obj.message.filter((m): m is string => typeof m === 'string')
        if (messages.length > 0) {
          return messages.join('; ')
        }
      }

      if (typeof obj.error === 'string' && obj.error.trim()) {
        return obj.error
      }
      if (Array.isArray(obj.error)) {
        const errors = obj.error.filter((m): m is string => typeof m === 'string')
        if (errors.length > 0) {
          return errors.join('; ')
        }
      }

      if (Array.isArray(obj.errors)) {
        const errors = obj.errors.filter((m): m is string => typeof m === 'string')
        if (errors.length > 0) {
          return errors.join('; ')
        }
      }
    }

    return `HTTP ${status}`
  }

  // GET请求
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  // POST请求
  async post<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | FormData,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data })
  }

  // PUT请求
  async put<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | FormData,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data })
  }

  // DELETE请求
  async delete<T = unknown>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// 创建HTTP客户端实例
export const httpClient = new HttpClient(
  import.meta.env.VITE_API_BASE_URL || 'https://backend.stage1.fe.tutorial.clouddreamai.com',
  {
    timeout: 30000,
    retryCount: 3,
  },
)
