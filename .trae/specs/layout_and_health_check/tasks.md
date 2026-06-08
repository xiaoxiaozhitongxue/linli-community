# 邻里社区APP - UI布局重构和健康打卡功能任务清单

## [x] 任务 1：重构底部导航栏
- **Priority**：P0
- **Depends On**：None
- **Description**：
  - 修改BottomTabBar.vue，去掉邻里、创业入口
  - 保留首页、互助、消息、我的4个入口
  - 更新对应的导航逻辑
- **Acceptance Criteria Addressed**：AC-2
- **Test Requirements**：
  - 人工检查：底部导航显示正确

## [x] 任务 2：优化首页快捷入口
- **Priority**：P0
- **Depends On**：None
- **Description**：
  - 修改首页index.vue
  - 去掉社区客厅、互助、创业、老人关怀快捷入口
  - 简化首页内容，保留轮播图、动态feed、活动推荐
  - 添加健康打卡快捷入口
- **Acceptance Criteria Addressed**：AC-2
- **Test Requirements**：
  - 人工检查：首页布局正确

## [x] 任务 3：恢复和完善消息页面
- **Priority**：P0
- **Depends On**：任务1
- **Description**：
  - 确保消息页面完整显示
  - 设计消息通知聚合逻辑
  - 确保路由跳转正常
- **Acceptance Criteria Addressed**：AC-5
- **Test Requirements**：
  - 功能测试：消息页面正常显示

## [x] 任务 4：开发健康打卡功能
- **Priority**：P0
- **Depends On**：None
- **Description**：
  - 创建健康打卡页面
  - 实现健康记录功能
  - 简单易用的界面设计
  - 数据持久化到localStorage
- **Acceptance Criteria Addressed**：AC-3
- **Test Requirements**：
  - 功能测试：健康打卡功能正常

## [x] 任务 5：调整AI互助改为互助
- **Priority**：P0
- **Depends On**：任务1
- **Description**：
  - 修改所有出现"AI互助"的地方，改为"互助"
  - 更新导航栏、页面标题等
- **Acceptance Criteria Addressed**：AC-2
- **Test Requirements**：
  - 人工检查：所有文字已更新

## [x] 任务 6：屏蔽创业板块
- **Priority**：P0
- **Depends On**：None
- **Description**：
  - 从路由中隐藏或移除创业相关路由
  - 确保用户无法访问创业页面
  - 注释或隐藏相关功能代码
- **Acceptance Criteria Addressed**：AC-4
- **Test Requirements**：
  - 功能测试：无法访问创业功能

## [x] 任务 7：修复页面显示和分享问题
- **Priority**：P0
- **Depends On**：任务1-6
- **Description**：
  - 检查并修复页面显示不全问题
  - 优化响应式布局
  - 确保链接分享可以正常访问
- **Acceptance Criteria Addressed**：AC-1
- **Test Requirements**：
  - 人工检查：页面显示完整

## [x] 任务 8：完整构建和部署
- **Priority**：P0
- **Depends On**：所有前面的任务
- **Description**：
  - 运行npm run build确保无错误
  - 部署到Cloudflare Pages
- **Acceptance Criteria Addressed**：AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**：
  - 构建测试：npm run build 无错误
