# 任务详情页空白与待接单列表修复 - 产品需求文档

## 概述
- **摘要**：修复点击"待接单"任务后跳转到详情页显示空白的问题，同时确保任务列表和详情页能正确从云端 API 获取并展示数据。
- **目的**：确保用户发布的互助任务能在任务广场显示，点击后能看到完整的任务详情页。
- **目标用户**：所有使用邻里社区 APP 的用户

## 问题根因分析

### 根因 1：`tasks/my.js` 返回结构与前端期望不匹配（已在上次会话修复）
- **后端**返回：`{ items: [...], stats, pagination }`
- **前端期望**：`{ published: [...], accepted: [...], ... }`
- **影响**："我的任务"页面始终显示 0 个任务

### 根因 2：`tasks/index.js` 未处理前端状态值
- 前端传 `status: 'open'`，后端数据库是 `status: 'pending'`
- 后端按字面量 `'open'` 查询，数据库无匹配，返回空列表
- **影响**："待接单"列表为空

### 根因 3：`detail.vue` 中 `mapApiTaskToLocal` 存在未处理状态值
- 当 API 返回 `status: 'in_progress'` 时，`mapApiTaskToLocal` 直接透传
- 但详情页的"接单"按钮条件：`task.status !== 'open' && task.status !== 'pending'`
- `in_progress` 状态下按钮会被禁用（符合预期）
- 但 `mapApiTaskToLocal` 没有将 `in_progress` 映射为 `ongoing`（与列表页不一致）

### 根因 4：`detail.vue` 缺少 `mapApiTaskToLocal` 中的字段映射
- API 返回 `location`、`creator.community` 等字段
- `mapApiTaskToLocal` 只映射了部分字段，`creator.community` 等被忽略
- 但这不会导致空白页，只是部分信息丢失

### 根因 5：`detail.vue` 依赖 `fetchTask` 错误处理完整性
- 如果 API 返回非标准响应结构（缺少 `creator` 等字段），`mapApiTaskToLocal` 仍能 fallback
- 但若 API 端点 404/500，`fetchTask` 的 localStorage fallback 会找到旧数据或显示默认提示

## 功能需求

### FR-1：任务列表正确显示待接单任务
- `GET /api/tasks` 的 `status` 查询参数能正确将前端值映射到数据库值
- `'open'` → `'pending'`
- `'ongoing'` → `'in_progress'`
- 已实现（上次会话）

### FR-2：任务详情页正确加载并显示任务
- `GET /api/tasks/:id` 能正确返回任务详情
- `mapApiTaskToLocal` 正确处理所有状态值
- 页面在所有场景下（非登录/加载中/空数据/正常数据）都有明确 UI 反馈

### FR-3：任务创建后立即可见
- 发布任务 → 任务状态为 `pending` → 任务广场"待接单"列表应显示该任务
- 不依赖 localStorage fallback

## 修改范围

### 受影响文件
- `functions/api/tasks/index.js` — 已在上次会话修复状态映射
- `functions/api/tasks/my.js` — 已在上次会话修复返回结构
- `src/pages/ai-helper/detail.vue` — 修复 `mapApiTaskToLocal` 状态映射，增加防御性检查
- `src/pages/ai-helper/index.vue` — 确保任务列表在 API 失败时有明确空状态

### 不修改（确认正确）
- `functions/api/tasks/[id].js` — API 端点逻辑正确
- `src/utils/request.ts` — 请求处理逻辑正确
- `src/utils/api.ts` — API 调用封装正确

## 验收标准

### AC-1：待接单列表显示云端任务
- **Given**：数据库中有一个 `status = 'pending'` 的任务
- **When**：用户打开互助首页，默认筛选"待接单"
- **Then**：任务列表中显示该任务（而非空白或"暂无任务"）
- **Verification**：`human-judgment`

### AC-2：任务详情页正确渲染
- **Given**：数据库中有一个 `status = 'pending'` 的任务，ID 为 `xxx`
- **When**：用户点击该任务卡片，导航到 `/pages/ai-helper/detail?id=xxx`
- **Then**：详情页显示任务标题、描述、悬赏、地点、发布者信息，不显示空白页
- **Verification**：`human-judgment`

### AC-3：详情页按钮状态正确
- **Given**：详情页加载了一个 `pending` 状态的任务
- **When**：页面渲染完成
- **Then**："接下这个任务"按钮可点击（不显示禁用状态）
- **Verification**：`human-judgment`

### AC-4：API 失败时页面不崩溃
- **Given**：API 请求失败（网络断开或服务端错误）
- **When**：用户进入详情页
- **Then**：页面显示"该任务可能已下架或不存在"的提示，不显示 JavaScript 错误或空白页
- **Verification**：`programmatic` — 审查 `fetchTask` 的错误处理逻辑

## 待确认问题
- [ ] 用户是否在本地开发环境（`npm run dev`）还是已部署的生产环境遇到此问题？
- [ ] 浏览器控制台是否有 JavaScript 错误？（这将帮助确认空白页是 JS 崩溃还是 CSS 布局问题）
