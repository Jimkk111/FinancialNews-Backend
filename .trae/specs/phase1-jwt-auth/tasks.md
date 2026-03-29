# JWT认证中间件实现 - 任务清单

## 任务列表

- [ ] 配置JWT参数（jwt.ts）
- [ ] 创建Token工具函数（token.ts）
- [ ] 创建密码加密工具（password.ts）
- [ ] 实现认证中间件（auth.middleware.ts）
- [ ] 扩展Express类型（express.d.ts）
- [ ] 创建认证服务（auth.service.ts）

## 依赖关系

```
JWT配置 → Token工具 → 认证中间件
                ↘
密码工具 → 认证服务 ↗
                
Express类型扩展（独立）
```

## 预计文件数

6个文件
