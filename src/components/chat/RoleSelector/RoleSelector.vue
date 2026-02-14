<template>
  <div class="role-selector">
    <!-- 头部 -->
    <div class="role-selector-header">
      <h3>选择角色</h3>
      <button class="add-role-btn" @click="openAddRole" title="添加新角色">
        <AppIcon name="plus" />
      </button>
    </div>

    <!-- 角色列表 -->
    <div class="role-list">
      <div
        v-for="role in roles"
        :key="role.id"
        :class="['role-item', { active: currentRole?.id === role.id }]"
        @click="selectRole(role.id)"
      >
        <div class="role-avatar">
          <img :src="role.avatar" :alt="role.name" />
        </div>
        <div class="role-info">
          <h4 class="role-name">{{ role.name }}</h4>
          <p class="role-description">{{ role.description }}</p>
        </div>
        <!-- 操作按钮 -->
        <div class="role-actions">
          <button class="edit-btn" @click.stop="editRole(role)" title="编辑角色">
            <AppIcon name="edit" />
          </button>
          <button class="delete-btn" @click.stop="deleteRole(role)" title="删除角色">
            X
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑模态框 - 改为全局定位 -->
    <div v-if="showAddRoleModal || editingRole" class="modal-overlay-global" @click="closeModal">
      <div class="modal-content-global" @click.stop>
        <div class="modal-header">
          <h3>{{ editingRole ? '编辑角色' : '添加角色' }}</h3>
          <button class="close-btn" @click="closeModal">
            <AppIcon name="close" />
          </button>
        </div>

        <form @submit.prevent="saveRole" class="role-form">
          <!-- 角色名称 -->
          <div class="form-group">
            <label for="role-name">角色名称</label>
            <input
              id="role-name"
              v-model="roleForm.name"
              type="text"
              placeholder="请输入角色名称"
              required
            />
          </div>

          <!-- 角色描述 -->
          <div class="form-group">
            <label for="role-description">角色描述</label>
            <textarea
              id="role-description"
              v-model="roleForm.description"
              placeholder="请输入角色描述"
              rows="3"
            ></textarea>
          </div>

          <!-- 系统提示词 -->
          <div class="form-group">
            <label for="role-prompt">系统提示词</label>
            <textarea
              id="role-prompt"
              v-model="roleForm.systemPrompt"
              placeholder="请输入系统提示词"
              rows="4"
              required
            ></textarea>
          </div>

          <!-- 头像上传 -->
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-upload-container">
              <div v-if="avatarPreview" class="avatar-preview">
                <img :src="avatarPreview" alt="头像预览" />
              </div>
              <div v-else class="avatar-placeholder">
                <AppIcon name="upload" />
                <span>点击上传</span>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarSelect"
                class="avatar-input"
              />
            </div>
          </div>

          <!-- AI 配置选择 -->
          <div class="form-group">
            <label for="role-config">AI 配置</label>
            <select id="role-config" v-model="roleForm.configId" class="ai-config-select">
              <option value="">使用默认配置</option>
              <option v-for="config in aiConfigs" :key="config.id" :value="config.id">
                {{ config.name }}
              </option>
            </select>
          </div>
          
          <!-- AI 模型选择 -->
          <div class="form-group">
            <label for="role-model">AI 模型</label>
            <select id="role-model" v-model="roleForm.model" class="ai-config-select">
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4 (如果可用)</option>
            </select>
          </div>
          
          <!-- 温度设置 -->
          <div class="form-group">
            <label for="role-temperature">温度设置 (0.0-2.0): {{ roleForm.temperature }}</label>
            <input
              id="role-temperature"
              v-model.number="roleForm.temperature"
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              class="temperature-slider"
            />
            <small class="temperature-hint">较低值使输出更确定，较高值增加随机性</small>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn" :disabled="isSaving">
              {{ isSaving ? '保存中...' : editingRole ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/roles'
import { useAIConfigStore } from '@/stores/aiConfig'
import { useAuthStore } from '@/stores/auth'
import { useRoleService } from '@/services/roleService'
import type { Role } from '@/types/role'
import { AppIcon } from '@/components/ui/Icon'

// --- 依赖注入 ---
const roleStore = useRoleStore()
const aiConfigStore = useAIConfigStore()
const authStore = useAuthStore()
const roleService = useRoleService()

// --- 响应式数据 ---
const showAddRoleModal = ref(false)
const editingRole = ref<Role | null>(null)
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)
const isSaving = ref(false)

// --- 表单数据 ---
const roleForm = ref({
  name: '',
  description: '',
  systemPrompt: '',
  avatar: '/role-avatars/default-avatar.png',
  configId: '', // 关联的 AI 配置 ID
  model: 'gpt-3.5-turbo',
  temperature: 0.7
})

// --- 计算属性 ---
const currentRole = computed(() => roleStore.currentRole)
const roles = computed(() => roleStore.roles)
const aiConfigs = computed(() => aiConfigStore.configs)

// --- 方法 ---

// 暴露给父组件的方法
const openAddRole = () => {
  showAddRoleModal.value = true
}
defineExpose({ openAddRole })

// 选择角色
const selectRole = (roleId: string) => {
  roleStore.selectRole(roleId)
}

// 编辑角色
const editRole = (role: Role) => {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description,
    systemPrompt: role.systemPrompt,
    avatar: role.avatar,
    configId: role.configId || '',
    model: 'gpt-3.5-turbo', // 编辑模式下设置默认值
    temperature: 0.7        // 编辑模式下设置默认值
  }
  avatarPreview.value = role.avatar
  showAddRoleModal.value = true
}

// 处理头像选择
const handleAvatarSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    avatarFile.value = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        avatarPreview.value = e.target.result as string
        roleForm.value.avatar = e.target.result as string
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

// 保存角色（创建或更新）
const saveRole = async () => {
  if (!roleForm.value.name.trim()) {
    alert('请输入角色名称')
    return
  }

  isSaving.value = true

  try {
    // 检查是否已登录并有token
    if (!authStore.token) {
      throw new Error('用户未登录，请先登录')
    }

    if (editingRole.value) {
      // 暂时不实现角色更新功能
      console.log('角色编辑功能暂未实现')
    } else {
      // 按照指定格式创建AI配置
        const aiConfigData = {
          name: roleForm.value.name,
          description: roleForm.value.description,
          model: roleForm.value.model,
          temperature: roleForm.value.temperature
        }

      console.log('准备发送的AI配置数据:', aiConfigData)
      
      // 直接调用aiConfigService创建AI配置
      const response = await fetch('https://backend.stage1.fe.tutorial.clouddreamai.com/ai-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(aiConfigData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `创建失败: ${response.status}`)
      }

      const result = await response.json()
      console.log('AI配置创建成功:', result)
      
      // 刷新AI配置列表
      await aiConfigStore.refreshConfigs()
      
      // 刷新角色列表，使新创建的角色显示出来
      await roleStore.refreshRoles()
      
      // 显示成功消息
      alert('角色创建成功！')
    }

    closeModal()
  } catch (err) {
    console.error('保存角色失败', err)
    alert(`保存失败：${err instanceof Error ? err.message : '未知错误'}`)
  } finally {
    isSaving.value = false
  }
}

// 删除角色
const deleteRole = async (role: Role) => {
  if (!confirm(`确定要删除角色「${role.name}」吗？删除后相关的对话记录可能会受到影响。`)) {
    return
  }

  try {
    // 检查是否已登录并有token
    if (!authStore.token) {
      throw new Error('用户未登录，请先登录')
    }

    // 调用删除AI配置的API
    const response = await fetch(`https://backend.stage1.fe.tutorial.clouddreamai.com/ai-configs/${role.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `删除失败: ${response.status}`)
    }

    // 刷新角色列表
    await roleStore.initializeRoles()
    
    // 如果删除的是当前选中的角色，清除当前角色选择
    if (currentRole.value?.id === role.id) {
      roleStore.selectRole('')
    }

    alert('角色删除成功！')
  } catch (err) {
    console.error('删除角色失败', err)
    alert(`删除失败：${err instanceof Error ? err.message : '未知错误'}`)
  }
}

// 关闭模态框
const closeModal = () => {
  showAddRoleModal.value = false
    editingRole.value = null
    avatarFile.value = null
    avatarPreview.value = ''
    roleForm.value = {
      name: '',
      description: '',
      systemPrompt: '',
      avatar: '/role-avatars/default-avatar.png',
      configId: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    }
}

// 初始化
onMounted(async () => {
  await aiConfigStore.initialize()
  await roleStore.initializeRoles()
})
</script>

<style scoped>
/*// 添加新的样式 */
.temperature-slider {
  width: 100%;
  margin: 8px 0;
}

.temperature-hint {
  display: block;
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}
.role-selector {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.role-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.role-selector-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.add-role-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

.add-role-btn:hover {
  background: #0056b3;
}

.role-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.role-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.role-item:hover {
  background: #f8f9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.role-item.active {
  background: #e3f2fd;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.role-avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.role-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.role-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.role-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.role-item:hover .role-actions {
  opacity: 1;
}

.edit-btn,
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  transition: all 0.2s;
  color: #666;
}

.edit-btn:hover {
  color: #007bff;
}

.delete-btn {
  color: #dc3545;
  font-weight: bold;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
}

.delete-btn:hover {
  color: #ffffff;
  background: #dc3545;
}

/* 全局模态框样式 */
.modal-overlay-global {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* 确保在最上层 */
}

.modal-content-global {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.role-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select,
.ai-config-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus,
.ai-config-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.avatar-upload-container {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.avatar-upload-container:hover {
  border-color: #007bff;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  text-align: center;
  color: #999;
}

.avatar-placeholder span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.avatar-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.save-btn {
  background: #007bff;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>
