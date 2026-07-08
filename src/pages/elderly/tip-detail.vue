<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">关怀技巧</span>
    </div>

    <div class="content" v-if="tip">
      <div class="cover" :style="{ background: tip.bgColor }">
        <span class="cover-icon">{{ tip.icon }}</span>
      </div>
      <h1 class="tip-title">{{ tip.title }}</h1>
      <p class="tip-desc">{{ tip.desc }}</p>
      <div class="divider"></div>
      <div class="body">
        <p class="paragraph" v-for="(p, i) in tip.content" :key="i">{{ p }}</p>
      </div>
    </div>

    <div class="content empty" v-else>
      <p>未找到该技巧内容。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart } from '../../utils/router'
import { CARE_TIPS } from '../../constants/elderlyData'

const route = useRoute()
const tip = computed(() => CARE_TIPS.find((t) => t.id === route.query.id) || null)

const goBack = () => navigateBackSmart('/pages/elderly/index')
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--theme-elderly-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.cover { width: 72px; height: 72px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; margin-bottom: var(--spacing-md); }
.cover-icon { font-size: 36px; }
.tip-title { font-size: 20px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 8px; }
.tip-desc { font-size: 14px; color: var(--color-text-muted); margin: 0 0 var(--spacing-md); }
.divider { height: 1px; background: var(--color-border-light); margin: var(--spacing-md) 0; }
.body .paragraph { font-size: 14px; line-height: 1.8; color: var(--color-text-secondary); margin: 0 0 var(--spacing-md); }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 60px; }
</style>
