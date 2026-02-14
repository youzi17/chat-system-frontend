import { httpClient } from './base'
import type { ApiResponse } from '../types/api'
import type { ChatSession } from '../../types/chat'

// 发送消息响应数据结构
interface SendMessageData {
  message: string
  sessionId: string
  timestamp: number
}

// 文件上传响应数据结构
interface UploadFileData {
  url: string
  filename: string
}

// 聊天API
export const chatApi = {
  // 发送消息
  async sendMessage(
    message: string,
    sessionId?: string,
    roleId?: string,
  ): Promise<ApiResponse<SendMessageData>> {
    return httpClient.post<SendMessageData>('/api/chat/send', {
      message,
      sessionId,
      roleId,
    } as unknown as Record<string, unknown>)
  },

  // 获取会话历史
  async getSessionHistory(sessionId: string): Promise<ApiResponse<ChatSession>> {
    return httpClient.get<ChatSession>(`/api/chat/session/${sessionId}`)
  },

  // 创建新会话
  async createSession(title?: string): Promise<ApiResponse<ChatSession>> {
    return httpClient.post<ChatSession>('/api/chat/session', { title })
  },

  // 删除会话
  async deleteSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpClient.delete<{ success: boolean }>(`/api/chat/session/${sessionId}`)
  },

  // 获取所有会话
  async getSessions(): Promise<ApiResponse<ChatSession[]>> {
    return httpClient.get<ChatSession[]>('/api/chat/sessions')
  },
}

// 文件上传API
export const uploadApi = {
  // 上传文件
  async uploadFile(file: File): Promise<ApiResponse<UploadFileData>> {
    const formData = new FormData()
    formData.append('file', file)

    return httpClient.post<UploadFileData>('/api/upload', formData as any, {
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
      },
    })
  },

  // 上传图片
  async uploadImage(file: File): Promise<ApiResponse<UploadFileData>> {
    const formData = new FormData()
    formData.append('image', file)

    return httpClient.post<UploadFileData>('/api/upload/image', formData as any, {
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
      },
    })
  },
}
