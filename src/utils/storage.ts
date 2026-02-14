import { STORAGE_KEYS } from './constants'
import type { ChatSession } from '../types/chat'
import type { Role } from '../types/role'
import type { AIConfig } from '../types/aiConfig'

// 本地存储工具
export const storage = {
  // 获取数据
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      // 检查是否支持localStorage
      if (!this.isSupported()) {
        return defaultValue || null
      }
      
      const item = localStorage.getItem(key)
      if (!item) return defaultValue || null
      
      try {
        return JSON.parse(item)
      } catch (parseError) {
        console.error(`Error parsing stored data for key: ${key}`, parseError)
        // 如果解析失败，清除损坏的数据
        localStorage.removeItem(key)
        return defaultValue || null
      }
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return defaultValue || null
    }
  },

  // 设置数据
  set<T>(key: string, value: T): void {
    try {
      // 检查是否支持localStorage
      if (!this.isSupported()) {
        return
      }
      
      // 尝试序列化数据
      const serializedValue = JSON.stringify(value)
      
      // 检查localStorage空间是否足够
      this.checkStorageLimit(key, serializedValue)
      
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error)
    }
  },
  
  // 检查存储空间限制
  checkStorageLimit(key: string, serializedValue: string): void {
    try {
      // 预估存储大小（粗略计算）
      const estimatedSize = new Blob([serializedValue]).size
      
      // 预留一些空间，避免达到存储上限
      if (estimatedSize > 4 * 1024 * 1024) { // 4MB 限制
        console.warn(`Data for key ${key} may exceed localStorage limits: ${estimatedSize} bytes`)
      }
    } catch (error) {
      console.error('Error checking storage limit', error)
    }
  },

  // 删除数据
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error)
    }
  },

  // 清空所有数据
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage', error)
    }
  },

  // 检查是否支持
  isSupported(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}

// 会话存储
export const sessionStorage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`Error getting item from sessionStorage: ${key}`, error)
      return defaultValue || null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item to sessionStorage: ${key}`, error)
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from sessionStorage: ${key}`, error)
    }
  },

  clear(): void {
    try {
      window.sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing sessionStorage', error)
    }
  }
}

// 存储聊天会话
export const saveChatSessions = (sessions: ChatSession[]) => {
  storage.set(STORAGE_KEYS.CHAT_SESSIONS, sessions)
}

// 获取聊天会话
export const getChatSessions = (): ChatSession[] => {
  return storage.get<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []) || []
}

// 存储当前会话
export const saveCurrentSession = (session: ChatSession) => {
  storage.set(STORAGE_KEYS.CURRENT_SESSION, session)
}

// 获取当前会话
export const getCurrentSession = (): ChatSession | null => {
  return storage.get<ChatSession>(STORAGE_KEYS.CURRENT_SESSION)
}

// 存储选中的角色
export const saveSelectedRole = (role: Role) => {
  storage.set(STORAGE_KEYS.SELECTED_ROLE, role)
}

// 获取选中的角色
export const getSelectedRole = (): Role | null => {
  return storage.get<Role>(STORAGE_KEYS.SELECTED_ROLE)
}

// 存储AI配置列表
export const saveAIConfigs = (configs: AIConfig[]) => {
  storage.set(STORAGE_KEYS.AI_CONFIGS, configs)
}

// 获取AI配置列表
export const getAIConfigs = (): AIConfig[] => {
  return storage.get<AIConfig[]>(STORAGE_KEYS.AI_CONFIGS, []) || []
}

// 存储选中的AI配置ID
export const saveSelectedConfigId = (configId: string) => {
  storage.set(STORAGE_KEYS.SELECTED_CONFIG_ID, configId)
}

// 获取选中的AI配置ID
export const getSelectedConfigId = (): string | null => {
  return storage.get<string>(STORAGE_KEYS.SELECTED_CONFIG_ID)
}

// 批量清除应用相关的存储数据
export const clearAppData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.remove(key)
    })
  } catch (error) {
    console.error('Error clearing app data from storage', error)
  }
}
