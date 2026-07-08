<template>
  <div class="page">
    <!-- 顶部个人信息 - 酷安风格 -->
    <div class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="profile-main" @click="goToEditProfile" v-if="isLoggedIn">
        <div class="avatar-wrap" v-if="user?.avatar">
          <img class="profile-avatar" :src="user?.avatar" />
        </div>
        <div v-else class="profile-avatar avatar-placeholder">{{ (user?.nickname || '邻').charAt(0) }}</div>
        <div class="profile-info">
          <div class="profile-name">{{ user?.nickname || '用户' }}</div>
          <span class="profile-desc">{{ user?.bio || '快来完善个人资料吧' }}</span>
          <div class="profile-location">
            {{ user?.community || '未设置' }}
          </div>
        </div>
      </div>

      <!-- 未登录状态 -->
      <div class="profile-main" @click="goToLogin" v-else>
        <div class="profile-avatar avatar-placeholder">邻</div>
        <div class="profile-info">
          <div class="profile-name">点击登录</div>
          <span class="profile-desc">登录后享受完整服务</span>
        </div>
      </div>

      <!-- 数据统计 - 三栏无边框卡片 -->
      <div class="stats-row" v-if="isLoggedIn">
        <div class="stat-item">
          <span class="stat-value">{{ user?.credit_score || 0 }}</span>
          <span class="stat-label">信用分</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="goToPublishedTasks">
          <span class="stat-value">{{ taskStats.published.all }}</span>
          <span class="stat-label">发布</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="goToAcceptedTasks">
          <span class="stat-value">{{ taskStats.accepted.all }}</span>
          <span class="stat-label">接受</span>
        </div>
      </div>
    </div>

    <div class="content" v-if="isLoggedIn">
      <!-- 互助任务概览 -->
      <div class="menu-section">
        <div class="menu-card">
          <div class="menu-list-item" @click="goToMyTasks('pending')">
            <div class="menu-list-left">
              <span class="menu-list-text">待接单</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-count info">{{ taskStats.published.pending }}</span>
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToMyTasks('in_progress')">
            <div class="menu-list-left">
              <span class="menu-list-text">进行中</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-count warning">{{ taskStats.published.in_progress }}</span>
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToMyTasks('completed')">
            <div class="menu-list-left">
              <span class="menu-list-text">已完成</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-count success">{{ taskStats.published.completed }}</span>
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容管理 -->
      <div class="menu-section">
        <div class="menu-card">
          <div class="menu-list-item" @click="goToMyPosts">
            <div class="menu-list-left">
              <span class="menu-list-text">我的动态</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToMyActivities">
            <div class="menu-list-left">
              <span class="menu-list-text">我的活动</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 个人设置 -->
      <div class="menu-section">
        <div class="menu-card">
          <div class="menu-list-item" @click="goToMessages">
            <div class="menu-list-left">
              <span class="menu-list-text">消息中心</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-badge" v-if="hasUnreadNotification">有未读</span>
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToPrivacy">
            <div class="menu-list-left">
              <span class="menu-list-text">隐私设置</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToAbout">
            <div class="menu-list-left">
              <span class="menu-list-text">关于我们</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-btn" @click="logout">
        退出登录
      </div>

      <div class="safe-area-bottom"></div>
    </div>

    <!-- 未登录提示 -->
    <div class="content" v-else>
      <div class="empty-state">
        <span class="empty-text">请先登录</span>
        <div class="btn btn-primary" style="margin-top: 24px;" @click="goToLogin">
          立即登录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../../store/index'
import { userService } from '../../services/userService'
import { taskService } from '../../services/taskService'
import { navigateTo } from '../../utils/router'
import { showModal } from '../../utils/ui'

const { user, logout: authLogout, isLoggedIn, initAuth, updateUser } = useAuth()
const statusBarHeight = ref(20)
const loading = ref(false)
const hasUnreadNotification = ref(true)

const taskStats = ref({
  published: {
    all: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  },
  accepted: {
    all: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  }
})

const loadUserProfile = async () => {
  if (!isLoggedIn.value) return
  try {
    loading.value = true
    const profile = await userService.getProfile()
    updateUser(profile)
    await loadTaskStats()
  } catch {
    // 静默处理加载失败
  } finally {
    loading.value = false
  }
}

const loadTaskStats = async () => {
  try {
    const result = await taskService.getMyTasks()
    const myPublished = result.published || []
    const myAccepted = result.accepted || []

    const published = {
      all: myPublished.length,
      pending: myPublished.filter((t: any) => t.status === 'pending' || t.status === 'open').length,
      in_progress: myPublished.filter((t: any) => t.status === 'in_progress' || t.status === 'ongoing').length,
      completed: myPublished.filter((t: any) => t.status === 'completed' || t.status === 'pending_confirm').length
    }

    const accepted = {
      all: myAccepted.length,
      pending: myAccepted.filter((t: any) => t.status === 'pending' || t.status === 'open').length,
      in_progress: myAccepted.filter((t: any) => t.status === 'in_progress' || t.status === 'ongoing').length,
      completed: myAccepted.filter((t: any) => t.status === 'completed' || t.status === 'pending_confirm').length
    }

    taskStats.value = { published, accepted }
  } catch {
    // 静默处理加载失败
  }
}

const goToEditProfile = () => {
  navigateTo('/pages/profile/edit')
}

const goToPublishedTasks = () => {
  navigateTo('/pages/profile/my-tasks?type=published')
}

const goToAcceptedTasks = () => {
  navigateTo('/pages/profile/my-tasks?type=accepted')
}

const goToMyTasks = (status?: string) => {
  navigateTo('/pages/profile/my-tasks' + (status ? '?status=' + status : ''))
}

const goToMyPosts = () => {
  navigateTo('/pages/profile/my-posts')
}

const goToMyActivities = () => {
  navigateTo('/pages/profile/my-activities')
}

const goToMessages = () => {
  navigateTo('/pages/messages/index')
}

const goToPrivacy = () => {
  navigateTo('/pages/profile/privacy')
}

const goToAbout = () => {
  navigateTo('/pages/profile/about')
}

const goToLogin = () => {
  navigateTo('/pages/login/index')
}

const logout = () => {
  showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res: any) => {
      if (res.confirm) {
        authLogout()
      }
    }
  })
}

onMounted(() => {
  initAuth()
  statusBarHeight.value = 20
  if (isLoggedIn.value) {
    loadUserProfile()
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* ========== 头部：居中大头像 ========== */
.profile-header {
  padding: var(--spacing-lg);
  padding-bottom: 0;
}

.profile-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-lg);
  cursor: pointer;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
  margin-bottom: var(--spacing-md);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #111111;
  margin-bottom: 4px;
}

.profile-desc {
  font-size: 13px;
  color: #999999;
  margin-bottom: 4px;
}

.profile-location {
  font-size: 12px;
  color: #BBBBBB;
}

/* ========== 统计：三栏卡片 ========== */
.stats-row {
  display: flex;
  background: #FFFFFF;
  border-radius: 12px;
  padding: var(--spacing-lg) 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  margin-bottom: var(--spacing-md);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-sm);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #111111;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999999;
  font-weight: 400;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #F0F0F0;
  align-self: center;
}

/* ========== 内容区域 ========== */
.content {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.menu-section {
  margin-bottom: 12px;
}

.menu-card {
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}

.menu-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px var(--spacing-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.menu-list-item:active {
  background: #F5F5F5;
}

.menu-list-divider {
  height: 1px;
  background: #F0F0F0;
  margin: 0 var(--spacing-lg);
}

.menu-list-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-list-text {
  font-size: 15px;
  color: #111111;
  font-weight: 400;
}

.menu-list-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-list-count {
  font-size: 13px;
  font-weight: 500;
  min-width: 20px;
  text-align: right;
}

.menu-list-count.info {
  color: var(--color-info);
}

.menu-list-count.warning {
  color: var(--color-warning);
}

.menu-list-count.success {
  color: var(--color-success);
}

.menu-list-badge {
  font-size: 11px;
  background: var(--color-error);
  color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.menu-list-arrow {
  font-size: 18px;
  color: #CCCCCC;
  line-height: 1;
}

/* ========== 退出登录 ========== */
.logout-btn {
  padding: 14px;
  margin-top: var(--spacing-xl);
  text-align: center;
  color: #EF4444;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.logout-btn:active {
  opacity: 0.5;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: opacity var(--transition-fast);
  font-weight: 600;
  border: none;
  outline: none;
}

.btn-primary {
  background: var(--color-primary);
  color: #FFFFFF;
}

.btn-primary:active {
  opacity: 0.7;
}

/* ========== 安全区域 ========== */
.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,107,53,0.08);
  color: #FF6B35;
  font-size: 24px;
  font-weight: 700;
}
</style>
