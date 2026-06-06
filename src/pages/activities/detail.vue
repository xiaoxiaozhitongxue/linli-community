<template>
  <view class="page">
    <view class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">活动详情</text>
        <view class="nav-action" @click="shareActivity">
          <text class="nav-action-icon">⋮</text>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y :style="{ paddingTop: (statusBarHeight + 56) + 'px' }">
      <view v-if="activity" class="detail-content">
        <!-- 活动图片 -->
        <view v-if="activity.images && activity.images.length > 0" class="image-section">
          <swiper class="image-swiper" :indicator-dots="true" :autoplay="false" :interval="3000" :duration="500">
            <swiper-item v-for="(img, index) in activity.images" :key="index">
              <image class="activity-image" :src="img" mode="aspectFill" @click="previewImage(index)" />
            </swiper-item>
          </swiper>
        </view>

        <!-- 活动信息 -->
        <view class="info-section">
          <view class="activity-top">
            <view class="activity-category" :class="'cat-' + activity.category">
              {{ getCategoryLabel(activity.category) }}
            </view>
            <text class="activity-status" :class="'status-' + activity.status">
              {{ getStatusText(activity.status) }}
            </text>
          </view>

          <text class="activity-title">{{ activity.title }}</text>

          <view class="activity-info-grid">
            <view class="info-item">
              <text class="info-icon">📍</text>
              <text class="info-text">{{ activity.location }}</text>
            </view>
            <view class="info-item">
              <text class="info-icon">📅</text>
              <text class="info-text">{{ formatFullDate(activity.start_time) }}</text>
            </view>
            <view class="info-item">
              <text class="info-icon">🕐</text>
              <text class="info-text">{{ formatTime(activity.start_time) }} - {{ formatTime(activity.end_time || activity.start_time) }}</text>
            </view>
            <view class="info-item">
              <text class="info-icon">👥</text>
              <text class="info-text">{{ activity.current_participants }}人已报名{{ activity.max_participants ? ' / 限' + activity.max_participants + '人' : '' }}</text>
            </view>
          </view>
        </view>

        <!-- 活动描述 -->
        <view class="desc-section">
          <view class="section-title">活动介绍</view>
          <text class="activity-desc">{{ activity.description }}</text>
        </view>

        <!-- 发布者信息 -->
        <view class="creator-section">
          <view class="section-title">发布者</view>
          <view class="creator-info" @click="viewCreator">
            <image class="creator-avatar" :src="activity.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
            <view class="creator-detail">
              <text class="creator-name">{{ activity.user?.nickname }}</text>
              <text class="creator-time">发布于 {{ formatDate(activity.created_at) }}</text>
            </view>
            <text class="creator-arrow">›</text>
          </view>
        </view>

        <!-- 参与者列表 -->
        <view class="participants-section" v-if="participants.length > 0">
          <view class="section-title">
            <text>已报名邻居</text>
            <text class="section-count">{{ participants.length }}人</text>
          </view>
          <scroll-view class="participants-scroll" scroll-x show-scrollbar="false">
            <view class="participant-item" v-for="p in participants" :key="p.id">
              <image class="participant-avatar" :src="p.avatar || '/static/default-avatar.png'" mode="aspectFill" />
              <text class="participant-name">{{ p.nickname }}</text>
            </view>
          </scroll-view>
        </view>

        <view class="safe-area-bottom"></view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state">
        <text class="empty-emoji">😅</text>
        <text class="empty-text">活动不存在</text>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view v-if="activity" class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="bar-left">
        <view class="bar-btn" @click="toggleFavorite">
          <text class="bar-icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
        </view>
        <view class="bar-btn" @click="shareActivity">
          <text class="bar-icon">🔗</text>
        </view>
      </view>
      <view class="bar-right">
        <view 
          class="join-btn"
          :class="{ 
            joined: activity.is_participant, 
            full: activity.max_participants && activity.current_participants >= activity.max_participants,
            ended: activity.status === 'completed' || activity.status === 'cancelled'
          }"
          @click="toggleJoin"
        >
          {{ getButtonText() }}
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { activitiesApi, userApi } from '../../utils/api'

const statusBarHeight = ref(20)
const safeAreaBottom = ref(0)

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
    
    // 模拟参与者数据
    participants.value = [
      { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1' },
      { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2' },
      { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3' },
      { id: '4', nickname: '运动达人', avatar: 'https://i.pravatar.cc/100?img=4' },
      { id: '5', nickname: '老张', avatar: 'https://i.pravatar.cc/100?img=5' }
    ]
  } catch (error) {
    // 模拟数据
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

const previewImage = (index: number) => {
  if (activity.value.images) {
    uni.previewImage({
      urls: activity.value.images,
      current: index
    })
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
      uni.showToast({ title: '已取消报名', icon: 'success' })
    } catch (error) {
      activity.value.is_participant = false
      activity.value.current_participants = Math.max(0, activity.value.current_participants - 1)
      uni.showToast({ title: '已取消报名', icon: 'success' })
    }
  } else {
    if (activity.value.max_participants && activity.value.current_participants >= activity.value.max_participants) {
      uni.showToast({ title: '名额已满', icon: 'none' })
      return
    }
    
    try {
      await activitiesApi.joinActivity(activity.value.id)
      activity.value.is_participant = true
      activity.value.current_participants += 1
      uni.showToast({ title: '报名成功', icon: 'success' })
    } catch (error) {
      activity.value.is_participant = true
      activity.value.current_participants += 1
      uni.showToast({ title: '报名成功', icon: 'success' })
    }
  }
}

const toggleFavorite = async () => {
  try {
    await userApi.toggleFavorite('activity', activity.value.id)
    isFavorited.value = !isFavorited.value
    uni.showToast({ 
      title: isFavorited.value ? '已收藏' : '已取消收藏', 
      icon: 'success' 
    })
  } catch (error) {
    isFavorited.value = !isFavorited.value
    uni.showToast({ 
      title: isFavorited.value ? '已收藏' : '已取消收藏', 
      icon: 'success' 
    })
  }
}

const shareActivity = () => {
  uni.showShareMenu()
}

const viewCreator = () => {
  console.log('查看发布者')
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  activityId.value = options.id || ''
  
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
}

.nav-back, .nav-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  height: 100vh;
  padding-bottom: 80px;
}

.detail-content {
  padding-bottom: 20px;
}

.image-section {
  width: 100%;
}

.image-swiper {
  width: 100%;
  height: 280px;
}

.activity-image {
  width: 100%;
  height: 100%;
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
}

.info-text {
  flex: 1;
  font-size: 14px;
  color: #4A4A3A;
  line-height: 1.4;
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
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.creator-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
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

.participants-scroll {
  white-space: nowrap;
}

.participant-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}

.participant-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  margin-bottom: 6px;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
}

.join-btn.joined {
  background: #E8E8E0;
  color: #7A7A6A;
}

.join-btn.full,
.join-btn.ended {
  background: #E8E8E0;
  color: #9A9A8A;
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
