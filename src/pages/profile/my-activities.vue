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
import { userApi } from '../../utils/api'
import { navigateBack } from '../../utils/router'

const statusBarHeight = ref(20)
const loading = ref(false)
const activities = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const hasMore = ref(true)
const scrollRef = ref<HTMLElement | null>(null)

// 模拟数据
const mockActivities = ref([
  {
    id: '1',
    title: '周末亲子烘焙活动',
    description: '邀请社区的家长和小朋友一起参加亲子烘焙，制作美味蛋糕！',
    category: 'other',
    location: '阳光社区活动中心',
    start_time: Math.floor(Date.now() / 1000) + 86400 * 2,
    max_participants: 20,
    current_participants: 15,
    status: 'upcoming',
    user: { nickname: '热心肠王阿姨', avatar: 'https://i.pravatar.cc/100?img=20' }
  },
  {
    id: '2',
    title: '社区足球友谊赛',
    description: '每周日上午9点在社区运动场举行足球友谊赛，欢迎足球爱好者报名参加！',
    category: 'sports',
    location: '阳光社区运动场',
    start_time: Math.floor(Date.now() / 1000) + 86400 * 3,
    max_participants: 22,
    current_participants: 18,
    status: 'upcoming',
    user: { nickname: '阳光社区小李', avatar: 'https://i.pravatar.cc/100?img=10' }
  },
  {
    id: '3',
    title: '社区花园维护',
    description: '一起为社区花园除草、浇水，让我们的小区更美丽！',
    category: 'charity',
    location: '社区花园',
    start_time: Math.floor(Date.now() / 1000) - 86400,
    max_participants: 30,
    current_participants: 25,
    status: 'completed',
    user: { nickname: '志愿者小刘', avatar: 'https://i.pravatar.cc/100?img=30' }
  }
])

onMounted(() => {
  statusBarHeight.value = 20
  loadActivities()
})

const goBack = () => {
  navigateBack()
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
    console.error('加载失败，使用模拟数据:', error)
    if (isRefresh || activities.value.length === 0) {
      activities.value = mockActivities.value
      hasMore.value = false
    }
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
  cursor: pointer;
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
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
  object-fit: cover;
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
  object-fit: cover;
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