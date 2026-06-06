# 🚀 邻里社区APP - 快速开始指南

想要快速上手？跟着这个指南，5分钟内启动项目！

## ⚡ 快速开始（5分钟）

### 方式一：本地开发（推荐新用户）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd linli-community

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# 访问 http://localhost:8080
```

**完成！** 现在你可以在本地开发了。

---

### 方式二：快速部署到 Cloudflare

```bash
# 1. 确保已经安装依赖
npm install

# 2. 构建项目
npm run build:h5

# 3. 登录 Cloudflare（如未登录）
npx wrangler login

# 4. 部署！
npm run deploy
```

**完成！** 部署成功后，你会获得一个 `.pages.dev` URL。

---

## 📋 快速命令参考

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build:h5` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run deploy` | 构建并部署 |
| `npx wrangler pages dev` | 本地预览 Cloudflare 版本 |

---

## 🏃 下一步做什么？

### 1. 探索应用功能

启动后，你可以体验：

- 🏠 **首页** - 查看社区动态和热门活动
- 👨‍👩‍👧‍👦 **邻里空间** - 加入兴趣小组
- 🤖 **AI互助** - 发布和接受任务
- 👵 **老人关怀** - 志愿者帮扶
- 💼 **社区创业** - 开设小店

### 2. 配置部署

准备好部署了？

1. 查看 [DEPLOY.md](DEPLOY.md) 了解详细的部署方式
2. 配置 `.env` 文件
3. 选择部署方式（命令行/Dashboard/Git）

### 3. 自定义开发

想要定制化开发？

1. 查看 [ARCHITECTURE.md](ARCHITECTURE.md) 了解项目架构
2. 修改 `pages.json` 调整页面路由
3. 修改 `tailwind.config.js` 调整样式
4. 在 `functions/api/` 添加新的 API

---

## ❓ 常见问题

### Q: 启动失败，提示 `uni` 命令找不到？

```bash
# 解决方案：重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

### Q: 部署后页面显示 404？

```bash
# 解决方案：确认构建输出目录
# 应该是 dist/build/h5/
npm run build:h5
```

### Q: API 请求不工作？

```bash
# 解决方案：确认 Functions 目录存在
# 应该是项目根目录下的 /functions
ls functions/
```

### Q: 如何查看 Cloudflare 日志？

```bash
# 使用 Wrangler 查看实时日志
npx wrangler pages project tail
```

---

## 📞 需要更多帮助？

- 📖 查看 [README.md](README.md) - 完整项目文档
- 🚀 查看 [DEPLOY.md](DEPLOY.md) - 详细部署指南
- 🏗️ 查看 [ARCHITECTURE.md](ARCHITECTURE.md) - 架构说明
- 🗄️ 查看 [database/README.md](database/README.md) - 数据库说明

---

**准备好开始了吗？** 🚀
