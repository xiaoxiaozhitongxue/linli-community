# 🏘️ 邻里社区APP

> 连接邻里，共建美好社区 - 打造本地化社区互助与服务平台

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-yellowgreen)](https://pages.cloudflare.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-brightgreen)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-blue)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-orange)](LICENSE)

## 📖 项目介绍

邻里社区（Linli Community）是一款连接城市社区居民的本地化社交与互助平台，基于 **Vue 3 + Vite + TypeScript** 开发，部署在 **Cloudflare Pages** 上，提供高性能和低成本的服务。

### 核心价值

- 🏠 **本地化社交** - 连接社区邻居，重建邻里关系
- 🤝 **AI劳动撮合** - 帮助取快递、顺便带菜、临时接孩子等日常小事
- 👴 **老人关怀帮扶** - 邻里志愿者定期探访、帮忙买菜、陪诊
- 🏪 **社区创业孵化** - 帮助居民把兴趣/技能变成小生意

## ✨ 核心功能

### 🏠 首页
- 社区动态信息流
- 轮播图展示社区公告
- 快捷入口导航（活动、互助、老人关怀、社区创业）
- 热门活动卡片列表
- 邻里动态feed流
- 悬浮发布按钮（发布动态/任务/活动）

### 🤝 互助广场
- 任务筛选（全部、待接单、进行中、已完成）
- 任务卡片列表展示
- 快速发布任务
- AI智能匹配邻居
- 我的任务管理
- 任务详情查看与接单

### 📢 活动中心
- 活动列表展示
- 活动筛选
- 活动详情查看
- 活动报名/取消报名
- 创建活动
- 参与人员管理

### 💬 消息中心
- 任务通知、私信、群聊三个标签页
- 消息列表展示
- 未读计数
- 未登录状态友好提示
- 聊天界面

### 👤 个人中心
- 个人信息管理
- 我的发布（动态、活动、任务）
- 我的收藏
- 消息通知
- 编辑资料
- 设置与帮助

### 🔐 用户系统
- 手机号验证码登录
- 新用户注册
- 登录状态管理
- 未登录功能限制

### 🔍 搜索页面
- 搜索功能
- 搜索历史
- 热门搜索推荐

### 👴 老人关怀
- 紧急求助
- 快捷服务菜单
- 帮买菜、陪诊服务入口
- 志愿者招募

### 🏪 社区创业
- 商家列表展示
- 商品展示

### 💪 健康打卡
- 健康打卡功能
- 打卡记录展示

## 🛠️ 技术栈

| 类别 | 技术选型 |
|------|---------|
| **前端框架** | Vue 3 (Composition API) + TypeScript |
| **路由** | Vue Router 4 (Hash模式) |
| **样式** | Tailwind CSS + 自定义CSS变量 |
| **构建工具** | Vite 5 |
| **部署平台** | Cloudflare Pages |
| **边缘函数** | Cloudflare Pages Functions |
| **数据库** | Cloudflare D1 |
| **状态管理** | 原生Vue响应式 + localStorage |

## 📱 页面路由

| 页面名称 | 路由路径 | 功能描述 |
|---------|---------|---------|
| 首页 | `/pages/index/index` | 首页展示、快捷入口 |
| 活动中心 | `/pages/activities/index` | 活动列表 |
| 创建活动 | `/pages/activities/create` | 发布新活动 |
| 活动详情 | `/pages/activities/detail` | 活动详情与报名 |
| 互助广场 | `/pages/ai-helper/index` | 任务列表 |
| 任务详情 | `/pages/ai-helper/detail` | 任务详情与接单 |
| 发布任务 | `/pages/ai-helper/publish` | 发布新任务 |
| 消息中心 | `/pages/messages/index` | 消息列表 |
| 私信聊天 | `/pages/messages/chat` | 私信聊天界面 |
| 群聊 | `/pages/messages/group` | 群聊界面 |
| 个人中心 | `/pages/profile/index` | 用户个人中心 |
| 编辑资料 | `/pages/profile/edit` | 编辑个人信息 |
| 我的发布 | `/pages/profile/my-posts` | 用户发布的动态 |
| 我的活动 | `/pages/profile/my-activities` | 用户的活动 |
| 我的任务 | `/pages/profile/my-tasks` | 用户的任务 |
| 我的收藏 | `/pages/profile/my-favorites` | 用户收藏 |
| 消息通知 | `/pages/profile/notifications` | 通知列表 |
| 设置 | `/pages/profile/settings` | 应用设置 |
| 隐私政策 | `/pages/profile/privacy` | 隐私政策 |
| 关于我们 | `/pages/profile/about` | 关于应用 |
| 登录 | `/pages/login/index` | 用户登录 |
| 注册 | `/pages/register/index` | 用户注册 |
| 发布动态 | `/pages/post/create` | 发布新动态 |
| 搜索 | `/pages/search/index` | 搜索页面 |
| 老人关怀 | `/pages/elderly/index` | 老人关怀服务 |
| 社区创业 | `/pages/business/index` | 社区创业入口 |
| 健康打卡 | `/pages/health/index` | 健康打卡 |

### 底部导航栏
1. **首页** - `/pages/index/index`
2. **互助** - `/pages/ai-helper/index`
3. **消息** - `/pages/messages/index`
4. **我的** - `/pages/profile/index`

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Cloudflare 账号（可选，用于部署）

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 浏览器访问
# 默认: http://localhost:8080
```

### 构建项目

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 环境变量配置

复制 `.env.example` 到 `.env` 并配置相关环境变量。

## ☁️ 部署到 Cloudflare Pages

### 方式一：使用命令行部署（推荐）

```bash
# 1. 安装 wrangler CLI
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 构建并部署
npm run deploy
```

### 方式二：使用 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create application** > **Pages**
3. 选择 **Upload assets**
4. 上传 `dist` 目录
5. 项目名称填写：`linli-community`
6. 点击 **Deploy Site**

### 方式三：自动部署（Git 集成）

项目已配置 GitHub Actions，推送代码到 `main` 分支自动部署。

## 📁 项目结构

```
linli-community/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── index/         # 首页
│   │   ├── activities/    # 活动中心
│   │   ├── ai-helper/     # 互助广场
│   │   ├── elderly/       # 老人关怀
│   │   ├── business/      # 社区创业
│   │   ├── messages/      # 消息中心
│   │   ├── profile/       # 个人中心
│   │   ├── login/         # 登录
│   │   ├── register/      # 注册
│   │   ├── post/          # 发布动态
│   │   ├── search/        # 搜索
│   │   └── health/        # 健康打卡
│   ├── components/        # 公共组件
│   │   ├── BottomTabBar.vue
│   │   ├── FloatingPublishButton.vue
│   │   └── Toast.vue
│   ├── store/             # 状态管理
│   │   └── index.ts
│   ├── styles/            # 全局样式
│   │   └── base.css
│   ├── utils/             # 工具函数
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── request.ts
│   │   ├── router.ts
│   │   ├── toast.ts
│   │   └── ui.ts
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── functions/             # Cloudflare Pages Functions
│   ├── api/              # API端点
│   │   ├── activities/   # 活动API
│   │   ├── auth/         # 认证API
│   │   ├── posts/        # 帖子API
│   │   ├── tasks/        # 任务API
│   │   ├── user/         # 用户API
│   │   └── ...
│   ├── lib/              # 核心库
│   │   ├── db.js
│   │   ├── auth.js
│   │   └── ...
│   └── _middleware.js    # 全局中间件
├── database/             # 数据库相关
│   ├── schema.sql        # 数据库Schema
│   └── README.md
├── public/               # 公共资源
│   └── _redirects        # 重定向配置
├── .github/              # GitHub配置
│   └── workflows/        # GitHub Actions
├── wrangler.toml         # Cloudflare配置
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
├── tailwind.config.js    # Tailwind配置
├── postcss.config.js     # PostCSS配置
├── package.json          # 项目依赖
└── README.md             # 项目文档
```

## 🎨 设计规范

### 颜色系统

```css
--color-primary: #FF6B35;              /* 主色调 - 温暖橙色 */
--color-primary-light: #FF8A5C;        /* 浅橙色 */
--color-primary-dark: #E55A2B;         /* 深橙色 */
--color-primary-soft: rgba(255, 107, 53, 0.1);
--color-primary-gradient: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFA07A 100%);
--color-bg-primary: #F8F9FD;           /* 主背景 */
--color-bg-secondary: #FFFFFF;         /* 次要背景 */
--color-bg-tertiary: #F0F2FA;          /* 第三背景 */
```

### 组件风格

- **圆角**: 12px-16px 大圆角卡片
- **阴影**: 柔和的浅阴影
- **间距**: 8px / 12px / 16px / 24px 间距系统
- **字体**: 系统默认无衬线字体

## 🔌 API 端点

### 基础端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/hello` | GET | 测试API |
| `/api/health` | GET | 健康检查 |
| `/api/test` | GET/POST | 测试接口 |

### 认证

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |

### 用户

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/user/profile` | GET | 获取用户信息 |
| `/api/user/posts` | GET | 用户发布的帖子 |
| `/api/user/activities` | GET | 用户的活动 |
| `/api/user/favorites` | GET | 用户收藏 |
| `/api/users` | GET | 用户列表 |

### 帖子

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/posts` | GET | 获取帖子列表 |
| `/api/posts` | POST | 创建帖子 |
| `/api/posts/[id]` | GET/PUT/DELETE | 帖子详情/更新/删除 |
| `/api/posts/[id]/like` | POST | 点赞帖子 |
| `/api/posts/[id]/comments` | GET/POST | 评论列表/发表评论 |
| `/api/posts/[id]/comments/[commentId]` | DELETE | 删除评论 |

### 任务

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/tasks` | GET | 获取任务列表 |
| `/api/tasks` | POST | 创建任务 |
| `/api/tasks/match` | GET | AI匹配任务 |
| `/api/tasks/my` | GET | 我的任务 |
| `/api/tasks/[id]` | GET/PUT/DELETE | 任务详情/更新/删除 |
| `/api/tasks/[id]/accept` | POST | 接受任务 |
| `/api/tasks/[id]/complete` | POST | 完成任务 |

### 活动

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/activities` | GET | 获取活动列表 |
| `/api/activities` | POST | 创建活动 |
| `/api/activities/[id]` | GET/PUT/DELETE | 活动详情/更新/删除 |
| `/api/activities/[id]/join` | POST | 参加活动 |
| `/api/activities/[id]/leave` | POST | 取消参加 |

详细API文档请查看 `functions/README.md`。

## 🔧 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动本地开发服务器 (localhost:8080) |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run deploy` | 构建并部署到 Cloudflare Pages |

## 📄 相关文档

- [功能清单](./功能清单.md) - 详细功能说明
- [数据库文档](./database/README.md) - 数据库Schema说明
- [Cloudflare Functions](./functions/README.md) - 后端API文档
- [架构文档](./ARCHITECTURE.md) - 技术架构说明
- [部署指南](./DEPLOY.md) - 详细部署指南

## 🗄️ 数据库配置

### Cloudflare D1

项目配置了 Cloudflare D1 数据库，数据表结构请查看 [database/schema.sql](./database/schema.sql)。

```bash
# 创建 D1 数据库
wrangler d1 create linli-community-db

# 执行初始化脚本
wrangler d1 execute linli-community-db --local --file=./database/schema.sql
```

详细说明请查看 [database/README.md](./database/README.md)。

## 📝 开发说明

### 状态管理

项目使用简单的响应式状态管理，主要状态包括：
- 用户登录状态
- 用户信息
- Toast通知

详见 [src/store/index.ts](./src/store/index.ts)。

### API调用

API调用封装在 [src/utils/api.ts](./src/utils/api.ts)，支持：
- Mock模式（开发时使用）
- 真实API调用
- 统一的错误处理

### 路由导航

路由配置在 [src/main.ts](./src/main.ts)，使用 Hash 模式，配合 [_redirects](./public/_redirects) 配置实现正确的路由跳转。

导航工具函数在 [src/utils/router.ts](./src/utils/router.ts)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

---

**连接邻里，共建美好社区** 🏘️❤️
