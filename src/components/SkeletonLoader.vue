<template>
  <div class="skeleton-loader">
    <template v-for="i in count" :key="i">
      <div v-if="type === 'card'" class="skeleton-card">
        <div class="skeleton-card-image" />
        <div class="skeleton-card-body">
          <div class="skeleton-line w-75" />
          <div class="skeleton-line w-50" />
          <div class="skeleton-line w-60" />
        </div>
      </div>
      <div v-else-if="type === 'list'" class="skeleton-list-item">
        <div class="skeleton-avatar" />
        <div class="skeleton-list-content">
          <div class="skeleton-line w-60" />
          <div class="skeleton-line w-80" />
        </div>
      </div>
      <div v-else-if="type === 'avatar'" class="skeleton-avatar-item">
        <div class="skeleton-avatar-lg" />
        <div class="skeleton-line w-40" />
      </div>
      <div v-else class="skeleton-custom">
        <slot />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'card' | 'list' | 'avatar' | 'custom'
  count?: number
}>(), {
  type: 'card',
  count: 3
})
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.skeleton-card-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-card-body {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skeleton-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.skeleton-custom {
  width: 100%;
}

.skeleton-line {
  height: 14px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-75 { width: 75%; }
.w-80 { width: 80%; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
