<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header">
      <div class="header-content">
        <span class="header-title"><AppIcon name="activity" :size="20" /> 社区创业</span>
        <span class="header-subtitle">把兴趣变成生意，邻居先成为客户</span>
      </div>
    </div>

    <div class="content" style="overflow-y: auto; height: calc(100vh - 120px);">
      <!-- 我的小店 -->
      <div class="my-shop" v-if="hasShop">
        <div class="shop-card">
          <div class="shop-cover" :style="{ background: shop.bgColor }">
            <AppIcon class="shop-emoji" :name="emojiToIcon(shop.emoji)" :size="36" />
          </div>
          <div class="shop-info">
            <span class="shop-name">{{ shop.name }}</span>
            <div class="shop-stats">
              <span class="shop-stat">商品 {{ shop.products }}</span>
              <span class="shop-stat">订单 {{ shop.orders }}</span>
              <span class="shop-stat">评分 ⭐ {{ shop.rating }}</span>
            </div>
          </div>
          <div class="shop-actions">
            <div class="shop-btn edit" @click="editShop">编辑</div>
            <div class="shop-btn manage" @click="manageProducts">管理</div>
          </div>
        </div>
      </div>

      <!-- 开通小店 -->
      <div class="open-shop" v-else>
        <div class="open-shop-content">
          <span class="open-icon"><AppIcon name="home" :size="48" /></span>
          <span class="open-title">还没有开通小店</span>
          <span class="open-desc">把您的兴趣和技能变成邻里间的小生意</span>
          <div class="open-btn" @click="openShop">
            <span>立即开通</span>
          </div>
        </div>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-actions">
        <div class="action-item" @click="goToPublish">
          <div class="action-icon" style="background: #FFF3E0;">
            <AppIcon name="bookmark" :size="20" />
          </div>
          <span class="action-text">发布商品</span>
        </div>
        <div class="action-item" @click="goToOrders">
          <div class="action-icon" style="background: #E3F2FD;">
            <AppIcon name="bookmark" :size="20" />
          </div>
          <span class="action-text">我的订单</span>
        </div>
        <div class="action-item" @click="goToAnalytics">
          <div class="action-icon" style="background: #F3E5F5;">
            <AppIcon name="activity" :size="20" />
          </div>
          <span class="action-text">数据统计</span>
        </div>
        <div class="action-item" @click="goToGuide">
          <div class="action-icon" style="background: #E8F5E9;">
            <AppIcon name="book-open" :size="20" />
          </div>
          <span class="action-text">创业指南</span>
        </div>
      </div>

      <!-- 商品分类 -->
      <div class="categories">
        <div class="category-list">
          <div
            class="category-item"
            :class="{ active: selectedCategory === 'all' }"
            @click="selectCategory('all')"
          >
            全部
          </div>
          <div
            class="category-item"
            :class="{ active: selectedCategory === 'food' }"
            @click="selectCategory('food')"
          >
            <AppIcon name="star" :size="16" /> 烘焙
          </div>
          <div
            class="category-item"
            :class="{ active: selectedCategory === 'cooking' }"
            @click="selectCategory('cooking')"
          >
            <AppIcon name="star" :size="16" /> 私房菜
          </div>
          <div
            class="category-item"
            :class="{ active: selectedCategory === 'handmade' }"
            @click="selectCategory('handmade')"
          >
            <AppIcon name="settings" :size="16" /> 手工
          </div>
          <div
            class="category-item"
            :class="{ active: selectedCategory === 'service' }"
            @click="selectCategory('service')"
          >
            <AppIcon name="settings" :size="16" /> 服务
          </div>
        </div>
      </div>

      <!-- 热门商品 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title"><AppIcon name="flame" :size="16" /> 热门商品</span>
          <span class="section-more" @click="goToAllProducts">查看更多 ></span>
        </div>
        <div class="product-grid">
          <div
            class="product-card"
            v-for="product in filteredProducts"
            :key="product.id"
            @click="goToProductDetail(product)"
          >
            <div class="product-cover" :style="{ background: product.bgColor }">
              <AppIcon class="product-emoji" :name="emojiToIcon(product.emoji)" :size="32" />
              <div class="product-badge" v-if="product.isHot">热门</div>
            </div>
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <div class="product-shop-line">
                <span class="shop-tag">{{ product.shopName }}</span>
                <span class="shop-distance"><AppIcon name="map-pin" :size="14" /> {{ product.distance }}m</span>
              </div>
              <div class="product-footer">
                <span class="product-price">¥{{ product.price }}</span>
                <span class="product-sales">已售 {{ product.sales }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 附近小店 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title"><AppIcon name="home" :size="16" /> 附近小店</span>
        </div>
        <div class="shop-list">
          <div
            class="shop-item"
            v-for="shopItem in nearbyShops"
            :key="shopItem.id"
            @click="visitShop(shopItem)"
          >
            <div class="shop-avatar" :style="{ background: shopItem.bgColor }">
              <AppIcon class="shop-emoji-icon" :name="emojiToIcon(shopItem.emoji)" :size="28" />
            </div>
            <div class="shop-detail">
              <span class="shop-name-text">{{ shopItem.name }}</span>
              <span class="shop-desc">{{ shopItem.description }}</span>
              <div class="shop-meta">
                <span>⭐ {{ shopItem.rating }}</span>
                <span>月销 {{ shopItem.monthlySales }}</span>
                <span><AppIcon name="map-pin" :size="14" /> {{ shopItem.distance }}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新订单 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title"><AppIcon name="bookmark" :size="16" /> 最新订单</span>
          <span class="section-more" @click="goToOrders">查看全部 ></span>
        </div>
        <div class="order-list">
          <div class="order-item" v-for="order in recentOrders" :key="order.id">
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
      </div>

      <!-- 创业故事 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title"><AppIcon name="book-open" :size="16" /> 创业故事</span>
        </div>
        <div class="story-list">
          <div
            class="story-card"
            v-for="story in successStories"
            :key="story.id"
            @click="goToStoryDetail(story)"
          >
            <img class="story-cover" :src="story.cover" alt="故事封面" />
            <div class="story-content">
              <span class="story-title">{{ story.title }}</span>
              <span class="story-excerpt">{{ story.excerpt }}</span>
              <div class="story-meta">
                <div class="avatar-wrap" v-if="story.avatar">
                  <img class="story-avatar" :src="story.avatar" alt="作者头像" />
                </div>
                <div v-else class="story-avatar avatar-placeholder">{{ (story.author || '邻').charAt(0) }}</div>
                <span class="story-author">{{ story.author }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo } from '../../utils/router'
import { toastInfo, toastSuccess } from '../../utils/toast'
import { showModal } from '../../utils/ui'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { INITIAL_ORDERS, DEFAULT_SHOP, type ShopOrder } from '../../constants/businessData'
import AppIcon from '../../components/AppIcon.vue'

const { getCurrentPhone } = useAuth()
const bizPhone = computed(() => getCurrentPhone() || undefined)

// 开店状态本地持久化（默认已开通，与改造前展示一致）
const hasShop = ref(localStore.getObject('business_shop_state', { hasShop: true }, bizPhone.value).hasShop)
const selectedCategory = ref('all')

// 店铺信息本地持久化（编辑小店页可修改）
const shop = ref(localStore.getObject('business_shop', { ...DEFAULT_SHOP }, bizPhone.value))

const EMOJI_TO_ICON: Record<string, string> = {
  '🍰': 'star', '🍖': 'star', '👜': 'star', '🍹': 'star', '🍬': 'star',
  '🍗': 'star', '🧶': 'star', '🐱': 'star', '🍳': 'star', '🥟': 'star',
  '🎨': 'settings', '🐾': 'users', '🌿': 'star'
}

function emojiToIcon(emoji: string): string {
  return EMOJI_TO_ICON[emoji] || 'star'
}

const hotProducts = ref([
  {
    id: '1',
    name: '柠檬磅蛋糕',
    emoji: '🍰',
    bgColor: '#FFF9C4',
    price: 38,
    sales: 234,
    isHot: true,
    shopName: '小红的烘焙坊',
    distance: 120,
    category: 'food'
  },
  {
    id: '2',
    name: '私房红烧肉',
    emoji: '🍖',
    bgColor: '#FFCCBC',
    price: 68,
    sales: 156,
    isHot: true,
    shopName: '王阿姨私房菜',
    distance: 200,
    category: 'cooking'
  },
  {
    id: '3',
    name: '手工编织包',
    emoji: '👜',
    bgColor: '#E1BEE7',
    price: 128,
    sales: 45,
    isHot: false,
    shopName: '手工达人小坊',
    distance: 350,
    category: 'handmade'
  },
  {
    id: '4',
    name: '鲜榨果汁',
    emoji: '🍹',
    bgColor: '#B2DFDB',
    price: 18,
    sales: 567,
    isHot: true,
    shopName: '健康果汁铺',
    distance: 80,
    category: 'food'
  },
  {
    id: '5',
    name: '雪花酥礼盒',
    emoji: '🍬',
    bgColor: '#F8BBD0',
    price: 48,
    sales: 312,
    isHot: true,
    shopName: '小红的烘焙坊',
    distance: 120,
    category: 'food'
  },
  {
    id: '6',
    name: '家传卤味拼盘',
    emoji: '🍗',
    bgColor: '#FFE0B2',
    price: 88,
    sales: 198,
    isHot: false,
    shopName: '王阿姨私房菜',
    distance: 200,
    category: 'cooking'
  },
  {
    id: '7',
    name: '钩针杯垫套装',
    emoji: '🧶',
    bgColor: '#D1C4E9',
    price: 35,
    sales: 67,
    isHot: false,
    shopName: '手工达人小坊',
    distance: 350,
    category: 'handmade'
  },
  {
    id: '8',
    name: '宠物上门喂养',
    emoji: '🐱',
    bgColor: '#C8E6C9',
    price: 50,
    sales: 89,
    isHot: true,
    shopName: '宠物生活馆',
    distance: 250,
    category: 'service'
  }
])

const nearbyShops = ref([
  {
    id: '1',
    name: '王阿姨私房菜',
    emoji: '🍳',
    bgColor: '#FFCCBC',
    description: '20年厨艺，为邻居带来家的味道',
    rating: 4.8,
    monthlySales: 456,
    distance: 150
  },
  {
    id: '2',
    name: '老张的早餐铺',
    emoji: '🥟',
    bgColor: '#C8E6C9',
    description: '手工水饺、包子，现包现蒸',
    rating: 4.7,
    monthlySales: 789,
    distance: 200
  },
  {
    id: '3',
    name: '手工DIY工作坊',
    emoji: '🎨',
    bgColor: '#F3E5F5',
    description: '亲子手工、创意DIY',
    rating: 4.9,
    monthlySales: 234,
    distance: 300
  },
  {
    id: '4',
    name: '宠物生活馆',
    emoji: '🐾',
    bgColor: '#E8F5E9',
    description: '宠物零食、玩具、上门服务',
    rating: 4.6,
    monthlySales: 345,
    distance: 250
  },
  {
    id: '5',
    name: '绿植盆栽小铺',
    emoji: '🌿',
    bgColor: '#E0F2F1',
    description: '多肉植物、空气凤梨，美化你的家',
    rating: 4.8,
    monthlySales: 267,
    distance: 180
  }
])

// 订单数据本地持久化：首次以 INITIAL_ORDERS 为种子，之后读取用户维度数据
const recentOrders = ref(localStore.getArray<ShopOrder>('business_orders', INITIAL_ORDERS, bizPhone.value))

const successStories = ref([
  {
    id: '1',
    title: '从家庭主妇到月入过万的烘焙店主',
    excerpt: '王阿姨的烘焙之路，从给邻居送蛋糕开始，如今已是社区里的明星店主...',
    cover: 'https://picsum.photos/300/200?random=10',
    avatar: '',
    author: '王阿姨'
  },
  {
    id: '2',
    title: '程序员下班后做私房菜的真实故事',
    excerpt: '小李利用周末时间为邻居做健康私房菜，不仅赚了零花钱，还交到了朋友...',
    cover: 'https://picsum.photos/300/200?random=11',
    avatar: '',
    author: '小李'
  },
  {
    id: '3',
    title: '退休教师的手工编织创业记',
    excerpt: '刘老师退休后重拾编织爱好，现在她的手工包要排队一个月才能买到...',
    cover: 'https://picsum.photos/300/200?random=12',
    avatar: '',
    author: '刘老师'
  }
])

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') {
    return hotProducts.value
  }
  return hotProducts.value.filter(p => p.category === selectedCategory.value)
})

const getOrderStatusName = (status: string) => {
  const map: Record<string, string> = {
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const openShop = () => {
  showModal({
    title: '开通小店',
    content: '确定要开通属于你的社区小店吗？开通后即可发布商品，开启创业之路！',
    confirmText: '立即开通',
    success: (res: any) => {
      if (res.confirm) {
        hasShop.value = true
        // 真实持久化开店状态（本地），而非仅内存变量
        localStore.setObject('business_shop_state', { hasShop: true, openedAt: Date.now() }, bizPhone.value)
        toastSuccess('小店开通成功！')
      }
    }
  })
}

const editShop = () => {
  navigateTo('/pages/business/edit-shop')
}

const manageProducts = () => {
  navigateTo('/pages/business/manage-products')
}

const goToPublish = () => {
  navigateTo('/pages/business/publish')
}

const goToOrders = () => {
  navigateTo('/pages/business/orders')
}

const goToAnalytics = () => {
  navigateTo('/pages/business/analytics')
}

const goToGuide = () => {
  navigateTo('/pages/business/guide')
}

const goToAllProducts = () => {
  navigateTo('/pages/business/all-products')
}

const goToProductDetail = (product: any) => {
  navigateTo(`/pages/business/product?id=${product.id}`)
}

const visitShop = (shopItem: any) => {
  navigateTo(`/pages/business/shop-detail?id=${shopItem.id}`)
}

const goToStoryDetail = (story: any) => {
  navigateTo(`/pages/business/story?id=${story.id}`)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.header {
  background: var(--color-primary-gradient);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
  padding-top: calc(var(--spacing-lg) + 20px);
}

.header-content {
  text-align: center;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}

.content {
  overflow-y: auto;
}

/* 我的小店 */
.my-shop {
  padding: var(--spacing-lg);
  margin-top: -20px;
}

.shop-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  cursor: default;
}

.shop-cover {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-emoji {
  font-size: 32px;
}

.shop-info {
  flex: 1;
  min-width: 120px;
}

.shop-info .shop-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.shop-stats {
  display: flex;
  gap: var(--spacing-md);
}

.shop-stat {
  font-size: 12px;
  color: var(--color-text-muted);
}

.shop-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.shop-btn {
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
}

.shop-btn.edit {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.shop-btn.manage {
  background: var(--color-primary);
  color: white;
}

/* 开通小店 */
.open-shop {
  margin: var(--spacing-lg);
  margin-top: -20px;
}

.open-shop-content {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xxl);
  text-align: center;
  box-shadow: var(--shadow-md);
}

.open-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--spacing-md);
}

.open-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.open-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: var(--spacing-lg);
}

.open-btn {
  background: var(--color-primary-gradient);
  color: white;
  padding: var(--spacing-md) var(--spacing-xxl);
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
  cursor: pointer;
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  margin: 0 var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-item:active {
  transform: scale(0.99);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: var(--spacing-xs);
}

.action-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 分类 */
.categories {
  padding: var(--spacing-lg);
}

.category-list {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-list::-webkit-scrollbar {
  display: none;
}

.category-item {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item.active {
  background: var(--color-primary);
  color: white;
}

/* 区块 */
.section {
  padding: var(--spacing-md) var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-more {
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.product-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.product-card:active {
  transform: scale(0.99);
}

.product-cover {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-emoji {
  font-size: 40px;
}

.product-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-error);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.product-info {
  padding: var(--spacing-md);
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 4px;
}

.product-shop-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.shop-tag {
  font-size: 12px;
  color: var(--color-text-muted);
}

.shop-distance {
  font-size: 11px;
  color: var(--color-text-muted);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
}

.product-sales {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 附近小店 */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.shop-item {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.shop-item:active {
  transform: scale(0.99);
}

.shop-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.shop-emoji-icon {
  font-size: 28px;
}

.shop-detail {
  flex: 1;
  min-width: 0;
}

.shop-name-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.shop-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: flex;
  gap: var(--spacing-md);
}

.shop-meta span {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.order-item {
  background: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.order-left {
  display: flex;
  flex-direction: column;
}

.order-product {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.order-buyer {
  font-size: 12px;
  color: var(--color-text-muted);
}

.order-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.order-price {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.order-status-paid {
  background: #FFF3E0;
  color: #FF9800;
}

.order-status-shipped {
  background: #E3F2FD;
  color: #2196F3;
}

.order-status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.order-status-cancelled {
  background: #FFEBEE;
  color: #F44336;
}

/* 创业故事 */
.story-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.story-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.story-card:active {
  transform: scale(0.99);
}

.story-cover {
  width: 100px;
  height: 100px;
  object-fit: cover;
  flex-shrink: 0;
}

.story-content {
  flex: 1;
  padding: var(--spacing-md);
  min-width: 0;
}

.story-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 4px;
}

.story-excerpt {
  font-size: 12px;
  color: var(--color-text-muted);
  display: -webkit-box;
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.story-meta {
  display: flex;
  align-items: center;
}

.story-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 6px;
  object-fit: cover;
}

.story-author {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft, rgba(255,107,53,0.1));
  color: var(--color-primary, #FF6B35);
  font-size: 14px;
  font-weight: 600;
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
}
</style>