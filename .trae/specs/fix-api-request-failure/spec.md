# 修复前后端API请求失败问题 - 使用云端D1数据库

## 问题概述

多个需要加载数据的页面显示"请求失败"错误，原因是前端 API 调用与实际后端实现之间的数据流存在问题。

### 根本原因

1. **D1 数据库可能未初始化**：
   - `wrangler.toml` 中配置了 D1 binding，但数据库可能尚未执行 schema 初始化
   - `database_id: "420190fe-57fa-475d-9948-af57eeaedb26"` 可能没有创建表结构

2. **API 路由可能存在问题**：
   - Cloudflare Pages Functions 路由需要正确的 `_middleware.js` 配置
   - 某些 API 路径可能没有正确处理 CORS

3. **现有架构**：
   - 前端 `postsApi` 和 `tasksApi` 使用真实 HTTP 请求
   - 后端 `activitiesApi` 使用 localStorage mock 数据（不一致）

### 影响范围

- `src/pages/index/index.vue` - 首页动态和活动加载
- `src/pages/ai-helper/` - 互助任务页面
- `src/pages/activities/` - 活动中心页面
- `src/utils/api.ts` - API 调用层

## 解决方案

### 步骤 1: 诊断 D1 数据库状态

检查 D1 数据库是否已正确创建和初始化：
- 确认 `wrangler.toml` 中的 `database_id` 对应的 D1 实例是否存在
- 确认 schema.sql 是否已执行

### 步骤 2: 初始化 D1 数据库（如需要）

如果数据库不存在或未初始化，执行以下命令：
```bash
# 创建 D1 数据库（如果不存在）
wrangler d1 create linli-community-db

# 初始化 schema
wrangler d1 execute linli-community-db --file=./database/schema.sql
```

### 步骤 3: 验证 API 路由

确认 Cloudflare Pages Functions 路由配置正确：
- `functions/api/` 下的文件自动路由到 `/api/*`
- CORS headers 在 `_middleware.js` 中正确设置

### 步骤 4: 统一 API 层

将 `activitiesApi` 从 localStorage mock 改为使用真实 API 调用（可选，如果 D1 正常工作则不需要）

## 验收标准

| 验证点 | 预期结果 |
|--------|----------|
| D1 数据库存在且已初始化 | `wrangler d1 info linli-community-db` 返回数据库信息 |
| API 请求返回正确数据 | `/api/posts` 返回 `{ success: true, data: {...} }` |
| 首页动态列表 | 显示从 D1 获取的帖子数据，不显示"请求失败" |
| 互助任务列表 | 显示从 D1 获取的任务数据 |
| 活动列表 | 显示从 D1 获取的活动数据 |
| 发布帖子/任务 | 数据正确保存到 D1 |
| npm run build | 编译通过 |

## 技术细节

### D1 配置 (wrangler.toml)
```toml
[[d1_databases]]
binding = "DB"
database_name = "linli-community-db"
database_id = "420190fe-57fa-475d-9948-af57eeaedb26"
```

### API 响应格式
```typescript
interface ResponseData<T = any> {
  success: boolean
  message: string
  data: T
  timestamp?: number
  error?: {
    code: number
    message: string
    details?: any
  }
}
```

### 可能的问题及解决方案

1. **"数据库绑定未配置"错误**
   - 原因：`context.env.DB` 未定义
   - 解决：检查 `wrangler.toml` 的 D1 配置是否正确

2. **"数据库查询失败"错误**
   - 原因：数据库表不存在
   - 解决：执行 `wrangler d1 execute` 初始化 schema

3. **CORS 错误**
   - 原因：OPTIONS 请求未正确处理
   - 解决：确保每个 API 路由有正确的 `_middleware.js`

4. **401 未授权错误**
   - 原因：请求未带 token 或 token 无效
   - 解决：登录后获取 token，并在请求时带上 `Authorization: Bearer <token>`
