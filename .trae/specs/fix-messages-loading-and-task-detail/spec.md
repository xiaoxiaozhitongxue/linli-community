# 消息页面卡加载 & 任务详情数据错误 - 修复规格

## Why
用户反馈两个严重 BUG：
1. 登录后消息页面一直显示加载中转圈，永远无法加载完成
2. 从"我的任务"点击已发布的任务，进入详情页显示的是错误的默认数据，而不是实际发布的任务

## What Changes
- **messages/index.vue**: 统一使用 `router.ts` 的 `getUserStorageKey`，删除本地有缺陷的实现；为 `loadMessages` 添加 try/catch 错误处理
- **ai-helper/detail.vue**: 增加从 `MY_CREATED_TASKS_KEY` 和 `MY_ACCEPTED_TASKS_KEY` 回退查找任务的逻辑

## Impact
- Affected specs: bug-fixes-and-data-isolation
- Affected code: `src/pages/messages/index.vue`, `src/pages/ai-helper/detail.vue`

## ADDED Requirements

### Requirement: 消息页面正常加载
系统必须在消息页面登录后正确加载数据，不出现永久 loading 状态。

#### Scenario: 登录后消息页正常显示
- **GIVEN** 用户已登录
- **WHEN** 用户切换到消息页面
- **THEN** 消息页面在 1.5 秒内完成加载并显示消息列表（或空状态）

#### Scenario: 数据读取异常时安全恢复
- **GIVEN** localStorage 数据异常（如 JSON 解析失败）
- **WHEN** 消息页面尝试加载数据
- **THEN** 页面不卡死，loading 状态正常关闭，显示空列表

### Requirement: 我的任务点击跳转到正确详情
系统必须在用户从"我的任务"点击任务时，详情页显示该任务的实际数据，而非错误的默认数据。

#### Scenario: 从我的任务点击已发布任务
- **GIVEN** 用户已登录并发布了任务
- **WHEN** 用户在"我的任务 → 已发布"列表中点击某个任务
- **THEN** 详情页显示该任务的实际标题、描述等信息
