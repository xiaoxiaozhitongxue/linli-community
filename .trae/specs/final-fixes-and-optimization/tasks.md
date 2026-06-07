# 邻里社区APP - 全面修复和优化任务清单

## [ ] 任务 1: 重构 AI 互助页面 (index.vue)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 将`<view>`替换为`<div>`，`<text>`替换为`<span>`
  - 将`<scroll-view>`替换为普通滚动容器
  - 将`<image>`替换为`<img>`
  - 移除uni API，替换为标准API
  - 完善功能实现（任务列表、发布任务等）
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 页面功能正常，布局美观

## [ ] 任务 2: 重构 AI 互助详情页 (detail.vue)
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 重构标签，替换uni-app组件
  - 实现任务详情展示
  - 实现接受任务和完成任务功能
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 功能完整

## [ ] 任务 3: 重构社区创业页面 (business/index.vue)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 替换所有uni-app标签
  - 实现店铺展示和管理功能
  - 添加完整的mock数据
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 页面可用

## [ ] 任务 4: 重构老人关怀页面 (elderly/index.vue)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 替换所有uni-app标签
  - 实现紧急求助、快捷服务功能
  - 添加帮扶记录展示
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 功能正常

## [ ] 任务 5: 重构活动详情页 (activities/detail.vue)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 替换所有uni-app标签（包括swiper）
  - 实现活动详情展示
  - 实现报名/取消报名功能
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 功能完整

## [ ] 任务 6: 重构活动创建页 (activities/create.vue)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 替换所有uni-app标签
  - 实现活动创建表单
  - 添加表单验证
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 表单可用

## [ ] 任务 7: 重构发布动态页 (post/create.vue)
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 替换所有uni-app标签
  - 实现内容输入和图片上传模拟
  - 实现发布功能
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 发布功能正常

## [ ] 任务 8: 重构个人中心子页面
- **Priority**: P1
- **Depends On**: None
- **Description**: 
  - edit.vue: 编辑个人资料
  - my-posts.vue: 我的动态
  - my-activities.vue: 我的活动
  - my-favorites.vue: 我的收藏
  - settings.vue: 设置页面
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` 构建成功
  - `human-judgement` 页面完整可用

## [ ] 任务 9: 优化响应式设计
- **Priority**: P1
- **Depends On**: Tasks 1-8
- **Description**: 
  - 手机端（375px）适配
  - 平板端（768px）适配
  - 电脑端（1024px+）适配
  - 优化触摸交互
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` 在各种设备上显示良好

## [ ] 任务 10: 完善功能和交互
- **Priority**: P1
- **Depends On**: Tasks 1-8
- **Description**: 
  - 完善首页的点赞、评论、分享
  - 完善登录流程
  - 添加loading状态和错误处理
  - 优化toast提示
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` 所有功能交互良好

## [ ] 任务 11: 完整构建和测试
- **Priority**: P0
- **Depends On**: Tasks 1-10
- **Description**: 
  - 运行完整构建测试
  - 检查控制台错误
  - 最终验证所有功能
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` npm run build 无错误

## [ ] 任务 12: 部署到Cloudflare Pages
- **Priority**: P0
- **Depends On**: Task 11
- **Description**: 
  - 构建项目
  - 复制functions到dist目录
  - 部署到Cloudflare Pages
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` 部署成功，公网可访问
