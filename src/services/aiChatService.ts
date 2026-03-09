import { aiChatService as apiService } from './api/aiChat'
import { useAuthStore } from '@/stores/auth'
import type { RoleKey } from '@/types/role'

/**
 * AI 聊天服务
 * 封装 API 调用，处理认证和响应解析
 */
export const useAIChatService = () => {
  const authStore = useAuthStore()

  /**
   * 发送 AI 聊天请求
   * @param message 用户消息
   * @param roleKey 角色键值
   * @param sessionId 后端会话 ID（可选，续接会话时传入）
   * @returns { response, sessionId }
   */
  const sendChatRequest = async (
    message: string,
    roleKey: RoleKey,
    sessionId?: string,
  ): Promise<{ response: string; sessionId: string }> => {
    if (!authStore.token) {
      throw new Error('用户未登录')
    }

    const result = await apiService.sendMessage(
      { roleKey, message, sessionId },
      authStore.token,
    )

    if (!result.success || !result.data) {
      throw new Error(result.message || 'AI 请求失败')
    }

    if (result.data.response && result.data.sessionId) {
      return { response: result.data.response, sessionId: result.data.sessionId }
    }

    throw new Error('AI 响应格式不正确')
  }

  /**
   * 格式化 AI 回复内容
   */
  const formatAIResponse = (content: string): string => {
    return content.trim()
  }

  return {
    sendChatRequest,
    formatAIResponse,
  }
}
