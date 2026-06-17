# 修复前后端API请求失败问题 - 任务列表（云端D1方案）

## 任务概览

诊断并修复前后端 API 请求失败问题，统一使用云端 D1 数据库。

---

## 任务 1: 诊断 D1 数据库状态

**操作**: 检查 D1 数据库是否已正确创建和初始化

**验证命令**:
```bash
wrangler d1 info linli-community-db
```

**检查项**:
- [x] D1 数据库实例存在
- [x] database_id 与 wrangler.toml 中的配置匹配
- [x] 数据库已执行 schema.sql 初始化

**如果数据库不存在或未初始化**:
- [ ] 创建 D1 数据库
- [ ] 执行 `wrangler d1 execute linli-community-db --file=./database/schema.sql --remote` 初始化 schema

---

## 任务 2: 诊断 API 请求问题

**操作**: 使用 curl 或浏览器开发者工具测试 API

**测试命令**:
```bash
# 测试 posts API（公开接口）
curl -X GET "https://your-pages-domain.com/api/posts?page=1&limit=10"

# 测试带认证的 API
curl -X GET "https://your-pages-domain.com/api/tasks" \
  -H "Authorization: Bearer <token>"
```

**检查项**:
- [ ] API 返回正确的 JSON 响应格式
- [ ] CORS headers 正确设置
- [ ] 数据库查询正常执行

---

## 任务 3: 修复 API 路由问题（如需要）

**检查文件**: `functions/api/_middleware.js`

如果该文件不存在，创建它：
```javascript
import { handleCors } from '../lib/index.js'

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return handleCors(request)
  }

  return context.next()
}
```

**检查项**:
- [x] `functions/api/_middleware.js` 存在且正确处理 OPTIONS 请求
- [x] `functions/api/tasks/_middleware.js` 创建并正确处理 OPTIONS 和认证
- [x] `functions/api/activities/_middleware.js` 创建并正确处理 OPTIONS 和认证
- [x] `functions/api/auth/_middleware.js` 创建并正确处理 OPTIONS
- [x] 每个子路由（如 `posts/_middleware.js`）正确处理 CORS

---

## 任务 4: 验证前后端集成

**操作**: 启动开发服务器并测试完整流程

```bash
npm run dev
```

**验证步骤**:
- [ ] 首页动态列表正常显示
- [ ] 互助任务页面正常显示
- [ ] 活动列表正常显示
- [ ] 登录功能正常
- [ ] 发布帖子/任务功能正常
- [ ] 点赞、评论功能正常
- [ ] 无"请求失败"错误提示

---

## 任务 5: 构建验证

**操作**: 执行生产构建

```bash
npm run build
```

**检查项**:
- [ ] TypeScript 编译通过
- [ ] 无类型错误
- [ ] 部署包生成成功

---

## 依赖关系

- 任务 1（诊断 D1）先执行
- 任务 2（诊断 API）在任务 1 之后执行
- 任务 3（修复路由）在任务 2 发现问题时执行
- 任务 4、5 在前面任务完成后执行
