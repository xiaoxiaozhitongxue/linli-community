# 消息页面加载BUG & 任务详情数据错误 - 修复规格

## 问题概述

### BUG 1: 消息页面一直显示加载中
- **现象**: 用户登录后，点击底部导航栏的"消息"页面，页面一直显示 loading 转圈，无法看到消息内容或未登录提示
- **影响范围**: `src/pages/messages/index.vue`
- **严重性**: 高 - 用户无法使用消息功能

### BUG 2: 我的任务点击详情显示错误数据
- **现象**: 从"我的任务 → 已发布/待接单"点击用户自己发布的任务，进入详情页后显示的不是该任务的实际信息（可能显示为默认占位数据或别的任务的信息）
- **影响范围**: `src/pages/ai-helper/publish.vue`, `src/pages/profile/my-tasks.vue`, `src/pages/ai-helper/detail.vue`
- **严重性**: 高 - 用户无法查看自己发布的任务详情

## 根本原因分析

### BUG 1 根因

消息页面 `onMounted` 只执行一次加载流程，存在以下问题:

1. **登录状态变化时不会重新加载**: 如果用户在消息页面组件已挂载后才登录（如先看别的页面再登录），`loadMessages` 不会重新触发
2. **数据读取时缺少健壮的错误处理**: 虽然已添加 try/catch/finally，但在 `getUserStorageKey` 返回不带 `_<phone>` 后缀的键时（如 userInfo 损坏），会读取到空或错误的数据
3. **isLoggedIn 检查时机**: `onMounted` 执行时，`initAuth` 可能尚未完成（尤其在快速刷新或路由跳转后）

### BUG 2 根因

任务数据存储在 3 个不同的 localStorage 键中，数据流不一致:

| 键 | 存储内容 | 页面 | 数据结构 |
|---|---|---|---|
| `ai_helper_tasks_<phone>` | 完整任务数据 | publish.vue / index.vue / detail.vue | `{ id, type, title, description, reward, location, distance, responses, creatorName, creatorAvatar, status, ... }` |
| `ai_helper_my_created_tasks_<phone>` | 摘要数据 | publish.vue / my-tasks.vue / detail.vue | `{ id, title, reward, status, updateTime }` |
| `ai_helper_my_accepted_tasks_<phone>` | 摘要数据 | my-tasks.vue / detail.vue | `{ id, title, reward, status, updateTime }` |

问题:
1. **数据不一致**: 摘要数据缺少 `description`、`type`、`location` 等字段，在详情页无法完整展示
2. **无 fallback 提示**: 当在主存储键 `ai_helper_tasks_<phone>` 找不到任务时，没有给用户明确的提示
3. **ID 匹配不严谨**: 各页面的 `loadFromStorage` 函数实现略有差异，对非数组数据的处理不一致

## 修复方案

### 修复 1: 消息页面重新加载机制

**修改文件**: `src/pages/messages/index.vue`

**具体修改**:
1. 从 `@vue/runtime-dom` 增加 `watch` 导入
2. 添加 `watch` 监听 `isLoggedIn` 变化，当从 false → true 时重新执行 `loadMessages`
3. 确保 `loadMessages` 对空数据有明确的 UI 展示（显示"暂无消息"而非 loading）
4. 清理 `onUnmounted` 中的 setTimeout，避免内存泄漏（可选）

### 修复 2: 任务数据流统一

**修改文件**: `src/pages/ai-helper/publish.vue`, `src/pages/ai-helper/detail.vue`, `src/pages/profile/my-tasks.vue`

**具体修改**:

**publish.vue**:
- 保存到 `ai_helper_my_created_tasks_<phone>` 时，写入**完整任务对象**（而不是摘要），确保详情页能读取完整数据
- 统一 `STORAGE_KEY` 常量命名

**detail.vue**:
- 添加更详细的错误处理：当任务完全找不到时，显示提示信息
- 从摘要数据中读取信息时，对缺失字段给出合理的 UI 展示，而不是显示默认占位数据

**my-tasks.vue**:
- 确保存储键与 publish.vue 一致
- 从 `ai_helper_tasks_<phone>` 合并数据到 `ai_helper_my_created_tasks_<phone>` 的逻辑需要更可靠

## 验证标准

| 验证点 | 预期结果 |
|---|---|
| 消息页面登录后访问 | 800ms 内显示消息列表或空状态，不会无限转圈 |
| 消息页面未登录访问 | 500ms 内显示"请先登录"提示 |
| 发布任务后，去"我的任务"点击该任务 | 详情页正确显示该任务的标题、描述、地点、悬赏等信息 |
| 待接单页面点击任务 | 详情页正确显示该任务的完整信息 |
| npm run build | 编译通过，无 TypeScript 错误 |

## 测试步骤

1. 打开应用，点击底部"消息" Tab → 检查显示是否正常（未登录提示或消息列表）
2. 登录账号 → 重新进入"消息" Tab → 检查是否正常显示消息列表，不会无限 loading
3. 发布一个新的互助任务 → 记录任务标题
4. 进入"我的 → 我的任务 → 已发布" → 点击刚发布的任务
5. 检查详情页标题是否与发布时填写的一致
6. 检查详情页描述、地点、悬赏等字段是否正确
7. 执行 `npm run build` → 编译通过
