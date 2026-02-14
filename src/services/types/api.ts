// API基础配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://stage1.fe.tutorial.clouddreamai.com'

// API请求配置
export const API_CONFIG = {
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000
}

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// 请求方法
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// 请求配置接口
export interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: Record<string, unknown> | FormData
  timeout?: number
  retryCount?: number
}

// API响应接口
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
  code?: number
}
