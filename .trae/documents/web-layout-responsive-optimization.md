# Web端页面布局响应式优化 - 实施计划

## 概要

当前Web端页面被限制在 500-800px 窄宽度居中显示，桌面端两侧大量留白，排布不协调。本次优化将实现全宽响应式布局，桌面端采用左侧导航栏+右侧内容区的经典布局。

## 当前状态

- `#app` max-width 被限制为 500/600/700/800px（4个断点），桌面端呈现"手机屏居中"效果
- 所有页面采用 `<div class="page">` 根元素 + 固定顶部导航 + 可滚动内容区
- 底部 TabBar 使用 `position: fixed; bottom: 0` 固定在底部
- 悬浮发布按钮使用 fixed 定位在右下角
- 样式系统基于 CSS Variables 设计 Token，完整且一致

## 目标

| 方面 | 描述 |
|------|------|
| 宽度 | 桌面端放宽至 1200-1400px，充分利用屏幕空间 |
| 导航 | 桌面端改为左侧固定导航栏，移动端保持底部 TabBar |
| 布局 | 左侧导航 + 右侧内容区 的经典桌面布局 |
| 一致性 | 保持现有设计 Token 体系（色彩/阴影/圆角/间距）不变 |

---

## 实施任务

### Task 1: 修改 base.css —— 响应式宽度约束

**文件**: `src/styles/base.css`

**修改内容**:
1. 修改 `#app` 的响应式断点，从窄屏限制改为全宽响应式
2. 添加 `--app-nav-width` CSS 变量用于桌面端侧边栏宽度
3. 添加 `.app-layout` 容器样式（flex 布局）

**当前代码** (base.css L202-L238):
```css
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 100%;
}

@media (min-width: 500px) {
  #app { max-width: var(--app-max-width); /* 500px */ }
}
@media (min-width: 768px) {
  #app { max-width: 600px; }
}
@media (min-width: 1024px) {
  #app { max-width: 700px; }
}
@media (min-width: 1440px) {
  #app { max-width: 800px; }
}
```

**修改为**:
```css
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 100%;
}

/* 移动端：保持100%宽度 */
@media (max-width: 767px) {
  #app {
    max-width: 100%;
  }
}

/* 中等屏幕：适当放宽 */
@media (min-width: 768px) {
  #app {
    max-width: 100%;
    min-height: 100vh;
  }
}

/* 桌面端：左侧导航 + 右侧内容布局 */
@media (min-width: 1024px) {
  :root {
    --nav-sidebar-width: 220px;
  }
  #app {
    max-width: 100%;
    flex-direction: row;
  }
}

@media (min-width: 1440px) {
  :root {
    --nav-sidebar-width: 250px;
  }
  #app {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

---

### Task 2: 创建 SideNav.vue —— 桌面端左侧导航栏

**文件**: `src/components/SideNav.vue`（新建）

**设计要点**:
- 固定在左侧，宽度 `var(--nav-sidebar-width)`
- 顶部：品牌 Logo + App 名称「邻里社区」
- 中部：4 个导航项（首页🏠、互助🤝、消息💬、我的👤），当前激活项高亮
- 底部：当前登录用户信息（头像+昵称）或登录按钮
- hover 时有过渡动画，选中项有左侧彩色指示条
- 背景色使用 `var(--color-bg-secondary)`，右侧有细微阴影分隔

**模板结构**:
```vue
<template>
  <nav class="side-nav" :class="{ collapsed: isCollapsed }">
    <div class="nav-brand">
      <span class="brand-emoji">🏘️</span>
      <span class="brand-name">邻里社区</span>
    </div>
    
    <div class="nav-items">
      <div 
        v-for="item in navItems" 
        :key="item.path"
        class="nav-item" 
        :class="{ active: isActive(item.path) }"
        @click="navigateTo(item.path)"
      >
        <span class="nav-item-icon">{{ item.icon }}</span>
        <span class="nav-item-label">{{ item.label }}</span>
        <div v-if="isActive(item.path)" class="nav-item-indicator"></div>
      </div>
    </div>
    
    <div class="nav-footer">
      <div v-if="isLoggedIn" class="user-info">
        <img :src="userAvatar" class="user-avatar" />
        <span class="user-name">{{ userName }}</span>
      </div>
      <div v-else class="login-entry" @click="goToLogin">
        <span>🔑</span>
        <span>登录</span>
      </div>
    </div>
  </nav>
</template>
```

**样式特点**:
- 宽度 `var(--nav-sidebar-width)`
- `position: fixed; left: 0; top: 0; height: 100vh`
- `background: var(--color-bg-secondary)`
- 右侧 `box-shadow: 2px 0 20px rgba(0,0,0,0.04)`
- 激活项有左侧 3px 宽的橙色指示条
- hover: 背景色 `var(--hover-bg-subtle)`
- 导航项的 transition 使用 `var(--transition-fast)`

---

### Task 3: 修改 App.vue —— 集成桌面端侧边栏布局

**文件**: `src/App.vue`

**修改内容**:
1. 导入 `SideNav` 组件
2. 桌面端（≥1024px）显示 SideNav + 右侧内容区，隐藏 BottomTabBar 和 FloatingPublishButton
3. 移动端（<1024px）保持原有底部 TabBar + 悬浮按钮布局
4. 使用 CSS media query 控制显示/隐藏

**修改后模板**:
```vue
<template>
  <div class="app-container">
    <!-- 桌面端左侧导航栏 -->
    <SideNav v-if="isDesktop" />
    
    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'desktop': isDesktop }">
      <router-view v-slot="{ Component }">
        <transition name="page-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    
    <!-- 移动端底部导航栏 -->
    <BottomTabBar v-if="showTabBar && !isDesktop" />
    
    <Toast />
    
    <!-- 移动端悬浮发布按钮 -->
    <FloatingPublishButton 
      v-if="showFloatingPublishButton && !isDesktop"
      @publish-post="handlePublishPost"
      @publish-activity="handlePublishActivity"
      @publish-help="handlePublishHelp"
    />
  </div>
</template>
```

**JS 变动**:
```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import SideNav from './components/SideNav.vue'

const isDesktop = ref(false)

const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  initAuth()
  recordActiveTime()
  checkInactiveStatus()
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
```

**样式变动**:
```css
.app-container {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  overflow-x: hidden;
}

.main-content.desktop {
  margin-left: var(--nav-sidebar-width);
  padding-bottom: 0; /* 桌面端不需要为TabBar留空间 */
}

.app-container {
  padding-bottom: 0; /* 移除全局padding-bottom，交给移动端页面自己处理 */
}

/* 移动端仍然需要底部间距 */
@media (max-width: 1023px) {
  .app-container {
    padding-bottom: 65px;
  }
}
```

---

### Task 4: 修改 BottomTabBar.vue —— 移动端专属

**文件**: `src/components/BottomTabBar.vue`

**修改内容**:
- 移除响应式 `max-width`（平板/桌面适配），只保留移动端样式
- 已通过 App.vue 的 `v-if="!isDesktop"` 控制桌面端不渲染，此文件仅做清理

---

### Task 5: 修改 FloatingPublishButton.vue —— 移动端专属

**文件**: `src/components/FloatingPublishButton.vue`

**修改内容**:
- 清理响应式断点相关样式
- 移除 `@media (min-width: 768px)` 中的 right 偏移
- 仅保留移动端定位样式

---

### Task 6: 适配页面内容区 —— 桌面端内容宽度优化

**涉及文件**:
- `src/pages/index/index.vue`（首页）
- `src/pages/ai-helper/index.vue`（互助广场）
- `src/pages/messages/index.vue`（消息列表）
- `src/pages/profile/index.vue`（个人中心）
- 以及其他所有 `pages/*/index.vue` 和 `pages/*/detail.vue`

**修改内容**:
- 所有 `.page` 根元素在桌面端不需要限制最大宽度
- `.content` 在桌面端使用合适的 max-width（如 900px）居中
- `.page-wrapper` 在桌面端移除窄宽度限制
- 响应式调整：移动端保持原样，桌面端利用更宽的空间

**统一修改模式**（以首页为例）:

```css
/* 首页 .page-wrapper 当前有 max-width 限制 */
.page-wrapper {
  max-width: 100%;
}

@media (min-width: 1024px) {
  .page-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }
}
```

**列表页适配（互助/消息/活动列表）**:
- 桌面端可以使用 2 列或更宽的卡片布局
- 保持移动端单列滚动

---

### Task 7: 首页桌面端优化

**文件**: `src/pages/index/index.vue`

**修改内容**:
1. `quick-actions` 在桌面端改为 4 列 grid（而非 2 列）
2. `activity-scroll` 在桌面端去掉横向滚动，改为 2-3 列 grid
3. `post-list` 在桌面端增加最大宽度
4. 顶部状态栏桌面端去掉 fixed 定位（因为左侧已有导航）

---

### Task 8: 构建验证

**命令**: `npm run build`

**验证内容**:
1. 构建无 TypeScript 错误
2. CSS 无语法错误
3. 所有页面正常编译

---

### Task 9: Git 提交

```bash
git add -A
git commit -m "feat: web端全宽响应式布局优化，桌面端左侧导航栏"
```

---

## 文件变更汇总

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/SideNav.vue` | **新建** | 桌面端左侧导航栏组件 |
| `src/styles/base.css` | 修改 | 响应式断点改为全宽，添加桌面布局变量 |
| `src/App.vue` | 修改 | 集成 SideNav，桌面端/移动端布局切换 |
| `src/components/BottomTabBar.vue` | 修改 | 移除桌面端样式适配，仅保留移动端 |
| `src/components/FloatingPublishButton.vue` | 修改 | 移除桌面端样式适配，仅保留移动端 |
| `src/pages/index/index.vue` | 修改 | 桌面端内容区优化 |
| `src/pages/ai-helper/index.vue` | 修改 | 桌面端内容区优化 |
| `src/pages/messages/index.vue` | 修改 | 桌面端内容区优化 |
| `src/pages/profile/index.vue` | 修改 | 桌面端内容区优化 |
| `src/pages/activities/index.vue` | 修改 | 桌面端内容区优化 |
| `src/pages/health/index.vue` | 修改 | 桌面端内容区优化 |
| `src/pages/search/index.vue` | 修改 | 桌面端内容区优化 |

## 设计决策

1. **断点选择**: 1024px 为移动端/桌面端分界点，这是常见的小屏笔记本起始宽度
2. **侧边栏宽度**: 220px（1024-1439px）/ 250px（1440px+），足够显示中文导航文字
3. **内容区宽度**: 桌面端内容区 max-width 900px 居中，避免行过长影响可读性
4. **保持设计Token**: 所有颜色/圆角/阴影/间距使用现有 CSS 变量，不引入新设计语言
5. **移动端零影响**: 移动端（<1024px）所有行为和样式保持不变

## 验收标准

- [x] 桌面端（≥1024px）页面宽度延伸至全屏，不再限制在窄宽度
- [x] 桌面端显示左侧导航栏，4 个导航项可正常切换
- [x] 移动端保持底部 TabBar 导航，功能不受影响
- [x] 页面内容区在桌面端有适当的 max-width 约束（避免行过长）
- [x] FloatingPublishButton 在桌面端隐藏（功能可整合到侧边栏或页面内）
- [x] 所有页面在桌面端和移动端均可正常渲染
- [x] 构建无编译错误
