<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <text>←</text>
        </view>
        <text class="navbar-title">设置</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 账户设置 -->
      <view class="section">
        <view class="section-title">账户</view>
        <view class="menu-list">
          <view class="menu-item" @click="goEditProfile">
            <view class="menu-item-left">
              <text class="menu-item-icon">👤</text>
              <text class="menu-item-text">编辑资料</text>
            </view>
            <text class="menu-item-arrow">></text>
          </view>
          <view class="menu-item" @click="showPrivacy">
            <view class="menu-item-left">
              <text class="menu-item-icon">🔒</text>
              <text class="menu-item-text">隐私设置</text>
            </view>
            <text class="menu-item-arrow">></text>
          </view>
          <view class="menu-item" @click="showSecurity">
            <view class="menu-item-left">
              <text class="menu-item-icon">🛡️</text>
              <text class="menu-item-text">安全设置</text>
            </view>
            <text class="menu-item-arrow">></text>
          </view>
        </view>
      </view>

      <!-- 通知设置 -->
      <view class="section">
        <view class="section-title">通知</view>
        <view class="menu-list">
          <view class="menu-item">
            <view class="menu-item-left">
              <text class="menu-item-icon">🔔</text>
              <text class="menu-item-text">推送通知</text>
            </view>
            <switch :checked="notifications.push" @change="togglePush" color="var(--primary-color)" />
          </view>
          <view class="menu-item">
            <view class="menu-item-left">
              <text class="menu-item-icon">💬</text>
              <text class="menu-item-text">消息通知</text>
            </view>
            <switch :checked="notifications.message" @change="toggleMessage" color="var(--primary-color)" />
          </view>
          <view class="menu-item">
            <view class="menu-item-left">
              <text class="menu-item-icon">❤️</text>
              <text class="menu-item-text">互动通知</text>
            </view>
            <switch :checked="notifications.interaction" @change="toggleInteraction" color="var(--primary-color)" />
          </view>
        </view>
      </view>

      <!-- 通用设置 -->
      <view class="section">
        <view class="section-title">通用</view>
        <view class="menu-list">
          <view class="menu-item" @click="showTheme">
            <view class="menu-item-left">
              <text class="menu-item-icon">🎨</text>
              <text class="menu-item-text">主题设置</text>
            </view>
            <view class="menu-item-right">
              <text class="menu-item-value">{{ themeText }}</text>
              <text class="menu-item-arrow">></text>
            </view>
          </view>
          <view class="menu-item" @click="clearCache">
            <view class="menu-item-left">
              <text class="menu-item-icon">🗑️</text>
              <text class="menu-item-text">清除缓存</text>
            </view>
            <view class="menu-item-right">
              <text class="menu-item-value">{{ cacheSize }}</text>
              <text class="menu-item-arrow">></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="section">
        <view class="section-title">关于</view>
        <view class="menu-list">
          <view class="menu-item" @click="showAbout">
            <view class="menu-item-left">
              <text class="menu-item-icon">ℹ️</text>
              <text class="menu-item-text">关于我们</text>
            </view>
            <text class="menu-item-arrow">></text>
          </view>
          <view class="menu-item" @click="showFeedback">
            <view class="menu-item-left">
              <text class="menu-item-icon">💡</text>
              <text class="menu-item-text">意见反馈</text>
            </view>
            <text class="menu-item-arrow">></text>
          </view>
          <view class="menu-item">
            <view class="menu-item-left">
              <text class="menu-item-icon">📱</text>
              <text class="menu-item-text">版本信息</text>
            </view>
            <text class="menu-item-value">v1.0.0</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section" v-if="isLoggedIn">
        <view class="logout-btn" @click="logout">
          退出登录
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../store/index'

const { user, logout: authLogout, isLoggedIn } = useAuth()
const statusBarHeight = ref(20)

const notifications = ref({
  push: true,
  message: true,
  interaction: true
})

const theme = ref('light')
const cacheSize = ref('0MB')

const themeText = computed(() => {
  return theme.value === 'light' ? '浅色' : '深色'
})

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loadSettings()
})

const goBack = () => {
  uni.navigateBack()
}

const goEditProfile = () => {
  uni.navigateTo({ url: '/pages/profile/edit' })
}

const loadSettings = () => {
  try {
    const savedNotifications = uni.getStorageSync('notifications')
    const savedTheme = uni.getStorageSync('theme')
    
    if (savedNotifications) {
      notifications.value = JSON.parse(savedNotifications)
    }
    if (savedTheme) {
      theme.value = savedTheme
    }
    
    cacheSize.value = '12.5MB'
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const saveSettings = () => {
  try {
    uni.setStorageSync('notifications', JSON.stringify(notifications.value))
    uni.setStorageSync('theme', theme.value)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

const togglePush = (e: any) => {
  notifications.value.push = e.detail.value
  saveSettings()
}

const toggleMessage = (e: any) => {
  notifications.value.message = e.detail.value
  saveSettings()
}

const toggleInteraction = (e: any) => {
  notifications.value.interaction = e.detail.value
  saveSettings()
}

const showPrivacy = () => {
  uni.showToast({ title: '隐私设置即将上线', icon: 'none' })
}

const showSecurity = () => {
  uni.showToast({ title: '安全设置即将上线', icon: 'none' })
}

const showTheme = () => {
  uni.showActionSheet({
    itemList: ['浅色模式', '深色模式'],
    success: (res) => {
      theme.value = res.tapIndex === 0 ? 'light' : 'dark'
      saveSettings()
      uni.showToast({ title: '设置成功', icon: 'success' })
    }
  })
}

const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存吗？',
    success: (res) => {
      if (res.confirm) {
        cacheSize.value = '0MB'
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    }
  })
}

const showAbout = () => {
  uni.showToast({ title: '关于我们即将上线', icon: 'none' })
}

const showFeedback = () => {
  uni.showToast({ title: '意见反馈即将上线', icon: 'none' })
}

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账户吗？',
    success: (res) => {
      if (res.confirm) {
        authLogout()
        uni.navigateBack()
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 导航栏 */
.navbar {
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 44px;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.placeholder {
  width: 44px;
}

.content {
  height: calc(100vh - 60px);
}

/* 分区 */
.section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  color: var(--text-muted);
  padding: 12px 16px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 菜单列表 */
.menu-list {
  background: var(--card-bg);
  margin: 0 12px;
  border-radius: 12px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-item-icon {
  font-size: 18px;
  margin-right: 12px;
}

.menu-item-text {
  font-size: 15px;
  color: var(--text-primary);
}

.menu-item-right {
  display: flex;
  align-items: center;
}

.menu-item-value {
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 8px;
}

.menu-item-arrow {
  font-size: 14px;
  color: var(--text-muted);
}

/* 退出登录 */
.logout-section {
  padding: 24px 12px;
}

.logout-btn {
  background: var(--card-bg);
  color: #F44336;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
}
</style>
