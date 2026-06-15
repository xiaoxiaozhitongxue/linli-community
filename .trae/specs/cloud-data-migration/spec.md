# 邻里社区APP - 云端数据存储迁移

## Overview
- **Summary**: 将数据存储从 localStorage 迁移到 Cloudflare D1 云端数据库，实现密码登录
- **Purpose**: 实现用户数据跨设备同步，支持密码登录
- **Target Users**: 所有使用应用的用户

## Goals
- 创建 Cloudflare D1 数据库
- 实现用户注册 API（手机号 + 密码）
- 实现密码登录 API（手机号 + 密码）
- 将任务、帖子、活动数据存储迁移到 D1
- 修改前端调用真实 API

## Non-Goals (Out of Scope)
- 不修改现有页面 UI
- 不添加新功能
- 不改变现有业务逻辑

## Technical Approach

### 数据库
使用 Cloudflare D1，已有的 schema 定义。

### 认证方式
使用密码登录：
- 注册：手机号 + 密码 + 昵称 + 社区
- 登录：手机号 + 密码
- Token：JWT

### API 层
需要实现的 API：
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 密码登录
- GET /api/auth/profile - 获取用户信息
- 任务 CRUD
- 帖子 CRUD
- 活动 CRUD