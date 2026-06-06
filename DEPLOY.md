# 🚀 邻里社区APP - 部署指南

本指南将帮助你将邻里社区APP部署到 Cloudflare Pages。

## 📋 目录

- [前置准备](#前置准备)
- [本地开发](#本地开发)
- [部署方式](#部署方式)
- [配置说明](#配置说明)
- [数据库配置](#数据库配置)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 前置准备

### 1. 账号准备

- **Cloudflare 账号** - 免费注册 https://dash.cloudflare.com/sign-up
- **Node.js 18+** - 本地开发环境
- **Git** (可选) - 用于版本控制和自动部署

### 2. 安装工具

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 验证安装
wrangler --version

# 或使用 npx（无需全局安装）
npx wrangler --version
```

### 3. 环境检查

```bash
# 检查 Node.js 版本
node --version  # 需要 18+

# 检查 npm 版本
npm --version
```

---

## 本地开发

### 1. 安装依赖

```bash
# 克隆项目（如使用 Git）
git clone <your-repo-url>
cd linli-community

# 安装依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件填入真实值
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 浏览器访问 http://localhost:8080
```

### 4. 构建测试

```bash
# 构建 H5 版本
npm run build:h5

# 预览构建结果
npm run preview
```

---

## 部署方式

### 方式一：命令行部署（推荐）

#### 步骤 1：登录 Cloudflare

```bash
# 打开浏览器进行授权
npx wrangler login

# 验证登录状态
npx wrangler whoami
```

#### 步骤 2：构建项目

```bash
# 构建 H5 版本
npm run build:h5
```

#### 步骤 3：部署到 Cloudflare Pages

```bash
# 部署（首次部署会提示创建项目）
npx wrangler pages deploy dist/build/h5 --project-name=linli-community

# 或使用 npm script
npm run deploy
```

#### 步骤 4：验证部署

部署成功后，会返回类似以下的 URL：
```
https://linli-community.pages.dev
```

访问这个地址测试你的应用！

---

### 方式二：Cloudflare Dashboard

#### 步骤 1：上传构建产物

1. 访问 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** > **Create application**
3. 选择 **Pages** 标签页
4. 点击 **Upload assets**

#### 步骤 2：配置项目

1. 项目名称：`linli-community`
2. 拖拽上传 `dist/build/h5` 文件夹
3. 点击 **Deploy Site**

#### 步骤 3：配置构建设置（可选）

如果需要启用 Pages Functions：

1. 进入项目设置
2. 点击 **Functions** 标签
3. 配置 **Function folder** 为 `/functions`

---

### 方式三：Git 自动部署（最推荐）

#### 步骤 1：推送代码到 Git

```bash
# 初始化 Git（如果尚未初始化）
git init
git add .
git commit -m "Initial commit"

# 创建仓库并推送
git remote add origin <your-git-repo-url>
git push -u origin main
```

#### 步骤 2：连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** > **Create application**
3. 选择 **Connect to Git** 标签
4. 选择你的 Git 提供商（GitHub/GitLab）
5. 选择仓库 `linli-community`

#### 步骤 3：配置构建设置

| 设置项 | 值 |
|--------|-----|
| **Project name** | `linli-community` |
| **Framework preset** | `None` |
| **Build command** | `npm run build:h5` |
| **Build output directory** | `dist/build/h5` |
| **Root directory** | `/` |

#### 步骤 4：保存并部署

点击 **Save and Deploy**。

以后每次推送到 `main` 分支，Cloudflare 都会自动构建和部署！

---

### 方式四：使用 Wrangler.toml 配置

项目已包含 `wrangler.toml` 配置文件，可以直接使用：

```bash
# 部署（使用 wrangler.toml 中的配置）
npx wrangler pages deploy

# 或指定项目
npx wrangler pages deploy dist/build/h5
```

---

## 配置说明

### wrangler.toml 配置

```toml
name = "linli-community"
compatibility_date = "2024-01-01"

# Cloudflare Pages 构建输出目录
pages_build_output_dir = "dist/build/h5"

# 环境变量
[vars]
APP_NAME = "邻里社区"
APP_VERSION = "1.0.0"
```

### 环境变量配置

在 Cloudflare Dashboard 中配置环境变量：

1. 进入 **Workers & Pages** > **你的项目**
2. 点击 **Settings** > **Environment Variables**
3. 点击 **Add variable**
4. 填入变量名和值

常用环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `APP_NAME` | 应用名称 | `邻里社区` |
| `APP_VERSION` | 应用版本 | `1.0.0` |
| `VITE_APP_API_URL` | API 地址 | `/api` |

### 自定义域名（可选）

1. 在 Pages 项目页面，点击 **Custom domains**
2. 输入你的域名，例如 `community.yourdomain.com`
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书颁发（通常几分钟）

---

## 数据库配置

### 创建 D1 数据库

```bash
# 创建新的 D1 数据库
wrangler d1 create linli-community-db
```

### 更新 wrangler.toml

将返回的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "linli-community-db"
database_id = "returned-database-id"
```

### 执行数据库迁移

```bash
# 本地环境测试
wrangler d1 execute linli-community-db --local --file=./database/schema.sql

# 生产环境
wrangler d1 execute linli-community-db --file=./database/schema.sql
```

### 验证数据库

```bash
# 查看本地数据库信息
wrangler d1 info linli-community-db --local

# 查看生产数据库信息
wrangler d1 info linli-community-db
```

详细数据库 Schema 请查看 [database/schema.sql](database/schema.sql)

---

## 故障排除

### 构建失败

**问题**：构建过程中出现错误

**解决方案**：
1. 检查 Node.js 版本（需要 18+）
2. 删除 `node_modules` 和 `package-lock.json`，重新安装
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. 查看错误日志，针对性解决

### 页面 404

**问题**：部署后页面显示 404

**解决方案**：
1. 确保 `public/_redirects` 文件存在
2. 检查 `_redirects` 配置是否正确
3. 确认构建输出目录是否正确

### Functions 不工作

**问题**：API 请求返回 404 或错误

**解决方案**：
1. 确认 Functions 文件在正确的目录（`/functions`）
2. 查看 Cloudflare Dashboard 中的 Functions 日志
3. 检查 Functions 文件的导出是否正确

### CORS 错误

**问题**：浏览器控制台显示 CORS 错误

**解决方案**：
1. 检查 API 响应中是否包含正确的 CORS 头
2. 确认 `Access-Control-Allow-Origin` 设置正确

### 部署后页面空白

**问题**：页面加载但内容为空

**解决方案**：
1. 检查浏览器控制台错误
2. 确认 `_redirects` 文件中的 SPA 回退规则
3. 检查资源路径是否正确

---

## 最佳实践

### 1. 性能优化

- ✅ 启用 **Auto Minify** - 在 Pages 设置中启用 JS/CSS/HTML 压缩
- ✅ 启用 **Caching** - 配置合适的缓存规则
- ✅ 使用 **Cloudflare CDN** - 自动全球加速
- ✅ 启用 **HTTP/3** - 更好的性能

### 2. 安全建议

- ⚠️ 不要在客户端代码中存储敏感信息
- ⚠️ 使用环境变量存储 API 密钥
- ⚠️ 启用 Cloudflare WAF 保护
- ⚠️ 定期更新依赖版本

### 3. 监控和维护

- 📊 在 Cloudflare Dashboard 查看 **Analytics**
- 📝 查看 **Functions 日志** 进行调试
- 🔔 设置 **告警** 监控异常流量

### 4. 常用命令

```bash
# 本地预览（使用 Wrangler）
wrangler pages dev dist/build/h5

# 查看部署列表
wrangler pages deployment list

# 回滚到之前的部署
wrangler pages deployment rollback <deployment-id>

# 删除部署
wrangler pages deployment delete <deployment-id>

# 查看项目信息
wrangler pages project list

# 查看实时日志
wrangler pages project tail
```

---

## 📚 更多资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Pages Functions 文档](https://developers.cloudflare.com/pages/functions/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/workers/wrangler/configuration/)

---

## 📞 获取帮助

- 查看 [README.md](README.md) 了解项目详情
- 查看 [ARCHITECTURE.md](ARCHITECTURE.md) 了解架构设计
- 查看 [database/README.md](database/README.md) 了解数据库配置
- 提交 Issue 获取帮助

---

**有问题？欢迎提交 Issue！** 🎉
