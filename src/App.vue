<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoleStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'

const roleStore = useRoleStore()
const authStore = useAuthStore()

onMounted(async () => {
  // 初始化认证状态
  authStore.initAuth()

  // 初始化应用（只有在已认证时才初始化角色）
  if (authStore.isAuthenticated) {
    roleStore.initializeRoles()
  }
})
</script>

<style>
/* ============================================
   CSS 变量定义 — 低饱和柔焦渐变主题
   主色：低饱和蓝紫 #7c9cbf → 柔和天蓝 #a8c5e0
   背景：柔和渐变底色
   ============================================ */
:root {
  /* 主色调 — 低饱和柔和渐变 */
  --color-primary: #7c9cbf;
  --color-primary-light: #a8c5e0;
  --color-primary-dark: #5a7a9e;
  --color-primary-gradient: linear-gradient(135deg, #8fa9c7 0%, #b8d4e8 100%);

  /* 背景色 — 柔和渐变底色 */
  --color-bg-primary: #f5f7fa;
  --color-bg-secondary: #fafbfc;
  --color-bg-tertiary: #eef2f7;
  --color-bg-elevated: #ffffff;

  /* 文字色 — 降低对比度 */
  --color-text-primary: #2d3748;
  --color-text-secondary: #5a6c7d;
  --color-text-tertiary: #8b9aab;
  --color-text-muted: #b8c5d3;

  /* 边框和分隔线 — 更柔和 */
  --color-border: rgba(124, 156, 191, 0.12);
  --color-border-light: rgba(124, 156, 191, 0.06);
  --color-divider: rgba(124, 156, 191, 0.08);

  /* 状态色 — 降低饱和度 */
  --color-success: #52b788;
  --color-warning: #f4a261;
  --color-error: #e76f51;
  --color-info: #7c9cbf;

  /* 阴影 — 更柔和的软阴影 */
  --shadow-sm: 0 2px 8px rgba(124, 156, 191, 0.08);
  --shadow-md: 0 4px 16px rgba(124, 156, 191, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 8px 32px rgba(124, 156, 191, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-glow: 0 0 24px rgba(124, 156, 191, 0.25);

  /* 圆角 — 更圆润 */
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* 间距 — 增加留白 */
  --space-xs: 6px;
  --space-sm: 12px;
  --space-md: 20px;
  --space-lg: 32px;
  --space-xl: 48px;
  --space-2xl: 64px;

  /* 过渡 — 更柔和的动画 */
  --transition-fast: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 450ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

#app {
  height: 100vh;
  overflow: hidden;
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  line-height: 1.75;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  letter-spacing: 0.01em;
}

/* 滚动条 — 柔和样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(124, 156, 191, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 156, 191, 0.35);
}

/* 选择文本 */
::selection {
  background: rgba(124, 156, 191, 0.2);
  color: var(--color-text-primary);
}

/* 焦点 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 按钮重置 */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

/* 输入框重置 */
input,
textarea {
  font-family: inherit;
  background: none;
  border: none;
  outline: none;
}

/* 链接 */
a {
  color: var(--color-primary-light);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary);
}

/* 全局动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(14, 165, 233, 0.5), 0 0 10px rgba(14, 165, 233, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.8), 0 0 30px rgba(14, 165, 233, 0.5);
  }
}

/* 渐变文字 */
.gradient-text {
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 玻璃态 — 增强毛玻璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(124, 156, 191, 0.15);
  box-shadow: 0 8px 32px rgba(124, 156, 191, 0.1);
}
</style>
