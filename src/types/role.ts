// types/role.ts

/**
 * 角色（仅用于列表展示）
 */
export interface Role {
  id: string
  name: string
  createdAt: string
}

export interface RoleState {
  roles: Role[]
  currentRole: Role | null
  isLoading: boolean
  error: string | null
}
