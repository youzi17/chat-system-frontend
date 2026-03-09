<template>
  <div class="input-area">
    <div class="input-container">
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <button class="toolbar-btn" @click="toggleEmojiPicker" title="表情">
          <AppIcon name="smile" />
        </button>
        <button class="toolbar-btn" @click="triggerFileUpload" title="上传文件">
          <AppIcon name="paperclip" />
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="clearInput" :disabled="!inputValue" title="清空">
          <AppIcon name="x" />
        </button>
      </div>

      <!-- 输入框 -->
      <div class="input-wrapper">
        <textarea
          ref="textareaRef"
          v-model="inputValue"
          :placeholder="placeholder"
          :disabled="isLoading"
          @keydown="handleKeydown"
          @input="handleInput"
          @paste="handlePaste"
          class="message-input"
          rows="1"
        ></textarea>

        <!-- 发送按钮 -->
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!canSend"
          :class="{ loading: isLoading }"
          title="发送消息 (Ctrl+Enter)"
        >
          <AppIcon v-if="!isLoading" name="send" />
          <div v-else class="loading-spinner"></div>
        </button>
      </div>

      <!-- 字符计数 -->
      <div v-if="showCharCount" class="char-count">
        {{ inputValue.length }}/{{ maxLength }}
      </div>
    </div>

    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-grid">
        <button
          v-for="emoji in emojis"
          :key="emoji"
          class="emoji-btn"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- 文件上传输入 -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*,.txt,.pdf,.doc,.docx"
      @change="handleFileUpload"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { debounce } from '@/utils/helpers'
import { AppIcon } from '@/components/ui/Icon'

interface Props {
  placeholder?: string
  maxLength?: number
  isLoading?: boolean
  showCharCount?: boolean
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '说点什么吧...',
  maxLength: 2000,
  isLoading: false,
  showCharCount: true,
  autoFocus: false,
})

const emit = defineEmits<{
  send: [message: string]
  fileUpload: [files: FileList]
}>()

// 响应式数据
const inputValue = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()
const showEmojiPicker = ref(false)

// 表情列表
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
]

// 计算属性
const canSend = computed(() => {
  return inputValue.value.trim().length > 0 && !props.isLoading
})

// 方法
const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 120
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

const handleInput = debounce(() => {
  adjustTextareaHeight()
}, 100)

const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
    return
  }

  if (event.key === 'Escape') {
    showEmojiPicker.value = false
    return
  }

  if (
    inputValue.value.length >= props.maxLength &&
    event.key !== 'Backspace' &&
    event.key !== 'Delete'
  ) {
    event.preventDefault()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items || items.length === 0) return

  for (let i = 0; i < items.length; i++) {
    const pastedItem = items[i]
    if (!pastedItem) continue
    if (pastedItem.type && pastedItem.type.indexOf('image') !== -1) {
      event.preventDefault()
      const file = pastedItem.getAsFile()
      if (file) {
        const fileList = new DataTransfer()
        fileList.items.add(file)
        emit('fileUpload', fileList.files)
      }
      break
    }
  }
}

const sendMessage = () => {
  if (!canSend.value) return
  const message = inputValue.value.trim()
  emit('send', message)
  inputValue.value = ''
  adjustTextareaHeight()
  showEmojiPicker.value = false
}

const clearInput = () => {
  inputValue.value = ''
  adjustTextareaHeight()
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji: string) => {
  if (textareaRef.value) {
    const start = textareaRef.value.selectionStart
    const end = textareaRef.value.selectionEnd
    const text = inputValue.value
    inputValue.value = text.substring(0, start) + emoji + text.substring(end)

    nextTick(() => {
      textareaRef.value?.focus()
      textareaRef.value?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }
  showEmojiPicker.value = false
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('fileUpload', target.files)
    target.value = ''
  }
}

// 点击外部关闭表情选择器
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.emoji-picker') && !target.closest('.toolbar-btn')) {
    showEmojiPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (props.autoFocus) {
    textareaRef.value?.focus()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.input-area {
  position: relative;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
}

.input-container {
  padding: var(--space-lg);
}

.input-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.toolbar-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transform: scale(1.05);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: var(--color-primary);
  color: white;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 4px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--space-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-md);
  border: 1.5px solid var(--color-border);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(124, 156, 191, 0.15), var(--shadow-md);
  background: var(--color-bg-elevated);
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-primary);
  min-height: 24px;
  max-height: 140px;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--color-text-muted);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-primary-gradient);
  color: white;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: var(--shadow-glow);
}

.send-btn:disabled {
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

/* 表情选择器 — 增强毛玻璃效果 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: var(--space-md);
  right: var(--space-md);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-bottom: var(--space-sm);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  padding: var(--space-md);
  max-height: 220px;
  overflow-y: auto;
}

.emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 20px;
  transition: all var(--transition-base);
}

.emoji-btn:hover {
  background: var(--color-bg-tertiary);
  transform: scale(1.15);
}

@media (max-width: 768px) {
  .input-container {
    padding: var(--space-sm);
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
