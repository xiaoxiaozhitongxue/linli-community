<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">编辑小店</span>
    </div>

    <div class="content">
      <div class="preview">
        <span class="preview-emoji" :style="{ background: form.bgColor }">{{ form.emoji }}</span>
        <span class="preview-name">{{ form.name || '我的小店' }}</span>
      </div>

      <div class="form">
        <div class="field">
          <label>店铺名称<span class="req">*</span></label>
          <input v-model="form.name" placeholder="请输入店铺名称" />
        </div>
        <div class="field">
          <label>店铺图标（emoji）</label>
          <div class="emoji-row">
            <span
              v-for="e in EMOJI_OPTIONS"
              :key="e"
              class="emoji-opt"
              :class="{ active: form.emoji === e }"
              @click="form.emoji = e"
            >{{ e }}</span>
          </div>
        </div>
        <div class="field">
          <label>店铺简介</label>
          <textarea v-model="form.description" rows="3" placeholder="一句话介绍你的小店（选填）"></textarea>
        </div>
      </div>

      <div class="submit-btn" @click="save">保存</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { DEFAULT_SHOP } from '../../constants/businessData'

const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)

const EMOJI_OPTIONS = ['🧁', '🍰', '🍳', '👜', '🍹', '🍗', '🧶', '🐱', '🌿', '🥟']

const form = reactive({
  name: DEFAULT_SHOP.name,
  emoji: DEFAULT_SHOP.emoji,
  bgColor: DEFAULT_SHOP.bgColor,
  description: ''
})

const goBack = () => navigateBackSmart('/pages/business/index')

onMounted(() => {
  const saved = localStore.getObject('business_shop', { ...DEFAULT_SHOP, description: '' }, phone.value)
  form.name = saved.name
  form.emoji = saved.emoji
  form.bgColor = saved.bgColor
  form.description = (saved as any).description || ''
})

const save = () => {
  if (!form.name.trim()) return toastError('请填写店铺名称')
  localStore.setObject('business_shop', { ...form }, phone.value)
  toastSuccess('店铺信息已保存')
  setTimeout(() => goBack(), 700)
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.preview { display: flex; flex-direction: column; align-items: center; gap: 8px; margin: var(--spacing-lg) 0; }
.preview-emoji { width: 64px; height: 64px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 32px; }
.preview-name { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.form { display: flex; flex-direction: column; gap: var(--spacing-md); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.req { color: var(--color-error); }
.field input, .field textarea { border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: var(--spacing-md); font-size: 14px; color: var(--color-text-primary); background: var(--color-bg-secondary); outline: none; resize: none; }
.field input:focus, .field textarea:focus { border-color: var(--color-primary); }
.emoji-row { display: flex; flex-wrap: wrap; gap: 8px; }
.emoji-opt { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; border: 2px solid transparent; }
.emoji-opt.active { border-color: var(--color-primary); }
.submit-btn { margin-top: var(--spacing-xl); background: var(--color-primary-gradient); color: #fff; text-align: center; padding: var(--spacing-md); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
.submit-btn:active { opacity: 0.85; }
</style>
