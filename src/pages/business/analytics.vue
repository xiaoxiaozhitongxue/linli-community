<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">数据统计</span>
    </div>

    <div class="content">
      <div class="stat-grid">
        <div class="stat-card">
          <span class="stat-value">{{ stats.products }}</span>
          <span class="stat-label">在售商品</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.orders }}</span>
          <span class="stat-label">订单总数</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">¥{{ stats.revenue }}</span>
          <span class="stat-label">累计营收</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.completed }}</span>
          <span class="stat-label">已完成</span>
        </div>
      </div>

      <div class="tips">
        <p>💡 数据基于本地记录统计，仅当前设备可见。持续经营、用心服务，营收会越来越高哦！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { INITIAL_ORDERS } from '../../constants/businessData'

const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)
const stats = ref({ products: 0, orders: 0, revenue: 0, completed: 0 })

const goBack = () => navigateBackSmart('/pages/business/index')

onMounted(() => {
  const products = localStore.getArray('business_my_products', [], phone.value)
  const orders = localStore.getArray('business_orders', INITIAL_ORDERS as any, phone.value)
  const completed = orders.filter((o: any) => o.status === 'completed')
  const revenue = completed.reduce((sum: number, o: any) => sum + (Number(o.price) || 0), 0)
  stats.value = {
    products: products.length,
    orders: orders.length,
    revenue,
    completed: completed.length
  }
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
.stat-card { background: var(--color-bg-secondary); border-radius: var(--radius-lg); padding: var(--spacing-xl); text-align: center; box-shadow: var(--shadow-sm); }
.stat-value { font-size: 24px; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: var(--color-text-muted); }
.tips { margin-top: var(--spacing-lg); background: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--spacing-md); }
.tips p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.7; margin: 0; }
</style>
