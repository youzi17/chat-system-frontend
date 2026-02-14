// 导出所有类型
export * from './chat'
export * from './role'
export * from './token'
export * from './aiConfig'

// 通用类型，后端api响应格式
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// 分页类型，分页查询请求参数
export interface PaginationParams {
  page: number
  pageSize: number
}
//查询到的数据返回
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
