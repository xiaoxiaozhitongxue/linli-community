<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">全部商品</span>
    </div>

    <div class="categories">
      <div
        class="cat"
        :class="{ active: selected === 'all' }"
        @click="selected = 'all'"
      >全部</div>
      <div
        class="cat"
        v-for="c in categoryOptions"
        :key="c.key"
        :class="{ active: selected === c.key }"
        @click="selected = c.key"
      >{{ c.label }}</div>
    </div>

    <div class="content">
      <div class="grid">
        <div
          class="card"
          v-for="p in filtered"
          :key="p.id"
          @click="goDetail(p)"
        >
          <div class="cover" :style="{ background: p.bgColor }">
            <span class="emoji">{{ p.emoji }}</span>
            <div class="badge" v-if="p.isHot">热门</div>
          </div>
          <div class="info">
            <span class="name">{{ p.name }}</span>
            <div class="line">
              <span class="shop">{{ p.shopName }}</span>
              <span class="distance">📍 {{ p.distance }}m</span>
            </div>
            <div class="footer">
              <span class="price">¥{{ p.price }}</span>
              <span class="sales">已售 {{ p.sales }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="empty" v-if="filtered.length === 0">该分类下暂无商品</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart, navigateTo } from '../../utils/router'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { HOT_PRODUCTS, CATEGORIES } from '../../constants/businessData'

const route = useRoute()
const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)

const categoryOptions = CATEGORIES.filter((c) => c.key !== 'all')
const selected = ref((route.query.category as string) || 'all')
const myProducts = ref<any[]>([])

const allProducts = computed(() => [...HOT_PRODUCTS, ...myProducts.value])

const filtered = computed(() => {
  if (selected.value === 'all') return allProducts.value
  return allProducts.value.filter((p) => p.category === selected.value)
})

const goBack = () => navigateBackSmart('/pages/business/index')
const goDetail = (p: any) => navigateTo(`/pages/business/product?id=${p.id}`)

onMounted(() => {
  myProducts.value = localStore.getArray('business_my_products', [], phone.value)
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.categories { display: flex; gap: var(--spacing-sm); overflow-x: auto; padding: var(--spacing-md) var(--spacing-lg); }
.categories::-webkit-scrollbar { display: none; }
.cat { padding: 6px 14px; border-radius: 20px; font-size: 13px; background: var(--color-bg-secondary); color: var(--color-text-secondary); white-space: nowrap; cursor: pointer; }
.cat.active { background: var(--color-primary); color: #fff; }
.content { padding: var(--spacing-lg); }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
.card { background: var(--color-bg-secondary); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); cursor: pointer; }
.card:active { transform: scale(0.97); }
.cover { height: 100px; display: flex; align-items: center; justify-content: center; position: relative; }
.emoji { font-size: 40px; }
.badge { position: absolute; top: 8px; right: 8px; background: var(--color-error); color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.info { padding: var(--spacing-md); }
.name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); display: block; margin-bottom: 4px; }
.line { display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm); }
.shop { font-size: 12px; color: var(--color-text-muted); }
.distance { font-size: 11px; color: var(--color-text-muted); }
.footer { display: flex; justify-content: space-between; align-items: center; }
.price { font-size: 16px; font-weight: 600; color: var(--color-primary); }
.sales { font-size: 12px; color: var(--color-text-muted); }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 40px; font-size: 14px; }
</style>
