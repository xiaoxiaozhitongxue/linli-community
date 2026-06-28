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
import { navigateBackSmart } from '../../utils/router'
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
  navigateBackSmart()
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
  } catch {
    // 静默处理
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
    localStorage.setItem('theme', theme.value)
  } catch {
    // 静默处理
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
  navigateTo('/pages/profile/privacy')
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
  navigateTo('/pages/profile/about')
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
        navigateBackSmart('/pages/index/index')
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* 导航栏 */
.navbar {
  background: var(--color-bg-secondary);
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
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.back-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  color: var(--color-text-tertiary);
  padding: 12px 16px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 菜单列表 */
.menu-list {
  background: var(--color-bg-secondary);
  margin: 0 12px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.menu-item:hover {
  background-color: var(--color-bg-tertiary);
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
  color: var(--color-text-primary);
}

.menu-item-right {
  display: flex;
  align-items: center;
}

.menu-item-value {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-right: 8px;
}

.menu-item-arrow {
  font-size: 14px;
  color: var(--color-text-muted);
}

/* 自定义开关 */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  transition: all var(--transition-smooth);
  cursor: pointer;
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: var(--color-text-white);
  border-radius: var(--radius-full);
  transition: transform var(--transition-smooth);
  box-shadow: var(--shadow-sm);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(22px);
}

/* 退出登录 */
.logout-section {
  padding: 24px 12px;
}

.logout-btn {
  background: var(--color-bg-secondary);
  color: #F44336;
  padding: 16px;
  border-radius: var(--radius-xl);
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
}

.logout-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 主题选择弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-overlay);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 500px;
  padding: 20px 16px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-2xl);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 16px;
}

.theme-option {
  padding: 16px;
  text-align: center;
  font-size: 15px;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-radius: var(--radius-sm);
  margin: 0 4px;
}

.theme-option:hover {
  background-color: var(--color-bg-tertiary);
}

.theme-option.active {
  color: var(--color-primary);
  font-weight: 500;
  background: var(--color-primary-soft);
}

.modal-cancel {
  padding: 16px;
  text-align: center;
  font-size: 15px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  margin-top: 8px;
  transition: color var(--transition-fast);
}

.modal-cancel:hover {
  color: var(--color-text-secondary);
}
</style>