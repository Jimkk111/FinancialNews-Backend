# AI助手API实现 - 详细执行计划

## 任务概述

实现AI助手相关API，包括会话管理、消息历史、AI对话功能，对接大模型API实现智能问答。

## 前置条件

- 数据库连接已配置
- AiSession和AiMessage模型已定义
- JWT认证中间件已实现
- 缓存服务已实现

## API端点设计

| 方法 | 端点 | 说明 | 认证 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| GET | /api/ai/sessions | 获取会话列表 | 必须 | - | `SessionInfo[]` |
| POST | /api/ai/sessions | 创建新会话 | 必须 | - | `{session_id}` |
| GET | /api/ai/sessions/:id/messages | 获取会话消息 | 必须 | - | `ChatMessage[]` |
| PUT | /api/ai/sessions/:id | 更新会话标题 | 必须 | `{title}` | `{message}` |
| DELETE | /api/ai/sessions/:id | 删除会话 | 必须 | - | `{message}` |
| POST | /api/ai/chat | AI对话 | 必须 | `{messages, sessionId?, stream?}` | `{role, content}` 或 SSE流 |
| GET | /api/ai/health | 健康检查 | 无需 | - | `{status}` |

## 执行步骤

### 步骤1：配置大模型API

**文件**: `src/config/ai.ts`

配置内容：
- API密钥从环境变量读取
- API基础URL配置
- 模型名称配置
- 默认参数配置（temperature、max_tokens等）

**环境变量**:
```
AI_API_KEY=your-api-key
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

**类型定义**:
```typescript
interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
```

### 步骤2：实现AI服务

**文件**: `src/services/ai.service.ts`

实现功能：

#### 会话管理
- `getSessions(userId: number): Promise<SessionInfo[]>` - 获取用户会话列表
  - 按更新时间倒序排列
  - 返回会话基本信息和最后消息预览
- `createSession(userId: number): Promise<string>` - 创建新会话
  - 生成唯一sessionId
  - 返回sessionId
- `getSessionMessages(sessionId: string, userId: number): Promise<ChatMessage[]>` - 获取会话消息
  - 验证会话归属
  - 返回消息列表
- `updateSessionTitle(sessionId: string, userId: number, title: string): Promise<void>` - 更新会话标题
  - 验证会话归属
  - 更新标题
- `deleteSession(sessionId: string, userId: number): Promise<void>` - 删除会话
  - 验证会话归属
  - 级联删除消息

#### AI对话
- `chat(userId: number, data: ChatRequest): Promise<ChatResponse>` - 普通对话
  - 验证会话归属（如有sessionId）
  - 调用大模型API
  - 保存消息记录
  - 返回AI响应
- `chatStream(userId: number, data: ChatRequest, onChunk: (chunk: string) => void): Promise<void>` - 流式对话
  - 验证会话归属
  - 调用大模型流式API
  - 实时返回内容块
  - 保存完整消息

**类型定义**:
```typescript
interface SessionInfo {
  sessionId: string
  title: string | null
  createdAt: Date
  updatedAt: Date
  lastMessage?: string
}

interface ChatRequest {
  messages: ChatMessage[]
  sessionId?: string
  stream?: boolean
}

interface ChatResponse {
  role: 'assistant'
  content: string
  sessionId: string
}
```

### 步骤3：实现AI验证器

**文件**: `src/validators/ai.validator.ts`

验证规则：
- `createSessionSchema` - 创建会话验证（无需参数）
- `updateSessionSchema` - 更新会话验证
  - title: 必填，1-100字符
- `chatSchema` - 对话验证
  - messages: 必填，数组，至少1条消息
  - messages[].role: 必填，枚举值 user/assistant/system
  - messages[].content: 必填，1-4000字符
  - sessionId: 可选，有效sessionId格式
  - stream: 可选，布尔值
- `sessionIdParamSchema` - sessionId路径参数验证
  - sessionId: 必填，匹配 session-xxxxxxxx 格式

**使用Zod库实现**

### 步骤4：实现AI控制器

**文件**: `src/controllers/ai.controller.ts`

控制器方法：
- `getSessions(req, res, next)` - 获取会话列表
  - 从req.user获取userId
  - 调用aiService.getSessions
- `createSession(req, res, next)` - 创建会话
  - 从req.user获取userId
  - 调用aiService.createSession
  - 返回sessionId
- `getSessionMessages(req, res, next)` - 获取会话消息
  - 验证sessionId参数
  - 调用aiService.getSessionMessages
- `updateSession(req, res, next)` - 更新会话标题
  - 验证sessionId参数
  - 调用aiService.updateSessionTitle
- `deleteSession(req, res, next)` - 删除会话
  - 验证sessionId参数
  - 调用aiService.deleteSession
- `chat(req, res, next)` - AI对话
  - 从req.user获取userId
  - 判断是否流式请求
  - 流式：设置SSE响应头，调用chatStream
  - 非流式：调用chat，返回JSON
- `healthCheck(req, res)` - 健康检查
  - 返回服务状态

**SSE响应格式**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"content": "你好"}

data: [DONE]
```

### 步骤5：更新AI路由

**文件**: `src/routes/ai.routes.ts`

路由配置：
```typescript
router.get('/sessions', authMiddleware, aiController.getSessions)
router.post('/sessions', authMiddleware, aiController.createSession)
router.get('/sessions/:sessionId/messages', authMiddleware, validateParams(sessionIdParamSchema), aiController.getSessionMessages)
router.put('/sessions/:sessionId', authMiddleware, validateParams(sessionIdParamSchema), validateBody(updateSessionSchema), aiController.updateSession)
router.delete('/sessions/:sessionId', authMiddleware, validateParams(sessionIdParamSchema), aiController.deleteSession)
router.post('/chat', authMiddleware, validateBody(chatSchema), aiController.chat)
router.get('/health', aiController.healthCheck)
```

### 步骤6：测试验证

测试内容：
- 启动服务验证各端点可访问
- 测试认证中间件是否生效
- 测试会话CRUD操作
- 测试AI对话功能（需配置API密钥）
- 测试流式响应是否正常
- 测试错误响应格式

## 数据库表

### ai_sessions 表（已存在）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| session_id | VARCHAR(50) UNIQUE | 会话ID |
| user_id | INTEGER | 用户ID |
| title | VARCHAR(100) | 会话标题 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### ai_messages 表（已存在）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| session_id | INTEGER | 会话ID |
| role | VARCHAR(20) | 角色(user/assistant) |
| content | TEXT | 消息内容 |
| created_at | TIMESTAMP | 创建时间 |

## 统一响应格式

成功响应：
```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

会话列表响应示例：
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "session-abc12345",
      "title": "关于股票分析的问题",
      "createdAt": "2026-03-29T10:00:00Z",
      "updatedAt": "2026-03-29T12:30:00Z",
      "lastMessage": "根据您的需求..."
    }
  ]
}
```

对话响应示例：
```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "您好，我是AI助手...",
    "sessionId": "session-abc12345"
  }
}
```

## 安全要求

- 所有会话操作必须验证用户归属
- API密钥必须从环境变量读取，禁止硬编码
- 消息内容长度限制4000字符
- 会话数量限制（可选，防止滥用）
- 对话请求频率限制

## 性能要求

- 会话列表支持分页（可选）
- 消息历史按时间正序返回
- 流式响应减少首字延迟
- 考虑添加缓存优化

## 错误处理

| 错误场景 | 错误码 | HTTP状态码 | 错误消息 |
|----------|--------|------------|----------|
| 会话不存在 | NOT_FOUND | 404 | 会话不存在 |
| 无权访问会话 | FORBIDDEN | 403 | 无权访问此会话 |
| AI服务不可用 | INTERNAL_ERROR | 500 | AI服务暂时不可用 |
| 消息内容过长 | VALIDATION_ERROR | 422 | 消息内容超出限制 |
| API调用失败 | INTERNAL_ERROR | 500 | AI服务调用失败 |

## 大模型API对接说明

### OpenAI兼容API

请求格式：
```typescript
POST /v1/chat/completions
Headers: {
  'Authorization': 'Bearer API_KEY',
  'Content-Type': 'application/json'
}
Body: {
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: '你好' }],
  max_tokens: 2000,
  temperature: 0.7,
  stream: false
}
```

流式响应：
```typescript
Body: {
  ...,
  stream: true
}
// 响应格式
data: {"choices":[{"delta":{"content":"你"}}]}
data: {"choices":[{"delta":{"content":"好"}}]}
data: [DONE]
```

### 国内大模型适配

支持通过配置baseUrl对接：
- 阿里云通义千问
- 百度文心一言
- 智谱AI
- 月之暗面Kimi

## 依赖说明

需要安装的依赖：
- 无额外依赖，使用Node.js原生fetch或项目已有HTTP客户端

可选依赖：
- `openai` - OpenAI官方SDK（如需更完善的功能）
