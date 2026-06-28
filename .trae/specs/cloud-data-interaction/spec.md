# 前后端云端数据交互与部署

## Why
当前项目后端 Cloudflare Pages Functions API 基础架构已存在，但存在几个严重 Bug（cancel.js 语法错误、test.js 运行时错误），JWT 密钥硬编码存在安全风险，且 D1 数据库尚未初始化。需要修复这些问题并推送到 Git 使项目可实际部署运行。

## What Changes
- 修复 `cancel.js` 的模板字符串语法错误（**P0**）
- 修复 `test.js` 的 `result.results` 运行时错误（**P0**）
- 将 JWT_SECRET 改为从环境变量读取（**P1 安全**）
- 创建 D1 数据库初始化/迁移脚本
- 验证前端服务层与后端 API 的连通性
- 修复 `favorites.js` 的不一致 ID 生成（**代码一致性**）
- 完善 `.env.example` 环境变量文档
- 推送代码到 Git

## Impact
- Affected specs: 云端交互、认证、任务管理
- Affected code: `functions/api/tasks/[id]/cancel.js`, `functions/api/test.js`, `functions/lib/session.js`, `functions/api/user/favorites.js`, `.env.example`, `database/`

## ADDED Requirements

### Requirement: 后端 API 稳定性
所有 Cloudflare Pages Functions API 端点必须无语法错误，能正常响应。

#### Scenario: 取消任务
- **WHEN** 用户 POST `/api/tasks/:id/cancel`
- **THEN** 返回 200 并正确更新任务状态为 `cancelled`

#### Scenario: 测试接口
- **WHEN** GET `/api/test`
- **THEN** 返回 200 并包含 SQLite 版本信息

### Requirement: 安全配置
JWT 签名密钥必须支持通过环境变量配置。

#### Scenario: 环境变量配置
- **WHEN** Cloudflare 环境变量 `JWT_SECRET` 已设置
- **THEN** JWT 使用该变量值签名
- **WHEN** 环境变量未设置
- **THEN** 使用安全的兜底默认值

### Requirement: D1 数据库就绪
必须提供 D1 数据库初始化脚本，确保 schema 可正常部署。

#### Scenario: 数据库初始化
- **WHEN** 运行初始化命令
- **THEN** 所有表（users, posts, comments, tasks, activities, likes, health_records, activity_participants）创建成功

### Requirement: Git 提交
所有修复必须提交到 Git 仓库。

#### Scenario: 提交
- **WHEN** 所有修复完成
- **THEN** 代码提交到 Git，包含清晰的提交信息

## REMOVED Requirements
无
