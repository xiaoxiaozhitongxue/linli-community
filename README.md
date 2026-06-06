# 🏘️ 邻里社区APP

> 连接邻里，共建美好社区 - 打造本地化社区互助与服务平台

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-yellowgreen)](https://pages.cloudflare.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-brightgreen)](https://vuejs.org/)
[![UniApp](https://img.shields.io/badge/UniApp-跨平台-blue)](https://uniapp.dcloud.net.cn/)
[![License](https://img.shields.io/badge/License-MIT-orange)](LICENSE)

## 📖 项目介绍

邻里社区（Linli Community）是一款连接城市社区居民的本地化社交与互助平台，基于 **UniApp + Vue 3** 开发，支持 H5 和小程序多端运行，部署在 **Cloudflare Pages + Workers** 上，提供高性能和低成本的服务。

### 核心价值

- 🏡 **线下邻里空间** - 打造社区客厅、邻里中心
- 🤝 **AI劳动撮合** - 帮助取快递、顺便带菜、临时接孩子等日常小事
- 💰 **社区创业孵化** - 帮助居民把兴趣/技能变成小生意
- 👴 **老人关怀帮扶** - 邻里志愿者定期探访、帮忙买菜、陪诊

## ✨ 核心功能

### 1. 首页 🏠
- 社区动态信息流
- 热门活动轮播
- 快捷功能入口
- 邻里动态展示

### 2. 邻里空间 👨‍👩‍👧‍👦
- **社区客厅** - 在线邻居、热门话题
- **活动中心** - 活动发布、报名、管理
- **兴趣小组** - 萌宠、美食、运动等小组

### 3. AI互助 🤖
- 快速发布任务
- AI智能匹配邻居
- 任务广场浏览
- 我的任务管理

### 4. 社区创业 💼
- 我的小店管理
- 热门商品浏览
- 附近小店推荐
- 创业故事分享

### 5. 老人关怀 👵
- 紧急求助按钮
- 快捷服务菜单
- 志愿者招募
- 定期探访计划

### 6. 个人中心 👤
- 个人资料管理
- 数据统计展示
- 我的订单/任务
- 设置与帮助

## 🛠️ 技术栈

| 类别 | 技术选型 |
|------|---------|
| **前端框架** | UniApp + Vue 3 + TypeScript |
| **样式方案** | Tailwind CSS + 自定义CSS变量 |
| **构建工具** | Vite 5.x |
| **部署平台** | Cloudflare Pages |
| **边缘函数** | Cloudflare Workers / Pages Functions |
| **API路由** | Cloudflare Pages Functions |
| **数据库** | Cloudflare D1 (可选) |
| **缓存** | Cloudflare KV (可选) |

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
# 构建 H5 版本
npm run build:h5

# 预览构建结果
npm run preview
```

### 环境变量配置

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件填入真实值
```

## ☁️ 部署到 Cloudflare

### 方式一：使用命令行部署（推荐）

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 构建并部署
npm run deploy

# 或分步执行
npm run build:h5
npx wrangler pages deploy ./dist/build/h5 --project-name=linli-community
```

### 方式二：使用 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create application** > **Pages**
3. 选择 **Upload assets**
4. 上传 `dist/build/h5` 目录
5. 项目名称填写：`linli-community`
6. 点击 **Deploy Site**

### 方式三：自动部署（Git 集成）

1. 将代码推送到 GitHub/GitLab
2. 在 Cloudflare Pages 中连接你的仓库
3. 配置构建设置：
   - 构建命令: `npm run build:h5`
   - 输出目录: `dist/build/h5`
4. 每次推送代码时自动部署

## 📁 项目结构

```
linli-community/
├── pages/                    # 📱 页面目录
│   ├── index/               # 首页
│   ├── neighborhood/        # 邻里空间
│   ├── activities/          # 活动页面
│   ├── ai-helper/           # AI互助
│   ├── business/            # 社区创业
│   ├── elderly/             # 老人关怀
│   ├── profile/             # 个人中心
│   ├── post/                # 帖子页面
│   └── login/               # 登录页
├── styles/                   # 🎨 全局样式
│   └── base.css            # 基础样式和CSS变量
├── functions/                # ⚡ Cloudflare Pages Functions
│   ├── _middleware.js       # 全局中间件
│   ├── lib/                # 核心库
│   │   ├── index.js        # 库入口
│   │   ├── response.js     # 统一响应格式
│   │   ├── cors.js         # CORS处理
│   │   ├── db.js           # D1数据库封装
│   │   ├── utils.js        # 工具函数
│   │   ├── session.js      # 会话管理
│   │   └── auth.js         # 认证模块
│   └── api/                 # API端点
│       ├── hello.js        # 测试端点
│       ├── health.js       # 健康检查
│       ├── auth/           # 认证相关
│       ├── tasks/          # 任务相关
│       ├── user/           # 用户相关
│       └── ...
├── cloudflare/              # ☁️ Cloudflare配置
│   ├── functions/          # Cloudflare Functions
│   └── _routes.json       # 路由配置
├── public/                  # 📄 公共资源
│   └── _redirects         # Cloudflare重定向规则
├── database/                # 🗄️ 数据库相关
│   ├── schema.sql         # 数据库Schema
│   └── README.md          # 数据库说明
├── static/                  # 📦 静态资源
├── utils/                   # 🔧 工具函数
│   ├── api.ts             # API请求封装
│   └── request.ts         # 请求拦截器
├── store/                   # 📊 状态管理
├── App.vue                  # 🚀 应用入口
├── main.ts                  # 🔧 主入口文件
├── manifest.json            # 📋 UniApp配置
├── pages.json               # 🗺️ 路由和TabBar配置
├── vite.config.ts           # ⚡ Vite配置
├── tsconfig.json            # 📘 TypeScript配置
├── tailwind.config.js       # 🎨 Tailwind配置
├── wrangler.toml            # ☁️ Wrangler配置
└── package.json             # 📦 项目依赖
```

## 🎨 设计规范

### 颜色系统

```css
--primary-color: #FF8C42;    /* 主色调 - 温暖橙色 */
--primary-light: #FFB380;     /* 浅橙色 */
--primary-dark: #E67730;      /* 深橙色 */
--accent-color: #4CAF50;      /* 辅助色 - 绿色 */
--bg-color: #F5F5F0;          /* 背景色 */
--card-bg: #FFFFFF;           /* 卡片背景 */
--text-primary: #333333;      /* 主要文字 */
--text-secondary: #666666;    /* 次要文字 */
--text-muted: #999999;        /* 辅助文字 */
```

### 组件风格

- **圆角**: 16px 大圆角卡片
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

### 认证端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 |

### 任务端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/tasks` | GET | 获取任务列表 |
| `/api/tasks` | POST | 创建任务 |
| `/api/tasks/match` | GET | AI匹配邻居 |
| `/api/tasks/my` | GET | 我的任务 |
| `/api/tasks/[id]` | GET/PUT/DELETE | 任务详情/更新/删除 |
| `/api/tasks/[id]/accept` | POST | 接受任务 |
| `/api/tasks/[id]/complete` | POST | 完成任务 |

### 用户端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/user/profile` | GET | 获取用户信息 |
| `/api/user/posts` | GET | 获取用户动态 |
| `/api/user/activities` | GET | 获取用户活动 |
| `/api/user/favorites` | GET | 获取用户收藏 |

### 帖子端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/posts` | GET | 获取帖子列表 |
| `/api/posts` | POST | 创建帖子 |
| `/api/posts/[id]` | GET/PUT/DELETE | 帖子详情/更新/删除 |
| `/api/posts/[id]/like` | POST | 点赞/取消点赞 |
| `/api/posts/[id]/comments` | GET/POST | 评论列表/发表评论 |

### 活动端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/activities` | GET | 获取活动列表 |
| `/api/activities` | POST | 创建活动 |
| `/api/activities/[id]` | GET/PUT/DELETE | 活动详情/更新/删除 |
| `/api/activities/[id]/join` | POST | 参加活动 |
| `/api/activities/[id]/leave` | POST | 取消参加 |

更多 API 请查看 `functions/api/` 目录

## 🔧 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build:h5` | 构建 H5 版本 |
| `npm run preview` | 预览构建产物 |
| `npm run cloudflare:dev` | 本地模拟 Cloudflare Pages |
| `npm run deploy` | 构建并部署到 Cloudflare Pages |

## 🗄️ 数据库配置（可选）

### 创建 D1 数据库

```bash
# 创建新的 D1 数据库
wrangler d1 create linli-community-db
```

### 配置 wrangler.toml

将返回的 `database_id` 填入 `wrangler.toml` 配置。

### 执行初始化脚本

```bash
# 本地环境
wrangler d1 execute linli-community-db --local --file=./database/schema.sql

# 生产环境
wrangler d1 execute linli-community-db --file=./database/schema.sql
```

详细说明请查看 [database/README.md](database/README.md)

## 🎯 未来计划

- [x] Cloudflare Pages 部署
- [x] Cloudflare Pages Functions API
- [ ] Cloudflare D1 数据库集成
- [ ] Cloudflare KV 缓存集成
- [ ] Cloudflare AI 智能匹配
- [ ] 实时聊天功能（Durable Objects）
- [ ] 图片上传（R2 Storage）
- [ ] 微信小程序版本
- [ ] 用户认证系统
- [ ] 支付功能集成

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**连接邻里，共建美好社区** 🏘️❤️
