<template>
  <nav class="side-nav">
    <div class="nav-brand" @click="switchToTab('/pages/index/index')">
      <AppIcon class="brand-icon" name="community" :size="28" />
      <span class="brand-name">邻里社区</span>
    </div>

    <div class="nav-items">
      <div
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="switchToTab(item.path)"
      >
        <AppIcon class="nav-item-icon" :name="item.icon" :size="22" />
        <span class="nav-item-label">{{ item.label }}</span>
      </div>
    </div>

    <div class="nav-footer">
      <div v-if="isLoggedIn" class="user-info">
        <div class="user-avatar-wrap">
          <img v-if="userAvatar" :src="userAvatar" class="user-avatar" />
          <span v-else class="user-avatar-placeholder">{{ userName?.charAt(0) || 'U' }}</span>
        </div>
        <span class="user-name">{{ userName || '用户' }}</span>
      </div>
      <div v-else class="login-entry" @click="goToLogin">
        <AppIcon class="login-icon" name="lock" :size="18" />
        <span>登录</span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../store'
import { navigateTo } from '../utils/router'
import AppIcon from './AppIcon.vue'

const router = useRouter()
const route = useRoute()
const { isLoggedIn, user } = useAuth()

const currentPath = computed(() => route.path)

const userName = computed(() => user.value?.nickname || '')
const userAvatar = computed(() => user.value?.avatar || '')

const navItems = [
  { path: '/pages/index/index', icon: 'home', label: '首页' },
  { path: '/pages/ai-helper/index', icon: 'handshake', label: '互助' },
  { path: '/pages/messages/index', icon: 'message', label: '消息' },
  { path: '/pages/profile/index', icon: 'user', label: '我的' }
]

function isActive(path: string): boolean {
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}

function switchToTab(path: string) {
  if (isActive(path)) return
  router.replace(path)
}

function goToLogin() {
  navigateTo('/pages/login/index')
}
</script>

<style scoped>
.side-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: var(--nav-sidebar-width, 220px);
  height: 100vh;
  background: var(--color-bg-secondary);
  display: flex;
  flex-direction: column;
  z-index: var(--z-sticky, 200);
  box-shadow: 2px 0 24px rgba(0, 0, 0, 0.04);
  user-select: none;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px 20px;
  cursor: pointer;
  position: relative;
}

.nav-brand::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, var(--color-border-light) 0%, var(--color-primary-soft) 50%, var(--color-border-light) 100%);
}

.brand-icon {
  color: var(--color-primary);
}

.brand-name {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

.nav-items {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.nav-item::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--color-primary-gradient);
  border-radius: 0 3px 3px 0;
  transition: height var(--transition-smooth);
}

.nav-item:hover {
  background: var(--hover-bg-subtle);
}

.nav-item:hover::before {
  height: 20px;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 138, 92, 0.12) 100%);
}

.nav-item.active::before {
  height: 26px;
}

.nav-item-icon {
  color: var(--color-text-tertiary);
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-item-label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.nav-item.active .nav-item-icon {
  color: var(--color-primary);
}

.nav-item.active .nav-item-label {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.nav-footer {
  padding: 16px;
  position: relative;
}

.nav-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, var(--color-border-light) 0%, var(--color-primary-soft) 50%, var(--color-border-light) 100%);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.user-avatar-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.user-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  cursor: pointer;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.login-entry:hover {
  background: var(--hover-bg-subtle);
}

.login-icon {
  color: var(--color-primary);
}
</style>
