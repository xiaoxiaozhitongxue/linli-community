<template>
  <div class="bottom-tab-bar">
    <div class="tab-bar-bg"></div>
    <div class="tab-bar-inner">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: currentPath === tab.path || currentPath.startsWith(tab.path + '/') }"
        @click="switchTab(tab.path)"
        @touchstart.passive="handleTouchStart(tab.path)"
        @touchend="handleTouchEnd"
        @mousedown="handleTouchStart(tab.path)"
        @mouseup="handleTouchEnd"
        @mouseleave="handleTouchEnd"
      >
        <div class="tab-icon-wrap">
          <div class="tab-icon-bg"></div>
          <span class="tab-icon">{{ tab.icon }}</span>
          <div class="ripple-effect" v-if="pressedTab === tab.path"></div>
          <div class="icon-glow" v-if="currentPath === tab.path || currentPath.startsWith(tab.path + '/')"></div>
        </div>
        <span class="tab-label">{{ tab.name }}</span>
        <div class="active-indicator">
          <div class="indicator-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { switchTab as switchTabUtil } from '../utils/router'

const router = useRouter()
const route = useRoute()
const pressedTab = ref<string | null>(null)

const currentPath = computed(() => route.path)

const tabs = [
  {
    name: '首页',
    icon: '🏠',
    path: '/pages/index/index'
  },
  {
    name: '互助',
    icon: '🤝',
    path: '/pages/ai-helper/index'
  },
  {
    name: '消息',
    icon: '💬',
    path: '/pages/messages/index'
  },
  {
    name: '我的',
    icon: '👤',
    path: '/pages/profile/index'
  }
]

const switchTab = (path: string) => {
  switchTabUtil(path)
}

const handleTouchStart = (path: string) => {
  pressedTab.value = path
}

const handleTouchEnd = () => {
  pressedTab.value = null
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-tabbar);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,1) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
}

.tab-bar-inner {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  padding: 0;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: all var(--transition-bounce);
  flex: 1;
  height: 100%;
  min-height: var(--touch-large-size);
  border-radius: 20px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.tab-item:hover .tab-icon-bg {
  background: rgba(255, 140, 66, 0.06);
}

.tab-item:active {
  transform: scale(0.92);
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 5px;
  transition: all var(--transition-bounce);
}

.tab-icon-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.02);
  transition: all var(--transition-normal);
}

.tab-item.active .tab-icon-wrap {
  transform: translateY(-2px);
}

.tab-item.active .tab-icon-bg {
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.15) 0%, rgba(255, 107, 53, 0.1) 100%);
}

.tab-icon {
  font-size: 26px;
  transition: all var(--transition-bounce);
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.tab-item.active .tab-icon {
  transform: scale(1.18);
  filter: drop-shadow(0 2px 4px rgba(255, 140, 66, 0.3));
  animation: iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 140, 66, 0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: glowPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes iconPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1.18); }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
}

.tab-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family);
  transition: all var(--transition-bounce);
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.tab-item.active .tab-label {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  text-shadow: 0 1px 3px rgba(255, 140, 66, 0.15);
  animation: labelPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes labelPop {
  0% { transform: scale(0.8); opacity: 0.7; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.active-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-dot {
  width: 0;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  transition: all var(--transition-bounce);
  opacity: 0.3;
}

.tab-item.active .indicator-dot {
  width: 20px;
  animation: indicatorSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes indicatorSlide {
  0% { width: 0; opacity: 0; }
  100% { width: 20px; opacity: 1; }
}

.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 140, 66, 0.35) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  animation: rippleExpand 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none;
  z-index: 10;
}

@keyframes rippleExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* 平板设备 (768px+) */
@media (min-width: 768px) {
  .tab-bar-inner {
    height: 64px;
    padding: 0 60px;
    max-width: 600px;
  }
  
  .tab-item {
    padding: 8px 16px;
    min-height: 64px;
  }
  
  .tab-icon-wrap {
    width: 52px;
    height: 52px;
  }
  
  .tab-icon {
    font-size: 28px;
  }
  
  .tab-label {
    font-size: var(--font-size-sm);
  }

  .tab-item.active .tab-label {
    font-size: var(--font-size-md);
  }
}

/* 电脑设备 (1024px+) */
@media (min-width: 1024px) {
  .tab-bar-inner {
    height: 64px;
    padding: 0 120px;
    max-width: 700px;
  }
  
  .tab-item {
    padding: 10px 24px;
  }
  
  .tab-item:hover .tab-icon-wrap {
    transform: translateY(-1px);
  }
}

/* 小屏设备 (≤374px) */
@media (max-width: 374px) {
  .tab-bar-inner {
    height: 52px;
  }
  
  .tab-item {
    padding: 4px 8px;
    min-height: 52px;
  }
  
  .tab-icon-wrap {
    width: 42px;
    height: 42px;
  }
  
  .tab-icon {
    font-size: 22px;
  }
  
  .tab-label {
    font-size: 10px;
  }

  .tab-item.active .tab-label {
    font-size: 11px;
  }
}

/* 大屏幕优化 (≥1440px) */
@media (min-width: 1440px) {
  .tab-bar-inner {
    max-width: 800px;
  }
}
</style>
