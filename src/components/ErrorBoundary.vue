<template>
  <div class="error-boundary">
    <div class="error-icon">⚠</div>
    <h3 class="error-title">{{ message }}</h3>
    <button class="btn btn-primary" @click="$emit('retry')">
      {{ retryText }}
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message: string
  retryText?: string
}>(), {
  retryText: '重试'
})

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
  text-align: center;
  min-height: 200px;
}

.error-icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: var(--spacing-lg);
  opacity: 0.7;
}

.error-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  max-width: 280px;
  line-height: 1.6;
}
</style>
