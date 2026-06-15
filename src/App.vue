<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from './components/Toast.vue'
import BottomTabBar from './components/BottomTabBar.vue'
import SideNav from './components/SideNav.vue'
import FloatingPublishButton from './components/FloatingPublishButton.vue'
import { useAuth } from './store'
import { showLoginGuide, setLoginRedirect } from './utils/auth'

const route = useRoute()
const router = useRouter()
const { initAuth, isLoggedIn } = useAuth()

const isDesktop = ref(false)

const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

// 判断是否显示底部导航栏的页面
const showTabBar = computed(() => {
  const path = route.path
  const tabPages = [
    '/pages/index/index',
    '/pages/ai-helper/index',
    '/pages/messages/index',
    '/pages/profile/index'
  ]
  return tabPages.some(tabPath => path.startsWith(tabPath))
})

// 判断是否显示悬浮发布按钮（只在首页和互助页面显示）
const showFloatingPublishButton = computed(() => {
  const path = route.path
  const showPages = [
    '/pages/index/index',
    '/pages/ai-helper/index'
  ]
  return showPages.some(showPath => path === showPath)
})

// 处理发布动态
const handlePublishPost = () => {
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }
  router.push('/pages/post/create')
}

// 处理发布活动
const handlePublishActivity = () => {
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }
  router.push('/pages/activities/create')
}

// 处理发布互助
const handlePublishHelp = () => {
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }
  router.push('/pages/ai-helper/publish')
}

// 记录用户活跃时间到localStorage
const recordActiveTime = () => {
  const now = Date.now()
  localStorage.setItem('lastActiveTime', now.toString())
}

// 检测用户是否超过24小时未打卡
const checkInactiveStatus = () => {
  const lastActiveTime = localStorage.getItem('lastActiveTime')
  if (!lastActiveTime) {
    console.log('通知: 首次使用应用，欢迎开始您的健康打卡之旅！')
    return
  }
  
  const now = Date.now()
  const lastTime = parseInt(lastActiveTime, 10)
  const twentyFourHours = 24 * 60 * 60 * 1000 // 24小时的毫秒数
  
  if (now - lastTime > twentyFourHours) {
    console.log('通知: 您已超过24小时未进行健康打卡，请记得打卡保持健康记录！')
  }
}

onMounted(() => {
  console.log('App Launch')
  // 初始化认证状态
  initAuth()
  recordActiveTime()
  checkInactiveStatus()
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="app-container">
    <!-- 桌面端左侧导航栏 -->
    <SideNav v-if="isDesktop" />

    <!-- 主内容区 -->
    <div class="main-content" :class="{ desktop: isDesktop }">
      <router-view v-slot="{ Component }">
        <transition name="page-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 移动端底部导航栏 -->
    <BottomTabBar v-if="showTabBar && !isDesktop" />

    <Toast />

    <!-- 悬浮发布按钮（移动端和桌面端都显示） -->
    <FloatingPublishButton 
      v-if="showFloatingPublishButton"
      @publish-post="handlePublishPost"
      @publish-activity="handlePublishActivity"
      @publish-help="handlePublishHelp"
    />
  </div>
</template>

<style>
@import './styles/base.css';

.app-container {
  min-height: 100vh;
  display: flex;
  width: 100%;
  max-width: 100%;
}

.main-content {
  flex: 1;
  overflow-x: hidden;
  min-height: 100vh;
  width: 100%;
}

.main-content.desktop {
  margin-left: var(--nav-sidebar-width, 220px);
  padding-bottom: 0;
  width: calc(100% - var(--nav-sidebar-width, 220px));
}

@media (max-width: 1023px) {
  .app-container {
    padding-bottom: 65px;
  }
  
  .main-content {
    width: 100%;
  }
}
</style>
