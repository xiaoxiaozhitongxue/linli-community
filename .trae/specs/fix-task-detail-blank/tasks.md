# 任务详情页空白修复 - 实现计划

## [x] Task 1: 修复 `detail.vue` 的 `mapApiTaskToLocal` 状态映射
- **Priority**: P0
- **Depends On**: 无
- **Description**:
  - 将 `in_progress` 状态映射为 `ongoing`（与列表页一致）
  - 增加 `completed` → `completed` 映射
  - 增加 `cancelled` → `cancelled` 映射
  - 保留所有现有字段映射（creator、location、distance 等）
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgement` TR-1.1: 在详情页中，pending 状态任务显示"接下这个任务"按钮；in_progress 状态任务显示"进行中"且按钮禁用

## [x] Task 2: 增强 `detail.vue` 的 `fetchTask` 防御性错误处理
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在调用 `mapApiTaskToLocal` 前，检查 `apiTask` 是否为有效对象（不为 null/undefined/空对象）
  - 如果 `apiTask` 为空，显示明确的空状态 UI（不依赖 localStorage）
  - 确保 `loading` 在所有退出路径都被正确设置为 `false`
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgement` TR-2.1: 当任务 ID 不存在时，页面显示"未找到该任务"而非空白页

## [x] Task 3: 确保 `index.vue` 任务列表在 API 失败时显示空状态
- **Priority**: P0
- **Depends On**: 无
- **Description**:
  - 检查 `filteredTasks` computed 在 API 失败时是否正确返回空数组
  - 确认 `v-else` 空状态在任务列表为空时正确显示
  - 确保 `statusFilter === 'open'` 默认值与后端 `'pending'` 映射一致（已在后端修复）
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` TR-3.1: 当数据库有待接单任务时，列表显示任务卡片；无任务时显示"暂无任务"提示

## [x] Task 4: 构建验证
- **Priority**: P0
- **Depends On**: Task 1, 2, 3
- **Description**:
  - 运行 `npm run build` 确保无编译错误
  - 验证所有页面模板结构正确
- **Test Requirements**:
  - `programmatic` TR-4.1: `npm run build` 退出码为 0

## Task Dependencies
- Task 2 依赖 Task 1（都修改 detail.vue，按顺序）
- Task 4 依赖 Task 1、2、3
- Task 3 与 Task 1、2 并行（不同文件）
