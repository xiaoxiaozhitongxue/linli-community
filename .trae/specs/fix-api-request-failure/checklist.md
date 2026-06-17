# 修复 API 请求失败问题 - 检查清单

## Vite 代理配置

- [x] vite.config.ts 添加 proxy 配置
- [x] `/api` 请求转发到云端 URL
- [x] changeOrigin 设置为 true

## package.json 脚本

- [x] 添加 `serve:api` 脚本

## 构建验证

- [x] `npm run build` 编译通过
- [x] 生成 dist 目录

## 开发环境验证

- [x] Vite 开发服务器正常启动 (`npm run dev`)
- [x] API 请求通过代理转发成功
- [x] `/api/tasks` 返回正确数据
- [x] `/api/posts` 返回正确数据
- [x] `/api/activities` 返回正确数据

## 页面验证

- [x] 互助页面正常显示任务列表，无"请求失败"
- [x] 首页动态正常显示
- [x] 活动列表正常显示
