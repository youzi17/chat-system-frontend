// types/role.ts — 固定双角色类型定义

/** 系统支持的角色键值，与后端 RoleKey 保持一致 */
export type RoleKey = 'character' | 'tcm_expert'

/** 固定角色信息（前端展示用） */
export interface FixedRole {
  key: RoleKey
  name: string
  description: string
  avatar: string
}

/** 固定双角色常量，不从 API 加载 */
export const FIXED_ROLES: FixedRole[] = [
  {
    key: 'character',
    name: '虚构角色',
    description: '拥有独特个性和说话风格的虚构角色，基于语录库进行风格化对话',
    avatar: '/role-avatars/character.png',
  },
  {
    key: 'tcm_expert',
    name: '中医知识专家',
    description: '专业的中医知识问答专家，基于中医文献库提供有据可查的回答',
    avatar: '/role-avatars/tcm_expert.png',
  },
]

/** 角色 Store 状态 */
export interface RoleState {
  currentRole: FixedRole | null
  isLoading: boolean
  error: string | null
}
