# 后端API开发计划

## 项目概述

基于现有Vue前端项目，开发配套的后端API服务。前端是一个财经新闻应用，包含用户认证、新闻浏览、收藏历史、AI助手等功能。

## 技术栈建议

- **框架**: Node.js + Nuxt.js **数据库**: MySQL（关系型数据）+ Redis（缓存/会话）
- **认证**: JWT Token
- **文件存储**: 本地存储或云存储（阿里云OSS/腾讯云COS）
- **AI集成**: 可对接OpenAI API或国内大模型API

***

## 数据库设计

### 用户表 (users)

| 字段             | 类型                  | 说明                |
| -------------- | ------------------- | ----------------- |
| id             | SERIAL PRIMARY KEY  | 主键                |
| uid            | VARCHAR(50) UNIQUE  | 用户唯一标识 (user-xxx) |
| display\_id    | VARCHAR(20) UNIQUE  | 显示ID (Uxxxxxx)    |
| username       | VARCHAR(50) UNIQUE  | 用户名               |
| email          | VARCHAR(100) UNIQUE | 邮箱                |
| password\_hash | VARCHAR(255)        | 密码哈希              |
| avatar         | VARCHAR(500)        | 头像URL             |
| created\_at    | TIMESTAMP           | 创建时间              |
| updated\_at    | TIMESTAMP           | 更新时间              |

### 新闻表 (news)

| 字段            | 类型                 | 说明    |
| ------------- | ------------------ | ----- |
| id            | SERIAL PRIMARY KEY | 主键    |
| title         | VARCHAR(200)       | 标题    |
| summary       | TEXT               | 摘要    |
| content       | TEXT               | 内容    |
| publish\_time | TIMESTAMP          | 发布时间  |
| source        | VARCHAR(100)       | 来源    |
| views         | INTEGER DEFAULT 0  | 浏览量   |
| has\_image    | BOOLEAN            | 是否有图片 |
| image\_url    | VARCHAR(500)       | 图片URL |
| category\_id  | INTEGER            | 分类ID  |
| created\_at   | TIMESTAMP          | 创建时间  |

### 分类表 (categories)

| 字段   | 类型                 | 说明   |
| ---- | ------------------ | ---- |
| id   | SERIAL PRIMARY KEY | 主键   |
| name | VARCHAR(50)        | 分类名称 |

### 标签表 (tags)

| 字段   | 类型                 | 说明   |
| ---- | ------------------ | ---- |
| id   | SERIAL PRIMARY KEY | 主键   |
| name | VARCHAR(50)        | 标签名称 |

### 新闻标签关联表 (news\_tags)

| 字段       | 类型      | 说明   |
| -------- | ------- | ---- |
| news\_id | INTEGER | 新闻ID |
| tag\_id  | INTEGER | 标签ID |

### 草稿表 (drafts)

| 字段           | 类型                      | 说明                  |
| ------------ | ----------------------- | ------------------- |
| id           | VARCHAR(50) PRIMARY KEY | 草稿ID                |
| user\_id     | INTEGER                 | 用户ID                |
| title        | VARCHAR(200)            | 标题                  |
| content      | TEXT                    | 内容                  |
| cover\_image | VARCHAR(500)            | 封面图                 |
| category\_id | INTEGER                 | 分类ID                |
| status       | VARCHAR(20)             | 状态(draft/published) |
| created\_at  | TIMESTAMP               | 创建时间                |
| updated\_at  | TIMESTAMP               | 更新时间                |

### 收藏表 (favorites)

| 字段          | 类型                 | 说明   |
| ----------- | ------------------ | ---- |
| id          | SERIAL PRIMARY KEY | 主键   |
| user\_id    | INTEGER            | 用户ID |
| news\_id    | INTEGER            | 新闻ID |
| created\_at | TIMESTAMP          | 收藏时间 |

### 浏览历史表 (history)

| 字段         | 类型                 | 说明   |
| ---------- | ------------------ | ---- |
| id         | SERIAL PRIMARY KEY | 主键   |
| user\_id   | INTEGER            | 用户ID |
| news\_id   | INTEGER            | 新闻ID |
| viewed\_at | TIMESTAMP          | 浏览时间 |

### AI会话表 (ai\_sessions)

| 字段          | 类型                 | 说明   |
| ----------- | ------------------ | ---- |
| id          | SERIAL PRIMARY KEY | 主键   |
| session\_id | VARCHAR(50) UNIQUE | 会话ID |
| user\_id    | INTEGER            | 用户ID |
| title       | VARCHAR(100)       | 会话标题 |
| created\_at | TIMESTAMP          | 创建时间 |
| updated\_at | TIMESTAMP          | 更新时间 |

### AI消息表 (ai\_messages)

| 字段          | 类型                 | 说明                 |
| ----------- | ------------------ | ------------------ |
| id          | SERIAL PRIMARY KEY | 主键                 |
| session\_id | INTEGER            | 会话ID               |
| role        | VARCHAR(20)        | 角色(user/assistant) |
| content     | TEXT               | 消息内容               |
| created\_at | TIMESTAMP          | 创建时间               |

### 验证码表 (verification\_codes)

| 字段          | 类型                 | 说明         |
| ----------- | ------------------ | ---------- |
| id          | SERIAL PRIMARY KEY | 主键         |
| email       | VARCHAR(100)       | 邮箱         |
| code        | VARCHAR(10)        | 验证码        |
| username    | VARCHAR(50)        | 用户名(重置密码用) |
| expires\_at | TIMESTAMP          | 过期时间       |

***

## API端点设计

### 1. 认证模块 (/api/auth)

| 方法   | 端点              | 说明    | 请求体                                 | 响应                     |
| ---- | --------------- | ----- | ----------------------------------- | ---------------------- |
| POST | /login          | 用户登录  | `{username, password}`              | `{access_token, user}` |
| POST | /register       | 用户注册  | `{username, email, password, code}` | `{access_token, user}` |
| POST | /logout         | 用户登出  | -                                   | `{message}`            |
| POST | /send-code      | 发送验证码 | `{email, username?}`                | `{message}`            |
| POST | /reset-password | 重置密码  | `{username, email, code, password}` | `{message}`            |

### 2. 用户模块 (/api/users)

| 方法   | 端点         | 说明       | 请求体                   | 响应         |
| ---- | ---------- | -------- | --------------------- | ---------- |
| GET  | /me        | 获取当前用户信息 | -                     | `UserInfo` |
| PUT  | /me        | 更新用户信息   | `{username?, email?}` | `UserInfo` |
| POST | /me/avatar | 上传头像     | FormData(file)        | `{avatar}` |

### 3. 新闻模块 (/api/news)

| 方法   | 端点          | 说明     | 查询参数                                 | 响应                 |
| ---- | ----------- | ------ | ------------------------------------ | ------------------ |
| GET  | /           | 获取新闻列表 | `page, pageSize, categoryId?, sort?` | `NewsListResponse` |
| GET  | /:id        | 获取新闻详情 | -                                    | `NewsDetail`       |
| POST | /:id/views  | 增加浏览量  | -                                    | `{id, views}`      |
| GET  | /categories | 获取分类列表 | -                                    | `Category[]`       |
| GET  | /tags       | 获取标签列表 | -                                    | `Tag[]`            |
| GET  | /search     | 搜索新闻   | `keyword, page, pageSize`            | `SearchResponse`   |

### 4. 收藏模块 (/api/favorites)

| 方法     | 端点             | 说明     | 请求体                                            | 响应                 |
| ------ | -------------- | ------ | ---------------------------------------------- | ------------------ |
| GET    | /              | 获取收藏列表 | `page, pageSize`                               | `NewsListResponse` |
| POST   | /              | 添加收藏   | `{newsId, title, source, publish_time, views}` | `{message}`        |
| DELETE | /:newsId       | 取消收藏   | -                                              | `{message}`        |
| GET    | /check/:newsId | 检查收藏状态 | -                                              | `{is_favorite}`    |

### 5. 历史模块 (/api/history)

| 方法     | 端点 | 说明     | 请求体                                            | 响应                 |
| ------ | -- | ------ | ---------------------------------------------- | ------------------ |
| GET    | /  | 获取浏览历史 | `page, pageSize`                               | `NewsListResponse` |
| POST   | /  | 添加浏览记录 | `{newsId, title, source, publish_time, views}` | `{message}`        |
| DELETE | /  | 清空历史   | -                                              | `{message}`        |

### 6. 草稿模块 (/api/drafts)

| 方法     | 端点           | 说明      | 请求体         | 响应              |
| ------ | ------------ | ------- | ----------- | --------------- |
| GET    | /            | 获取草稿列表  | -           | `NewsDraft[]`   |
| GET    | /:id         | 获取草稿详情  | -           | `NewsDraft`     |
| POST   | /            | 创建/更新草稿 | `NewsDraft` | `NewsDraft`     |
| DELETE | /:id         | 删除草稿    | -           | `{message}`     |
| POST   | /:id/publish | 发布草稿    | -           | `PublishedNews` |

### 7. AI助手模块 (/api/ai)

| 方法     | 端点                     | 说明     | 请求体                               | 响应                       |
| ------ | ---------------------- | ------ | --------------------------------- | ------------------------ |
| GET    | /sessions              | 获取会话列表 | -                                 | `SessionInfo[]`          |
| POST   | /sessions              | 创建新会话  | -                                 | `{session_id}`           |
| GET    | /sessions/:id/messages | 获取会话消息 | -                                 | `ChatMessage[]`          |
| PUT    | /sessions/:id          | 更新会话标题 | `{title}`                         | `{message}`              |
| DELETE | /sessions/:id          | 删除会话   | -                                 | `{message}`              |
| POST   | /chat                  | AI对话   | `{messages, sessionId?, stream?}` | `{role, content}` 或 SSE流 |
| GET    | /health                | 健康检查   | -                                 | `{status}`               |

***

## 统一响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

***

## 实施步骤

### 第一阶段：基础架构

1. 初始化项目，配置开发环境
2. 设置数据库连接和ORM
3. 实现JWT认证中间件
4. 配置错误处理和日志

### 第二阶段：核心功能

1. 实现用户认证API（登录、注册、验证码）
2. 实现新闻API（列表、详情、搜索）
3. 实现收藏和历史API
4. 实现草稿API

### 第三阶段：高级功能

1. 实现AI助手API（对接大模型）
2. 实现文件上传功能
3. 添加缓存优化
4. 添加API限流

### 第四阶段：部署上线

1. 编写单元测试和集成测试
2. 配置生产环境
3. 部署到服务器
4. 配置域名和HTTPS

***

## 前端对接修改

后端开发完成后，前端需要修改的内容：

1. 创建 `src/api/` 目录，封装axios请求
2. 修改 `src/services/` 下的服务，调用真实API
3. 删除 `src/data/` 下的模拟数据文件
4. 配置API基础URL（环境变量）

