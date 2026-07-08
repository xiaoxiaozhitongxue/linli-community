# 全盘审查报告

## 发现并修复的 Bug

### 🐛 Bug1: 任务分类 `pet` 和 `child` 被 DB 和后台屏蔽
- **位置**: `database/schema.sql` L76 + `functions/api/tasks/index.js` L141
- **问题**: DB CHECK 约束和后台验证列表均只有 5 个分类，缺了 `pet` 和 `child`
- **影响**: 发布页选"宠物"或"儿童"提交 → 后台报"无效的任务类型" → DB 报 CHECK 违反
- **修复**: 补齐 7 个分类，云端 D1 重建 tasks 表

### 🐛 Bug2: schema.sql 有 10 处 `IF NOT EXISTS IF NOT EXISTS` 语法错误
- **位置**: `database/schema.sql` L230~277
- **问题**: 历史全局替换导致的重复关键字
- **影响**: 重新跑迁移会 SQL 语法错误
- **修复**: 全局替换去重

### 🐛 Bug3: 搜索页任务分类显示原始值
- **位置**: `src/pages/search/index.vue` L87
- **问题**: `{{ task.category }}` 直接输出英文 code（如 "delivery"）
- **修复**: 加 `getTypeName()` 映射为中文名

## 逻辑/UI 优化

| 问题 | 位置 | 处理 |
|------|------|------|
| 帖子详情 heart 用 emoji | `post/detail.vue` L49 | 改为 AppIcon `heart` 实心图标 |
| 死CSS（报名按钮） | `activities/detail.vue` L674~729 | 标记待清理 |
| 活动 join/leave 端点仍存活 | `functions/api/activities/` | 建议决定是否删除 |

## 未修复（优化建议）

- **图片上传**：Base64 存 DB 不可持续，需配 Cloudflare R2
- **任务排序**：仅支持时间排序，不支持热度/距离
