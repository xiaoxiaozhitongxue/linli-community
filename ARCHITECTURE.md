# 🏗️ 邻里社区APP - 架构说明

## 🎯 一句话总结

**前端和后端都部署在 Cloudflare Pages 上！无需单独部署后端服务！**

---

## 📊 完整架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │   前端 (Vue 3 + Vite)│      │  后端 (Pages Functions)│   │
│  ├──────────────────────┤      ├──────────────────────┤   │
│  │  src/pages/          │◄────►│  functions/          │   │
│  │  src/components/     │ API   │    api/             │   │
│  │  src/styles/         │ Calls │      hello.js       │   │
│  │                      │      │      auth/login.js   │   │
│  │  访问: /#/...        │      │      tasks/          │   │
│  │                      │      │        index.js      │   │
│  └──────────────────────┘      └──────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    用户访问: https://linli-community.pages.dev
```

---

## 📁 项目结构详解

```
邻里社区APP/
├── src/                      ← 前端源代码
│   ├── pages/               ← 前端页面
│   │   ├── index/index.vue  ← 首页
│   │   ├── activities/      ← 活动中心
│   │   ├── ai-helper/       ← AI互助
│   │   ├── elderly/         ← 老人关怀
│   │   ├── business/        ← 社区创业
│   │   ├── messages/        ← 消息中心
│   │   ├── profile/         ← 个人中心
│   │   ├── login/           ← 登录页
│   │   └── register/        ← 注册页
│   ├── components/          ← 公共组件
│   ├── store/               ← 状态管理
│   ├── styles/              ← 全局样式
│   ├── utils/               ← 工具函数
│   ├── App.vue              ← 应用入口
│   └── main.ts              ← 主入口文件
│
├── functions/                ← 后端 API（Pages Functions）
│   └── api/
│       ├── hello.js         ← /api/hello - 测试接口
│       ├── health.js        ← /api/health - 健康检查
│       ├── auth/
│       │   └── login.js     ← /api/auth/login - 登录
│       ├── tasks/           ← 任务相关API
│       ├── posts/           ← 帖子相关API
│       ├── activities/      ← 活动相关API
│       ├── user/            ← 用户相关API
│       └── users/           ← 用户列表API
│
├── database/                 ← 数据库相关
│   └── schema.sql           ← D1数据库Schema
│
├── public/                   ← 静态资源
│   └── _redirects           ← SPA 路由重定向
│
├── wrangler.toml            ← Cloudflare配置
├── vite.config.ts           ← Vite配置
├── tailwind.config.js       ← Tailwind配置
└── ...其他配置文件
```

---

## 🔌 API 端点列表

| 方法 | 路径 | 功能 | 文件位置 |
|------|------|------|---------|
| GET | `/api/hello` | 测试 API | [functions/api/hello.js](file:///d:\SEEK\邻里社区APP\functions\api\hello.js) |
| GET | `/api/health` | 健康检查 | [functions/api/health.js](file:///d:\SEEK\邻里社区APP\functions\api\health.js) |
| POST | `/api/auth/login` | 用户登录 | [functions/api/auth/login.js](file:///d:\SEEK\邻里社区APP\functions\api\auth\login.js) |
| GET/POST | `/api/tasks` | 任务列表/创建 | [functions/api/tasks/index.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\index.js) |
| GET | `/api/tasks/match` | AI 匹配邻居 | [functions/api/tasks/match.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\match.js) |
| GET | `/api/tasks/my` | 我的任务 | [functions/api/tasks/my.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\my.js) |
| GET/PUT/DELETE | `/api/tasks/[id]` | 任务详情/更新/删除 | [functions/api/tasks/[id].js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\[id].js) |
| POST | `/api/tasks/[id]/accept` | 接受任务 | [functions/api/tasks/[id]/accept.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\[id]\accept.js) |
| POST | `/api/tasks/[id]/complete` | 完成任务 | [functions/api/tasks/[id]/complete.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\[id]\complete.js) |
| GET/POST | `/api/posts` | 帖子列表/创建 | [functions/api/posts/index.js](file:///d:\SEEK\邻里社区APP\functions\api\posts\index.js) |
| GET/PUT/DELETE | `/api/posts/[id]` | 帖子详情/更新/删除 | [functions/api/posts/[id].js](file:///d:\SEEK\邻里社区APP\functions\api\posts\[id].js) |
| POST | `/api/posts/[id]/like` | 点赞帖子 | [functions/api/posts/[id]/like.js](file:///d:\SEEK\邻里社区APP\functions\api\posts\[id]\like.js) |
| GET/POST | `/api/posts/[id]/comments` | 评论列表/发表 | [functions/api/posts/[id]/comments/index.js](file:///d:\SEEK\邻里社区APP\functions\api\posts\[id]\comments\index.js) |
| GET/POST | `/api/activities` | 活动列表/创建 | [functions/api/activities/index.js](file:///d:\SEEK\邻里社区APP\functions\api\activities\index.js) |
| GET/PUT/DELETE | `/api/activities/[id]` | 活动详情/更新/删除 | [functions/api/activities/[id].js](file:///d:\SEEK\邻里社区APP\functions\api\activities\[id].js) |
| POST | `/api/activities/[id]/join` | 参加活动 | [functions/api/activities/[id]/join.js](file:///d:\SEEK\邻里社区APP\functions\api\activities\[id]\join.js) |
| POST | `/api/activities/[id]/leave` | 取消参加 | [functions/api/activities/[id]/leave.js](file:///d:\SEEK\邻里社区APP\functions\api\activities\[id]\leave.js) |
| GET | `/api/user/profile` | 获取用户信息 | [functions/api/user/profile.js](file:///d:\SEEK\邻里社区APP\functions\api\user\profile.js) |
| GET | `/api/user/posts` | 用户发布的帖子 | [functions/api/user/posts.js](file:///d:\SEEK\邻里社区APP\functions\api\user\posts.js) |
| GET | `/api/user/activities` | 用户的活动 | [functions/api/user/activities.js](file:///d:\SEEK\邻里社区APP\functions\api\user\activities.js) |
| GET | `/api/user/favorites` | 用户收藏 | [functions/api/user/favorites.js](file:///d:\SEEK\邻里社区APP\functions\api\user\favorites.js) |

---

## 🚀 部署说明

### 部署时会发生什么？

当你部署到 Cloudflare Pages 时：

1. ✅ **前端**：`npm run build` 构建的 `dist/` 内容部署为静态网站
2. ✅ **后端**：`/functions/` 目录自动部署为 Pages Functions
3. ✅ **路由**：`_redirects` 配置 SPA 路由（Hash模式）
4. ✅ **域名**：自动分配 `*.pages.dev` 域名

### 整个过程是**自动的**，只需要一个部署命令！

```bash
# 一次部署，前端后端同时搞定！
npm run deploy
```

---

## 💡 Pages Functions 的优势

| 特性 | 说明 |
|------|------|
| **无需服务器** | 不需要购买或管理服务器 |
| **自动扩展** | 根据流量自动扩展 |
| **边缘计算** | 全球节点，低延迟 |
| **免费额度** | 每天 10 万次请求免费 |
| **一体化部署** | 前端后端一起部署 |
| **同域名** | API 和网站在同一个域名，没有 CORS 问题 |

---

## 🗄️ 数据库

项目配置了 **Cloudflare D1** - SQL 数据库，数据表结构见 [database/schema.sql](database/schema.sql)。

---

## 🔮 未来扩展建议

如果后续需要更多后端功能，可以添加：

- 🗄️ **Cloudflare D1** - SQL 数据库（已配置）
- 📦 **Cloudflare KV** - 键值存储
- 🤖 **Cloudflare AI** - AI 功能
- 📷 **Cloudflare R2** - 对象存储
- 🔄 **Cloudflare Queues** - 消息队列

这些都可以在 Pages Functions 中直接使用！

---

## 📚 相关文档

- [README.md](file:///d:\SEEK\邻里社区APP\README.md) - 项目主文档
- [功能清单.md](file:///d:\SEEK\邻里社区APP\功能清单.md) - 详细功能说明
- [DEPLOY.md](file:///d:\SEEK\邻里社区APP\DEPLOY.md) - 部署指南
- [database/README.md](file:///d:\SEEK\邻里社区APP\database\README.md) - 数据库文档
- [functions/README.md](file:///d:\SEEK\邻里社区APP\functions\README.md) - API文档
