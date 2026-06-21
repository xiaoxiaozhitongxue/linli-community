# 任务详情页空白修复 - 验证清单

## 代码审查
- [x] `detail.vue` 的 `mapApiTaskToLocal` 将 `in_progress` 映射为 `ongoing`（与 `index.vue` 的 `normalizeStatus` 一致）
- [x] `detail.vue` 的 `mapApiTaskToLocal` 将 `completed` → `completed`，`cancelled` → `cancelled`
- [x] `detail.vue` 的 `fetchTask` 在 `apiTask` 为 falsy 时，触发 localStorage fallback 或显示默认任务
- [x] `detail.vue` 的 `fetchTask` 在所有退出路径（正常返回/异常/无数据）都将 `loading.value = false`
- [x] `index.vue` 的 `reloadTasks` 正确处理 API 错误，任务列表为空时显示空状态（而非崩溃）
- [x] `tasks/index.js` 的 `normalizeStatus` 函数将 `'open'` → `'pending'` 查询（后端已修复）
- [x] `tasks/my.js` 返回 `{ published: [...], accepted: [...], ... }` 结构（后端已修复）

## 功能验证（人工测试）
- [ ] 打开互助首页，默认显示"待接单"列表，能看到数据库中 pending 状态的任务
- [ ] 点击任务卡片，导航到详情页，页面正确显示任务标题/描述/悬赏/地点/发布者
- [ ] 详情页中 pending 状态任务，"接下这个任务"按钮可点击
- [ ] 详情页中 in_progress 状态任务，显示"进行中"，按钮禁用
- [ ] 输入不存在的任务 ID，页面显示"未找到该任务"而非空白页
- [ ] 模拟 API 失败（断网），页面显示友好提示而非 JavaScript 错误

## 构建验证
- [ ] `npm run build` 成功，0 编译错误
