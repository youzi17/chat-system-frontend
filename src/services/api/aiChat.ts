import { httpClient } from './base'
import type { ApiResponse } from '../types/api'
import type { AIChatRequest, AIChatResponse } from '../../types/aiConfig'

// AI对话服务
export const aiChatService = {
  // 发送消息给AI（需要携带配置ID和JWT token）
  async sendMessage(data: AIChatRequest, token: string): Promise<ApiResponse<AIChatResponse>> {
    return httpClient.post<AIChatResponse>('/api/ai', data as unknown as Record<string, unknown>, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
