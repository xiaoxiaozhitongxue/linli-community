<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <text>←</text>
        </view>
        <text class="navbar-title">我的动态</text>
        <view class="publish-btn" @click="goPublish">
          发布
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh">
      <!-- 空状态 -->
      <view v-if="!loading && posts.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无动态</text>
        <view class="btn btn-primary" style="margin-top: 24px;" @click="goPublish">
          发布第一条动态
        </view>
      </view>

      <!-- 动态列表 -->
      <view v-else class="post-list">
        <view class="post-card" v-for="post in posts" :key="post.id">
          <view class="post-header">
            <image class="post-avatar" :src="post.user.avatar || 'https://i.pravatar.cc/100?img=10'" mode="aspectFill" />
            <view class="post-user-info">
              <text class="post-username">{{ post.user.nickname }}</text>
              <text class="post-time">{{ formatTime(post.created_at) }}</text>
            </view>
          </view>

          <view class="post-content">
            <text class="post-text">{{ post.content }}</text>
          </view>

          <view v-if="post.images && post.images.length > 0" class="post-images">
            <image 
              v-for="(img, index) in post.images.slice(0, 9)" 
              :key="index"
              class="post-image"
              :src="img"
              mode="aspectFill"
              :class="{ 'single-image': post.images.length === 1 }"
            />
          </view>

          <view class="post-footer">
            <view class="post-action">
              <text class="action-icon">❤️</text>
              <text class="action-text">{{ post.like_count }}</text>
            </view>
            <view class="post-action">
              <text class="action-icon">💬</text>
              <text class="action-text">{{ post.comment_count }}</text>
            </view>
            <view class="post-action">
              <text class="action-icon">📅</text>
              <text class="action-text">{{ getVisibilityText(post.visibility) }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="loading" class="loading-more">
          <text>加载中...</text>
        </view>

        <view v-if="!hasMore && posts.length > 0" class="no-more">
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
const posts = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const hasMore = ref(true)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loadPosts()
})

const goBack = () => {
  uni.navigateBack()
}

const goPublish = () => {
  uni.navigateTo({ url: '/pages/post/create' })
}

const loadPosts = async (isRefresh = false) => {
  if (loading.value) return
  if (!hasMore.value && !isRefresh) return

  try {
    loading.value = true
    if (isRefresh) {
      page.value = 1
      hasMore.value = true
    }

    const res = await userApi.getMyPosts({
      page: page.value,
      limit: limit.value
    })

    if (isRefresh) {
      posts.value = res.items
    } else {
      posts.value = [...posts.value, ...res.items]
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
  await loadPosts(true)
}

const loadMore = () => {
  loadPosts()
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

const getVisibilityText = (visibility: string) => {
  const map: Record<string, string> = {
    public: '公开',
    community: '社区可见',
    private: '仅自己可见'
  }
  return map[visibility] || '公开'
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

.publish-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
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

/* 动态列表 */
.post-list {
  padding: 12px;
}

.post-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.post-user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-username {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.post-time {
  font-size: 12px;
  color: var(--text-muted);
}

.post-content {
  margin-bottom: 12px;
}

.post-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  background: var(--border-color);
}

.post-image.single-image {
  grid-column: span 3;
  max-width: 240px;
  aspect-ratio: 4/3;
}

.post-footer {
  display: flex;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.post-action {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.action-icon {
  font-size: 16px;
  margin-right: 4px;
}

.action-text {
  font-size: 13px;
  color: var(--text-secondary);
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
