# 邻里社区APP Cloudflare D1 数据库

## 数据库表结构

### 1. users（用户表）
存储用户基本信息、角色和社区信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 用户ID（主键） |
| phone | TEXT | 手机号（唯一） |
| nickname | TEXT | 昵称 |
| avatar | TEXT | 头像URL |
| gender | TEXT | 性别（male/female/other） |
| birthday | TEXT | 生日 |
| community | TEXT | 所属社区 |
| address | TEXT | 地址 |
| bio | TEXT | 个人简介 |
| role | TEXT | 角色（resident/elderly/volunteer/merchant） |
| credit_score | INTEGER | 信用分数 |
| is_verified | BOOLEAN | 是否实名认证 |
| created_at | INTEGER | 创建时间（Unix时间戳） |
| updated_at | INTEGER | 更新时间（Unix时间戳） |
| last_active_at | INTEGER | 最后活跃时间（Unix时间戳） |

### 2. posts（动态/帖子表）
存储社区动态和帖子内容。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 帖子ID（主键） |
| user_id | TEXT | 发布者用户ID（外键） |
| content | TEXT | 帖子内容 |
| images | TEXT | 图片URL（JSON数组） |
| location | TEXT | 位置信息 |
| visibility | TEXT | 可见性（public/community/private） |
| like_count | INTEGER | 点赞数 |
| comment_count | INTEGER | 评论数 |
| created_at | INTEGER | 创建时间 |
| updated_at | INTEGER | 更新时间 |

### 3. comments（评论表）
存储帖子评论，支持嵌套回复。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 评论ID（主键） |
| post_id | TEXT | 帖子ID（外键） |
| user_id | TEXT | 评论者用户ID（外键） |
| parent_comment_id | TEXT | 父评论ID（用于嵌套回复） |
| content | TEXT | 评论内容 |
| created_at | INTEGER | 创建时间 |
| updated_at | INTEGER | 更新时间 |

### 4. tasks（互助任务表）
存储互助任务信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 任务ID（主键） |
| user_id | TEXT | 任务发布者ID（外键） |
| helper_id | TEXT | 接任务者ID（外键） |
| title | TEXT | 任务标题 |
| description | TEXT | 任务描述 |
| category | TEXT | 任务分类（shopping/delivery/help/companionship/other） |
| location | TEXT | 任务位置 |
| reward | TEXT | 报酬 |
| deadline | INTEGER | 截止时间 |
| status | TEXT | 状态（pending/in_progress/completed/cancelled） |
| created_at | INTEGER | 创建时间 |
| updated_at | INTEGER | 更新时间 |

### 5. activities（活动表）
存储社区活动信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 活动ID（主键） |
| user_id | TEXT | 活动创建者ID（外键） |
| title | TEXT | 活动标题 |
| description | TEXT | 活动描述 |
| category | TEXT | 活动分类（sports/culture/charity/party/other） |
| location | TEXT | 活动地点 |
| start_time | INTEGER | 开始时间 |
| end_time | INTEGER | 结束时间 |
| max_participants | INTEGER | 最大参与人数 |
| current_participants | INTEGER | 当前参与人数 |
| images | TEXT | 活动图片（JSON数组） |
| status | TEXT | 活动状态（upcoming/ongoing/completed/cancelled） |
| created_at | INTEGER | 创建时间 |
| updated_at | INTEGER | 更新时间 |

### 6. activity_participants（活动参与者表）
存储活动报名信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 记录ID（主键） |
| activity_id | TEXT | 活动ID（外键） |
| user_id | TEXT | 参与者用户ID（外键） |
| joined_at | INTEGER | 报名时间 |
| status | TEXT | 参与状态（registered/attended/absent） |

### 7. likes（点赞表）
存储用户点赞记录，支持多种目标类型。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 点赞ID（主键） |
| user_id | TEXT | 点赞者用户ID（外键） |
| target_type | TEXT | 目标类型（post/comment/activity） |
| target_id | TEXT | 目标ID |
| created_at | INTEGER | 创建时间 |

## 初始化步骤

### 1. 创建 D1 数据库

```bash
# 创建新的 D1 数据库
wrangler d1 create linli-community-db
```

### 2. 更新 wrangler.toml

将上一步返回的 `database_id` 替换到 `wrangler.toml` 中的 `your-database-id-here`。

### 3. 执行初始化脚本

```bash
# 本地开发环境
wrangler d1 execute linli-community-db --local --file=./database/schema.sql

# 生产环境
wrangler d1 execute linli-community-db --file=./database/schema.sql
```

### 4. 验证数据库

```bash
# 查看本地数据库
wrangler d1 info linli-community-db --local

# 查看生产数据库
wrangler d1 info linli-community-db
```

## 本地开发

在 Pages Functions 中使用 D1 数据库：

```javascript
// functions/api/example.js
export async function onRequest(context) {
  const { DB } = context.env;
  const { results } = await DB.prepare("SELECT * FROM users").all();
  return new Response(JSON.stringify(results));
}
```

## 迁移管理

如需创建数据库迁移文件，请在 `./database/migrations` 目录下添加 SQL 文件，并使用 Wrangler CLI 管理迁移。

## 更多文档

- [Cloudflare D1 官方文档](https://developers.cloudflare.com/d1/)
- [D1 SQL 参考](https://developers.cloudflare.com/d1/platform/client-api/)
