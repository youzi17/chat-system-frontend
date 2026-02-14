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
    await roleStore.initializeRoles()
  }
})
</script>

<style>
#app {
  height: 100vh;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: #333;
  background: #f8f9fa;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 选择文本样式 */
::selection {
  background: rgba(0, 123, 255, 0.2);
}

/* 焦点样式 */
:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* 按钮重置 */
button {
  font-family: inherit;
}

/* 输入框重置 */
input,
textarea {
  font-family: inherit;
}

/* 链接样式 */
a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
