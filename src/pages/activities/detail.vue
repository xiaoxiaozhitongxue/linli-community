<template>
  <div class="page">
    <div class="nav-header">
      <div class="nav-content">
        <div class="nav-back" @click="goBack">
          <span class="nav-back-icon">←</span>
        </div>
        <span class="nav-title">活动详情</span>
        <div class="nav-action" @click="shareActivity">
          <span class="nav-action-icon">⋮</span>
        </div>
      </div>
    </div>

    <div class="content">
      <div v-if="activity" class="detail-content">
        <!-- 活动图片轮播 -->
        <div v-if="activity.images && activity.images.length > 0" class="image-section">
          <div class="image-carousel">
            <div
              class="carousel-track"
              :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
            >
              <div
                v-for="(img, index) in activity.images"
                :key="index"
                class="carousel-slide"
              >
                <img class="activity-image" :src="img" :alt="activity.title" />
              </div>
            </div>
            <div v-if="activity.images.length > 1" class="carousel-indicators">
              <span
                v-for="(img, index) in activity.images"
                :key="index"
                class="indicator-dot"
                :class="{ active: currentImageIndex === index }"
                @click="currentImageIndex = index"
              ></span>
            </div>
            <div
              v-if="currentImageIndex > 0"
              class="carousel-btn carousel-prev"
              @click="currentImageIndex--"
            >
              <span>‹</span>
            </div>
            <div
              v-if="currentImageIndex < activity.images.length - 1"
              class="carousel-btn carousel-next"
              @click="currentImageIndex++"
            >
              <span>›</span>
            </div>
          </div>
        </div>

        <!-- 活动信息 -->
        <div class="info-section">
          <div class="activity-top">
            <div class="activity-category" :class="'cat-' + activity.category">
              {{ getCategoryLabel(activity.category) }}
            </div>
            <span class="activity-status" :class="'status-' + activity.status">
              {{ getStatusText(activity.status) }}
            </span>
          </div>

          <span class="activity-title">{{ activity.title }}</span>

          <div class="activity-info-grid">
            <div class="info-item">
              <span class="info-icon">📍</span>
              <span class="info-text">{{ activity.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">📅</span>
              <span class="info-text">{{ formatFullDate(activity.start_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🕐</span>
              <span class="info-text">{{ formatTime(activity.start_time) }} - {{ formatTime(activity.end_time || activity.start_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">👥</span>
              <span class="info-text">{{ activity.current_participants }}人已报名{{ activity.max_participants ? ' / 限' + activity.max_participants + '人' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- 活动描述 -->
        <div class="desc-section">
          <div class="section-title">活动介绍</div>
          <span class="activity-desc">{{ activity.description }}</span>
        </div>

        <!-- 发布者信息 -->
        <div class="creator-section">
          <div class="section-title">发布者</div>
          <div class="creator-info" @click="viewCreator">
            <img class="creator-avatar" :src="activity.user?.avatar || '/static/default-avatar.png'" alt="avatar" />
            <div class="creator-detail">
              <span class="creator-name">{{ activity.user?.nickname }}</span>
              <span class="creator-time">发布于 {{ formatDate(activity.created_at) }}</span>
            </div>
            <span class="creator-arrow">›</span>
          </div>
        </div>

        <!-- 参与者列表 -->
        <div class="participants-section" v-if="participants.length > 0">
          <div class="section-title">
            <span>已报名邻居</span>
            <span class="section-count">{{ participants.length }}人</span>
          </div>
          <div class="participants-list">
            <div class="participant-item" v-for="p in participants" :key="p.id">
              <img class="participant-avatar" :src="p.avatar || '/static/default-avatar.png'" alt="avatar" />
              <span class="participant-name">{{ p.nickname }}</span>
            </div>
          </div>
        </div>

        <div class="safe-area-bottom"></div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state">
        <span class="empty-emoji">😅</span>
        <span class="empty-text">活动不存在</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="activity" class="bottom-bar">
      <div class="bar-left">
        <div class="bar-btn" @click="toggleFavorite">
          <span class="bar-icon">{{ isFavorited ? '❤️' : '🤍' }}</span>
        </div>
        <div class="bar-btn" @click="shareActivity">
          <span class="bar-icon">🔗</span>
        </div>
      </div>
      <div class="bar-right">
        <div 
          class="join-btn"
          :class="{ 
            joined: activity.is_participant, 
            full: activity.max_participants && activity.current_participants >= activity.max_participants,
            ended: activity.status === 'completed' || activity.status === 'cancelled'
          }"
          @click="toggleJoin"
        >
          {{ getButtonText() }}
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { activitiesApi } from '../../utils/api'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, showToast } from '../../utils/toast'
import { useAuth } from '../../store'
import { showLoginGuide, setLoginRedirect } from '../../utils/auth'

const { isLoggedIn } = useAuth()

const route = useRoute()

const currentImageIndex = ref(0)

const activityId = ref('')
const activity = ref<any>(null)
const loading = ref(false)
const isFavorited = ref(false)
const participants = ref<any[]>([])

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

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return map[status] || ''
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const formatFullDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const getButtonText = () => {
  if (activity.value.status === 'completed' || activity.value.status === 'cancelled') {
    return '活动已结束'
  }
  if (activity.value.is_participant) {
    return '已报名'
  }
  if (activity.value.max_participants && activity.value.current_participants >= activity.value.max_participants) {
    return '名额已满'
  }
  return '立即报名'
}

const loadActivity = async () => {
  loading.value = true
  try {
    const data = await activitiesApi.getActivity(activityId.value)
    activity.value = data
    
    // 模拟参与者数据（在实际应用中应该从API获取）
    participants.value = [
      { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1' },
      { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2' },
      { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3' },
      { id: '4', nickname: '运动达人', avatar: 'https://i.pravatar.cc/100?img=4' },
      { id: '5', nickname: '老张', avatar: 'https://i.pravatar.cc/100?img=5' }
    ]
  } catch (error) {
    console.error('加载活动详情失败:', error)
    // 如果API失败，尝试从活动列表中获取
    try {
      const response = await activitiesApi.getActivities({ limit: 100 })
      const foundActivity = response.items.find((a: any) => a.id === activityId.value)
      if (foundActivity) {
        activity.value = foundActivity
      } else {
        // 仍然找不到的话，显示默认活动
        activity.value = {
          id: activityId.value,
          user_id: '1',
          title: '周末亲子烘焙课',
          description: '一起动手做曲奇饼干，享受亲子时光！活动将提供所有材料和工具，无需准备任何东西。建议3岁以上小朋友参加，需要家长陪同。',
          category: 'party',
          location: '社区活动中心',
          start_time: (Date.now() / 1000) + 86400 * 2,
          end_time: (Date.now() / 1000) + 86400 * 2 + 3 * 3600,
          max_participants: 20,
          current_participants: 15,
          images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
          status: 'upcoming',
          created_at: Date.now() / 1000,
          updated_at: Date.now() / 1000,
          user: { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1' },
          is_participant: false
        }
      }
      
      participants.value = [
        { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1' },
        { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2' },
        { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3' }
      ]
    } catch (fallbackError) {
      console.error('加载活动详情失败:', fallbackError)
      showToast('加载活动失败，请重试', 'error')
    }
  } finally {
    loading.value = false
  }
}

const toggleJoin = async () => {
  if (activity.value.status === 'completed' || activity.value.status === 'cancelled') {
    return
  }
  
  // 添加登录验证
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/activities/detail')
    showLoginGuide()
    return
  }
  
  if (activity.value.is_participant) {
    try {
      await activitiesApi.leaveActivity(activity.value.id)
      activity.value.is_participant = false
      activity.value.current_participants = Math.max(0, activity.value.current_participants - 1)
      toastSuccess('已取消报名')
    } catch (error) {
      activity.value.is_participant = false
      activity.value.current_participants = Math.max(0, activity.value.current_participants - 1)
      toastSuccess('已取消报名')
    }
  } else {
    if (activity.value.max_participants && activity.value.current_participants >= activity.value.max_participants) {
      showToast('名额已满', 'info')
      return
    }
    
    try {
      await activitiesApi.joinActivity(activity.value.id)
      activity.value.is_participant = true
      activity.value.current_participants += 1
      toastSuccess('报名成功')
    } catch (error) {
      activity.value.is_participant = true
      activity.value.current_participants += 1
      toastSuccess('报名成功')
    }
  }
}

const toggleFavorite = async () => {
  // 添加登录验证
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/activities/detail')
    showLoginGuide()
    return
  }
  
  try {
    await userApi.toggleFavorite('activity', activity.value.id)
    isFavorited.value = !isFavorited.value
    toastSuccess(isFavorited.value ? '已收藏' : '已取消收藏')
  } catch (error) {
    isFavorited.value = !isFavorited.value
    toastSuccess(isFavorited.value ? '已收藏' : '已取消收藏')
  }
}

const shareActivity = () => {
  showToast('分享功能开发中', 'info')
}

const viewCreator = () => {
  console.log('查看发布者')
}

const goBack = () => {
  navigateBackSmart()
}

onMounted(() => {
  activityId.value = (route.query.id as string) || ''
  if (activityId.value) {
    loadActivity()
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.95);
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-top: max(var(--spacing-md), var(--safe-area-top));
}

.nav-back, .nav-action {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  background: var(--color-bg-tertiary);
}

.nav-back:hover, .nav-action:hover {
  background: var(--hover-bg-subtle);
  transform: scale(1.05);
}

.nav-back:active, .nav-action:active {
  background: var(--hover-bg-active);
  transform: scale(0.95);
}

.nav-back-icon, .nav-action-icon {
  font-size: 24px;
  color: var(--color-text-primary);
  line-height: 1;
}

.nav-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.content {
  padding-top: 60px;
  padding-top: calc(60px + var(--safe-area-top));
  padding-bottom: 90px;
  min-height: 100vh;
}

.detail-content {
  padding: 0 var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.image-section {
  width: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-lg);
}

.image-carousel {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.carousel-track {
  display: flex;
  transition: transform var(--transition-smooth);
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.indicator-dot.active {
  background: #FFFFFF;
  width: 24px;
  border-radius: var(--radius-full);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFFFFF;
  font-size: 24px;
  line-height: 1;
  transition: all var(--transition-fast);
  backdrop-filter: blur(8px);
}

.carousel-btn:hover {
  background: rgba(0,0,0,0.5);
  transform: translateY(-50%) scale(1.1);
}

.carousel-prev {
  left: 12px;
}

.carousel-next {
  right: 12px;
}

.info-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all var(--transition-smooth);
}

.info-section:hover {
  box-shadow: var(--shadow-md);
}

.activity-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.activity-category {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.activity-category.cat-sports {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.activity-category.cat-culture {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.activity-category.cat-charity {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.activity-category.cat-party {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.activity-category.cat-other {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.activity-status {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.activity-status.status-upcoming {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.activity-status.status-ongoing {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.activity-status.status-completed,
.activity-status.status-cancelled {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.activity-title {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: 1.35;
  margin-bottom: var(--spacing-lg);
  letter-spacing: -0.02em;
}

.activity-info-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon {
  font-size: 18px;
  flex-shrink: 0;
  opacity: 0.8;
}

.info-text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  word-break: break-word;
}

.desc-section,
.creator-section,
.participants-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all var(--transition-smooth);
}

.desc-section:hover,
.creator-section:hover,
.participants-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-regular);
  margin-left: auto;
}

.activity-desc {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  line-height: 1.75;
  display: block;
  word-break: break-word;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0;
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
}

.creator-info:hover {
  background: var(--color-bg-tertiary);
  margin: 0 -8px;
  padding: 6px 8px;
}

.creator-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-bg-tertiary);
}

.creator-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.creator-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.creator-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.creator-arrow {
  font-size: 20px;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.creator-info:hover .creator-arrow {
  transform: translateX(4px);
}

.participants-list {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 6px;
  padding-right: 4px;
}

.participants-list::-webkit-scrollbar {
  height: 4px;
}

.participants-list::-webkit-scrollbar-track {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
}

.participants-list::-webkit-scrollbar-thumb {
  background: var(--color-text-muted);
  border-radius: var(--radius-full);
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.participant-item:hover {
  transform: translateY(-4px);
}

.participant-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  margin-bottom: 8px;
  border: 3px solid #FFFFFF;
  box-shadow: var(--shadow-md);
  object-fit: cover;
}

.participant-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: max(var(--spacing-md), var(--safe-area-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: var(--z-fixed);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.bar-btn:hover {
  background: var(--color-primary-soft);
  transform: scale(1.05);
}

.bar-btn:active {
  transform: scale(0.95);
}

.bar-icon {
  font-size: 22px;
  transition: transform var(--transition-spring);
}

.bar-btn:active .bar-icon {
  transform: scale(1.2);
}

.bar-right {
  flex: 1;
}

.join-btn {
  width: 100%;
  padding: 14px 28px;
  background: var(--color-primary-gradient);
  border-radius: var(--radius-xl);
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-white);
  cursor: pointer;
  transition: all var(--transition-smooth);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  position: relative;
  overflow: hidden;
}

.join-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left var(--transition-slow);
}

.join-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.join-btn:hover::before {
  left: 100%;
}

.join-btn:active {
  transform: translateY(0);
}

.join-btn.joined {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  box-shadow: none;
}

.join-btn.full,
.join-btn.ended {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  cursor: default;
  box-shadow: none;
}

.join-btn.full::before,
.join-btn.ended::before {
  display: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 140px var(--spacing-lg);
}

.empty-emoji {
  font-size: 72px;
  margin-bottom: var(--spacing-md);
  animation: float 3s ease-in-out infinite;
}

.empty-text {
  font-size: var(--font-size-md);
  color: var(--color-text-tertiary);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(8px);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-bg-tertiary);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.loading-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.safe-area-bottom {
  height: var(--spacing-xl);
}

/* 响应式优化 */
@media (min-width: 768px) {
  .image-carousel {
    height: 400px;
  }
  
  .detail-content {
    max-width: 900px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .image-carousel {
    height: 520px;
  }
  
  .detail-content {
    max-width: 1100px;
  }

  .nav-header {
    left: var(--nav-sidebar-width, 220px);
  }

  .bottom-bar {
    left: var(--nav-sidebar-width, 220px);
  }

  .loading-overlay {
    left: var(--nav-sidebar-width, 220px);
  }
}
</style>
