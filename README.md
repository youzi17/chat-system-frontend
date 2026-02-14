# 角色对话模拟器

一个基于 Vue 3 + TypeScript 的现代化聊天应用，支持多角色对话模拟。

## ✨ 特性

- 🎭 **多角色支持** - 支持动漫角色、游戏角色和自定义角色
- 💬 **实时聊天** - 流畅的聊天体验，支持表情和文件上传
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化UI** - 简洁美观的用户界面
- 🔧 **高度可配置** - 支持自定义角色和系统提示词
- 💾 **本地存储** - 会话历史自动保存
- 🚀 **TypeScript** - 完整的类型支持
- 📦 **模块化架构** - 清晰的代码结构

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **样式**: CSS3 + CSS Variables
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
chat-system/
├── public/                 # 静态资源
│   ├── favicon.ico
│   └── role-avatars/       # 角色头像目录
├── src/
│   ├── assets/            # 项目资源
│   │   ├── styles/        # 全局样式
│   │   │   ├── global.css
│   │   │   └── variables.css
│   │   └── images/        # 图片资源
│   ├── components/        # 可复用组件
│   │   ├── chat/          # 聊天相关组件
│   │   │   ├── RoleSelector/
│   │   │   ├── ChatMessage/
│   │   │   ├── MessageList/
│   │   │   ├── InputArea/
│   │   │   └── Loading/
│   │   └── ui/            # 基础UI组件
│   │       ├── Button/
│   │       └── Icon/
│   ├── composables/       # 组合式函数
│   │   ├── useChat.ts
│   │   ├── useApi.ts
│   │   └── useScroll.ts
│   ├── stores/            # Pinia 状态管理
│   │   ├── chat.ts
│   │   ├── roles.ts
│   │   └── index.ts
│   ├── services/          # API 服务层
│   │   ├── api/
│   │   │   ├── base.ts
│   │   │   ├── chat.ts
│   │   │   └── roles.ts
│   │   └── types/
│   │       ├── api.ts
│   │       └── response.ts
│   ├── types/             # TypeScript 类型定义
│   │   ├── chat.ts
│   │   ├── role.ts
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── storage.ts
│   ├── views/             # 页面组件
│   │   └── ChatView.vue
│   ├── router/            # 路由配置
│   │   └── index.ts
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎯 功能说明

### 角色管理

- **预设角色**: 可设置角色
- **自定义角色**: 支持添加、编辑、删除自定义角色
- **角色分类**: 按动漫、游戏、自定义分类管理
- **系统提示词**: 每个角色都有独特的系统提示词

### 聊天功能

- **多会话管理**: 支持创建、切换、删除多个对话会话
- **消息类型**: 支持文本消息，预留图片和文件上传接口
- **实时交互**: 流畅的消息发送和接收体验
- **消息操作**: 复制、点赞、删除消息
- **自动滚动**: 新消息自动滚动到底部

### 用户体验

- **响应式设计**: 完美适配各种屏幕尺寸
- **深色模式**: 支持系统深色模式偏好
- **键盘快捷键**: Ctrl+Enter 发送消息
- **表情支持**: 内置表情选择器
- **本地存储**: 会话历史和设置自动保存

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```env
# API 基础URL
VITE_API_BASE_URL=http://localhost:3000

# 其他配置
VITE_APP_TITLE=角色对话模拟器
```

### 自定义配置

在 `src/utils/constants.ts` 中可以修改：

- 聊天限制（最大消息长度、会话数量等）
- UI 常量（动画时长、防抖延迟等）
- API 端点配置

## 📝 开发指南

### 添加新角色

1. 在 `src/stores/roles.ts` 的 `initializeRoles` 方法中添加角色数据
2. 将角色头像放在 `public/role-avatars/` 目录下
3. 角色数据包含：id、name、description、avatar、systemPrompt、category

### 自定义组件

所有组件都遵循以下结构：

```
ComponentName/
├── ComponentName.vue    # 组件实现
└── index.ts            # 导出文件
```

### 状态管理

使用 Pinia 进行状态管理：

- `useChatStore`: 聊天相关状态
- `useRoleStore`: 角色相关状态

### API 集成

API 服务层位于 `src/services/` 目录：

- `base.ts`: HTTP 客户端基础配置
- `chat.ts`: 聊天相关 API
- `roles.ts`: 角色相关 API

## 🎨 样式系统

### CSS 变量

项目使用 CSS 变量系统，在 `src/assets/styles/variables.css` 中定义：

- 颜色系统
- 间距系统
- 字体系统
- 阴影和圆角
- 过渡动画

### 工具类

提供丰富的 CSS 工具类：

- 文本样式：`.text-primary`, `.text-center` 等
- 布局：`.d-flex`, `.justify-center` 等
- 间距：`.m-4`, `.p-3` 等
- 动画：`.animate-fade-in`, `.animate-slide-in-up` 等

## 🐛 问题排查

### 常见问题

1. **角色头像不显示**
   - 检查头像文件是否存在于 `public/role-avatars/` 目录
   - 确认文件路径正确

2. **消息发送失败**
   - 检查网络连接
   - 确认 API 服务是否正常运行

3. **样式异常**
   - 清除浏览器缓存
   - 检查 CSS 变量是否正确加载

### 调试模式

开发模式下，可以在浏览器控制台查看：

- Vue DevTools 信息
- Pinia 状态变化
- API 请求日志

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**享受与AI角色的对话体验！** 🎭✨
