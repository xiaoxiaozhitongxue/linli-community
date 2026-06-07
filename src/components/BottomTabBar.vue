<template>
  <div class="bottom-tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: currentPath === tab.path || currentPath.startsWith(tab.path + '/') }"
      @click="switchTab(tab.path)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => route.path)

const tabs = [
  {
    name: '首页',
    icon: '🏠',
    path: '/pages/index/index'
  },
  {
    name: '邻里',
    icon: '👥',
    path: '/pages/neighborhood/index'
  },
  {
    name: 'AI互助',
    icon: '🤝',
    path: '/pages/ai-helper/index'
  },
  {
    name: '创业',
    icon: '💼',
    path: '/pages/business/index'
  },
  {
    name: '我的',
    icon: '👤',
    path: '/pages/profile/index'
  }
]

const switchTab = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  padding: 8px 0;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 2px;
  filter: grayscale(1);
  opacity: 0.5;
  transition: all 0.2s;
}

.tab-label {
  font-size: 12px;
  color: #999;
  transition: all 0.2s;
}

.tab-item.active .tab-icon {
  filter: none;
  opacity: 1;
}

.tab-item.active .tab-label {
  color: #0066CC;
  font-weight: 600;
}
</style>
