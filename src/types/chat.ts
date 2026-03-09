// types/chat.ts — 聊天相关类型定义
import type { RoleKey } from './role'

/** 单条聊天消息 */
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  avatar?: string
  isError?: boolean
}

/** 聊天会话（本地持久化） */
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  roleKey: RoleKey
  /** 后端会话 ID，首次发送消息后由后端返回 */
  backendSessionId?: string
}

/** 聊天状态 */
export interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  error: string | null
}

/** 发送消息参数 */
export interface SendMessageParams {
  content: string
  roleKey: RoleKey
}

/** 前端发往后端的请求体，与 SendMessageDto 对齐 */
export interface ChatRequest {
  roleKey: RoleKey
  message: string
  sessionId?: string
}

/** 后端 AI 响应 */
export interface ChatResponse {
  response: string
  sessionId: string
}
