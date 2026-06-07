<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from './components/Toast.vue'
import BottomTabBar from './components/BottomTabBar.vue'

const route = useRoute()
const router = useRouter()

// 被屏蔽的页面路径
const blockedPages = [
  '/pages/index/index',
  '/pages/neighborhood/index',
  '/pages/business/index'
]

// 判断是否显示底部导航栏的页面
const showTabBar = computed(() => {
  const path = route.path
  const tabPages = [
    '/pages/ai-helper/index',
    '/pages/message/index',
    '/pages/profile/index'
  ]
  return tabPages.some(tabPath => path.startsWith(tabPath))
})

// 路由守卫：检查是否访问被屏蔽的页面
watch(() => route.path, (newPath) => {
  if (blockedPages.includes(newPath)) {
    router.replace('/pages/ai-helper/index')
  }
}, { immediate: true })

onMounted(() => {
  console.log('App Launch')
})
</script>

<template>
  <div class="app-container">
    <router-view />
    <BottomTabBar v-if="showTabBar" />
    <Toast />
  </div>
</template>

<style>
@import './styles/base.css';

.app-container {
  min-height: 100vh;
  padding-bottom: 65px; /* 为底部导航栏留出空间 */
}
</style>
