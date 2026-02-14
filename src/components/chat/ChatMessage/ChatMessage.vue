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

// 计算属性
const currentRole = computed(() => roleStore.currentRole)
//计算属性，根据消息的角色，显示不同的头像
const avatarUrl = computed(() => {
  if (avatarError.value) {
    return '/role-avatars/default-avatar.png'
  }

  if (props.message.role === 'user') {
    return '/role-avatars/user-avatar.png'
  }

  return props.message.avatar || currentRole.value?.avatar || '/role-avatars/default-avatar.png'
})

const isLiked = ref(false) // 这里可以从store中获取
//格式化消息，将消息中的Markdown格式化成HTML格式
// 方法
const formatMessage = (content: string): string => {
  // 简单的Markdown渲染
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const handleAvatarError = () => {
  avatarError.value = true
}
//复制消息，将消息复制到剪贴板
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    emit('copy', props.message)
  } catch (error) {
    console.error('复制失败:', error)
  }
}
//点赞消息，将消息点赞
const toggleLike = () => {
  isLiked.value = !isLiked.value
  emit('like', props.message)
}
//删除消息，将消息删除
const deleteMessage = () => {
  if (confirm('确定要删除这条消息吗？')) {
    emit('delete', props.message)
  }
}
</script>

<style scoped>
.chat-message {
  display: flex;
  margin-bottom: 16px;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-message--assistant {
  flex-direction: row;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin: 0 12px;
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
  margin-bottom: 4px;
  gap: 8px;
}

.chat-message--user .message-header {
  flex-direction: row-reverse;
}

.message-sender {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-body {
  position: relative;
}

.message-text {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-wrap: break-word;
  word-break: break-word;
}

.chat-message--user .message-text {
  background: #007bff;
  color: white;
}

.chat-message--assistant .message-text {
  background: #f8f9fa;
  color: #333;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.chat-message--user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.2);
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-actions {
  position: absolute;
  top: -8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
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
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.copy-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.like-btn:hover {
  background: #fce4ec;
  color: #c2185b;
}

.like-btn.liked {
  background: #fce4ec;
  color: #c2185b;
}

.delete-btn:hover {
  background: #ffebee;
  color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    margin: 0 8px;
  }

  .message-text {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
