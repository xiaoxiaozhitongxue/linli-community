<template>
  <div
    class="navbar"
    :class="[
      `navbar--${type}`,
      { 'navbar--fixed': fixed, 'navbar--left': titleAlign === 'left' }
    ]"
    :style="headerStyle"
  >
    <div class="navbar-inner">
      <!-- 左侧：返回按钮 -->
      <div class="navbar-side navbar-side-left">
        <div
          v-if="showBack"
          class="navbar-back"
          :class="{ 'navbar-back--light': type === 'gradient' }"
          @click="handleBack"
        >
          <AppIcon name="close" :size="20" />
        </div>
      </div>

      <!-- 中间：标题 -->
      <div class="navbar-title">
        <slot name="title">
          <span class="navbar-title-text">{{ title }}</span>
        </slot>
      </div>

      <!-- 右侧：操作按钮或占位 -->
      <div class="navbar-side navbar-side-right">
        <slot name="action">
          <div
            v-if="actionText"
            class="navbar-action"
            :class="{ 'navbar-action--ghost': type === 'gradient' }"
            @click="$emit('action-click')"
          >
            {{ actionText }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{
  title: string
  showBack?: boolean
  type?: 'white' | 'gradient' | 'transparent'
  fixed?: boolean
  titleAlign?: 'center' | 'left'
  actionText?: string
  backUrl?: string
}>(), {
  showBack: true,
  type: 'white',
  fixed: false,
  titleAlign: 'center'
})

const emit = defineEmits<{
  'action-click': []
  'back-click': []
}>()

const router = useRouter()

const headerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.type === 'gradient') {
    style['--navbar-bg'] = 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFA07A 100%)'
  } else if (props.type === 'transparent') {
    style['--navbar-bg'] = 'transparent'
  } else {
    style['--navbar-bg'] = 'var(--color-bg-secondary)'
  }
  return style
})

function handleBack() {
  emit('back-click')
  if (props.backUrl) {
    router.push(props.backUrl)
  } else {
    if (window.history.length > 1) {
      router.back()
    }
  }
}
</script>

<style scoped>
.navbar {
  width: 100%;
  z-index: var(--z-sticky, 100);
}

.navbar--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}

.navbar--white {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.navbar--gradient {
  background: var(--navbar-bg);
  color: var(--color-text-white);
}

.navbar--transparent {
  background: transparent;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 var(--spacing-lg, 16px);
  padding-top: env(safe-area-inset-top, 0px);
}

.navbar--left .navbar-title {
  flex: 0 1 auto;
  text-align: left;
  padding-left: 4px;
}

.navbar-side {
  display: flex;
  align-items: center;
  min-width: 44px;
}

.navbar-side-left {
  justify-content: flex-start;
}

.navbar-side-right {
  justify-content: flex-end;
}

.navbar-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
  color: var(--color-text-primary);
}

.navbar-back:hover {
  background: rgba(0, 0, 0, 0.05);
}

.navbar-back:active {
  transform: scale(0.9);
}

.navbar-back--light {
  color: var(--color-text-white);
}

.navbar-back--light:hover {
  background: rgba(255, 255, 255, 0.15);
}

.navbar-title {
  flex: 1;
  text-align: center;
  overflow: hidden;
  padding: 0 4px;
}

.navbar-title-text {
  font-size: 17px;
  font-weight: var(--font-weight-semibold, 600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.navbar--gradient .navbar-title-text {
  color: var(--color-text-white);
}

.navbar-action {
  font-size: 14px;
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-primary);
  cursor: pointer;
  padding: 6px 14px;
  border-radius: var(--radius-md, 8px);
  background: var(--color-primary-soft, rgba(255, 107, 53, 0.1));
  transition: all var(--transition-fast, 150ms);
  white-space: nowrap;
}

.navbar-action:hover {
  background: var(--color-primary, #FF6B35);
  color: var(--color-text-white);
}

.navbar-action--ghost {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-white);
}

.navbar-action--ghost:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
