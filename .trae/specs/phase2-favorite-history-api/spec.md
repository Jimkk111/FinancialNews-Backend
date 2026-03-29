# 收藏和历史API实现 - 详细执行计划

## 任务概述

实现用户收藏和浏览历史相关API，包括收藏列表、添加收藏、取消收藏、检查收藏状态、浏览历史列表、添加浏览记录、清空历史功能。

## 前置条件

- 数据库连接已配置（已完成）
- Favorite、History、News 模型已定义（已完成）
- JWT认证中间件已实现（已完成）
- 响应工具函数已实现（已完成）
- 验证中间件已实现（已完成）

## API端点设计

### 收藏模块 (/api/favorites)

| 方法 | 端点 | 说明 | 查询参数/请求体 | 响应 |
|------|------|------|-----------------|------|
| GET | /api/favorites | 获取收藏列表 | page, pageSize | NewsListResponse |
| POST | /api/favorites | 添加收藏 | {newsId, title, source, publish_time, views} | {message} |
| DELETE | /api/favorites/:newsId | 取消收藏 | - | {message} |
| GET | /api/favorites/check/:newsId | 检查收藏状态 | - | {is_favorite} |

### 历史模块 (/api/history)

| 方法 | 端点 | 说明 | 查询参数/请求体 | 响应 |
|------|------|------|-----------------|------|
| GET | /api/history | 获取浏览历史 | page, pageSize | NewsListResponse |
| POST | /api/history | 添加浏览记录 | {newsId, title, source, publish_time, views} | {message} |
| DELETE | /api/history | 清空历史 | - | {message} |

## 执行步骤

### 步骤1：实现收藏验证器

**文件**: `src/validators/favorite.validator.ts`

验证规则：

#### 1.1 `favoriteListQuerySchema` - 收藏列表查询验证
```typescript
const favoriteListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
})
```

#### 1.2 `addFavoriteSchema` - 添加收藏请求体验证
```typescript
const addFavoriteSchema = z.object({
  newsId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  source: z.string().max(100).nullable().optional(),
  publish_time: z.string().datetime().nullable().optional(),
  views: z.number().int().min(0).default(0)
})
```

#### 1.3 `newsIdParamsSchema` - 新闻ID参数验证
```typescript
const newsIdParamsSchema = z.object({
  newsId: z.coerce.number().int().positive()
})
```

**实现要求**：
- 使用Zod库
- 导出类型推断：`type FavoriteListQuery = z.infer<typeof favoriteListQuerySchema>`
- 导出验证schema供路由使用

### 步骤2：实现历史验证器

**文件**: `src/validators/history.validator.ts`

验证规则：

#### 2.1 `historyListQuerySchema` - 历史列表查询验证
```typescript
const historyListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
})
```

#### 2.2 `addHistorySchema` - 添加历史请求体验证
```typescript
const addHistorySchema = z.object({
  newsId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  source: z.string().max(100).nullable().optional(),
  publish_time: z.string().datetime().nullable().optional(),
  views: z.number().int().min(0).default(0)
})
```

**实现要求**：
- 使用Zod库
- 导出类型推断

### 步骤3：实现收藏服务

**文件**: `src/services/favorite.service.ts`

实现功能：

#### 3.1 `getFavoriteList(userId: number, options: ListOptions): Promise<FavoriteListResult>`

获取用户收藏列表。

**参数**:
```typescript
interface ListOptions {
  page: number
  pageSize: number
}
```

**返回**:
```typescript
interface FavoriteListResult {
  data: FavoriteNewsItem[]
  total: number
  page: number
  pageSize: number
}

interface FavoriteNewsItem {
  id: number
  title: string
  summary: string | null
  publishTime: Date | null
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  tags: { id: number; name: string }[]
  favoriteAt: Date
}
```

**实现要求**：
- 通过 Favorite 表关联查询 News 数据
- 按 createdAt（收藏时间）倒序排列
- 只返回未删除的新闻（News.deletedAt 为 null）
- 使用 Prisma 的 include 进行关联查询
- 支持分页

#### 3.2 `addFavorite(userId: number, data: AddFavoriteData): Promise<void>`

添加收藏。

**参数**:
```typescript
interface AddFavoriteData {
  newsId: number
}
```

**实现要求**：
- 检查新闻是否存在且未删除
- 检查是否已收藏（唯一约束会自动处理，但需要返回友好错误）
- 创建收藏记录
- 如果新闻不存在，抛出 NOT_FOUND 错误
- 如果已收藏，抛出 CONFLICT 错误

#### 3.3 `removeFavorite(userId: number, newsId: number): Promise<void>`

取消收藏。

**实现要求**：
- 删除指定用户对指定新闻的收藏记录
- 如果记录不存在，抛出 NOT_FOUND 错误

#### 3.4 `checkFavorite(userId: number, newsId: number): Promise<boolean>`

检查收藏状态。

**实现要求**：
- 查询用户是否收藏了指定新闻
- 返回 boolean 值

### 步骤4：实现历史服务

**文件**: `src/services/history.service.ts`

实现功能：

#### 4.1 `getHistoryList(userId: number, options: ListOptions): Promise<HistoryListResult>`

获取用户浏览历史。

**返回**:
```typescript
interface HistoryListResult {
  data: HistoryNewsItem[]
  total: number
  page: number
  pageSize: number
}

interface HistoryNewsItem {
  id: number
  title: string
  summary: string | null
  publishTime: Date | null
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  tags: { id: number; name: string }[]
  viewedAt: Date
}
```

**实现要求**：
- 通过 History 表关联查询 News 数据
- 按 viewedAt（浏览时间）倒序排列
- 只返回未删除的新闻（News.deletedAt 为 null）
- 支持分页

#### 4.2 `addHistory(userId: number, data: AddHistoryData): Promise<void>`

添加浏览记录。

**参数**:
```typescript
interface AddHistoryData {
  newsId: number
}
```

**实现要求**：
- 检查新闻是否存在且未删除
- 如果已存在浏览记录，更新 viewedAt 为当前时间（去重逻辑）
- 如果不存在，创建新的浏览记录
- 使用 upsert 操作实现原子性

#### 4.3 `clearHistory(userId: number): Promise<void>`

清空浏览历史。

**实现要求**：
- 删除指定用户的所有浏览记录
- 返回删除的记录数（可选）

### 步骤5：实现收藏控制器

**文件**: `src/controllers/favorite.controller.ts`

控制器方法：

#### 5.1 `getFavoriteList(req, res, next)`

处理获取收藏列表请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 query 获取已验证的分页参数
3. 调用 favoriteService.getFavoriteList
4. 使用 paginated 响应函数返回分页数据

#### 5.2 `addFavorite(req, res, next)`

处理添加收藏请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 body 获取已验证的新闻ID
3. 调用 favoriteService.addFavorite
4. 使用 success 返回成功消息

#### 5.3 `removeFavorite(req, res, next)`

处理取消收藏请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 params 获取新闻ID
3. 调用 favoriteService.removeFavorite
4. 使用 success 返回成功消息

#### 5.4 `checkFavorite(req, res, next)`

处理检查收藏状态请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 params 获取新闻ID
3. 调用 favoriteService.checkFavorite
4. 使用 success 返回 { is_favorite: boolean }

**错误处理**：
- 使用 try-catch 包裹
- 错误传递给 next 处理

### 步骤6：实现历史控制器

**文件**: `src/controllers/history.controller.ts`

控制器方法：

#### 6.1 `getHistoryList(req, res, next)`

处理获取浏览历史请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 query 获取已验证的分页参数
3. 调用 historyService.getHistoryList
4. 使用 paginated 响应函数返回分页数据

#### 6.2 `addHistory(req, res, next)`

处理添加浏览记录请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 body 获取已验证的新闻ID
3. 调用 historyService.addHistory
4. 使用 success 返回成功消息

#### 6.3 `clearHistory(req, res, next)`

处理清空历史请求。

**流程**：
1. 从 req.user 获取用户ID
2. 调用 historyService.clearHistory
3. 使用 success 返回成功消息

**错误处理**：
- 使用 try-catch 包裹
- 错误传递给 next 处理

### 步骤7：更新收藏路由

**文件**: `src/routes/favorites.routes.ts`

路由配置：
```typescript
import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware'
import {
  favoriteListQuerySchema,
  addFavoriteSchema,
  newsIdParamsSchema
} from '../validators/favorite.validator'
import favoriteController from '../controllers/favorite.controller'

const router = Router()

router.use(authenticate)

router.get('/',
  validateQuery(favoriteListQuerySchema),
  favoriteController.getFavoriteList
)

router.post('/',
  validateBody(addFavoriteSchema),
  favoriteController.addFavorite
)

router.delete('/:newsId',
  validateParams(newsIdParamsSchema),
  favoriteController.removeFavorite
)

router.get('/check/:newsId',
  validateParams(newsIdParamsSchema),
  favoriteController.checkFavorite
)

export default router
```

**路由顺序注意**：
- /check/:newsId 必须在 /:newsId 之前定义（如果有 /:newsId GET 路由）
- 所有路由都需要认证中间件

### 步骤8：更新历史路由

**文件**: `src/routes/history.routes.ts`

路由配置：
```typescript
import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateQuery } from '../middlewares/validate.middleware'
import { historyListQuerySchema, addHistorySchema } from '../validators/history.validator'
import historyController from '../controllers/history.controller'

const router = Router()

router.use(authenticate)

router.get('/',
  validateQuery(historyListQuerySchema),
  historyController.getHistoryList
)

router.post('/',
  validateBody(addHistorySchema),
  historyController.addHistory
)

router.delete('/',
  historyController.clearHistory
)

export default router
```

### 步骤9：测试验证

测试内容：
- 启动服务验证各端点可访问
- 测试未登录访问返回401
- 测试分页参数是否生效
- 测试添加收藏/历史是否正常
- 测试重复添加的处理
- 测试取消收藏/清空历史是否正常
- 测试检查收藏状态是否正确
- 测试错误响应格式是否正确

## 数据库表结构参考

### favorites 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| user_id | INTEGER | 用户ID（外键） |
| news_id | INTEGER | 新闻ID（外键） |
| created_at | TIMESTAMP | 收藏时间 |

**索引**：
- user_id（单列索引）
- news_id（单列索引）
- (user_id, news_id) 唯一约束

### history 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| user_id | INTEGER | 用户ID（外键） |
| news_id | INTEGER | 新闻ID（外键） |
| viewed_at | TIMESTAMP | 浏览时间 |

**索引**：
- user_id（单列索引）
- viewed_at（单列索引，用于排序）

## 统一响应格式

### 列表响应
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "新闻标题",
      "summary": "新闻摘要",
      "publishTime": "2024-01-01T00:00:00.000Z",
      "source": "来源",
      "views": 100,
      "hasImage": true,
      "imageUrl": "https://...",
      "categoryId": 1,
      "category": { "id": 1, "name": "财经" },
      "tags": [{ "id": 1, "name": "股市" }],
      "favoriteAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 收藏状态响应
```json
{
  "success": true,
  "data": {
    "is_favorite": true
  }
}
```

### 成功消息响应
```json
{
  "success": true,
  "data": {
    "message": "操作成功"
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "新闻不存在"
  }
}
```

## 性能要求

- 列表查询必须使用分页，限制最大页大小为50
- 查询时只选择必要字段，避免返回 content 等大字段
- 使用数据库索引优化查询（userId、newsId、viewedAt 已建索引）
- 添加历史使用 upsert 操作，避免先查询再插入

## 安全要求

- 所有接口需要认证，未登录返回401
- 用户只能操作自己的收藏和历史数据
- 新闻ID必须验证为正整数
- 防止SQL注入（Prisma自动处理）

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| src/validators/favorite.validator.ts | 收藏验证器 |
| src/validators/history.validator.ts | 历史验证器 |
| src/services/favorite.service.ts | 收藏服务 |
| src/services/history.service.ts | 历史服务 |
| src/controllers/favorite.controller.ts | 收藏控制器 |
| src/controllers/history.controller.ts | 历史控制器 |
| src/routes/favorites.routes.ts | 收藏路由（更新） |
| src/routes/history.routes.ts | 历史路由（更新） |

## 依赖关系

```
routes/favorites.routes.ts
    ├── middlewares/auth.middleware.ts (已完成)
    ├── middlewares/validate.middleware.ts (已完成)
    ├── validators/favorite.validator.ts
    └── controllers/favorite.controller.ts
            └── services/favorite.service.ts
                    └── config/database.ts (Prisma)

routes/history.routes.ts
    ├── middlewares/auth.middleware.ts (已完成)
    ├── middlewares/validate.middleware.ts (已完成)
    ├── validators/history.validator.ts
    └── controllers/history.controller.ts
            └── services/history.service.ts
                    └── config/database.ts (Prisma)
```

## 注意事项

1. 收藏和历史的列表数据需要关联 News 表获取新闻详情
2. 添加浏览历史时需要处理重复记录（同一用户同一新闻）
3. 删除新闻时，关联的收藏和历史会级联删除（schema已配置）
4. 所有时间字段使用 ISO 8601 格式返回
5. 收藏列表按收藏时间倒序，历史列表按浏览时间倒序
6. 查询时需要过滤已删除的新闻（News.deletedAt 为 null）
