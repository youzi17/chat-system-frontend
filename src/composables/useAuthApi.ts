import { useAuthStore } from '../stores'
import { httpClient } from '../services/api'
import type { RequestConfig } from '../services/types/api'

/**
 * 带有认证的API调用组合式函数
 * 自动添加认证头信息
 */
export function useAuthApi() {
  const authStore = useAuthStore()

  // 创建带有认证头的请求配置
  const createAuthConfig = (config: RequestConfig = {}): RequestConfig => ({
    ...config,
    headers: {
      ...config.headers,
      ...authStore.getAuthHeaders
    }
  })

  // 封装带有认证的请求方法
  const api = {
    // GET请求
    async get<T = unknown>(endpoint: string, config?: RequestConfig) {
      return httpClient.get<T>(endpoint, createAuthConfig(config))
    },

    // POST请求
    async post<T = unknown>(endpoint: string, data?: Record<string, unknown>, config?: RequestConfig) {
      return httpClient.post<T>(endpoint, data, createAuthConfig(config))
    },

    // PUT请求
    async put<T = unknown>(endpoint: string, data?: Record<string, unknown>, config?: RequestConfig) {
      return httpClient.put<T>(endpoint, data, createAuthConfig(config))
    },

    // DELETE请求
    async delete<T = unknown>(endpoint: string, config?: RequestConfig) {
      return httpClient.delete<T>(endpoint, createAuthConfig(config))
    },

    // 原始请求
    async request<T = unknown>(endpoint: string, config?: RequestConfig) {
      return httpClient.request<T>(endpoint, createAuthConfig(config))
    }
  }

  return {
    api
  }
}