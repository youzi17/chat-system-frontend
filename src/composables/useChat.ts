import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRoleStore } from '@/stores/roles'
import { useAIConfigStore } from '@/stores/aiConfig'
import type { SendMessageParams } from '@/types/chat'

//使用store设计好的函数处理逻辑，实现每个组件的逻辑函数
// 聊天组合式函数
export function useChat() {
  const chatStore = useChatStore()
  const roleStore = useRoleStore()
  const aiConfigStore = useAIConfigStore()

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const params: SendMessageParams = {
      content: content.trim(),
      sessionId: chatStore.currentSession?.id,
      configId: roleStore.currentRole?.configId, // 使用角色关联的AI配置
    }

    try {
      await chatStore.sendMessage(params)
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  // 创建新会话
  const createNewSession = (title?: string) => {
    return chatStore.createSession(title)
  }

  // 选择会话
  const selectSession = (sessionId: string) => {
    chatStore.selectSession(sessionId)
  }

  // 删除会话
  const deleteSession = (sessionId: string) => {
    chatStore.deleteSession(sessionId)
  }

  // 清空当前会话
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
