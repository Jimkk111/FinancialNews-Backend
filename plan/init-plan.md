# 项目初始化与结构设置计划

## 一、技术栈确认

基于原计划文档，确定以下技术栈：

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 运行时 | Node.js 18+ | LTS版本 |
| Web框架 | Express.js | 成熟稳定，生态丰富 |
| 数据库ORM | Prisma | 类型安全，迁移管理方便 |
| 数据库 | MySQL 8.0 | 关系型数据库 |
| 缓存 | Redis | 会话管理、缓存、限流 |
| 认证 | JWT | 无状态认证 |
| 参数验证 | Zod | TypeScript原生支持 |
| 日志 | Winston | 生产级日志方案 |
| 进程管理 | PM2 | 生产环境进程管理 |

---

## 二、项目目录结构

```
backend/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   ├── migrations/            # 数据库迁移文件
│   └── seed.ts                # 初始数据种子
├── src/
│   ├── config/
│   │   ├── index.ts           # 配置入口
│   │   ├── database.ts        # 数据库配置
│   │   ├── redis.ts           # Redis配置
│   │   └── jwt.ts             # JWT配置
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── news.controller.ts
│   │   ├── favorite.controller.ts
│   │   ├── history.controller.ts
│   │   ├── draft.controller.ts
│   │   └── ai.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── upload.middleware.ts
│   ├── routes/
│   │   ├── index.ts           # 路由入口
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── news.routes.ts
│   │   ├── favorites.routes.ts
│   │   ├── history.routes.ts
│   │   ├── drafts.routes.ts
│   │   └── ai.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── news.service.ts
│   │   ├── favorite.service.ts
│   │   ├── history.service.ts
│   │   ├── draft.service.ts
│   │   ├── ai.service.ts
│   │   ├── email.service.ts
│   │   └── cache.service.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── news.validator.ts
│   │   ├── favorite.validator.ts
│   │   ├── history.validator.ts
│   │   └── draft.validator.ts
│   ├── utils/
│   │   ├── response.ts        # 统一响应工具
│   │   ├── password.ts        # 密码加密工具
│   │   ├── token.ts           # Token生成工具
│   │   ├── logger.ts          # 日志工具
│   │   └── idGenerator.ts     # ID生成工具
│   ├── types/
│   │   ├── express.d.ts       # Express类型扩展
│   │   └── index.ts           # 公共类型定义
│   └── app.ts                 # 应用入口
├── uploads/                   # 文件上传目录
├── logs/                      # 日志目录
├── .env                       # 环境变量
├── .env.example               # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── ecosystem.config.js        # PM2配置
```

---

## 三、初始化步骤

### 步骤1：初始化Node.js项目

```bash
# 初始化项目
npm init -y

# 安装生产依赖
npm install express cors helmet morgan compression
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install zod
npm install dotenv
npm install winston
npm install ioredis
npm install nodemailer
npm install uuid
npm install multer

# 安装开发依赖
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/morgan @types/compression
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D @types/nodemailer @types/uuid @types/multer
npm install -D ts-node tsx nodemon
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier
```

### 步骤2：配置TypeScript

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 步骤3：配置环境变量

创建 `.env.example`：

```env
# 服务配置
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/financial_news"

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 邮件配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# AI配置
AI_API_KEY=your-ai-api-key
AI_API_URL=https://api.openai.com/v1

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 步骤4：初始化Prisma

```bash
# 初始化Prisma
npx prisma init

# 创建数据库模型后执行迁移
npx prisma migrate dev --name init

# 生成Prisma客户端
npx prisma generate
```

### 步骤5：配置Nodemon

创建 `nodemon.json`：

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "tsx src/app.ts"
}
```

### 步骤6：配置PM2

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'financial-news-api',
    script: './dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 步骤7：配置package.json脚本

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/app.js",
    "start:prod": "pm2 start ecosystem.config.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

---

## 四、Prisma数据库模型

创建 `prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  uid           String   @unique @db.VarChar(50)
  displayId     String   @unique @map("display_id") @db.VarChar(20)
  username      String   @unique @db.VarChar(50)
  email         String   @unique @db.VarChar(100)
  passwordHash  String   @map("password_hash") @db.VarChar(255)
  avatar        String?  @db.VarChar(500)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  favorites     Favorite[]
  history       History[]
  drafts        Draft[]
  aiSessions    AiSession[]

  @@map("users")
}

model Category {
  id        Int     @id @default(autoincrement())
  name      String  @db.VarChar(50)
  news      News[]
  drafts    Draft[]

  @@map("categories")
}

model Tag {
  id        Int         @id @default(autoincrement())
  name      String      @db.VarChar(50)
  newsTags  NewsTag[]

  @@map("tags")
}

model News {
  id          Int        @id @default(autoincrement())
  title       String     @db.VarChar(200)
  summary     String?    @db.Text
  content     String?    @db.Text
  publishTime DateTime?  @map("publish_time")
  source      String?    @db.VarChar(100)
  views       Int        @default(0)
  hasImage    Boolean    @default(false) @map("has_image")
  imageUrl    String?    @map("image_url") @db.VarChar(500)
  categoryId  Int?       @map("category_id")
  createdAt   DateTime   @default(now()) @map("created_at")
  
  category    Category?  @relation(fields: [categoryId], references: [id])
  newsTags    NewsTag[]
  favorites   Favorite[]
  history     History[]

  @@map("news")
}

model NewsTag {
  newsId Int @map("news_id")
  tagId  Int @map("tag_id")

  news   News @relation(fields: [newsId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([newsId, tagId])
  @@map("news_tags")
}

model Draft {
  id          String    @id @db.VarChar(50)
  userId      Int       @map("user_id")
  title       String?   @db.VarChar(200)
  content     String?   @db.Text
  coverImage  String?   @map("cover_image") @db.VarChar(500)
  categoryId  Int?      @map("category_id")
  status      String    @default("draft") @db.VarChar(20)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category? @relation(fields: [categoryId], references: [id])

  @@map("drafts")
}

model Favorite {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  newsId    Int      @map("news_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  news      News     @relation(fields: [newsId], references: [id], onDelete: Cascade)

  @@unique([userId, newsId])
  @@map("favorites")
}

model History {
  id       Int      @id @default(autoincrement())
  userId   Int      @map("user_id")
  newsId   Int      @map("news_id")
  viewedAt DateTime @default(now()) @map("viewed_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  news     News     @relation(fields: [newsId], references: [id], onDelete: Cascade)

  @@map("history")
}

model AiSession {
  id        Int         @id @default(autoincrement())
  sessionId String      @unique @map("session_id") @db.VarChar(50)
  userId    Int         @map("user_id")
  title     String?     @db.VarChar(100)
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  AiMessage[]

  @@map("ai_sessions")
}

model AiMessage {
  id        Int      @id @default(autoincrement())
  sessionId Int      @map("session_id")
  role      String   @db.VarChar(20)
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  session   AiSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("ai_messages")
}

model VerificationCode {
  id        Int      @id @default(autoincrement())
  email     String   @db.VarChar(100)
  code      String   @db.VarChar(10)
  username  String?  @db.VarChar(50)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("verification_codes")
}
```

---

## 五、核心代码模板

### 5.1 应用入口 (src/app.ts)

```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { config } from './config'
import routes from './routes'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

const app = express()

// 基础中间件
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 日志
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'))
}

// 静态文件
app.use('/uploads', express.static('uploads'))

// 路由
app.use(config.apiPrefix, routes)

// 错误处理
app.use(notFoundHandler)
app.use(errorHandler)

// 启动服务
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})

export default app
```

### 5.2 统一响应工具 (src/utils/response.ts)

```typescript
import { Response } from 'express'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export const success = <T>(res: Response, data: T, statusCode = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    data
  }
  return res.status(statusCode).json(response)
}

export const error = (
  res: Response,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500
) => {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message }
  }
  return res.status(statusCode).json(response)
}
```

### 5.3 认证中间件 (src/middlewares/auth.middleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { error } from '../utils/response'

export interface JwtPayload {
  userId: number
  uid: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return error(res, '未提供认证令牌', 'UNAUTHORIZED', 401)
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    req.user = decoded
    next()
  } catch (err) {
    return error(res, '无效或过期的令牌', 'INVALID_TOKEN', 401)
  }
}
```

---

## 六、执行顺序

按照以下顺序执行初始化：

1. **创建项目结构** - 创建所有目录
2. **初始化npm项目** - 执行npm init和依赖安装
3. **配置TypeScript** - 创建tsconfig.json
4. **配置Prisma** - 创建schema.prisma
5. **创建环境变量文件** - .env和.env.example
6. **创建核心配置文件** - config目录下的配置
7. **创建工具函数** - utils目录
8. **创建中间件** - middlewares目录
9. **创建服务和控制器** - 按模块顺序
10. **创建路由** - routes目录
11. **创建应用入口** - app.ts
12. **数据库迁移** - 执行prisma migrate
13. **测试运行** - npm run dev

---

## 七、注意事项

1. **环境变量安全** - 生产环境必须修改所有密钥
2. **数据库字符集** - MySQL使用utf8mb4编码
3. **CORS配置** - 生产环境需要配置具体的前端域名
4. **日志管理** - 生产环境日志需要轮转和归档
5. **文件上传** - 需要配置文件类型白名单和大小限制
6. **API限流** - 防止恶意请求，特别是登录和注册接口
7. **SQL注入防护** - Prisma已内置防护，但需注意原生查询
