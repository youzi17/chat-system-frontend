<template>
  <div class="message-list" ref="scrollContainer">
    <div class="message-list-content">
      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <AppIcon name="message-circle" />
        </div>
        <h3>开始对话</h3>
        <p>选择一个角色开始聊天吧！</p>
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
  autoScroll: true
})

const emit = defineEmits<{
  copy: [message: ChatMessageType]
  like: [message: ChatMessageType]
  delete: [message: ChatMessageType]
}>()

const roleStore = useRoleStore()
const scrollContainer = ref<HTMLElement>()

// 使用滚动组合式函数
const { isAtBottom, scrollToBottom, autoScrollToBottom } = useScroll(() => scrollContainer.value)

// 计算属性
const currentRole = computed(() => roleStore.currentRole)

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages.length,
  async () => {
    if (props.autoScroll) {
      await nextTick()
      autoScrollToBottom()
    }
  },
  { flush: 'post' }
)

// 监听加载状态变化
watch(
  () => props.isLoading,
  async (isLoading) => {
    if (isLoading && props.autoScroll) {
      await nextTick()
      autoScrollToBottom()
    }
  }
)

// 方法
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
  padding: 16px;
  background: #f8f9fa;
}

.message-list-content {
  min-height: 100%;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  text-align: center;
  color: #666;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #ccc;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 加载状态样式 */
.loading-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.loading-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.loading-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-content {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  min-width: 60px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  animation: loadingDots 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 滚动到底部按钮 - 移至顶部 */
.scroll-to-bottom-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #007bff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: all 0.2s;
  z-index: 10;
}

.scroll-to-bottom-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.scroll-to-bottom-btn:active {
  transform: translateY(0);
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-list {
    padding: 12px;
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
