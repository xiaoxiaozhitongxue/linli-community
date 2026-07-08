<template>
  <div class="page">
    <NavBar title="店铺详情" />

    <div class="content" v-if="shop">
      <div class="shop-hero" :style="{ background: shop.bgColor }">
        <span class="shop-emoji">{{ shop.emoji }}</span>
      </div>
      <div class="shop-info">
        <div class="shop-name">{{ shop.name }}</div>
        <div class="shop-desc">{{ shop.description }}</div>
        <div class="shop-meta">
          <span>⭐ {{ shop.rating }}</span>
          <span>月销 {{ shop.monthlySales }}</span>
          <span><AppIcon name="map-pin" :size="14" /> {{ shop.distance }}m</span>
        </div>
      </div>

      <div class="section-title">本店商品</div>
      <div class="grid">
        <div class="card" v-for="p in shopProducts" :key="p.id" @click="goProduct(p)">
          <div class="cover" :style="{ background: p.bgColor }"><span class="emoji">{{ p.emoji }}</span></div>
          <div class="info">
            <span class="name">{{ p.name }}</span>
            <span class="price">¥{{ p.price }}</span>
          </div>
        </div>
      </div>
      <div class="empty" v-if="shopProducts.length === 0">本店暂未上架商品</div>
    </div>

    <div class="content empty" v-else>
      <p>未找到该店铺。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart, navigateTo } from '../../utils/router'
import { NEARBY_SHOPS, HOT_PRODUCTS } from '../../constants/businessData'
import AppIcon from '../../components/AppIcon.vue'
import NavBar from '../../components/NavBar.vue'

const route = useRoute()
const shop = computed(() => NEARBY_SHOPS.find((s) => s.id === route.query.id) || null)
const shopProducts = computed(() => (shop.value ? HOT_PRODUCTS.filter((p) => p.shopName === shop.value!.name) : []))

const goBack = () => navigateBackSmart('/pages/business/index')
const goProduct = (p: any) => navigateTo(`/pages/business/product?id=${p.id}`)
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.content { padding: var(--spacing-lg); }
.shop-hero { height: 140px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
.shop-emoji { font-size: 64px; }
.shop-info { background: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--spacing-md); margin-top: var(--spacing-md); }
.shop-name { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }
.shop-desc { font-size: 13px; color: var(--color-text-muted); margin: 4px 0 8px; }
.shop-meta { display: flex; gap: var(--spacing-md); }
.shop-meta span { font-size: 12px; color: var(--color-text-muted); }
.section-title { font-size: 16px; font-weight: 600; color: var(--color-text-primary); margin: var(--spacing-lg) 0 var(--spacing-md); }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
.card { background: var(--color-bg-secondary); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); cursor: pointer; }
.card:active { transform: scale(0.97); }
.cover { height: 90px; display: flex; align-items: center; justify-content: center; }
.emoji { font-size: 36px; }
.info { padding: var(--spacing-sm) var(--spacing-md); display: flex; justify-content: space-between; align-items: center; }
.name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.price { font-size: 14px; font-weight: 600; color: var(--color-primary); }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 30px; font-size: 14px; }
</style>
