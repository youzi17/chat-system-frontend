<template>
  <div class="role-selector">
    <div class="role-selector-header">
      <h3>角色</h3>
    </div>

    <!-- 固定双角色卡片 -->
    <div class="role-list">
      <div
        v-for="role in roles"
        :key="role.key"
        :class="['role-item', { active: currentRoleKey === role.key }]"
        @click="handleSelectRole(role.key)"
      >
        <div class="role-avatar">
          <img :src="role.avatar" :alt="role.name" />
        </div>
        <div class="role-info">
          <h4 class="role-name">{{ role.name }}</h4>
          <p class="role-description">{{ role.description }}</p>
        </div>
      </div>
    </div>

    <!-- 当前角色的会话历史 -->
    <div v-if="currentRoleKey" class="session-list">
      <div class="session-list-header">
        <span>会话历史</span>
        <button class="new-session-btn" @click="handleNewSession" title="新建会话">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div class="session-items">
        <div
          v-for="session in roleSessions"
          :key="session.id"
          :class="['session-item', { active: currentSessionId === session.id }]"
          @click="handleSelectSession(session.id)"
        >
          <span class="session-title">{{ session.title }}</span>
          <button class="delete-session-btn" @click.stop="handleDeleteSession(session.id)" title="删除会话">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div v-if="roleSessions.length === 0" class="no-sessions">
          暂无会话记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoleStore } from '@/stores/roles'
import { useChatStore } from '@/stores/chat'
import type { RoleKey } from '@/types/role'

const roleStore = useRoleStore()
const chatStore = useChatStore()

// 计算属性
const roles = computed(() => roleStore.roles)
const currentRoleKey = computed(() => roleStore.currentRoleKey)
const currentSessionId = computed(() => chatStore.currentSession?.id)

/** 当前角色的会话列表 */
const roleSessions = computed(() => {
  if (!currentRoleKey.value) return []
  return chatStore.getSessionsByRoleKey(currentRoleKey.value)
})

// 方法
const handleSelectRole = (roleKey: RoleKey) => {
  roleStore.selectRole(roleKey)
}

const handleSelectSession = (sessionId: string) => {
  chatStore.selectSession(sessionId)
}

const handleNewSession = () => {
  if (!currentRoleKey.value || !roleStore.currentRole) return
  chatStore.createSession(`${roleStore.currentRole.name}的对话`, currentRoleKey.value)
}

const handleDeleteSession = (sessionId: string) => {
  chatStore.deleteSession(sessionId)
}
</script>

<style scoped>
.role-selector {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  overflow: hidden;
}

.role-selector-header {
  display: flex;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.role-selector-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* 角色列表 */
.role-list {
  padding: var(--space-sm);
}

.role-item {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-xs);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.role-item:hover {
  background: var(--color-bg-tertiary);
}

.role-item.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}

.role-avatar {
  width: 40px;
  height: 40px;
  margin-right: var(--space-sm);
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg-tertiary);
}

.role-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.role-description {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 会话历史列表 */
.session-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid var(--color-border);
}

.session-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.new-session-btn {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.new-session-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.session-items {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-sm) var(--space-sm);
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: 2px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.session-item:hover {
  background: var(--color-bg-tertiary);
}

.session-item.active {
  background: rgba(139, 92, 246, 0.08);
}

.session-title {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.session-item.active .session-title {
  color: var(--color-text-primary);
}

.delete-session-btn {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast);
}

.session-item:hover .delete-session-btn {
  opacity: 1;
}

.delete-session-btn:hover {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
}

.no-sessions {
  padding: var(--space-md);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
