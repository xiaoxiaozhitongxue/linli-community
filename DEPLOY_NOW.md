# 🚀 立即部署指南

## 已完成的工作

✅ 项目已成功构建到 `dist/` 目录
✅ Cloudflare Pages Functions 已配置在 `functions/` 目录
✅ 所有源代码已准备就绪

## 部署方式

### 方式一：Cloudflare Dashboard（推荐，最简单）

1. **访问 Cloudflare Dashboard**
   - 打开 https://dash.cloudflare.com/
   - 登录你的 Cloudflare 账号

2. **创建 Pages 项目**
   - 点击左侧菜单 **"Workers & Pages"**
   - 点击 **"Create application"**
   - 选择 **"Pages"** 标签
   - 点击 **"Upload assets"**

3. **上传构建产物**
   - 项目名称：`linli-community`
   - 将整个 `dist` 文件夹拖拽到上传区域
   - 点击 **"Deploy site"**

4. **部署 API Functions**
   - 部署完成后，你会得到一个 URL，例如：
     `https://linli-community.pages.dev`
   - **重要**：Cloudflare Pages 会自动识别 `functions` 目录并部署为边缘函数
   - 你的 API 将可以在 `https://linli-community.pages.dev/api/*` 访问

### 方式二：使用 Wrangler CLI

如果你想使用命令行部署：

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署**
   ```bash
   wrangler pages deploy dist --project-name=linli-community
   ```

## 部署产物结构

```
dist/                          # 前端静态文件
├── index.html
├── assets/
│   ├── index-*.js           # 各页面 JS 文件
│   ├── index-*.css          # 各页面 CSS 文件
│   └── api-*.js             # API 封装
└── _next/                   # Next.js 构建文件（如果有）

functions/                     # Cloudflare Pages Functions
├── api/
│   ├── hello.js             # → /api/hello
│   ├── auth/login.js        # → /api/auth/login
│   ├── posts/               # → /api/posts/*
│   ├── tasks/               # → /api/tasks/*
│   └── user/               # → /api/user/*
├── lib/                     # 工具库
└── _middleware.js          # 全局中间件
```

## 部署后验证

部署成功后，访问你的网站 URL，应该能看到：

1. **首页** - 显示邻里动态 Feed
2. **底部导航** - 首页、邻里、互助、关怀、我的
3. **发布按钮** - 右下角悬浮按钮
4. **API 测试** - 访问 `https://你的域名/api/hello`

## 下一步

1. **配置自定义域名**（可选）
   - 在 Cloudflare Dashboard 的 Pages 项目设置中
   - 添加你的自定义域名
   - 配置 DNS 记录

2. **配置环境变量**（可选）
   - 在 Cloudflare Dashboard 中
   - 添加必要的环境变量

3. **初始化数据库**（可选）
   ```bash
   wrangler d1 create linli-community-db
   # 然后运行 database/schema.sql 初始化表结构
   ```

## 常见问题

### Q: 部署后页面空白？
A: 检查 `_redirects` 文件是否在 `dist` 目录根目录。

### Q: API 返回 404？
A: 确保 `functions` 目录在项目根目录（不是 dist 内部）。

### Q: 样式/图片不显示？
A: 检查资源路径是否正确，可能需要配置 base URL。

## 需要帮助？

查看 `README.md` 获取更多信息！
