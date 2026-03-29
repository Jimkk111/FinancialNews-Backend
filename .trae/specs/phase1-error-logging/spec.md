# 错误处理与日志配置 - 详细执行计划

## 任务概述

实现全局错误处理机制和日志系统，确保系统稳定性和可追溯性。

## 前置条件

- 项目基础结构已搭建
- Winston日志库已安装

## 执行步骤

### 步骤1：创建日志工具

**文件**: `src/utils/logger.ts`

实现功能：
- 配置Winston日志器
- 定义日志级别（error, warn, info, debug）
- 配置日志格式（时间戳、级别、模块、消息）
- 配置日志输出目标：
  - 控制台输出（开发环境）
  - 文件输出（生产环境）

**日志格式**:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "module": "auth",
  "message": "User logged in",
  "context": {
    "userId": 1,
    "ip": "127.0.0.1"
  }
}
```

**日志文件配置**:
- 错误日志: `logs/error-{date}.log`
- 综合日志: `logs/combined-{date}.log`
- 日志保留: 14天

### 步骤2：创建统一响应工具

**文件**: `src/utils/response.ts`

实现功能：
- `success<T>(res: Response, data: T, statusCode?: number): Response` - 成功响应
- `error(res: Response, code: string, message: string, statusCode?: number): Response` - 错误响应
- `paginated<T>(res: Response, data: T[], total: number, page: number, pageSize: number): Response` - 分页响应

**响应格式**:
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
```

### 步骤3：定义错误类型

**文件**: `src/types/index.ts`

定义内容：
- AppError类（自定义应用错误）
- 错误码枚举
- 错误类型定义

**错误码定义**:
```typescript
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

### 步骤4：实现错误处理中间件

**文件**: `src/middlewares/error.middleware.ts`

实现功能：
- `errorHandler` - 全局错误处理中间件
- `notFoundHandler` - 404处理中间件
- `asyncHandler` - 异步路由包装器

**错误处理逻辑**:
1. 区分已知错误和未知错误
2. 记录错误日志
3. 返回统一格式错误响应
4. 生产环境隐藏敏感错误信息

**错误分类处理**:
| 错误类型 | HTTP状态码 | 处理方式 |
|---------|-----------|---------|
| ValidationError | 422 | 返回验证错误详情 |
| UnauthorizedError | 401 | 返回认证失败 |
| ForbiddenError | 403 | 返回权限不足 |
| NotFoundError | 404 | 返回资源不存在 |
| DuplicateError | 409 | 返回重复数据 |
| PrismaError | 500 | 转换为友好错误 |
| UnknownError | 500 | 返回服务器错误 |

### 步骤5：创建验证中间件

**文件**: `src/middlewares/validate.middleware.ts`

实现功能：
- `validate(schema: ZodSchema)` - Zod验证中间件
- 请求体验证
- 查询参数验证
- 路由参数验证

**验证错误格式**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  }
}
```

### 步骤6：集成到应用入口

**文件**: `src/app.ts`

集成位置：
- 请求日志中间件（morgan或自定义）
- 404处理中间件（路由之后）
- 全局错误处理中间件（最后）

**中间件顺序**:
```
helmet -> cors -> compression -> bodyParser -> morgan -> routes -> notFoundHandler -> errorHandler
```

## 验证标准

1. 所有错误返回统一格式响应
2. 错误日志正确记录到文件
3. 生产环境不暴露敏感信息
4. 验证错误返回详细字段信息
5. 404请求正确处理
6. 异步错误被正确捕获

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| src/utils/logger.ts | 日志工具 |
| src/utils/response.ts | 统一响应工具 |
| src/types/index.ts | 类型定义 |
| src/middlewares/error.middleware.ts | 错误处理中间件 |
| src/middlewares/validate.middleware.ts | 验证中间件 |
| src/app.ts | 应用入口（集成） |

## 日志规范

### 日志级别使用场景

| 级别 | 场景 |
|-----|------|
| error | 系统错误、异常、需要立即处理的问题 |
| warn | 警告信息、潜在问题、不推荐的操作 |
| info | 重要业务操作、用户行为、系统状态 |
| debug | 调试信息、详细流程（仅开发环境） |

### 禁止记录的内容

- 用户密码
- Token内容
- 信用卡号等敏感信息
- 完整的请求体（可能包含敏感数据）

### 日志上下文必须包含

- 用户ID（如已认证）
- 请求ID
- IP地址
- 操作模块名称
