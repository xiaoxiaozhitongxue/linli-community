# 页面跳转BUG修复与数据隔离优化 - Product Requirement Document

## Overview
- **Summary**: 修复页面跳转返回按钮无响应的问题，优化用户数据存储结构，确保所有功能使用统一的用户专属数据键，使得多测试账号间数据完全独立。
- **Purpose**: 解决导航历史双重记录导致的返回异常，修复部分页面使用全局存储键而非用户专属键导致的数据错乱，确保增删改查功能正确。
- **Target Users**: 使用测试账号13800138001、13800138002等进行功能测试的用户

## Goals
1. **导航返回功能正常**: 所有页面的返回按钮能正确返回上一页或指定页面
2. **用户数据完全隔离**: 每个测试账号的数据存储在独立的 localStorage 键中，互不干扰
3. **数据读写一致**: 同一账号在不同页面读写的是同一批数据
4. **增删改查功能完整**: 发布任务、发布活动、发布帖子、修改任务状态等操作正确保存和读取

## Non-Goals (Out of Scope)
- 不修改路由配置（router/index.ts 的路由表）
- 不新增页面功能模块
- 不修改后端 API 接口
- 不修改 UI 样式（除非与导航或数据问题直接相关）

## Background & Context
项目目前存在两类核心问题：

### 问题1: 导航历史双重记录
在 `src/utils/router.ts` 中：
- `navigateTo` 函数在跳转前调用 `recordPageVisit(currentPath)` → 记录当前页
- `navigateToDetail` 函数在跳转前也调用 `recordPageVisit(currentPath)` → 记录当前页
- `router.beforeEach` 守卫在每次路由变化时调用 `recordPageVisit(toPath, to.query)` → 记录目标页

**结果**: 每次导航导致 pageStack 中同时记录了"离开页"和"进入页"，共2条记录。导致 `getPreviousPagePath` 返回的是当前页（而非真正的上一页），返回按钮行为异常。

### 问题2: 部分页面使用全局存储键（无用户手机号后缀）
以下页面使用 `ai_helper_tasks`、`ai_helper_my_created_tasks` 等**无用户标识**的键：
- `src/pages/profile/index.vue` - 任务统计数据
- `src/pages/profile/my-tasks.vue` - "我的任务"列表
- `src/pages/ai-helper/detail.vue` - 任务详情页

而以下页面使用**正确的用户专属键**（`ai_helper_tasks_13800138001`）：
- `src/pages/ai-helper/index.vue` - 任务广场
- `src/pages/ai-helper/publish.vue` - 发布任务页
- `src/pages/messages/index.vue` - 消息中心

**结果**: 用户A发布的任务保存在 `ai_helper_tasks_A`，但"我的任务"页面从 `ai_helper_my_created_tasks`（无后缀）读取，永远看不到自己发布的任务统计。

### 问题3: 部分页面导入函数不匹配
- `ai-helper/detail.vue` 导入了 `navigateBack` 但代码中调用的是 `navigateBackSmart()`（未导入）

## Functional Requirements

### FR-1: 统一导航历史记录
系统 SHALL 在 `router.ts` 中仅通过 `beforeEach` 守卫记录页面访问历史，移除 `navigateTo` 和 `navigateToDetail` 函数中的重复 `recordPageVisit` 调用。

### FR-2: 统一用户数据存储键管理
系统 SHALL 在 `src/utils/router.ts` 或新增 `src/utils/storage.ts` 中提供统一的 `getUserStorageKey(baseKey)` 函数，供所有页面使用。

### FR-3: 所有任务相关页面使用用户专属存储键
`profile/index.vue`、`profile/my-tasks.vue`、`ai-helper/detail.vue` 中所有 localStorage 读写 SHALL 使用 `getUserStorageKey()` 生成的带手机号后缀的键。

### FR-4: 修复导入与调用不匹配
所有页面 SHALL 确保导入的函数与实际调用的函数一致。

### FR-5: 确保发布后的任务能在"我的任务"中看到
用户发布任务后，进入"我的任务"页面 SHALL 看到刚发布的任务，统计数据 SHALL 正确更新。

## Non-Functional Requirements

### NFR-1: 向后兼容
修改后的存储键命名 SHALL 与现有正确页面的命名保持一致（`{baseKey}_{phone}`）。

### NFR-2: 代码一致性
所有数据存储相关的工具函数 SHALL 集中管理，避免在每个页面重复定义相同逻辑。

### NFR-3: 错误处理
localStorage 读写 SHALL 有 try/catch 保护，异常时输出清晰的 console.error。

## Constraints
- **技术**: Vue 3 Composition API + TypeScript + localStorage
- **依赖**: 不得引入新的 npm 包
- **存储格式**: 保持现有 JSON 格式不变

## Assumptions
- 用户登录后 `localStorage.userInfo` 存在且包含 `phone` 字段
- 不同测试账号使用不同的手机号（如 13800138001 vs 13800138002）
- 浏览器支持 localStorage（现代浏览器都支持）

## Acceptance Criteria

### AC-1: 导航返回正确
- **Given**: 用户在首页点击"互助广场"进入任务列表
- **When**: 用户点击任务详情页的返回按钮
- **Then**: 页面返回互助广场列表
- **Verification**: `programmatic` - 检查 navigateTo 不调用 recordPageVisit，pageStack 无重复

### AC-2: 数据隔离 - 多账号独立
- **Given**: 账号A（13800138001）已登录并发布了任务"帮忙取快递"
- **When**: 账号B（13800138002）登录并进入"我的任务"页面
- **Then**: 账号B看不到账号A的任务"帮忙取快递"
- **Verification**: `programmatic` - 检查存储键包含手机号

### AC-3: 发布任务后统计正确
- **Given**: 用户登录，当前"发布的任务"统计为 0
- **When**: 用户成功发布一个任务后，返回个人中心
- **Then**: "发布的任务"统计显示为 1
- **Verification**: `programmatic` - 检查 profile/index.vue 使用正确的存储键

### AC-4: 返回按钮无报错
- **Given**: 用户在任意页面
- **When**: 用户点击左上角返回按钮
- **Then**: 页面正常返回，控制台无 "navigateBackSmart is not defined" 错误
- **Verification**: `programmatic` - grep 所有页面确保导入正确

### AC-5: 构建成功
- **Given**: 所有修复完成
- **When**: 执行 `npm run build`
- **Then**: TypeScript 编译通过，无类型错误，构建成功
- **Verification**: `programmatic`

## Open Questions
- 是否需要清除旧的全局存储键中的数据（如 `ai_helper_tasks` 不带手机号后缀）？目前策略：保留旧数据，但不再写入；新数据使用新键。
