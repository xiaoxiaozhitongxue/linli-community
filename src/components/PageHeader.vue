<template>
  <header class="page-header">
    <div class="header-left">
      <button v-if="showBack" class="header-back" @click="$emit('back')">
        ‹
      </button>
    </div>
    <h1 class="header-title">{{ title }}</h1>
    <div class="header-right">
      <button v-if="rightText" class="header-right-btn" @click="$emit('right-click')">
        {{ rightText }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  showBack?: boolean
  rightText?: string
}>(), {
  showBack: true
})

defineEmits<{
  back: []
  'right-click': []
}>()
</script>

<style scoped>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--spacing-lg);
  padding-top: var(--safe-area-top);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  min-width: 60px;
}

.header-right {
  justify-content: flex-end;
}

.header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 28px;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  line-height: 1;
}

.header-back:hover {
  background: var(--hover-bg-subtle);
}

.header-back:active {
  background: var(--hover-bg-active);
}

.header-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-right-btn {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.header-right-btn:hover {
  background: var(--color-primary-soft);
}
</style>
