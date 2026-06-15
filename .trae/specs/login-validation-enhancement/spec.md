# 登录状态验证增强 - 产品需求文档

## Overview
- **Summary**: 确保所有涉及用户数据交互的功能（点赞、评论、分享、报名活动、接任务、发布内容等）在执行前都进行登录状态验证，未登录用户引导至登录页面。
- **Purpose**: 提高平台数据安全性和用户体验，防止未登录状态下的数据操作异常。
- **Target Users**: 所有邻里社区APP用户

## Goals
- 确保所有数据交互功能（点赞、评论、分享、报名、接单、发布）都验证登录状态
- 未登录用户执行数据操作时，自动引导至登录页面
- 登录成功后能返回原操作页面继续操作
- 提供统一的登录引导提示

## Non-Goals (Out of Scope)
- 修改登录页面本身的功能
- 修改后端API验证逻辑
- 添加新的用户注册功能

## Background & Context
当前代码库中部分数据交互功能缺少登录状态验证，可能导致：
- API调用失败（无token）
- 用户体验不佳（操作失败无提示）
- 数据不一致（操作状态本地更新但服务器拒绝）

## Functional Requirements
- **FR-1**: 点赞功能必须验证登录状态
- **FR-2**: 评论功能必须验证登录状态
- **FR-3**: 分享功能（需要登录时）必须验证登录状态
- **FR-4**: 活动报名/取消报名必须验证登录状态
- **FR-5**: 任务接单必须验证登录状态
- **FR-6**: 发布任务必须验证登录状态
- **FR-7**: 收藏功能必须验证登录状态

## Non-Functional Requirements
- **NFR-1**: 登录验证逻辑应统一、可复用
- **NFR-2**: 用户体验友好，提供清晰的引导提示
- **NFR-3**: 登录后能自动返回原页面

## Constraints
- **Technical**: Vue 3 + TypeScript，使用现有的 `useAuth()` composable
- **Dependencies**: 依赖现有的 `showLoginGuide()` 和 `setLoginRedirect()` 函数

## Acceptance Criteria

### AC-1: 点赞功能登录验证
- **Given**: 用户未登录
- **When**: 用户点击帖子点赞按钮
- **Then**: 显示登录引导弹窗，引导用户登录
- **Verification**: `human-judgment`

### AC-2: 评论功能登录验证
- **Given**: 用户未登录
- **When**: 用户尝试提交评论
- **Then**: 显示登录引导弹窗，引导用户登录
- **Verification**: `human-judgment`

### AC-3: 活动报名登录验证
- **Given**: 用户未登录
- **When**: 用户点击活动报名按钮
- **Then**: 显示登录引导弹窗，引导用户登录
- **Verification**: `human-judgment`

### AC-4: 任务接单登录验证
- **Given**: 用户未登录
- **When**: 用户点击任务接单按钮
- **Then**: 显示登录引导弹窗，引导用户登录
- **Verification**: `human-judgment`

### AC-5: 发布任务登录验证
- **Given**: 用户未登录
- **When**: 用户进入发布任务页面
- **Then**: 自动跳转到登录页面或显示登录引导
- **Verification**: `human-judgment`

### AC-6: 收藏功能登录验证
- **Given**: 用户未登录
- **When**: 用户点击收藏按钮
- **Then**: 显示登录引导弹窗，引导用户登录
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要在页面加载时就验证登录状态（如发布页面）？

## Verification Checklist
- [ ] 首页帖子点赞功能已验证登录状态
- [ ] 首页评论功能已验证登录状态
- [ ] 活动详情报名功能已验证登录状态
- [ ] 活动详情收藏功能已验证登录状态
- [ ] 任务详情接单功能已验证登录状态
- [ ] 任务发布页面已验证登录状态
- [ ] 帖子发布页面已验证登录状态