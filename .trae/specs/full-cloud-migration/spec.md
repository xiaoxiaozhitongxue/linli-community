# 全云端数据迁移 - 产品需求文档

## 问题陈述

经过全面代码审查，发现当前应用仍然存在以下非云端的数据存储方式，导致用户在不同设备登录时无法看到自己的数据，也无法看到其他用户的内容：

1. **健康打卡记录** (`src/pages/health/index.vue`, `src/pages/index/index.vue`) 使用 `localStorage` 直接读写 `linli_health_records` 键，未接入云端数据库
2. **取消任务接口** (`tasksApi.cancelTask`) 调用的 `POST /api/tasks/${id}/cancel` 后端文件缺失（cancel.js 不存在）
3. **在线用户列表** (`userApi.getOnlineUsers` in `src/utils/api.ts`) 返回硬编码的模拟用户（"热心邻居张阿姨"、"社区达人李先生"），未从云端查询
4. **`storage.ts` 包含大量 dead code** - `loadBusiness/saveBusiness/getAccount1Business/getAccount2Business` 等与云端 API 重复的本地存储逻辑，架构混乱

## 项目目标（已完成 vs 待完成）

| 模块 | 状态 | 说明 |
|-----|------|-----|
| 用户认证 | ✅ | 登录/注册已云端化 |
| 用户档案 | ✅ | profile/profile.update 已云端化 |
| 帖子/动态 | ✅ | CRUD + 点赞 + 评论已云端化 |
| 互助任务 | ⚠️ | CRUD + 接单/完成已云端化，但 **取消接口缺失** |
| 活动 | ✅ | CRUD + 报名/退出已云端化 |
| 我的任务 | ✅ | 我的发布/接单已云端化 |
| 我的帖子 | ✅ | 用户帖子列表已云端化 |
| 我的活动 | ✅ | 用户活动列表已云端化 |
| 我的收藏 | ✅ | 收藏功能已云端化 |
| **健康打卡** | ❌ | **仍使用 localStorage** |
| **在线用户** | ❌ | **返回硬编码模拟用户** |
| 代码结构 | ⚠️ | `storage.ts` 残留 dead code 需清理 |

## 用户故事

**US-1 (健康打卡云端化)**: 作为用户，我希望在任何设备登录后都能看到我的健康打卡历史，这样我可以追踪我的健康习惯。

**US-2 (任务取消功能)**: 作为用户，我希望可以取消我发布的任务，这样当情况变化时我可以及时管理我的需求。

**US-3 (真实在线用户)**: 作为用户，我希望看到社区里真正活跃的邻居，而不是模拟用户，这样我可以知道社区的实际活跃度。

**US-4 (代码结构清晰)**: 作为开发者，我希望所有业务数据都清楚地走云端 API 路径，没有 localStorage 的 fallback 逻辑干扰判断。

## 功能需求

### FR-1: 健康打卡记录云端化

**后端**：
- 在 `database/schema.sql` 中添加 `health_records` 表定义
- 创建 `functions/api/health/records/index.js`
  - `GET /api/health/records` - 获取当前用户的所有健康打卡记录（分页）
  - `POST /api/health/records` - 添加一条打卡记录（按 user_id + date 去重）
- 需要 JWT 认证（只有登录用户可以查看/添加自己的记录）

**前端**：
- `src/pages/health/index.vue`：将 `localStorage.getItem('linli_health_records')` 改为调用云端 API
- `src/pages/index/index.vue`：将 `loadHealthRecords()` 改为调用云端 API
- `src/utils/api.ts`：添加 `healthApi.getRecords()` 和 `healthApi.addRecord()`

### FR-2: 任务取消 API

**后端**：
- 创建 `functions/api/tasks/[id]/cancel.js`
  - `POST /api/tasks/[id]/cancel`
  - 认证：必须是任务发布者
  - 逻辑：只有 `pending` 或 `in_progress` 状态的任务可以取消
  - 更新任务状态为 `cancelled`

**前端**：
- 确认 `tasksApi.cancelTask` 调用路径正确（`POST /api/tasks/${id}/cancel`）

### FR-3: 在线用户云端查询

**后端**：
- 创建 `functions/api/users/online.js` 或更新现有 `functions/api/users/index.js`
  - `GET /api/users/online`
  - 查询最近活跃的用户（例如过去 15 分钟内 `last_active_at` 大于阈值）
  - 返回用户简要信息列表（id, nickname, avatar, community, credit_score, last_active_at）
  - 不需要认证（公开信息），但排除当前用户自己或标记区分

**前端**：
- 在 `src/utils/api.ts` 的 `userApi.getOnlineUsers()` 中改为调用 `GET /api/users/online`
- 移除硬编码的 "热心邻居张阿姨"、"社区达人李先生" 等模拟数据

### FR-4: 清理 storage.ts 和 api.ts dead code

**`src/utils/storage.ts`**：
- 保留（JWT/登录态相关）：
  - `safeGet`, `safeSet`, `safeRemove` - 通用 localStorage 工具
  - `USER_INFO_KEY`, `TOKEN_KEY` - 登录凭证键
  - `getCurrentUser`, `getCurrentPhone`, `isLoggedIn` - 当前用户查询
  - `onLoginSuccess`, `onLogout` - 登录/登出状态管理
  - `getUserStorageKey` - 工具函数
  - `isOwner` - 前端权限判断（辅助用）
  - `requireLogin` - 前端强制登录提示（仅在 API 调用失败后作为友好提示）
- 删除（业务数据，已迁移到云端）：
  - `loadBusiness`, `saveBusiness`, `updateBusiness`
  - `getDefaultBusiness`, `getAccount1Business`, `getAccount2Business`
  - `loadHealthRecords`, `saveHealthRecords`
  - `loadGeneric`, `saveGeneric`
  - 所有硬编码的演示数据

**`src/utils/api.ts`**：
- 清理未使用的 imports
- 更新 file header 注释：明确说明所有业务数据走云端 API

## 数据库 Schema 变更

新增 `health_records` 表到 `database/schema.sql`：

```sql
-- 健康打卡记录表 (health_records)
CREATE TABLE IF NOT EXISTS health_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,              -- YYYY-MM-DD 格式，用于按天去重
  health_status TEXT NOT NULL DEFAULT 'good' CHECK(health_status IN ('good', 'normal', 'poor')),
  temperature REAL,
  notes TEXT,
  timestamp INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_health_records_user_date ON health_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_created_at ON health_records(created_at DESC);
```

## 非功能需求

- **性能**: 所有 API 响应时间应在 1 秒以内
- **安全性**: 所有写操作必须验证 JWT token 和数据所有权
- **数据一致性**: 同一用户在不同设备上看到相同的数据
- **代码清晰性**: 业务数据路径唯一指向云端 API，storage.ts 仅用于 JWT token 和用户基本信息缓存

## 技术约束

- **后端**: Cloudflare Pages Functions（基于 Service Worker API）
- **数据库**: Cloudflare D1 (SQLite)
- **前端**: Vue 3 + TypeScript + Vite
- **认证**: JWT token 存储在 localStorage
- **前端请求层**: `src/utils/request.ts` 中的 `get/post/put/del` 函数
- **后端工具层**: `functions/lib/db.js`, `functions/lib/response.js`, `functions/lib/auth.js`, `functions/lib/utils.js`

## 前端 API 调用规范（确保）

在 `src/utils/api.ts` 中：
- 所有业务数据操作**必须**通过 `get/post/put/del` 函数调用 `/api/*` 端点
- 不能直接读写 `localStorage` 中的业务数据键（如 `linli_business_data_*`, `linli_health_records`）
- `storage.ts` 仅用于：JWT token 存储、当前用户信息缓存
