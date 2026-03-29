# 数据库连接与ORM配置 - 详细执行计划

## 任务概述

配置Prisma ORM，建立MySQL数据库连接，创建数据库模型，实现数据访问层基础架构。

## 前置条件

- MySQL 8.0已安装并运行
- Node.js 18+已安装

## 执行步骤

### 步骤1：创建数据库初始化SQL文件

**文件**: `prisma/init-database.sql`

根据 `plan.md` 中定义的表结构，编写完整的数据库初始化SQL脚本，包含：
- 创建数据库 `cls_financial_news_database`
- 创建所有表结构（users, categories, tags, news, news_tags, drafts, favorites, history, ai_sessions, ai_messages, verification_codes）
- 配置主键、外键约束
- 添加必要索引

**数据库名称**: `cls_financial_news_database`

**表清单**:
| 表名 | 说明 |
|-----|------|
| users | 用户表 |
| categories | 分类表 |
| tags | 标签表 |
| news | 新闻表 |
| news_tags | 新闻标签关联表 |
| drafts | 草稿表 |
| favorites | 收藏表 |
| history | 浏览历史表 |
| ai_sessions | AI会话表 |
| ai_messages | AI消息表 |
| verification_codes | 验证码表 |

### 步骤2：配置Prisma Schema

**文件**: `prisma/schema.prisma`

定义以下数据模型：
- User（用户表）
- Category（分类表）
- Tag（标签表）
- News（新闻表）
- NewsTag（新闻标签关联表）
- Draft（草稿表）
- Favorite（收藏表）
- History（浏览历史表）
- AiSession（AI会话表）
- AiMessage（AI消息表）
- VerificationCode（验证码表）

**规范要求**：
- 所有表使用snake_case命名
- 时间字段使用DateTime类型
- 外键配置级联删除（onDelete: Cascade）
- 为唯一字段添加@@unique约束

### 步骤3：创建数据库配置模块

**文件**: `src/config/database.ts`

功能：
- 导出PrismaClient实例
- 配置连接池参数
- 配置日志级别（开发环境显示查询日志）

**文件**: `src/config/index.ts`

功能：
- 汇总所有配置模块
- 导出统一配置对象

### 步骤4：创建环境变量配置

**文件**: `.env`

配置项：
```
DATABASE_URL="mysql://用户名:密码@localhost:3306/cls_financial_news_database"
```

**文件**: `.env.example`

提供环境变量模板，不包含实际密码。

### 步骤5：执行数据库迁移

命令序列：
```bash
npx prisma generate    # 生成Prisma客户端
npx prisma migrate dev --name init  # 创建初始迁移
```

### 步骤6：创建种子数据脚本

**文件**: `prisma/seed.ts`

创建初始数据：
- 默认分类（股票、基金、债券、期货、外汇、财经要闻等）
- 测试用户账号（可选）

## 验证标准

1. 数据库初始化SQL脚本可正确执行
2. Prisma Client成功生成
3. 数据库迁移无错误
4. 所有表结构正确创建
5. 外键约束正确配置
6. 种子数据成功插入

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| prisma/init-database.sql | 数据库初始化SQL脚本 |
| prisma/schema.prisma | 数据库模型定义 |
| prisma/seed.ts | 种子数据脚本 |
| src/config/database.ts | 数据库配置 |
| src/config/index.ts | 配置入口 |
| .env | 环境变量 |
| .env.example | 环境变量模板 |

## 注意事项

- 生产环境必须使用环境变量管理数据库凭据
- 迁移文件必须纳入版本控制
- 开发环境使用migrate dev，生产环境使用migrate deploy
- init-database.sql用于快速初始化数据库，执行前请确保MySQL服务已启动
