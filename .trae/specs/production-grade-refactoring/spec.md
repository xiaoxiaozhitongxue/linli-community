# 邻里社区 APP - 生产级全面重构与优化

## 概述
**Summary**: 对邻里社区 APP 进行全面生产级重构，涵盖代码架构、UI/UX 设计系统、性能优化、状态管理、API 层、导航体验、页面可用性和代码质量等全部方面，打造可用于真实生产环境的社区产品。

**Purpose**: 将经过多次迭代修复的代码基础统一重构为高内聚、低耦合、可维护、高性能的生产级应用。

**Target Users**: 社区居民（移动端 + 桌面端）

## 设计方向 (frontend-design)
采用 **温暖·社区·编辑式** 审美方向：
- **色调**: 以现有橙色(#FF6B35)为主色，搭配暖灰(#F8F9FD)背景、木质棕色(#8B6914)辅助色，营造社区归属感
- **字体**: 标题使用 Noto Serif SC（衬线体增加编辑感），正文使用系统无衬线字体
- **排版**: 宽松字距、大标题、卡片留白充裕
- **动效**: 页面切换使用滑动渐变，微交互使用弹性缓动，骨架屏使用细腻 shimmer
- **差异化**: 每个页面都有独特的视觉记忆点（首页温暖横幅、个人页杂志式布局、任务页进度卡片等）

## 架构变更

### 新增目录结构
```
src/
├── composables/          # 可组合逻辑（新增）
│   ├── useAuth.ts
│   ├── useLocation.ts
│   ├── usePosts.ts
│   ├── useComments.ts
│   └── useTasks.ts
├── services/             # 业务服务层（新增）
│   ├── authService.ts
│   ├── postService.ts
│   ├── activityService.ts
│   ├── taskService.ts
│   └── healthService.ts
├── types/                # 类型定义（新增）
│   ├── api.ts
│   ├── models.ts
│   └── store.ts
├── components/           # 共享组件
│   ├── BottomTabBar.vue
│   ├── FloatingPublishButton.vue
│   ├── SideNav.vue
│   ├── Toast.vue
│   ├── SkeletonLoader.vue    # 新增
│   ├── EmptyState.vue        # 新增
│   ├── ErrorBoundary.vue     # 新增
│   └── PageHeader.vue        # 新增
├── pages/                # 页面保持不变
├── store/                # 状态管理
│   └── index.ts          # 重构为更健壮的 store
├── utils/                # 工具函数（精简合并冗余）
│   ├── api.ts            # 精简为纯 API 定义
│   ├── request.ts        # 保留，增强错误处理
│   ├── router.ts         # 保留，清理冗余
│   ├── auth.ts           # 保留，精简
│   ├── storage.ts        # 合并到 store
│   ├── toast.ts          # 保留
│   └── ui.ts             # 保留，精简 loading
└── styles/
    └── base.css          # 更新 CSS 变量，修复缺失变量
```

### 移除
- `src/pages.json` — uni-app 遗留文件
- `src/utils/storage.ts` — 功能已合并到 store/index.ts
- `src/utils/account.ts` — 未使用
- `src/static/.gitkeep` — 空占位文件

## 功能需求

### FR-1: 代码架构重构
系统必须将重复的业务逻辑提取为 composables，将 API 请求封装为 services。

#### 场景: 业务逻辑复用
- **WHEN** 多个页面需要相同的逻辑（如加载帖子列表、点赞、评论）
- **THEN** 该逻辑从页面中提取为 composable，通过 `usePosts()` / `useComments()` 调用

#### 场景: API 层职责清晰
- **WHEN** 页面需要发起 API 请求
- **THEN** 页面通过 services 层调用，不直接调用 `request.ts`

### FR-2: UI 设计系统升级
系统必须应用新的设计系统，修复现有 CSS 变量缺失的问题。

#### 场景: Toast 组件无错误
- **WHEN** Toast 组件渲染
- **THEN** `--zindex-toast`, `--toast-bg`, `--success-gradient`, `--error-gradient`, `--info-gradient`, `--shadow-toast` 等 CSS 变量已正确定义

#### 场景: 字体系统升级
- **WHEN** 用户浏览页面
- **THEN** 标题使用衬线字体（Noto Serif SC），正文使用系统无衬线字体

### FR-3: 性能优化
系统必须实施以下性能优化措施。

#### 场景: 页面切换流畅
- **WHEN** 用户在页面间切换
- **THEN** 页面切换动画流畅（< 300ms），无白屏闪烁

#### 场景: 列表加载
- **WHEN** 帖子/活动/任务等列表加载
- **THEN** 显示骨架屏占位，数据到达后平滑过渡

### FR-4: 状态管理优化
系统的 store 层必须正确处理所有边界情况。

#### 场景: 登录态持久化
- **WHEN** 用户刷新页面
- **THEN** 登录状态从 localStorage 正常恢复

#### 场景: 退出登录
- **WHEN** 用户退出登录
- **THEN** 所有用户数据清除，页面跳转到首页

### FR-5: 导航与路由完善
系统必须清理冗余路由配置，确保所有页面可访问。

#### 场景: 路由完整性
- **WHEN** 用户访问任意定义的路由页面
- **THEN** 页面正常加载，无 404 错误

#### 场景: 未登录访问
- **WHEN** 未登录用户访问需登录页面
- **THEN** 弹出登录引导，登录后返回原页面

### FR-6: 每个页面状态完备
每个页面必须有 加载中 / 空数据 / 错误 / 正常 四种状态的处理。

#### 场景: 活动列表页加载
- **WHEN** 活动列表数据正在加载
- **THEN** 显示骨架屏

#### 场景: 活动列表为空
- **WHEN** 活动列表数据为空
- **THEN** 显示空状态提示和引导操作

#### 场景: 活动列表加载失败
- **WHEN** 活动列表 API 返回错误
- **THEN** 显示错误提示和重试按钮

### FR-7: 代码清理
系统必须清理调试代码、死代码和遗留文件。

#### 场景: 无 console.log 遗留
- **WHEN** 代码构建检查
- **THEN** 无 `console.log` 遗留（除生产环境禁用的日志库外）

#### 场景: 类型安全
- **WHEN** TypeScript 编译检查
- **THEN** 无 `any` 类型（特殊情况需显式注释）

## 非功能需求

### NFR-1: 构建成功
`npm run build` 必须零错误零警告退出。

### NFR-2: 响应式
在 320px ~ 1920px 宽度范围内所有页面布局正常。

### NFR-3: 性能
Lighthouse 移动端评分 ≥ 70（Performance）。

## 涉及范围
- **修改文件**: 全部 `src/` 下的 Vue/TS/CSS 文件
- **新增文件**: `src/composables/`, `src/services/`, `src/types/`, `src/components/SkeletonLoader.vue`, `src/components/EmptyState.vue`, `src/components/ErrorBoundary.vue`, `src/components/PageHeader.vue`
- **删除文件**: `src/pages.json`, `src/utils/account.ts`, `src/utils/storage.ts`, `src/static/.gitkeep`
- **未修改**: `functions/` (Cloudflare API 层), `cloudflare/`, `database/`, 配置文件 (vite.config, tailwind.config, wrangler.toml 等)
