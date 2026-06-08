# 邻里社区APP功能完善优化 - 任务列表

## Task 1: 实现图片预览功能
- **Priority**: P0
- **Depends On**: None
- **Description**: 在首页邻里动态中添加图片预览功能
- **具体工作**:
  - 创建图片预览组件或使用原生实现
  - 实现全屏预览,支持左右滑动切换
  - 添加关闭功能
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment`: 点击图片能正常打开预览,滑动切换流畅,关闭功能正常
- **Notes**: 重点在首页,其他页面如有图片也可以考虑添加

## Task 2: 实现自动定位功能
- **Priority**: P0
- **Depends On**: None
- **Description**: 首页加载时自动获取用户位置
- **具体工作**:
  - 使用浏览器Geolocation API获取位置
  - 添加位置获取成功/失败的处理
  - 更新社区名称显示
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment`: 打开首页时尝试获取位置,有相应反馈
- **Notes**: 注意处理用户拒绝授权的情况

## Task 3: 统一活动数据管理
- **Priority**: P0
- **Depends On**: None
- **Description**: 确保首页和活动页面使用相同的活动数据源
- **具体工作**:
  - 修改首页使用api.ts中的activitiesApi获取数据
  - 确保热门活动和近期活动的筛选逻辑正确
  - 统一活动数据格式
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic`: 首页和活动页面显示的活动数据一致
- **Notes**: 保持现有mock数据,但确保数据来源统一

## Task 4: 检查所有页面按钮功能
- **Priority**: P0
- **Depends On**: None
- **Description**: 全面检查所有页面的按钮功能是否正常
- **具体工作**:
  - 检查首页所有按钮(快捷入口、活动卡片、动态操作等)
  - 检查活动页面所有按钮
  - 检查其他页面的按钮功能
  - 修复发现的问题
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment`: 所有按钮点击都有正确响应
- **Notes**: 重点检查悬浮发布按钮、活动报名按钮等核心功能

## Task 5: 检查所有页面跳转逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**: 全面检查所有页面的跳转逻辑是否正确
- **具体工作**:
  - 检查router.ts中的路由配置
  - 检查所有页面的跳转调用
  - 修复发现的跳转问题
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment`: 所有页面跳转都能正确到达目标页面
- **Notes**: 重点检查底部导航栏和悬浮按钮的跳转

## Task 6: 构建和部署测试
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5
- **Description**: 完成所有功能完善后进行构建和部署测试
- **具体工作**:
  - 运行构建检查是否有错误
  - 本地测试所有功能
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic`: 构建成功,无报错
  - `human-judgment`: 本地测试所有功能正常
- **Notes**: 确保所有修改都正常工作

## Task Dependencies
- Task 6 依赖于前面所有任务完成
- 其他任务之间可以并行执行

## Priority Summary
- **P0**: Task 1, Task 2, Task 3, Task 4, Task 5 - 核心功能完善
- **P1**: Task 6 - 构建测试
