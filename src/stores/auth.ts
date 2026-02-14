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
      console.log('登录API请求数据:', credentials)
      const response = await authService.login(credentials)
      console.log('登录API响应:', response)

      // 检查登录是否成功
      if (response.success && response.data) {
        const loginData = response.data

        // 检查是否有token字段
        if (loginData.token) {
          token.value = loginData.token

          // 根据实际后端响应结构设置用户信息
          // 检查是否有student字段
          if (loginData.student) {
            user.value = loginData.student
          } else {
            // 如果没有明确的用户信息，创建一个基本用户对象
            user.value = { username: credentials.username } as User
          }

          // 保存到本地存储
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token.value)
          storage.set(STORAGE_KEYS.USER_INFO, user.value)

          console.log('登录成功，token已保存')
          return true
        } else {
          const errorMsg = '登录响应缺少token字段'
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
      console.log('注册API请求数据:', userData)
      const response = await authService.register(userData)
      console.log('注册API响应:', response)

      // 根据后端响应判断注册是否成功
      if (response.success) {
        console.log('注册成功，准备自动登录')
        // 注册成功后自动登录
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
      console.log('未检测到登录状态，无需验证')
      return false
    }

    isLoading.value = true

    try {
      console.log('开始验证令牌有效性...')
      const response = await authService.getProfile(token.value)
      console.log('令牌验证响应:', response)

      if (response.success && response.data) {
        // 如果有message字段但success为true，可能是服务器返回的提示信息
        if (response.message) {
          console.log('令牌验证成功，但服务器返回提示:', response.message)
        }

        // 更新用户信息
        user.value = response.data
        storage.set(STORAGE_KEYS.USER_INFO, user.value)
        console.log('令牌验证成功，用户信息已更新')
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