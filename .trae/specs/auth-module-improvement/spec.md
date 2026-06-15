# 登录注册模块完善 - 产品需求文档

## Overview
- **Summary**: 完善登录注册模块，实现账号验证、密码验证、注册功能
- **Purpose**: 提供完整的用户登录注册体验，区分测试账号和普通账号的登录流程
- **Target Users**: 邻里社区APP所有用户

## Goals
- ADMIN1 和 ADMIN2 测试账号可直接登录（密码123456）
- 普通账号登录时验证账号是否存在
- 账号不存在时提示"未注册"并询问是否注册
- 账号存在但密码错误时提示"密码错误"
- 提供完整的注册流程

## Non-Goals (Out of Scope)
- 第三方登录（微信、手机号验证码等）
- 密码找回功能
- 邮箱验证

## Background & Context
当前系统只有测试账号可以登录，普通用户无法注册和登录。需要完善登录注册流程：
- 测试账号：ADMIN1、ADMIN2（密码123456）
- 普通账号：需要注册后才能登录

## Functional Requirements
- **FR-1**: 测试账号登录 - ADMIN1/ADMIN2 + 123456 可直接登录
- **FR-2**: 普通账号登录 - 验证账号是否存在，密码是否正确
- **FR-3**: 账号不存在 - 提示"未注册"并提供注册入口
- **FR-4**: 密码错误 - 提示"密码错误"
- **FR-5**: 注册功能 - 支持普通用户注册账号

## Non-Functional Requirements
- **NFR-1**: 用户体验友好，提示信息清晰
- **NFR-2**: 密码存储安全（简单加密）
- **NFR-3**: 数据持久化到 localStorage

## Constraints
- **Technical**: Vue 3 + TypeScript
- **Dependencies**: localStorage 存储

## Acceptance Criteria

### AC-1: 测试账号登录成功
- **Given**: 用户输入 ADMIN1 和密码 123456
- **When**: 点击登录按钮
- **Then**: 登录成功，进入首页
- **Verification**: `human-judgment`

### AC-2: 测试账号密码错误
- **Given**: 用户输入 ADMIN1 和错误密码
- **When**: 点击登录按钮
- **Then**: 提示"密码错误"
- **Verification**: `human-judgment`

### AC-3: 普通账号未注册
- **Given**: 用户输入未注册的账号
- **When**: 点击登录按钮
- **Then**: 提示"账号未注册"并显示"去注册"按钮
- **Verification**: `human-judgment`

### AC-4: 普通账号密码错误
- **Given**: 用户输入已注册账号但密码错误
- **When**: 点击登录按钮
- **Then**: 提示"密码错误"
- **Verification**: `human-judgment`

### AC-5: 普通账号登录成功
- **Given**: 用户输入已注册账号和正确密码
- **When**: 点击登录按钮
- **Then**: 登录成功，进入首页
- **Verification**: `human-judgment`

### AC-6: 用户注册成功
- **Given**: 用户点击注册，输入账号和密码
- **When**: 点击注册按钮
- **Then**: 注册成功，自动登录
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要用户名（nickname）作为必填项？

## Verification Checklist
- [ ] 测试账号 ADMIN1 可正常登录
- [ ] 测试账号 ADMIN2 可正常登录
- [ ] 测试账号密码错误提示正确
- [ ] 普通账号未注册时提示未注册并提供注册入口
- [ ] 普通账号密码错误提示正确
- [ ] 普通账号注册功能正常
- [ ] 注册后可正常登录
- [ ] 构建成功