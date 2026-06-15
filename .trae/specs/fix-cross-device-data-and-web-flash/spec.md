# 跨设备数据持久化 & Web端橙色框闪烁修复

## Why
用户反馈：
1. 在其他设备登录后，之前创建的任务消失 - 因为数据存储在 localStorage，无法跨设备同步
2. 橙色框闪烁只在 Web 端出现，移动端正常

## What Changes
- **数据持久化问题**：当前使用 localStorage 是本地存储，数据无法跨设备。这是架构限制，需要说明给用户
- **Web端橙色框闪烁**：检查 Web 端特有的 CSS 渲染问题，可能需要添加 Web 端特定的样式修复

## Impact
- Affected specs: 数据存储架构
- Affected code: `src/utils/storage.ts`, `src/pages/index/index.vue`, `src/pages/ai-helper/index.vue`

## ADDED Requirements

### Requirement: 数据持久化说明
**当前架构限制**：
- localStorage 是浏览器本地存储，数据只存在于当前设备
- 用户换设备登录后，新设备没有旧设备的数据
- 这是 localStorage 的固有特性，不是 bug

**解决方案选项**：
1. **短期方案**：向用户说明当前数据是本地存储，换设备会丢失
2. **长期方案**：将数据迁移到云端存储（D1/KV），实现跨设备同步

### Requirement: Web端橙色框闪烁修复
Web 端特有的闪烁问题需要针对性修复：
- 可能是 CSS 变量在 Web 端加载顺序不同
- 可能是 Web 端渲染引擎对 CSS 渐变的处理方式不同
- 需要添加 Web 端特定的样式回退

#### Scenario: Web端首页加载
- **WHEN** 用户在 Web 浏览器打开首页
- **THEN** 橙色状态栏无闪烁、无错位

#### Scenario: 移动端首页加载
- **WHEN** 用户在移动端打开首页
- **THEN** 橙色状态栏正常显示（当前已正常）

## Technical Notes
- localStorage 跨设备同步需要后端支持
- Web 端闪烁可能与 CSS 变量加载时机有关
- 可以尝试在 Web 端使用内联样式避免 CSS 变量延迟加载