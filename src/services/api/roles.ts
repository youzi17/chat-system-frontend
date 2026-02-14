import { httpClient } from './base'
import type { ApiResponse } from '../types/api'
import type { Role } from '../../types/role'

// 角色列表响应数据结构
interface RoleListData {
  roles: Role[]
}

// 角色API
export const roleApi = {
  // 获取所有角色
  async getRoles(): Promise<ApiResponse<RoleListData>> {
    return httpClient.get<RoleListData>('/api/roles')
  },

  // 获取角色详情
  async getRole(roleId: string): Promise<ApiResponse<Role>> {
    return httpClient.get<Role>(`/api/roles/${roleId}`)
  },

  // 创建自定义角色
  async createRole(roleData: {
    name: string
    description: string
    avatar: string
    systemPrompt: string
    category?: string
  }): Promise<ApiResponse<Role>> {
    return httpClient.post<Role>('/api/roles', roleData)
  },

  // 更新角色
  async updateRole(roleId: string, roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    return httpClient.put<Role>(`/api/roles/${roleId}`, roleData)
  },

  // 删除角色
  async deleteRole(roleId: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpClient.delete<{ success: boolean }>(`/api/roles/${roleId}`)
  },

  // 获取角色分类
  async getRoleCategories(): Promise<ApiResponse<string[]>> {
    return httpClient.get<string[]>('/api/roles/categories')
  },
}
