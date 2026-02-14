<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>欢迎使用聊天系统</h1>
        <p>请登录您的账户</p>
      </div>

      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="请输入用户名"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              required
              :disabled="isLoading"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="login-button" :disabled="isLoading || !isFormValid">
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <div class="login-footer">
          <p>
            还没有账户？
            <a href="#" @click.prevent="showRegister = true">立即注册</a>
          </p>
        </div>
      </div>
    </div>

    <!-- 注册模态框 -->
    <div v-if="showRegister" class="modal-overlay" @click="showRegister = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>注册新账户</h3>
          <button class="close-button" @click="showRegister = false">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="reg-username">用户名</label>
              <input
                id="reg-username"
                v-model="registerForm.username"
                type="text"
                placeholder="请输入用户名"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="reg-displayName">显示名称</label>
              <input
                id="reg-displayName"
                v-model="registerForm.displayName"
                type="text"
                placeholder="请输入显示名称"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="reg-password">密码</label>
              <input
                id="reg-password"
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="reg-confirmPassword">确认密码</label>
              <input
                id="reg-confirmPassword"
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                required
                :disabled="isLoading"
              />
            </div>

            <div v-if="registerError" class="error-message">
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
                :disabled="isLoading || !isRegisterFormValid"
              >
                <span v-if="isLoading">注册中...</span>
                <span v-else>注册</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

const isRegisterFormValid = computed(() => {
  return (
    registerForm.value.username.trim() !== '' &&
    (registerForm.value.displayName?.trim() || '').length > 0 &&
    registerForm.value.password.trim() !== '' &&
    registerForm.value.confirmPassword.trim() !== '' &&
    registerForm.value.password === registerForm.value.confirmPassword
  )
})

// 方法
const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    console.log('登录请求数据:', loginForm.value)
    const success = await authStore.login(loginForm.value)
    console.log('登录结果:', success)

    if (success) {
      // 登录成功，跳转到聊天页面
      console.log('登录成功，准备跳转')
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
  if (!isRegisterFormValid.value) return

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = '两次输入的密码不一致'
    return
  }

  isLoading.value = true
  registerError.value = ''

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = registerForm.value
    console.log('注册请求数据:', registerData)
    const success = await authStore.register(registerData)
    console.log('注册结果:', success)

    if (success) {
      // 注册成功，关闭注册模态框并跳转到聊天页面
      showRegister.value = false
      console.log('注册成功，准备跳转')
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px solid #fcc;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
}

.login-footer p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e1e5e9;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e1e5e9;
}

.cancel-button {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
  background-color: #e9e9e9;
}

.register-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.cancel-button:disabled,
.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 24px;
    margin: 10px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .modal-content {
    margin: 10px;
  }

  .modal-header,
  .modal-body {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
