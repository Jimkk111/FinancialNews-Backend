# 财经新闻后端服务

基于 Node.js + Express + TypeScript 的财经新闻平台后端 API 服务。

## 技术栈

- **运行时**: Node.js
- **框架**: Express 5
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: MySQL
- **缓存**: Redis (ioredis)
- **认证**: JWT (jsonwebtoken + bcryptjs)
- **校验**: Zod
- **日志**: Winston + Morgan
- **安全**: Helmet + CORS + express-rate-limit
- **文件上传**: Multer

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Redis

### 安装与配置

```bash
# 安装依赖
npm install

# 复制环境变量文件并填写配置
cp .env.example .env

# 初始化数据库
npm run db:setup
```

### 开发

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── config/          # 配置模块（数据库、JWT、Redis、AI、文件上传等）
├── controllers/     # 控制器层
├── middlewares/     # 中间件（认证、错误处理、限流、校验、文件上传）
├── routes/          # 路由定义
├── services/        # 业务逻辑层
├── types/           # TypeScript 类型声明
├── utils/           # 工具函数（日志、响应封装、密码等）
├── validators/      # Zod 请求校验
├── app.ts           # Express 应用配置
└── index.ts         # 入口文件
```

## API 模块

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/auth` | 注册、登录、邮箱验证 |
| 用户 | `/api/users` | 用户信息管理 |
| 新闻 | `/api/news` | 新闻 CRUD、分类与标签 |
| 收藏 | `/api/favorites` | 新闻收藏 |
| 历史 | `/api/history` | 阅读历史 |
| 草稿 | `/api/drafts` | 草稿管理 |
| AI | `/api/ai` | AI 对话与新闻分析 |

## 数据库

使用 Prisma ORM 管理数据模型，主要数据表：

- `users` - 用户
- `categories` - 新闻分类
- `tags` - 新闻标签
- `news` - 新闻
- `news_tags` - 新闻标签关联
- `drafts` - 草稿
- `favorites` - 收藏
- `history` - 阅读历史
- `ai_sessions` / `ai_messages` - AI 对话
- `verification_codes` - 邮箱验证码

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式启动（nodemon 热重载） |
| `npm run build` | TypeScript 编译 |
| `npm start` | 生产模式启动 |
| `npm run prisma:generate` | 生成 Prisma Client |
| `npm run prisma:migrate` | 执行数据库迁移 |
| `npm run prisma:studio` | 启动 Prisma Studio 管理界面 |
| `npm run prisma:seed` | 填充种子数据 |
| `npm run db:setup` | 一键初始化数据库 |

## 环境变量

参考 `.env.example`，主要配置项包括数据库连接、JWT 密钥、Redis 连接、SMTP 邮件服务、AI API 密钥及文件上传相关参数。
