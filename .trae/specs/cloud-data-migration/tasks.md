# 云端数据存储迁移 - 实现任务

## [ ] Task 1: 创建 D1 数据库并初始化
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 Cloudflare D1 数据库
  - 执行 schema.sql 初始化表结构
  - 更新 wrangler.toml 中的 database_id
- **Files**: `wrangler.toml`, `database/schema.sql`

## [ ] Task 2: 实现用户注册 API
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 POST /api/auth/register
  - 手机号 + 密码 + 昵称 + 社区
  - 密码加密存储
- **Files**: `functions/api/auth/register.js`

## [ ] Task 3: 实现密码登录 API
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改 POST /api/auth/login
  - 手机号 + 密码登录
  - 密码验证
  - 生成 JWT token
- **Files**: `functions/api/auth/login.js`

## [ ] Task 4: 实现任务 CRUD API
- **Priority**: P0
- **Depends On**: Task 2-3
- **Description**: 
  - 创建任务 API
  - 获取任务列表 API
  - 获取任务详情 API
  - 更新任务状态 API
  - 删除任务 API
- **Files**: `functions/api/tasks/*.js`

## [ ] Task 5: 实现帖子 CRUD API
- **Priority**: P0
- **Depends On**: Task 2-3
- **Description**: 
  - 创建帖子 API
  - 获取帖子列表 API
  - 帖子点赞/评论 API
- **Files**: `functions/api/posts/*.js`

## [ ] Task 6: 实现活动 CRUD API
- **Priority**: P0
- **Depends On**: Task 2-3
- **Description**: 
  - 创建活动 API
  - 获取活动列表 API
  - 活动报名 API
- **Files**: `functions/api/activities/*.js`

## [ ] Task 7: 修改前端登录注册页面
- **Priority**: P0
- **Depends On**: Task 2-3
- **Description**: 
  - 修改登录页面为密码登录
  - 修改注册页面支持密码注册
  - 添加表单验证
- **Files**: `src/pages/login/index.vue`, `src/pages/register/index.vue`

## [ ] Task 8: 修改前端 API 调用
- **Priority**: P0
- **Depends On**: Task 4-6
- **Description**: 
  - 修改 api.ts 使用真实 API
  - 添加 token 认证
  - 移除 localStorage 存储逻辑
- **Files**: `src/utils/api.ts`, `src/utils/request.ts`

## [ ] Task 9: 测试验证
- **Priority**: P0
- **Depends On**: Task 1-8
- **Description**: 
  - 测试用户注册/登录
  - 测试任务创建和获取
  - 测试跨设备数据同步
- **Files**: 所有相关文件

## [ ] Task 10: Git 推送
- **Priority**: P0
- **Depends On**: Task 9
- **Description**: 
  - 执行 git add
  - 执行 git commit
  - 执行 git push
- **Files**: 所有修改的文件