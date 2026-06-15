# 桌面端布局精修 - 任务列表

## Task 1: 修复活动详情页 fixed 元素
- **Priority**: P0
- **Depends On**: None
- **Files**: `src/pages/activities/detail.vue`

在已有 `@media (min-width: 1024px)` 块中为 `.nav-header`、`.bottom-bar`、`.loading-overlay` 添加 `left: var(--nav-sidebar-width, 220px)`

- [x] 添加 desktop media query 覆盖

## Task 2: 修复任务详情页底部操作栏
- **Priority**: P0
- **Depends On**: None
- **Files**: `src/pages/ai-helper/detail.vue`

添加 `@media (min-width: 1024px)` 块，为 `.bottom-action` 设置 `left: var(--nav-sidebar-width, 220px); right: auto; max-width: 640px; margin: 0 auto`

- [x] 添加 desktop media query 覆盖

## Task 3: 修复发布页面 fixed 元素
- **Priority**: P0
- **Depends On**: None
- **Files**: `src/pages/post/create.vue`

添加 `@media (min-width: 1024px)` 块，为 `.nav-header`、`.bottom-bar`、`.modal-overlay` 设置 `left: var(--nav-sidebar-width, 220px)`

- [x] 添加 desktop media query 覆盖

## Task 4: 修复首页刷新指示器
- **Priority**: P0
- **Depends On**: None
- **Files**: `src/pages/index/index.vue`

在已有 `@media (min-width: 1024px)` 块中添加 `.refresh-indicator { left: var(--nav-sidebar-width, 220px); }`

- [x] 添加 desktop media query 覆盖

## Task 5: 优化 SideNav 视觉风格
- **Priority**: P1
- **Depends On**: None
- **Files**: `src/components/SideNav.vue`

增强材质感和精致度：
- 品牌区域增加底部渐变装饰线
- 导航项 hover 时显示左侧渐变指示条
- 激活项背景使用更柔和的渐变
- 用户信息区域增加微妙的上边框渐变

- [x] 更新 SideNav 样式

## Task 6: 构建验证
- **Priority**: P0
- **Depends On**: Task 1-5

运行 `npm run build` 验证无编译错误。

- [x] 构建成功