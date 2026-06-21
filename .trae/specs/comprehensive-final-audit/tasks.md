# 综合 Bug 修复与全面测试 - 任务清单

## [x] Task 1: 修复待接单列表为空（tasks/index.js 状态映射）
- **Priority**: P0
- **Depends On**: 无
- **Description**: 添加 `normalizeStatus()` 将前端 `'open'` → 数据库 `'pending'`
- **Status**: 已完成（上上次会话）

## [x] Task 2: 修复我的任务为空（tasks/my.js 返回结构）
- **Priority**: P0
- **Depends On**: 无
- **Description**: 返回 `{ published: [...], accepted: [...] }` 数组
- **Status**: 已完成（上上次会话）

## [x] Task 3: 修复详情页空白（detail.vue 状态映射+错误处理）
- **Priority**: P0
- **Depends On**: 无
- **Description**: `mapApiTaskToLocal` 完整状态映射 + 防御性检查
- **Status**: 已完成（上次会话）

## [x] Task 4: 修复列表页空状态显示（index.vue API失败处理）
- **Priority**: P0
- **Depends On**: 无
- **Description**: `reloadTasks` API失败时清空列表，显示空状态
- **Status**: 已完成（上次会话）

## [ ] Task 5: 检查帖子列表页是否使用云端 API
- **Priority**: P1
- **Depends On**: 无
- **Description**:
  - 检查 `src/pages/posts/index.vue`（或 `create/index.vue`）的数据加载方式
  - 如果依赖 localStorage，改为使用 `postsApi.getPosts()`
  - 确保发布帖子时调用 `postsApi.createPost()`
- **Test Requirements**:
  - `human-judgement`: 发布帖子后刷新页面能看到刚才发布的帖子

## [ ] Task 6: 检查活动列表页是否使用云端 API
- **Priority**: P1
- **Depends On**: 无
- **Description**:
  - 检查 `src/pages/activities/index.vue` 的数据加载方式
  - 如果依赖 localStorage，改为使用 `activitiesApi.getActivities()`
  - 确保创建活动时调用 `activitiesApi.createActivity()`
- **Test Requirements**:
  - `human-judgement`: 活动列表能正确显示数据库中的活动

## [ ] Task 7: 检查消息页面数据加载
- **Priority**: P1
- **Depends On**: 无
- **Description**:
  - 检查 `src/pages/messages/index.vue` 和 `chat.vue` 的消息加载方式
  - 消息数据是否需要云端存储（需评估当前设计是否适合消息场景）
- **Test Requirements**:
  - `human-judgement`: 消息页面在登录状态下能正常显示

## [ ] Task 8: 检查健康打卡页面
- **Priority**: P1
- **Depends On**: 无
- **Description**:
  - 确认 `src/pages/health/index.vue` 使用 `healthApi` 云端 API
  - 检查打卡成功后的 UI 反馈
- **Test Requirements**:
  - `human-judgement`: 健康打卡页面能正常加载历史记录，打卡后显示成功

## [ ] Task 9: 构建验证和推送
- **Priority**: P0
- **Depends On**: Task 5, 6, 7, 8
- **Description**:
  - 运行 `npm run build` 确保无编译错误
  - 推送代码到 GitHub
- **Test Requirements**:
  - `programmatic`: 构建退出码为 0

## Task Dependencies
- Task 9 依赖 Task 5, 6, 7, 8 全部完成
- Task 5, 6, 7, 8 可并行进行
