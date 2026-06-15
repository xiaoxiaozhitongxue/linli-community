# 测试账号数据隔离与功能完善

## Why
当前示例数据没有分配给特定用户，导致：
- 两个测试账号登录后看到相同的示例数据
- 无法验证用户数据隔离是否正常工作
- 测试账号的部分功能可能受限

## What Changes
- 将示例任务分别分配给两个测试账号
- 将示例帖子分别分配给两个测试账号
- 将示例活动分别分配给两个测试账号
- 确保测试账号可以使用所有功能（发帖、接单、评论等）

## Impact
- Affected specs: 用户数据隔离
- Affected code: `src/utils/storage.ts` 中的 `getDefaultBusiness` 函数

## ADDED Requirements

### Requirement: 账号1示例数据
**账号1 (13811112222 - 热心邻居张阿姨)** 应拥有：
- 2-3个示例任务
- 2-3条示例帖子
- 1-2个示例活动
- 示例数据的 creator 字段指向该账号

#### Scenario: 账号1查看自己的数据
- **WHEN** 用户使用 13811112222 登录
- **THEN** 首页显示张阿姨发布的任务和帖子

### Requirement: 账号2示例数据
**账号2 (13811113333 - 社区达人李先生)** 应拥有：
- 2-3个示例任务
- 2-3条示例帖子
- 1-2个示例活动
- 示例数据的 creator 字段指向该账号

#### Scenario: 账号2查看自己的数据
- **WHEN** 用户使用 13811113333 登录
- **THEN** 首页显示李先生发布的任务和帖子

### Requirement: 功能可用性
两个测试账号的所有功能均应可用：
- 发布任务
- 接取任务
- 发布帖子
- 评论帖子
- 点赞帖子
- 报名活动
- 收藏活动

#### Scenario: 账号1发布任务
- **WHEN** 账号1 (13811112222) 发布新任务
- **THEN** 任务正确保存到 `linli_business_data_13811112222` 存储键下

#### Scenario: 账号1查看待接单任务
- **WHEN** 账号1 进入待接单页面
- **THEN** 显示账号1自己发布的任务（可接单状态）

## REMOVED Requirements
- 无

## Technical Notes
- 使用 `getUserStorageKey(BUSINESS_KEY, phone)` 为每个测试账号初始化独立的数据
- 示例数据的 `user_id` 和 `user_phone` 字段必须匹配对应账号
- 示例数据的 `creator` 对象应包含账号的 nickname 和 avatar