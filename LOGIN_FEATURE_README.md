# 聊天系统 - 完整API集成

## 功能概述

已成功为聊天系统添加了完整的用户认证和AI配置功能，包括：

- 用户登录页面和注册功能
- 路由守卫保护
- 自动token验证
- 退出登录功能
- AI配置管理（创建、更新、删除）
- 真实AI对话API集成

## 新增文件

### 1. 登录页面 (`src/views/LoginView.vue`)

- 美观的登录界面设计
- 用户名和密码登录
- 内置注册功能（模态框形式）
- 表单验证和错误处理
- 响应式设计

### 2. 更新的路由配置 (`src/router/index.ts`)

- 添加了 `/login` 路由
- 实现了路由守卫，保护需要认证的页面
- 自动重定向逻辑

### 3. 更新的主应用 (`src/App.vue`)

- 添加了认证状态初始化
- 条件性初始化应用数据

### 4. 更新的聊天页面 (`src/views/ChatView.vue`)

- 添加了退出登录按钮
- 集成了认证状态管理

## API 接口集成

### 认证接口

#### 用户注册

```
POST https://backend.stage1.fe.tutorial.clouddreamai.com/auth/register
Content-Type: application/json

{
  "username": "student001",
  "password": "Passw0rd!",
  "displayName": "张三"
}
```

#### 用户登录

```
POST https://backend.stage1.fe.tutorial.clouddreamai.com/auth/login
Content-Type: application/json

{
  "username": "student001",
  "password": "Passw0rd!"
}
```

#### 获取用户信息

```
GET https://backend.stage1.fe.tutorial.clouddreamai.com/auth/profile
Authorization: Bearer <token>
```

### AI配置接口

#### 创建AI配置

```
POST https://backend.stage1.fe.tutorial.clouddreamai.com/ai-configs
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "前端入门助手",
  "description": "帮助我复习基础知识",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7
}
```

#### 获取AI配置列表

```
GET https://backend.stage1.fe.tutorial.clouddreamai.com/ai-configs
Authorization: Bearer <token>
```

#### 更新AI配置

```
PUT https://backend.stage1.fe.tutorial.clouddreamai.com/ai-configs/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "更新后的配置名称",
  "temperature": 0.8
}
```

#### 删除AI配置

```
DELETE https://backend.stage1.fe.tutorial.clouddreamai.com/ai-configs/{id}
Authorization: Bearer <token>
```

### AI对话接口

#### 发送AI对话请求

```
POST https://backend.stage1.fe.tutorial.clouddreamai.com/api/ai
Content-Type: application/json
Authorization: Bearer <token>

{
  "configId": "6f16eca6-edfa-4126-8efa-0094395e18b4",
  "message": "你好，可以用一句话解释变量吗？"
}
```

## 使用流程

### 认证流程

1. **首次访问**: 用户访问任何页面都会被重定向到登录页面
2. **注册新用户**: 在登录页面点击"立即注册"链接
3. **登录**: 输入用户名和密码进行登录
4. **自动跳转**: 登录成功后自动跳转到聊天页面
5. **退出登录**: 在聊天页面点击退出登录按钮

### AI配置管理

1. **创建配置**: 登录后可以创建自定义AI配置
2. **选择配置**: 在聊天时选择不同的AI配置
3. **更新配置**: 修改现有配置的参数
4. **删除配置**: 删除不需要的配置

### AI对话流程

1. **选择角色**: 从左侧选择要对话的角色
2. **选择配置**: 选择AI配置（可选）
3. **发送消息**: 输入消息并发送
4. **获取回复**: AI根据配置返回相应回复

## 安全特性

- **Token验证**: 每次访问受保护页面都会验证token有效性
- **自动登出**: Token无效时自动清除认证状态并跳转到登录页
- **本地存储**: 认证信息安全存储在localStorage中
- **路由保护**: 未认证用户无法访问聊天功能

## 开发说明

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 技术实现

### 前端架构

- **状态管理**: 使用Pinia管理认证状态和AI配置
- **路由守卫**: Vue Router的beforeEach守卫保护页面
- **API集成**: 基于axios的HTTP客户端，支持JWT认证
- **类型安全**: 完整的TypeScript类型定义
- **响应式设计**: 支持移动端和桌面端

### 核心服务

- **认证服务**: 处理登录、注册、token验证
- **AI配置服务**: 管理AI配置的CRUD操作
- **聊天服务**: 处理AI对话请求和响应
- **存储服务**: 本地数据持久化

### 数据流

1. 用户登录 → 获取JWT token
2. Token存储 → 本地localStorage
3. API请求 → 自动添加Authorization头
4. AI配置 → 绑定到用户账户
5. 对话请求 → 携带配置ID和消息

## 注意事项

1. 确保后端API服务正常运行
2. 检查网络连接和API端点配置
3. 本地存储的数据在清除浏览器数据时会丢失
4. Token过期时间由后端控制

## 测试建议

### 认证功能测试

1. 测试注册新用户流程
2. 测试登录和自动跳转
3. 测试token过期处理
4. 测试退出登录功能
5. 测试页面刷新后的状态保持

### AI配置功能测试

1. 测试创建AI配置
2. 测试获取配置列表
3. 测试更新配置参数
4. 测试删除配置
5. 测试配置选择功能

### AI对话功能测试

1. 测试发送消息到AI
2. 测试不同配置的回复差异
3. 测试错误处理和重试机制
4. 测试消息历史记录
5. 测试会话管理
