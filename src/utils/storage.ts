import { STORAGE_KEYS } from './constants'
import type { ChatSession } from '../types/chat'
import type { RoleKey } from '../types/role'

// 本地存储工具
export const storage = {
  // 获取数据
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.isSupported()) {
        return defaultValue || null
      }

      const item = localStorage.getItem(key)
      if (!item) return defaultValue || null

      try {
        return JSON.parse(item)
      } catch (parseError) {
        console.error(`Error parsing stored data for key: ${key}`, parseError)
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
      if (!this.isSupported()) {
        return
      }

      const serializedValue = JSON.stringify(value)
      this.checkStorageLimit(key, serializedValue)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error)
    }
  },

  // 检查存储空间限制
  checkStorageLimit(key: string, serializedValue: string): void {
    try {
      const estimatedSize = new Blob([serializedValue]).size
      if (estimatedSize > 4 * 1024 * 1024) {
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
  },
}

// --- 聊天会话存储 ---

export const saveChatSessions = (sessions: ChatSession[]) => {
  storage.set(STORAGE_KEYS.CHAT_SESSIONS, sessions)
}

export const getChatSessions = (): ChatSession[] => {
  return storage.get<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []) || []
}

export const saveCurrentSession = (session: ChatSession) => {
  storage.set(STORAGE_KEYS.CURRENT_SESSION, session)
}

export const getCurrentSession = (): ChatSession | null => {
  return storage.get<ChatSession>(STORAGE_KEYS.CURRENT_SESSION)
}

// --- 角色选择存储（存 RoleKey 字符串） ---

export const saveSelectedRoleKey = (roleKey: RoleKey) => {
  storage.set(STORAGE_KEYS.SELECTED_ROLE, roleKey)
}

export const getSelectedRoleKey = (): RoleKey | null => {
  return storage.get<RoleKey>(STORAGE_KEYS.SELECTED_ROLE)
}

// --- 清理 ---

export const clearAppData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      storage.remove(key)
    })
  } catch (error) {
    console.error('Error clearing app data from storage', error)
  }
}
