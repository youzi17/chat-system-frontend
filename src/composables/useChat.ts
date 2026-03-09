// composables/useChat.ts — 聊天业务逻辑组合式函数
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoleStore } from '@/stores/roles'
import type { SendMessageParams } from '@/types/chat'

export function useChat() {
  const chatStore = useChatStore()
  const roleStore = useRoleStore()

  /** 发送消息（自动使用当前角色的 roleKey） */
  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    if (!roleStore.currentRoleKey) {
      console.error('未选择角色，无法发送消息')
      return
    }

    const params: SendMessageParams = {
      content: content.trim(),
      roleKey: roleStore.currentRoleKey,
    }

    try {
      await chatStore.sendMessage(params)
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  /** 创建新会话（使用当前角色） */
  const createNewSession = (title?: string) => {
    if (!roleStore.currentRoleKey) return null
    return chatStore.createSession(title, roleStore.currentRoleKey)
  }

  /** 选择会话 */
  const selectSession = (sessionId: string) => {
    chatStore.selectSession(sessionId)
  }

  /** 删除会话 */
  const deleteSession = (sessionId: string) => {
    chatStore.deleteSession(sessionId)
  }

  /** 清空当前会话 */
  const clearCurrentSession = () => {
    chatStore.clearCurrentSession()
  }

  return {
    // 状态
    currentSession: computed(() => chatStore.currentSession),
    sessions: computed(() => chatStore.sessions),
    isLoading: computed(() => chatStore.isLoading),
    error: computed(() => chatStore.error),

    // 方法
    sendMessage,
    createNewSession,
    selectSession,
    deleteSession,
    clearCurrentSession,
  }
}
