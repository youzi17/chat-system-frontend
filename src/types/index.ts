// types/index.ts — 导出所有类型
export * from './chat'
export * from './role'
export * from './token'

/** 通用 API 响应格式（与后端 ApiResponse 对齐） */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
}

/** 分页查询请求参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页查询响应 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
