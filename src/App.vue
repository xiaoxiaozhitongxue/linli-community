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
const TAB_BAR_PAGES = ['/pages/index/index', '/pages/ai-helper/index', '/pages/messages/index', '/pages/profile/index']
const FLOATING_BUTTON_PAGES = ['/pages/index/index', '/pages/ai-helper/index']

const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

const showTabBar = computed(() => {
  return TAB_BAR_PAGES.some(path => route.path.startsWith(path))
})

const showFloatingPublishButton = computed(() => {
  return FLOATING_BUTTON_PAGES.some(path => route.path === path)
})

const navigateIfLoggedIn = (path: string) => {
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }
  router.push(path)
}

const handlePublishPost = () => navigateIfLoggedIn('/pages/post/create')
const handlePublishActivity = () => navigateIfLoggedIn('/pages/activities/create')
const handlePublishHelp = () => navigateIfLoggedIn('/pages/ai-helper/publish')

const recordActiveTime = () => {
  localStorage.setItem('lastActiveTime', Date.now().toString())
}

onMounted(() => {
  initAuth()
  recordActiveTime()
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
  <div class="app-container">
    <SideNav v-if="isDesktop" />
    <div class="main-content" :class="{ desktop: isDesktop }">
      <router-view v-slot="{ Component }">
        <transition name="page-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <BottomTabBar v-if="showTabBar && !isDesktop" />
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
    padding-bottom: calc(56px + var(--safe-area-bottom, 0px) + 8px);
  }
  
  .main-content {
    width: 100%;
  }
}
</style>
