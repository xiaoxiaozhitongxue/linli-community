# 邻里社区APP - 综合 Bug 修复与全面测试

## Why
当前系统存在多个功能性问题，导致核心用户体验受损：
1. 任务详情页空白
2. 待接单列表为空
3. 我的任务页面为空
4. API 函数未部署导致云端数据无法正常使用
5. 状态命名前后端不一致导致数据过滤失败

## What Changes
- 修复后端 API 状态映射问题（已在上次会话完成）
- 修复后端 API 返回结构问题（已在上次会话完成）
- 修复前端详情页状态映射和错误处理（已在上次会话完成）
- 修复前端列表页 API 失败时的空状态显示（已在上次会话完成）
- **新增**：检查其他页面（帖子、活动、消息）是否也存在类似问题

## Impact
- Affected specs: 所有数据相关功能
- Affected code: `functions/api/`, `src/pages/`, `src/utils/api.ts`, `src/utils/storage.ts`

## ADDED Requirements

### Requirement: 互助任务列表正确显示待接单任务
`GET /api/tasks` 的 `status` 查询参数必须将前端值映射到数据库值。

#### Scenario: 待接单筛选
- **WHEN** 前端调用 `tasksApi.getTasks({ status: 'open' })`
- **THEN** 后端查询 `WHERE status = 'pending'`（非字面量 'open'）

### Requirement: 我的任务页面正确显示用户任务
`GET /api/tasks/my` 必须返回 `published` 和 `accepted` 数组。

#### Scenario: 我的任务加载
- **WHEN** 用户进入"我的任务"页面
- **THEN** API 返回 `{ published: [...], accepted: [...] }` 而非只有 `{ items: [...] }`

### Requirement: 任务详情页在所有场景下都有明确 UI 反馈
- 加载中显示 spinner
- 无数据显示"未找到该任务"
- API 失败显示友好提示
- 正常显示任务详情

### Requirement: 帖子/活动/消息页面使用云端 API
所有业务数据页面不得依赖 localStorage 作为唯一数据源。

#### Scenario: 帖子列表加载
- **WHEN** 用户进入帖子列表页面
- **THEN** 数据从 `GET /api/posts` 云端获取

## MODIFIED Requirements

### Requirement: 状态命名统一
- 后端数据库/INSERT: `'pending'`, `'in_progress'`, `'completed'`, `'cancelled'`
- 前端 UI 展示: `'open'`, `'ongoing'`, `'completed'`, `'cancelled'`
- 所有互相调用的边界必须做状态映射

## REMOVED Requirements

### Requirement: localStorage 作为业务数据主存储
**Reason**: 已迁移到云端 D1 数据库，不同设备需要同步
**Migration**: `src/utils/storage.ts` 已精简为仅存储登录态

## 已知问题清单

### 🔴 P0 - 阻断性问题
1. [已修复] 待接单列表为空 — `tasks/index.js` 未映射状态值
2. [已修复] 我的任务为空 — `tasks/my.js` 返回结构缺少 `published`/`accepted`
3. [已修复] 详情页空白 — `detail.vue` 状态映射不完整

### 🟡 P1 - 功能性问题
4. [待检查] 帖子列表是否使用云端 API
5. [待检查] 活动列表是否使用云端 API
6. [待检查] 消息页面是否有相同问题

### 🟢 P2 - 体验优化
7. [待优化] API 错误时显示友好提示而非空白
8. [待优化] 加载状态显示友好的 loading UI
