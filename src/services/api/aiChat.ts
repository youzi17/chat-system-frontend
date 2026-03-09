import { httpClient } from './base'
import type { ApiResponse } from '../types/api'
import type { ChatRequest, ChatResponse } from '../../types/chat'

/** AI 对话 API 服务 */
export const aiChatService = {
  /**
   * 发送消息给 AI（需要 JWT token）
   * 请求体与后端 SendMessageDto 对齐：{ roleKey, message, sessionId? }
   */
  async sendMessage(data: ChatRequest, token: string): Promise<ApiResponse<ChatResponse>> {
    return httpClient.post<ChatResponse>('/api/ai', data as unknown as Record<string, unknown>, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
