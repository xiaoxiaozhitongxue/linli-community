<template>
  <div
    class="navbar"
    :class="{ 'navbar--fixed': fixed }"
  >
    <!-- 默认 slot 模式：自定义全宽内容 -->
    <div v-if="$slots.default" class="navbar-inner navbar-inner--custom">
      <slot />
    </div>

    <!-- 标准三栏布局 -->
    <div v-else class="navbar-inner">
      <!-- 左侧：返回按钮 -->
      <div class="navbar-side navbar-side-left">
        <div
          v-if="showBack"
          class="navbar-back"
          @click="handleBack"
        >
          <AppIcon name="chevron-left" :size="20" />
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
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{
  title: string
  showBack?: boolean
  fixed?: boolean
  actionText?: string
  backUrl?: string
}>(), {
  showBack: true,
  fixed: false
})

const emit = defineEmits<{
  'action-click': []
  'back-click': []
}>()

const router = useRouter()

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
  background: #FFFFFF;
  border-bottom: 1px solid #F0F0F0;
}

.navbar--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky, 100);
}

@media (min-width: 1024px) {
  .navbar--fixed {
    left: var(--nav-sidebar-width, 220px);
  }
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 var(--spacing-lg, 16px);
  padding-top: env(safe-area-inset-top, 0px);
}

.navbar-inner--custom {
  height: auto;
  min-height: 44px;
  padding: env(safe-area-inset-top, 0px) var(--spacing-lg, 16px) 4px;
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
  cursor: pointer;
  color: #111111;
  transition: opacity var(--transition-fast);
}

.navbar-back:hover {
  opacity: 0.6;
}

.navbar-back:active {
  opacity: 0.4;
}

.navbar-title {
  flex: 1;
  text-align: center;
  overflow: hidden;
  padding: 0 4px;
}

.navbar-title-text {
  font-size: 17px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.navbar-action {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  white-space: nowrap;
}

.navbar-action:active {
  opacity: 0.6;
}
</style>
