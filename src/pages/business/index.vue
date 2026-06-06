<template>
  <view class="page">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <text class="header-title">💰 社区创业</text>
        <text class="header-subtitle">把兴趣变成生意，邻居先成为客户</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 我的小店 -->
      <view class="my-shop" v-if="hasShop">
        <view class="shop-card">
          <view class="shop-cover" :style="{ background: shop.bgColor }">
            <text class="shop-emoji">{{ shop.emoji }}</text>
          </view>
          <view class="shop-info">
            <text class="shop-name">{{ shop.name }}</text>
            <view class="shop-stats">
              <text class="shop-stat">商品 {{ shop.products }}</text>
              <text class="shop-stat">订单 {{ shop.orders }}</text>
              <text class="shop-stat">评分 ⭐ {{ shop.rating }}</text>
            </view>
          </view>
          <view class="shop-actions">
            <view class="shop-btn edit" @click="editShop">编辑</view>
            <view class="shop-btn manage" @click="manageProducts">管理</view>
          </view>
        </view>
      </view>

      <!-- 开通小店 -->
      <view class="open-shop" v-else>
        <view class="open-shop-content">
          <text class="open-icon">🏪</text>
          <text class="open-title">还没有开通小店</text>
          <text class="open-desc">把您的兴趣和技能变成邻里间的小生意</text>
          <view class="open-btn" @click="openShop">
            <text>立即开通</text>
          </view>
        </view>
      </view>

      <!-- 快捷功能 -->
      <view class="quick-actions">
        <view class="action-item" @click="goToPublish">
          <view class="action-icon" style="background: #FFF3E0;">
            <text>📦</text>
          </view>
          <text class="action-text">发布商品</text>
        </view>
        <view class="action-item" @click="goToOrders">
          <view class="action-icon" style="background: #E3F2FD;">
            <text>📋</text>
          </view>
          <text class="action-text">我的订单</text>
        </view>
        <view class="action-item" @click="goToAnalytics">
          <view class="action-icon" style="background: #F3E5F5;">
            <text>📊</text>
          </view>
          <text class="action-text">数据统计</text>
        </view>
        <view class="action-item" @click="goToGuide">
          <view class="action-icon" style="background: #E8F5E9;">
            <text>📚</text>
          </view>
          <text class="action-text">创业指南</text>
        </view>
      </view>

      <!-- 商品分类 -->
      <view class="categories">
        <view class="category-list">
          <view 
            class="category-item" 
            :class="{ active: selectedCategory === 'all' }"
            @click="selectCategory('all')"
          >
            全部
          </view>
          <view 
            class="category-item" 
            :class="{ active: selectedCategory === 'food' }"
            @click="selectCategory('food')"
          >
            🍰 烘焙
          </view>
          <view 
            class="category-item" 
            :class="{ active: selectedCategory === 'cooking' }"
            @click="selectCategory('cooking')"
          >
            🍳 私房菜
          </view>
          <view 
            class="category-item" 
            :class="{ active: selectedCategory === 'handmade' }"
            @click="selectCategory('handmade')"
          >
            🎨 手工
          </view>
          <view 
            class="category-item" 
            :class="{ active: selectedCategory === 'service' }"
            @click="selectCategory('service')"
          >
            🛠️ 服务
          </view>
        </view>
      </view>

      <!-- 热门商品 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">🔥 热门商品</text>
          <text class="section-more">查看更多 ></text>
        </view>
        <view class="product-grid">
          <view 
            class="product-card" 
            v-for="product in hotProducts" 
            :key="product.id"
            @click="goToProductDetail(product)"
          >
            <view class="product-cover" :style="{ background: product.bgColor }">
              <text class="product-emoji">{{ product.emoji }}</text>
              <view class="product-badge" v-if="product.isHot">热门</view>
            </view>
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <view class="product-shop">
                <text class="shop-name">{{ product.shopName }}</text>
                <text class="shop-distance">📍 {{ product.distance }}m</text>
              </view>
              <view class="product-footer">
                <text class="product-price">¥{{ product.price }}</text>
                <text class="product-sales">已售 {{ product.sales }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 附近小店 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">🏪 附近小店</text>
        </view>
        <view class="shop-list">
          <view 
            class="shop-item" 
            v-for="shop in nearbyShops" 
            :key="shop.id"
            @click="visitShop(shop)"
          >
            <view class="shop-avatar" :style="{ background: shop.bgColor }">
              <text class="shop-emoji">{{ shop.emoji }}</text>
            </view>
            <view class="shop-detail">
              <text class="shop-name">{{ shop.name }}</text>
              <text class="shop-desc">{{ shop.description }}</text>
              <view class="shop-meta">
                <text>⭐ {{ shop.rating }}</text>
                <text>月销 {{ shop.monthlySales }}</text>
                <text>📍 {{ shop.distance }}m</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 创业故事 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📖 创业故事</text>
        </view>
        <view class="story-list">
          <view 
            class="story-card" 
            v-for="story in successStories" 
            :key="story.id"
            @click="goToStoryDetail(story)"
          >
            <image class="story-cover" :src="story.cover" mode="aspectFill" />
            <view class="story-content">
              <text class="story-title">{{ story.title }}</text>
              <text class="story-excerpt">{{ story.excerpt }}</text>
              <view class="story-meta">
                <image class="story-avatar" :src="story.avatar" mode="aspectFill" />
                <text class="story-author">{{ story.author }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusBarHeight = ref(20)
const hasShop = ref(true)
const selectedCategory = ref('all')

const shop = ref({
  name: '小红的烘焙坊',
  emoji: '🧁',
  bgColor: '#FFE0B2',
  products: 12,
  orders: 89,
  rating: 4.9
})

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
    distance: 120
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
    distance: 200
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
    distance: 350
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
    distance: 80
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
  }
])

const successStories = ref([
  {
    id: '1',
    title: '从家庭主妇到月入过万的烘焙店主',
    excerpt: '王阿姨的烘焙之路，从给邻居送蛋糕开始...',
    cover: 'https://picsum.photos/300/200?random=10',
    avatar: 'https://i.pravatar.cc/100?img=1',
    author: '王阿姨'
  },
  {
    id: '2',
    title: '程序员下班后做私房菜的真实故事',
    excerpt: '小李利用周末时间为邻居做健康私房菜...',
    cover: 'https://picsum.photos/300/200?random=11',
    avatar: 'https://i.pravatar.cc/100?img=2',
    author: '小李'
  }
])

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const openShop = () => {
  uni.navigateTo({ url: '/pages/business/open-shop' })
}

const editShop = () => {
  uni.navigateTo({ url: '/pages/business/edit-shop' })
}

const manageProducts = () => {
  uni.navigateTo({ url: '/pages/business/manage-products' })
}

const goToPublish = () => {
  uni.navigateTo({ url: '/pages/business/publish' })
}

const goToOrders = () => {
  uni.navigateTo({ url: '/pages/business/orders' })
}

const goToAnalytics = () => {
  uni.navigateTo({ url: '/pages/business/analytics' })
}

const goToGuide = () => {
  uni.navigateTo({ url: '/pages/business/guide' })
}

const goToProductDetail = (product: any) => {
  uni.navigateTo({ url: `/pages/business/product?id=${product.id}` })
}

const visitShop = (shop: any) => {
  uni.navigateTo({ url: `/pages/business/shop-detail?id=${shop.id}` })
}

const goToStoryDetail = (story: any) => {
  uni.navigateTo({ url: `/pages/business/story?id=${story.id}` })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, #2196F3, #64B5F6);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
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
  height: calc(100vh);
}

/* 我的小店 */
.my-shop {
  padding: var(--spacing-lg);
  margin-top: -20px;
}

.shop-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
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

.shop-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.shop-stats {
  display: flex;
  gap: var(--spacing-md);
}

.shop-stat {
  font-size: 12px;
  color: var(--text-muted);
}

.shop-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.shop-btn {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
}

.shop-btn.edit {
  background: var(--bg-color);
  color: var(--text-secondary);
}

.shop-btn.manage {
  background: #2196F3;
  color: white;
}

/* 开通小店 */
.open-shop {
  margin: var(--spacing-lg);
  margin-top: -20px;
}

.open-shop-content {
  background: var(--card-bg);
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
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.open-desc {
  font-size: 14px;
  color: var(--text-muted);
  display: block;
  margin-bottom: var(--spacing-lg);
}

.open-btn {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  padding: var(--spacing-md) var(--spacing-xxl);
  border-radius: 25px;
  font-weight: 500;
  display: inline-block;
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-lg);
  background: var(--card-bg);
  margin: 0 var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
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
  color: var(--text-secondary);
}

/* 分类 */
.categories {
  padding: var(--spacing-lg);
}

.category-list {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
}

.category-item {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-secondary);
  white-space: nowrap;
}

.category-item.active {
  background: #2196F3;
  color: white;
}

/* 区块 */
.section {
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-more {
  font-size: 12px;
  color: var(--text-muted);
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.product-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
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
  background: #F44336;
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
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.product-shop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.shop-name {
  font-size: 12px;
  color: var(--text-muted);
}

.shop-distance {
  font-size: 11px;
  color: var(--text-muted);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 16px;
  font-weight: 600;
  color: #F44336;
}

.product-sales {
  font-size: 12px;
  color: var(--text-muted);
}

/* 附近小店 */
.shop-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.shop-item {
  background: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
}

.shop-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
}

.shop-detail {
  flex: 1;
}

.shop-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.shop-desc {
  font-size: 13px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.shop-meta {
  display: flex;
  gap: var(--spacing-md);
}

.shop-meta text {
  font-size: 12px;
  color: var(--text-muted);
}

/* 创业故事 */
.story-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.story-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
}

.story-cover {
  width: 100px;
  height: 100px;
}

.story-content {
  flex: 1;
  padding: var(--spacing-md);
}

.story-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.story-excerpt {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
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
}

.story-author {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
