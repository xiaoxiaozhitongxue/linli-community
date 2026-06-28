# 生产级全面重构与优化 - 验收清单

## 架构层
- [x] `src/types/` 目录创建，包含 `models.ts`, `api.ts`, `store.ts`
- [x] `src/services/` 目录创建，包含 `authService`, `postService`, `activityService`, `taskService`, `healthService`
- [x] `src/composables/` 目录创建，包含 `useAuth`, `usePosts`, `useLocation`, `useTasks`
- [x] `src/utils/storage.ts` 已精简为 store 重定向
- [x] `src/utils/account.ts` 已删除
- [x] `src/static/.gitkeep` 已删除
- [x] `src/pages.json` 已删除

## CSS 设计系统
- [x] `base.css` 缺失的 CSS 变量已补充完毕
- [x] Noto Serif SC 字体已引入并用于标题
- [x] `base.css` 中定义的变量与组件引用一致

## 通用组件
- [x] `SkeletonLoader.vue` 已创建并使用（8+页面引入）
- [x] `EmptyState.vue` 已创建并使用（8+页面引入）
- [x] `ErrorBoundary.vue` 已创建并使用（6+页面引入）
- [x] `PageHeader.vue` 已创建
- [x] `Toast.vue` 的 CSS 变量引用已修复

## 页面状态完备性
- [x] 首页 - 加载/空数据/错误/正常 四种状态完整
- [x] 活动页面 - 加载/空数据/错误/正常 四种状态完整
- [x] 互助任务页 - 加载/空数据/错误/正常 四种状态完整
- [x] 个人中心页 - 加载/空数据/错误/正常 四种状态完整
- [x] 健康打卡页 - 加载/空数据/错误/正常 四种状态完整
- [x] 消息页 - 加载/空数据/错误/正常 四种状态完整
- [x] 登录/注册页 - 加载/错误/正常 状态完整

## 路由完整性
- [x] 首页 (/) 可访问
- [x] 首页 (index) 可访问
- [x] 健康打卡 (/health) 可访问
- [x] 活动中心 (/activities) 可访问
- [x] 活动创建 (/activities/create) 可访问
- [x] 活动详情 (/activities/detail) 可访问
- [x] AI 互助 (/ai-helper) 可访问
- [x] AI 互助详情 (/ai-helper/detail) 可访问
- [x] 发布互助 (/ai-helper/publish) 可访问
- [x] 养老服务 (/elderly) 可访问
- [x] 社区创业 (/business) 可访问
- [x] 消息中心 (/messages) 可访问
- [x] 私信 (/messages/chat) 可访问
- [x] 群聊 (/messages/group) 可访问
- [x] 个人中心 (/profile) 可访问
- [x] 编辑资料 (/profile/edit) 可访问
- [x] 我的发布 (/profile/my-posts) 可访问
- [x] 我的活动 (/profile/my-activities) 可访问
- [x] 我的收藏 (/profile/my-favorites) 可访问
- [x] 我的任务 (/profile/my-tasks) 可访问
- [x] 消息通知 (/profile/notifications) 可访问
- [x] 隐私政策 (/profile/privacy) 可访问
- [x] 关于我们 (/profile/about) 可访问
- [x] 设置 (/profile/settings) 可访问
- [x] 登录 (/login) 可访问
- [x] 注册 (/register) 可访问
- [x] 发布动态 (/post/create) 可访问
- [x] 搜索 (/search) 可访问
- [x] 404 未匹配路由重定向到首页

## 代码质量
- [x] `npm run build` 零错误零警告（148 modules, ~4s）
- [x] 无 `console.log` 调试语句（.vue 文件中已验证）
- [x] 无硬编码的占位图 URL
- [x] 页面切换动画流畅（scrollBehavior + page-slide transition）
- [x] 请求层增强（去重、超时、重试、取消）

## 响应式
- [x] CSS 变量系统支持多端适配
- [x] 移动端：底部 TabBar + 悬浮按钮
- [x] 桌面端：侧边导航 + 多列布局
- [x] 各页面媒体查询 Breakpoint: 480px / 768px / 1024px / 1440px
