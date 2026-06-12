# Checklist

## 数据管理
- [x] api.ts 中定义了 `USER_DATA_PREFIX` 常量
- [x] `authApi.login` 根据手机号返回对应账号数据
- [x] 新账号登录时初始化空数据结构
- [x] 各账号数据独立存储，互不影响

## Posts (帖子)
- [x] 帖子数据存储到账号独立的键名下
- [x] 账号1看不到账号2的帖子

## Activities (活动)
- [x] 活动数据存储到账号独立的键名下
- [x] 账号1看不到账号2的活动

## AI Helper (互助任务)
- [x] 互助任务数据存储到账号独立的键名下
- [x] 我发布的任务保存到当前账号
- [x] 账号1看不到账号2的任务

## Messages (消息)
- [x] 消息数据存储到账号独立的键名下
- [x] 账号1看不到账号2的消息

## 返回按钮
- [x] `navigateBack` 函数实现正确
- [x] `ai-helper/detail.vue` 返回按钮正常
- [x] `activities/detail.vue` 返回按钮正常
- [x] 其他页面返回按钮正常

## 构建验证
- [x] `npm run build` 成功
- [x] 无 TypeScript 错误
