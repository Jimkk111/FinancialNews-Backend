# 收藏和历史API - 任务清单

## 任务状态说明
- [ ] 待完成
- [x] 已完成
- [~] 进行中

---

## 任务列表

### 1. 验证器实现

- [ ] **1.1 实现收藏验证器** `src/validators/favorite.validator.ts`
  - [ ] 定义 favoriteListQuerySchema（分页参数验证）
  - [ ] 定义 addFavoriteSchema（添加收藏请求体验证）
  - [ ] 定义 newsIdParamsSchema（新闻ID参数验证）
  - [ ] 导出类型推断

- [ ] **1.2 实现历史验证器** `src/validators/history.validator.ts`
  - [ ] 定义 historyListQuerySchema（分页参数验证）
  - [ ] 定义 addHistorySchema（添加历史请求体验证）
  - [ ] 导出类型推断

### 2. 服务层实现

- [ ] **2.1 实现收藏服务** `src/services/favorite.service.ts`
  - [ ] getFavoriteList - 获取收藏列表
  - [ ] addFavorite - 添加收藏
  - [ ] removeFavorite - 取消收藏
  - [ ] checkFavorite - 检查收藏状态

- [ ] **2.2 实现历史服务** `src/services/history.service.ts`
  - [ ] getHistoryList - 获取浏览历史
  - [ ] addHistory - 添加浏览记录
  - [ ] clearHistory - 清空历史

### 3. 控制器实现

- [ ] **3.1 实现收藏控制器** `src/controllers/favorite.controller.ts`
  - [ ] getFavoriteList - 处理获取收藏列表请求
  - [ ] addFavorite - 处理添加收藏请求
  - [ ] removeFavorite - 处理取消收藏请求
  - [ ] checkFavorite - 处理检查收藏状态请求

- [ ] **3.2 实现历史控制器** `src/controllers/history.controller.ts`
  - [ ] getHistoryList - 处理获取浏览历史请求
  - [ ] addHistory - 处理添加浏览记录请求
  - [ ] clearHistory - 处理清空历史请求

### 4. 路由更新

- [ ] **4.1 更新收藏路由** `src/routes/favorites.routes.ts`
  - [ ] 添加认证中间件
  - [ ] 配置 GET / 路由（获取收藏列表）
  - [ ] 配置 POST / 路由（添加收藏）
  - [ ] 配置 DELETE /:newsId 路由（取消收藏）
  - [ ] 配置 GET /check/:newsId 路由（检查收藏状态）

- [ ] **4.2 更新历史路由** `src/routes/history.routes.ts`
  - [ ] 添加认证中间件
  - [ ] 配置 GET / 路由（获取浏览历史）
  - [ ] 配置 POST / 路由（添加浏览记录）
  - [ ] 配置 DELETE / 路由（清空历史）

### 5. 测试验证

- [ ] **5.1 功能测试**
  - [ ] 启动服务验证各端点可访问
  - [ ] 测试未登录访问返回401
  - [ ] 测试分页参数是否生效
  - [ ] 测试添加收藏功能
  - [ ] 测试重复添加收藏的处理
  - [ ] 测试取消收藏功能
  - [ ] 测试检查收藏状态功能
  - [ ] 测试添加浏览记录功能
  - [ ] 测试重复浏览记录的处理
  - [ ] 测试清空历史功能
  - [ ] 测试错误响应格式

---

## 执行顺序

建议按以下顺序执行：

1. **验证器** → 先完成参数验证逻辑
2. **服务层** → 实现核心业务逻辑
3. **控制器** → 连接路由和服务
4. **路由** → 配置API端点
5. **测试** → 验证功能正确性

---

## 文件创建/修改清单

| 文件路径 | 操作 | 说明 |
|---------|------|------|
| src/validators/favorite.validator.ts | 创建 | 收藏验证器 |
| src/validators/history.validator.ts | 创建 | 历史验证器 |
| src/services/favorite.service.ts | 创建 | 收藏服务 |
| src/services/history.service.ts | 创建 | 历史服务 |
| src/controllers/favorite.controller.ts | 创建 | 收藏控制器 |
| src/controllers/history.controller.ts | 创建 | 历史控制器 |
| src/routes/favorites.routes.ts | 修改 | 更新收藏路由 |
| src/routes/history.routes.ts | 修改 | 更新历史路由 |
