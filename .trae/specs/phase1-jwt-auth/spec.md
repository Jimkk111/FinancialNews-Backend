# JWT认证中间件实现 - 详细执行计划

## 任务概述

实现基于JWT的用户认证中间件，包括Token生成、验证、刷新机制，以及路由保护功能。

## 前置条件

- 数据库连接已配置
- 用户模型已定义
- 环境变量已配置

## 执行步骤

### 步骤1：配置JWT参数

**文件**: `src/config/jwt.ts`

配置内容：
- JWT密钥（从环境变量读取）
- Token过期时间
- Token类型定义

**环境变量**:
```
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 步骤2：创建Token工具函数

**文件**: `src/utils/token.ts`

实现功能：
- `generateToken(userId: number): string` - 生成访问令牌
- `verifyToken(token: string): TokenPayload` - 验证令牌
- `extractTokenFromHeader(authHeader: string): string | null` - 从请求头提取Token

**类型定义**:
```typescript
interface TokenPayload {
  userId: number
  iat: number
  exp: number
}
```

### 步骤3：创建密码加密工具

**文件**: `src/utils/password.ts`

实现功能：
- `hashPassword(password: string): Promise<string>` - 密码加密
- `comparePassword(password: string, hash: string): Promise<boolean>` - 密码比对

**安全要求**：
- 使用bcryptjs库
- salt轮数设置为10-12

### 步骤4：实现认证中间件

**文件**: `src/middlewares/auth.middleware.ts`

实现功能：
- `authenticate` - 验证Token中间件
- `optionalAuth` - 可选认证中间件（Token存在则验证，不存在则跳过）

**中间件行为**：
- 从Authorization头提取Bearer Token
- 验证Token有效性
- 将用户信息注入req.user
- Token无效返回401错误

**错误响应格式**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token无效或已过期"
  }
}
```

### 步骤5：扩展Express类型

**文件**: `src/types/express.d.ts`

扩展内容：
```typescript
declare module 'express' {
  interface Request {
    user?: {
      id: number
      uid: string
    }
  }
}
```

### 步骤6：创建认证服务

**文件**: `src/services/auth.service.ts`

实现功能：
- 用户登录验证
- Token生成
- 密码校验

## 验证标准

1. Token生成格式正确（JWT格式）
2. Token验证能正确解析用户信息
3. 无效Token返回401错误
4. 有效Token正确注入用户信息到请求对象
5. 密码加密和比对功能正常

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| src/config/jwt.ts | JWT配置 |
| src/utils/token.ts | Token工具函数 |
| src/utils/password.ts | 密码加密工具 |
| src/middlewares/auth.middleware.ts | 认证中间件 |
| src/types/express.d.ts | Express类型扩展 |
| src/services/auth.service.ts | 认证服务 |

## 安全注意事项

- JWT密钥必须从环境变量读取，禁止硬编码
- 密码必须使用bcrypt加密存储
- Token过期时间不宜过长（建议7天以内）
- 生产环境必须使用HTTPS
- 敏感操作需要二次验证
