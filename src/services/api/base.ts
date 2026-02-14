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
      const data = await response.json()

      console.log('API Response:', { url, status: response.status, data })

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      // 根据后端返回的数据判断成功状态
      // 通常后端会返回success字段，但如果没有，根据HTTP状态码判断
      const success = data.success !== undefined ? data.success : response.ok

      // 包装成 ApiResponse 格式
      return {
        success: success,
        data: data,
        message: data.message || (success ? 'success' : '未知错误'),
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
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
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

  // GET请求
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  // POST请求
  async post<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data })
  }

  // PUT请求
  async put<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
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
