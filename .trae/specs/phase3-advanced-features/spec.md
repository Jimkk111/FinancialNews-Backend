# 高级功能实现 - 详细执行计划

## 任务概述

实现第三阶段的高级功能，包括文件上传功能、缓存优化、API限流功能。

## 前置条件

- 数据库连接已配置
- Redis配置已完成（环境变量已定义）
- JWT认证中间件已实现
- 用户服务基础框架已搭建
- 新闻服务已实现
- express-rate-limit依赖已安装
- multer依赖已安装
- ioredis依赖已安装

---

## 第一部分：文件上传功能

### 功能概述

实现用户头像上传和草稿封面图上传功能，支持本地存储和云存储两种模式。

### API端点设计

| 方法 | 端点 | 说明 | 认证 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| POST | /api/users/me/avatar | 上传头像 | 必须 | FormData(file) | `{avatar}` |
| POST | /api/drafts/:id/cover | 上传草稿封面 | 必须 | FormData(file) | `{coverImage}` |

### 执行步骤

#### 步骤1：实现文件上传配置

**文件**: `src/config/upload.ts`

配置内容：
- 存储类型配置（local/oss）
- 文件大小限制
- 允许的文件类型
- 存储路径配置

**类型定义**:
```typescript
interface UploadConfig {
  storageType: 'local' | 'oss'
  maxSize: number
  allowedMimeTypes: string[]
  uploadDir: string
  urlPrefix: string
}

interface LocalStorageConfig extends UploadConfig {
  storageType: 'local'
  uploadDir: string
  urlPrefix: string
}

interface OSSStorageConfig extends UploadConfig {
  storageType: 'oss'
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region: string
  endpoint: string
}
```

**环境变量**:
```
UPLOAD_STORAGE_TYPE=local
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_DIR=uploads
UPLOAD_URL_PREFIX=/uploads

# OSS配置（可选）
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
OSS_REGION=
OSS_ENDPOINT=
```

#### 步骤2：实现文件上传中间件

**文件**: `src/middlewares/upload.middleware.ts`

实现功能：
- `createUploadMiddleware(options: UploadOptions): RequestHandler` - 创建上传中间件
  - 配置multer存储策略
  - 文件类型验证
  - 文件大小验证
  - 文件名生成（使用时间戳+随机字符串）
  - 错误处理

**类型定义**:
```typescript
interface UploadOptions {
  fieldName: string
  maxSize?: number
  allowedMimeTypes?: string[]
  maxCount?: number
}

interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  filename: string
  path: string
  buffer?: Buffer
}
```

**实现要求**：
- 文件类型白名单验证
- 文件大小限制（默认5MB）
- 生成唯一文件名防止冲突
- 支持单文件和多文件上传
- 错误信息友好提示

#### 步骤3：实现文件服务

**文件**: `src/services/file.service.ts`

实现功能：
- `saveFile(file: UploadedFile, category: string): Promise<string>` - 保存文件
  - 生成本地存储路径或上传到OSS
  - 返回文件访问URL
- `deleteFile(fileUrl: string): Promise<void>` - 删除文件
  - 删除本地文件或OSS文件
- `validateFile(file: UploadedFile): ValidationResult` - 验证文件
  - 类型验证
  - 大小验证

**实现要求**：
- 本地存储时创建年月子目录（如 uploads/2026/03/）
- OSS存储时使用相同目录结构
- 文件名格式：`{timestamp}_{random}.{ext}`
- 删除旧头像时清理文件

#### 步骤4：实现用户控制器（头像上传）

**文件**: `src/controllers/user.controller.ts`

控制器方法：
- `getCurrentUser(req, res, next)` - 获取当前用户信息
  - 从req.user获取userId
  - 调用userService.getUserById
  - 返回用户信息
- `updateCurrentUser(req, res, next)` - 更新用户信息
  - 验证请求体
  - 调用userService.updateUser
  - 返回更新后的用户信息
- `uploadAvatar(req, res, next)` - 上传头像
  - 获取上传的文件
  - 调用fileService.saveFile
  - 删除旧头像文件
  - 更新用户avatar字段
  - 返回新头像URL

**错误处理**：
- 文件类型错误返回422
- 文件过大返回413
- 上传失败返回500

#### 步骤5：更新用户路由

**文件**: `src/routes/users.routes.ts`

路由配置：
```typescript
router.get('/me', authMiddleware, userController.getCurrentUser)
router.put('/me', authMiddleware, validateBody(updateUserSchema), userController.updateCurrentUser)
router.post('/me/avatar', 
  authMiddleware, 
  createUploadMiddleware({ fieldName: 'avatar', maxSize: 2 * 1024 * 1024 }),
  userController.uploadAvatar
)
```

#### 步骤6：配置静态文件服务

**文件**: `src/app.ts`

添加静态文件服务：
```typescript
import express from 'express'
import path from 'path'

// 在路由之前添加
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
```

#### 步骤7：实现用户验证器

**文件**: `src/validators/user.validator.ts`

验证规则：
- `updateUserSchema` - 更新用户信息验证
  - username: 可选，3-50字符，字母开头
  - email: 可选，有效邮箱格式
  - 至少提供一个字段

### 安全要求

- 文件类型白名单验证（MIME类型）
- 文件扩展名验证
- 文件大小限制（头像2MB，封面5MB）
- 文件名随机化防止路径遍历
- 禁止执行上传的文件
- 图片文件可进行二次验证（检查文件头）

### 存储目录结构

```
uploads/
├── avatars/
│   └── 2026/
│       └── 03/
│           └── 1234567890_abc123.jpg
└── covers/
    └── 2026/
        └── 03/
            └── 1234567890_def456.jpg
```

---

## 第二部分：缓存优化

### 功能概述

使用Redis实现多级缓存策略，优化频繁访问的数据查询性能。

### 缓存策略设计

| 数据类型 | 缓存键格式 | 过期时间 | 更新策略 |
|----------|-----------|----------|----------|
| 新闻详情 | `news:detail:{id}` | 10分钟 | 写入时删除 |
| 新闻列表 | `news:list:{hash}` | 5分钟 | 写入时删除 |
| 分类列表 | `news:categories` | 1小时 | 定时刷新 |
| 标签列表 | `news:tags` | 1小时 | 定时刷新 |
| 用户信息 | `user:info:{uid}` | 30分钟 | 更新时删除 |
| 收藏状态 | `favorite:check:{uid}:{newsId}` | 5分钟 | 收藏操作时删除 |

### 执行步骤

#### 步骤1：实现Redis配置

**文件**: `src/config/redis.ts`

配置内容：
- Redis连接配置
- 连接池管理
- 错误处理
- 重连机制

**实现要求**：
```typescript
import Redis from 'ioredis'

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    if (times > 3) return null
    return Math.min(times * 200, 2000)
  }
}

const redis = new Redis(redisConfig)

redis.on('connect', () => {
  log.info('Redis', '连接成功')
})

redis.on('error', (err) => {
  log.error('Redis', '连接错误', err)
})

export default redis
```

#### 步骤2：实现缓存服务

**文件**: `src/services/cache.service.ts`

实现功能：
- `get<T>(key: string): Promise<T | null>` - 获取缓存
- `set(key: string, value: unknown, ttl?: number): Promise<void>` - 设置缓存
- `del(key: string): Promise<void>` - 删除缓存
- `delPattern(pattern: string): Promise<void>` - 批量删除（按模式）
- `exists(key: string): Promise<boolean>` - 检查键是否存在
- `expire(key: string, ttl: number): Promise<void>` - 设置过期时间

**类型定义**:
```typescript
interface CacheOptions {
  ttl?: number
  prefix?: string
}

const DEFAULT_TTL = 300 // 5分钟
```

**实现要求**：
- 使用JSON序列化/反序列化
- 错误不影响主流程（降级处理）
- 支持键前缀
- 记录缓存命中率日志

#### 步骤3：实现缓存装饰器/包装器

**文件**: `src/utils/cacheWrapper.ts`

实现功能：
- `withCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>` - 缓存包装器
  - 先查缓存
  - 缓存未命中时执行fetcher
  - 结果写入缓存
  - 返回结果

**实现要求**：
```typescript
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheService.get<T>(key)
  if (cached !== null) {
    log.debug('Cache', '缓存命中', { key })
    return cached
  }

  const data = await fetcher()
  await cacheService.set(key, data, ttl)
  log.debug('Cache', '缓存未命中，已更新', { key })
  
  return data
}
```

#### 步骤4：改造新闻服务（添加缓存）

**文件**: `src/services/news.service.ts`

改造内容：
- `getNewsById` - 添加详情缓存
  - 使用 `news:detail:{id}` 作为缓存键
  - TTL: 10分钟
  - 更新/删除新闻时清除缓存
- `getNewsList` - 添加列表缓存
  - 使用 `news:list:{hash}` 作为缓存键（hash由查询参数生成）
  - TTL: 5分钟
  - 创建/更新/删除新闻时清除列表缓存
- `getCategories` - 添加分类缓存
  - 使用 `news:categories` 作为缓存键
  - TTL: 1小时
- `getTags` - 添加标签缓存
  - 使用 `news:tags` 作为缓存键
  - TTL: 1小时

**缓存失效策略**：
```typescript
// 新闻更新/删除时
await cacheService.del(`news:detail:${id}`)
await cacheService.delPattern('news:list:*')

// 分类/标签变更时
await cacheService.del('news:categories')
await cacheService.del('news:tags')
```

#### 步骤5：改造收藏服务（添加缓存）

**文件**: `src/services/favorite.service.ts`

改造内容：
- `checkFavorite` - 添加收藏状态缓存
  - 使用 `favorite:check:{uid}:{newsId}` 作为缓存键
  - TTL: 5分钟
- 收藏/取消收藏时清除相关缓存

#### 步骤6：实现缓存预热

**文件**: `src/services/cache.service.ts`

添加功能：
- `warmup(): Promise<void>` - 缓存预热
  - 预加载分类列表
  - 预加载标签列表
  - 预加载热门新闻

**调用时机**：
- 应用启动时执行
- 定时任务刷新

### 缓存键命名规范

```
模块:资源:标识[:子标识]

示例：
- news:detail:123
- news:list:page1_size10_cat5
- user:info:user-abc123
- favorite:check:user-abc123:news-456
```

### 降级策略

- Redis不可用时直接查询数据库
- 缓存操作失败不影响主流程
- 记录缓存错误日志便于排查

---

## 第三部分：API限流

### 功能概述

实现API请求限流，防止恶意请求和资源滥用，保护服务器稳定性。

### 限流策略设计

| 端点类型 | 限流规则 | 时间窗口 | 说明 |
|----------|----------|----------|------|
| 认证接口 | 10次/IP | 15分钟 | 登录、注册、重置密码 |
| 发送验证码 | 5次/IP | 1小时 | 防止短信轰炸 |
| AI对话 | 30次/用户 | 1小时 | 控制AI成本 |
| 文件上传 | 20次/用户 | 1小时 | 防止存储滥用 |
| 通用API | 100次/IP | 1分钟 | 默认限流 |
| 搜索接口 | 30次/IP | 1分钟 | 防止爬虫 |

### 执行步骤

#### 步骤1：实现限流配置

**文件**: `src/config/rateLimit.ts`

配置内容：
```typescript
interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
}

export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 10,
    message: '请求过于频繁，请稍后再试'
  },
  sendCode: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 5,
    message: '验证码发送过于频繁，请1小时后再试'
  },
  ai: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 30,
    message: 'AI对话次数已达上限，请稍后再试'
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 20,
    message: '上传次数已达上限，请稍后再试'
  },
  search: {
    windowMs: 60 * 1000, // 1分钟
    max: 30,
    message: '搜索请求过于频繁，请稍后再试'
  },
  general: {
    windowMs: 60 * 1000, // 1分钟
    max: 100,
    message: '请求过于频繁，请稍后再试'
  }
}
```

#### 步骤2：实现限流中间件

**文件**: `src/middlewares/rateLimit.middleware.ts`

实现功能：
- `createRateLimiter(config: RateLimitConfig): RequestHandler` - 创建限流中间件
  - 使用express-rate-limit
  - 支持自定义键生成器
  - 支持Redis存储（分布式场景）
  - 自定义错误响应

**实现要求**：
```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import redis from '../config/redis'

export function createRateLimiter(config: RateLimitConfig): RequestHandler {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message || '请求过于频繁，请稍后再试'
      }
    },
    keyGenerator: config.keyGenerator || ((req) => {
      return req.user?.uid || req.ip
    }),
    skip: config.skip,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
      prefix: 'rl:'
    })
  })
}

// 预定义限流器
export const authLimiter = createRateLimiter(rateLimitConfigs.auth)
export const sendCodeLimiter = createRateLimiter(rateLimitConfigs.sendCode)
export const aiLimiter = createRateLimiter(rateLimitConfigs.ai)
export const uploadLimiter = createRateLimiter(rateLimitConfigs.upload)
export const searchLimiter = createRateLimiter(rateLimitConfigs.search)
export const generalLimiter = createRateLimiter(rateLimitConfigs.general)
```

#### 步骤3：应用限流中间件

**文件**: `src/routes/auth.routes.ts`

```typescript
import { authLimiter, sendCodeLimiter } from '../middlewares/rateLimit.middleware'

router.post('/login', authLimiter, validateBody(loginSchema), authController.login)
router.post('/register', authLimiter, validateBody(registerSchema), authController.register)
router.post('/send-code', sendCodeLimiter, validateBody(sendCodeSchema), authController.sendCode)
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), authController.resetPassword)
```

**文件**: `src/routes/ai.routes.ts`

```typescript
import { aiLimiter } from '../middlewares/rateLimit.middleware'

router.post('/chat', authMiddleware, aiLimiter, validateBody(chatSchema), aiController.chat)
```

**文件**: `src/routes/users.routes.ts`

```typescript
import { uploadLimiter } from '../middlewares/rateLimit.middleware'

router.post('/me/avatar', authMiddleware, uploadLimiter, uploadMiddleware, userController.uploadAvatar)
```

**文件**: `src/routes/news.routes.ts`

```typescript
import { searchLimiter } from '../middlewares/rateLimit.middleware'

router.get('/search', searchLimiter, validateQuery(searchQuerySchema), newsController.searchNews)
```

**文件**: `src/app.ts`

```typescript
import { generalLimiter } from './middlewares/rateLimit.middleware'

// 在路由之前添加全局限流
app.use('/api', generalLimiter)
```

#### 步骤4：实现限流状态查询接口

**文件**: `src/controllers/rateLimit.controller.ts`

控制器方法：
- `getStatus(req, res)` - 获取当前限流状态
  - 返回剩余请求次数
  - 返回重置时间

**响应格式**:
```json
{
  "success": true,
  "data": {
    "limit": 100,
    "remaining": 95,
    "reset": "2026-03-29T12:00:00Z"
  }
}
```

### 限流响应头

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1648540800
```

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过于频繁，请稍后再试",
    "details": {
      "retryAfter": 60
    }
  }
}
```

### 分布式限流

当部署多个实例时，使用Redis存储限流计数：
- 所有实例共享同一限流计数
- 防止通过负载均衡绕过限流
- 需要配置Redis连接

---

## 依赖安装

```bash
# 文件上传（已安装）
# multer - 已在package.json中

# 限流（已安装）
# express-rate-limit - 已在package.json中

# Redis（已安装）
# ioredis - 已在package.json中

# 可选：Redis限流存储
npm install rate-limit-redis
```

---

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| src/config/upload.ts | 文件上传配置 |
| src/config/redis.ts | Redis连接配置 |
| src/config/rateLimit.ts | 限流配置 |
| src/middlewares/upload.middleware.ts | 文件上传中间件 |
| src/middlewares/rateLimit.middleware.ts | 限流中间件 |
| src/services/file.service.ts | 文件服务 |
| src/services/cache.service.ts | 缓存服务 |
| src/utils/cacheWrapper.ts | 缓存包装器 |
| src/controllers/user.controller.ts | 用户控制器（扩展） |
| src/controllers/rateLimit.controller.ts | 限流状态控制器 |
| src/validators/user.validator.ts | 用户验证器 |
| src/routes/users.routes.ts | 用户路由（更新） |
| src/routes/auth.routes.ts | 认证路由（添加限流） |
| src/routes/ai.routes.ts | AI路由（添加限流） |
| src/routes/news.routes.ts | 新闻路由（添加限流） |

---

## 测试验证

### 文件上传测试
- 测试头像上传功能
- 测试文件类型验证
- 测试文件大小限制
- 测试静态文件访问

### 缓存测试
- 测试缓存命中/未命中
- 测试缓存过期
- 测试缓存失效
- 测试Redis不可用时的降级

### 限流测试
- 测试限流触发
- 测试限流重置
- 测试限流响应头
- 测试分布式限流（多实例）

---

## 性能指标

### 缓存优化目标
- 新闻详情接口响应时间 < 50ms（缓存命中）
- 分类/标签接口响应时间 < 10ms（缓存命中）
- 缓存命中率 > 80%

### 限流效果
- 单IP每分钟最多100次请求
- 有效防止暴力破解
- 有效防止API滥用

---

## 注意事项

1. **文件上传**
   - 生产环境建议使用OSS存储
   - 定期清理未使用的文件
   - 图片上传后可进行压缩处理

2. **缓存**
   - 缓存键命名要规范，便于管理和排查
   - 写操作后及时清除相关缓存
   - 监控缓存命中率，调整缓存策略

3. **限流**
   - 合理设置限流阈值，避免误伤正常用户
   - 区分IP限流和用户限流
   - 提供限流状态查询，提升用户体验
