// src/stores/chat.ts — 聊天状态管理，roleKey 驱动
import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import type { ChatState, ChatMessage, ChatSession, SendMessageParams } from '@/types/chat'
import type { RoleKey } from '@/types/role'
import { generateId } from '@/utils/helpers'
import { useAuthStore } from './auth'
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
  const aiChatService = useAIChatService()

  // 状态
  const state = ref<ChatState>({
    currentSession: null,
    sessions: [],
    isLoading: false,
    error: null,
  })

  const isSaving = ref(false)

  // 计算属性
  const currentSession = computed(() => state.value.currentSession)
  const sessions = computed(() => state.value.sessions)
  const isLoading = computed(() => state.value.isLoading)
  const error = computed(() => state.value.error)

  /** 按更新时间排序的会话列表 */
  const sortedSessions = computed(() => {
    return [...state.value.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  })

  /** 获取指定角色的会话列表（按更新时间倒序） */
  const getSessionsByRoleKey = (roleKey: RoleKey) => {
    return state.value.sessions
      .filter((s) => s.roleKey === roleKey)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }

  /** 初始化：从 localStorage 加载会话数据 */
  const initialize = () => {
    try {
      const savedSessions = getChatSessions()
      if (savedSessions && Array.isArray(savedSessions)) {
        state.value.sessions = savedSessions.slice(0, CHAT_LIMITS.MAX_SESSIONS)
      }

      const savedCurrentSession = getCurrentSession()
      if (savedCurrentSession && savedCurrentSession.id) {
        const sessionExists = state.value.sessions.some((s) => s.id === savedCurrentSession.id)
        if (sessionExists) {
          state.value.currentSession = savedCurrentSession
        } else if (state.value.sessions.length > 0) {
          state.value.currentSession = state.value.sessions[0] || null
        }
      }
    } catch (e) {
      console.error('初始化聊天数据失败:', e)
      state.value.sessions = []
    }
  }

  /** 创建新会话 */
  const createSession = (title: string = '新对话', roleKey: RoleKey) => {
    // 会话数量限制
    if (state.value.sessions.length >= CHAT_LIMITS.MAX_SESSIONS) {
      state.value.sessions = state.value.sessions.slice(-(CHAT_LIMITS.MAX_SESSIONS - 1))
    }

    const session: ChatSession = {
      id: generateId(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      roleKey,
    }

    state.value.sessions.unshift(session)
    state.value.currentSession = session
    throttledSaveToLocalStorage()

    return session
  }

  /** 选择会话 */
  const selectSession = (sessionId: string) => {
    const session = state.value.sessions.find((s) => s.id === sessionId)
    if (session) {
      state.value.currentSession = session
      saveCurrentSessionToStorage()
    }
  }

  /** 删除会话 */
  const deleteSession = (sessionId: string) => {
    const index = state.value.sessions.findIndex((s) => s.id === sessionId)
    if (index > -1) {
      state.value.sessions.splice(index, 1)
      if (state.value.currentSession?.id === sessionId) {
        state.value.currentSession = state.value.sessions[0] || null
      }
      saveToLocalStorage()
    }
  }

  /** 添加消息到当前会话 */
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>, roleKey?: RoleKey) => {
    if (!state.value.currentSession && roleKey) {
      createSession('新对话', roleKey)
    } else if (!state.value.currentSession) {
      return null
    }

    // 消息数量限制
    if (state.value.currentSession!.messages.length >= CHAT_LIMITS.MAX_MESSAGES_PER_SESSION) {
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
    throttledSaveToLocalStorage()

    return newMessage
  }

  /** 发送消息（核心方法） */
  const sendMessage = async (params: SendMessageParams) => {
    if (!params.content.trim()) return

    state.value.isLoading = true
    state.value.error = null

    try {
      const { roleKey } = params

      // 添加用户消息
      const userMessage = addMessage({ content: params.content, role: 'user' }, roleKey)
      if (!userMessage) return null

      // 创建 AI 回复占位符
      const aiMessage = addMessage({ content: '', role: 'assistant' }, roleKey)
      if (!aiMessage) return null

      if (authStore.isAuthenticated && authStore.token) {
        try {
          // 调用 AI 服务，传入后端 sessionId 以续接会话
          const backendSessionId = state.value.currentSession?.backendSessionId
          const result = await aiChatService.sendChatRequest(
            params.content,
            roleKey,
            backendSessionId,
          )

          // 保存后端返回的 sessionId
          if (state.value.currentSession) {
            state.value.currentSession.backendSessionId = result.sessionId
          }

          // 更新 AI 消息内容
          updateMessageContent(aiMessage.id, aiChatService.formatAIResponse(result.response))
        } catch (err) {
          console.error('获取 AI 回复失败:', err)
          updateMessageContent(
            aiMessage.id,
            `很抱歉，无法获取 AI 回复。\n\n错误原因: ${err instanceof Error ? err.message : '未知错误'}`,
            true,
          )
          state.value.error = '获取 AI 回复失败'
        }
      } else {
        // 未登录：模拟回复
        await new Promise((resolve) => setTimeout(resolve, 1000))
        updateMessageContent(
          aiMessage.id,
          `这是 AI 的模拟回复：${params.content}\n\n提示：登录后可使用真实 AI 对话功能。`,
        )
      }

      return { userMessage, aiMessage }
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : '发送消息失败'
      throw err
    } finally {
      state.value.isLoading = false
    }
  }

  /** 更新指定消息的内容 */
  const updateMessageContent = (messageId: string, content: string, isError = false) => {
    const session = state.value.currentSession
    if (!session) return

    const msg = session.messages.find((m) => m.id === messageId)
    if (msg) {
      msg.content = content
      msg.isError = isError
      session.updatedAt = Date.now()
    }
  }

  /** 清空当前会话消息 */
  const clearCurrentSession = () => {
    if (state.value.currentSession) {
      state.value.currentSession.messages = []
      state.value.currentSession.backendSessionId = undefined
      state.value.currentSession.updatedAt = Date.now()
      throttledSaveToLocalStorage()
    }
  }

  /** 更新会话标题 */
  const updateSessionTitle = (sessionId: string, title: string) => {
    const session = state.value.sessions.find((s) => s.id === sessionId)
    if (session) {
      session.title = title
      session.updatedAt = Date.now()
      throttledSaveToLocalStorage()
    }
  }

  // --- 本地存储 ---

  const saveToLocalStorage = () => {
    if (isSaving.value) return
    try {
      isSaving.value = true
      saveChatSessions(state.value.sessions)
      if (state.value.currentSession) {
        saveCurrentSession(state.value.currentSession)
      }
    } catch (e) {
      console.error('保存聊天数据失败:', e)
    } finally {
      isSaving.value = false
    }
  }

  const saveCurrentSessionToStorage = () => {
    if (state.value.currentSession) {
      try {
        saveCurrentSession(state.value.currentSession)
      } catch (e) {
        console.error('保存当前会话失败:', e)
      }
    }
  }

  let saveTimeout: number | null = null
  const throttledSaveToLocalStorage = () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = window.setTimeout(() => {
      saveToLocalStorage()
      saveTimeout = null
    }, 500)
  }

  const clearError = () => {
    state.value.error = null
  }

  // 监听会话变化，自动保存
  watch(
    () => state.value.sessions,
    () => {
      nextTick(() => throttledSaveToLocalStorage())
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
    getSessionsByRoleKey,
    clearError,
  }
})
