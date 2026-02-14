import { httpClient } from './base'
import type { ApiResponse } from '../types/api'
import type { AIConfig, CreateAIConfigRequest } from '../../types/aiConfig'

// AI配置服务
export const aiConfigService = {
  // 获取当前登录学员的所有AI配置
  async getAllConfigs(token: string): Promise<ApiResponse<AIConfig[]>> {
    return httpClient.get<AIConfig[]>('/ai-configs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // 创建新的AI配置（系统会自动绑定当前学员）
  async createConfig(data: CreateAIConfigRequest, token: string): Promise<ApiResponse<AIConfig>> {
    return httpClient.post<AIConfig>('/ai-configs', data as unknown as Record<string, unknown>, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // 获取指定AI配置
  async getConfig(id: string, token: string): Promise<ApiResponse<AIConfig>> {
    return httpClient.get<AIConfig>(`/ai-configs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // 更新AI配置
  async updateConfig(
    id: string,
    data: Partial<CreateAIConfigRequest>,
    token: string,
  ): Promise<ApiResponse<AIConfig>> {
    return httpClient.put<AIConfig>(
      `/ai-configs/${id}`,
      data as unknown as Record<string, unknown>,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  },

  // 删除AI配置
  async deleteConfig(id: string, token: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpClient.delete<{ success: boolean }>(`/ai-configs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}