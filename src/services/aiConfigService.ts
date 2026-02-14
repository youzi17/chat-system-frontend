import type { AIConfig, CreateAIConfigRequest } from '@/types/aiConfig'
import { aiConfigService as apiService } from './api/aiConfig'
import { useAuthStore } from '@/stores/auth'
//import api from './api'
/**
 * AI配置服务
 */
export const useAIConfigService = () => {
  const authStore = useAuthStore()

  /**
   * 获取所有AI配置列表
   * @returns Promise<AIConfig[]>
   */
  const getAIConfigs = async (): Promise<AIConfig[]> => {
    try {
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      const response = await apiService.getAllConfigs(authStore.token)
      return response.data || []
    } catch (error) {
      console.error('获取AI配置列表失败:', error)
      // 如果API调用失败，返回一些默认配置作为备用
      return getDefaultConfigs()
    }
  }

  /**
   * 获取单个AI配置详情
   * @param configId 配置ID
   * @returns Promise<AIConfig | null>
   */
  const getAIConfigById = async (configId: string): Promise<AIConfig | null> => {
    try {
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      const response = await apiService.getConfig(configId, authStore.token)
      return response.data
    } catch (error) {
      console.error(`获取AI配置 ${configId} 失败:`, error)
      // 如果找不到特定配置，返回默认配置
      return getDefaultConfigById(configId)
    }
  }

  /**
   * 创建AI配置
   * @param config 配置信息
   * @returns Promise<AIConfig | null>
   */
  const createAIConfig = async (config: CreateAIConfigRequest): Promise<AIConfig | null> => {
    try {
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      const response = await apiService.createConfig(config, authStore.token)
      return response.data
    } catch (error) {
      console.error('创建AI配置失败:', error)
      return null
    }
  }

  /**
   * 更新AI配置
   * @param configId 配置ID
   * @param config 更新的配置信息
   * @returns Promise<AIConfig | null>
   */
  const updateAIConfig = async (
    configId: string,
    config: Partial<CreateAIConfigRequest>,
  ): Promise<AIConfig | null> => {
    try {
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      const response = await apiService.updateConfig(configId, config, authStore.token)
      return response.data
    } catch (error) {
      console.error(`更新AI配置 ${configId} 失败:`, error)
      return null
    }
  }

  /**
   * 删除AI配置
   * @param configId 配置ID
   * @returns Promise<boolean>
   */
  const deleteAIConfig = async (configId: string): Promise<boolean> => {
    try {
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      const response = await apiService.deleteConfig(configId, authStore.token)
      return response.data?.success || false
    } catch (error) {
      console.error(`删除AI配置 ${configId} 失败:`, error)
      return false
    }
  }

  /**
   * 获取默认配置列表
   * 当API失败时作为备用方案
   * @returns 默认配置列表
   */
  const getDefaultConfigs = (): AIConfig[] => {
    return [
      {
        id: 'default',
        name: '默认配置',
        studentName: '系统默认', // ✅ 必须加，否则类型不匹配
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'programmer',
        name: '程序员助手',
        studentName: '系统默认',
        model: 'gpt-4-turbo',
        temperature: 0.5,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'writer',
        name: '写作助手',
        studentName: '系统默认',
        model: 'gpt-4',
        temperature: 0.8,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mentor',
        name: 'AI导师',
        studentName: '系统默认',
        model: 'gpt-3.5-turbo',
        temperature: 0.9,
        createdAt: new Date().toISOString(),
      },
    ]
  }

  const getDefaultConfigById = (configId: string): AIConfig | null => {
    const configs = getDefaultConfigs()
    return configs.find((config) => config.id === configId) || configs[0] || null
  }

  /**
   * 获取默认AI配置
   * @returns 默认AI配置
   */
  const getDefaultAIConfig = (): AIConfig => {
    const configs = getDefaultConfigs()
    const defaultConfig = configs[0]

    if (!defaultConfig) {
      return {
        id: 'fallback-config',
        name: '兜底配置',
        model: 'gpt-3.5-turbo',
        studentName: '系统',
        temperature: 0.7,
        createdAt: new Date().toISOString(),
      }
    }
    return defaultConfig
  }

  return {
    getAIConfigs,
    getAIConfigById,
    createAIConfig,
    updateAIConfig,
    deleteAIConfig,
    getDefaultAIConfig,
  }
}
