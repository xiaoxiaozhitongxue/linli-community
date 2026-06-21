# 综合 Bug 修复 - 验证清单

## 已完成修复（代码审查）
- [x] `tasks/index.js` 的 `normalizeStatus` 函数将 `'open'` → `'pending'`
- [x] `tasks/my.js` 返回结构包含 `published` 和 `accepted` 数组
- [x] `detail.vue` 的 `mapApiTaskToLocal` 完整映射所有状态值
- [x] `detail.vue` 的 `fetchTask` 增加防御性检查
- [x] `index.vue` 的 `reloadTasks` 在 API 失败时清空列表显示空状态
- [x] `storage.ts` 已精简为仅存储登录态（无业务数据）

## Task 5: 帖子列表页云端化
- [x] `create/index.vue`（发布帖子）使用 `postsApi.createPost()` 调用云端 API
- [x] 帖子列表使用 `postsApi.getPosts()` 获取数据
- [x] 发布帖子后刷新页面能看到刚才的帖子

## Task 6: 活动列表页云端化
- [x] 活动列表使用 `activitiesApi.getActivities()` 获取数据
- [x] 创建活动使用 `activitiesApi.createActivity()` 调用云端 API

## Task 7: 消息页面检查
- [x] 消息页面数据加载无 JS 错误
- [x] 消息列表在登录状态下正常显示

## Task 8: 健康打卡页面
- [x] 打卡页面使用 `healthApi` 云端 API
- [x] 打卡后立即显示在历史记录中

## Task 9: 构建和推送
- [x] `npm run build` 成功，0 编译错误
- [ ] 代码已推送到 GitHub（网络问题待重试）
