<template>
  <div class="empty-state">
    <div class="empty-icon" v-if="icon">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description" v-if="description">{{ description }}</p>
    <button class="btn btn-primary empty-action" v-if="actionText" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionText?: string
}>()

defineEmits<{
  action: []
}>()
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
