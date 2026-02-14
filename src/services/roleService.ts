// services/roleService.ts

import { useAIConfigService } from './aiConfigService'
import type { Role } from '@/types/role'

export const useRoleService = () => {
  const { getAIConfigs } = useAIConfigService()

  /**
   * 获取角色列表（仅 id, name, createdAt）
   */
  const getRoles = async (): Promise<Role[]> => {
    try {
      const configs = await getAIConfigs()
      return configs.map(config => ({
        id: config.id,
        name: config.name,
        createdAt: config.createdAt
      })) as Role[]
    } catch (error) {
      console.error('加载角色列表失败', error)
      return []
    }
  }

  /**
   * 默认角色（兜底）
   */
  const getDefaultRole = (): Role => {
    return {
      id: 'default',
      name: '默认助手',
      createdAt: new Date().toISOString()
    } as Role
  }

  return {
    getRoles,
    getDefaultRole
  }
}