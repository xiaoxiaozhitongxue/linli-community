# 修复 API 请求失败问题 - 任务列表

## 任务概览

修复开发环境下 API 请求失败问题，通过 Vite 代理转发请求到 Cloudflare Pages Functions。

---

## 任务 1: 修改 vite.config.ts 添加代理配置

**修改文件**: `vite.config.ts`

**当前状态**: 无代理配置，前端请求 `/api/*` 发送到 Vite 服务器

**目标状态**: 添加 proxy 配置，将 `/api/*` 请求转发到 `http://localhost:8787`

**修改内容**:
```typescript
server: {
  port: 8080,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'http://localhost:8787',
      changeOrigin: true
    }
  }
}
```

**检查项**:
- [ ] vite.config.ts 包含 proxy 配置
- [ ] `/api` 请求转发到 localhost:8787

---

## 任务 2: 更新 package.json 添加脚本

**修改文件**: `package.json`

**当前状态**: 无 serve:api 脚本

**目标状态**: 添加 `serve:api` 脚本

**修改内容**:
```json
"scripts": {
  "dev": "vite --port 8080 --host",
  "build": "vite build",
  "preview": "vite preview --port 8080",
  "serve:api": "wrangler pages dev ./dist --port 8787",
  "cloudflare:dev": "wrangler pages dev ./dist",
  "cloudflare:deploy": "npm run build && wrangler pages deploy ./dist",
  "deploy": "npm run build && wrangler pages deploy ./dist"
}
```

**检查项**:
- [ ] package.json 包含 `serve:api` 脚本

---

## 任务 3: 构建项目

**操作**: 执行 `npm run build`

**检查项**:
- [ ] 构建成功
- [ ] 生成 dist 目录

---

## 任务 4: 启动开发服务器并验证

**操作**:
1. 终端 1: `npm run serve:api`
2. 终端 2: `npm run dev`

**验证步骤**:
- [ ] Vite 开发服务器正常启动
- [ ] Cloudflare Pages Functions 正常启动
- [ ] API 请求通过代理转发
- [ ] 互助页面正常显示任务列表
- [ ] 首页动态正常显示
- [ ] 活动列表正常显示
- [ ] 无"请求失败"错误

---

## 依赖关系

- 任务 1 和任务 2 可并行执行
- 任务 3 依赖任务 1 完成
- 任务 4 依赖任务 2 和任务 3 完成
