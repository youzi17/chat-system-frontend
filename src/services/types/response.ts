// API响应类型
export interface BaseResponse {
  success: boolean
  message?: string
  error?: string
  code?: number
}

// 聊天相关响应
export interface ChatResponse extends BaseResponse {
  data: {
    message: string
    sessionId: string
    timestamp: number
  }
}

// 角色相关响应
export interface RoleResponse extends BaseResponse {
  data: {
    roles: Array<{
      id: string
      name: string
      description: string
      avatar: string
      systemPrompt: string
      category: string
    }>
  }
}

// 文件上传响应
export interface UploadResponse extends BaseResponse {
  data: {
    url: string
    filename: string
    size: number
    type: string
  }
}

// 分页响应
export interface PaginatedResponse<T> extends BaseResponse {
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
  }
}
