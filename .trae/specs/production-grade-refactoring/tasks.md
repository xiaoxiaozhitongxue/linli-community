# 生产级全面重构与优化 - 任务清单

## Task 1: 创建基础架构文件
- [x] 1.1 创建 `src/types/models.ts` — 导出应用所有数据模型的类型定义
- [x] 1.2 创建 `src/types/api.ts` — 导出 API 请求/响应的类型定义
- [x] 1.3 创建 `src/types/store.ts` — 导出 store 相关的类型定义
- [x] 1.4 创建 `src/services/authService.ts` — 登录/注册/退出 API 封装
- [x] 1.5 创建 `src/services/postService.ts` — 帖子相关 API 封装
- [x] 1.6 创建 `src/services/activityService.ts` — 活动相关 API 封装
- [x] 1.7 创建 `src/services/taskService.ts` — 任务相关 API 封装
- [x] 1.8 创建 `src/services/healthService.ts` — 健康打卡相关 API 封装
- [x] 1.9 创建 `src/composables/useAuth.ts` — 认证状态 composable
- [x] 1.10 创建 `src/composables/usePosts.ts` — 帖子列表/点赞/评论 composable
- [x] 1.11 创建 `src/composables/useLocation.ts` — 定位 composable
- [x] 1.12 创建 `src/composables/useTasks.ts` — 任务列表 composable

**依赖**: 无
**并行**: Task 1.1-1.3 可并行；Task 1.4-1.8 可并行；Task 1.9-1.12 可并行

## Task 2: 修复 CSS 设计系统并创建通用组件
- [x] 2.1 修复 `base.css` — 补充缺失的 CSS 变量（`--zindex-toast`, `--toast-bg`, `--success-gradient`, `--error-gradient`, `--info-gradient`, `--shadow-toast`, `--spacing-xxl` 等）
- [x] 2.2 更新 `base.css` — 引入 Noto Serif SC 字体，定义标题字体变量
- [x] 2.3 创建 `src/components/SkeletonLoader.vue` — 通用骨架屏组件（支持卡片、列表、头像等多种形态）
- [x] 2.4 创建 `src/components/EmptyState.vue` — 通用空状态组件（支持 icon、title、desc、action）
- [x] 2.5 创建 `src/components/ErrorBoundary.vue` — 通用错误边界组件（支持重试按钮）
- [x] 2.6 创建 `src/components/PageHeader.vue` — 通用页面头部组件（标题 + 返回按钮 + 右侧操作）
- [x] 2.7 重构 `Toast.vue` — 修复 CSS 变量引用，统一使用 `base.css` 定义的变量

**依赖**: Task 1（类型定义可作为参考）
**并行**: Task 2.1-2.2 需串行；Task 2.3-2.7 可并行

## Task 3: 重构 Store 和 Utils 层
- [x] 3.1 重构 `src/store/index.ts` — 合并 `storage.ts` 功能，增强类型安全，移除冗余方法
- [x] 3.2 精简 `src/utils/storage.ts` — 将其功能合并到 store，然后删除此文件
- [x] 3.3 精简 `src/utils/api.ts` — 使其仅保留类型定义和旧版兼容导出，核心逻辑迁移到 services
- [x] 3.4 增强 `src/utils/request.ts` — 添加请求去重、超时控制、重试逻辑
- [x] 3.5 精简 `src/utils/router.ts` — 清理冗余代码，统一导航方法
- [x] 3.6 精简 `src/utils/ui.ts` — 移除 `showModal` 中的重复样式，使用 CSS 变量
- [x] 3.7 删除 `src/utils/account.ts` — 未使用的文件
- [x] 3.8 删除 `src/static/.gitkeep` — 空占位文件
- [x] 3.9 删除 `src/pages.json` — uni-app 遗留文件

**依赖**: Task 2
**并行**: Task 3.1 需先于 3.2；其余可并行

## Task 4: 重构 App.vue 和路由配置
- [x] 4.1 重构 `src/App.vue` — 清理调试日志，优化布局逻辑
- [x] 4.2 清理 `src/main.ts` — 移除 `pages.json` 引用（如存在），确保路由配置正确
- [x] 4.3 检查 `src/main.ts` 路由 — 将 `health/index`, `elderly/index`, `business/index`, `register/index`, `activities/index`, `search/index` 等页面补全到路由表
- [x] 4.4 添加 404 路由 — 捕获未匹配路由并显示友好的 404 页面

**依赖**: Task 3
**并行**: 无（串行执行）

## Task 5: 重构首页 (index/index.vue)
- [x] 5.1 使用 `usePosts` composable 替换内联帖子逻辑
- [x] 5.2 使用 `useLocation` composable 替换内联定位逻辑
- [x] 5.3 提取评论弹窗为独立组件或使用 composable
- [x] 5.4 使用 `EmptyState` / `SkeletonLoader` 组件替换内联状态
- [x] 5.5 优化 Banner 轮播动画性能（使用 CSS transform 替代 position 动画）
- [x] 5.6 清理所有的 `console.log`
- [x] 5.7 移除硬编码的占位图，使用纯 CSS 占位

**依赖**: Task 1, Task 2, Task 4
**并行**: 无

## Task 6: 重构登录/注册页 (login/index.vue)
- [x] 6.1 使用 `authService` 替换直接调用 API
- [x] 6.2 清理 `console.log` 和调试代码
- [x] 6.3 提取表单验证逻辑为独立的验证函数
- [x] 6.4 优化表单提交后的跳转体验（移除 `window.location.reload()`）

**依赖**: Task 1, Task 2
**并行**: 与 Task 7, 8, 9, 10, 11 可并行

## Task 7: 重构活动页 (activities/index.vue, create.vue, detail.vue)
- [x] 7.1 `index.vue` — 使用 `activityService` 替换内联 API 调用
- [x] 7.2 `detail.vue` — 使用 `activityService` 替换内联 API 调用
- [x] 7.3 `create.vue` — 使用 `activityService` 替换内联 API 调用
- [x] 7.4 三个页面均使用 `EmptyState` / `SkeletonLoader` 替换内联状态
- [x] 7.5 清理所有 `console.log`

**依赖**: Task 1, Task 2
**并行**: 与 Task 6, 8, 9, 10, 11 可并行

## Task 8: 重构互助任务页 (ai-helper/index.vue, detail.vue, publish.vue)
- [x] 8.1 `index.vue` — 使用 `useTasks` composable 和 `taskService` 替换内联逻辑
- [x] 8.2 `detail.vue` — 使用 `taskService` 替换内联 API 调用，优化状态映射
- [x] 8.3 `publish.vue` — 使用 `taskService` 替换内联 API 调用
- [x] 8.4 三个页面均使用 `EmptyState` / `SkeletonLoader` 替换内联状态
- [x] 8.5 清理所有 `console.log`

**依赖**: Task 1, Task 2
**并行**: 与 Task 6, 7, 9, 10, 11 可并行

## Task 9: 重构个人中心页 (profile/index.vue + 子页面)
- [x] 9.1 `index.vue` — 使用 `authService` 和 `taskService` 替换内联 API 调用
- [x] 9.2 `edit.vue` — 优化表单验证和保存逻辑
- [x] 9.3 `my-tasks.vue` — 使用 `taskService` 替换内联 API 调用
- [x] 9.4 `my-posts.vue` / `my-activities.vue` / `my-favorites.vue` — 使用对应 service
- [x] 9.5 `notifications.vue` / `settings.vue` / `privacy.vue` / `about.vue` — 确保页面内容完整
- [x] 9.6 所有子页面使用 `EmptyState` / `SkeletonLoader`
- [x] 9.7 清理所有 `console.log`

**依赖**: Task 1, Task 2
**并行**: 与 Task 6, 7, 8, 10, 11 可并行

## Task 10: 重构健康打卡页 (health/index.vue)
- [x] 10.1 使用 `healthService` 替换内联 API 调用
- [x] 10.2 使用 `SkeletonLoader` 替换内联加载状态
- [x] 10.3 优化打卡成功后 UI 反馈
- [x] 10.4 清理所有 `console.log`

**依赖**: Task 1, Task 2
**并行**: 与 Task 6, 7, 8, 9, 11 可并行

## Task 11: 重构消息页、发布页和其他页面
- [x] 11.1 `messages/index.vue` — 确保消息列表正常加载，优化空状态
- [x] 11.2 `messages/chat.vue` — 优化聊天界面交互
- [x] 11.3 `messages/group.vue` — 确保群聊页面功能完整
- [x] 11.4 `post/create.vue` — 使用 `postService` 替换内联 API 调用
- [x] 11.5 `search/index.vue` — 搜索功能完整实现
- [x] 11.6 `elderly/index.vue` — 完善页面内容
- [x] 11.7 `business/index.vue` — 完善页面内容
- [x] 11.8 所有页面清理 `console.log`

**依赖**: Task 1, Task 2
**并行**: 与 Task 6, 7, 8, 9, 10 可并行

## Task 12: 构建验证和最终检查
- [x] 12.1 运行 `npm run build` — 确保零错误构建
- [x] 12.2 检查构建产物 — 确认 `dist/` 目录完整
- [x] 12.3 检查页面路由 — 手动验证所有路由可访问
- [x] 12.4 检查响应式 — 在 320px / 768px / 1024px / 1440px 宽度下检查布局
- [x] 12.5 最终代码审查 — 确认无 `any` 类型、无 `console.log`、无死代码

**依赖**: Task 4, 5, 6, 7, 8, 9, 10, 11

## 任务依赖关系
- Task 1, 2 → Task 3 → Task 4 → Task 5 → Task 12
- Task 1, 2 → Task 6, 7, 8, 9, 10, 11 → Task 12
- Task 6, 7, 8, 9, 10, 11 之间可并行
