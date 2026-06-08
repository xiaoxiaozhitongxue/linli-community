<template>
  <div class="floating-publish-container" @click.stop>
    <!-- 遮罩层 -->
    <div
      v-if="isExpanded"
      class="mask-overlay"
      @click.stop="closeMenu"
    ></div>

    <!-- 选项菜单 -->
    <transition name="menu-expand" @before-enter="onBeforeEnter" @after-enter="onAfterEnter" @before-leave="onBeforeLeave" @after-leave="onAfterLeave">
      <div v-if="isExpanded" class="publish-menu" @click.stop>
        <div
          v-for="(item, index) in menuItems"
          :key="item.id"
          class="menu-item"
          :style="{ transitionDelay: `${index * 50}ms`, animationDelay: `${index * 50}ms` }"
          @click.stop="handleMenuItemClick(item)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </div>
      </div>
    </transition>

    <!-- 主按钮 -->
    <div 
      class="main-button"
      :class="{ expanded: isExpanded }"
      @click.stop="toggleMenu"
    >
      <span class="main-icon" :class="{ rotated: isExpanded }">+</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const emit = defineEmits<{
  (e: 'publish-post'): void
  (e: 'publish-activity'): void
  (e: 'publish-help'): void
}>()

const isExpanded = ref(false)
const isAnimating = ref(false)
const isTransitioning = ref(false)

const menuItems = [
  { id: 'post', label: '发布动态', icon: '📝' },
  { id: 'activity', label: '发布活动', icon: '🎉' },
  { id: 'help', label: '发布互助', icon: '🤝' }
]

let toggleTimeout: ReturnType<typeof setTimeout> | null = null

const toggleMenu = () => {
  if (isAnimating.value || isTransitioning.value) return

  if (toggleTimeout) return
  toggleTimeout = setTimeout(() => {
    toggleTimeout = null
  }, 300)

  isTransitioning.value = true
  isExpanded.value = !isExpanded.value
}

const closeMenu = () => {
  if (isAnimating.value || isTransitioning.value) return
  isTransitioning.value = true
  isExpanded.value = false
}

const onBeforeEnter = () => {
  isAnimating.value = true
}

const onAfterEnter = () => {
  isAnimating.value = false
  isTransitioning.value = false
}

const onBeforeLeave = () => {
  isAnimating.value = true
}

const onAfterLeave = () => {
  isAnimating.value = false
  isTransitioning.value = false
}

const handleMenuItemClick = (item: { id: string }) => {
  if (isAnimating.value) return

  nextTick(() => {
    closeMenu()
    switch (item.id) {
      case 'post':
        emit('publish-post')
        break
      case 'activity':
        emit('publish-activity')
        break
      case 'help':
        emit('publish-help')
        break
    }
  })
}
</script>

<style scoped>
.floating-publish-container {
  position: fixed;
  right: 20px;
  bottom: calc(60px + var(--spacing-lg));
  z-index: var(--z-fab);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  isolation: isolate;
}

.mask-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--mask-bg);
  z-index: var(--z-fab-mask);
  cursor: default;
  will-change: opacity;
  transition: opacity var(--transition-smooth);
}

.publish-menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  position: relative;
  z-index: var(--z-fab-menu);
  pointer-events: auto;
  will-change: transform, opacity;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-bg-secondary);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  opacity: 1;
  transform: translateY(0);
  will-change: transform, box-shadow;
  user-select: none;
  white-space: nowrap;
  min-height: var(--touch-min-size);
  min-width: 120px;
}

.menu-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.menu-item:active {
  transform: translateY(-1px) scale(0.98);
}

.menu-expand-enter-active {
  transition: all var(--transition-expand);
}

.menu-expand-leave-active {
  transition: all var(--transition-collapse);
}

.menu-expand-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.92);
}

.menu-expand-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.menu-expand-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.menu-icon {
  font-size: 20px;
}

.menu-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.main-button {
  width: var(--fab-size);
  height: var(--fab-size);
  border-radius: 50%;
  background: var(--color-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-fab);
  cursor: pointer;
  transition: all var(--transition-spring);
  will-change: transform, box-shadow;
  transform: translateZ(0);
  backface-visibility: hidden;
  position: relative;
  overflow: hidden;
  opacity: 1;
}

.main-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.main-button:hover {
  transform: scale(1.08) translateZ(0);
  box-shadow: var(--shadow-fab-hover);
}

.main-button:hover::before {
  opacity: 1;
}

.main-button:active {
  transform: scale(1.02) translateZ(0);
  box-shadow: var(--shadow-fab);
}

.main-button.expanded {
  transform: rotate(45deg) translateZ(0);
}

.main-button.expanded:hover {
  transform: rotate(45deg) scale(1.05) translateZ(0);
}

.main-icon {
  font-size: 28px;
  color: var(--color-text-white);
  font-weight: 300;
  line-height: 1;
  transition: transform var(--transition-spring);
  will-change: transform;
  position: relative;
  z-index: 1;
}

.main-icon.rotated {
  transform: rotate(0deg);
}

@media (min-width: 500px) {
  .floating-publish-container {
    right: 20px;
  }
}

@media (min-width: 768px) {
  .floating-publish-container {
    right: 20px;
    bottom: calc(60px + var(--spacing-lg));
  }
  
  .menu-item {
    padding: var(--spacing-md) var(--spacing-xl);
  }
}

@media (min-width: 1024px) {
  .floating-publish-container {
    right: 20px;
    bottom: calc(60px + var(--spacing-lg));
  }
}

@media (min-width: 1440px) {
  .floating-publish-container {
    right: 20px;
  }
}
</style>
