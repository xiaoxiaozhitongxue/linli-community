# 邻里社区APP - 健康打卡增强和发布控件功能任务清单

## 任务列表

### [x] 任务 1：实现健康打卡自动记录活跃状态功能
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 创建用户活跃状态监控机制
  - 在App.vue或main.ts中添加活跃状态检测逻辑
  - 用户打开应用时自动记录最后活跃时间
  - 将活跃状态保存到localStorage
- **Test Requirements**:
  - `programmatic`: 用户打开应用时localStorage中lastActiveTime字段自动更新
  - `human-judgement`: 检查控制台日志确认活跃状态已记录

### [x] 任务 2：实现未打卡通知功能
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 创建通知检查逻辑：检测用户是否超过24小时未打卡
  - 实现通知发送函数（模拟通知或console通知）
  - 在应用启动时执行检查
  - 通知内容：提醒物业或紧急联系人关注该用户
- **Test Requirements**:
  - `programmatic`: 超过24小时未打卡时触发通知检查
  - `human-judgement`: 检查控制台输出确认通知逻辑执行

### [ ] 任务 3：简化健康打卡页面UI
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 创建通知检查逻辑：检测用户是否超过24小时未打卡
  - 实现通知发送函数（模拟通知或console通知）
  - 在应用启动时执行检查
  - 通知内容：提醒物业或紧急联系人关注该用户
- **Test Requirements**:
  - `programmatic`: 超过24小时未打卡时触发通知检查
  - `human-judgement`: 检查控制台输出确认通知逻辑执行

### [x] 任务 3：简化健康打卡页面UI
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修改src/pages/health/index.vue
  - 仅保留绿色打卡按钮
  - 仅保留打卡汇总统计（连续打卡天数、累计打卡次数）
  - 移除复杂的历史记录等功能
  - 确保界面简洁清晰
- **Test Requirements**:
  - `human-judgement`: 健康打卡页面仅显示打卡按钮和统计信息

### [x] 任务 4：在首页添加活动展示区域
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修改src/pages/index/index.vue
  - 添加活动展示区域
  - 展示最近的活动信息（可使用模拟数据）
  - 活动卡片设计
- **Test Requirements**:
  - `human-judgement`: 首页显示活动入口和最近活动列表

### [x] 任务 5：创建悬浮发布控件组件
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 创建src/components/FloatingPublishButton.vue组件
  - 设计悬浮在右下角的样式
  - 添加点击展开功能
  - 显示三个选项：发布动态、发布活动、发布互助
- **Test Requirements**:
  - `human-judgement`: 悬浮按钮在首页和互助页面显示，样式美观

### [x] 任务 6：将发布控件集成到指定页面
- **Priority**: P0
- **Depends On**: 任务5
- **Description**:
  - 在App.vue中全局控制发布控件的显示
  - 仅在首页和互助页面显示
  - 实现发布选项的跳转逻辑
- **Test Requirements**:
  - `human-judgement`: 发布控件仅在首页和互助页面显示

### [x] 任务 7：完整构建测试
- **Priority**: P0
- **Depends On**: 任务1-6
- **Description**:
  - 运行npm run build确保无错误
  - 测试所有新功能
  - 修复发现的问题
- **Test Requirements**:
  - `programmatic`: npm run build成功
  - `human-judgement`: 所有功能正常运行

## 任务依赖关系
- 任务2依赖任务1（需要活跃状态检测逻辑）
- 任务6依赖任务5（需要先创建发布控件组件）

## 实施顺序
1. 先完成任务1（健康打卡自动记录）
2. 完成任务2（未打卡通知）
3. 完成任务3（简化健康打卡UI）
4. 完成任务4（首页活动展示）
5. 完成任务5（创建发布控件）
6. 完成任务6（集成发布控件）
7. 完成任务7（构建测试）
