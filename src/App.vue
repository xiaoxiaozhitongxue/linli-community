<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from './components/Toast.vue'
import BottomTabBar from './components/BottomTabBar.vue'
import FloatingPublishButton from './components/FloatingPublishButton.vue'
import { useAuth } from './store'

const route = useRoute()
const router = useRouter()
const { initAuth } = useAuth()

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
  router.push('/pages/post/create')
}

// 处理发布活动
const handlePublishActivity = () => {
  router.push('/pages/activities/create')
}

// 处理发布互助
const handlePublishHelp = () => {
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
})
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <BottomTabBar v-if="showTabBar" />
    <Toast />
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
  padding-bottom: 65px; /* 为底部导航栏留出空间 */
}
</style>
