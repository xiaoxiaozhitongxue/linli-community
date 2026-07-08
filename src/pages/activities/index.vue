<template>
  <div class="page">
    <NavBar title="活动中心" :fixed="true" actionText="发起活动" @action-click="goToCreate" />

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <div 
        v-for="tab in filterTabs" 
        :key="tab.value"
        class="filter-tab"
        :class="{ active: currentFilter === tab.value }"
        @click="changeFilter(tab.value)"
      >
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 加载状态 -->
      <SkeletonLoader v-if="loading && activities.length === 0" type="card" :count="3" />

      <!-- 错误状态 -->
      <ErrorBoundary v-else-if="error" message="加载失败，请稍后重试" @retry="retry" />

      <!-- 空状态 -->
      <EmptyState v-else-if="!loading && activities.length === 0" icon="calendar" title="暂无活动" description="还没有人发起活动" actionText="发起第一个活动" @action="goToCreate" />

      <!-- 活动列表 -->
      <div v-else class="activity-list">
        <!-- 热门活动区域 -->
        <div v-if="hotActivities.length > 0 && currentFilter === 'all'" class="section">
          <div class="section-header">
            <span class="section-title"><AppIcon name="flame" :size="18" />热门活动</span>
          </div>
          <div class="hot-scroll">
            <div 
              v-for="activity in hotActivities" 
              :key="activity.id"
              class="hot-card"
              @click="goToDetail(activity.id)"
            >
              <div class="hot-card-cover" :style="{ background: getActivityGradient(activity.category) }">
                <span class="hot-card-category-badge" :class="'cat-' + activity.category">
                  {{ getCategoryLabel(activity.category) }}
                </span>
                <span class="hot-card-icon"><AppIcon :name="getActivityEmoji(activity.category)" :size="24" /></span>
                <div class="hot-card-status-badge" :class="'status-' + activity.status">
                  {{ getStatusText(activity.status) }}
                </div>
              </div>
              <div class="hot-card-body">
                <h3 class="hot-card-title">{{ activity.title }}</h3>
                <div class="hot-card-meta">
                  <span class="hot-card-meta-item">{{ formatShortTime(activity.start_time) }}</span>
                  <span class="hot-card-meta-item">{{ activity.current_participants }}人关注</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 近期活动网格 -->
        <div class="section">
          <div class="section-header">
            <span class="section-title"><AppIcon name="target" :size="18" />近期活动</span>
            <span class="section-count">{{ filteredActivities.length }}个活动</span>
          </div>

          <div class="activity-grid">
            <div 
              v-for="activity in filteredActivities" 
              :key="activity.id"
              class="activity-card"
              @click="goToDetail(activity.id)"
            >
              <!-- 封面区域 -->
              <div class="card-cover" :style="{ background: getActivityGradient(activity.category) }">
                <span class="card-category-badge" :class="'cat-' + activity.category">
                  <AppIcon :name="getActivityEmoji(activity.category)" :size="12" />
                  {{ getCategoryLabel(activity.category) }}
                </span>
                <span class="card-icon">
                  <AppIcon :name="getActivityEmoji(activity.category)" :size="28" />
                </span>
                <div class="card-status-badge" :class="'status-' + activity.status">
                  {{ getStatusText(activity.status) }}
                </div>
              </div>

              <!-- 信息区域 -->
              <div class="card-body">
                <h3 class="card-title">{{ activity.title }}</h3>

                <div class="card-info-list">
                  <div class="card-info-item">
                    <AppIcon name="clock" :size="13" />
                    <span>{{ formatShortTime(activity.start_time) }}</span>
                  </div>
                  <div class="card-info-item" v-if="activity.location">
                    <AppIcon name="map-pin" :size="13" />
                    <span>{{ activity.location }}</span>
                  </div>
                </div>

                <div class="card-footer">
                  <span class="card-participants">
                    <AppIcon name="users" :size="13" />
                    <span>{{ activity.current_participants }}人关注</span>
                  </span>
                  <span 
                    class="card-join-btn"
                    :class="{ 
                      joined: activity.is_participant,
                      full: activity.max_participants && activity.current_participants >= activity.max_participants,
                      ended: activity.status === 'completed' || activity.status === 'cancelled'
                    }"
                  >
                    {{ getButtonText(activity) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore && activities.length > 0" class="load-more">
          <span v-if="!loadingMore" @click="loadMore">加载更多</span>
          <div v-else class="loading-more">
            <div class="loading-spinner small"></div>
            <span>加载中...</span>
          </div>
        </div>

        <div v-if="!hasMore && activities.length > 0" class="no-more">
          <span>— 没有更多了 —</span>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { activityService } from '../../services/activityService'
import type { Activity } from '../../types/models'
import { navigateTo, navigateBack } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import NavBar from '../../components/NavBar.vue'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import AppIcon from '../../components/AppIcon.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorBoundary from '../../components/ErrorBoundary.vue'
import { getActivityStatusLabel } from '../../constants/status'

const loading = ref(false)
const loadingMore = ref(false)
const error = ref(false)
const activities = ref<Activity[]>([])
const currentFilter = ref('all')
const currentPage = ref(1)
const hasMore = ref(true)

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'completed' }
]

// 热门活动(取前4个参与人数最多的活动)
const hotActivities = computed(() => {
  return [...activities.value]
    .sort((a, b) => b.current_participants - a.current_participants)
    .slice(0, 4)
})

// 根据筛选条件过滤活动
const filteredActivities = computed(() => {
  if (currentFilter.value === 'all') {
    return activities.value
  }
  return activities.value.filter(a => a.status === currentFilter.value)
})

const getActivityEmoji = (category: string) => {
  const map: Record<string, string> = {
    sports: 'activity',
    culture: 'book-open',
    charity: 'heart',
    party: 'star',
    other: 'bookmark'
  }
  return map[category] || 'bookmark'
}

const getActivityGradient = (category: string): string => {
  const map: Record<string, string> = {
    sports: 'linear-gradient(135deg, #43A047, #81C784)',
    culture: 'linear-gradient(135deg, #7B1FA2, #CE93D8)',
    charity: 'linear-gradient(135deg, #E53935, #EF9A9A)',
    party: 'linear-gradient(135deg, #FB8C00, #FFB74D)',
    other: 'linear-gradient(135deg, #1E88E5, #64B5F6)'
  }
  return map[category] || 'linear-gradient(135deg, #1E88E5, #64B5F6)'
}

const getActivityCoverBg = (category: string) => {
  const map: Record<string, string> = {
    sports: '#C8E6C9',
    culture: '#F3E5F5',
    charity: '#E8F5E9',
    party: '#FFE0B2',
    other: '#E3F2FD'
  }
  return map[category] || '#F5F5F0'
}

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    sports: '运动健身',
    culture: '文化艺术',
    charity: '公益活动',
    party: '聚会派对',
    other: '其他'
  }
  return map[category] || '其他'
}

const getStatusText = (status: string) => getActivityStatusLabel(status)

const getButtonText = (activity: Activity) => {
  if (activity.status === 'completed' || activity.status === 'cancelled') {
    return '已结束'
  }
  if (activity.is_participant) {
    return '已报名'
  }
  if (activity.max_participants && activity.current_participants >= activity.max_participants) {
    return '已满员'
  }
  return '立即报名'
}

const formatShortTime = (timestamp: number) => {
  // 如果时间戳大于 1e12，说明是毫秒级时间戳
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else if (days === 1) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `明天 ${hours}:${minutes}`
  } else if (days > 0 && days < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${weekdays[date.getDay()]} ${hours}:${minutes}`
  } else {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}月${day}日`
  }
}

const formatFullDate = (timestamp: number) => {
  // 如果时间戳大于 1e12，说明是毫秒级时间戳
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}`
}

const changeFilter = (value: string) => {
  currentFilter.value = value
}

const fetchActivities = async (page: number = 1, isRefresh: boolean = false) => {
  try {
    const params: any = { page, limit: 10 }
    if (currentFilter.value !== 'all') {
      params.status = currentFilter.value
    }
    
    const response = await activityService.getActivities(params)
    
    if (isRefresh) {
      activities.value = response.items
    } else {
      activities.value = [...activities.value, ...response.items]
    }
    
    currentPage.value = page
    hasMore.value = page < response.total_pages
    error.value = false
  } catch {
    error.value = true
    toastError('加载失败，请稍后重试')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  await fetchActivities(currentPage.value + 1)
}

const goToDetail = (id: string) => {
  navigateTo(`/pages/activities/detail?id=${id}`)
}

const goToCreate = () => {
  navigateTo('/pages/activities/create')
}

const goBack = () => {
  navigateBack()
}

const retry = () => {
  error.value = false
  loading.value = true
  fetchActivities(1, true)
}

onMounted(async () => {
  loading.value = true
  await fetchActivities(1, true)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* ========================================
   筛选标签
   ======================================== */
.filter-tabs {
  position: fixed;
  top: 52px;
  top: calc(52px + var(--safe-area-top));
  left: 0;
  right: 0;
  display: flex;
  background: var(--color-bg-secondary);
  padding: var(--spacing-md) var(--spacing-lg);
  gap: var(--spacing-md);
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);
}

.filter-tab {
  flex: 1;
  padding: var(--spacing-sm) 0;
  text-align: center;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-smooth);
  border: 1px solid transparent;
}

.filter-tab:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: rgba(255, 107, 53, 0.2);
}

.filter-tab.active {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  border-color: transparent;
}

.filter-tab span {
  display: inline-block;
}

/* ========================================
   内容区域
   ======================================== */
.content {
  width: 100%;
  /* 112px = NavBar 固定高度(约44px) + filter-tabs 固定高度(约52px) + 额外间距(约16px) */
  padding-top: 112px;
  padding-top: calc(112px + var(--safe-area-top));
  min-height: 100vh;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid var(--color-primary-soft);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* ========================================
   活动列表
   ======================================== */
.activity-list {
  padding: 0;
}

.section {
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0 0 var(--spacing-lg) 0;
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  background: var(--color-bg-tertiary);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

/* ========================================
   热门活动 - 移动端横向滑动
   ======================================== */
.hot-scroll {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  display: flex;
  gap: var(--spacing-md);
}

.hot-scroll::-webkit-scrollbar {
  display: none;
}

.hot-card {
  display: inline-block;
  width: 180px;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all var(--transition-fast);
  scroll-snap-align: start;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.hot-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.hot-card:active {
  transform: scale(0.97);
}

.hot-card-cover {
  position: relative;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hot-card-category-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.hot-card-category-badge.cat-sports {
  color: #2E7D32;
}

.hot-card-category-badge.cat-culture {
  color: #7B1FA2;
}

.hot-card-category-badge.cat-charity {
  color: #C62828;
}

.hot-card-category-badge.cat-party {
  color: #E65100;
}

.hot-card-category-badge.cat-other {
  color: #1565C0;
}

.hot-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
}

.hot-card-status-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  backdrop-filter: blur(6px);
}

.hot-card-status-badge.status-upcoming {
  background: rgba(255, 107, 53, 0.9);
  color: #fff;
}

.hot-card-status-badge.status-ongoing {
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
}

.hot-card-status-badge.status-completed,
.hot-card-status-badge.status-cancelled {
  background: rgba(139, 139, 165, 0.85);
  color: #fff;
}

.hot-card-body {
  padding: 10px 12px 12px;
}

.hot-card-title {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: 1.4;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-card-meta-item {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

/* ========================================
   近期活动 - 响应式网格
   ======================================== */
.activity-grid {
  display: grid;
  gap: 14px;
}

.activity-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.activity-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.activity-card:active {
  transform: scale(0.98);
}

/* --- 卡片封面 --- */
.card-cover {
  position: relative;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  z-index: 1;
}

.card-category-badge.cat-sports {
  color: #2E7D32;
}

.card-category-badge.cat-culture {
  color: #7B1FA2;
}

.card-category-badge.cat-charity {
  color: #C62828;
}

.card-category-badge.cat-party {
  color: #E65100;
}

.card-category-badge.cat-other {
  color: #1565C0;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: transform var(--transition-smooth);
}

.activity-card:hover .card-icon {
  transform: scale(1.12) rotate(-8deg);
}

.card-status-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  backdrop-filter: blur(6px);
  z-index: 1;
}

.card-status-badge.status-upcoming {
  background: rgba(255, 107, 53, 0.92);
  color: #fff;
}

.card-status-badge.status-ongoing {
  background: rgba(16, 185, 129, 0.92);
  color: #fff;
}

.card-status-badge.status-completed,
.card-status-badge.status-cancelled {
  background: rgba(139, 139, 165, 0.88);
  color: #fff;
}

/* --- 卡片内容 --- */
.card-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.45;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.card-info-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: auto;
  padding-bottom: 10px;
}

.card-info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

.card-info-item .app-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

/* --- 卡片底栏 --- */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-light);
}

.card-participants {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.card-join-btn {
  padding: 6px 14px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  border-radius: 10px;
  transition: all var(--transition-smooth);
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.2);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.card-join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(255, 107, 53, 0.3);
}

.card-join-btn:active {
  transform: scale(0.94);
}

.card-join-btn.joined {
  background: var(--color-success-soft);
  color: var(--color-success);
  box-shadow: none;
}

.card-join-btn.full {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  box-shadow: none;
}

.card-join-btn.ended {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  box-shadow: none;
}

/* 加载更多 */
.load-more,
.no-more {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.load-more span {
  cursor: pointer;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  display: inline-block;
}

.load-more span:hover {
  background: var(--color-primary-soft);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
}

/* ========================================
   响应式断点
   ======================================== */

/* --- 移动端：1列 --- */
@media (max-width: 767px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }
}

/* --- 平板：2列 --- */
@media (min-width: 768px) and (max-width: 1023px) {
  .filter-tabs {
    padding: var(--spacing-lg) var(--spacing-xl);
    gap: var(--spacing-lg);
    max-width: 600px;
    margin: 0 auto;
    left: 0;
    right: 0;
  }

  .filter-tab {
    padding: var(--spacing-sm) 0;
    font-size: var(--font-size-md);
  }

  .activity-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section {
    padding: var(--spacing-md) var(--spacing-xl);
  }

  .hot-card {
    width: 200px;
  }
}

/* --- 桌面：3列 --- */
@media (min-width: 1024px) and (max-width: 1439px) {
  .content {
    max-width: none;
    margin: 0;
  }

  .filter-tabs {
    left: var(--nav-sidebar-width, 220px);
    right: 0;
    max-width: none;
    margin: 0;
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }

  .section {
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .activity-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 热门活动 - 网格布局 */
  .hot-scroll {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    overflow-x: visible;
    white-space: normal;
    padding-bottom: 0;
  }

  .hot-card {
    width: auto;
  }
}

/* --- 大屏：4列 --- */
@media (min-width: 1440px) {
  .content {
    max-width: none;
    margin: 0;
  }

  .filter-tabs {
    left: var(--nav-sidebar-width, 220px);
    right: 0;
    max-width: none;
    margin: 0;
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }

  .section {
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .activity-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  /* 热门活动 - 网格布局 */
  .hot-scroll {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-lg);
    overflow-x: visible;
    white-space: normal;
    padding-bottom: 0;
  }

  .hot-card {
    width: auto;
  }
}
</style>
