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
          <div class="stat-item" @click="goToMyPosts">
            <span class="stat-value">{{ stats.posts }}</span>
            <span class="stat-label">动态</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goToMyActivities">
            <span class="stat-value">{{ stats.activities }}</span>
            <span class="stat-label">活动</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goToMyCredits">
            <span class="stat-value">{{ user?.credit_score || 0 }}</span>
            <span class="stat-label">信用分</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="goToMyFavorites">
            <span class="stat-value">{{ stats.favorites }}</span>
            <span class="stat-label">收藏</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content" scroll-y v-if="isLoggedIn">
      <!-- 我的服务 -->
      <div class="menu-section">
        <div class="menu-title">我的服务</div>
        <div class="menu-grid">
          <div class="menu-item" @click="goToMyPosts">
            <div class="menu-icon" style="background: #E8F5E9;">
              <span>📝</span>
            </div>
            <span class="menu-text">我的动态</span>
          </div>
          <div class="menu-item" @click="goToMyActivities">
            <div class="menu-icon" style="background: #E3F2FD;">
              <span>🎯</span>
            </div>
            <span class="menu-text">我的活动</span>
          </div>
          <div class="menu-item" @click="goToMyFavorites">
            <div class="menu-icon" style="background: #FFF3E0;">
              <span>⭐</span>
            </div>
            <span class="menu-text">我的收藏</span>
          </div>
          <div class="menu-item" @click="goToEditProfile">
            <div class="menu-icon" style="background: #FCE4EC;">
              <span>👤</span>
            </div>
            <span class="menu-text">资料编辑</span>
          </div>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="menu-section">
        <div class="menu-title">常用功能</div>
        <div class="menu-list">
          <div class="menu-list-item" v-for="item in menuItems" :key="item.id" @click="goToMenu(item)">
            <div class="menu-list-left">
              <span class="menu-list-icon">{{ item.icon }}</span>
              <span class="menu-list-text">{{ item.name }}</span>
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
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../store/index'
import { userApi } from '../../utils/api'
import { navigateTo } from '../../utils/router'
import { toastInfo } from '../../utils/toast'
import { showModal } from '../../utils/ui'

const { user, logout: authLogout, isLoggedIn, initAuth, updateUser } = useAuth()
const statusBarHeight = ref(20)
const loading = ref(false)

const stats = ref({
  posts: 0,
  activities: 0,
  favorites: 0
})

const menuItems = ref([
  { id: '1', name: '消息通知', icon: '🔔' },
  { id: '2', name: '收货地址', icon: '📍' },
  { id: '3', name: '帮助中心', icon: '❓' },
  { id: '4', name: '关于我们', icon: 'ℹ️' },
  { id: '5', name: '设置', icon: '⚙️' }
])

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
    await loadStats()
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const [postsRes, activitiesRes, favoritesRes] = await Promise.all([
      userApi.getMyPosts({ limit: 1 }),
      userApi.getMyActivities({ limit: 1 }),
      userApi.getMyFavorites({ limit: 1 })
    ])
    stats.value = {
      posts: postsRes.total,
      activities: activitiesRes.total,
      favorites: favoritesRes.total
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const goToEditProfile = () => {
  navigateTo('/pages/profile/edit')
}

const goToMyPosts = () => {
  navigateTo('/pages/profile/my-posts')
}

const goToMyActivities = () => {
  navigateTo('/pages/profile/my-activities')
}

const goToMyFavorites = () => {
  navigateTo('/pages/profile/my-favorites')
}

const goToMyCredits = () => {
  toastInfo('信用分详情即将上线')
}

const goToMenu = (item: any) => {
  if (item.id === '5') {
    navigateTo('/pages/profile/settings')
  } else {
    toastInfo('功能即将上线')
  }
}

const goToLogin = () => {
  navigateTo('/pages/login/index')
}

const logout = () => {
  showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
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
  height: 200px;
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
  margin-bottom: var(--spacing-lg);
  cursor: pointer;
}

.profile-avatar {
  width: 72px;
  height: 72px;
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
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.stat-item {
  text-align: center;
  cursor: pointer;
}

.stat-value {
  font-size: 20px;
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
}

.content {
  min-height: calc(100vh - 220px);
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
  padding: var(--spacing-lg);
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.menu-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: var(--spacing-xs);
}

.menu-text {
  font-size: 12px;
  color: var(--text-secondary);
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
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
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
}
</style>
