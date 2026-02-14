//类型定义文件
// 聊天消息类型（个人）
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  avatar?: string
  isError?: boolean // 是否为错误消息
}
//多个chatmessage组成一个chatsession，汇总chatstate，发送信息使用sendmessageparams
// 聊天会话类型（记录完整信息，包括消息、创建时间、更新时间）
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number //时间戳
  updatedAt: number //时间戳
  roleId?: string // 关联的角色ID（可选，保持向后兼容）
}

// 聊天状态类型
export interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  error: string | null
}

// 发送消息参数
export interface SendMessageParams {
  content: string
  sessionId?: string
  configId?: string // 可选的AI配置ID
}

export interface ChatRequest {
  configId: string
  message: string
}

export interface ChattResponse {
  response: string
  config: {
    model: string
    temperature: number
  }
}
export interface AIresponse {
  response: string
  config: {
    model: string
    temperature: number
  }
}
