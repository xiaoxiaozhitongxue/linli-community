# Cloudflare Pages Functions 基础架构

## 目录结构

```
functions/
├── _middleware.js          # 全局中间件（CORS、错误处理）
├── lib/                   # 核心库
│   ├── index.js           # 库入口
│   ├── response.js        # 统一响应格式
│   ├── cors.js            # CORS 处理
│   ├── db.js              # D1 数据库封装
│   └── utils.js           # 工具函数
└── api/                   # API 端点
    ├── hello.js           # 示例端点
    ├── test.js            # 测试端点
    └── health.js          # 健康检查端点
```

## 核心库使用

### 响应格式

```javascript
import { createResponse, createErrorResponse, createPaginatedResponse } from '../lib/index.js'

// 成功响应
return createResponse(data, '操作成功')

// 错误响应
return createErrorResponse(400, '参数错误', { field: '缺失' })

// 分页响应
return createPaginatedResponse(items, 1, 10, 100)
```

### 数据库操作

```javascript
import { getDb } from '../lib/index.js'

export async function onRequestGet(context) {
  const db = getDb(context)
  
  // 查询多条
  const users = await db.query('SELECT * FROM users WHERE community = ?', ['阳光社区'])
  
  // 查询单条
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
  
  // 插入
  await db.insert('users', {
    id: generateId(),
    phone: '13800138000',
    nickname: '测试用户',
    community: '阳光社区'
  })
  
  // 更新
  await db.update('users', { nickname: '新昵称' }, 'id = ?', [userId])
  
  // 删除
  await db.delete('users', 'id = ?', [userId])
}
```

### 工具函数

```javascript
import { generateId, now, validatePhone, validateRequired } from '../lib/index.js'

const id = generateId()
const timestamp = now()
const isPhoneValid = validatePhone('13800138000')
const missingFields = validateRequired(data, ['phone', 'nickname'])
```

## API 端点

- `GET /api/hello` - 欢迎信息
- `GET /api/test` - 数据库连接测试
- `POST /api/test` - 参数验证测试
- `GET /api/health` - 服务健康检查
