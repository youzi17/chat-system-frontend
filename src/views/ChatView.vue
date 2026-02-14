<template>
  <div class="chat-view">
    <!-- 聊天头部 - 移至页面顶部 -->
    <div class="chat-header">
      <div class="chat-info">
        <div class="current-role">
          <img
            :src="currentRole?.avatar || '/role-avatars/default-avatar.png'"
            :alt="currentRole?.name || 'AI'"
            class="role-avatar"
          />
          <div class="role-details">
            <h3>{{ currentRole?.name || 'AI助手' }}</h3>
            <p>{{ currentRole?.description || '我是你的AI助手，有什么可以帮助你的吗？' }}</p>
          </div>
        </div>
      </div>

      <div class="chat-actions">
        <Button
          variant="outline"
          size="small"
          icon="settings"
          @click="showSettings = true"
          title="设置"
        />
        <Button
          variant="outline"
          size="small"
          icon="trash"
          @click="clearCurrentSession"
          :disabled="!currentSession || currentSession.messages.length === 0"
          title="清空对话"
        />
        <Button
          variant="outline"
          size="small"
          icon="logout"
          @click="handleLogout"
          title="退出登录"
        />
      </div>
    </div>

    <!-- 内容布局容器 -->
    <div class="content-container">
      <!-- 左侧角色选择区域 -->
      <div class="role-sidebar">
        <RoleSelector ref="roleSelectorRef" />
        <!-- 增加的按钮 -->
        <div class="add-role-sidebar-btn">
          <Button
            variant="primary"
            size="small"
            icon="plus"
            @click="openAddRoleModal"
            title="添加角色"
          >
            添加角色
          </Button>
        </div>
      </div>

      <!-- 右侧主内容区域 -->
      <div class="main-container">
        <!-- 主聊天区域 - 不再显示对话历史 -->
        <div class="chat-main">
          <!-- 选择角色前的初始提示 -->
          <div v-if="!hasSelectedRole" class="start-chat-prompt">
            <div class="prompt-content">
              <div class="prompt-icon">💬</div>
              <h2>开始聊天</h2>
              <p>请从左侧选择一个角色开始对话</p>
            </div>
          </div>

          <!-- 选择角色后的聊天界面 -->
          <template v-else>
            <!-- 消息列表 -->
            <div class="chat-messages">
              <MessageList
                :messages="currentSession?.messages || []"
                :is-loading="isLoading"
                @copy="handleCopyMessage"
                @like="handleLikeMessage"
                @delete="handleDeleteMessage"
              />
            </div>

            <!-- 输入区域 -->
            <div class="chat-input">
              <InputArea
                :is-loading="isLoading"
                @send="handleSendMessage"
                @file-upload="handleFileUpload"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 设置模态框 -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>设置</h3>
          <Button variant="ghost" icon="close" @click="showSettings = false" />
        </div>

        <div class="modal-body">
          <div class="setting-group">
            <label>自动滚动</label>
            <input type="checkbox" v-model="settings.autoScroll" />
          </div>

          <div class="setting-group">
            <label>消息通知</label>
            <input type="checkbox" v-model="settings.notifications" />
          </div>

          <div class="setting-group">
            <label>深色模式</label>
            <input type="checkbox" v-model="settings.darkMode" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChat } from '@/composables/useChat'
import { useRoleStore } from '@/stores/roles'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import type { ChatMessage } from '@/types/chat'

// 组件导入
import RoleSelector from '@/components/chat/RoleSelector'
import MessageList from '@/components/chat/MessageList'
import InputArea from '@/components/chat/InputArea'
import Button from '@/components/ui/Button'
import { watchEffect } from 'vue'

// 使用组合式函数
const { currentSession, isLoading, sendMessage, createNewSession, clearCurrentSession } = useChat()

const router = useRouter()
const roleStore = useRoleStore()
const aiConfigStore = useAIConfigStore()
const authStore = useAuthStore()
const chatStore = useChatStore()

// 响应式数据
const showSettings = ref(false)
const roleSelectorRef = ref<InstanceType<typeof RoleSelector>>()
const hasSelectedRole = ref(false)

// 新增：处理添加角色按钮点击
const openAddRoleModal = () => {
  // 调用RoleSelector组件的openAddRole方法打开添加角色模态框
  if (roleSelectorRef.value) {
    roleSelectorRef.value.openAddRole()
  }
}

const settings = ref({
  autoScroll: true,
  notifications: true,
  darkMode: false,
})

// 计算属性
const currentRole = computed(() => roleStore.currentRole)

// 监听角色变化
watchEffect(() => {
  if (currentRole.value) {
    hasSelectedRole.value = true
    // 如果有角色但没有会话，创建一个新的
    if (!currentSession.value) {
      createNewSession()
    }
  } else {
    hasSelectedRole.value = false
  }
})

// 方法
const handleSendMessage = async (message: string) => {
  try {
    await sendMessage(message)
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const handleFileUpload = (files: FileList) => {
  console.log('上传文件:', files)
  // 这里可以实现文件上传逻辑
}

const handleCopyMessage = (message: ChatMessage) => {
  console.log('复制消息:', message)
}

const handleLikeMessage = (message: ChatMessage) => {
  console.log('点赞消息:', message)
}

const handleDeleteMessage = (message: ChatMessage) => {
  console.log('删除消息:', message)
  // 这里可以实现删除消息的逻辑
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  // 初始化AI配置
  await aiConfigStore.initializeConfigs()
  // 初始化角色
  await roleStore.initializeRoles()
  // 初始化聊天历史，从localStorage加载会话数据
  chatStore.initialize()
  // 不自动创建会话，只有在选择角色后才创建
})
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #f8f9fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 确保全屏显示 */
* {
  box-sizing: border-box;
}

/* 内容布局容器 */
.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧角色选择区域 */
.role-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

/* 增加的按钮样式 */
.add-role-sidebar-btn {
  padding: 16px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* 右侧主内容区域 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}

/* 开始聊天提示 */
.start-chat-prompt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.prompt-content {
  text-align: center;
  padding: 40px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.prompt-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.prompt-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.prompt-content p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e9ecef;
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
  gap: 12px;
}

.role-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.role-details h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #333;
}

.role-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.chat-messages {
  flex: 1;
  overflow: hidden;
  background: #f8f9fa;
}

.chat-input {
  background: white;
  border-top: 1px solid #e9ecef;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.setting-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.setting-group label {
  font-weight: 500;
  color: #333;
}

.setting-group input[type='checkbox'] {
  width: 18px;
  height: 18px;
}

.modal-body input[type='text'] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.modal-body input[type='text']:focus {
  outline: none;
  border-color: #007bff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-view {
    flex-direction: column;
  }

  .chat-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .role-section {
    max-height: 100px;
  }

  .chat-header {
    padding: 12px 16px;
  }

  .current-role {
    gap: 8px;
  }

  .role-avatar {
    width: 36px;
    height: 36px;
  }

  .role-details h3 {
    font-size: 16px;
  }

  .role-details p {
    font-size: 13px;
  }
}
</style>
