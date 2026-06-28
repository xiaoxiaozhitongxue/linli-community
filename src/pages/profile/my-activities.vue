<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="navbar-content">
        <div class="back-btn" @click="goBack">
          <span>←</span>
        </div>
        <span class="navbar-title">我的活动</span>
        <div class="placeholder"></div>
      </div>
    </div>

    <div class="scroll-content" ref="scrollRef" @scroll="onScroll">
      <!-- 空状态 -->
      <div v-if="!loading && activities.length === 0" class="empty-state">
        <span class="empty-icon">🎯</span>
        <span class="empty-text">暂无活动</span>
      </div>

      <!-- 活动列表 -->
      <div v-else class="activity-list">
        <div class="activity-card" v-for="activity in activities" :key="activity.id">
          <div class="activity-cover">
            <img
              v-if="activity.images && activity.images.length > 0"
              class="cover-image"
              :src="activity.images[0]"
              alt="活动封面"
            />
            <div v-else class="cover-placeholder">
              <span class="cover-icon">{{ getCategoryIcon(activity.category) }}</span>
            </div>
            <div class="activity-status" :class="activity.status">
              {{ getStatusText(activity.status) }}
            </div>
          </div>

          <div class="activity-info">
            <div class="activity-header">
              <span class="activity-title">{{ activity.title }}</span>
            </div>

            <div class="activity-meta">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">{{ formatDate(activity.start_time) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span class="meta-text">{{ activity.location }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">👥</span>
                <span class="meta-text">{{ activity.current_participants }}/{{ activity.max_participants || '不限' }}</span>
              </div>
            </div>

            <div class="activity-desc">
              <span class="desc-text">{{ activity.description }}</span>
            </div>

            <div class="activity-footer">
              <div class="creator-info">
                <img class="creator-avatar" :src="activity.user?.avatar || 'https://i.pravatar.cc/100?img=10'" alt="头像" />
                <span class="creator-name">{{ activity.user?.nickname }}</span>
              </div>
              <div class="activity-actions">
                <div class="action-tag" :class="activity.category">{{ getCategoryText(activity.category) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="loading" class="loading-more">
          <span>加载中...</span>
        </div>

        <div v-if="!hasMore && activities.length > 0" class="no-more">
          <span>没有更多了</span>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { activityService } from '../../services/activityService'
import { navigateBackSmart } from '../../utils/router'

const statusBarHeight = ref(20)
const loading = ref(false)
const activities = ref<any[]>([])
const page = ref(1)
const hasMore = ref(true)
const scrollRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  statusBarHeight.value = 20
  await loadActivities()
})

const goBack = () => {
  navigateBackSmart()
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
    const res = await activityService.getActivities({ page: page.value, limit: 10 })
    const items: any[] = (res && (res as any).items) || []
    if (isRefresh) {
      activities.value = items
    } else {
      activities.value = [...activities.value, ...items]
    }
    hasMore.value = (res as any).total_pages ? page.value < (res as any).total_pages : items.length >= 10
    page.value++
  } catch {
    activities.value = []
  } finally {
    loading.value = false
  }
}

const onScroll = () => {
  if (!scrollRef.value) return
  const el = scrollRef.value
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
    loadActivities()
  }
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
  background-color: var(--color-bg-primary);
}

/* 导航栏 */
.navbar {
  background: var(--color-bg-secondary);
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
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.back-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.placeholder {
  width: 44px;
}

.scroll-content {
  overflow-y: auto;
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
  color: var(--color-text-tertiary);
}

/* 活动列表 */
.activity-list {
  padding: 12px;
}

.activity-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.activity-cover {
  position: relative;
  height: 160px;
  background: var(--color-bg-tertiary);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-bg-tertiary), var(--color-bg-primary));
}

.cover-icon {
  font-size: 48px;
}

.activity-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  background: var(--color-bg-overlay);
  color: var(--color-text-white);
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
  color: var(--color-text-primary);
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
  color: var(--color-text-secondary);
}

.activity-desc {
  margin-bottom: 12px;
}

.desc-text {
  font-size: 14px;
  color: var(--color-text-secondary);
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
  border-top: 1px solid var(--color-border-light);
}

.creator-info {
  display: flex;
  align-items: center;
}

.creator-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  margin-right: 8px;
  object-fit: cover;
}

.creator-name {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.action-tag {
  padding: 4px 12px;
  border-radius: var(--radius-full);
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
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

/* 加载状态 */
.loading-more,
.no-more {
  text-align: center;
  padding: 24px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}
</style>