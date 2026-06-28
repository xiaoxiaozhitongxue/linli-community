# 前后端云端数据交互与部署 - 任务清单

## Task 1: 修复后端 API Bug
- [ ] 1.1 修复 `cancel.js` 模板字符串语法错误（L39 单引号改反引号）
- [ ] 1.2 修复 `test.js` `result.results[0]` → `result[0]`（第 10 行）
- [ ] 1.3 统一 `favorites.js` ID 生成方式（`crypto.randomUUID()` → `generateId()`）
- [ ] 1.4 修复 `cancel.js` 查询不完整（添加 helper JOIN 信息）

**依赖**: 无
**并行**: 1.1-1.4 可并行

## Task 2: JWT 密钥安全加固
- [ ] 2.1 修改 `session.js` 支持通过 `context.env.JWT_SECRET` 读取环境变量
- [ ] 2.2 更新 `wrangler.toml` 添加 JWT_SECRET 变量声明
- [ ] 2.3 更新 `.env.example` 添加 JWT_SECRET 说明
- [ ] 2.4 确保 `requireAuth` 和 `login.js` 中正确传递 context 给 session 函数

**依赖**: 无
**并行**: 与 Task 1 可并行

## Task 3: 创建 D1 数据库初始化脚本
- [ ] 3.1 创建 `database/init.sh`（Windows 兼容的 Powershell：`database/init.ps1`）初始化脚本
- [ ] 3.2 更新 `database/README.md` 包含完整部署指引
- [ ] 3.3 更新 `package.json` 添加 `db:init` 和 `db:deploy` npm scripts

**依赖**: Task 2
**并行**: 无

## Task 4: 构建验证
- [ ] 4.1 运行 `npm run build` 确保前端构建无错误
- [ ] 4.2 验证所有 API 文件无语法错误
- [ ] 4.3 验证前端 services 层所有 endpoint 路径与后端匹配

**依赖**: Task 1, Task 2
**并行**: 无

## Task 5: 推送 Git
- [ ] 5.1 检查 Git 状态
- [ ] 5.2 添加所有修改到暂存区
- [ ] 5.3 Commit（提交信息："fix: 修复后端API Bug，加固JWT安全，完善数据库初始化"）
- [ ] 5.4 Push 到远程仓库

**依赖**: Task 4
**并行**: 无

## 任务依赖关系
- Task 1, 2 → Task 3 → Task 4 → Task 5
- Task 1, 2 可并行
