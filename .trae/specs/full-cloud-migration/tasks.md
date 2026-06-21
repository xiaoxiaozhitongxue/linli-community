# 任务清单 - 全云端数据迁移

## Task 1: 添加 health_records 数据库表
- **文件**: `database/schema.sql`
- **操作**: 添加 `health_records` 表及其索引
- **参考**: 现有表的写法（users, posts, tasks, activities, likes）

## Task 2: 创建健康打卡 API 端点
- **新文件**: `functions/api/health/records/index.js`
- **功能**:
  - `GET /api/health/records` - 获取当前用户的所有打卡记录（支持分页，默认按日期倒序）
  - `POST /api/health/records` - 添加一条打卡记录，参数：`{ date: 'YYYY-MM-DD', health_status?: 'good'|'normal'|'poor', temperature?: number, notes?: string }`
- **认证**: 需要 JWT（使用 `requireAuth` 函数）
- **去重**: 同一用户同一日期只能有一条记录（使用 `INSERT OR IGNORE` 或先查询再判断）
- **工具**: 使用 `getDb(context)`, `createResponse`, `createErrorResponse`, `generateId`, `now`, `requireAuth`

## Task 3: 创建任务取消 API 端点
- **新文件**: `functions/api/tasks/[id]/cancel.js`
- **功能**:
  - `POST /api/tasks/[id]/cancel`
  - 需要认证
  - 验证发布者身份
  - 只有 `pending` 或 `in_progress` 状态的任务可以取消
  - 更新任务状态为 `cancelled`
- **参考**: `functions/api/tasks/[id]/accept.js` 和 `functions/api/tasks/[id]/complete.js` 的代码结构

## Task 4: 创建/更新在线用户查询 API
- **新文件或修改**: `functions/api/users/index.js` 或 `functions/api/users/online.js`
- **功能**:
  - `GET /api/users` 或 `GET /api/users/online`
  - 返回最近活跃用户（例如 `last_active_at > (now - 15 minutes)`）
  - 排除敏感信息（不返回 phone, password 等）
  - 返回字段: `id, nickname, avatar, community, role, credit_score, is_verified, last_active_at`
  - 支持 `?limit=N` 参数，最多返回 20 个
- **认证**: 不需要 JWT（公开信息）

## Task 5: 前端 healthApi
- **文件**: `src/utils/api.ts`
- **操作**: 添加 `healthApi` 对象：
  - `getRecords()` - 调用 `GET /api/health/records`
  - `addRecord(data)` - 调用 `POST /api/health/records`

## Task 6: 修复 userApi.getOnlineUsers
- **文件**: `src/utils/api.ts`
- **操作**: 将 `userApi.getOnlineUsers` 从硬编码模拟数据改为调用云端 API
- **注意**: 如果用户未登录，也应该能看到在线用户列表

## Task 7: 更新健康打卡页面
- **文件**: `src/pages/health/index.vue`
- **操作**:
  - 移除 `localStorage.getItem('linli_health_records')` 和 `localStorage.setItem('linli_health_records', ...)`
  - 使用 `healthApi.getRecords()` 加载记录
  - 使用 `healthApi.addRecord()` 添加打卡记录
  - 未登录时提示用户登录
  - 保留现有的 UI（连续天数、打卡按钮样式等）

## Task 8: 更新首页健康记录引用
- **文件**: `src/pages/index/index.vue`
- **操作**: 移除 `loadHealthRecords()` 调用，改为使用 `healthApi.getRecords()`
- **注意**: 需要检查 `index.vue` 中具体在哪里使用了健康记录数据

## Task 9: 清理 storage.ts
- **文件**: `src/utils/storage.ts`
- **保留**: 
  - `safeGet, safeSet, safeRemove` - 通用工具
  - `USER_INFO_KEY, TOKEN_KEY` - 登录凭证
  - `getCurrentUser, getCurrentPhone, isLoggedIn` - 当前用户查询
  - `onLoginSuccess(user, token), onLogout` - 登录/登出
  - `getUserStorageKey` - 工具函数
  - `isOwner` - 前端权限判断（如需要）
- **删除**:
  - `loadBusiness, saveBusiness, updateBusiness`
  - `getDefaultBusiness, getAccount1Business, getAccount2Business`
  - `loadHealthRecords, saveHealthRecords`
  - `loadGeneric, saveGeneric`
  - `HEALTH_KEY` 常量
  - 所有硬编码的演示用户数据

## Task 10: 清理 api.ts imports
- **文件**: `src/utils/api.ts`
- **操作**: 移除对已删除函数的 imports，更新文件头部注释
- **注意**: `getCurrentUser, onLoginSuccess, onLogout` 可能还被 authApi 使用，需要检查

## Task 11: 部署
- **操作**: `npm run build` 然后 `npm run deploy`
- **验证**: 确保 Cloudflare Pages 部署成功

## Task 12: 数据库 schema 应用
- **操作**: 在 Cloudflare D1 上执行新的 `health_records` 表创建语句
- **验证**: 确保表创建成功，可以读写数据

## Task 13: 全面测试
- 测试登录/注册（已有功能，确保未破坏）
- 测试健康打卡（新增功能，确保可用）
- 测试任务取消（新增功能，确保可用）
- 测试在线用户列表（新增功能，确保可用）
- 测试任务发布/接单/完成（已有功能，确保未破坏）
- 测试帖子/活动的 CRUD（已有功能，确保未破坏）
- 在多设备/多账号之间验证数据同步
