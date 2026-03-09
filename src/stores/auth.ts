import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { authService, type LoginRequest, type RegisterRequest } from '../services/api'
import type { User } from '../services/types/user'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  const toRecord = (value: unknown): Record<string, unknown> | null => {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
  }

  const getObjectKeys = (value: unknown): string => {
    const record = toRecord(value)
    if (!record) return 'none'
    const keys = Object.keys(record)
    return keys.length > 0 ? keys.join(', ') : 'none'
  }

  const extractAuthPayload = (
    payload: unknown,
  ): { authToken: string; authUser: User } | null => {
    const root = toRecord(payload)
    if (!root) return null

    const candidates = [root, toRecord(root.data), toRecord(root.result)].filter(
      (item): item is Record<string, unknown> => item !== null,
    )

    for (const candidate of candidates) {
      const tokenCandidate =
        candidate.token ?? candidate.accessToken ?? candidate.jwt ?? candidate.authToken
      const userCandidate = candidate.user ?? candidate.profile ?? candidate.currentUser

      if (typeof tokenCandidate === 'string' && toRecord(userCandidate)) {
        return {
          authToken: tokenCandidate,
          authUser: userCandidate as User,
        }
      }
    }

    return null
  }

  const setAuthState = (authToken: string, authUser: User) => {
    token.value = authToken
    user.value = authUser
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token.value)
    storage.set(STORAGE_KEYS.USER_INFO, user.value)
  }

  // 从本地存储初始化状态
  const initAuth = () => {
    try {
      const savedToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN)
      const savedUser = storage.get<User>(STORAGE_KEYS.USER_INFO)

      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = savedUser
      }
    } catch (err) {
      console.error('Failed to initialize auth state:', err)
      logout()
    }
  }

  // 登录
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      // 检查登录是否成功
      if (response.success && response.data) {
        const authPayload = extractAuthPayload(response.data)
        if (authPayload) {
          setAuthState(authPayload.authToken, authPayload.authUser)
          return true
        } else {
          const errorMsg =
            response.message ||
            `登录响应缺少必要字段(token/user)，实际字段: ${getObjectKeys(response.data)}`
          error.value = errorMsg
          console.error(errorMsg)
          return false
        }
      } else {
        const errorMsg = response.message || '登录失败'
        error.value = errorMsg
        console.error('登录失败:', errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '登录失败'
      error.value = errorMsg
      console.error('登录API调用错误:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.register(userData)

      // 根据后端响应判断注册是否成功
      if (response.success && response.data) {
        const authPayload = extractAuthPayload(response.data)
        if (authPayload) {
          setAuthState(authPayload.authToken, authPayload.authUser)
          return true
        }

        // 注册成功后自动登录
        return await login({
          username: userData.username,
          password: userData.password,
        })
      } else if (response.success) {
        // 兼容仅返回成功状态但不返回数据的后端
        return await login({
          username: userData.username,
          password: userData.password,
        })
      } else {
        const errorMsg = response.message || '注册失败'
        error.value = errorMsg
        console.error('注册失败:', errorMsg)
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '注册失败'
      error.value = errorMsg
      console.error('注册API调用错误:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  const logout = () => {
    user.value = null
    token.value = null
    error.value = null

    // 清除本地存储
    storage.remove(STORAGE_KEYS.AUTH_TOKEN)
    storage.remove(STORAGE_KEYS.USER_INFO)
  }

  // 验证令牌有效性
  const validateToken = async () => {
    if (!token.value) {
      return false
    }

    isLoading.value = true

    try {
      const response = await authService.getProfile(token.value)

      if (response.success && response.data) {
        // 更新用户信息
        user.value = response.data
        storage.set(STORAGE_KEYS.USER_INFO, user.value)
        return true
      } else {
        // 验证失败，记录错误信息并登出
        console.error('令牌验证失败:', response.message || '未知错误')
        logout()
        return false
      }
    } catch (err) {
      console.error('令牌验证请求异常:', err)
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 获取认证头
  const getAuthHeaders = computed(() => {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    return headers
  })

  return {
    // 状态
    user,
    token,
    isLoading,
    error,

    // 计算属性
    isAuthenticated,
    currentUser,
    getAuthHeaders,

    // 方法
    initAuth,
    login,
    register,
    logout,
    validateToken,
  }
})
