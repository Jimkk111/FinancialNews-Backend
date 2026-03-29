# 草稿API实现 - 详细执行计划

## 任务概述

实现用户草稿相关API，包括草稿列表、草稿详情、创建/更新草稿、删除草稿、发布草稿功能。草稿功能允许用户保存未完成的新闻稿件，并在完成后发布为正式新闻。

## 前置条件

- 数据库连接已配置（已完成）
- Draft、News、Category 模型已定义（已完成）
- JWT认证中间件已实现（已完成）
- 响应工具函数已实现（已完成）
- 验证中间件已实现（已完成）
- ID生成器已实现（已完成）

## API端点设计

| 方法 | 端点 | 说明 | 查询参数/请求体 | 响应 |
|------|------|------|-----------------|------|
| GET | /api/drafts | 获取草稿列表 | - | DraftListResponse |
| GET | /api/drafts/:id | 获取草稿详情 | - | DraftDetail |
| POST | /api/drafts | 创建草稿 | CreateDraftBody | DraftDetail |
| PUT | /api/drafts/:id | 更新草稿 | UpdateDraftBody | DraftDetail |
| DELETE | /api/drafts/:id | 删除草稿 | - | {message} |
| POST | /api/drafts/:id/publish | 发布草稿 | - | PublishedNews |

## 执行步骤

### 步骤1：实现草稿验证器

**文件**: `src/validators/draft.validator.ts`

验证规则：

#### 1.1 `draftIdParamsSchema` - 草稿ID参数验证
```typescript
const draftIdParamsSchema = z.object({
  id: z.string().min(1).max(50)
})
```

#### 1.2 `createDraftSchema` - 创建草稿请求体验证
```typescript
const createDraftSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000).nullable().optional(),
  coverImage: z.string().url().max(500).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional()
})
```

#### 1.3 `updateDraftSchema` - 更新草稿请求体验证
```typescript
const updateDraftSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).nullable().optional(),
  coverImage: z.string().url().max(500).nullable().optional(),
  categoryId: z.number().int().positive().nullable().optional()
})
```

**实现要求**：
- 使用Zod库
- 导出类型推断：`type CreateDraftBody = z.infer<typeof createDraftSchema>`
- 导出类型推断：`type UpdateDraftBody = z.infer<typeof updateDraftSchema>`
- 导出类型推断：`type DraftIdParams = z.infer<typeof draftIdParamsSchema>`

### 步骤2：实现草稿服务

**文件**: `src/services/draft.service.ts`

实现功能：

#### 2.1 `getDraftList(userId: number): Promise<DraftListItem[]>`

获取用户草稿列表。

**返回**:
```typescript
interface DraftListItem {
  id: string
  title: string | null
  content: string | null
  coverImage: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  status: string
  createdAt: Date
  updatedAt: Date
}
```

**实现要求**：
- 查询当前用户的所有草稿
- 按 updatedAt 倒序排列
- 只返回 status 为 'draft' 的草稿
- 包含关联的 category 数据

#### 2.2 `getDraftById(userId: number, draftId: string): Promise<DraftDetail | null>`

获取草稿详情。

**返回**:
```typescript
interface DraftDetail {
  id: string
  title: string | null
  content: string | null
  coverImage: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  status: string
  createdAt: Date
  updatedAt: Date
}
```

**实现要求**：
- 验证草稿属于当前用户
- 返回 null 表示草稿不存在或不属于当前用户
- 包含关联的 category 数据

#### 2.3 `createDraft(userId: number, data: CreateDraftData): Promise<DraftDetail>`

创建草稿。

**参数**:
```typescript
interface CreateDraftData {
  title: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}
```

**实现要求**：
- 使用 ID 生成器生成唯一草稿ID（格式：draft-xxx）
- 验证 categoryId 对应的分类存在（如果提供）
- 创建草稿记录
- 返回创建的草稿详情

#### 2.4 `updateDraft(userId: number, draftId: string, data: UpdateDraftData): Promise<DraftDetail>`

更新草稿。

**参数**:
```typescript
interface UpdateDraftData {
  title?: string
  content?: string | null
  coverImage?: string | null
  categoryId?: number | null
}
```

**实现要求**：
- 验证草稿存在且属于当前用户
- 验证草稿状态为 'draft'（已发布的不可编辑）
- 验证 categoryId 对应的分类存在（如果提供）
- 只更新提供的字段
- 返回更新后的草稿详情
- 草稿不存在抛出 NOT_FOUND 错误
- 草稿已发布抛出 BAD_REQUEST 错误

#### 2.5 `deleteDraft(userId: number, draftId: string): Promise<void>`

删除草稿。

**实现要求**：
- 验证草稿存在且属于当前用户
- 删除草稿记录
- 草稿不存在抛出 NOT_FOUND 错误

#### 2.6 `publishDraft(userId: number, draftId: string): Promise<PublishedNews>`

发布草稿。

**返回**:
```typescript
interface PublishedNews {
  id: number
  title: string
  summary: string | null
  content: string | null
  publishTime: Date
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  createdAt: Date
}
```

**实现要求**：
- 验证草稿存在且属于当前用户
- 验证草稿状态为 'draft'
- 验证草稿标题不为空
- 创建 News 记录：
  - title: 从草稿获取
  - summary: 从草稿 content 截取前200字符（如果 content 存在）
  - content: 从草稿获取
  - publishTime: 当前时间
  - source: 用户 username
  - views: 0
  - hasImage: 根据 coverImage 是否存在设置
  - imageUrl: 从草稿 coverImage 获取
  - categoryId: 从草稿获取
- 更新草稿状态为 'published'
- 使用事务确保数据一致性
- 返回发布的新闻详情
- 草稿不存在抛出 NOT_FOUND 错误
- 草稿已发布抛出 BAD_REQUEST 错误
- 标题为空抛出 BAD_REQUEST 错误

### 步骤3：实现草稿控制器

**文件**: `src/controllers/draft.controller.ts`

控制器方法：

#### 3.1 `getDraftList(req, res, next)`

处理获取草稿列表请求。

**流程**：
1. 从 req.user 获取用户ID
2. 调用 draftService.getDraftList
3. 使用 success 返回数据

#### 3.2 `getDraftById(req, res, next)`

处理获取草稿详情请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 params 获取草稿ID
3. 调用 draftService.getDraftById
4. 草稿不存在返回 404
5. 使用 success 返回数据

#### 3.3 `createDraft(req, res, next)`

处理创建草稿请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 body 获取已验证的数据
3. 调用 draftService.createDraft
4. 使用 created 返回创建的草稿

#### 3.4 `updateDraft(req, res, next)`

处理更新草稿请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 params 获取草稿ID
3. 从 body 获取已验证的数据
4. 调用 draftService.updateDraft
5. 使用 success 返回更新后的草稿

#### 3.5 `deleteDraft(req, res, next)`

处理删除草稿请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 params 获取草稿ID
3. 调用 draftService.deleteDraft
4. 使用 success 返回成功消息

#### 3.6 `publishDraft(req, res, next)`

处理发布草稿请求。

**流程**：
1. 从 req.user 获取用户ID
2. 从 params 获取草稿ID
3. 调用 draftService.publishDraft
4. 使用 created 返回发布的新闻

**错误处理**：
- 使用 try-catch 包裹
- 错误传递给 next 处理

### 步骤4：更新草稿路由

**文件**: `src/routes/drafts.routes.ts`

路由配置：
```typescript
import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import { validateBody, validateParams } from '../middlewares/validate.middleware'
import {
  draftIdParamsSchema,
  createDraftSchema,
  updateDraftSchema
} from '../validators/draft.validator'
import draftController from '../controllers/draft.controller'

const router = Router()

router.use(authenticate)

router.get('/',
  draftController.getDraftList
)

router.post('/',
  validateBody(createDraftSchema),
  draftController.createDraft
)

router.get('/:id',
  validateParams(draftIdParamsSchema),
  draftController.getDraftById
)

router.put('/:id',
  validateParams(draftIdParamsSchema),
  validateBody(updateDraftSchema),
  draftController.updateDraft
)

router.delete('/:id',
  validateParams(draftIdParamsSchema),
  draftController.deleteDraft
)

router.post('/:id/publish',
  validateParams(draftIdParamsSchema),
  draftController.publishDraft
)

export default router
```

### 步骤5：测试验证

测试内容：
- 启动服务验证各端点可访问
- 测试未登录访问返回401
- 测试创建草稿是否正常
- 测试获取草稿列表是否正确
- 测试获取草稿详情是否正确
- 测试更新草稿是否正常
- 测试删除草稿是否正常
- 测试发布草稿是否正常
- 测试发布后草稿状态变更
- 测试访问其他用户草稿返回404
- 测试错误响应格式是否正确

## 数据库表结构参考

### drafts 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(50) PRIMARY KEY | 草稿ID |
| user_id | INTEGER | 用户ID（外键） |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 内容 |
| cover_image | VARCHAR(500) | 封面图URL |
| category_id | INTEGER | 分类ID（外键） |
| status | VARCHAR(20) | 状态(draft/published) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**索引**：
- user_id（单列索引）
- status（单列索引）

## 统一响应格式

### 草稿列表响应
```json
{
  "success": true,
  "data": [
    {
      "id": "draft-xxx",
      "title": "草稿标题",
      "content": "草稿内容...",
      "coverImage": "https://...",
      "categoryId": 1,
      "category": { "id": 1, "name": "财经" },
      "status": "draft",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

### 草稿详情响应
```json
{
  "success": true,
  "data": {
    "id": "draft-xxx",
    "title": "草稿标题",
    "content": "草稿内容...",
    "coverImage": "https://...",
    "categoryId": 1,
    "category": { "id": 1, "name": "财经" },
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

### 发布新闻响应
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "新闻标题",
    "summary": "新闻摘要...",
    "content": "新闻内容...",
    "publishTime": "2024-01-01T00:00:00.000Z",
    "source": "用户名",
    "views": 0,
    "hasImage": true,
    "imageUrl": "https://...",
    "categoryId": 1,
    "category": { "id": 1, "name": "财经" },
    "createdAt": "2024-01-01T00:00:00.000Z"
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
    "message": "草稿不存在"
  }
}
```

## 性能要求

- 草稿列表不需要分页（用户草稿数量有限）
- 发布草稿使用数据库事务确保数据一致性
- 查询时包含关联的 category 数据

## 安全要求

- 所有接口需要认证，未登录返回401
- 用户只能操作自己的草稿数据
- 草稿ID必须验证为有效字符串
- 防止SQL注入（Prisma自动处理）
- 发布时验证标题不为空

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| src/validators/draft.validator.ts | 草稿验证器 |
| src/services/draft.service.ts | 草稿服务 |
| src/controllers/draft.controller.ts | 草稿控制器 |
| src/routes/drafts.routes.ts | 草稿路由（更新） |

## 依赖关系

```
routes/drafts.routes.ts
    ├── middlewares/auth.middleware.ts (已完成)
    ├── middlewares/validate.middleware.ts (已完成)
    ├── validators/draft.validator.ts
    └── controllers/draft.controller.ts
            └── services/draft.service.ts
                    ├── config/database.ts (Prisma)
                    └── utils/idGenerator.ts (已完成)
```

## 注意事项

1. 草稿ID使用自定义格式（draft-xxx），不使用数据库自增ID
2. 发布草稿时会创建 News 记录，需要使用事务确保一致性
3. 发布后草稿状态变更为 'published'，不可再次编辑或发布
4. 草稿的 summary 字段在发布时从 content 自动截取
5. 用户只能查看和操作自己的草稿
6. 所有时间字段使用 ISO 8601 格式返回
7. 草稿列表按更新时间倒序排列
