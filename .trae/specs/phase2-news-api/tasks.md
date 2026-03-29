# 新闻API实现 - 任务清单

## 任务概览

| 序号 | 任务 | 状态 | 依赖 |
|------|------|------|------|
| 1 | 实现新闻验证器 | 待开始 | 无 |
| 2 | 实现新闻服务 | 待开始 | 无 |
| 3 | 实现新闻控制器 | 待开始 | 任务1, 任务2 |
| 4 | 更新新闻路由 | 待开始 | 任务1, 任务3 |
| 5 | 测试验证 | 待开始 | 任务4 |

---

## 任务1：实现新闻验证器

**文件**: `src/validators/news.validator.ts`

**状态**: 待开始

**内容**:
- [ ] 创建 `newsListQuerySchema` - 新闻列表查询验证
- [ ] 创建 `newsIdParamsSchema` - 新闻ID参数验证
- [ ] 创建 `searchQuerySchema` - 搜索查询验证
- [ ] 导出所有 schema

**验证规则**:
- page: 可选，默认1，最小1
- pageSize: 可选，默认10，最小1，最大50
- categoryId: 可选，整数
- sort: 可选，枚举 [newest, popular]
- id: 必填，正整数
- keyword: 必填，1-100字符

---

## 任务2：实现新闻服务

**文件**: `src/services/news.service.ts`

**状态**: 待开始

**内容**:
- [ ] 实现 `getNewsList` - 获取新闻列表（分页、分类筛选、排序）
- [ ] 实现 `getNewsById` - 获取新闻详情
- [ ] 实现 `incrementViews` - 增加浏览量
- [ ] 实现 `getCategories` - 获取分类列表
- [ ] 实现 `getTags` - 获取标签列表
- [ ] 实现 `searchNews` - 搜索新闻

**技术要求**:
- 使用 Prisma 进行数据库操作
- 列表查询不返回 content 字段
- 浏览量更新使用原子操作
- 搜索使用 LIKE 模糊匹配
- 所有查询过滤 deletedAt 为 null 的记录

---

## 任务3：实现新闻控制器

**文件**: `src/controllers/news.controller.ts`

**状态**: 待开始

**依赖**: 任务1, 任务2

**内容**:
- [ ] 实现 `getNewsList` - 处理新闻列表请求
- [ ] 实现 `getNewsById` - 处理新闻详情请求
- [ ] 实现 `incrementViews` - 处理增加浏览量请求
- [ ] 实现 `getCategories` - 处理分类列表请求
- [ ] 实现 `getTags` - 处理标签列表请求
- [ ] 实现 `searchNews` - 处理搜索请求

**响应格式**:
- 列表使用 `paginated` 函数
- 详情使用 `success` 函数
- 不存在使用 `notFound` 函数

---

## 任务4：更新新闻路由

**文件**: `src/routes/news.routes.ts`

**状态**: 待开始

**依赖**: 任务1, 任务3

**内容**:
- [ ] 导入验证器和控制器
- [ ] 配置 GET / 路由（列表）
- [ ] 配置 GET /categories 路由
- [ ] 配置 GET /tags 路由
- [ ] 配置 GET /search 路由
- [ ] 配置 GET /:id 路由（详情）
- [ ] 配置 POST /:id/views 路由

**路由顺序**:
1. GET /
2. GET /categories
3. GET /tags
4. GET /search
5. GET /:id
6. POST /:id/views

---

## 任务5：测试验证

**状态**: 待开始

**依赖**: 任务4

**内容**:
- [ ] 启动服务验证无编译错误
- [ ] 测试 GET /api/news 列表接口
- [ ] 测试 GET /api/news?page=1&pageSize=10 分页参数
- [ ] 测试 GET /api/news?categoryId=1 分类筛选
- [ ] 测试 GET /api/news?sort=newest 排序
- [ ] 测试 GET /api/news?sort=popular 排序
- [ ] 测试 GET /api/news/categories 分类列表
- [ ] 测试 GET /api/news/tags 标签列表
- [ ] 测试 GET /api/news/search?keyword=xxx 搜索
- [ ] 测试 GET /api/news/:id 详情
- [ ] 测试 POST /api/news/:id/views 增加浏览量
- [ ] 测试错误响应格式

---

## 验收标准

- [ ] 所有接口返回正确的响应格式
- [ ] 分页功能正常工作
- [ ] 分类筛选功能正常
- [ ] 排序功能正常
- [ ] 搜索功能正常
- [ ] 浏览量原子更新正常
- [ ] 错误响应格式统一
- [ ] 无 TypeScript 编译错误
