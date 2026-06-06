# 🚀 GitHub 同步指南

## ✅ 本地仓库已初始化完成

本地 Git 仓库已创建，代码已提交！现在只需将其推送到 GitHub 即可。

## 📋 步骤：推送到 GitHub

### 1. 在 GitHub 上创建仓库

1. 打开 https://github.com/new
2. **仓库名称**: `linli-community`
3. **描述**: `邻里社区平台 - 连接邻里，共建美好社区`
4. **选择**: Public 或 Private
5. **不要勾选** "Add a README file"（我们已经有了）
6. 点击 **Create repository**

### 2. 获取仓库 URL

创建后，复制仓库的 HTTPS 或 SSH URL，例如：
```
https://github.com/your-username/linli-community.git
```

### 3. 添加远程仓库并推送

打开命令行，进入项目目录，执行：

```bash
# 添加远程仓库
git remote add origin https://github.com/your-username/linli-community.git

# 推送到 GitHub（第一次推送）
git push -u origin master
```

### 4. 配置 Cloudflare Pages 自动部署

现在你可以配置 Cloudflare Pages 自动从 GitHub 部署：

1. 打开 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 选择你的 GitHub 仓库 `linli-community`
5. 配置构建：
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**

## 🔄 日常开发流程

```bash
# 拉取最新代码
git pull origin master

# 开发...

# 提交代码
git add .
git commit -m "描述你的更改"

# 推送到 GitHub（会自动触发 Cloudflare 部署）
git push origin master
```

## 📊 仓库结构

```
linli-community/
├── src/                      # 前端源代码
│   ├── pages/              # 所有页面
│   ├── styles/            # 样式文件
│   ├── utils/             # API 工具
│   └── store/             # 状态管理
├── functions/              # Cloudflare Functions (后端 API)
│   └── api/               # API 端点
├── database/              # 数据库 Schema
├── dist/                  # 构建产物（已生成）
├── package.json          # 项目依赖
├── vite.config.ts        # Vite 配置
├── wrangler.toml         # Cloudflare 配置
└── README.md            # 项目文档
```

## ✨ 已包含的功能

- ✅ 用户认证系统
- ✅ 社区动态 Feed（发帖/点赞/评论）
- ✅ AI 互助任务（发布/接受/智能匹配）
- ✅ 社区活动（创建/报名/参与）
- ✅ 老人关怀功能
- ✅ 个人中心
- ✅ 完整的 API 后端

## 🎯 下一步

1. ✅ 创建 GitHub 仓库
2. ✅ 推送代码到 GitHub
3. ✅ 配置 Cloudflare Pages 自动部署
4. ✅ 访问你的网站！

---

**连接邻里，共建美好社区！** 🏘️❤️

有任何问题，请查看 README.md 或提交 Issue！
