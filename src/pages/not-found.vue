<template>
  <div class="page">
    <div class="not-found">
      <div class="icon">🔍</div>
      <h1>404</h1>
      <p class="text">页面未找到</p>
      <p class="desc">你访问的页面不存在或已被移除</p>
      <span class="home-btn" @click="goHome">返回首页</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '../utils/router'

const goHome = () => navigateTo('/pages/index/index')
</script>

<style scoped>
.page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg-primary); }
.not-found { text-align: center; padding: var(--spacing-xl); }
.icon { font-size: 64px; margin-bottom: var(--spacing-md); }
h1 { font-size: 48px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 var(--spacing-sm); }
.text { font-size: 18px; color: var(--color-text-secondary); margin-bottom: var(--spacing-xs); }
.desc { font-size: 14px; color: var(--color-text-muted); margin-bottom: var(--spacing-lg); }
.home-btn { display: inline-block; padding: 10px 32px; background: var(--color-primary); color: #fff; border-radius: 20px; font-size: 15px; cursor: pointer; }
.home-btn:active { opacity: 0.8; }
</style>
