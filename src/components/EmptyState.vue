<template>
  <div class="empty-state">
    <div class="empty-icon" v-if="props.icon">
      <AppIcon v-if="isIconName" :name="props.icon" :size="56" />
      <span v-else>{{ props.icon }}</span>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description" v-if="description">{{ description }}</p>
    <button class="btn btn-primary empty-action" v-if="actionText" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  icon?: string
  title: string
  description?: string
  actionText?: string
}>()

defineEmits<{
  action: []
}>()

const APP_ICON_NAMES = ['search', 'heart', 'calendar', 'activity', 'star', 'bell', 'message-circle', 'users', 'book-open', 'edit', 'map-pin', 'handshake', 'close', 'flame', 'target', 'megaphone', 'comment', 'share', 'camera', 'lock', 'settings', 'help-circle', 'info']

const isIconName = computed(() => props.icon ? APP_ICON_NAMES.includes(props.icon) : false)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
  text-align: center;
}

.empty-icon {
  font-size: 56px;
  line-height: 1;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  max-width: 280px;
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

.empty-action {
  margin-top: var(--spacing-sm);
}
</style>
