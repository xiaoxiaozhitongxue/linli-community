# 登录状态验证增强 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为所有数据交互功能添加登录状态验证，确保未登录用户被引导至登录页面。

**Architecture:** 使用现有的 `useAuth()` composable 获取登录状态，配合 `showLoginGuide()` 和 `setLoginRedirect()` 实现登录引导。

**Tech Stack:** Vue 3 + TypeScript, vue-router

---

## Task 1: 活动详情页 - 报名功能登录验证

**Files:**
- Modify: `src/pages/activities/detail.vue`

**Description:**
- 在 `toggleJoin` 函数中添加登录状态验证
- 未登录时显示登录引导

**Acceptance Criteria Addressed:** AC-3

**Test Requirements:**
- `human-judgment` TR-1.1: 未登录状态点击报名按钮，应显示登录引导
- `human-judgment` TR-1.2: 登录状态点击报名按钮，应正常执行报名操作

- [ ] **Step 1: 读取活动详情页代码**

```typescript
// 查看 toggleJoin 函数位置
```

- [ ] **Step 2: 添加登录验证逻辑**

```typescript
const toggleJoin = async () => {
  if (activity.value.status === 'completed' || activity.value.status === 'cancelled') {
    return
  }
  
  // 添加登录验证
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/activities/detail')
    showLoginGuide()
    return
  }
  
  if (activity.value.is_participant) {
    // ... 取消报名逻辑
  } else {
    // ... 报名逻辑
  }
}
```

- [ ] **Step 3: 添加必要的 import**

```typescript
import { useAuth } from '../../store'
import { showLoginGuide, setLoginRedirect } from '../../utils/auth'

const { isLoggedIn } = useAuth()
```

- [ ] **Step 4: 验证修改**
- [ ] **Step 5: Commit**

---

## Task 2: 活动详情页 - 收藏功能登录验证

**Files:**
- Modify: `src/pages/activities/detail.vue`

**Description:**
- 在 `toggleFavorite` 函数中添加登录状态验证
- 未登录时显示登录引导

**Acceptance Criteria Addressed:** AC-6

**Test Requirements:**
- `human-judgment` TR-2.1: 未登录状态点击收藏按钮，应显示登录引导
- `human-judgment` TR-2.2: 登录状态点击收藏按钮，应正常执行收藏操作

- [ ] **Step 1: 添加登录验证逻辑**

```typescript
const toggleFavorite = async () => {
  // 添加登录验证
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/activities/detail')
    showLoginGuide()
    return
  }
  
  try {
    await userApi.toggleFavorite('activity', activity.value.id)
    isFavorited.value = !isFavorited.value
    toastSuccess(isFavorited.value ? '已收藏' : '已取消收藏')
  } catch (error) {
    console.error('收藏失败:', error)
  }
}
```

- [ ] **Step 2: 验证修改**
- [ ] **Step 3: Commit**

---

## Task 3: 任务详情页 - 接单功能登录验证

**Files:**
- Modify: `src/pages/ai-helper/detail.vue`

**Description:**
- 在 `handleAccept` 函数中添加登录状态验证
- 未登录时显示登录引导

**Acceptance Criteria Addressed:** AC-4

**Test Requirements:**
- `human-judgment` TR-3.1: 未登录状态点击接单按钮，应显示登录引导
- `human-judgment` TR-3.2: 登录状态点击接单按钮，应正常执行接单操作

- [ ] **Step 1: 读取任务详情页代码**
- [ ] **Step 2: 添加登录验证逻辑**

```typescript
async function handleAccept() {
  const t = task.value
  if (!t) return
  
  // 添加登录验证
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/ai-helper/detail')
    showLoginGuide()
    return
  }
  
  if (t.status !== 'open' && t.status !== 'pending') {
    toastError('此任务当前不可接单')
    return
  }
  // ... 接单逻辑
}
```

- [ ] **Step 3: 添加必要的 import**

```typescript
import { useAuth } from '../../store'
import { showLoginGuide, setLoginRedirect } from '../../utils/auth'

const { isLoggedIn } = useAuth()
```

- [ ] **Step 4: 验证修改**
- [ ] **Step 5: Commit**

---

## Task 4: 任务发布页 - 登录验证

**Files:**
- Modify: `src/pages/ai-helper/publish.vue`

**Description:**
- 在页面加载时验证登录状态
- 未登录时自动跳转到登录页面

**Acceptance Criteria Addressed:** AC-5

**Test Requirements:**
- `human-judgment` TR-4.1: 未登录状态访问发布页面，应跳转到登录页面
- `human-judgment` TR-4.2: 登录状态访问发布页面，应正常显示表单

- [ ] **Step 1: 读取任务发布页代码**
- [ ] **Step 2: 添加登录验证逻辑**

```typescript
onMounted(() => {
  if (!isLoggedIn.value) {
    setLoginRedirect('/pages/ai-helper/publish')
    navigateTo('/pages/login/index')
    return
  }
  // ... 其他初始化逻辑
})
```

- [ ] **Step 3: 添加必要的 import**

```typescript
import { onMounted } from 'vue'
import { useAuth } from '../../store'
import { setLoginRedirect, navigateTo } from '../../utils/auth'

const { isLoggedIn } = useAuth()
```

- [ ] **Step 4: 验证修改**
- [ ] **Step 5: Commit**

---

## Task 5: 帖子发布页 - 登录验证

**Files:**
- Modify: `src/pages/post/create.vue`

**Description:**
- 在页面加载时验证登录状态
- 未登录时自动跳转到登录页面

**Acceptance Criteria Addressed:** AC-5

**Test Requirements:**
- `human-judgment` TR-5.1: 未登录状态访问发布页面，应跳转到登录页面
- `human-judgment` TR-5.2: 登录状态访问发布页面，应正常显示表单

- [ ] **Step 1: 读取帖子发布页代码**
- [ ] **Step 2: 添加登录验证逻辑**

```typescript
onMounted(() => {
  if (!isLoggedIn.value) {
    setLoginRedirect('/pages/post/create')
    navigateTo('/pages/login/index')
    return
  }
  // ... 其他初始化逻辑
})
```

- [ ] **Step 3: 添加必要的 import**

```typescript
import { onMounted } from 'vue'
import { useAuth } from '../../store'
import { setLoginRedirect, navigateTo } from '../../utils/auth'

const { isLoggedIn } = useAuth()
```

- [ ] **Step 4: 验证修改**
- [ ] **Step 5: Commit**

---

## Task 6: 统一登录验证工具函数（可选优化）

**Files:**
- Create: `src/utils/requireAuth.ts`

**Description:**
- 创建统一的登录验证工具函数
- 简化各页面的登录验证逻辑

**Acceptance Criteria Addressed:** NFR-1

**Test Requirements:**
- `programmatic` TR-6.1: 调用 `requireAuth()` 未登录时应显示登录引导
- `programmatic` TR-6.2: 调用 `requireAuth()` 已登录时应返回 true

- [ ] **Step 1: 创建工具函数文件**

```typescript
import { useAuth } from '../store'
import { showLoginGuide, setLoginRedirect } from './auth'

export function requireAuth(redirectPath?: string): boolean {
  const { isLoggedIn } = useAuth()
  
  if (!isLoggedIn.value) {
    const currentPath = redirectPath || window.location.hash.replace('#', '') || '/'
    setLoginRedirect(currentPath)
    showLoginGuide()
    return false
  }
  
  return true
}

export function requireAuthWithNavigate(redirectPath?: string, loginPath: string = '/pages/login/index'): boolean {
  const { isLoggedIn } = useAuth()
  
  if (!isLoggedIn.value) {
    const currentPath = redirectPath || window.location.hash.replace('#', '') || '/'
    setLoginRedirect(currentPath)
    navigateTo(loginPath)
    return false
  }
  
  return true
}
```

- [ ] **Step 2: 更新各页面使用统一工具函数**
- [ ] **Step 3: 验证修改**
- [ ] **Step 4: Commit**

---

## Task 7: 构建验证

**Files:**
- None (全局构建)

**Description:**
- 运行 `npm run build` 验证所有修改无编译错误

**Test Requirements:**
- `programmatic` TR-7.1: 构建成功，无 TypeScript 错误

- [ ] **Step 1: 运行构建命令**

```bash
npm run build
```

- [ ] **Step 2: 验证构建成功**
- [ ] **Step 3: Commit**