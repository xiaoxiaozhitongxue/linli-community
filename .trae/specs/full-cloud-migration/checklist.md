# 验证清单 - 全云端数据迁移

## 数据库验证
- [ ] `health_records` 表在 D1 数据库中存在
- [ ] `health_records` 表包含字段: `id, user_id, date, health_status, temperature, notes, timestamp, created_at`
- [ ] `(user_id, date)` 组合有唯一索引，防止重复打卡

## 后端 API 验证
- [ ] `GET /api/health/records` 返回当前用户的健康打卡记录列表
- [ ] `POST /api/health/records` 成功创建新记录，同一天不重复
- [ ] `POST /api/tasks/[id]/cancel` 能取消任务（只有发布者，且状态是 pending/in_progress）
- [ ] `GET /api/users` 或 `GET /api/users/online` 返回最近活跃用户列表
- [ ] 所有新 API 在未登录时返回 401 或合理的错误
- [ ] 所有新 API 在 JWT 无效时返回 401
- [ ] 所有 API 的 CORS 响应头正确（OPTIONS 请求返回 204）

## 前端代码验证
- [ ] `healthApi` 在 `src/utils/api.ts` 中定义并正确调用云端 API
- [ ] `src/pages/health/index.vue` 使用 `healthApi` 而不是直接访问 localStorage
- [ ] `src/pages/index/index.vue` 使用云端 API 而不是 `loadHealthRecords()`
- [ ] `userApi.getOnlineUsers()` 调用云端 API 而不是返回硬编码模拟用户
- [ ] `src/utils/storage.ts` 中已删除 `loadBusiness/saveBusiness/loadHealthRecords/saveHealthRecords` 等 dead code
- [ ] `src/utils/api.ts` 顶部注释更新为反映全云端化的状态
- [ ] 所有 `import` 语句正确，没有指向不存在的函数/文件
- [ ] `npm run build` 能成功编译，没有 TypeScript 错误

## 功能测试
- [ ] 用户 A 登录后可以查看首页和任务列表
- [ ] 用户 A 可以发布任务，任务出现在 `/api/tasks` 返回结果中
- [ ] 用户 B 登录后能看到用户 A 发布的任务
- [ ] 用户 A 可以取消自己发布的任务
- [ ] 用户不能取消别人发布的任务（返回 403）
- [ ] 用户 A 可以打卡健康记录
- [ ] 用户 A 在另一设备登录后能看到之前的打卡记录
- [ ] 用户不能重复打卡同一天
- [ ] 在线用户列表显示数据库中真实的最近活跃用户
- [ ] 所有现有的 CRUD 操作未被破坏（任务、帖子、活动）

## 代码质量验证
- [ ] `storage.ts` 中只有登录态和工具函数，没有业务数据存储
- [ ] `api.ts` 中所有业务操作都通过 `get/post/put/del` 调用云端 API
- [ ] 前端代码中没有直接访问 `localStorage` 键 `linli_business_data_*` 或 `linli_health_records`
- [ ] 代码风格与现有代码保持一致（使用已有的工具函数）
- [ ] 错误处理完善（API 失败时有用户友好的提示）

## 部署验证
- [ ] `npm run build` 成功
- [ ] `npm run deploy` 成功部署到 Cloudflare Pages
- [ ] Cloudflare Pages 函数日志中没有错误
- [ ] `database/schema.sql` 已更新，可在新环境中重建数据库
