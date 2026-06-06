<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <text>←</text>
        </view>
        <text class="navbar-title">我的活动</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <scroll-view class="content" scroll-y @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh">
      <!-- 空状态 -->
      <view v-if="!loading && activities.length === 0" class="empty-state">
        <text class="empty-icon">🎯</text>
        <text class="empty-text">暂无活动</text>
      </view>

      <!-- 活动列表 -->
      <view v-else class="activity-list">
        <view class="activity-card" v-for="activity in activities" :key="activity.id">
          <view class="activity-cover">
            <image 
              v-if="activity.images && activity.images.length > 0" 
              class="cover-image" 
              :src="activity.images[0]" 
              mode="aspectFill"
            />
            <view v-else class="cover-placeholder">
              <text class="cover-icon">{{ getCategoryIcon(activity.category) }}</text>
            </view>
            <view class="activity-status" :class="activity.status">
              {{ getStatusText(activity.status) }}
            </view>
          </view>

          <view class="activity-info">
            <view class="activity-header">
              <text class="activity-title">{{ activity.title }}</text>
            </view>

            <view class="activity-meta">
              <view class="meta-item">
                <text class="meta-icon">📅</text>
                <text class="meta-text">{{ formatDate(activity.start_time) }}</text>
              </view>
              <view class="meta-item">
                <text class="meta-icon">📍</text>
                <text class="meta-text">{{ activity.location }}</text>
              </view>
              <view class="meta-item">
                <text class="meta-icon">👥</text>
                <text class="meta-text">{{ activity.current_participants }}/{{ activity.max_participants || '不限' }}</text>
              </view>
            </view>

            <view class="activity-desc">
              <text class="desc-text">{{ activity.description }}</text>
            </view>

            <view class="activity-footer">
              <view class="creator-info">
                <image class="creator-avatar" :src="activity.user.avatar || 'https://i.pravatar.cc/100?img=10'" mode="aspectFill" />
                <text class="creator-name">{{ activity.user.nickname }}</text>
              </view>
              <view class="activity-actions">
                <view class="action-tag" :class="activity.category">{{ getCategoryText(activity.category) }}</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="loading" class="loading-more">
          <text>加载中...</text>
        </view>

        <view v-if="!hasMore && activities.length > 0" class="no-more">
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
const activities = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const hasMore = ref(true)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loadActivities()
})

const goBack = () => {
  uni.navigateBack()
}

const loadActivities = async (isRefresh = false) => {
  if (loading.value) return
  if (!hasMore.value && !isRefresh) return

  try {
    loading.value = true
    if (isRefresh) {
      page.value = 1
      hasMore.value = true
    }

    const res = await userApi.getMyActivities({
      page: page.value,
      limit: limit.value
    })

    if (isRefresh) {
      activities.value = res.items
    } else {
      activities.value = [...activities.value, ...res.items]
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
  await loadActivities(true)
}

const loadMore = () => {
  loadActivities()
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
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

const getCategoryText = (category: string) => {
  const map: Record<string, string> = {
    sports: '运动',
    culture: '文化',
    charity: '公益',
    party: '聚会',
    other: '其他'
  }
  return map[category] || '其他'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return map[status] || '即将开始'
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

/* 活动列表 */
.activity-list {
  padding: 12px;
}

.activity-card {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.activity-cover {
  position: relative;
  height: 160px;
  background: var(--border-color);
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f0, #e8e8e0);
}

.cover-icon {
  font-size: 48px;
}

.activity-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.activity-status.upcoming {
  background: #2196F3;
}

.activity-status.ongoing {
  background: #4CAF50;
}

.activity-status.completed {
  background: #9E9E9E;
}

.activity-status.cancelled {
  background: #F44336;
}

.activity-info {
  padding: 16px;
}

.activity-header {
  margin-bottom: 12px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.activity-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.meta-icon {
  font-size: 14px;
  margin-right: 6px;
}

.meta-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.activity-desc {
  margin-bottom: 12px;
}

.desc-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.creator-info {
  display: flex;
  align-items: center;
}

.creator-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.creator-name {
  font-size: 13px;
  color: var(--text-secondary);
}

.action-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.action-tag.sports {
  background: #E3F2FD;
  color: #2196F3;
}

.action-tag.culture {
  background: #F3E5F5;
  color: #9C27B0;
}

.action-tag.charity {
  background: #E8F5E9;
  color: #4CAF50;
}

.action-tag.party {
  background: #FFF3E0;
  color: #FF9800;
}

.action-tag.other {
  background: #F5F5F5;
  color: #9E9E9E;
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
