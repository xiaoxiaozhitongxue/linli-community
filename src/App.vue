<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Toast from './components/Toast.vue'
import BottomTabBar from './components/BottomTabBar.vue'

const route = useRoute()

// 判断是否显示底部导航栏的页面
const showTabBar = computed(() => {
  const path = route.path
  const tabPages = [
    '/pages/index/index',
    '/pages/neighborhood/index',
    '/pages/ai-helper/index',
    '/pages/business/index',
    '/pages/profile/index'
  ]
  return tabPages.some(tabPath => path.startsWith(tabPath))
})

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
