<template>
  <div class="login-view">
    <!-- 动态背景 -->
    <div class="login-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <div class="login-container">
      <!-- Logo 区域 -->
      <div class="login-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brand-gradient" x1="8" y1="8" x2="56" y2="56">
                <stop stop-color="#4f7fb8" />
                <stop offset="1" stop-color="#7aa6db" />
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="48" height="48" rx="16" fill="url(#brand-gradient)" />
            <path
              d="M22 24.5H42C44.2 24.5 46 26.3 46 28.5V35.5C46 37.7 44.2 39.5 42 39.5H31L24.5 45.5V39.5H22C19.8 39.5 18 37.7 18 35.5V28.5C18 26.3 19.8 24.5 22 24.5Z"
              fill="#fff"
            />
            <circle cx="26.5" cy="32" r="1.8" fill="#6f94bf" />
            <circle cx="32" cy="32" r="1.8" fill="#6f94bf" />
            <circle cx="37.5" cy="32" r="1.8" fill="#6f94bf" />
            <path d="M43 19L44.3 21.8L47 23L44.3 24.2L43 27L41.7 24.2L39 23L41.7 21.8L43 19Z" fill="#fff" />
          </svg>
        </div>
        <h1 class="brand-title">
          <span class="gradient-text">AI 角色对话</span>
        </h1>
        <p class="brand-subtitle">沉浸式智能对话体验</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form-wrapper">
        <div class="login-header">
          <h2>欢迎回来</h2>
          <p>登录您的账户以继续</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">
              <span class="label-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              用户名
            </label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
              required
              :disabled="isLoading"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <span class="label-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              密码
            </label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
              required
              :disabled="isLoading"
              class="input-field"
            />
          </div>

          <div v-if="error" class="error-message" role="alert" aria-live="polite">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ error }}
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10,17 15,12 10,7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              登录
            </span>
          </button>
        </form>

        <div class="login-footer">
          <p>
            还没有账户？
            <a href="#" @click.prevent="showRegister = true" class="register-link">
              立即注册
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- 注册模态框 -->
    <Transition name="modal">
      <div v-if="showRegister" class="modal-overlay" @click="showRegister = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>创建新账户</h3>
            <button class="close-button" @click="showRegister = false">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleRegister">
              <div class="form-group">
                <label for="reg-username">用户名</label>
                <input
                  id="reg-username"
                  v-model="registerForm.username"
                  type="text"
                  placeholder="3-20位，仅字母/数字/下划线"
                  autocomplete="username"
                  autocapitalize="none"
                  spellcheck="false"
                  required
                  maxlength="20"
                  :disabled="isLoading"
                  class="input-field"
                />
                <p class="field-help">3-20 位，只能用字母、数字、下划线</p>
              </div>

              <div class="form-group">
                <label for="reg-displayName">显示名称</label>
                <input
                  id="reg-displayName"
                  v-model="registerForm.displayName"
                  type="text"
                  placeholder="请输入显示名称"
                  autocomplete="nickname"
                  required
                  maxlength="30"
                  :disabled="isLoading"
                  class="input-field"
                />
              </div>

              <div class="form-group">
                <label for="reg-password">密码</label>
                <input
                  id="reg-password"
                  v-model="registerForm.password"
                  type="password"
                  placeholder="6-50位密码"
                  autocomplete="new-password"
                  required
                  minlength="6"
                  maxlength="50"
                  :disabled="isLoading"
                  class="input-field"
                />
                <p class="field-help">建议包含字母和数字，长度 6-50 位</p>
              </div>

              <div class="form-group">
                <label for="reg-confirmPassword">确认密码</label>
                <input
                  id="reg-confirmPassword"
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                  required
                  :disabled="isLoading"
                  class="input-field"
                />
              </div>

              <div v-if="registerError" class="error-message" role="alert" aria-live="polite">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ registerError }}
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="cancel-button"
                  @click="showRegister = false"
                  :disabled="isLoading"
                >
                  取消
                </button>
                <button
                  type="submit"
                  class="register-button"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="loading-spinner"></span>
                  <span v-else>注册</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest, RegisterRequest } from '@/services/api/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const isLoading = ref(false)
const error = ref('')
const registerError = ref('')
const showRegister = ref(false)

// 登录表单
const loginForm = ref<LoginRequest>({
  username: '',
  password: '',
})

// 注册表单
const registerForm = ref<RegisterRequest & { confirmPassword: string }>({
  username: '',
  password: '',
  displayName: '',
  confirmPassword: '',
})

// 计算属性
const isFormValid = computed(() => {
  return loginForm.value.username.trim() !== '' && loginForm.value.password.trim() !== ''
})

const getRegisterValidationError = () => {
  const username = registerForm.value.username.trim()
  const displayName = (registerForm.value.displayName ?? '').trim()
  const password = registerForm.value.password
  const confirmPassword = registerForm.value.confirmPassword

  if (!username) return '请输入用户名'
  if (username.length < 3 || username.length > 20) return '用户名长度需为 3-20 位'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return '用户名仅支持字母、数字、下划线'

  if (!displayName) return '请输入显示名称'
  if (displayName.length > 30) return '显示名称不能超过 30 个字符'

  if (!password) return '请输入密码'
  if (password.length < 6 || password.length > 50) return '密码长度需为 6-50 位'

  if (!confirmPassword) return '请再次输入密码'
  if (password !== confirmPassword) return '两次输入的密码不一致'

  return ''
}

watch(
  loginForm,
  () => {
    if (error.value) {
      error.value = ''
    }
  },
  { deep: true },
)

watch(
  registerForm,
  () => {
    if (registerError.value) {
      registerError.value = ''
    }
  },
  { deep: true },
)

watch(showRegister, (visible) => {
  if (visible) {
    registerError.value = ''
  }
})

// 方法
const handleLogin = async () => {
  if (!isFormValid.value) {
    error.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const success = await authStore.login(loginForm.value)

    if (success) {
      // 登录成功，跳转到聊天页面
      router.push('/chat')
    } else {
      error.value = authStore.error || '登录失败，请检查用户名和密码'
      console.error('登录失败:', authStore.error)
    }
  } catch (err) {
    error.value = '登录过程中发生错误'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  const validationError = getRegisterValidationError()
  if (validationError) {
    registerError.value = validationError
    return
  }

  isLoading.value = true
  registerError.value = ''

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = registerForm.value
    const success = await authStore.register(registerData)

    if (success) {
      // 注册成功，关闭注册模态框并跳转到聊天页面
      showRegister.value = false
      router.push('/chat')
    } else {
      registerError.value = authStore.error || '注册失败，请重试'
      console.error('注册失败:', authStore.error)
    }
  } catch (err) {
    registerError.value = '注册过程中发生错误'
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}

// 重置表单（如果需要的话）
// const resetForms = () => {
//   loginForm.value = { username: '', password: '' }
//   registerForm.value = { username: '', password: '', displayName: '', confirmPassword: '' }
//   error.value = ''
//   registerError.value = ''
// }
</script>

<style scoped>
.login-view {
  height: 100%;
  min-height: 100dvh;
  max-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--color-bg-primary);
  padding:
    clamp(14px, 2.2vh, 24px)
    clamp(14px, 3vw, 24px)
    calc(clamp(14px, 2.2vh, 24px) + env(safe-area-inset-bottom));
}

/* 动态背景 */
.login-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%);
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
}

/* 主容器 */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 430px;
  animation: slideUp 0.6s ease-out;
}

/* 品牌区域 */
.login-brand {
  text-align: center;
  margin-bottom: 18px;
}

.brand-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 10px;
  position: relative;
}

.brand-icon::before {
  content: '';
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(124, 156, 191, 0.4) 0%, transparent 70%);
  border-radius: var(--radius-full);
  filter: blur(18px);
}

.brand-icon::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 24px;
  border: 1px solid rgba(124, 156, 191, 0.25);
}

.brand-icon svg {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 10px 20px rgba(79, 127, 184, 0.25));
}

.brand-title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* 表单容器 */
.login-form-wrapper {
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(124, 156, 191, 0.2);
  border-radius: var(--radius-xl);
  padding: clamp(18px, 3vw, 28px);
  box-shadow:
    0 24px 40px -20px rgba(84, 106, 139, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.35);
}

.login-header {
  text-align: center;
  margin-bottom: 14px;
}

.login-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.login-header p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 表单样式 */
.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.label-icon {
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(124, 156, 191, 0.24);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 15px;
  transition: all var(--transition-base);
}

.input-field:hover {
  border-color: rgba(14, 165, 233, 0.3);
}

.input-field:focus {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px rgba(14, 165, 233, 0.15),
    0 0 20px rgba(14, 165, 233, 0.1);
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text-tertiary);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-help {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-tertiary);
}

/* 错误消息 */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 13px;
  margin-bottom: var(--space-md);
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: var(--space-md);
  background: linear-gradient(135deg, #4f7fb8 0%, #7aa6db 100%);
  border: 1px solid rgba(79, 127, 184, 0.25);
  border-radius: var(--radius-md);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  transition: all var(--transition-base);
  box-shadow: 0 12px 24px rgba(79, 127, 184, 0.35);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(79, 127, 184, 0.48);
}

.login-button:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载动画 */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 底部链接 */
.login-footer {
  text-align: center;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-divider);
}

.login-footer p {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.register-link {
  color: #4f6f95;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(124, 156, 191, 0.16);
  border: 1px solid rgba(124, 156, 191, 0.24);
  transition: all var(--transition-fast);
}

.register-link:hover {
  color: #ffffff;
  background: linear-gradient(135deg, #68aa84 0%, #8bc7a5 100%);
  border-color: transparent;
  gap: 8px;
}

.register-link svg {
  transition: transform var(--transition-fast);
}

.register-link:hover svg {
  transform: translateX(2px);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  z-index: 1000;
  padding: clamp(14px, 3vh, 28px) var(--space-md);
}

.modal-content {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 450px;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-divider);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.close-button:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-lg);
}

.modal-footer {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-divider);
}

.cancel-button {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cancel-button:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.register-button {
  padding: var(--space-sm) var(--space-lg);
  background: linear-gradient(135deg, #52b788 0%, #74c69d 100%);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: 0 10px 20px rgba(82, 183, 136, 0.28);
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(82, 183, 136, 0.4);
}

.cancel-button:disabled,
.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--transition-base);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all var(--transition-spring);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-view {
    align-items: flex-start;
    padding:
      12px
      var(--space-sm)
      calc(var(--space-sm) + env(safe-area-inset-bottom));
  }

  .login-form-wrapper {
    padding: 16px;
  }

  .brand-title {
    font-size: 26px;
  }

  .brand-subtitle {
    font-size: 13px;
  }

  .brand-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 8px;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    margin: 0;
    max-height: calc(100dvh - 20px);
  }
}
</style>
