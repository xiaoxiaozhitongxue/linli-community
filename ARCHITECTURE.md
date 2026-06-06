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
│  │   前端 (UniApp H5)   │      │  后端 (Pages Functions)│   │
│  ├──────────────────────┤      ├──────────────────────┤   │
│  │  pages/              │◄────►│  functions/          │   │
│  │  static/             │ API   │    api/             │   │
│  │  styles/             │ Calls │      hello.js       │   │
│  │                      │      │      auth/login.js   │   │
│  │  访问: /             │      │      tasks/          │   │
│  │         /neighborhood│      │        index.js      │   │
│  │         /ai-helper   │      │        match.js      │   │
│  │         /elderly     │      │                      │   │
│  │         /profile     │      │  访问: /api/*        │   │
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
├── pages/                    ← 前端页面
│   ├── index/index.vue       ← 首页
│   ├── neighborhood/index.vue ← 邻里空间
│   ├── ai-helper/index.vue   ← AI互助
│   ├── elderly/index.vue     ← 老人关怀
│   ├── profile/index.vue     ← 个人中心
│   └── login/index.vue       ← 登录页
│
├── functions/                ← 后端 API（Pages Functions）
│   └── api/
│       ├── hello.js          ← /api/hello - 测试接口
│       ├── auth/
│       │   └── login.js      ← /api/auth/login - 登录
│       └── tasks/
│           ├── index.js      ← /api/tasks - 任务管理
│           └── match.js      ← /api/tasks/match - AI匹配
│
├── public/                   ← 静态资源
│   └── _redirects            ← SPA 路由重定向
│
├── App.vue                   ← 应用入口
├── main.ts                   ← 主入口文件
├── pages.json                ← UniApp 路由配置
└── ...其他配置文件
```

---

## 🔌 API 端点列表

| 方法 | 路径 | 功能 | 文件位置 |
|------|------|------|---------|
| GET | `/api/hello` | 测试 API | [functions/api/hello.js](file:///d:\SEEK\邻里社区APP\functions\api\hello.js) |
| POST | `/api/auth/login` | 用户登录 | [functions/api/auth/login.js](file:///d:\SEEK\邻里社区APP\functions\api\auth\login.js) |
| GET | `/api/tasks` | 获取任务列表 | [functions/api/tasks/index.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\index.js) |
| POST | `/api/tasks` | 创建任务 | [functions/api/tasks/index.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\index.js) |
| GET | `/api/tasks/match` | AI 匹配邻居 | [functions/api/tasks/match.js](file:///d:\SEEK\邻里社区APP\functions\api\tasks\match.js) |

---

## 🚀 部署说明

### 部署时会发生什么？

当你部署到 Cloudflare Pages 时：

1. ✅ **前端**：`npm run build:h5` 构建的 `dist/build/h5/` 内容部署为静态网站
2. ✅ **后端**：`/functions/` 目录自动部署为 Pages Functions
3. ✅ **路由**：`_redirects` 配置 SPA 路由
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

## 🔮 未来扩展建议

如果后续需要更多后端功能，可以添加：

- 🗄️ **Cloudflare D1** - SQL 数据库
- 📦 **Cloudflare KV** - 键值存储
- 🤖 **Cloudflare AI** - AI 功能
- 📷 **Cloudflare R2** - 对象存储
- 🔄 **Cloudflare Queues** - 消息队列

这些都可以在 Pages Functions 中直接使用！

---

## 📚 相关文档

- [README.md](file:///d:\SEEK\邻里社区APP\README.md) - 项目主文档
- [DEPLOY.md](file:///d:\SEEK\邻里社区APP\DEPLOY.md) - 部署指南
- [ISSUES_FIXED.md](file:///d:\SEEK\邻里社区APP\ISSUES_FIXED.md) - 已修复问题
