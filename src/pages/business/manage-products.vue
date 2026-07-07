<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">商品管理</span>
      <span class="add" @click="goPublish">+ 新增</span>
    </div>

    <div class="content">
      <div class="list">
        <div class="item" v-for="p in products" :key="p.id">
          <span class="item-emoji" :style="{ background: p.bgColor }">{{ p.emoji }}</span>
          <div class="item-info">
            <span class="item-name">{{ p.name }}</span>
            <span class="item-meta">¥{{ p.price }} · 已售 {{ p.sales }}</span>
          </div>
          <span class="item-del" @click="remove(p)">删除</span>
        </div>
      </div>
      <div class="empty" v-if="products.length === 0">还没有商品，点击右上角「+ 新增」</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { navigateBackSmart, navigateTo } from '../../utils/router'
import { toastSuccess } from '../../utils/toast'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'

const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)
const products = ref<any[]>([])

const goBack = () => navigateBackSmart('/pages/business/index')
const goPublish = () => navigateTo('/pages/business/publish')

onMounted(() => {
  products.value = localStore.getArray('business_my_products', [], phone.value)
})

const remove = (p: any) => {
  products.value = localStore.removeById('business_my_products', p.id, phone.value)
  toastSuccess('已删除')
}
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; flex: 1; }
.add { font-size: 14px; font-weight: 500; cursor: pointer; }
.content { padding: var(--spacing-lg); }
.list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.item { display: flex; align-items: center; background: var(--color-bg-secondary); padding: var(--spacing-md); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
.item-emoji { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-right: var(--spacing-md); flex-shrink: 0; }
.item-info { flex: 1; }
.item-name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); display: block; margin-bottom: 2px; }
.item-meta { font-size: 12px; color: var(--color-text-muted); }
.item-del { font-size: 13px; color: var(--color-error); cursor: pointer; padding: 4px 8px; }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 60px; font-size: 14px; }
</style>
