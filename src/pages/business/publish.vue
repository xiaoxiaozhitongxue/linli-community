<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">发布商品</span>
    </div>

    <div class="content">
      <div class="form">
        <div class="field">
          <label>商品名称<span class="req">*</span></label>
          <input v-model="form.name" placeholder="请输入商品名称" />
        </div>
        <div class="field">
          <label>商品图标（emoji）</label>
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
          <label>价格（元）<span class="req">*</span></label>
          <input v-model="form.price" type="number" min="0" placeholder="0" />
        </div>
        <div class="field">
          <label>分类</label>
          <select v-model="form.category" class="select-field">
            <option v-for="c in CATEGORY_OPTIONS" :key="c.key" :value="c.key">{{ c.label }}</option>
          </select>
        </div>
        <div class="field">
          <label>商品描述</label>
          <textarea v-model="form.desc" rows="3" placeholder="介绍商品特点、规格等（选填）"></textarea>
        </div>
      </div>

      <div class="submit-btn" @click="submit">发布商品</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { DEFAULT_SHOP, CATEGORIES } from '../../constants/businessData'

const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)

const EMOJI_OPTIONS = ['🧁', '🍰', '🍳', '👜', '🍹', '🍗', '🧶', '🐱', '🌿', '🥟']
const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c.key !== 'all')

const form = reactive({
  name: '',
  emoji: '🧁',
  price: '',
  category: 'food',
  desc: ''
})

const goBack = () => navigateBackSmart('/pages/business/index')

const submit = () => {
  if (!form.name.trim()) return toastError('请填写商品名称')
  const priceNum = Number(form.price)
  if (!priceNum || priceNum <= 0) return toastError('请填写有效价格')

  const shop = localStore.getObject('business_shop', { ...DEFAULT_SHOP }, phone.value)
  const product = {
    id: 'mp' + Date.now(),
    name: form.name,
    emoji: form.emoji,
    bgColor: '#FFE0B2',
    price: priceNum,
    sales: 0,
    isHot: false,
    shopName: (shop as any).name || DEFAULT_SHOP.name,
    distance: 0,
    category: form.category,
    desc: form.desc
  }
  localStore.append('business_my_products', product, phone.value)
  toastSuccess('商品已发布')
  setTimeout(() => goBack(), 700)
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.form { display: flex; flex-direction: column; gap: var(--spacing-md); }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.req { color: var(--color-error); }
.field input, .field textarea, .select-field { border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: var(--spacing-md); font-size: 14px; color: var(--color-text-primary); background: var(--color-bg-secondary); outline: none; resize: none; }
.field input:focus, .field textarea:focus, .select-field:focus { border-color: var(--color-primary); }
.emoji-row { display: flex; flex-wrap: wrap; gap: 8px; }
.emoji-opt { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; border: 2px solid transparent; }
.emoji-opt.active { border-color: var(--color-primary); }
.submit-btn { margin-top: var(--spacing-xl); background: var(--color-primary-gradient); color: #fff; text-align: center; padding: var(--spacing-md); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
.submit-btn:active { opacity: 0.85; }
</style>
