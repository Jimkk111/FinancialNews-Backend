# 用户认证API实现 - 任务清单

## 任务列表

- [ ] 实现ID生成器工具（idGenerator.ts）
- [ ] 实现邮件服务（email.service.ts）
- [ ] 实现用户服务（user.service.ts）
- [ ] 扩展认证服务（auth.service.ts）
- [ ] 实现认证验证器（auth.validator.ts）
- [ ] 实现认证控制器（auth.controller.ts）
- [ ] 更新认证路由（auth.routes.ts）
- [ ] 添加verification_codes模型到schema.prisma
- [ ] 运行数据库迁移
- [ ] 测试验证各端点功能

## 依赖关系

```
ID生成器 → 用户服务 → 认证服务 → 认证控制器 → 认证路由
    ↓          ↓          ↑
邮件服务 ─────────→ 认证服务
                        ↑
验证器 ──────────────────┘

schema.prisma更新 → 数据库迁移 → 认证服务
```

## 预计文件数

- 新建：0个文件（全部为现有空文件填充）
- 修改：8个文件
- 数据库迁移：1个

## 文件清单

| 文件 | 状态 | 说明 |
|------|------|------|
| src/utils/idGenerator.ts | 空文件待实现 | ID生成工具 |
| src/services/email.service.ts | 空文件待实现 | 邮件发送服务 |
| src/services/user.service.ts | 空文件待实现 | 用户CRUD服务 |
| src/services/auth.service.ts | 部分实现 | 扩展注册、验证码功能 |
| src/validators/auth.validator.ts | 空文件待实现 | 请求参数验证 |
| src/controllers/auth.controller.ts | 空文件待实现 | 控制器逻辑 |
| src/routes/auth.routes.ts | 占位符待实现 | 路由配置 |
| prisma/schema.prisma | 需添加模型 | 添加VerificationCode模型 |

## 风险点

1. **邮件服务配置**：需要用户提供SMTP配置信息
2. **验证码存储**：需要先添加数据库模型并迁移
3. **并发问题**：验证码验证后删除需要考虑并发场景
