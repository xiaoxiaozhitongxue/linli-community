<template>
  <div class="page">
    <!-- 顶部个人信息 -->
    <div class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-bg"></div>
      <div class="profile-content">
        <div class="profile-main" @click="goToEditProfile" v-if="isLoggedIn">
          <img class="profile-avatar" :src="user?.avatar || 'https://i.pravatar.cc/100?img=10'" />
          <div class="profile-info">
            <div class="profile-name-row">
              <span class="profile-name">{{ user?.nickname || '用户' }}</span>
              <div class="profile-badge" :class="'badge-' + user?.role">
                {{ getRoleName(user?.role || '') }}
              </div>
            </div>
            <span class="profile-desc">{{ user?.bio || '快来完善个人资料吧' }}</span>
            <div class="profile-location">
              <span>📍 {{ user?.community || '未设置' }}</span>
            </div>
          </div>
          <span class="edit-icon">✏️</span>
        </div>

        <!-- 未登录状态 -->
        <div class="profile-main" @click="goToLogin" v-else>
          <img class="profile-avatar" src="https://i.pravatar.cc/100?img=10" />
          <div class="profile-info">
            <div class="profile-name-row">
              <span class="profile-name">点击登录</span>
            </div>
            <span class="profile-desc">登录后享受完整服务</span>
          </div>
          <span class="edit-icon">›</span>
        </div>

        <!-- 数据统计 -->
        <div class="stats-row" v-if="isLoggedIn">
          <div class="stat-item" @click="goToMyCredits">
            <span class="stat-value">{{ user?.credit_score || 0 }}</span>
            <span class="stat-label">信用分</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goToPublishedTasks">
            <span class="stat-value">{{ taskStats.published.all }}</span>
            <span class="stat-label">我发布的</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goToAcceptedTasks">
            <span class="stat-value">{{ taskStats.accepted.all }}</span>
            <span class="stat-label">我接受的</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content" scroll-y v-if="isLoggedIn">
      <!-- AI互助任务模块 -->
      <div class="menu-section">
        <div class="menu-title">AI互助任务</div>
        
        <!-- 任务状态统计 -->
        <div class="task-stats-card">
          <div class="task-stats-header">
            <span class="task-stats-title">任务概览</span>
          </div>
          <div class="task-stats-grid">
            <div class="task-stat-item">
              <span class="task-stat-value pending">{{ taskStats.published.pending }}</span>
              <span class="task-stat-label">待接单</span>
            </div>
            <div class="task-stat-item">
              <span class="task-stat-value in-progress">{{ taskStats.published.in_progress }}</span>
              <span class="task-stat-label">进行中</span>
            </div>
            <div class="task-stat-item">
              <span class="task-stat-value completed">{{ taskStats.published.completed }}</span>
              <span class="task-stat-label">已完成</span>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="task-quick-actions">
          <div class="task-action-btn publish" @click="goToPublishTask">
            <span class="action-icon">📝</span>
            <span class="action-text">发布任务</span>
          </div>
          <div class="task-action-btn browse" @click="goToBrowseTasks">
            <span class="action-icon">🔍</span>
            <span class="action-text">浏览任务</span>
          </div>
        </div>
      </div>

      <!-- 个人设置 -->
      <div class="menu-section">
        <div class="menu-title">个人设置</div>
        <div class="menu-list">
          <div class="menu-list-item" @click="goToNotifications">
            <div class="menu-list-left">
              <span class="menu-list-icon">🔔</span>
              <span class="menu-list-text">消息通知</span>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-badge" v-if="hasUnreadNotification">有未读</span>
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-item" @click="goToPrivacy">
            <div class="menu-list-left">
              <span class="menu-list-icon">🔒</span>
              <span class="menu-list-text">隐私设置</span>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-item" @click="goToAddress">
            <div class="menu-list-left">
              <span class="menu-list-icon">📍</span>
              <span class="menu-list-text">收货地址</span>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-item" @click="goToAbout">
            <div class="menu-list-left">
              <span class="menu-list-icon">ℹ️</span>
              <span class="menu-list-text">关于我们</span>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 帮助与反馈 -->
      <div class="menu-section">
        <div class="menu-title">帮助与支持</div>
        <div class="menu-list">
          <div class="menu-list-item" @click="goToHelp">
            <div class="menu-list-left">
              <span class="menu-list-icon">❓</span>
              <span class="menu-list-text">帮助中心</span>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-item" @click="goToFeedback">
            <div class="menu-list-left">
              <span class="menu-list-icon">💬</span>
              <span class="menu-list-text">意见反馈</span>
            </div>
            <span class="menu-list-arrow">›</span>
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
        <span class="empty-icon">👋</span>
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
import { userApi, tasksApi } from '../../utils/api'
import { navigateTo } from '../../utils/router'
import { toastInfo } from '../../utils/toast'
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

const getRoleName = (role: string) => {
  const map: Record<string, string> = {
    resident: '居民',
    volunteer: '志愿者',
    merchant: '商家',
    elderly: '老人'
  }
  return map[role] || '居民'
}

const loadUserProfile = async () => {
  if (!isLoggedIn.value) return
  try {
    loading.value = true
    const profile = await userApi.getProfile()
    updateUser(profile)
    await loadTaskStats()
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const loadTaskStats = async () => {
  try {
    const res = await tasksApi.getMyTasks({ limit: 1 }) as any
    taskStats.value = {
      published: res.stats?.published || { all: 0, pending: 0, in_progress: 0, completed: 0 },
      accepted: res.stats?.accepted || { all: 0, pending: 0, in_progress: 0, completed: 0 }
    }
  } catch (error) {
    console.error('加载任务统计失败:', error)
  }
}

const goToEditProfile = () => {
  navigateTo('/pages/profile/edit')
}

const goToMyCredits = () => {
  toastInfo('信用分详情即将上线')
}

const goToPublishedTasks = () => {
  navigateTo('/pages/profile/my-tasks?type=published')
}

const goToAcceptedTasks = () => {
  navigateTo('/pages/profile/my-tasks?type=accepted')
}

const goToPublishTask = () => {
  navigateTo('/pages/ai-helper/publish')
}

const goToBrowseTasks = () => {
  navigateTo('/pages/ai-helper/index')
}

const goToNotifications = () => {
  navigateTo('/pages/profile/notifications')
}

const goToPrivacy = () => {
  navigateTo('/pages/profile/privacy')
}

const goToAddress = () => {
  toastInfo('收货地址功能即将上线')
}

const goToAbout = () => {
  navigateTo('/pages/profile/about')
}

const goToHelp = () => {
  toastInfo('帮助中心即将上线')
}

const goToFeedback = () => {
  toastInfo('意见反馈即将上线')
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
  background-color: var(--bg-color);
}

.profile-header {
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.profile-content {
  position: relative;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 20px);
}

.profile-main {
  display: flex;
  align-items: flex-start;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
}

.profile-avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  border: 3px solid white;
  box-shadow: var(--shadow-sm);
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-name-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: var(--spacing-sm);
}

.profile-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.badge-resident {
  background: #E3F2FD;
  color: #2196F3;
}

.badge-volunteer {
  background: #FCE4EC;
  color: #E91E63;
}

.badge-merchant {
  background: #FFF3E0;
  color: #FF9800;
}

.badge-elderly {
  background: #E8F5E9;
  color: #4CAF50;
}

.profile-desc {
  font-size: 13px;
  color: var(--text-muted);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.profile-location {
  font-size: 12px;
  color: var(--text-secondary);
}

.edit-icon {
  font-size: 18px;
  opacity: 0.5;
}

/* 数据统计 */
.stats-row {
  display: flex;
  justify-content: space-around;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.stat-item {
  text-align: center;
  cursor: pointer;
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-color);
  display: block;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  background: var(--border-color);
  margin: 0 var(--spacing-sm);
}

.content {
  min-height: calc(100vh - 200px);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-muted);
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

/* 菜单区块 */
.menu-section {
  padding: var(--spacing-md) var(--spacing-lg);
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

/* 任务统计卡片 */
.task-stats-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
}

.task-stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.task-stats-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.task-stats-grid {
  display: flex;
  justify-content: space-around;
}

.task-stat-item {
  text-align: center;
}

.task-stat-value {
  font-size: 24px;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.task-stat-value.pending {
  color: #FF9800;
}

.task-stat-value.in-progress {
  color: #2196F3;
}

.task-stat-value.completed {
  color: #4CAF50;
}

.task-stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 快捷操作按钮 */
.task-quick-actions {
  display: flex;
  gap: var(--spacing-md);
}

.task-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 0.2s;
}

.task-action-btn:active {
  opacity: 0.8;
}

.task-action-btn.publish {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
}

.task-action-btn.browse {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
}

.action-icon {
  font-size: 18px;
  margin-right: var(--spacing-xs);
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 菜单列表 */
.menu-list {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-list-item:active {
  background-color: var(--bg-color);
}

.menu-list-item:last-child {
  border-bottom: none;
}

.menu-list-left {
  display: flex;
  align-items: center;
}

.menu-list-icon {
  font-size: 18px;
  margin-right: var(--spacing-md);
}

.menu-list-text {
  font-size: 15px;
  color: var(--text-primary);
}

.menu-list-right {
  display: flex;
  align-items: center;
}

.menu-list-badge {
  font-size: 11px;
  color: white;
  background: #F44336;
  padding: 2px 6px;
  border-radius: 8px;
  margin-right: var(--spacing-sm);
}

.menu-list-arrow {
  font-size: 14px;
  color: var(--text-muted);
}

/* 退出登录 */
.logout-btn {
  margin: var(--spacing-xl) var(--spacing-lg);
  background: var(--card-bg);
  color: #F44336;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logout-btn:active {
  opacity: 0.8;
}
</style>
