<template>
  <div class="page">
    <!-- 顶部个人信息 -->
    <div class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-bg"></div>
      <div class="profile-content">
        <div class="profile-main" @click="goToEditProfile" v-if="isLoggedIn">
          <div class="avatar-wrap" v-if="user?.avatar">
            <img class="profile-avatar" :src="user?.avatar" />
          </div>
          <div v-else class="profile-avatar avatar-placeholder">{{ (user?.nickname || '邻').charAt(0) }}</div>
          <div class="profile-info">
            <div class="profile-name-row">
              <span class="profile-name">{{ user?.nickname || '用户' }}</span>
              <div class="profile-badge" :class="'badge-' + user?.role">
                {{ getRoleName(user?.role || '') }}
              </div>
            </div>
            <span class="profile-desc">{{ user?.bio || '快来完善个人资料吧' }}</span>
            <div class="profile-location">
              <AppIcon name="map-pin" :size="14" /> {{ user?.community || '未设置' }}
            </div>
          </div>
          <span class="edit-icon">✏️</span>
        </div>

        <!-- 未登录状态 -->
        <div class="profile-main" @click="goToLogin" v-else>
          <div class="profile-avatar avatar-placeholder">邻</div>
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
        <div class="section-header">
          <AppIcon name="handshake" class="section-icon" />
          <span class="section-title">互助任务</span>
        </div>
        
        <!-- 任务状态统计 -->
        <div class="task-stats-card">
          <div class="task-stats-header">
            <span class="task-stats-title">任务概览</span>
            <span class="task-stats-subtitle">查看任务详情</span>
          </div>
          <div class="task-stats-grid">
            <div class="task-stat-item" @click="goToMyTasks('pending')">
              <div class="task-stat-num pending">
                <span class="task-stat-value">{{ taskStats.published.pending }}</span>
              </div>
              <span class="task-stat-label">待接单</span>
            </div>
            <div class="task-stat-divider"></div>
            <div class="task-stat-item" @click="goToMyTasks('ongoing')">
              <div class="task-stat-num in-progress">
                <span class="task-stat-value">{{ taskStats.published.in_progress }}</span>
              </div>
              <span class="task-stat-label">进行中</span>
            </div>
            <div class="task-stat-divider"></div>
            <div class="task-stat-item" @click="goToMyTasks('completed')">
              <div class="task-stat-num completed">
                <span class="task-stat-value">{{ taskStats.published.completed }}</span>
              </div>
              <span class="task-stat-label">已完成</span>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="task-quick-actions">
          <div class="task-action-card my-tasks" @click="goToMyTasks('all')">
            <div class="action-icon-wrap">
              <AppIcon name="bookmark" class="action-icon" />
            </div>
            <div class="action-content">
              <span class="action-title">我的任务</span>
              <span class="action-desc">管理已发布和已接受的任务</span>
            </div>
            <span class="action-arrow">›</span>
          </div>
          <div class="task-action-card publish" @click="goToPublishTask">
            <div class="action-icon-wrap">
              <AppIcon name="edit" class="action-icon" />
            </div>
            <div class="action-content">
              <span class="action-title">发布任务</span>
              <span class="action-desc">发布互助请求获取帮助</span>
            </div>
            <span class="action-arrow">›</span>
          </div>
          <div class="task-action-card browse" @click="goToBrowseTasks">
            <div class="action-icon-wrap">
              <AppIcon name="search" class="action-icon" />
            </div>
            <div class="action-content">
              <span class="action-title">浏览任务</span>
              <span class="action-desc">发现社区中的互助任务</span>
            </div>
            <span class="action-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 个人设置 -->
      <div class="menu-section">
        <div class="section-header">
          <AppIcon name="settings" class="section-icon" />
          <span class="section-title">个人设置</span>
        </div>
        <div class="menu-card">
          <div class="menu-list-item" @click="goToMessages">
            <div class="menu-list-left">
              <div class="menu-icon-wrap messages">
                <AppIcon name="message-circle" class="menu-list-icon" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">消息中心</span>
                <span class="menu-list-desc">查看系统通知和互动消息</span>
              </div>
            </div>
            <div class="menu-list-right">
              <span class="menu-list-badge" v-if="hasUnreadNotification">有未读</span>
              <span class="menu-list-arrow">›</span>
            </div>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToPrivacy">
            <div class="menu-list-left">
              <div class="menu-icon-wrap privacy">
                <AppIcon name="lock" class="menu-list-icon" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">隐私设置</span>
                <span class="menu-list-desc">管理个人隐私和数据</span>
              </div>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToAddress">
            <div class="menu-list-left">
              <div class="menu-icon-wrap address">
                <AppIcon name="map-pin" class="menu-list-icon" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">收货地址</span>
                <span class="menu-list-desc">管理常用收货地址</span>
              </div>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToAbout">
            <div class="menu-list-left">
              <div class="menu-icon-wrap about">
                <AppIcon name="info" class="menu-list-icon" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">关于我们</span>
                <span class="menu-list-desc">了解应用信息和版本</span>
              </div>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 帮助与反馈 -->
      <div class="menu-section">
        <div class="section-header">
          <AppIcon name="help-circle" class="section-icon" />
          <span class="section-title">帮助与支持</span>
        </div>
        <div class="menu-card">
          <div class="menu-list-item" @click="goToHelp">
            <div class="menu-list-left">
              <div class="menu-icon-wrap help">
                <AppIcon name="help-circle" class="menu-list-icon" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">帮助中心</span>
                <span class="menu-list-desc">常见问题和使用指南</span>
              </div>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToFeedback">
            <div class="menu-list-left">
              <div class="menu-icon-wrap feedback">
                <AppIcon name="message-circle" class="menu-list-icon" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">意见反馈</span>
                <span class="menu-list-desc">提交建议帮助我们改进</span>
              </div>
            </div>
            <span class="menu-list-arrow">›</span>
          </div>
          <div class="menu-list-divider"></div>
          <div class="menu-list-item" @click="goToDesign">
            <div class="menu-list-left">
              <div class="menu-icon-wrap design" style="background: #FFF3ED;">
                <AppIcon name="star" :size="20" color="#FF6B35" />
              </div>
              <div class="menu-list-content">
                <span class="menu-list-text">设计规范</span>
                <span class="menu-list-desc">图标集与设计语言展示</span>
              </div>
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
        <AppIcon name="handshake" class="empty-icon" />
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
import { toastInfo } from '../../utils/toast'
import { showModal } from '../../utils/ui'
import AppIcon from '../../components/AppIcon.vue'

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

const goToMyCredits = () => {
  toastInfo('信用分详情即将上线')
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

const goToPublishTask = () => {
  navigateTo('/pages/ai-helper/publish')
}

const goToBrowseTasks = () => {
  navigateTo('/pages/ai-helper/index')
}

const goToMessages = () => {
  navigateTo('/pages/messages/index')
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

const goToDesign = () => {
  navigateTo('/pages/design/index')
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

.profile-header {
  position: relative;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: var(--color-primary-gradient);
}

.profile-content {
  position: relative;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 20px);
}

.profile-main {
  display: flex;
  align-items: flex-start;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
}

.profile-main:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.profile-main:active {
  transform: scale(0.98);
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 4px solid var(--color-text-white);
  flex-shrink: 0;
  margin-right: var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.profile-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.profile-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-text-white);
  font-weight: var(--font-weight-medium);
}

.profile-badge.badge-volunteer {
  background: var(--color-success);
}

.profile-badge.badge-merchant {
  background: var(--color-warning);
}

.profile-badge.badge-elderly {
  background: #9C27B0;
}

.profile-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.profile-location {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-icon {
  font-size: 20px;
  color: var(--color-text-muted);
  margin-left: var(--spacing-sm);
  transition: transform var(--transition-smooth);
}

.profile-main:hover .edit-icon {
  transform: translateX(3px);
  color: var(--color-primary);
}

.stats-row {
  display: flex;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md) 0;
  box-shadow: var(--shadow-md);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
}

.stat-item:hover {
  background: var(--color-primary-soft);
  transform: translateY(-2px);
}

.stat-item:active {
  transform: scale(0.96);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--color-border-light);
}

.content {
  padding: var(--spacing-lg);
}

.menu-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.section-icon {
  font-size: 18px;
  margin-right: var(--spacing-sm);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.task-stats-card {
  background: var(--color-primary-gradient-soft);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  transition: transform var(--transition-smooth);
}

.task-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.task-stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.task-stats-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.task-stats-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.task-stats-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  flex: 1;
}

.task-stat-item:hover {
  background: var(--color-primary-soft);
  transform: translateY(-2px);
}

.task-stat-item:active {
  transform: scale(0.96);
}

.task-stat-num {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xs);
}

.task-stat-num.pending {
  background: var(--color-info-soft);
}

.task-stat-num.in-progress {
  background: var(--color-warning-soft);
}

.task-stat-num.completed {
  background: var(--color-success-soft);
}

.task-stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.task-stat-num.pending .task-stat-value {
  color: var(--color-info);
}

.task-stat-num.in-progress .task-stat-value {
  color: var(--color-warning);
}

.task-stat-num.completed .task-stat-value {
  color: var(--color-success);
}

.task-stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.task-stat-divider {
  width: 1px;
  height: 44px;
  background: var(--color-border-light);
}

.task-quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-action-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.task-action-card:hover {
  transform: translateX(6px);
  box-shadow: var(--shadow-md);
  background: var(--color-bg-primary);
}

.task-action-card:active {
  transform: scale(0.98);
}

.task-action-card.my-tasks {
  background: var(--color-info-soft);
  border-left: 3px solid var(--color-info);
}

.task-action-card.publish {
  background: var(--color-warning-soft);
  border-left: 3px solid var(--color-warning);
}

.task-action-card.browse {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.08), rgba(156, 39, 176, 0.04));
  border-left: 3px solid #9C27B0;
}

.action-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--color-text-white);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.action-icon {
  font-size: 22px;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.action-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.action-arrow {
  font-size: 22px;
  color: var(--color-text-muted);
  transition: transform var(--transition-smooth);
}

.task-action-card:hover .action-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.menu-card {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.menu-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.menu-list-item:hover {
  background: var(--color-primary-soft);
  padding-left: var(--spacing-lg);
}

.menu-list-item:active {
  background: var(--color-primary-soft);
}

.menu-list-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 0 var(--spacing-md);
}

.menu-list-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  transition: transform var(--transition-smooth);
}

.menu-icon-wrap.messages {
  background: var(--color-info-soft);
}

.menu-icon-wrap.privacy {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.08));
}

.menu-icon-wrap.address {
  background: var(--color-error-soft);
}

.menu-icon-wrap.about {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(20, 184, 166, 0.08));
}

.menu-icon-wrap.help {
  background: var(--color-warning-soft);
}

.menu-icon-wrap.feedback {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.12), rgba(156, 39, 176, 0.08));
}

.menu-list-item:hover .menu-icon-wrap {
  transform: scale(1.08) rotate(3deg);
}

.menu-list-icon {
  font-size: 20px;
}

.menu-list-content {
  display: flex;
  flex-direction: column;
}

.menu-list-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.menu-list-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.menu-list-right {
  display: flex;
  align-items: center;
}

.menu-list-badge {
  font-size: 11px;
  background: var(--color-error);
  color: var(--color-text-white);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  margin-right: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.menu-list-arrow {
  font-size: 22px;
  color: var(--color-text-muted);
  transition: transform var(--transition-smooth);
}

.menu-list-item:hover .menu-list-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.logout-btn {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-error);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
  border: 1px solid var(--color-error-soft);
}

.logout-btn:hover {
  background: var(--color-error-soft);
  border-color: var(--color-error);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.logout-btn:active {
  transform: scale(0.98);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.btn {
  padding: 12px 32px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-smooth);
  font-weight: var(--font-weight-semibold);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}

.safe-area-bottom {
  height: 100px;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft, rgba(255,107,53,0.1));
  color: var(--color-primary, #FF6B35);
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 480px) {
  .profile-main {
    padding: var(--spacing-lg);
  }
  
  .profile-avatar {
    width: 64px;
    height: 64px;
  }
  
  .profile-name {
    font-size: var(--font-size-md);
  }
  
  .menu-section {
    padding: var(--spacing-lg);
  }
  
  .task-stats-card {
    padding: var(--spacing-md);
  }
  
  .task-action-card {
    padding: var(--spacing-sm);
  }
  
  .action-icon-wrap {
    width: 40px;
    height: 40px;
  }
  
  .action-icon {
    font-size: 20px;
  }
}

@media (max-width: 360px) {
  .profile-content {
    padding: var(--spacing-md);
  }
  
  .content {
    padding: var(--spacing-md);
  }
  
  .task-stat-item {
    padding: var(--spacing-xs);
  }
  
  .task-stat-num {
    width: 44px;
    height: 44px;
  }
  
  .task-stat-value {
    font-size: var(--font-size-lg);
  }
}
</style>
