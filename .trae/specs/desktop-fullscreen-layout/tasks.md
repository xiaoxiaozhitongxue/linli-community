# 桌面端全屏布局优化 - 实现计划

## [x] Task 1: 修改全局样式 base.css - 移除应用容器宽度限制
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 确保 `#app` 在所有断点下 `max-width: 100%`
  - 移除 `body` 和 `html` 的任何宽度限制
  - 确保 `.app-container` 占满整个宽度
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 检查 CSS 中 `#app` 的 `max-width` 是否为 100%
  - `human-judgment` TR-1.2: 浏览器中查看应用容器是否占满窗口宽度

## [x] Task 2: 修改 App.vue - 确保主内容区域占满可用空间
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 `.app-container` 的样式，移除任何宽度限制
  - 修改 `.main-content` 的样式，确保占满侧边栏以外的空间
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-2.1: 主内容区域是否占满侧边栏右侧的所有空间
  - `human-judgment` TR-2.2: 页面背景是否延伸到窗口边缘

## [x] Task 3: 修改首页 index/index.vue - 移除内容容器过窄限制
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 修改 `.content`、`.page-wrapper`、`.banner-section` 等容器的 `max-width`
  - 在桌面端断点下移除过窄的限制
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 首页内容是否充分利用屏幕宽度
  - `human-judgment` TR-3.2: Banner、快捷入口、活动列表是否正常展开

## [x] Task 4: 修改其他页面布局 - 移除过窄限制
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 修改 ai-helper/index.vue、activities/detail.vue、ai-helper/detail.vue 等页面
  - 确保所有页面内容容器在桌面端充分展开
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-4.1: 各页面内容是否充分利用屏幕宽度

## [x] Task 5: 构建验证
- **Priority**: P0
- **Depends On**: Task 1-4
- **Description**: 
  - 运行 `npm run build` 验证构建是否成功
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: `npm run build` 执行成功，无错误输出

## [x] Task 6: 移动端布局回归测试
- **Priority**: P1
- **Depends On**: Task 1-4
- **Description**: 
  - 在移动端断点下验证布局是否正常
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-6.1: 移动端布局与优化前一致
  - `human-judgment` TR-6.2: 移动端内容居中显示正常
