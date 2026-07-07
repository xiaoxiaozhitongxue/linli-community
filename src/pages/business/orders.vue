<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">我的订单</span>
    </div>

    <div class="content">
      <div class="order-list">
        <div class="order-item" v-for="order in orders" :key="order.id">
          <div class="order-left">
            <span class="order-product">{{ order.productName }}</span>
            <span class="order-buyer">{{ order.buyerName }} · {{ order.date }}</span>
          </div>
          <div class="order-right">
            <span class="order-price">¥{{ order.price }}</span>
            <span class="order-status" :class="'order-status-' + order.status">
              {{ getOrderStatusName(order.status) }}
            </span>
          </div>
        </div>
      </div>
      <div class="empty" v-if="orders.length === 0">暂无订单</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { INITIAL_ORDERS, getOrderStatusName } from '../../constants/businessData'

const { getCurrentPhone } = useAuth()
const phone = computed(() => getCurrentPhone() || undefined)
const orders = ref<any[]>([])

const goBack = () => navigateBackSmart('/pages/business/index')

onMounted(() => {
  // 订单数据本地持久化：首次以 INITIAL_ORDERS 为种子，之后读取用户维度数据
  orders.value = localStore.getArray('business_orders', INITIAL_ORDERS as any, phone.value)
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: var(--color-primary-gradient); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.order-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.order-item { background: var(--color-bg-secondary); padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm); }
.order-left { display: flex; flex-direction: column; }
.order-product { font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin-bottom: 2px; }
.order-buyer { font-size: 12px; color: var(--color-text-muted); }
.order-right { display: flex; flex-direction: column; align-items: flex-end; }
.order-price { font-size: 15px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 2px; }
.order-status { font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.order-status-paid { background: #FFF3E0; color: #FF9800; }
.order-status-shipped { background: #E3F2FD; color: #2196F3; }
.order-status-completed { background: #E8F5E9; color: #4CAF50; }
.order-status-cancelled { background: #FFEBEE; color: #F44336; }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 60px; font-size: 14px; }
</style>
