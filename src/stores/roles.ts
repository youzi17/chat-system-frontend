// src/stores/roles.ts — 固定双角色 Store，常量驱动，不调用 API
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FixedRole, RoleKey } from '@/types/role'
import { FIXED_ROLES } from '@/types/role'
import { useChatStore } from './chat'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS } from '@/utils/constants'

export const useRoleStore = defineStore('role', () => {
  // 状态
  const currentRole = ref<FixedRole | null>(null)

  // 计算属性：固定角色列表
  const roles = computed(() => FIXED_ROLES)

  // 当前角色的 key
  const currentRoleKey = computed<RoleKey | null>(() => currentRole.value?.key ?? null)

  /**
   * 初始化角色
   * 从 localStorage 恢复上次选中的角色
   */
  const initializeRoles = () => {
    const savedKey = storage.get<RoleKey>(STORAGE_KEYS.SELECTED_ROLE)
    if (savedKey) {
      const found = FIXED_ROLES.find((r) => r.key === savedKey)
      if (found) {
        currentRole.value = found
        return
      }
    }
    // 没有保存的角色，不自动选择（等用户在欢迎页选择）
    currentRole.value = null
  }

  /**
   * 选择角色
   * 切换角色并关联到对应会话
   */
  const selectRole = (roleKey: RoleKey) => {
    const role = FIXED_ROLES.find((r) => r.key === roleKey)
    if (!role) return

    currentRole.value = role
    storage.set(STORAGE_KEYS.SELECTED_ROLE, roleKey)

    // 切换到该角色的会话
    const chatStore = useChatStore()
    const roleSessions = chatStore.sessions.filter((s) => s.roleKey === roleKey)

    if (roleSessions.length > 0 && roleSessions[0]) {
      chatStore.selectSession(roleSessions[0].id)
    } else {
      chatStore.createSession(`${role.name}的对话`, roleKey)
    }
  }

  /**
   * 清除角色选择（回到欢迎页）
   */
  const clearRole = () => {
    currentRole.value = null
    storage.remove(STORAGE_KEYS.SELECTED_ROLE)
  }

  return {
    // 状态
    roles,
    currentRole,
    currentRoleKey,

    // 方法
    initializeRoles,
    selectRole,
    clearRole,
  }
})
