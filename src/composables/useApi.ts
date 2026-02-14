import { ref, computed } from 'vue'
import { chatApi, uploadApi } from '@/services/api'
import type { ApiResponse } from '@/services/types/api'

// API组合式函数
export function useApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 执行API请求
  const executeRequest = async <T>(
    request: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await request()
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '请求失败'
      console.error('API请求失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 聊天相关API
  const chat = {
    // 发送消息
    async sendMessage(message: string, sessionId?: string, roleId?: string) {
      return executeRequest(() => chatApi.sendMessage(message, sessionId, roleId))
    },

    // 获取会话历史
    async getSessionHistory(sessionId: string) {
      return executeRequest(() => chatApi.getSessionHistory(sessionId))
    },

    // 创建新会话
    async createSession(title?: string) {
      return executeRequest(() => chatApi.createSession(title))
    },

    // 删除会话
    async deleteSession(sessionId: string) {
      return executeRequest(() => chatApi.deleteSession(sessionId))
    },

    // 获取所有会话
    async getSessions() {
      return executeRequest(() => chatApi.getSessions())
    }
  }

  // 文件上传API
  const upload = {
    // 上传文件
    async uploadFile(file: File) {
      return executeRequest(() => uploadApi.uploadFile(file))
    },

    // 上传图片
    async uploadImage(file: File) {
      return executeRequest(() => uploadApi.uploadImage(file))
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    chat,
    upload
  }
}
