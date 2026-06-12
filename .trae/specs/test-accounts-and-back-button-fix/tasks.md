# Tasks

## Phase 1: 创建测试账号数据管理

- [ ] Task 1.1: 在 api.ts 中添加账号数据存储键名常量 `USER_DATA_PREFIX = 'linli_user_data_'`
- [ ] Task 1.2: 修改 `authApi.login` - 登录成功后根据手机号返回对应账号数据
- [ ] Task 1.3: 创建 `initUserData(phone)` 函数 - 为新账号初始化空数据结构
- [ ] Task 1.4: 创建 `getUserData(phone)` 函数 - 根据手机号获取账号数据
- [ ] Task 1.5: 创建 `saveUserData(phone, data)` 函数 - 保存账号数据

## Phase 2: 修改各模块数据存储

- [ ] Task 2.1: 修改 `postsApi` - 使用账号数据键名存储帖子
- [ ] Task 2.2: 修改 `activitiesApi` - 使用账号数据键名存储活动
- [ ] Task 2.3: 修改 `ai-helper/index.vue` - 使用账号数据存储任务
- [ ] Task 2.4: 修改 `ai-helper/publish.vue` - 保存任务到当前账号数据
- [ ] Task 2.5: 修改 `messages/index.vue` - 使用账号数据存储消息

## Phase 3: 修复返回按钮问题

- [ ] Task 3.1: 检查 `src/utils/router.ts` 中 `navigateBack` 函数实现
- [ ] Task 3.2: 修复 `src/pages/ai-helper/detail.vue` 返回按钮
- [ ] Task 3.3: 修复 `src/pages/activities/detail.vue` 返回按钮
- [ ] Task 3.4: 检查并修复其他可能有问题的页面

## Phase 4: 验证与测试

- [ ] Task 4.1: 验证账号1数据与账号2数据隔离
- [ ] Task 4.2: 验证登录后数据正确加载
- [ ] Task 4.3: 验证所有返回按钮正常工作
- [ ] Task 4.4: 构建验证

## 测试账号密码

| 账号 | 手机号 | 密码 | 昵称 |
|------|--------|------|------|
| 账号1 | 13800138001 | test123456 | 阳光社区小李 |
| 账号2 | 13800138002 | test123456 | 热心肠王阿姨 |

## Task Dependencies
- Task 1.2 依赖 Task 1.1
- Task 2.1-2.5 依赖 Task 1.3-1.5
- Task 3.2-3.4 依赖 Task 3.1
