<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">商品详情</span>
    </div>

    <div class="content" v-if="product">
      <div class="cover" :style="{ background: product.bgColor }">
        <span class="emoji">{{ product.emoji }}</span>
        <div class="badge" v-if="product.isHot">热门</div>
      </div>

      <div class="block">
        <div class="name">{{ product.name }}</div>
        <div class="price-row">
          <span class="price">¥{{ product.price }}</span>
          <span class="sales">已售 {{ product.sales }}</span>
        </div>
      </div>

      <div class="block shop-line" @click="goShop">
        <span class="shop-name">{{ product.shopName }}</span>
        <span class="distance"><AppIcon name="map-pin" :size="14" /> {{ product.distance }}m ›</span>
      </div>

      <div class="block">
        <div class="block-title">商品介绍</div>
        <p class="desc">{{ product.desc || '店主很懒，还没有填写介绍~' }}</p>
      </div>

      <div class="actions">
        <div class="act-btn contact" @click="contact">联系店主</div>
        <div class="act-btn buy" @click="buy">立即购买</div>
      </div>
    </div>

    <div class="content empty" v-else>
      <p>未找到该商品。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart, navigateTo } from '../../utils/router'
import { toastInfo } from '../../utils/toast'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { HOT_PRODUCTS } from '../../constants/businessData'
import AppIcon from '../../components/AppIcon.vue'

const route = useRoute()
const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)
const myProducts = ref<any[]>([])

const product = computed(() => {
  const id = route.query.id as string
  return HOT_PRODUCTS.find((p) => p.id === id) || myProducts.value.find((p) => p.id === id) || null
})

const goBack = () => navigateBackSmart('/pages/business/index')
const goShop = () => {
  const shop = HOT_PRODUCTS.find((p) => p.id === route.query.id)?.shopName
  toastInfo(shop ? `来自「${shop}」` : '店铺信息暂未收录')
}
const contact = () => toastInfo('已为您转接店主，请稍候~')
const buy = () => toastInfo('下单功能开发中，敬请期待')

onMounted(() => {
  myProducts.value = localStore.getArray('business_my_products', [], phone.value)
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.cover { height: 180px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; position: relative; }
.emoji { font-size: 80px; }
.badge { position: absolute; top: 12px; right: 12px; background: var(--color-error); color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
.block { background: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--spacing-md); margin-top: var(--spacing-md); }
.name { font-size: 18px; font-weight: 700; color: var(--color-text-primary); }
.price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.price { font-size: 22px; font-weight: 700; color: var(--color-primary); }
.sales { font-size: 12px; color: var(--color-text-muted); }
.shop-line { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.shop-name { font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
.distance { font-size: 12px; color: var(--color-text-muted); }
.block-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 6px; }
.desc { font-size: 13px; color: var(--color-text-secondary); line-height: 1.7; margin: 0; }
.actions { display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl); }
.act-btn { flex: 1; text-align: center; padding: var(--spacing-md); border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
.contact { background: var(--color-bg-tertiary); color: var(--color-text-secondary); }
.buy { background: var(--color-primary-gradient); color: #fff; }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 60px; }
</style>
