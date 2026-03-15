# Chat System — RAG 双角色专属聊天系统

基于 **NestJS + Vue 3 + PostgreSQL + pgvector** 的全栈 RAG 聊天系统。集成阿里云通义千问（LLM + Embedding），支持固定双角色知识问答：虚构角色模拟 & 中医知识专家。

---

## 一、架构说明

### 1.1 技术栈总览

| 层次 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + TypeScript + Vite | Composition API + Pinia 状态管理 |
| 后端 | NestJS 11 + TypeORM | 分层架构，模块化设计 |
| 数据库 | PostgreSQL 16 + pgvector | 关系数据 + 向量检索一体化 |
| AI（LLM） | 阿里云通义千问 qwen-plus | OpenAI 兼容接口调用 |
| AI（Embedding） | 阿里云 text-embedding-v3 | 1024 维向量，中文优化 |
| 认证 | JWT + Passport + bcryptjs | 无状态 Token 认证 |

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vue 3)                     │
│  LoginView ─── ChatView ─── Pinia Store ─── Axios Client   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (JWT Bearer)
┌──────────────────────────▼──────────────────────────────────┐
│                     Backend (NestJS)                         │
│                                                              │
│  ┌──────────┐   ┌──────────────────────────────────────┐    │
│  │AuthModule│   │           ChatModule (RAG 编排)       │    │
│  │ register │   │                                        │    │
│  │ login    │   │  1. 获取角色配置 (ROLES 常量)          │    │
│  │ profile  │   │  2. 获取/创建会话                      │    │
│  └──────────┘   │  3. 保存用户消息                       │    │
│                 │  4. KnowledgeService.search() ──┐      │    │
│                 │  5. buildSystemPrompt()          │      │    │
│                 │  6. 加载历史上下文 (最近20条)     │      │    │
│                 │  7. AliCloudAI.sendMessage() ──┐│      │    │
│                 │  8. 保存 AI 回复并返回          ││      │    │
│                 └────────────────────────────────┼┼──────┘    │
│                                                  ││           │
│  ┌──────────────────┐  ┌─────────────────────┐  ││           │
│  │ KnowledgeModule  │  │  AliCloudAIModule   │  ││           │
│  │ 向量检索 (cosine)│◄─┘  通义千问 LLM 调用  │◄─┘│           │
│  │                  │     OpenAI 兼容接口     │   │           │
│  └────────┬─────────┘  └─────────────────────┘   │           │
│           │                                       │           │
│  ┌────────▼─────────┐                             │           │
│  │ EmbeddingModule  │  查询文本 → 1024维向量      │           │
│  │ text-embedding-v3│◄────────────────────────────┘           │
│  └──────────────────┘                                         │
└──────────────────────────┬────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              PostgreSQL + pgvector                           │
│                                                              │
│  users ──< chat_sessions ──< chat_messages                  │
│  knowledge_documents ──< knowledge_chunks [embedding(1024)] │
│                                                              │
│  HNSW 索引 + cosine 相似度检索                               │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 核心模块职责

| 模块 | 职责 |
|------|------|
| `AuthModule` | 用户注册/登录、JWT 签发与验证、密码加密 |
| `ChatModule` | 聊天会话管理、RAG 全流程编排（检索→增强→生成） |
| `KnowledgeModule` | 知识库管理、pgvector 向量检索、数据导入脚本 |
| `EmbeddingModule` | 阿里云 text-embedding-v3 封装，文本→向量转换 |
| `AliCloudAIModule` | 阿里云通义千问 LLM 封装，Chat Completion 调用 |

### 1.4 RAG 数据流

```
用户提问 "肝火旺怎么调理？"
    │
    ▼
① EmbeddingService.embed(query) → [0.12, -0.34, ...] (1024维向量)
    │
    ▼
② KnowledgeService: SELECT ... WHERE 1-(embedding <=> query) >= threshold
   ORDER BY embedding <=> query LIMIT topK
    │
    ▼
③ 返回 top-K 相关知识片段（含相似度分数和出处）
    │
    ▼
④ buildSystemPrompt(): 角色人设 + 检索结果 → 增强 system prompt
    │
    ▼
⑤ AliCloudAI: [system(增强prompt), ...history(最近20条), user(当前问题)]
    │
    ▼
⑥ 通义千问返回基于知识库的回答 → 保存并返回前端
```

---

## 二、关键 Prompt 与 Vibe 思路

### 2.1 Vibe Coding 开发理念

本项目采用 **AI 辅助全流程开发**（Vibe Coding）模式，核心理念：

> 用自然语言描述意图，让 AI 理解上下文后生成代码，开发者负责架构决策和质量把关。

**实践方式**：

1. **文档驱动开发** — 先用 AI 生成架构文档（`docs/ARCHITECTURE.md`）和技术选型文档（`docs/rag-tech-selection.md`），确认设计方向后再编码
2. **渐进式实现** — 每个模块先让 AI 理解已有代码模式，再生成新模块代码，保持风格一致
3. **对话式调试** — 遇到问题时描述现象，让 AI 分析根因并给出修复方案
4. **约束式生成** — 通过 `CLAUDE.md` 定义严格的编码规范（禁止 any、最简原则、类型复用），AI 在生成代码时自动遵循

**关键决策点**（人工主导）：
- 技术选型：pgvector vs 独立向量数据库 → 选择 pgvector（零额外部署成本）
- 架构模式：LangChain vs 自实现 RAG → 选择自实现（逻辑简单，更可控）
- Prompt 策略：不同角色采用不同 temperature 和检索参数

### 2.2 Prompt 工程设计

系统采用 **角色差异化 Prompt 策略**，两个角色的 Prompt 构造逻辑完全不同：

#### 角色1：虚构角色模拟（创意型）

```
┌─ System Prompt ──────────────────────────────────────────┐
│ 基础人设：你是一个充满个性的虚构角色...                    │
│                                                           │
│ 【相关语录参考】                                          │
│ 1. [检索到的语录1]                                        │
│ 2. [检索到的语录2]                                        │
│ ...                                                       │
│ 请参考以上语录的风格和内容，自然地融入对话，               │
│ 不要直接复制原文。                                        │
└───────────────────────────────────────────────────────────┘
参数：model=qwen-plus, temperature=0.8, topK=5, threshold=0.3
```

- **高 temperature (0.8)**：鼓励创意性和风格多样性
- **低 topK (5)**：语录短小精悍，5 条足够提供风格参考
- **低 threshold (0.3)**：宽松匹配，允许更多风格参考

#### 角色2：中医知识专家（严谨型）

```
┌─ System Prompt ──────────────────────────────────────────┐
│ 基础人设：你是一位专业的中医知识专家...                    │
│                                                           │
│ 【参考资料】                                              │
│ [1] 知识片段内容（来源：xxx.pdf）                         │
│ [2] 知识片段内容（来源：xxx.pdf）                         │
│ ...                                                       │
│ 请基于以上参考资料回答，引用出处编号，                     │
│ 资料不足时明确说明。                                      │
└───────────────────────────────────────────────────────────┘
参数：model=qwen-plus, temperature=0.3, topK=8, threshold=0.35
```

- **低 temperature (0.3)**：确保回答准确，减少幻觉
- **高 topK (8)**：中医知识需要更多上下文覆盖
- **高 threshold (0.35)**：严格匹配，确保检索内容高度相关

### 2.3 Prompt 增强策略

```typescript
// chat.service.ts — buildSystemPrompt()
// 核心思路：基础人设 + 动态检索结果 = 增强 Prompt

if (chunks.length === 0) {
  return roleConfig.systemPrompt;  // 无检索结果时降级为纯人设
}

if (roleKey === 'character') {
  // 虚构角色：语录作为风格参考，要求"自然融入"而非"直接复制"
  return `${systemPrompt}\n\n【相关语录参考】\n${quotes}\n\n请参考风格，自然融入对话`;
}

// 中医专家：文档片段作为知识来源，要求"引用出处"确保可溯源
return `${systemPrompt}\n\n【参考资料】\n${refs}\n\n请基于资料回答，引用出处编号`;
```

---

## 三、AI 调用逻辑

### 3.1 LLM 调用方式

使用 **OpenAI SDK 兼容接口** 调用阿里云通义千问，非流式同步调用：

```typescript
// alicloud-ai.service.ts
const client = new OpenAI({
  apiKey: ALICLOUD_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const completion = await client.chat.completions.create({
  model,        // 'qwen-plus'
  messages,     // [system, ...history, user]
  temperature,  // 0.3 或 0.8，取决于角色
});
```

**消息构造顺序**：
```
messages = [
  { role: 'system',    content: 增强后的 system prompt (人设 + RAG 检索结果) },
  { role: 'user',      content: 历史消息1 },
  { role: 'assistant', content: 历史回复1 },
  ...                   // 最近 20 条历史消息
  { role: 'user',      content: 当前用户消息 },
]
```

### 3.2 Embedding 调用

```typescript
// embedding.service.ts
const response = await client.embeddings.create({
  model: 'text-embedding-v3',
  input: text,        // 单条查询文本
  dimensions: 1024,   // 1024 维向量
});
// 返回 number[] 用于 pgvector cosine 检索
```

批量导入时按 25 条/批处理，避免 API 限制。

### 3.3 向量检索 SQL

```sql
-- knowledge.service.ts — 原生 SQL 向量检索
SELECT id, content, metadata,
       1 - (embedding <=> $1::vector) AS similarity
FROM knowledge_chunks
WHERE role_key = $2
  AND embedding IS NOT NULL
  AND 1 - (embedding <=> $1::vector) >= $3   -- 相似度阈值
ORDER BY embedding <=> $1::vector             -- cosine 距离排序
LIMIT $4                                      -- topK
```

- `<=>` 是 pgvector 的 cosine 距离运算符
- 使用 HNSW 索引加速近似最近邻搜索
- `role_key` 过滤确保角色间知识隔离

### 3.4 当前未实现（设计取舍）

| 特性 | 状态 | 理由 |
|------|------|------|
| 流式输出 (Streaming) | 未实现 | 当前需求未提及，不过度设计 |
| Function Calling | 未实现 | 双角色场景不需要工具调用 |
| 多模型切换 | 未实现 | 固定 qwen-plus 满足需求 |

> 架构已预留扩展空间：`AliCloudAIService` 可轻松改为流式调用（`stream: true`），`ChatController` 可改为 SSE 端点。

---

## 四、部署步骤说明

### 4.1 前置条件

- 一台国内云服务器（推荐 2C4G 以上，如阿里云 ECS / 腾讯云 CVM）
- 已安装 Docker 和 Docker Compose
- 一个域名（已完成 ICP 备案）
- 阿里云通义千问 API Key

### 4.2 项目结构

```
chat-system/
├── frontend/          # Vue 3 前端
├── backend/           # NestJS 后端
├── docker-compose.yml # 容器编排（需创建）
└── nginx/             # Nginx 配置（需创建）
    └── nginx.conf
```

### 4.3 Docker Compose 部署

#### Step 1：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL + pgvector
  postgres:
    image: pgvector/pgvector:pg16
    restart: always
    environment:
      POSTGRES_DB: chat_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # NestJS 后端
  backend:
    build: ./backend
    restart: always
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: chat_system
      DB_SYNCHRONIZE: "true"
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      ALICLOUD_API_KEY: ${ALICLOUD_API_KEY}
      ALICLOUD_MODEL: qwen-plus
      ALICLOUD_EMBEDDING_MODEL: text-embedding-v3
      PORT: 3000
      NODE_ENV: production
      CORS_ORIGIN: https://your-domain.com
    ports:
      - "3000:3000"

  # Nginx 反向代理（前端静态文件 + 后端 API 代理）
  nginx:
    image: nginx:alpine
    restart: always
    depends_on:
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot

  # Let's Encrypt 证书自动续期
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  pgdata:
```

#### Step 2：创建后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### Step 3：构建前端

```bash
cd frontend
# 设置生产环境 API 地址
echo "VITE_API_BASE_URL=https://your-domain.com" > .env.production
npm install && npm run build
# 构建产物在 frontend/dist/
```

#### Step 4：创建环境变量文件

```bash
# 在项目根目录创建 .env
cat > .env << 'EOF'
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_jwt_secret_key_at_least_32_chars
ALICLOUD_API_KEY=your_alicloud_api_key
EOF
```

#### Step 5：启动服务

```bash
docker compose up -d
```

### 4.4 DNS 配置

1. 登录域名服务商控制台（如阿里云域名、腾讯云 DNSPod）
2. 添加 A 记录：

| 主机记录 | 记录类型 | 记录值 | TTL |
|----------|----------|--------|-----|
| `@` | A | 你的服务器公网 IP | 600 |
| `www` | A | 你的服务器公网 IP | 600 |

3. 等待 DNS 生效（通常 5-10 分钟）

验证：
```bash
ping your-domain.com
# 应返回你的服务器 IP
```

### 4.5 HTTPS 配置（Let's Encrypt）

#### Step 1：Nginx 初始配置（仅 HTTP，用于证书申请）

```nginx
# nginx/nginx.conf
events { worker_connections 1024; }

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        # Let's Encrypt 验证
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        # 后端 API 代理
        location /api/ {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /auth/ {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /chat/ {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Step 2：申请 SSL 证书

```bash
# 先启动 nginx 和 certbot
docker compose up -d nginx

# 申请证书
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

#### Step 3：更新 Nginx 配置（启用 HTTPS）

```nginx
# nginx/nginx.conf
events { worker_connections 1024; }

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # HTTP → HTTPS 重定向
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS 主配置
    server {
        listen 443 ssl;
        server_name your-domain.com www.your-domain.com;

        ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
            gzip on;
            gzip_types text/css application/javascript application/json;
        }

        # 后端 API 代理
        location /api/ {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /auth/ {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /chat/ {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Step 4：重启服务

```bash
docker compose restart nginx
```

证书由 certbot 容器每 12 小时自动检查续期，无需手动维护。

### 4.6 知识库数据导入

部署完成后，需要导入知识库数据：

```bash
# 进入后端容器
docker compose exec backend sh

# 导入角色语录
npx ts-node src/modules/knowledge/scripts/import-quotes.ts ./data/quotes.txt

# 导入中医 PDF
npx ts-node src/modules/knowledge/scripts/import-pdf.ts ./data/tcm1.pdf
```

### 4.7 验证部署

```bash
# 检查服务状态
docker compose ps

# 检查后端健康
curl https://your-domain.com/auth/profile

# 检查数据库连接
docker compose exec postgres psql -U postgres -d chat_system -c "SELECT count(*) FROM knowledge_chunks;"
```

---

## 五、本地开发

```bash
# 后端
cd backend
cp .env.example .env   # 编辑环境变量
npm install
npm run start:dev

# 前端
cd frontend
npm install
npm run dev
```

前端默认访问 `http://localhost:5173`，后端默认监听 `http://localhost:3000`。

---

## 六、项目目录

```
chat-system/
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── views/           # 页面组件 (Login / Chat)
│   │   ├── stores/          # Pinia 状态管理 (auth / chat / roles)
│   │   ├── services/        # API 服务层 (Axios 封装)
│   │   ├── types/           # TypeScript 类型定义
│   │   └── router/          # Vue Router 路由配置
│   └── package.json
│
├── backend/                 # NestJS 后端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── chat/        # 聊天模块 (RAG 编排)
│   │   │   ├── knowledge/   # 知识库模块 (向量检索)
│   │   │   ├── embedding/   # Embedding 模块
│   │   │   └── alicloud-ai/ # LLM 调用模块
│   │   ├── common/          # 全局组件 (guards/filters/interceptors)
│   │   └── config/          # 数据库/JWT 配置
│   ├── data/                # 知识库原始数据
│   ├── docs/                # 架构文档
│   └── package.json
│
└── README.md
```
