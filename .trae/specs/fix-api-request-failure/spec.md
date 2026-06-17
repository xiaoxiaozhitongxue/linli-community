# 修复 API 请求失败问题 - 添加 Vite 代理配置

## 问题概述

多个页面显示"请求失败"错误，根本原因是开发环境配置问题：

- 前端使用 `npm run dev` 启动 Vite 开发服务器（端口 8080）
- 后端 API 在 Cloudflare Pages Functions 中
- Vite 服务器无法处理 `/api/*` 请求，导致请求失败

## 解决方案

在 `vite.config.ts` 中添加代理配置，将 `/api/*` 请求转发到 Cloudflare Pages Functions 服务器。

### 开发流程

1. 终端 1: 启动 Cloudflare Pages Functions 开发服务器
   ```bash
   wrangler pages dev ./dist --port 8787
   ```

2. 终端 2: 启动 Vite 开发服务器（带代理）
   ```bash
   npm run dev
   ```

## 修改内容

### 1. 修改 vite.config.ts

添加 server.proxy 配置，将 `/api/*` 请求转发到 wrangler pages dev 服务器。

### 2. 更新 package.json

添加 `serve:api` 脚本方便启动后端开发服务器。

## 验收标准

| 验证点 | 预期结果 |
|--------|----------|
| `npm run dev` 启动后 | API 请求通过代理转发到 Cloudflare Functions |
| `/api/tasks` 请求 | 返回 `{ success: true, data: {...} }` |
| 互助页面 | 正常显示任务列表，无"请求失败" |
| 首页动态 | 正常显示，无"请求失败" |
| 活动列表 | 正常显示，无"请求失败" |

## 技术细节

### Vite 代理配置

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

### 开发启动方式

```bash
# 终端 1 - 启动 Cloudflare Pages Functions
wrangler pages dev ./dist --port 8787

# 终端 2 - 启动 Vite 开发服务器
npm run dev
```
