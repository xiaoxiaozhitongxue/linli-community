# 页面跳转BUG修复与数据隔离优化 - Implementation Plan ✅ 全部完成

## [x] Task 1: 修复 router.ts - 移除导航函数中的重复 recordPageVisit 调用
## [x] Task 2: 在 router.ts 中新增统一的 getUserStorageKey 工具函数
## [x] Task 3: 修复 profile/index.vue - 使用用户专属存储键读取任务统计
## [x] Task 4: 修复 profile/my-tasks.vue - 使用用户专属存储键
## [x] Task 5: 修复 ai-helper/detail.vue - 使用用户专属存储键 + 修正导入
## [x] Task 6: 全面检查 - 修复 ai-helper/detail.vue 和 profile/edit.vue 中的 navigateBack 调用
## [x] Task 7: 最终构建验证 - npm run build 成功，退出码 0

## [x] Task 1: 修复 router.ts - 移除导航函数中的重复 recordPageVisit 调用
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 `navigateTo` 函数中移除 `recordPageVisit(currentPath, router.currentRoute.value.query)` 调用
  - 在 `navigateToDetail` 函数中移除 `recordPageVisit(currentPath, router.currentRoute.value.query)` 调用
  - 保留 `router.beforeEach` 中的 `recordPageVisit(toPath, to.query)` 作为唯一的页面记录入口
  - 原因：每次路由变化时，beforeEach 守卫会自动记录，导航函数中的记录导致 pageStack 出现重复项
- **Acceptance Criteria Addressed**: AC-1（导航返回正确）
- **File to modify**: `src/utils/router.ts`
- **Test Requirements**:
  - `programmatic` - 构建成功（npm run build）
  - `programmatic` - navigateTo 和 navigateToDetail 中无 recordPageVisit 调用（grep 检查）
  - `programmatic` - beforeEach 中保留 recordPageVisit 调用
- **Notes**: 修改第133-134行附近的 navigateTo 函数，以及第251-253行附近的 navigateToDetail 函数

## [x] Task 2: 在 router.ts 中新增统一的 getUserStorageKey 工具函数
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 在 `src/utils/router.ts` 中新增 `getUserStorageKey(baseKey: string): string` 函数
  - 逻辑：从 localStorage 读取 `userInfo`，获取 `phone` 字段，返回 `{baseKey}_{phone}`
  - 如果 userInfo 不存在（未登录），直接返回 `baseKey`（向后兼容）
  - 导出这个函数供所有页面使用
- **Acceptance Criteria Addressed**: AC-2（数据隔离）
- **File to modify**: `src/utils/router.ts`
- **Test Requirements**:
  - `programmatic` - 构建成功
  - `programmatic` - getUserStorageKey 被正确导出

## [x] Task 3: 修复 profile/index.vue - 使用用户专属存储键读取任务统计
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 从 `../../utils/router` 导入 `getUserStorageKey`
  - 修改 `loadTaskStats` 函数中 `localStorage.getItem(MY_CREATED_TASKS_KEY)` 改为 `localStorage.getItem(getUserStorageKey(MY_CREATED_TASKS_KEY))`
  - 同理修改 `MY_ACCEPTED_TASKS_KEY` 的读取
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **File to modify**: `src/pages/profile/index.vue`
- **Test Requirements**:
  - `programmatic` - 构建成功
  - `programmatic` - loadTaskStats 中使用 getUserStorageKey 而非直接使用 MY_CREATED_TASKS_KEY

## [x] Task 4: 修复 profile/my-tasks.vue - 使用用户专属存储键
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 从 `../../utils/router` 导入 `getUserStorageKey`
  - 修改 `loadFromStorage` 函数调用处，传入的 key 用 `getUserStorageKey(key)` 包装
  - 修改 `saveToStorage` 函数调用处，传入的 key 用 `getUserStorageKey(key)` 包装
  - 所有读写操作（loadFromStorage, saveToStorage）的 key 参数都通过 getUserStorageKey 转换
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **File to modify**: `src/pages/profile/my-tasks.vue`
- **Test Requirements**:
  - `programmatic` - 构建成功
  - `programmatic` - 所有 localStorage 读写都经过 getUserStorageKey

## [x] Task 5: 修复 ai-helper/detail.vue - 使用用户专属存储键 + 修正导入
- **Priority**: P0
- **Depends On**: Task 2
- **Description**:
  - 从 `../../utils/router` 导入 `getUserStorageKey`
  - 修改 `loadFromStorage` 调用处的 key：`STORAGE_KEY` → `getUserStorageKey(STORAGE_KEY)`，`MY_CREATED_TASKS_KEY` → `getUserStorageKey(MY_CREATED_TASKS_KEY)`，`MY_ACCEPTED_TASKS_KEY` → `getUserStorageKey(MY_ACCEPTED_TASKS_KEY)`
  - 修改 `saveToStorage` 调用处同理
  - **修正导入**: 将 `import { navigateBack } from '../../utils/router'` 改为 `import { navigateBack, navigateBackSmart, getUserStorageKey } from '../../utils/router'`
  - 确保 goBack 函数调用与导入匹配（当前代码调用的是 navigateBackSmart）
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **File to modify**: `src/pages/ai-helper/detail.vue`
- **Test Requirements**:
  - `programmatic` - 构建成功
  - `programmatic` - 导入的 navigateBackSmart 与调用一致
  - `programmatic` - 所有 localStorage 读写都经过 getUserStorageKey

## [x] Task 6: 全面检查其他页面的导航和数据存储
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 检查所有 `src/pages/**/*.vue` 文件中是否存在类似问题
  - 检查 `import { navigateBack } from` 与实际调用 `navigateBackSmart()` 是否匹配
  - 检查 `ai-helper/publish.vue` 中已有的 `getUserStorageKey` 定义是否可以替换为全局版本（可选优化）
  - 检查 `ai-helper/index.vue` 中已有的 `getUserStorageKey` 定义是否可以替换为全局版本（可选优化）
  - 检查 `messages/index.vue` 中已有的 `getUserStorageKey` 定义是否可以替换为全局版本（可选优化）
- **Acceptance Criteria Addressed**: AC-4
- **Files to check**: `src/pages/**/*.vue`
- **Test Requirements**:
  - `programmatic` - 所有页面中导入和调用一致（grep检查）
  - `programmatic` - 构建成功

## [x] Task 7: 最终构建验证
- **Priority**: P0
- **Depends On**: Tasks 1-6
- **Description**:
  - 执行 `npm run build` 验证 TypeScript 编译
  - 确认无任何类型错误或导入错误
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` - `npm run build` 成功完成，退出码 0
