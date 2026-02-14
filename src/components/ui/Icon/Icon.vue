<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <svg
    :class="['app-icon', `app-icon--${size}`, { 'app-icon--spin': spin }]"
    :width="sizeValue"
    :height="sizeValue"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    viewBox="0 0 24 24"
  >
    <path :d="iconPath" />
  </svg>
</template>

<script setup lang="ts" name="AppIcon">
import { computed } from 'vue'

interface Props {
  name: string
  size?: 'small' | 'medium' | 'large' | number
  fill?: string
  stroke?: string
  strokeWidth?: number
  spin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  fill: 'currentColor',
  stroke: 'none',
  strokeWidth: 2,
  spin: false,
})

// 图标路径映射
const iconPaths: Record<string, string> = {
  // 基础图标
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  copy: 'M8 2H4a2 2 0 0 0-2 2v4M8 2h4M8 2v4M16 2h4a2 2 0 0 1 2 2v4M16 2v4M8 10H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4',
  heart:
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  'arrow-down': 'M6 9l6 6 6-6',
  'arrow-up': 'M18 15l-6-6-6 6',
  'arrow-left': 'M15 18l-6-6 6-6',
  'arrow-right': 'M9 18l6-6-6-6',

  // 聊天相关
  'message-circle':
    'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  mic: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z',
  paperclip:
    'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49',
  smile:
    'M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',

  // 用户相关
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',

  // 文件相关
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  image:
    'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM9 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',

  // 其他
  search: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  menu: 'M3 12h18M3 6h18M3 18h18',
  'more-horizontal':
    'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  'more-vertical':
    'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  x: 'M18 6L6 18M6 6l12 12',
}

const sizeValue = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  }

  return sizeMap[props.size]
})

const iconPath = computed(() => {
  return iconPaths[props.name] || iconPaths['x']
})
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
}

.app-icon--spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
