# 桌面端布局精修

## Why
上次优化引入左侧导航栏后，部分详情页面的 `position: fixed` 元素（顶部导航、底部操作栏、遮罩层）未适配侧边栏宽度，导致在桌面端显示时与侧边栏重叠或位置偏移。另外 SideNav 视觉风格朴素，需要提升精致度。

## What Changes
- 修复 3 个详情/发布页面的 fixed 定位元素，使其在桌面端正确偏移侧边栏宽度
- 修复首页刷新指示器的桌面端偏移
- 优化 SideNav 视觉风格（材质、间距、hover 动效）
- 清理 base.css 中冗余的弹性布局代码

## Impact
- Affected specs: web-layout-responsive-optimization
- Affected code: 3 个页面组件 + 1 个导航组件 + 1 个样式文件

## ADDED Requirements

### Requirement: Fixed 元素桌面端偏移
所有 `position: fixed; left: 0` 的元素在桌面端（>=1024px）必须设置 `left: var(--nav-sidebar-width, 220px)`

#### Scenario: 活动详情页导航
- **WHEN** 桌面端打开活动详情页
- **THEN** `.nav-header` 在侧边栏右侧显示，不与侧边栏重叠

#### Scenario: 发布页面底部栏
- **WHEN** 桌面端打开发布页面
- **THEN** `.bottom-bar` 在侧边栏右侧显示

### Requirement: SideNav 视觉精致化
侧边栏应具备：
- 更精致的 hover 过渡效果
- 激活项更明显的视觉反馈
- 合适的品牌区域间距

#### Scenario: SideNav hover 效果
- **WHEN** 鼠标悬停在导航项上
- **THEN** 背景色平滑过渡，左侧出现渐变指示线