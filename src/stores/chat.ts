import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import type { ChatState, ChatMessage, ChatSession, SendMessageParams } from '@/types/chat'
import { generateId } from '@/utils/helpers'
import { useAuthStore } from './auth'
import { useAIConfigStore } from './aiConfig'
import { useAIChatService } from '@/services/aiChatService'
import {
  saveChatSessions,
  getChatSessions,
  saveCurrentSession,
  getCurrentSession,
} from '@/utils/storage'
import { CHAT_LIMITS } from '@/utils/constants'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const aiConfigStore = useAIConfigStore()
  const aiChatService = useAIChatService()

  // 状态
  const state = ref<ChatState>({
    currentSession: null,
    sessions: [],
    isLoading: false,
    error: null,
  })

  const isSaving = ref(false) // 用于跟踪保存状态，避免频繁写入

  // 计算属性
  const currentSession = computed(() => state.value.currentSession)
  const sessions = computed(() => state.value.sessions)
  const isLoading = computed(() => state.value.isLoading)
  const error = computed(() => state.value.error)

  // 计算属性：按更新时间排序的会话列表
  const sortedSessions = computed(() => {
    return [...state.value.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  // 初始化数据
  const initialize = () => {
    // 从本地存储加载会话数据
    try {
      const savedSessions = getChatSessions()
      if (savedSessions && Array.isArray(savedSessions)) {
        // 应用会话数量限制
        state.value.sessions = savedSessions.slice(0, CHAT_LIMITS.MAX_SESSIONS)
      }

      // 从本地存储加载当前会话
      const savedCurrentSession = getCurrentSession()
      if (savedCurrentSession && savedCurrentSession.id) {
        // 确保当前会话ID在会话列表中存在
        const sessionExists = state.value.sessions.some((s) => s.id === savedCurrentSession.id)
        if (sessionExists) {
          state.value.currentSession = savedCurrentSession
        } else if (state.value.sessions.length > 0) {
          state.value.currentSession = state.value.sessions[0] || null
        }
      } else if (state.value.sessions.length > 0) {
        state.value.currentSession = state.value.sessions[0] || null
      }
    } catch (e) {
      console.error('Failed to initialize chat store:', e)
      state.value.sessions = []
    }
  }

  // 根据角色ID获取会话列表
  const getSessionsByRoleId = computed(() => {
    return (roleId: string) => {
      return state.value.sessions.filter((session) => session.roleId === roleId)
    }
  })

  // 创建新会话
  const createSession = (title: string = '新对话', roleId: string = '') => {
    // 应用会话数量限制
    if (state.value.sessions.length >= CHAT_LIMITS.MAX_SESSIONS) {
      // 删除最旧的会话
      state.value.sessions = state.value.sessions.slice(-(CHAT_LIMITS.MAX_SESSIONS - 1))
    }

    const session: ChatSession = {
      id: generateId(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      roleId,
    }

    state.value.sessions.unshift(session)
    state.value.currentSession = session

    // 使用节流保存
    throttledSaveToLocalStorage()

    return session
  }

  // 选择会话
  const selectSession = (sessionId: string) => {
    const session = state.value.sessions.find((s) => s.id === sessionId)
    if (session) {
      state.value.currentSession = session
      // 立即保存当前会话选择
      saveCurrentSessionToStorage()
    }
  }

  // 删除会话
  const deleteSession = (sessionId: string) => {
    const index = state.value.sessions.findIndex((s) => s.id === sessionId)
    if (index > -1) {
      state.value.sessions.splice(index, 1)
      if (state.value.currentSession?.id === sessionId) {
        state.value.currentSession = state.value.sessions[0] || null
      }

      // 立即保存更改（删除操作应该立即持久化）
      saveToLocalStorage()
    }
  }

  // 添加消息
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>, roleId?: string) => {
    if (!state.value.currentSession && roleId) {
      createSession('新对话', roleId)
    } else if (!state.value.currentSession) {
      // 如果没有提供roleId且没有当前会话，创建一个临时会话
      // 这种情况应该避免，但为了兼容性保留
      return null
    }

    // 应用消息数量限制
    if (state.value.currentSession!.messages.length >= CHAT_LIMITS.MAX_MESSAGES_PER_SESSION) {
      // 删除最旧的消息
      state.value.currentSession!.messages = state.value.currentSession!.messages.slice(
        -(CHAT_LIMITS.MAX_MESSAGES_PER_SESSION - 1),
      )
    }

    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    }

    state.value.currentSession!.messages.push(newMessage)
    state.value.currentSession!.updatedAt = Date.now()

    // 使用节流保存，避免频繁写入
    throttledSaveToLocalStorage()

    return newMessage
  }

  // 发送消息
  const sendMessage = async (params: SendMessageParams) => {
    if (!params.content.trim()) return

    state.value.isLoading = true
    state.value.error = null

    try {
      // 获取当前会话的roleId
      const roleId = state.value.currentSession?.roleId

      if (!roleId) {
        throw new Error('没有选择角色，无法发送消息')
      }

      // 添加用户消息
      const userMessage = addMessage(
        {
          content: params.content,
          role: 'user',
        },
        roleId,
      )

      if (!userMessage) return null

      // 创建AI回复消息占位符
      const aiMessage = addMessage(
        {
          content: '',
          role: 'assistant',
        },
        roleId,
      )

      if (!aiMessage) return null

      // 根据登录状态决定使用真实API还是模拟回复
      if (authStore.isAuthenticated && authStore.token) {
        // 用户已登录，使用真实AI API
        try {
          // 获取AI配置 - 优先使用params.configId指定的配置
          const configId = params.configId || aiConfigStore.selectedConfigId
          const selectedConfig =
            aiConfigStore.getConfigById(configId) || aiConfigStore.selectedConfig

          // 调用AI聊天服务获取回复
          const aiResponse = await aiChatService.sendChatRequest(params.content, configId)

          // 更新AI消息内容
          const session = state.value.currentSession
          if (
            session &&
            session.messages &&
            Array.isArray(session.messages) &&
            session.messages.length > 0
          ) {
            const index = session.messages.findIndex((m) => m.id === aiMessage.id)
            if (index !== -1 && index < session.messages.length && session.messages[index]) {
              const message = session.messages[index]
              message.content = aiChatService.formatAIResponse(aiResponse)
              session.updatedAt = Date.now()
            }
          }
        } catch (err) {
          console.error('获取AI回复失败:', err)
          // 更新错误消息
          const session = state.value.currentSession
          if (
            session &&
            session.messages &&
            Array.isArray(session.messages) &&
            session.messages.length > 0
          ) {
            const index = session.messages.findIndex((m) => m.id === aiMessage.id)
            if (index !== -1 && index < session.messages.length && session.messages[index]) {
              const message = session.messages[index]
              message.content = `很抱歉，无法获取AI回复。\n\n错误原因: ${err instanceof Error ? err.message : '未知错误'}`
              message.isError = true
              session.updatedAt = Date.now()
            }
          }
          state.value.error = '获取AI回复失败'
        }
      } else {
        // 未登录状态下使用模拟回复
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 更新现有消息而不是添加新消息
        const session = state.value.currentSession
        if (
          session &&
          session.messages &&
          Array.isArray(session.messages) &&
          session.messages.length > 0
        ) {
          const index = session.messages.findIndex((m) => m.id === aiMessage.id)
          if (index !== -1 && index < session.messages.length && session.messages[index]) {
            const message = session.messages[index]
            message.content = `这是AI的模拟回复：${params.content}\n\n提示：登录后可使用真实AI对话功能。`
            session.updatedAt = Date.now()
          }
        }
      }

      return { userMessage, aiMessage }
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : '发送消息失败'
      throw err
    } finally {
      state.value.isLoading = false
    }
  }

  // 清空当前会话
  const clearCurrentSession = () => {
    if (state.value.currentSession) {
      state.value.currentSession.messages = []
      state.value.currentSession.updatedAt = Date.now()
      // 使用节流保存
      throttledSaveToLocalStorage()
    }
  }

  // 更新会话标题
  const updateSessionTitle = (sessionId: string, title: string) => {
    const session = state.value.sessions.find((s) => s.id === sessionId)
    if (session) {
      session.title = title
      session.updatedAt = Date.now()
      // 使用节流保存
      throttledSaveToLocalStorage()
    }
  }

  // 保存到本地存储
  const saveToLocalStorage = () => {
    if (isSaving.value) return // 避免重复保存

    try {
      isSaving.value = true

      // 保存会话列表
      saveChatSessions(state.value.sessions)

      // 保存当前会话
      if (state.value.currentSession) {
        saveCurrentSession(state.value.currentSession)
      }
    } catch (e) {
      console.error('Failed to save chat data to localStorage:', e)
    } finally {
      isSaving.value = false
    }
  }

  // 单独保存当前会话选择
  const saveCurrentSessionToStorage = () => {
    if (state.value.currentSession) {
      try {
        saveCurrentSession(state.value.currentSession)
      } catch (e) {
        console.error('Failed to save current session:', e)
      }
    }
  }

  // 节流保存函数
  let saveTimeout: number | null = null
  const throttledSaveToLocalStorage = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    saveTimeout = window.setTimeout(() => {
      saveToLocalStorage()
      saveTimeout = null
    }, 500) // 500ms节流延迟
  }

  // 清除错误
  const clearError = () => {
    state.value.error = null
  }

  // 刷新角色相关数据
  const refreshRoles = () => {
    // 可以在这里添加角色相关数据的刷新逻辑
    throttledSaveToLocalStorage()
  }

  // 监听会话变化，自动保存（使用nextTick确保DOM更新后再保存）
  watch(
    () => state.value.sessions,
    () => {
      nextTick(() => {
        throttledSaveToLocalStorage()
      })
    },
    { deep: true },
  )

  return {
    // 状态
    currentSession,
    sessions,
    sortedSessions,
    isLoading,
    error,

    // 方法
    initialize,
    createSession,
    selectSession,
    deleteSession,
    addMessage,
    sendMessage,
    clearCurrentSession,
    updateSessionTitle,
    refreshRoles,
    clearError,
  }
})
