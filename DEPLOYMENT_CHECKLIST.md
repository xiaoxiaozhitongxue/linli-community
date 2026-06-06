# ☑️ 邻里社区APP - Cloudflare 部署检查清单

## 🔍 部署前检查

### ✅ 1. 基础配置
- [x] `package.json` - 依赖正确配置
- [x] `vite.config.ts` - Vite 配置正确
- [x] `pages.json` - UniApp 路由配置（已修复（移除了缺失的图标）
- [x] `manifest.json` - UniApp 应用配置
- [x] `functions/` - Cloudflare Pages Functions 已就位

### ✅ 2. 目录结构
- [x] `pages/` - 页面文件完整
- [x] `public/` - 静态资源和 `_redirects`
- [x] `styles/` - 样式文件

---

## 🚀 部署到 Cloudflare Pages

### 方式一：Git 自动部署（推荐）

1. **准备步骤：
- [ ] 将代码推送到 GitHub/GitLab
- [ ] 登录 Cloudflare Dashboard → Workers & Pages
- [ ] 创建 Pages → Create application → Pages
- [ ] 连接到 Git 仓库
- [ ] 配置：
  - **Project name**: `linli-community`
  - **Framework preset**: `None`
  - **Build command**: `npm run build:h5`
  - **Build output directory**: `dist/build/h5`
- [ ] 点击 **Save and Deploy**

### 方式二：Wrangler CLI 部署

1. **准备步骤：
- [ ] 安装依赖：`npm install`
- [ ] 登录 Cloudflare：`npx wrangler login`
- [ ] 构建项目：`npm run build:h5`
- [ ] 部署：`npx wrangler pages deploy dist/build/h5 --project-name=linli-community`

---

## ⚙️ Cloudflare Pages Functions 配置

### Functions 路径说明
Cloudflare Pages 会自动识别 `/functions` 目录下的文件：

| 文件路径 | API 端点 | 功能 |
|---------|----------|------|
| `functions/api/hello.js` | `/api/hello` | 测试 API |
| `functions/api/auth/login.js` | `/api/auth/login` | 登录 |
| `functions/api/tasks/index.js` | `/api/tasks` | 任务管理 |
| `functions/api/tasks/match.js` | `/api/tasks/match` | AI 匹配 |

### 验证 Functions 工作原理
- ✅ Pages 部署时，`/functions` 目录自动部署为边缘函数
- ✅ 无需额外配置，开箱即用
- ✅ CORS 已在函数中配置好

---

## 🎯 已修复的问题

### 🔧 问题 1: tabBar 图标缺失
**问题**：`pages.json` 配置了不存在的 static 图标文件
**修复**：移除了 `iconPath` 和 `selectedIconPath` 配置
**影响**：tabBar 仍可用，只是没有图标（不影响功能）

### 🔧 问题 2: 构建输出目录不匹配
**问题**：UniApp 构建到 `dist/build/h5`，但配置指向 `dist`
**修复**：
- 更新了 `package.json` 脚本
- 更新了 `wrangler.toml`
- 更新了 `vite.config.ts` 配置

### 🔧 问题 3: _redirects 部署
**修复**：public 目录配置正确，vite 会自动复制

---

## 📋 部署后检查清单

1. [ ] 访问部署成功，获取 pages.dev 域名
2. [ ] 首页能正常加载
3. [ ] 所有 tabBar 能正常切换
4. [ ] API 端点能正常访问（测试 `/api/hello`）
5. [ ] 页面路由能正常工作（SPA 路由）
6. [ ] 在 Cloudflare Dashboard 的 Functions 日志正常

---

## 💡 常见问题

### Q: 构建失败，提示找不到 uni 命令？
**A**: 需要先运行 `npm install`

### Q: 部署后页面空白？
**A**: 检查 `_redirects` 是否在根目录，并且配置正确

### Q: API 返回 404？
**A**: 确认 `/functions` 目录在项目根目录，文件结构正确

### Q: 如何添加 tabBar 图标？
**A**: 在 `static/` 目录添加图标文件，然后修改 `pages.json` 重新配置

---

## 📞 需要帮助？
查看 `README.md` 和 `DEPLOY.md` 获取详细说明！
