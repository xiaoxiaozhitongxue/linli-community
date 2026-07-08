<template>
  <div class="bottom-tab-bar">
    <div class="tab-line"></div>
    <div class="tab-bar-inner">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: isActive(tab.path) }"
        @click="switchTab(tab.path)"
      >
        <AppIcon class="tab-icon" :name="tab.icon" :size="24" />
        <span class="tab-label">{{ tab.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { switchTab as switchTabUtil } from '../utils/router'
import AppIcon from './AppIcon.vue'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => route.path)

const isActive = (path: string) => currentPath.value === path || currentPath.value.startsWith(path + '/')

const tabs = [
  {
    name: '首页',
    icon: 'home',
    path: '/pages/index/index'
  },
  {
    name: '互助',
    icon: 'handshake',
    path: '/pages/ai-helper/index'
  },
  {
    name: '消息',
    icon: 'message',
    path: '/pages/messages/index'
  },
  {
    name: '我的',
    icon: 'user',
    path: '/pages/profile/index'
  }
]

const switchTab = (path: string) => {
  switchTabUtil(path)
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-tabbar);
  background: #FFFFFF;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: #E8E8E8;
}

.tab-bar-inner {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  width: 100%;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 1;
  height: 100%;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: 4px 0;
  gap: 2px;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-icon {
  color: #999999;
  transition: color var(--transition-fast);
}

.tab-item.active .tab-icon {
  color: var(--color-primary);
}

.tab-label {
  font-size: 11px;
  color: #999999;
  font-weight: 400;
  line-height: 1;
  transition: color var(--transition-fast);
}

.tab-item.active .tab-label {
  color: var(--color-primary);
  font-weight: 700;
}

@media (min-width: 768px) {
  .tab-bar-inner {
    height: 50px;
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
