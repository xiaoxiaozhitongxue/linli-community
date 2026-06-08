<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast-${toast.type}`]"
      >
        <span class="toast-icon" v-if="toast.icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  icon?: string
  duration: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

function show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 2500) {
  const id = ++toastIdCounter
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }
  toasts.value.push({
    id,
    message,
    type,
    icon: icons[type],
    duration
  })
  
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

const toastApi = {
  show,
  success: (msg: string) => show(msg, 'success'),
  error: (msg: string) => show(msg, 'error'),
  info: (msg: string) => show(msg, 'info')
}

onMounted(() => {
  (window as any).$toast = toastApi
})

onUnmounted(() => {
  delete (window as any).$toast
})

defineExpose(toastApi)
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(var(--spacing-xxl) + var(--safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--zindex-toast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  pointer-events: none;
  max-width: 90vw;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--toast-bg);
  color: var(--toast-text);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  line-height: 1.4;
  box-shadow: var(--shadow-toast);
  word-break: break-word;
  text-align: center;
}

.toast-success {
  background: var(--success-gradient);
  box-shadow: var(--shadow-toast-success);
}

.toast-error {
  background: var(--error-gradient);
  box-shadow: var(--shadow-toast-error);
}

.toast-info {
  background: var(--info-gradient);
  box-shadow: var(--shadow-toast-info);
}

.toast-icon {
  font-size: var(--font-size-base);
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  max-width: 280px;
}

.toast-enter-active {
  animation: toastIn var(--transition-bounce) var(--transition-ease-out);
}

.toast-leave-active {
  animation: toastOut var(--transition-duration) var(--transition-ease-in) forwards;
}

@keyframes toastIn {
  0% {
    opacity: 0;
    transform: translateY(calc(-1 * var(--spacing-lg))) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(calc(-1 * var(--spacing-sm))) scale(0.95);
  }
}
</style>
