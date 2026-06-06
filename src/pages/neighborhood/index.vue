<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">邻里空间</text>
        <view class="nav-actions">
          <view class="nav-btn" @click="goToCreateActivity">
            <text class="nav-icon">✏️</text>
            <text class="nav-btn-text">发活动</text>
          </view>
        </view>
      </view>
      
      <!-- 标签切换 -->
      <view class="tab-bar">
        <view 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-item" 
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
          <view v-if="currentTab === tab.key" class="tab-indicator"></view>
        </view>
      </view>
    </view>

    <scroll-view 
      class="content" 
      scroll-y 
      :style="{ paddingTop: (statusBarHeight + 130) + 'px' }"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 社区客厅 -->
      <view v-if="currentTab === 'lounge'" class="lounge-container">
        <!-- 欢迎卡片 -->
        <view class="welcome-card">
          <view class="welcome-header">
            <text class="welcome-emoji">🏠</text>
            <text class="welcome-title">欢迎来到社区</text>
          </view>
          <text class="welcome-desc">和邻居聊聊天，认识新朋友</text>
        </view>

        <!-- 在线邻居 -->
        <view class="section-container" v-if="onlineUsers.length > 0">
          <view class="section-header">
            <text class="section-title">在线邻居</text>
            <text class="section-count">{{ onlineUsers.length }}人</text>
          </view>
          <scroll-view class="neighbors-scroll" scroll-x show-scrollbar="false">
            <view class="neighbor-item" v-for="user in onlineUsers" :key="user.id" @click="viewUserProfile(user)">
              <view class="neighbor-avatar-wrapper">
                <image class="neighbor-avatar" :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
                <view class="online-indicator"></view>
              </view>
              <text class="neighbor-name">{{ user.nickname }}</text>
            </view>
          </scroll-view>
        </view>

        <!-- 热门话题 -->
        <view class="section-container">
          <view class="section-header">
            <text class="section-title">热门话题</text>
          </view>
          <view class="topic-list">
            <view 
              class="topic-card" 
              v-for="topic in hotTopics" 
              :key="topic.id"
              @click="enterTopic(topic)"
            >
              <view class="topic-left">
                <text class="topic-emoji">{{ topic.emoji }}</text>
                <view class="topic-info">
                  <text class="topic-name">#{{ topic.name }}</text>
                  <text class="topic-meta">{{ topic.posts }}条讨论 · {{ topic.participants }}人参与</text>
                </view>
              </view>
              <text class="topic-arrow">›</text>
            </view>
          </view>
        </view>

        <!-- 聊天室 -->
        <view class="section-container">
          <view class="section-header">
            <text class="section-title">聊天室</text>
          </view>
          <view class="chat-list">
            <view 
              class="chat-card" 
              v-for="room in chatRooms" 
              :key="room.id"
              @click="enterChatRoom(room)"
            >
              <view class="chat-cover" :style="{ background: room.bg_color }">
                <text class="chat-emoji">{{ room.emoji }}</text>
              </view>
              <view class="chat-content">
                <text class="chat-name">{{ room.name }}</text>
                <text class="chat-desc">{{ room.description }}</text>
                <view class="chat-stats">
                  <text class="chat-stat">👥 {{ room.members }}</text>
                  <text class="chat-stat">💬 {{ room.today_messages }}条</text>
                </view>
              </view>
              <text class="chat-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 活动中心 -->
      <view v-if="currentTab === 'activities'" class="activities-container">
        <!-- 筛选标签 -->
        <scroll-view class="filter-scroll" scroll-x show-scrollbar="false">
          <view class="filter-list">
            <view 
              v-for="filter in activityFilters"
              :key="filter.key"
              class="filter-chip"
              :class="{ active: currentActivityFilter === filter.key }"
              @click="selectActivityFilter(filter.key)"
            >
              {{ filter.label }}
            </view>
          </view>
        </scroll-view>

        <!-- 活动列表 -->
        <view v-if="activities.length > 0" class="activity-list">
          <view 
            v-for="activity in activities" 
            :key="activity.id"
            class="activity-card"
            @click="goToActivityDetail(activity)"
          >
            <!-- 活动封面/图片 -->
            <view class="activity-image-section" v-if="activity.images && activity.images.length > 0">
              <image class="activity-image" :src="activity.images[0]" mode="aspectFill"></image>
            </view>
            
            <!-- 活动内容 -->
            <view class="activity-content">
              <view class="activity-top">
                <view class="activity-time-badge">
                  <text class="activity-month">{{ formatDate(activity.start_time, 'MM') }}月</text>
                  <text class="activity-day">{{ formatDate(activity.start_time, 'dd') }}</text>
                </view>
                <view class="activity-header">
                  <text class="activity-title">{{ activity.title }}</text>
                  <view class="activity-meta-row">
                    <text class="activity-meta">📍 {{ activity.location }}</text>
                    <text class="activity-meta">🕐 {{ formatDate(activity.start_time, 'HH:mm') }}</text>
                  </view>
                </view>
              </view>

              <view class="activity-body">
                <text class="activity-desc">{{ activity.description }}</text>
              </view>

              <view class="activity-footer">
                <view class="activity-creator">
                  <image class="creator-avatar" :src="activity.user?.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
                  <text class="creator-name">{{ activity.user?.nickname }}</text>
                </view>
                
                <view class="activity-right">
                  <view class="participants-bar">
                    <text class="participants-count">
                      {{ activity.current_participants }}{{ activity.max_participants ? '/' + activity.max_participants : '' }}人
                    </text>
                  </view>
                  
                  <view 
                    class="join-btn"
                    :class="{ joined: activity.is_participant, full: activity.max_participants && activity.current_participants >= activity.max_participants }"
                    @click.stop="toggleActivityJoin(activity)"
                  >
                    {{ activity.is_participant ? '已报名' : (activity.max_participants && activity.current_participants >= activity.max_participants ? '已满' : '报名') }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="!loading" class="empty-state">
          <text class="empty-emoji">🎉</text>
          <text class="empty-text">暂无活动</text>
          <text class="empty-hint">发起一个活动吧</text>
        </view>

        <!-- 加载更多 -->
        <view v-if="loading && !isRefreshing" class="loading-more">
          <text>加载中...</text>
        </view>
      </view>

      <!-- 兴趣小组 -->
      <view v-if="currentTab === 'groups'" class="groups-container">
        <view class="groups-grid">
          <view 
            v-for="group in interestGroups" 
            :key="group.id"
            class="group-card"
            @click="toggleGroupJoin(group)"
          >
            <view class="group-cover" :style="{ background: group.bg_color }">
              <text class="group-emoji">{{ group.emoji }}</text>
            </view>
            <view class="group-info">
              <text class="group-name">{{ group.name }}</text>
              <text class="group-members">{{ group.members }}位邻居</text>
            </view>
            <view class="group-action">
              <text v-if="group.is_joined" class="action-joined">已加入</text>
              <text v-else class="action-join">+ 加入</text>
            </view>
          </view>
        </view>

        <!-- 邻里活跃榜 -->
        <view class="section-container leaderboard-section">
          <view class="section-header">
            <text class="section-title">🏆 邻里活跃榜</text>
          </view>
          <view class="leaderboard-list">
            <view 
              v-for="(user, index) in leaderboard" 
              :key="user.id"
              class="leader-item"
            >
              <view class="leader-rank" :class="'rank-' + (index + 1)">
                <text v-if="index < 3">{{ ['🥇', '🥈', '🥉'][index] }}</text>
                <text v-else>{{ index + 1 }}</text>
              </view>
              <image class="leader-avatar" :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
              <view class="leader-info">
                <text class="leader-name">{{ user.nickname }}</text>
                <text class="leader-score">活跃度 {{ user.score }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { activitiesApi, neighborhoodApi, userApi, type Activity, type User } from '../../utils/api'

const statusBarHeight = ref(20)
const currentTab = ref('lounge')
const loading = ref(false)
const isRefreshing = ref(false)

// 标签页配置
const tabs = [
  { key: 'lounge', label: '社区客厅' },
  { key: 'activities', label: '活动中心' },
  { key: 'groups', label: '兴趣小组' }
]

// 社区客厅数据
const onlineUsers = ref<User[]>([])
const hotTopics = ref<any[]>([])
const chatRooms = ref<any[]>([])

// 活动中心数据
const activities = ref<Activity[]>([])
const currentActivityFilter = ref('all')
const activityFilters = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'sports', label: '运动' },
  { key: 'culture', label: '文化' },
  { key: 'party', label: '聚会' }
]

// 兴趣小组数据
const interestGroups = ref<any[]>([])
const leaderboard = ref<User[]>([])

// 格式化日期
const formatDate = (timestamp: number, format: string): string => {
  const date = new Date(timestamp * 1000)
  if (format === 'MM') {
    return String(date.getMonth() + 1)
  }
  if (format === 'dd') {
    return String(date.getDate()).padStart(2, '0')
  }
  if (format === 'HH:mm') {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
  return ''
}

// 加载社区客厅数据
const loadLoungeData = async () => {
  try {
    const [topics, rooms, groups] = await Promise.all([
      neighborhoodApi.getTopics(),
      neighborhoodApi.getChatRooms(),
      neighborhoodApi.getInterestGroups()
    ])
    hotTopics.value = topics
    chatRooms.value = rooms
    interestGroups.value = groups
    
    onlineUsers.value = [
      { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, is_online: true },
      { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, is_online: true },
      { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, is_online: true },
      { id: '4', nickname: '运动达人', avatar: 'https://i.pravatar.cc/100?img=4', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, is_online: true },
      { id: '5', nickname: '老张', avatar: 'https://i.pravatar.cc/100?img=5', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, is_online: true }
    ]
    
    leaderboard.value = [
      { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, score: 5890 },
      { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, score: 5340 },
      { id: '3', nickname: '美食小红', avatar: 'https://i.pravatar.cc/100?img=3', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, score: 4980 },
      { id: '4', nickname: '运动达人', avatar: 'https://i.pravatar.cc/100?img=4', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, score: 4560 },
      { id: '5', nickname: '老张', avatar: 'https://i.pravatar.cc/100?img=5', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000, score: 4230 }
    ] as any[]
  } catch (error) {
    console.error('Load lounge data error:', error)
  }
}

// 加载活动数据
const loadActivities = async (refresh = false) => {
  loading.value = true
  try {
    const params: any = { page: 1, limit: 20 }
    if (currentActivityFilter.value !== 'all') {
      if (['sports', 'culture', 'party'].includes(currentActivityFilter.value)) {
        params.category = currentActivityFilter.value
      } else {
        params.status = currentActivityFilter.value
      }
    }
    const response = await activitiesApi.getActivities(params)
    
    if (response.items.length === 0) {
      activities.value = [
        {
          id: '1',
          user_id: '1',
          title: '周末亲子烘焙课',
          description: '一起动手做曲奇饼干，享受亲子时光！',
          category: 'party',
          location: '社区活动中心',
          start_time: Date.now()/1000 + 86400 * 2,
          end_time: Date.now()/1000 + 86400 * 2 + 3 * 3600,
          max_participants: 30,
          current_participants: 23,
          images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
          status: 'upcoming',
          created_at: Date.now()/1000,
          updated_at: Date.now()/1000,
          user: { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000 }
        },
        {
          id: '2',
          user_id: '2',
          title: '邻里足球友谊赛',
          description: '每周固定足球活动，欢迎热爱运动的邻居们加入！',
          category: 'sports',
          location: '社区足球场',
          start_time: Date.now()/1000 + 86400 * 3,
          end_time: Date.now()/1000 + 86400 * 3 + 2 * 3600,
          max_participants: 22,
          current_participants: 18,
          images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'],
          status: 'upcoming',
          created_at: Date.now()/1000,
          updated_at: Date.now()/1000,
          user: { id: '2', nickname: '小李', avatar: 'https://i.pravatar.cc/100?img=2', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000 },
          is_participant: true
        },
        {
          id: '3',
          user_id: '3',
          title: '健康义诊活动',
          description: '社区医院免费义诊，测量血压血糖等基础检查',
          category: 'charity',
          location: '社区卫生站',
          start_time: Date.now()/1000 + 86400 * 6,
          end_time: Date.now()/1000 + 86400 * 6 + 4 * 3600,
          max_participants: 100,
          current_participants: 67,
          images: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800'],
          status: 'upcoming',
          created_at: Date.now()/1000,
          updated_at: Date.now()/1000,
          user: { id: '3', nickname: '张医生', avatar: 'https://i.pravatar.cc/100?img=8', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000 }
        }
      ]
    } else {
      activities.value = response.items
    }
  } catch (error) {
    console.error('Load activities error:', error)
    // 如果API失败，使用模拟数据
    activities.value = [
      {
        id: '1',
        user_id: '1',
        title: '周末亲子烘焙课',
        description: '一起动手做曲奇饼干，享受亲子时光！',
        category: 'party',
        location: '社区活动中心',
        start_time: Date.now()/1000 + 86400 * 2,
        end_time: Date.now()/1000 + 86400 * 2 + 3 * 3600,
        max_participants: 30,
        current_participants: 23,
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'],
        status: 'upcoming',
        created_at: Date.now()/1000,
        updated_at: Date.now()/1000,
        user: { id: '1', nickname: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=1', phone: '', community: '', role: 'resident', credit_score: 100, is_verified: false, created_at: Date.now()/1000, updated_at: Date.now()/1000, last_active_at: Date.now()/1000 }
      }
    ]
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 标签切换
const switchTab = (tab: string) => {
  currentTab.value = tab
}

// 活动筛选
const selectActivityFilter = (filter: string) => {
  currentActivityFilter.value = filter
  loadActivities(true)
}

// 刷新
const onRefresh = async () => {
  isRefreshing.value = true
  if (currentTab.value === 'activities') {
    await loadActivities(true)
  } else if (currentTab.value === 'lounge' || currentTab.value === 'groups') {
    await loadLoungeData()
    isRefreshing.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (currentTab.value === 'activities' && !loading.value) {
    loadActivities()
  }
}

// 导航
const goToCreateActivity = () => {
  uni.navigateTo({ url: '/pages/activities/create' })
}

const goToActivityDetail = (activity: Activity) => {
  uni.navigateTo({ url: `/pages/activities/detail?id=${activity.id}` })
}

const viewUserProfile = (user: User) => {
  console.log('View user profile:', user)
}

const enterTopic = (topic: any) => {
  console.log('Enter topic:', topic)
}

const enterChatRoom = (room: any) => {
  console.log('Enter chat room:', room)
}

// 活动报名/取消报名
const toggleActivityJoin = async (activity: Activity) => {
  try {
    if (activity.is_participant) {
      await activitiesApi.leaveActivity(activity.id)
      activity.is_participant = false
      activity.current_participants = Math.max(0, activity.current_participants - 1)
    } else {
      await activitiesApi.joinActivity(activity.id)
      activity.is_participant = true
      activity.current_participants += 1
    }
  } catch (error) {
    console.error('Toggle activity join error:', error)
    // 模拟效果
    activity.is_participant = !activity.is_participant
    activity.current_participants += activity.is_participant ? 1 : -1
  }
}

// 兴趣小组加入/退出
const toggleGroupJoin = async (group: any) => {
  try {
    if (group.is_joined) {
      await neighborhoodApi.leaveGroup(group.id)
      group.is_joined = false
      group.members = Math.max(0, group.members - 1)
    } else {
      await neighborhoodApi.joinGroup(group.id)
      group.is_joined = true
      group.members += 1
    }
  } catch (error) {
    console.error('Toggle group join error:', error)
    group.is_joined = !group.is_joined
    group.members += group.is_joined ? 1 : -1
  }
}

onMounted(async () => {
  await loadLoungeData()
  await loadActivities()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F0;
}

/* 顶部导航 */
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.nav-title {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%);
  border-radius: 20px;
}

.nav-icon {
  font-size: 16px;
}

.nav-btn-text {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
}

.tab-bar {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid #F0F0E8;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #7A7A6A;
  font-weight: 500;
  position: relative;
  transition: all 0.2s;
}

.tab-item.active {
  color: #FF8C42;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 3px;
  background: #FF8C42;
  border-radius: 2px;
}

.content {
  height: 100vh;
}

/* 通用样式 */
.section-container {
  background: #FFFFFF;
  margin-bottom: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
}

.section-count {
  font-size: 14px;
  color: #7A7A6A;
}

/* 社区客厅 */
.lounge-container {
  padding-bottom: 8px;
}

.welcome-card {
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%);
  margin: 16px;
  padding: 20px;
  border-radius: 16px;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.welcome-emoji {
  font-size: 24px;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
}

.welcome-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}

/* 在线邻居 */
.neighbors-scroll {
  white-space: nowrap;
}

.neighbor-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
}

.neighbor-avatar-wrapper {
  position: relative;
  margin-bottom: 6px;
}

.neighbor-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: #34C759;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
}

.neighbor-name {
  font-size: 12px;
  color: #4A4A3A;
}

/* 热门话题 */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #F9F9F5;
  border-radius: 12px;
}

.topic-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.topic-emoji {
  font-size: 28px;
}

.topic-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.topic-name {
  font-size: 15px;
  font-weight: 500;
  color: #1A1A1A;
}

.topic-meta {
  font-size: 12px;
  color: #7A7A6A;
}

.topic-arrow {
  font-size: 20px;
  color: #C8C8B8;
}

/* 聊天室 */
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-cover {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-emoji {
  font-size: 28px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chat-name {
  font-size: 15px;
  font-weight: 500;
  color: #1A1A1A;
}

.chat-desc {
  font-size: 13px;
  color: #7A7A6A;
}

.chat-stats {
  display: flex;
  gap: 12px;
}

.chat-stat {
  font-size: 12px;
  color: #9A9A8A;
}

.chat-arrow {
  font-size: 20px;
  color: #C8C8B8;
}

/* 活动中心 */
.activities-container {
  padding-bottom: 8px;
}

.filter-scroll {
  background: #FFFFFF;
  padding: 12px 0;
}

.filter-list {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  white-space: nowrap;
}

.filter-chip {
  padding: 8px 16px;
  background: #F5F5F0;
  border-radius: 20px;
  font-size: 14px;
  color: #7A7A6A;
  font-weight: 500;
  display: inline-block;
}

.filter-chip.active {
  background: #FF8C42;
  color: #FFFFFF;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
}

.activity-card {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.activity-image-section {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.activity-image {
  width: 100%;
  height: 100%;
}

.activity-content {
  padding: 14px 16px 16px;
}

.activity-top {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.activity-time-badge {
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%);
  min-width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-month {
  font-size: 11px;
  color: rgba(255,255,255,0.9);
}

.activity-day {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.activity-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.3;
}

.activity-meta-row {
  display: flex;
  gap: 12px;
}

.activity-meta {
  font-size: 13px;
  color: #7A7A6A;
}

.activity-body {
  margin-bottom: 12px;
}

.activity-desc {
  font-size: 14px;
  color: #5A5A4A;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-creator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.creator-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.creator-name {
  font-size: 13px;
  color: #7A7A6A;
}

.activity-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participants-count {
  font-size: 14px;
  color: #FF8C42;
  font-weight: 500;
}

.join-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  transition: all 0.2s;
}

.join-btn.joined {
  background: #E8E8E0;
  color: #7A7A6A;
}

.join-btn.full {
  background: #E8E8E0;
  color: #9A9A8A;
}

/* 兴趣小组 */
.groups-container {
  padding-bottom: 8px;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.group-card {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.group-cover {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-emoji {
  font-size: 40px;
}

.group-info {
  padding: 12px;
  text-align: center;
}

.group-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.group-members {
  display: block;
  font-size: 12px;
  color: #9A9A8A;
}

.group-action {
  padding: 8px 12px;
  text-align: center;
  border-top: 1px solid #F5F5F0;
}

.action-join {
  font-size: 14px;
  font-weight: 500;
  color: #FF8C42;
}

.action-joined {
  font-size: 14px;
  font-weight: 500;
  color: #9A9A8A;
}

/* 排行榜 */
.leaderboard-section {
  margin: 0 16px 8px;
  border-radius: 16px;
  padding: 16px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
}

.leader-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F0;
}

.leader-item:last-child {
  border-bottom: none;
}

.leader-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
  background: #F5F5F0;
  color: #9A9A8A;
}

.leader-rank.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
  color: #FFFFFF;
}

.leader-rank.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
  color: #FFFFFF;
}

.leader-rank.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B87333 100%);
  color: #FFFFFF;
}

.leader-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.leader-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.leader-name {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
}

.leader-score {
  font-size: 12px;
  color: #7A7A6A;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-emoji {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #7A7A6A;
  margin-bottom: 6px;
}

.empty-hint {
  font-size: 14px;
  color: #9A9A8A;
}

/* 加载更多 */
.loading-more {
  text-align: center;
  padding: 20px;
  color: #9A9A8A;
  font-size: 14px;
}

.safe-area-bottom {
  height: 40px;
}
</style>
