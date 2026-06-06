<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <text>←</text>
        </view>
        <text class="navbar-title">我的收藏</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh">
      <!-- 空状态 -->
      <view v-if="!loading && favorites.length === 0" class="empty-state">
        <text class="empty-icon">⭐</text>
        <text class="empty-text">暂无收藏</text>
      </view>

      <!-- 收藏列表 -->
      <view v-else class="favorite-list">
        <view class="favorite-card" v-for="item in favorites" :key="item.id">
          <view class="favorite-header">
            <view class="type-tag" :class="item.target_type">
              {{ getTypeText(item.target_type) }}
            </view>
            <text class="favorite-time">{{ formatTime(item.created_at) }}</text>
          </view>

          <view v-if="item.target" class="favorite-content">
            <!-- 动态类型 -->
            <view v-if="item.target_type === 'post'" class="post-preview">
              <text class="post-preview-text">{{ item.target.content }}</text>
              <view v-if="item.target.images && item.target.images.length > 0" class="post-preview-images">
                <image 
                  v-for="(img, index) in item.target.images.slice(0, 3)" 
                  :key="index"
                  class="preview-image"
                  :src="img"
                  mode="aspectFill"
                />
              </view>
              <view class="post-preview-meta">
                <view class="meta-item">
                  <text class="meta-icon">❤️</text>
                  <text class="meta-text">{{ item.target.like_count }}</text>
                </view>
                <view class="meta-item">
                  <text class="meta-icon">💬</text>
                  <text class="meta-text">{{ item.target.comment_count }}</text>
                </view>
              </view>
            </view>

            <!-- 活动类型 -->
            <view v-if="item.target_type === 'activity'" class="activity-preview">
              <view class="preview-cover">
                <image 
                  v-if="item.target.images && item.target.images.length > 0" 
                  class="cover-img"
                  :src="item.target.images[0]"
                  mode="aspectFill"
                />
                <view v-else class="cover-placeholder">
                  <text>{{ getCategoryIcon(item.target.category) }}</text>
                </view>
              </view>
              <view class="preview-info">
                <text class="preview-title">{{ item.target.title }}</text>
                <text class="preview-desc">{{ item.target.location }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="loading" class="loading-more">
          <text>加载中...</text>
        </view>

        <view v-if="!hasMore && favorites.length > 0" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '../../utils/api'

const statusBarHeight = ref(20)
const loading = ref(false)
const favorites = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const hasMore = ref(true)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loadFavorites()
})

const goBack = () => {
  uni.navigateBack()
}

const loadFavorites = async (isRefresh = false) => {
  if (loading.value) return
  if (!hasMore.value && !isRefresh) return

  try {
    loading.value = true
    if (isRefresh) {
      page.value = 1
      hasMore.value = true
    }

    const res = await userApi.getMyFavorites({
      page: page.value,
      limit: limit.value
    })

    if (isRefresh) {
      favorites.value = res.items
    } else {
      favorites.value = [...favorites.value, ...res.items]
    }

    hasMore.value = page.value < res.total_pages
    page.value++
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  await loadFavorites(true)
}

const loadMore = () => {
  loadFavorites()
}

const formatTime = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 2592000) return Math.floor(diff / 86400) + '天前'
  
  const date = new Date(timestamp * 1000)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    post: '动态',
    comment: '评论',
    activity: '活动'
  }
  return map[type] || '内容'
}

const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    sports: '⚽',
    culture: '🎨',
    charity: '❤️',
    party: '🎉',
    other: '📌'
  }
  return map[category] || '📌'
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 导航栏 */
.navbar {
  background: var(--card-bg);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 44px;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.placeholder {
  width: 44px;
}

.content {
  height: calc(100vh - 60px);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-muted);
}

/* 收藏列表 */
.favorite-list {
  padding: 12px;
}

.favorite-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.favorite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.type-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-tag.post {
  background: #E3F2FD;
  color: #2196F3;
}

.type-tag.comment {
  background: #F3E5F5;
  color: #9C27B0;
}

.type-tag.activity {
  background: #FFF3E0;
  color: #FF9800;
}

.favorite-time {
  font-size: 12px;
  color: var(--text-muted);
}

.favorite-content {
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

/* 动态预览 */
.post-preview {
}

.post-preview-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.post-preview-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: var(--border-color);
}

.post-preview-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 14px;
  margin-right: 4px;
}

.meta-text {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 活动预览 */
.activity-preview {
  display: flex;
  gap: 12px;
}

.preview-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--border-color);
  font-size: 32px;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.preview-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-desc {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载状态 */
.loading-more,
.no-more {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
