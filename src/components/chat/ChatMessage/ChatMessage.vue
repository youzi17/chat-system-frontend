<template>
  <div :class="['chat-message', `chat-message--${message.role}`]">
    <div class="message-avatar">
      <img
        :src="avatarUrl"
        :alt="message.role === 'user' ? '用户' : currentRole?.name || 'AI'"
        @error="handleAvatarError"
      />
    </div>

    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">
          {{ message.role === 'user' ? '你' : currentRole?.name || 'AI' }}
        </span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>

      <div class="message-body">
        <div
          v-if="message.content"
          class="message-text"
          v-html="formatMessage(message.content)"
        ></div>

        <!-- 消息操作按钮 -->
        <div v-if="showActions" class="message-actions">
          <button class="action-btn copy-btn" @click="copyMessage" title="复制消息">
            <AppIcon name="copy" />
          </button>
          <button
            v-if="message.role === 'assistant'"
            class="action-btn like-btn"
            @click="toggleLike"
            :class="{ liked: isLiked }"
            title="点赞"
          >
            <AppIcon name="heart" />
          </button>
          <button class="action-btn delete-btn" @click="deleteMessage" title="删除消息">
            <AppIcon name="trash" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoleStore } from '@/stores/roles'
import { formatTime } from '@/utils/helpers'
import type { ChatMessage } from '@/types/chat'
import { AppIcon } from '@/components/ui/Icon'

interface Props {
  message: ChatMessage
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<{
  copy: [message: ChatMessage]
  like: [message: ChatMessage]
  delete: [message: ChatMessage]
}>()

const roleStore = useRoleStore()
const avatarError = ref(false)

const currentRole = computed(() => roleStore.currentRole)

const avatarUrl = computed(() => {
  if (avatarError.value) {
    return '/role-avatars/default-avatar.png'
  }
  if (props.message.role === 'user') {
    return '/role-avatars/user-avatar.png'
  }
  return props.message.avatar || currentRole.value?.avatar || '/role-avatars/default-avatar.png'
})

const isLiked = ref(false)

const escapeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const formatMessage = (content: string): string => {
  // 先转义用户/模型返回文本，再执行受控 markdown 替换，避免 XSS
  const safeContent = escapeHtml(content)
  return safeContent
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const handleAvatarError = () => {
  avatarError.value = true
}

const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    emit('copy', props.message)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  emit('like', props.message)
}

const deleteMessage = () => {
  if (confirm('确定要删除这条消息吗？删除后无法恢复哦～')) {
    emit('delete', props.message)
  }
}
</script>

<style scoped>
.chat-message {
  display: flex;
  margin-bottom: var(--space-lg);
  animation: messageSlideIn 0.4s ease-out;
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-message--assistant {
  flex-direction: row;
}

.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  margin: 0 var(--space-md);
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  min-width: 0;
}

.chat-message--user .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-sm);
  gap: var(--space-sm);
}

.chat-message--user .message-header {
  flex-direction: row-reverse;
}

.message-sender {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.message-time {
  font-size: 13px;
  color: var(--color-text-muted);
}

.message-body {
  position: relative;
}

.message-text {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  font-size: 15px;
  line-height: 1.75;
  word-wrap: break-word;
  word-break: break-word;
}

/* 用户消息 — 主色渐变 */
.chat-message--user .message-text {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: var(--shadow-sm);
}

/* AI 消息 — 深色卡片 */
.chat-message--assistant .message-text {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.message-text :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.chat-message--user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

/* 操作按钮 */
.message-actions {
  position: absolute;
  top: -8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.chat-message--user .message-actions {
  right: auto;
  left: 8px;
}

.message-body:hover .message-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.action-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transform: scale(1.1);
}

.copy-btn:hover {
  color: var(--color-primary);
}

.like-btn:hover,
.like-btn.liked {
  color: #f43f5e;
}

.delete-btn:hover {
  color: var(--color-error);
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
  }

  .message-text {
    padding: var(--space-sm);
    font-size: 13px;
  }
}
</style>
