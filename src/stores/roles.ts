// src/stores/roles.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role } from '@/types/role'
import { useChatStore } from './chat'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'
import { useRoleService } from '@/services/roleService'

/**
 * 角色管理 Store
 * 负责：
 * - 加载角色列表（用户配置 + 默认）
 * - 管理当前选中角色
 * - 处理加载状态与错误
 */
export const useRoleStore = defineStore('role', () => {
  const roleService = useRoleService()

  const state = ref<{
    roles: Role[]
    currentRole: Role | null
    isLoading: boolean
    error: string | null
  }>({
    roles: [],
    currentRole: null,
    isLoading: false,
    error: null,
  })

  // 计算属性：暴露只读状态
  const roles = computed(() => state.value.roles)
  const currentRole = computed(() => state.value.currentRole)
  const isLoading = computed(() => state.value.isLoading)
  const error = computed(() => state.value.error)

  /**
   * 初始化角色列表
   * 在应用启动时调用一次
   */
  const initializeRoles = async () => {
    if (state.value.roles.length > 0) return

    state.value.isLoading = true
    state.value.error = null

    try {
      const roles = await roleService.getRoles()
      state.value.roles = roles.length > 0 ? roles : [roleService.getDefaultRole()]

      const saved = storage.get<Role>(STORAGE_KEYS.SELECTED_ROLE)
      state.value.currentRole = saved || state.value.roles[0] || null
    } catch (err) {
      console.warn('加载角色失败，使用默认角色兜底', err)
      const defaultRole = roleService.getDefaultRole()
      state.value.roles = [defaultRole]
      state.value.currentRole = defaultRole
      state.value.error = '加载角色失败'
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * 选择一个角色
   * 切换并跳转到对应对话
   */
  const selectRole = (roleId: string) => {
    const role = state.value.roles.find((r) => r.id === roleId)
    if (!role) return

    state.value.currentRole = role
    storage.set(STORAGE_KEYS.SELECTED_ROLE, role)

    const chatStore = useChatStore()
    const roleSessions = chatStore.sessions?.filter((s) => s.roleId === roleId) || []

    if (roleSessions.length > 0 && roleSessions[0]) {
      chatStore.selectSession(roleSessions[0].id)
    } else {
      chatStore.createSession(`${role.name}的对话`, roleId)
    }
  }

  /**
   * 刷新角色列表
   */
  const refreshRoles = async () => {
    state.value.isLoading = true
    state.value.error = null

    try {
      const roles = await roleService.getRoles()
      state.value.roles = roles.length > 0 ? roles : [roleService.getDefaultRole()]
    } catch (err) {
      console.warn('刷新角色列表失败', err)
      state.value.error = '刷新失败'
    } finally {
      state.value.isLoading = false
    }
  }

  // ✅ 导出状态和方法
  return {
    // 状态
    roles,
    currentRole,
    isLoading,
    error,

    // 方法
    initializeRoles,
    selectRole,
    refreshRoles,
  }
})
