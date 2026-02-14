// src/services/api/auth.ts
import type { User } from '../types/user'
import { httpClient } from './base'
import type { ApiResponse } from '../types/api'

// 请求类型
export interface RegisterRequest {
  username: string
  password: string
  displayName?: string
  [key: string]: unknown
}

export interface LoginRequest {
  username: string
  password: string
  [key: string]: unknown
}

// 后端返回结构
export interface LoginResponse {
  token: string
  student: User
  message?: string
}

// 认证服务
export const authService = {
  /**
   * 注册用户
   */
  async register(
    data: RegisterRequest,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await httpClient.post('/auth/register', data as Record<string, unknown>)

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (error) {
      console.error('注册请求失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '注册请求失败',
      }
    }
  },
  /**
   * 用户登录
   */
  async login(
    data: LoginRequest,
  ): Promise<{ success: boolean; data?: LoginResponse; message?: string }> {
    try {
      const response = await httpClient.post<LoginResponse>(
        '/auth/login',
        data as Record<string, unknown>,
      )

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (error) {
      console.error('登录请求失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '登录请求失败',
      }
    }
  },
  /**
   * 获取当前用户信息
   */
  async getProfile(token: string): Promise<{ success: boolean; data?: User; message?: string }> {
    if (!token) {
      console.error('获取用户信息失败: 未检测到登录状态')
      return {
        success: false,
        message: '未检测到登录状态，请先登录！',
      }
    }

    try {
      const response = await httpClient.get<User>('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return {
        success: true,
        data: response.data,
        message: response.message,
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取用户信息失败',
      }
    }
  },
}