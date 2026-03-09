<template>
  <div class="chat-view">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="chat-info">
        <div v-if="currentRole" class="current-role">
          <div class="role-details">
            <h3>{{ currentRole.name }}</h3>
            <p>{{ currentRole.description }}</p>
          </div>
        </div>
        <div v-else class="brand-info">
          <h3 class="gradient-text">AI 角色聊天</h3>
          <p>选个角色开始吧</p>
        </div>
      </div>

      <div class="chat-actions">
        <button
          v-if="currentRole"
          class="action-btn"
          @click="handleBackToWelcome"
          title="切换角色"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="action-btn"
          @click="clearCurrentSession"
          :disabled="!currentSession || currentSession.messages.length === 0"
          title="清空对话"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <button class="action-btn logout-btn" @click="handleLogout" title="退出登录">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 首屏欢迎页（未选择角色时） -->
      <Transition name="fade">
        <div v-if="!currentRole" class="welcome-page">
          <div class="welcome-content">
            <div class="welcome-icon">
              <div class="icon-glow"></div>
              <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="url(#welcome-gradient)" stroke-width="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                <defs>
                  <linearGradient id="welcome-gradient" x1="3" y1="3" x2="21" y2="21">
                    <stop stop-color="#0ea5e9" />
                    <stop offset="1" stop-color="#7dd3fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1>选个角色，开始聊天吧～</h1>
            <p>每个角色都有自己的风格和专长哦</p>
          </div>

          <!-- 角色选择卡片 -->
          <div class="role-cards">
            <div
              v-for="(role, index) in roles"
              :key="role.key"
              class="role-card"
              :class="`role-card--${index}`"
              @click="handleSelectRole(role.key)"
            >
              <!-- shimmer 光扫层 -->
              <div class="role-card-shimmer"></div>

              <!-- 头像区域 -->
              <div class="role-card-avatar">
                <img :src="role.avatar" :alt="role.name" />
                <div class="role-card-avatar-ring"></div>
              </div>

              <!-- 角色标签 -->
              <div class="role-card-badge">
                <span v-if="role.key === 'character'">虚构角色</span>
                <span v-else>知识专家</span>
              </div>

              <!-- 信息区域 -->
              <div class="role-card-info">
                <h3>{{ role.name }}</h3>
                <p class="role-card-desc">{{ role.description }}</p>
                <p class="role-card-hint">
                  <span v-if="role.key === 'character'">沉浸式聊天，像朋友一样</span>
                  <span v-else>专业知识，靠谱回答</span>
                </p>
              </div>

              <!-- 底部操作提示 -->
              <div class="role-card-footer">
                <span>点击开始聊天</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 选择角色后的聊天界面 -->
      <template v-if="currentRole">
        <!-- 左侧边栏 -->
        <div class="role-sidebar">
          <RoleSelector />
        </div>

        <!-- 右侧主聊天区域 -->
        <div class="main-container">
          <div class="chat-main">
            <div class="chat-messages">
              <MessageList
                :messages="currentSession?.messages || []"
                :is-loading="isLoading"
                @copy="handleCopyMessage"
                @like="handleLikeMessage"
                @delete="handleDeleteMessage"
              />
            </div>

            <div class="chat-input">
              <InputArea
                :is-loading="isLoading"
                @send="handleSendMessage"
                @file-upload="handleFileUpload"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { useRoleStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import type { RoleKey } from '@/types/role'
import type { ChatMessage } from '@/types/chat'

// 组件导入
import RoleSelector from '@/components/chat/RoleSelector'
import MessageList from '@/components/chat/MessageList'
import InputArea from '@/components/chat/InputArea'

const { currentSession, isLoading, sendMessage, clearCurrentSession } = useChat()

const router = useRouter()
const roleStore = useRoleStore()
const authStore = useAuthStore()
const chatStore = useChatStore()

// 计算属性
const currentRole = computed(() => roleStore.currentRole)
const roles = computed(() => roleStore.roles)

// 方法
const handleSelectRole = (roleKey: RoleKey) => {
  roleStore.selectRole(roleKey)
}

const handleBackToWelcome = () => {
  roleStore.clearRole()
}

const handleSendMessage = async (message: string) => {
  try {
    await sendMessage(message)
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const handleFileUpload = (files: FileList) => {
  console.log('上传文件:', files)
}

const handleCopyMessage = (message: ChatMessage) => {
  console.log('复制消息:', message)
}

const handleLikeMessage = (message: ChatMessage) => {
  console.log('点赞消息:', message)
}

const handleDeleteMessage = (message: ChatMessage) => {
  console.log('删除消息:', message)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  // 初始化角色（从 localStorage 恢复）
  roleStore.initializeRoles()
  // 初始化聊天历史
  chatStore.initialize()
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--color-bg-primary);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
}

/* 头部 — 增强毛玻璃效果 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 4px 24px rgba(124, 156, 191, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.chat-info {
  flex: 1;
}

.current-role {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand-info h3 {
  margin: 0 0 4px 0;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.4;
}

.brand-info p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}


.role-details h3 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.role-details p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.6;
}

.chat-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.action-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-color: rgba(124, 156, 191, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border-color: rgba(239, 68, 68, 0.3);
}

/* 内容容器 */
.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ===== 首屏欢迎页 ===== */
.welcome-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-2xl);
}

.welcome-content {
  text-align: center;
}

.welcome-icon {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-glow {
  position: absolute;
  inset: 0;
  background: var(--color-primary-gradient);
  border-radius: var(--radius-full);
  opacity: 0.25;
  filter: blur(32px);
  animation: glow 3s ease-in-out infinite;
}

.welcome-icon svg {
  position: relative;
  z-index: 1;
}

.welcome-content h1 {
  margin: 0 0 var(--space-md) 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.welcome-content p {
  margin: 0;
  font-size: 17px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* 角色选择卡片 */
.role-cards {
  display: flex;
  gap: var(--space-2xl);
  max-width: 720px;
  width: 100%;
}

/* 卡片入场动画 — stagger */
.role-card--0 { animation: cardSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }
.role-card--1 { animation: cardSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.22s both; }

@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(32px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.role-card {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl) var(--space-lg);
  background: var(--color-bg-secondary);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.4s ease,
              border-color 0.4s ease;
  box-shadow: var(--shadow-sm);
}

/* shimmer 光扫 */
.role-card-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(124, 156, 191, 0.1) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  background-position: -100% 0;
  transition: background-position 0s;
  pointer-events: none;
}

.role-card:hover .role-card-shimmer {
  background-position: 200% 0;
  transition: background-position 0.7s ease;
}

.role-card:hover {
  transform: scale(1.05);
  border-color: rgba(124, 156, 191, 0.35);
  box-shadow: 0 16px 48px rgba(124, 156, 191, 0.18),
              0 0 0 1px rgba(124, 156, 191, 0.12),
              0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 头像 */
.role-card-avatar {
  position: relative;
  width: 92px;
  height: 92px;
  flex-shrink: 0;
}

.role-card-avatar img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--color-border);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  position: relative;
  z-index: 1;
}

/* 头像光晕环 */
.role-card-avatar-ring {
  position: absolute;
  inset: -6px;
  border-radius: var(--radius-full);
  background: var(--color-primary-gradient);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
  filter: blur(8px);
}

.role-card:hover .role-card-avatar-ring {
  opacity: 0.25;
}

.role-card:hover .role-card-avatar img {
  border-color: rgba(124, 156, 191, 0.45);
  box-shadow: 0 0 20px rgba(124, 156, 191, 0.3);
}

/* 角色标签 */
.role-card-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  background: rgba(124, 156, 191, 0.1);
  border: 1px solid rgba(124, 156, 191, 0.2);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: 0.04em;
  transition: background 0.4s ease, border-color 0.4s ease;
}

.role-card:hover .role-card-badge {
  background: rgba(124, 156, 191, 0.16);
  border-color: rgba(124, 156, 191, 0.35);
}

/* 信息区域 */
.role-card-info {
  text-align: center;
  flex: 1;
}

.role-card-info h3 {
  margin: 0 0 var(--space-md) 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.role-card-desc {
  margin: 0 0 var(--space-md) 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.role-card-hint {
  margin: 0;
  font-size: 13px;
  color: var(--color-primary);
  opacity: 0.75;
  font-weight: 500;
  line-height: 1.6;
}

/* 底部操作提示 */
.role-card-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  transition: color 0.3s ease, gap 0.3s ease;
  margin-top: var(--space-xs);
}

.role-card:hover .role-card-footer {
  color: var(--color-primary);
  gap: 8px;
}

/* ===== 聊天布局 ===== */
.role-sidebar {
  width: 280px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background: var(--color-bg-primary);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow: hidden;
}

.chat-input {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .role-sidebar {
    display: none;
  }

  .role-cards {
    flex-direction: column;
  }

  .welcome-content h1 {
    font-size: 22px;
  }

  .chat-header {
    padding: var(--space-sm) var(--space-md);
  }

  .role-avatar {
    width: 36px;
    height: 36px;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
