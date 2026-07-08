<template>
  <div class="page">
    <NavBar title="活动中心" type="white" :fixed="true" actionText="发起活动" @action-click="goToCreate" />

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
          <div class="hot-activity-scroll">
            <div 
              v-for="activity in hotActivities" 
              :key="activity.id"
              class="hot-activity-card"
              @click="goToDetail(activity.id)"
            >
              <div class="hot-activity-cover" :style="{ background: getActivityCoverBg(activity.category) }">
                <span class="hot-activity-emoji"><AppIcon :name="getActivityEmoji(activity.category)" :size="44" /></span>
              </div>
              <div class="hot-activity-info">
                <span class="hot-activity-name">{{ activity.title }}</span>
                <div class="hot-activity-meta">
                  <span class="hot-activity-time">{{ formatShortTime(activity.start_time) }}</span>
                  <span class="hot-activity-join">{{ activity.current_participants }}人参与</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 近期活动列表 -->
        <div class="section">
          <div class="section-header">
            <span class="section-title"><AppIcon name="target" :size="18" />近期活动</span>
            <span class="section-count">{{ filteredActivities.length }}个活动</span>
          </div>
          
          <div class="recent-activity-list">
            <div 
              v-for="activity in filteredActivities" 
              :key="activity.id"
              class="recent-activity-card"
              @click="goToDetail(activity.id)"
            >
              <div class="recent-activity-cover" :style="{ background: getActivityCoverBg(activity.category) }">
                <span class="recent-activity-icon"><AppIcon :name="getActivityEmoji(activity.category)" :size="56" /></span>
                <div class="recent-activity-badge" :class="'status-' + activity.status">
                  {{ getStatusText(activity.status) }}
                </div>
              </div>
              <div class="recent-activity-content">
                <div class="recent-activity-top">
                  <span class="recent-activity-name">{{ activity.title }}</span>
                  <div class="recent-activity-category" :class="'cat-' + activity.category">
                    {{ getCategoryLabel(activity.category) }}
                  </div>
                </div>
                
                <div class="recent-activity-info">
                  <div class="info-item">
                    <span class="info-icon"><AppIcon name="calendar" :size="14" /></span>
                    <span class="info-text">{{ formatFullDate(activity.start_time) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-icon"><AppIcon name="map-pin" :size="14" /></span>
                    <span class="info-text">{{ activity.location }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-icon"><AppIcon name="users" :size="14" /></span>
                    <span class="info-text">{{ activity.current_participants }}人已报名{{ activity.max_participants ? ' / 限' + activity.max_participants + '人' : '' }}</span>
                  </div>
                </div>
                
                <div class="recent-activity-footer">
                  <div class="recent-activity-participants">
                    <span class="participant-icon"><AppIcon name="user" :size="14" /></span>
                    <span class="participant-text">{{ activity.user?.nickname || '邻居' }}</span>
                  </div>
                  <div 
                    class="recent-activity-join-btn"
                    :class="{ 
                      joined: activity.is_participant,
                      full: activity.max_participants && activity.current_participants >= activity.max_participants,
                      ended: activity.status === 'completed' || activity.status === 'cancelled'
                    }"
                  >
                    {{ getButtonText(activity) }}
                  </div>
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

/* 筛选标签 */
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

/* 内容区域 */
.content {
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.empty-emoji {
  font-size: 72px;
  margin-bottom: var(--spacing-lg);
  animation: float 3s ease-in-out infinite;
}

.empty-text {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.empty-btn {
  padding: 14px 28px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-smooth);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.35);
  position: relative;
  overflow: hidden;
}

.empty-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left var(--transition-slow);
}

.empty-btn:hover::before {
  left: 100%;
}

.empty-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.45);
}

.empty-btn:active {
  transform: translateY(0) scale(0.95);
}

/* 活动列表 */
.activity-list {
  padding: 0;
}

.section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  background: var(--color-bg-tertiary);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

/* 热门活动横向滚动 */
.hot-activity-scroll {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

.hot-activity-scroll::-webkit-scrollbar {
  display: none;
}

.hot-activity-card {
  display: inline-block;
  width: 170px;
  margin-right: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-smooth);
  scroll-snap-align: start;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.02);
  position: relative;
}

.hot-activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.hot-activity-card:hover::before {
  opacity: 1;
}

.hot-activity-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px) scale(1.02);
}

.hot-activity-card:active {
  transform: scale(0.97);
}

.hot-activity-cover {
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hot-activity-emoji {
  font-size: 44px;
}

.hot-activity-info {
  padding: var(--spacing-md);
}

.hot-activity-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-activity-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.hot-activity-join {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 近期活动纵向列表 */
.recent-activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
}

.recent-activity-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-smooth);
  border: 1px solid rgba(0, 0, 0, 0.02);
  position: relative;
}

.recent-activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.recent-activity-card:hover::before {
  opacity: 1;
}

.recent-activity-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-3px);
}

.recent-activity-card:active {
  transform: scale(0.98);
}

.recent-activity-cover {
  position: relative;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-activity-icon {
  font-size: 56px;
}

.recent-activity-badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: 5px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  backdrop-filter: blur(10px);
}

.recent-activity-badge.status-upcoming {
  background: rgba(255, 107, 53, 0.95);
  color: var(--color-text-white);
}

.recent-activity-badge.status-ongoing {
  background: rgba(16, 185, 129, 0.95);
  color: var(--color-text-white);
}

.recent-activity-badge.status-completed,
.recent-activity-badge.status-cancelled {
  background: rgba(139, 139, 165, 0.95);
  color: var(--color-text-white);
}

.recent-activity-content {
  padding: var(--spacing-lg);
}

.recent-activity-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.recent-activity-name {
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.recent-activity-category {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.recent-activity-category.cat-sports {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.recent-activity-category.cat-culture {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

.recent-activity-category.cat-charity {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.recent-activity-category.cat-party {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.recent-activity-category.cat-other {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.recent-activity-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.info-icon {
  font-size: 15px;
  flex-shrink: 0;
  opacity: 0.8;
}

.info-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.recent-activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.recent-activity-participants {
  display: flex;
  align-items: center;
  gap: 6px;
}

.participant-icon {
  font-size: 15px;
  opacity: 0.8;
}

.participant-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.recent-activity-join-btn {
  padding: 8px 18px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  transition: all var(--transition-smooth);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25);
  border: none;
  cursor: pointer;
}

.recent-activity-join-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.35);
}

.recent-activity-join-btn:active {
  transform: scale(0.95);
}

.recent-activity-join-btn.joined {
  background: var(--color-success-soft);
  color: var(--color-success);
  box-shadow: none;
}

.recent-activity-join-btn.full {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  box-shadow: none;
}

.recent-activity-join-btn.ended {
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
   响应式设计 - 平板及以上设备
   ======================================== */
@media (min-width: 768px) {
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
  
  .hot-activity-card {
    width: 200px;
  }
  
  .hot-activity-cover {
    height: 110px;
  }
  
  .hot-activity-emoji {
    font-size: 52px;
  }
  
  .recent-activity-cover {
    height: 150px;
  }
  
  .recent-activity-icon {
    font-size: 64px;
  }
  
  .recent-activity-name {
    font-size: var(--font-size-xl);
  }
}

/* ========================================
   响应式设计 - 电脑及以上设备
   ======================================== */
@media (min-width: 1024px) {
  .content {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .filter-tabs {
    max-width: 900px;
    margin: 0 auto;
    left: 0;
    right: 0;
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }
  
  /* 热门活动 - 网格布局 */
  .hot-activity-scroll {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
    overflow-x: visible;
    padding: 0;
  }
  
  .hot-activity-card {
    width: 100%;
    margin-right: 0;
  }
  
  /* 近期活动 - 保持单列布局 */
  .recent-activity-list {
    display: flex;
    flex-direction: column;
  }
  
  .recent-activity-card {
    width: 100%;
  }
}

@media (min-width: 1440px) {
  .content {
    max-width: 1000px;
  }
  
  .filter-tabs {
    max-width: 1000px;
  }
  
  .hot-activity-scroll {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
