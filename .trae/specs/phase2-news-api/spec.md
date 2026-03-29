# 新闻API实现 - 详细执行计划

## 任务概述

实现新闻相关API，包括新闻列表、详情、搜索、分类列表、标签列表、增加浏览量功能。

## 前置条件

- 数据库连接已配置（已完成）
- News、Category、Tag、NewsTag 模型已定义（已完成）
- 响应工具函数已实现（已完成）
- 验证中间件已实现（已完成）

## API端点设计

| 方法 | 端点 | 说明 | 查询参数/请求体 | 响应 |
|------|------|------|-----------------|------|
| GET | /api/news | 获取新闻列表 | page, pageSize, categoryId?, sort? | NewsListResponse |
| GET | /api/news/:id | 获取新闻详情 | - | NewsDetail |
| POST | /api/news/:id/views | 增加浏览量 | - | {id, views} |
| GET | /api/news/categories | 获取分类列表 | - | Category[] |
| GET | /api/news/tags | 获取标签列表 | - | Tag[] |
| GET | /api/news/search | 搜索新闻 | keyword, page, pageSize | SearchResponse |

## 执行步骤

### 步骤1：实现新闻验证器

**文件**: `src/validators/news.validator.ts`

验证规则：
- `newsListQuerySchema` - 新闻列表查询验证
  - page: 可选，默认1，最小1
  - pageSize: 可选，默认10，最小1，最大50
  - categoryId: 可选，整数
  - sort: 可选，枚举值 [newest, popular]
- `newsIdParamsSchema` - 新闻ID参数验证
  - id: 必填，正整数
- `searchQuerySchema` - 搜索查询验证
  - keyword: 必填，1-100字符
  - page: 可选，默认1
  - pageSize: 可选，默认10，最大50

**实现要求**：
- 使用Zod库
- 支持类型推断

### 步骤2：实现新闻服务

**文件**: `src/services/news.service.ts`

实现功能：

#### 2.1 `getNewsList(options: NewsListOptions): Promise<NewsListResult>`

获取新闻列表，支持分页、分类筛选、排序。

**参数**:
```typescript
interface NewsListOptions {
  page: number
  pageSize: number
  categoryId?: number
  sort?: 'newest' | 'popular'
}
```

**返回**:
```typescript
interface NewsListResult {
  data: NewsListItem[]
  total: number
  page: number
  pageSize: number
}

interface NewsListItem {
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
}
```

**实现要求**：
- 使用 Prisma 查询
- 排序逻辑：newest 按 publishTime DESC，popular 按 views DESC
- 分类筛选时使用 categoryId 精确匹配
- 包含关联的 category 和 tags 数据
- 只返回未删除的新闻（deletedAt 为 null）

#### 2.2 `getNewsById(id: number): Promise<NewsDetail | null>`

获取新闻详情。

**返回**:
```typescript
interface NewsDetail {
  id: number
  title: string
  summary: string | null
  content: string | null
  publishTime: Date | null
  source: string | null
  views: number
  hasImage: boolean
  imageUrl: string | null
  categoryId: number | null
  category: { id: number; name: string } | null
  tags: { id: number; name: string }[]
  createdAt: Date
}
```

**实现要求**：
- 包含完整的 content 字段
- 包含关联的 category 和 tags
- 返回 null 表示新闻不存在

#### 2.3 `incrementViews(id: number): Promise<{ id: number; views: number } | null>`

增加新闻浏览量。

**实现要求**：
- 使用原子操作更新 views 字段
- 返回更新后的 id 和 views
- 返回 null 表示新闻不存在

#### 2.4 `getCategories(): Promise<Category[]>`

获取所有分类列表。

**返回**:
```typescript
interface Category {
  id: number
  name: string
}
```

#### 2.5 `getTags(): Promise<Tag[]>`

获取所有标签列表。

**返回**:
```typescript
interface Tag {
  id: number
  name: string
}
```

#### 2.6 `searchNews(options: SearchOptions): Promise<SearchResult>`

搜索新闻。

**参数**:
```typescript
interface SearchOptions {
  keyword: string
  page: number
  pageSize: number
}
```

**返回**:
```typescript
interface SearchResult {
  data: NewsListItem[]
  total: number
  page: number
  pageSize: number
  keyword: string
}
```

**实现要求**：
- 在 title 和 summary 字段中搜索关键词
- 使用 Prisma 的 contains 模式（不区分大小写）
- 按 publishTime DESC 排序
- 只返回未删除的新闻

### 步骤3：实现新闻控制器

**文件**: `src/controllers/news.controller.ts`

控制器方法：

#### 3.1 `getNewsList(req, res, next)`

处理获取新闻列表请求。

**流程**：
1. 从 query 获取已验证的参数
2. 调用 newsService.getNewsList
3. 使用 paginated 响应函数返回分页数据

#### 3.2 `getNewsById(req, res, next)`

处理获取新闻详情请求。

**流程**：
1. 从 params 获取新闻 ID
2. 调用 newsService.getNewsById
3. 新闻不存在返回 404
4. 使用 success 返回数据

#### 3.3 `incrementViews(req, res, next)`

处理增加浏览量请求。

**流程**：
1. 从 params 获取新闻 ID
2. 调用 newsService.incrementViews
3. 新闻不存在返回 404
4. 使用 success 返回更新后的数据

#### 3.4 `getCategories(req, res, next)`

处理获取分类列表请求。

**流程**：
1. 调用 newsService.getCategories
2. 使用 success 返回数据

#### 3.5 `getTags(req, res, next)`

处理获取标签列表请求。

**流程**：
1. 调用 newsService.getTags
2. 使用 success 返回数据

#### 3.6 `searchNews(req, res, next)`

处理搜索新闻请求。

**流程**：
1. 从 query 获取已验证的参数
2. 调用 newsService.searchNews
3. 使用 paginated 响应函数返回分页数据

**错误处理**：
- 使用 try-catch 包裹
- 错误传递给 next 处理

### 步骤4：更新新闻路由

**文件**: `src/routes/news.routes.ts`

路由配置：
```typescript
router.get('/', 
  validateQuery(newsListQuerySchema), 
  newsController.getNewsList
)

router.get('/categories', 
  newsController.getCategories
)

router.get('/tags', 
  newsController.getTags
)

router.get('/search', 
  validateQuery(searchQuerySchema), 
  newsController.searchNews
)

router.get('/:id', 
  validateParams(newsIdParamsSchema), 
  newsController.getNewsById
)

router.post('/:id/views', 
  validateParams(newsIdParamsSchema), 
  newsController.incrementViews
)
```

**路由顺序注意**：
- /categories、/tags、/search 必须在 /:id 之前定义
- 避免将 categories、tags、search 误解析为 id

### 步骤5：测试验证

测试内容：
- 启动服务验证各端点可访问
- 测试分页参数是否生效
- 测试分类筛选是否正确
- 测试排序功能是否正常
- 测试搜索功能是否正确
- 测试错误响应格式是否正确

## 数据库表结构参考

### news 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| title | VARCHAR(200) | 标题 |
| summary | TEXT | 摘要 |
| content | TEXT | 内容 |
| publish_time | TIMESTAMP | 发布时间 |
| source | VARCHAR(100) | 来源 |
| views | INTEGER DEFAULT 0 | 浏览量 |
| has_image | BOOLEAN | 是否有图片 |
| image_url | VARCHAR(500) | 图片URL |
| category_id | INTEGER | 分类ID |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间 |

### categories 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| name | VARCHAR(50) | 分类名称 |

### tags 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL PRIMARY KEY | 主键 |
| name | VARCHAR(50) | 标签名称 |

### news_tags 表

| 字段 | 类型 | 说明 |
|------|------|------|
| news_id | INTEGER | 新闻ID |
| tag_id | INTEGER | 标签ID |

## 统一响应格式

### 列表响应
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 详情响应
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "...",
    "summary": "...",
    "content": "...",
    ...
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
- 使用数据库索引优化查询（categoryId、publishTime、views 已建索引）
- 搜索使用数据库的模糊匹配，避免全表扫描

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| src/validators/news.validator.ts | 新闻验证器 |
| src/services/news.service.ts | 新闻服务 |
| src/controllers/news.controller.ts | 新闻控制器 |
| src/routes/news.routes.ts | 新闻路由 |

## 依赖关系

```
routes/news.routes.ts
    ├── validators/news.validator.ts
    ├── controllers/news.controller.ts
    │       └── services/news.service.ts
    │               └── config/database.ts (Prisma)
    └── middlewares/validate.middleware.ts (已完成)
```

## 注意事项

1. 路由顺序至关重要，静态路径必须在动态参数路由之前
2. 新闻列表不返回 content 字段，减少数据传输量
3. 浏览量更新使用原子操作，避免并发问题
4. 搜索功能使用数据库的 LIKE 查询，注意性能影响
5. 所有查询都要过滤 deletedAt 为 null 的记录
