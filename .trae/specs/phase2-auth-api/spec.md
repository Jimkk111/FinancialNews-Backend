# 用户认证API实现 - 详细执行计划

## 任务概述

实现用户认证相关API，包括登录、注册、登出、发送验证码、重置密码功能。

## 前置条件

- 数据库连接已配置
- 用户模型已定义
- JWT认证中间件已实现
- 密码加密工具已实现
- 验证中间件已实现

## API端点设计

| 方法 | 端点 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| POST | /api/auth/login | 用户登录 | `{username, password}` | `{access_token, user}` |
| POST | /api/auth/register | 用户注册 | `{username, email, password, code}` | `{access_token, user}` |
| POST | /api/auth/logout | 用户登出 | - | `{message}` |
| POST | /api/auth/send-code | 发送验证码 | `{email, username?}` | `{message}` |
| POST | /api/auth/reset-password | 重置密码 | `{username, email, code, password}` | `{message}` |

## 执行步骤

### 步骤1：实现ID生成器工具

**文件**: `src/utils/idGenerator.ts`

实现功能：
- `generateUid(): string` - 生成用户唯一标识 (格式: user-xxxxxxxx)
- `generateDisplayId(): string` - 生成显示ID (格式: Uxxxxxx)
- `generateDraftId(): string` - 生成草稿ID (格式: draft-xxxxxxxx)
- `generateSessionId(): string` - 生成AI会话ID (格式: session-xxxxxxxx)

**实现要求**：
- 使用uuid库生成随机部分
- 格式统一、可读性好

### 步骤2：实现邮件服务

**文件**: `src/services/email.service.ts`

实现功能：
- `sendVerificationCode(email: string, code: string): Promise<void>` - 发送验证码邮件

**配置要求**：
- 使用nodemailer库
- 邮件内容为HTML格式
- 从环境变量读取SMTP配置

**环境变量**:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@example.com
```

### 步骤3：实现用户服务

**文件**: `src/services/user.service.ts`

实现功能：
- `createUser(data: CreateUserData): Promise<User>` - 创建新用户
  - 生成UID和DisplayId
  - 密码加密存储
  - 返回不含密码的用户信息
- `updateUserPassword(userId: number, newPassword: string): Promise<void>` - 更新用户密码

**类型定义**:
```typescript
interface CreateUserData {
  username: string
  email: string
  password: string
}
```

### 步骤4：扩展认证服务

**文件**: `src/services/auth.service.ts`

新增功能：
- `registerUser(data: RegisterData): Promise<RegisterResult>` - 用户注册业务逻辑
  - 验证验证码有效性
  - 检查用户名/邮箱唯一性
  - 创建用户并返回Token
- `createVerificationCode(email: string, username?: string): Promise<string>` - 创建验证码
  - 生成6位数字验证码
  - 存储到verification_codes表
  - 设置5分钟过期时间
  - 发送邮件
- `verifyCode(email: string, code: string): Promise<boolean>` - 验证验证码
  - 检查验证码是否存在且未过期
  - 验证成功后删除验证码
- `resetPassword(data: ResetPasswordData): Promise<void>` - 重置密码
  - 验证用户名、邮箱、验证码匹配
  - 更新密码

**类型定义**:
```typescript
interface RegisterData {
  username: string
  email: string
  password: string
  code: string
}

interface RegisterResult {
  accessToken: string
  user: UserInfo
}

interface ResetPasswordData {
  username: string
  email: string
  code: string
  password: string
}
```

### 步骤5：实现认证验证器

**文件**: `src/validators/auth.validator.ts`

验证规则：
- `loginSchema` - 登录验证
  - username: 必填，1-50字符
  - password: 必填，6-128字符
- `registerSchema` - 注册验证
  - username: 必填，3-50字符，字母开头，只含字母数字下划线
  - email: 必填，有效邮箱格式
  - password: 必填，8-128字符，含字母和数字
  - code: 必填，6位数字
- `sendCodeSchema` - 发送验证码验证
  - email: 必填，有效邮箱格式
  - username: 可选，用于重置密码场景
- `resetPasswordSchema` - 重置密码验证
  - username: 必填
  - email: 必填，有效邮箱格式
  - code: 必填，6位数字
  - password: 必填，8-128字符，含字母和数字

**使用Zod库实现**

### 步骤6：实现认证控制器

**文件**: `src/controllers/auth.controller.ts`

控制器方法：
- `login(req, res, next)` - 处理登录请求
  - 调用authService.validateUser
  - 返回Token和用户信息
- `register(req, res, next)` - 处理注册请求
  - 调用authService.registerUser
  - 返回Token和用户信息
- `logout(req, res, next)` - 处理登出请求
  - JWT无状态，返回成功消息即可
- `sendCode(req, res, next)` - 处理发送验证码请求
  - 调用authService.createVerificationCode
  - 返回成功消息
- `resetPassword(req, res, next)` - 处理重置密码请求
  - 调用authService.resetPassword
  - 返回成功消息

**错误处理**：
- 使用try-catch包裹
- 错误传递给next处理

### 步骤7：更新认证路由

**文件**: `src/routes/auth.routes.ts`

路由配置：
```typescript
router.post('/login', validateBody(loginSchema), authController.login)
router.post('/register', validateBody(registerSchema), authController.register)
router.post('/logout', authController.logout)
router.post('/send-code', validateBody(sendCodeSchema), authController.sendCode)
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword)
```

### 步骤8：测试验证

测试内容：
- 启动服务验证各端点可访问
- 测试参数验证是否生效
- 测试错误响应格式是否正确
- 测试数据库操作是否正常

## 数据库表

### verification_codes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| email | VARCHAR(100) | 邮箱 |
| code | VARCHAR(10) | 验证码 |
| username | VARCHAR(50) | 用户名(重置密码用) |
| expires_at | TIMESTAMP | 过期时间 |

**注意**：需要在schema.prisma中添加此模型

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
    "message": "错误描述",
    "details": [{ "field": "xxx", "message": "xxx" }]
  }
}
```

## 安全要求

- 密码必须使用bcrypt加密，salt轮数12
- 验证码5分钟过期
- 验证码使用后立即删除
- 密码强度验证：至少8位，含字母和数字
- 用户名唯一性检查
- 邮箱唯一性检查
