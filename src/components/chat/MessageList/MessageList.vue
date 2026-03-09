<template>
  <div class="message-list" ref="scrollContainer">
    <div class="message-list-content">
      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <AppIcon name="message-circle" />
        </div>
        <h3>开始对话</h3>
        <p>输入消息开始聊天吧</p>
      </div>

      <!-- 消息列表 -->
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :show-actions="showActions"
        @copy="handleCopyMessage"
        @like="handleLikeMessage"
        @delete="handleDeleteMessage"
      />

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-message">
        <div class="loading-avatar">
          <img :src="currentRole?.avatar || '/role-avatars/default-avatar.png'" alt="AI" />
        </div>
        <div class="loading-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 滚动到底部按钮 -->
    <button
      v-if="!isAtBottom && messages.length > 0"
      class="scroll-to-bottom-btn"
      @click="() => scrollToBottom(true)"
      title="滚动到底部"
    >
      <AppIcon name="arrow-down" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { useRoleStore } from '@/stores/roles'
import ChatMessage from '../ChatMessage/ChatMessage.vue'
import { AppIcon } from '@/components/ui/Icon'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface Props {
  messages: ChatMessageType[]
  isLoading?: boolean
  showActions?: boolean
  autoScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  showActions: true,
  autoScroll: true,
})

const emit = defineEmits<{
  copy: [message: ChatMessageType]
  like: [message: ChatMessageType]
  delete: [message: ChatMessageType]
}>()

const roleStore = useRoleStore()
const scrollContainer = ref<HTMLElement>()

const { isAtBottom, scrollToBottom, autoScrollToBottom } = useScroll(() => scrollContainer.value)

const currentRole = computed(() => roleStore.currentRole)

watch(
  () => props.messages.length,
  async () => {
    if (props.autoScroll) {
      await nextTick()
      autoScrollToBottom()
    }
  },
  { flush: 'post' },
)

watch(
  () => props.isLoading,
  async (isLoading) => {
    if (isLoading && props.autoScroll) {
      await nextTick()
      autoScrollToBottom()
    }
  },
)

const handleCopyMessage = (message: ChatMessageType) => {
  emit('copy', message)
}

const handleLikeMessage = (message: ChatMessageType) => {
  emit('like', message)
}

const handleDeleteMessage = (message: ChatMessageType) => {
  emit('delete', message)
}
</script>

<style scoped>
.message-list {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
  background: var(--color-bg-primary);
}

.message-list-content {
  min-height: 100%;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-md);
  color: var(--color-text-muted);
}

.empty-state h3 {
  margin: 0 0 var(--space-sm) 0;
  font-size: 20px;
  color: var(--color-text-primary);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 加载状态 */
.loading-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.loading-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-right: var(--space-sm);
  flex-shrink: 0;
  background: var(--color-bg-tertiary);
}

.loading-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-content {
  background: var(--color-bg-elevated);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  min-width: 60px;
  border: 1px solid var(--color-border);
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-muted);
  animation: loadingDots 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 滚动到底部按钮 */
.scroll-to-bottom-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
  transition: all var(--transition-fast);
  z-index: 10;
}

.scroll-to-bottom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
}

@media (max-width: 768px) {
  .message-list {
    padding: var(--space-sm);
  }

  .scroll-to-bottom-btn {
    width: 36px;
    height: 36px;
    top: 16px;
    right: 16px;
  }

  .empty-state {
    min-height: 200px;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }

  .empty-state h3 {
    font-size: 18px;
  }
}
</style>
