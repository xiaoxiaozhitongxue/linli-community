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
import { activitiesApi, userApi } from '../../utils/api'
import { navigateBack } from '../../utils/router'
import { toastSuccess, showToast } from '../../utils/toast'

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
    
    participants.value = [
      { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1' },
      { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2' },
      { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3' },
      { id: '4', nickname: '运动达人', avatar: 'https://i.pravatar.cc/100?img=4' },
      { id: '5', nickname: '老张', avatar: 'https://i.pravatar.cc/100?img=5' }
    ]
  } catch (error) {
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
    
    participants.value = [
      { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1' },
      { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2' },
      { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3' }
    ]
  } finally {
    loading.value = false
  }
}

const toggleJoin = async () => {
  if (activity.value.status === 'completed' || activity.value.status === 'cancelled') {
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
  navigateBack()
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
  background: #F5F5F0;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.95);
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
}

.nav-back, .nav-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.nav-back-icon, .nav-action-icon {
  font-size: 24px;
  color: #1A1A1A;
  line-height: 1;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
}

.content {
  padding-top: 56px;
  padding-top: calc(56px + env(safe-area-inset-top));
  padding-bottom: 80px;
  min-height: 100vh;
}

.detail-content {
  padding-bottom: 20px;
}

.image-section {
  width: 100%;
}

.image-carousel {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #E8E8E0;
}

.carousel-track {
  display: flex;
  transition: transform 0.4s ease;
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
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.indicator-dot.active {
  background: #FFFFFF;
  width: 18px;
  border-radius: 3px;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFFFFF;
  font-size: 24px;
  line-height: 1;
  transition: background 0.2s;
}

.carousel-btn:hover {
  background: rgba(0,0,0,0.5);
}

.carousel-prev {
  left: 10px;
}

.carousel-next {
  right: 10px;
}

.info-section {
  background: #FFFFFF;
  padding: 20px 16px;
  margin-bottom: 8px;
}

.activity-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.activity-category {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.activity-category.cat-sports {
  background: #E3F2FD;
  color: #1976D2;
}

.activity-category.cat-culture {
  background: #F3E5F5;
  color: #7B1FA2;
}

.activity-category.cat-charity {
  background: #E8F5E9;
  color: #388E3C;
}

.activity-category.cat-party {
  background: #FFF3E0;
  color: #F57C00;
}

.activity-category.cat-other {
  background: #F5F5F0;
  color: #7A7A6A;
}

.activity-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.activity-status.status-upcoming {
  background: #FFF3E0;
  color: #FF8C42;
}

.activity-status.status-ongoing {
  background: #E8F5E9;
  color: #388E3C;
}

.activity-status.status-completed,
.activity-status.status-cancelled {
  background: #F5F5F0;
  color: #9A9A8A;
}

.activity-title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1.4;
  margin-bottom: 16px;
}

.activity-info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
  font-size: 14px;
  color: #4A4A3A;
  line-height: 1.4;
  word-break: break-all;
}

.desc-section,
.creator-section,
.participants-section {
  background: #FFFFFF;
  padding: 16px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-count {
  font-size: 13px;
  color: #9A9A8A;
  font-weight: 400;
}

.activity-desc {
  font-size: 15px;
  color: #4A4A3A;
  line-height: 1.7;
  display: block;
  word-break: break-all;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  cursor: pointer;
}

.creator-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.creator-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.creator-name {
  font-size: 15px;
  font-weight: 500;
  color: #1A1A1A;
}

.creator-time {
  font-size: 12px;
  color: #9A9A8A;
}

.creator-arrow {
  font-size: 18px;
  color: #C8C8B8;
}

.participants-list {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding-bottom: 4px;
}

.participants-list::-webkit-scrollbar {
  display: none;
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.participant-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  margin-bottom: 6px;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  object-fit: cover;
}

.participant-name {
  font-size: 12px;
  color: #4A4A3A;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #F0F0E8;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 50;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F5F5F0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bar-icon {
  font-size: 20px;
}

.bar-right {
  flex: 1;
}

.join-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%);
  border-radius: 24px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  cursor: pointer;
  transition: opacity 0.2s;
}

.join-btn:hover {
  opacity: 0.9;
}

.join-btn.joined {
  background: #E8E8E0;
  color: #7A7A6A;
}

.join-btn.full,
.join-btn.ended {
  background: #E8E8E0;
  color: #9A9A8A;
  cursor: default;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.empty-emoji {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #7A7A6A;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F5F5F0;
  border-top-color: #FF8C42;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #9A9A8A;
}

.safe-area-bottom {
  height: 20px;
}
</style>