<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">创业故事</span>
    </div>

    <div class="content" v-if="story">
      <img class="cover" :src="story.cover" alt="故事封面" />
      <h1 class="story-title">{{ story.title }}</h1>
      <div class="author">
        <div class="avatar" v-if="!story.avatar">{{ (story.author || '邻').charAt(0) }}</div>
        <img class="avatar" v-else :src="story.avatar" alt="作者头像" />
        <span>{{ story.author }}</span>
      </div>
      <div class="divider"></div>
      <p class="body">{{ story.content }}</p>
    </div>

    <div class="content empty" v-else>
      <p>未找到该故事。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart } from '../../utils/router'
import { SUCCESS_STORIES } from '../../constants/businessData'

const route = useRoute()
const story = computed(() => SUCCESS_STORIES.find((s) => s.id === route.query.id) || null)

const goBack = () => navigateBackSmart('/pages/business/index')
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.cover { width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius-lg); }
.story-title { font-size: 20px; font-weight: 700; color: var(--color-text-primary); margin: var(--spacing-md) 0; }
.author { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
.avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-soft, rgba(255,107,53,0.1)); color: var(--color-primary, #FF6B35); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; object-fit: cover; }
.divider { height: 1px; background: var(--color-border-light); margin: var(--spacing-md) 0; }
.body { font-size: 14px; line-height: 1.9; color: var(--color-text-secondary); margin: 0; }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 60px; }
</style>
