# 桌面端全屏布局优化 - 产品需求文档

## Overview
- **Summary**: 修复桌面端页面没有铺满整个屏幕的问题，实现真正的全屏响应式布局
- **Purpose**: 用户反馈电脑端页面宽度没有和屏幕一致，内容被限制在中间窄区域，需要优化布局使内容占满可用空间
- **Target Users**: 桌面端浏览器用户

## Goals
- 桌面端（≥1024px）应用整体占满整个浏览器窗口宽度
- 内容区域充分利用可用屏幕空间，不再被过窄的 max-width 限制
- 保持移动端响应式体验不变

## Non-Goals (Out of Scope)
- 不改变移动端布局
- 不修改页面内容结构和组件逻辑
- 不改变功能行为

## Background & Context
- 当前布局在桌面端有多层 `max-width` 限制，导致内容被居中限制在较窄区域
- `#app`、`.app-container`、`.main-content` 和各页面内部容器都有宽度限制
- 用户期望在大屏幕上内容能充分展开

## Functional Requirements
- **FR-1**: 桌面端应用整体宽度为 100% 视口宽度
- **FR-2**: 主内容区域占满侧边栏以外的所有可用空间
- **FR-3**: 页面内部容器移除过窄的 max-width 限制

## Non-Functional Requirements
- **NFR-1**: 不影响移动端和平板端的响应式布局
- **NFR-2**: 保持合理的内容最大宽度（不超过 1400px）以保证阅读体验
- **NFR-3**: 构建无错误

## Constraints
- **Technical**: Vue 3 + Vite 项目，使用 CSS 响应式断点
- **Dependencies**: 已有的组件和页面结构

## Assumptions
- 用户使用现代桌面浏览器（Chrome、Firefox、Safari、Edge）
- 屏幕宽度 ≥ 1024px 时视为桌面端

## Acceptance Criteria

### AC-1: 应用容器占满视口宽度
- **Given**: 浏览器窗口宽度 ≥ 1024px
- **When**: 打开应用首页
- **Then**: `#app` 和 `.app-container` 的宽度为 100% 视口宽度
- **Verification**: `programmatic`

### AC-2: 主内容区域占满可用空间
- **Given**: 浏览器窗口宽度 ≥ 1024px
- **When**: 查看页面布局
- **Then**: `.main-content` 占满侧边栏以外的所有空间
- **Verification**: `human-judgment`

### AC-3: 内容容器移除过窄限制
- **Given**: 浏览器窗口宽度 ≥ 1024px
- **When**: 查看各页面内容
- **Then**: 内容容器不再被限制在 < 1000px 的窄范围内
- **Verification**: `human-judgment`

### AC-4: 移动端布局不受影响
- **Given**: 浏览器窗口宽度 < 1024px
- **When**: 查看页面布局
- **Then**: 布局与优化前保持一致
- **Verification**: `human-judgment`

### AC-5: 构建成功
- **Given**: 代码修改完成
- **When**: 运行 `npm run build`
- **Then**: 构建成功无错误
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要调整其他页面的布局？
