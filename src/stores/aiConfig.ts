import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAIConfigService } from '@/services/aiConfigService'
import type { AIConfig, CreateAIConfigRequest } from '@/types/aiConfig'
import {
  saveAIConfigs,
  getAIConfigs,
  saveSelectedConfigId,
  getSelectedConfigId,
} from '@/utils/storage'

/**
 * AI配置状态管理
 */
export const useAIConfigStore = defineStore('aiConfig', () => {
  const configService = useAIConfigService()

  // 状态
  const configs = ref<AIConfig[]>([])
  const selectedConfigId = ref<string>(getSelectedConfigId() || 'default-chat')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const selectedConfig = computed(() => {
    return (
      configs.value.find((config) => config.id === selectedConfigId.value) ||
      configs.value[0] ||
      null
    )
  })

  const defaultConfig = computed(() => {
    return configs.value[0] || null
  })

  /**
   * 初始化AI配置
   */
  const initializeConfigs = async () => {
    isLoading.value = true
    error.value = null

    try {
      // 加载配置
      const configsData = await configService.getAIConfigs()
      configs.value = configsData

      // 从本地存储加载选中的配置ID
      const savedConfigId = getSelectedConfigId()
      if (savedConfigId && configsData.some((config) => config.id === savedConfigId)) {
        selectedConfigId.value = savedConfigId
      } else {
        // 如果没有保存的配置ID或已失效，选择第一个配置
        if (configsData.length > 0 && configsData[0]) {
          selectedConfigId.value = configsData[0].id
        }
      }
      // 保存到本地存储
      saveAIConfigs(configs.value)
    } catch (err) {
      console.error('初始化AI配置失败:', err)
      error.value = '加载AI配置失败，使用本地缓存'

      // 加载本地缓存的配置
      const cachedConfigs = getAIConfigs()
      if (cachedConfigs.length > 0) {
        configs.value = cachedConfigs
        if (!selectedConfigId.value && configs.value.length > 0 && configs.value[0]) {
          selectedConfigId.value = configs.value[0].id
        }
      } else {
        // 加载失败时使用默认配置
        configs.value = configService.getDefaultAIConfig()
          ? [configService.getDefaultAIConfig()]
          : []
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 选择AI配置
   * @param configId 配置ID
   */
  const selectConfig = (configId: string) => {
    if (configs.value.some((config) => config.id === configId)) {
      selectedConfigId.value = configId
      // 保存到本地存储
      saveSelectedConfigId(configId)
    }
  }

  /**
   * 刷新AI配置列表
   */
  const refreshConfigs = async () => {
    isLoading.value = true
    error.value = null

    try {
      configs.value = await configService.getAIConfigs()
    } catch (err) {
      console.error('刷新AI配置列表失败:', err)
      error.value = '刷新AI配置失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建新的AI配置
   * @param configData 配置数据
   */
  const createConfig = async (configData: CreateAIConfigRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const newConfig = await configService.createAIConfig(configData)
      if (newConfig) {
        configs.value.push(newConfig)
        return newConfig
      }
      return null
    } catch (err) {
      console.error('创建AI配置失败:', err)
      error.value = '创建AI配置失败'
      return null
    } finally {
      isLoading.value = false
      // 保存到本地存储
      saveAIConfigs(configs.value)
    }
  }

  /**
   * 更新AI配置
   * @param configId 配置ID
   * @param configData 配置数据
   */
  const updateConfig = async (configId: string, configData: Partial<CreateAIConfigRequest>) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedConfig = await configService.updateAIConfig(configId, configData)
      if (updatedConfig) {
        const index = configs.value.findIndex((config) => config.id === configId)
        if (index !== -1) {
          configs.value[index] = updatedConfig
        }
        return updatedConfig
      }
      return null
    } catch (err) {
      console.error('更新AI配置失败:', err)
      error.value = '更新AI配置失败'
      return null
    } finally {
      isLoading.value = false
      // 保存到本地存储
      saveAIConfigs(configs.value)
    }
  }

  /**
   * 删除AI配置
   * @param configId 配置ID
   */
  const deleteConfig = async (configId: string) => {
    // 不能删除唯一的配置
    if (configs.value.length <= 1) {
      error.value = '至少需要保留一个配置'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const success = await configService.deleteAIConfig(configId)
      if (success) {
        configs.value = configs.value.filter((config) => config.id !== configId)

        // 如果删除的是当前选中的配置，则选择另一个
        if (selectedConfigId.value === configId) {
          const firstConfig = configs.value[0]
          if (firstConfig) {
            selectConfig(firstConfig.id)
          }
        }
        return true
      }
      return false
    } catch (err) {
      console.error('删除AI配置失败:', err)
      error.value = '删除AI配置失败'
      return false
    } finally {
      isLoading.value = false
      // 保存到本地存储
      saveAIConfigs(configs.value)
    }
  }

  /**
   * 根据ID获取配置
   * @param configId 配置ID
   */
  const getConfigById = (configId: string): AIConfig | undefined => {
    return configs.value.find((config) => config.id === configId)
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  // 监听配置变化，自动保存到本地存储
  watch(
    configs,
    (newConfigs) => {
      saveAIConfigs(newConfigs)
    },
    { deep: true },
  )

  watch(selectedConfigId, (newId) => {
    if (newId) {
      saveSelectedConfigId(newId)
    }
  })

  return {
    // 状态
    configs,
    selectedConfigId,
    isLoading,
    error,

    // 计算属性
    selectedConfig,
    defaultConfig,

    // 方法
    initializeConfigs,
    initialize: initializeConfigs, // 兼容别名
    selectConfig,
    refreshConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    getConfigById,
    clearError,
  }
})