import type { PiniaPlugin } from 'pinia'
import { storage } from '../utils/storage'

// 持久化配置接口
export interface PersistOptions {
  key?: string
  paths?: string[]
}

// 默认持久化配置
const defaultOptions: PersistOptions = {
  key: '',
  paths: [],
}

// 生成持久化键名
const getPersistKey = (store: any): string => {
  return store.$options?.persist?.key || `${store.$id}Store`
}

// 获取需要持久化的状态路径
const getPersistPaths = (store: any): string[] => {
  return store.$options?.persist?.paths || []
}

// 过滤状态，只保留需要持久化的部分
const getPersistedState = (state: any, paths: string[]): any => {
  if (!paths || paths.length === 0) {
    return state
  }

  const persistedState: any = {}
  paths.forEach((path) => {
    const pathParts = path.split('.')
    let current = state

    for (const part of pathParts) {
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }

    if (current !== undefined) {
      // 设置嵌套属性
      let target = persistedState
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i] as string
        if (part && !target[part]) target[part] = {}
        if (part) target = target[part]
      }
      const lastPart = pathParts[pathParts.length - 1] as string
      if (lastPart) target[lastPart] = current
    }
  })
  return persistedState
}

// 声明Pinia store选项扩展
declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions
  }
}

// Pinia持久化插件 - 使用函数形式符合Pinia插件标准格式
export const piniaPersist: PiniaPlugin = ({ store }) => {
  // 检查store是否配置了持久化，确保$options存在
  if (!store.$options?.persist) return

  const persistKey = getPersistKey(store)
  const persistPaths = getPersistPaths(store)

  // 初始化时从存储加载数据
  const savedState = storage.get(persistKey)
  if (savedState) {
    try {
      // 使用patch更新状态，避免覆盖整个store
      store.$patch(savedState)
    } catch (error) {
      console.error(`Failed to load persisted state for store ${store.$id}:`, error)
    }
  }

  // 监听状态变化，自动保存
  store.$subscribe(
    (_, state) => {
      try {
        const stateToPersist = getPersistedState(state, persistPaths)
        storage.set(persistKey, stateToPersist)
      } catch (error) {
        console.error(`Failed to persist state for store ${store.$id}:`, error)
      }
    },
    { deep: true },
  )
}

// 辅助函数：生成持久化配置
export const createPersistConfig = (options?: PersistOptions): { persist: PersistOptions } => {
  return { persist: { ...defaultOptions, ...options } }
}