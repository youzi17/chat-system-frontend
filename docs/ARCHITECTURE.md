# Chat System 前端架构文档

> 版本：2.1.0
> 最后更新：2026-02-25

---

## 1. 项目概述

### 1.1 项目简介

Chat System 前端是基于 Vue 3 + TypeScript 的 RAG 双角色专属对话界面。固定提供两个角色（虚构角色模拟 / 中医知识专家），用户选择角色后直接开始对话，无需配置 AI 参数。

### 1.2 核心特性

- 固定双角色，前端常量驱动，无动态配置
- 首屏欢迎页角色选择，进入聊天后侧边栏切换
- JWT 用户认证（登录/注册/Token 管理）
- 聊天记录本地持久化，按角色隔离会话历史
- 深色暖青主题（天蓝 #0ea5e9 + 青绿 #14b8a6），CSS 变量统一管理
- 响应式设计，适配桌面端

### 1.3 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Vue 3.5+（Composition API） |
| 类型 | TypeScript 5.9+ |
| 状态管理 | Pinia 3.0+ |
| 路由 | Vue Router 4.5+ |
| 构建 | Vite 7.1+ |
| HTTP | 自定义 HttpClient（基于 Fetch API） |
| 规范 | ESLint + Prettier |

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Views + Components + Router)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       State Management Layer        │
│           (Pinia Stores)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Service Layer              │
│      (API Services + Utils)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           Data Layer                │
│   (HTTP Client + Local Storage)     │
└─────────────────────────────────────┘
```

### 2.2 角色驱动模型

角色列表不再从后端 API 动态加载，改为前端常量定义：

```typescript
// src/types/role.ts
export type RoleKey = 'character' | 'tcm_expert';

export interface FixedRole {
  key: RoleKey;
  name: string;
  description: string;
  avatar: string;
}

export const FIXED_ROLES: FixedRole[] = [
  { key: 'character',   name: '虚构角色',     description: '...', avatar: '...' },
  { key: 'tcm_expert',  name: '中医知识专家', description: '...', avatar: '...' },
];
```

发送消息时传 `roleKey` 而非 `configId`，后端根据 `roleKey` 查找角色常量配置并执行 RAG 检索。

---

## 3. 目录结构

```
frontend/src/
├── components/
│   ├── chat/
│   │   ├── RoleSelector/        # 固定双角色卡片 + 当前角色会话历史
│   │   ├── ChatMessage/         # 单条消息渲染
│   │   ├── MessageList/         # 消息列表
│   │   ├── InputArea/           # 输入框
│   │   └── Loading/             # 加载状态
│   └── ui/
│       ├── Button/
│       └── Icon/
├── composables/
│   ├── useChat.ts               # 聊天业务逻辑（自动使用当前角色 roleKey）
│   ├── useAuthApi.ts            # 认证 API 封装
│   └── useScroll.ts             # 滚动控制
├── stores/
│   ├── auth.ts                  # 认证状态
│   ├── roles.ts                 # 角色状态（FIXED_ROLES 常量驱动，支持 clearRole 回到欢迎页）
│   └── chat.ts                  # 聊天状态（roleKey 驱动，支持 backendSessionId 续接后端会话）
├── services/
│   ├── api/
│   │   ├── base.ts              # HTTP 客户端
│   │   ├── auth.ts              # 认证 API
│   │   └── aiChat.ts            # AI 对话 API（传 roleKey + sessionId）
│   └── aiChatService.ts         # AI 聊天服务封装（返回 { response, sessionId }）
├── types/
│   ├── role.ts                  # RoleKey、FixedRole、FIXED_ROLES
│   ├── chat.ts                  # ChatMessage、ChatSession、SendMessageParams、ChatRequest、ChatResponse
│   └── token.ts                 # Token 相关类型
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── storage.ts
│   └── tokenUtils.ts
├── assets/
│   ├── main.css                 # CSS 入口
│   └── styles/
│       ├── variables.css        # 补充变量（字体、z-index、断点）
│       └── global.css           # 全局基础样式
├── views/
│   ├── ChatView.vue             # 首屏欢迎页 + 侧边栏聊天布局
│   └── LoginView.vue
├── router/index.ts
├── App.vue                      # CSS 变量定义（深色暖青主题）
└── main.ts
```

> 已删除：`stores/aiConfig.ts`、`services/aiConfigService.ts`、`services/api/aiConfig.ts`、`services/api/roles.ts`、`services/roleService.ts`、`types/aiConfig.ts`、`composables/useApi.ts`

---

## 4. 核心模块详解

### 4.1 路由系统

**文件**：`src/router/index.ts`

路由表：
- `/` → 重定向到 `/chat`
- `/login` — 登录页（无需认证）
- `/chat` — 聊天页（需要认证）
- `/*` → 重定向到 `/login`

路由守卫：检查认证状态 → 验证 Token 有效性 → 跳转。

### 4.2 状态管理

#### auth.ts
**职责**：用户登录/注册、Token 管理、登录状态持久化。

核心方法：`login()` / `logout()` / `validateToken()` / `initAuth()`

#### roles.ts
**职责**：管理当前选中角色，角色列表直接来自 `FIXED_ROLES` 常量，不调用后端 API。

核心方法：
- `initializeRoles()` — 从 localStorage 恢复上次选中角色
- `selectRole(roleKey)` — 切换角色，自动关联到对应会话
- `clearRole()` — 清除角色选择，回到首屏欢迎页

#### chat.ts
**职责**：会话管理、消息管理、本地持久化。

核心方法：
- `createSession(title, roleKey)` — 创建新会话，绑定 `roleKey`
- `sendMessage(params)` — 发送消息，调用 `aiChatService.sendChatRequest(message, roleKey, sessionId?)`
- `selectSession(sessionId)` — 切换会话
- `deleteSession(sessionId)` — 删除会话
- `getSessionsByRoleKey(roleKey)` — 获取指定角色的会话列表（按更新时间倒序）

会话通过 `backendSessionId` 字段与后端会话关联，首次发送消息后由后端返回。

### 4.3 服务层

#### aiChat.ts（API 层）
发送消息接口，请求体使用 `roleKey` + 可选 `sessionId`：

```typescript
POST /api/ai
Request:  { roleKey: 'character', message: '你好', sessionId?: 'uuid' }
Response: { success: true, data: { response: '...', sessionId: 'uuid' } }
```

#### aiChatService.ts
封装 `sendChatRequest(message, roleKey, sessionId?)`，处理认证 Token 注入和响应解析，返回 `{ response, sessionId }`。

### 4.4 RoleSelector 组件

固定渲染两个角色卡片（来自 `FIXED_ROLES`），点击切换当前角色。选中角色后显示该角色的会话历史列表，支持新建和删除会话。无 CRUD 操作，无模态框。

### 4.5 ChatView 页面

两种状态：
- **未选择角色**：显示首屏欢迎页，两张角色卡片居中展示，点击进入聊天
- **已选择角色**：左侧 RoleSelector 侧边栏 + 右侧聊天区域（MessageList + InputArea）

头部提供"切换角色"按钮（回到欢迎页）、"清空对话"按钮、"退出登录"按钮。

---

## 5. 数据流

### 5.1 用户认证流程

```
用户输入 → LoginView
    ↓
authStore.login()
    ↓
authService.login() → POST /auth/login
    ↓
存储 Token → 更新 authStore
    ↓
路由守卫验证 → 跳转 /chat
```

### 5.2 聊天消息流程

```
用户输入消息 → InputArea
    ↓
useChat.sendMessage(content)
    ↓
chatStore.sendMessage({ content, roleKey })
    ↓
添加用户消息 + AI 占位消息到本地状态
    ↓
aiChatService.sendChatRequest(message, roleKey, backendSessionId?)
    ↓
POST /api/ai { roleKey, message, sessionId? }
    ↓
接收 { response, sessionId }
    ↓
保存 backendSessionId → 更新 AI 消息内容 → 本地持久化
```

### 5.3 角色切换流程

```
用户点击角色卡片 → RoleSelector
    ↓
roleStore.selectRole(roleKey)
    ↓
查找该角色已有会话 → 有则切换，无则新建
    ↓
chatStore.selectSession() 或 createSession()
```

---

## 6. 类型定义

### role.ts（改造后）

```typescript
export type RoleKey = 'character' | 'tcm_expert';

export interface FixedRole {
  key: RoleKey;
  name: string;
  description: string;
  avatar: string;
}

export const FIXED_ROLES: FixedRole[];
```

### chat.ts（改造后）

```typescript
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  roleKey: RoleKey;
  backendSessionId?: string;  // 后端会话 ID，首次发送后由后端返回
}

export interface SendMessageParams {
  content: string;
  roleKey: RoleKey;
}

export interface ChatRequest {
  roleKey: RoleKey;
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
}
```

---

## 7. 本地持久化

- 会话列表和当前会话存储到 `localStorage`
- 节流写入（500ms），避免频繁 IO
- 会话数量上限：`CHAT_LIMITS.MAX_SESSIONS`
- 每会话消息上限：`CHAT_LIMITS.MAX_MESSAGES_PER_SESSION`
- 当前选中角色持久化到 `localStorage`（key: `STORAGE_KEYS.SELECTED_ROLE`）

---

## 8. 开发规范

- **类型安全**：禁止使用 `any`
- **单一职责**：每个 store / service / 组件只负责一个明确职责
- **最简原则**：不做向后兼容，不做冗余设计
- **命名**：组件 PascalCase，文件夹 kebab-case，变量/函数 camelCase，常量 UPPER_SNAKE_CASE
- **组件结构**：`ComponentName/ComponentName.vue` + `index.ts`
- **错误处理**：所有 API 调用必须有 try-catch，记录错误日志

---

## 9. 主题设计

### 9.1 色系方案

深色暖青主题，CSS 变量统一定义在 `App.vue :root` 中：

| 变量 | 值 | 用途 |
|------|------|------|
| `--color-primary` | `#0ea5e9` | 天蓝主色 |
| `--color-primary-light` | `#38bdf8` | 主色亮色 |
| `--color-primary-dark` | `#0284c7` | 主色暗色 |
| `--color-primary-gradient` | `#0ea5e9 → #14b8a6` | 主色渐变（天蓝→青绿） |
| `--color-bg-primary` | `#111318` | 主背景（暖灰深色） |
| `--color-bg-secondary` | `#1a1d24` | 次级背景 |
| `--color-bg-tertiary` | `#242830` | 三级背景 |
| `--color-bg-elevated` | `#2c313a` | 浮层背景 |

### 9.2 CSS 变量体系

- 主色/背景/文字/边框/状态色：`App.vue :root`
- 间距：`--space-xs` ~ `--space-2xl`
- 圆角：`--radius-sm` ~ `--radius-full`
- 过渡：`--transition-fast` / `--transition-base` / `--transition-slow`
- 字体/z-index/断点：`assets/styles/variables.css`

所有组件使用 CSS 变量，不使用硬编码颜色值。不使用 Tailwind。
