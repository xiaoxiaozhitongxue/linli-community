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

function show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 2000) {
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
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }, duration)
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
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  background: rgba(76, 175, 80, 0.9);
}

.toast-error {
  background: rgba(244, 67, 54, 0.9);
}

.toast-info {
  background: rgba(33, 150, 243, 0.9);
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
}

.toast-message {
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
