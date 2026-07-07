<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">创业指南</span>
    </div>

    <div class="content">
      <div class="steps">
        <div class="step" v-for="(s, i) in steps" :key="i">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-body">
            <div class="step-title">{{ s.title }}</div>
            <div class="step-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>

      <div class="notice">
        <p>📮 在「邻里社区」创业，邻居就是你的第一批客户。从你擅长的小事开始，慢慢做大！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateBackSmart } from '../../utils/router'

const goBack = () => navigateBackSmart('/pages/business/index')

const steps = [
  { title: '明确你的优势', desc: '想想你擅长什么：烘焙、私房菜、手工、维修、照顾宠物……把兴趣变成邻里需要的小服务。' },
  { title: '开通小店', desc: '在「社区创业」首页点击「立即开通」，填写店铺名称与简介，一分钟即可开业。' },
  { title: '发布第一件商品', desc: '拍好图、写清规格与价格，真实描述能更快赢得邻居信任。' },
  { title: '用心经营', desc: '及时回复咨询、保证品质，好评会带来更多回头客与口碑传播。' },
  { title: '参与社区活动', desc: '报名市集、互助活动，让更多邻居认识你和你的小店。' }
]
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.steps { display: flex; flex-direction: column; gap: var(--spacing-md); }
.step { display: flex; gap: 12px; background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.step-title { font-size: 15px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px; }
.step-desc { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }
.notice { margin-top: var(--spacing-lg); background: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--spacing-md); }
.notice p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.7; margin: 0; }
</style>
