<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="navbar-content">
        <div class="back-btn" @click="goBack">
          <span>←</span>
        </div>
        <span class="navbar-title">设置</span>
        <div class="placeholder"></div>
      </div>
    </div>

    <div class="scroll-content">
      <!-- 账户设置 -->
      <div class="section">
        <div class="section-title">账户</div>
        <div class="menu-list">
          <div class="menu-item" @click="goEditProfile">
            <div class="menu-item-left">
              <span class="menu-item-icon">👤</span>
              <span class="menu-item-text">编辑资料</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </div>
          <div class="menu-item" @click="showPrivacy">
            <div class="menu-item-left">
              <span class="menu-item-icon">🔒</span>
              <span class="menu-item-text">隐私设置</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </div>
          <div class="menu-item" @click="showSecurity">
            <div class="menu-item-left">
              <span class="menu-item-icon">🛡️</span>
              <span class="menu-item-text">安全设置</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="section">
        <div class="section-title">通知</div>
        <div class="menu-list">
          <div class="menu-item">
            <div class="menu-item-left">
              <span class="menu-item-icon">🔔</span>
              <span class="menu-item-text">推送通知</span>
            </div>
            <div class="toggle-switch" :class="{ active: notifications.push }" @click="togglePush">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="menu-item">
            <div class="menu-item-left">
              <span class="menu-item-icon">💬</span>
              <span class="menu-item-text">消息通知</span>
            </div>
            <div class="toggle-switch" :class="{ active: notifications.message }" @click="toggleMessage">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <div class="menu-item">
            <div class="menu-item-left">
              <span class="menu-item-icon">❤️</span>
              <span class="menu-item-text">互动通知</span>
            </div>
            <div class="toggle-switch" :class="{ active: notifications.interaction }" @click="toggleInteraction">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 通用设置 -->
      <div class="section">
        <div class="section-title">通用</div>
        <div class="menu-list">
          <div class="menu-item" @click="showThemeSelector">
            <div class="menu-item-left">
              <span class="menu-item-icon">🎨</span>
              <span class="menu-item-text">主题设置</span>
            </div>
            <div class="menu-item-right">
              <span class="menu-item-value">{{ themeText }}</span>
              <span class="menu-item-arrow">›</span>
            </div>
          </div>
          <div class="menu-item" @click="clearCache">
            <div class="menu-item-left">
              <span class="menu-item-icon">🗑️</span>
              <span class="menu-item-text">清除缓存</span>
            </div>
            <div class="menu-item-right">
              <span class="menu-item-value">{{ cacheSize }}</span>
              <span class="menu-item-arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="section">
        <div class="section-title">关于</div>
        <div class="menu-list">
          <div class="menu-item" @click="showAbout">
            <div class="menu-item-left">
              <span class="menu-item-icon">ℹ️</span>
              <span class="menu-item-text">关于我们</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </div>
          <div class="menu-item" @click="showFeedback">
            <div class="menu-item-left">
              <span class="menu-item-icon">💡</span>
              <span class="menu-item-text">意见反馈</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </div>
          <div class="menu-item">
            <div class="menu-item-left">
              <span class="menu-item-icon">📱</span>
              <span class="menu-item-text">版本信息</span>
            </div>
            <span class="menu-item-value">v1.0.0</span>
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-section" v-if="isLoggedIn">
        <div class="logout-btn" @click="logout">
          退出登录
        </div>
      </div>

      <!-- 主题选择弹窗 -->
      <div v-if="showThemeModal" class="modal-mask" @click="showThemeModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-title">选择主题</div>
          <div class="theme-option" :class="{ active: theme === 'light' }" @click="setTheme('light')">
            浅色模式
          </div>
          <div class="theme-option" :class="{ active: theme === 'dark' }" @click="setTheme('dark')">
            深色模式
          </div>
          <div class="modal-cancel" @click="showThemeModal = false">取消</div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../store/index'
import { navigateBack } from '../../utils/router'
import { navigateTo } from '../../utils/router'
import { toastInfo, toastSuccess } from '../../utils/toast'
import { showModal } from '../../utils/ui'

const { user, logout: authLogout, isLoggedIn } = useAuth()
const statusBarHeight = ref(20)

const notifications = ref({
  push: true,
  message: true,
  interaction: true
})

const theme = ref('light')
const showThemeModal = ref(false)
const cacheSize = ref('0MB')

const themeText = computed(() => {
  return theme.value === 'light' ? '浅色' : '深色'
})

onMounted(() => {
  statusBarHeight.value = 20
  loadSettings()
})

const goBack = () => {
  navigateBack()
}

const goEditProfile = () => {
  navigateTo('/pages/profile/edit')
}

const loadSettings = () => {
  try {
    const savedNotifications = localStorage.getItem('notifications')
    const savedTheme = localStorage.getItem('theme')

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
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
    localStorage.setItem('theme', theme.value)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

const togglePush = () => {
  notifications.value.push = !notifications.value.push
  saveSettings()
}

const toggleMessage = () => {
  notifications.value.message = !notifications.value.message
  saveSettings()
}

const toggleInteraction = () => {
  notifications.value.interaction = !notifications.value.interaction
  saveSettings()
}

const showPrivacy = () => {
  toastInfo('隐私设置即将上线')
}

const showSecurity = () => {
  toastInfo('安全设置即将上线')
}

const showThemeSelector = () => {
  showThemeModal.value = true
}

const setTheme = (value: 'light' | 'dark') => {
  theme.value = value
  showThemeModal.value = false
  saveSettings()
  toastSuccess('设置成功')
}

const clearCache = () => {
  showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存吗？',
    success: (res: any) => {
      if (res.confirm) {
        cacheSize.value = '0MB'
        toastSuccess('清除成功')
      }
    }
  })
}

const showAbout = () => {
  toastInfo('关于我们即将上线')
}

const showFeedback = () => {
  toastInfo('意见反馈即将上线')
}

const logout = () => {
  showModal({
    title: '退出登录',
    content: '确定要退出当前账户吗？',
    success: (res: any) => {
      if (res.confirm) {
        authLogout()
        navigateBack()
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
  cursor: pointer;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.placeholder {
  width: 44px;
}

.scroll-content {
  overflow-y: auto;
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
  cursor: pointer;
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

/* 自定义开关 */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background: #e0e0e0;
  border-radius: 13px;
  transition: background 0.3s;
  cursor: pointer;
}

.toggle-switch.active {
  background: var(--primary-color);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(22px);
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
  cursor: pointer;
}

/* 主题选择弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 500px;
  padding: 20px 16px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 16px;
}

.theme-option {
  padding: 16px;
  text-align: center;
  font-size: 15px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.theme-option.active {
  color: var(--primary-color);
  font-weight: 500;
}

.modal-cancel {
  padding: 16px;
  text-align: center;
  font-size: 15px;
  color: var(--text-muted);
  cursor: pointer;
  margin-top: 8px;
}
</style>