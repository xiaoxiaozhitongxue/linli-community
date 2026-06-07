# 邻里社区APP - 简化版AI互助平台任务清单

## [x] 任务 1: 简化底部导航栏
- **Priority**: P0
- **Depends On**: 无
- **Description**: 
  - 修改 `src/components/BottomTabBar.vue`
  - 只保留「AI互助」「消息」「我的」三个入口
  - 重新设计图标和样式
  - 更新路由配置
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` 导航栏显示正确，3个入口
  - `programmatic` 路由正确配置

## [ ] 任务 2: 完善AI互助功能
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**: 
  - 优化 `src/pages/ai-helper/index.vue` 页面
  - 优化任务发布流程
  - 完善任务列表展示
  - 添加更多交互细节
  - 优化UI设计
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgement` 页面美观，功能完整
  - `programmatic` 构建成功

## [ ] 任务 3: 创建消息列表页面
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**: 
  - 创建 `src/pages/messages/index.vue`
  - 实现消息列表（私信+群聊）
  - 未读消息标记
  - 消息类型分类展示
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` 消息列表显示正确
  - `programmatic` 构建成功

## [x] 任务 4: 创建私信聊天页面
- **Priority**: P0
- **Depends On**: 任务 3
- **Description**: 
  - 创建 `src/pages/messages/chat.vue`
  - 实现一对一聊天界面
  - 消息发送和接收
  - 聊天记录展示
  - 使用localStorage存储聊天记录
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` 聊天功能完整
  - `programmatic` 构建成功

## [ ] 任务 5: 创建群聊页面
- **Priority**: P0
- **Depends On**: 任务 3
- **Description**: 
  - 创建 `src/pages/messages/group.vue`
  - 实现群聊界面
  - 群成员列表
  - 群消息展示
  - 群通知
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgement` 群聊功能完整
  - `programmatic` 构建成功

## [ ] 任务 6: 完善个人中心
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**: 
  - 优化 `src/pages/profile/index.vue`
  - 简化个人中心内容
  - 完善我的任务展示
  - 添加消息通知设置入口
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgement` 个人中心功能完整
  - `programmatic` 构建成功

## [ ] 任务 7: 屏蔽其他功能入口
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**: 
  - 修改被屏蔽页面的路由
  - 添加路由守卫，重定向到AI互助页面
  - 在被屏蔽页面添加"功能暂未开放"提示
  - 保留代码，只是屏蔽入口
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` 直接访问被屏蔽URL会重定向

## [x] 任务 8: 添加Mock消息数据
- **Priority**: P1
- **Depends On**: 任务 3, 4, 5
- **Description**: 
  - 在 `src/utils/api.ts` 添加消息相关Mock数据
  - 添加私信会话Mock数据
  - 添加群聊Mock数据
  - 消息通知Mock数据
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` Mock数据完整

## [ ] 任务 9: 更新App.vue路由守卫
- **Priority**: P0
- **Depends On**: 任务 7
- **Description**: 
  - 修改 `src/App.vue`
  - 添加路由守卫逻辑
  - 处理被屏蔽页面的重定向
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` 路由守卫正常工作

## [x] 任务 10: 完整构建和测试
- **Priority**: P0
- **Depends On**: 任务 1-9
- **Description**: 
  - 运行完整构建测试
  - 检查所有页面
  - 验证所有功能
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` npm run build 无错误

## [x] 任务 11: 部署到Cloudflare Pages
- **Priority**: P0
- **Depends On**: 任务 10
- **Description**: 
  - 构建项目
  - 复制functions到dist目录
  - 部署到Cloudflare Pages
- **Acceptance Criteria Addressed**: 所有AC
- **Test Requirements**:
  - `programmatic` 部署成功，公网可访问
