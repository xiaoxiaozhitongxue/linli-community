# 消息页面卡加载 & 任务详情数据错误 - 修复任务

## [x] Task 1: 修复 messages/index.vue 消息页面永久加载 BUG
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 将本地 `getUserStorageKey` 替换为从 `../../utils/router` 导入的统一函数
  - 为 `loadMessages` 函数添加完整 try/catch 错误处理，确保 `loading.value = false` 始终会被执行
  - 删除本地定义的 `getUserStorageKey` 函数
- **Acceptance Criteria Addressed**: 消息页面正常加载
- **Test Requirements**:
  - `programmatic` TR-1.1: 从 router.ts 导入 getUserStorageKey，本地不再定义
  - `programmatic` TR-1.2: loadMessages 函数内所有数据操作包裹在 try/catch 中，finally 中设置 loading = false
  - `human-judgment` TR-1.3: 登录后切换到消息页面，loading 正常结束，显示消息列表或空状态

## [x] Task 2: 修复 ai-helper/detail.vue 任务详情数据错误 BUG
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 onMounted 中增加回退查找逻辑：先从 STORAGE_KEY 查找，找不到则从 MY_CREATED_TASKS_KEY 查找，再找不到从 MY_ACCEPTED_TASKS_KEY 查找
  - 确保详情页总能显示实际的任务数据而非默认硬编码数据
- **Acceptance Criteria Addressed**: 我的任务点击跳转到正确详情
- **Test Requirements**:
  - `programmatic` TR-2.1: detail.vue 的 onMounted 中存在从 MY_CREATED_TASKS_KEY 回退查找的逻辑
  - `programmatic` TR-2.2: detail.vue 的 onMounted 中存在从 MY_ACCEPTED_TASKS_KEY 回退查找的逻辑
  - `human-judgment` TR-2.3: 发布任务后从"我的任务"点击该任务，详情页显示正确的任务标题

## [ ] Task 3: 构建验证与 Git 推送
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 执行 npm run build 验证编译通过
  - 执行 git add、commit、push
- **Acceptance Criteria Addressed**: 所有修复通过构建
- **Test Requirements**:
  - `programmatic` TR-3.1: npm run build 退出码为 0
  - `programmatic` TR-3.2: git push origin master 成功

# Task Dependencies
- Task 1 and Task 2 can be executed in parallel
- Task 3 depends on Task 1 and Task 2
