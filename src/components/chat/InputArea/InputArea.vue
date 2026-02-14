<template>
  <div class="input-area">
    <div class="input-container">
      <!-- 工具栏 -->
      <div class="input-toolbar">
        <button
          class="toolbar-btn"
          @click="toggleEmojiPicker"
          title="表情"
        >
          <AppIcon name="smile" />
        </button>
        
        <button
          class="toolbar-btn"
          @click="triggerFileUpload"
          title="上传文件"
        >
          <AppIcon name="paperclip" />
        </button>
        
        <button
          class="toolbar-btn"
          @click="toggleVoiceInput"
          :class="{ active: isVoiceInputActive }"
          title="语音输入"
        >
          <AppIcon name="mic" />
        </button>
        
        <div class="toolbar-divider"></div>
        
        <button
          class="toolbar-btn"
          @click="clearInput"
          :disabled="!inputValue"
          title="清空"
        >
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

    <!-- 语音输入状态 -->
    <div v-if="isVoiceInputActive" class="voice-input-status">
      <div class="voice-animation">
        <div class="voice-wave"></div>
        <div class="voice-wave"></div>
        <div class="voice-wave"></div>
      </div>
      <p>正在录音...</p>
      <button class="stop-voice-btn" @click="stopVoiceInput">
        停止录音
      </button>
    </div>
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
  placeholder: '输入消息...',
  maxLength: 2000,
  isLoading: false,
  showCharCount: true,
  autoFocus: false
})

const emit = defineEmits<{
  send: [message: string]
  fileUpload: [files: FileList]
  voiceInput: [audio: Blob]
}>()

// 响应式数据
const inputValue = ref('')
const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()
const showEmojiPicker = ref(false)
const isVoiceInputActive = ref(false)

// 表情列表
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
  '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
  '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
  '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
  '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
  '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
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
    const maxHeight = 120 // 最大高度
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

const handleInput = debounce(() => {
  adjustTextareaHeight()
}, 100)

const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+Enter 或 Cmd+Enter 发送消息
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
    return
  }

  // Escape 关闭表情选择器
  if (event.key === 'Escape') {
    showEmojiPicker.value = false
    return
  }

  // 字符长度限制
  if (inputValue.value.length >= props.maxLength && event.key !== 'Backspace' && event.key !== 'Delete') {
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
    target.value = '' // 清空input
  }
}

const toggleVoiceInput = () => {
  if (isVoiceInputActive.value) {
    stopVoiceInput()
  } else {
    startVoiceInput()
  }
}

const startVoiceInput = () => {
  // 这里需要实现语音输入功能
  // 可以使用 Web Speech API 或其他语音识别服务
  isVoiceInputActive.value = true
  console.log('开始语音输入')
}

const stopVoiceInput = () => {
  isVoiceInputActive.value = false
  console.log('停止语音输入')
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
  background: white;
  border-top: 1px solid #e9ecef;
}

.input-container {
  padding: 16px;
}

.input-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: #007bff;
  color: white;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e9ecef;
  margin: 0 4px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #007bff;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
}

.message-input::placeholder {
  color: #999;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #ccc;
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
  color: #999;
  margin-top: 8px;
}

/* 表情选择器 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 16px;
  right: 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-bottom: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 18px;
  transition: background-color 0.2s;
}

.emoji-btn:hover {
  background: #f8f9fa;
}

/* 语音输入状态 */
.voice-input-status {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #007bff;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  z-index: 1000;
}

.voice-animation {
  display: flex;
  gap: 2px;
}

.voice-wave {
  width: 4px;
  height: 20px;
  background: white;
  border-radius: 2px;
  animation: voiceWave 1s infinite ease-in-out;
}

.voice-wave:nth-child(2) {
  animation-delay: 0.1s;
}

.voice-wave:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes voiceWave {
  0%, 100% {
    height: 20px;
  }
  50% {
    height: 8px;
  }
}

.stop-voice-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.stop-voice-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-container {
    padding: 12px;
  }
  
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .voice-input-status {
    left: 16px;
    right: 16px;
    transform: none;
    flex-direction: column;
    text-align: center;
  }
}
</style>
