<template>
  <!-- 功能暂未开放提示 -->
  <div class="blocked-overlay" v-if="isBlocked">
    <div class="blocked-content">
      <span class="blocked-icon">🔒</span>
      <span class="blocked-text">此功能暂未开放，敬请期待</span>
    </div>
  </div>

  <div class="page" v-else>
    <!-- 顶部导航 -->
    <div class="nav-header">
      <div class="nav-content">
        <span class="nav-title">邻里空间</span>
        <div class="nav-actions">
          <button class="nav-btn" @click="goToCreateActivity">
            <span class="nav-icon">✏️</span>
            <span class="nav-btn-text">发活动</span>
          </button>
        </div>
      </div>

      <!-- 标签切换 -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-text">{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 社区客厅 -->
      <div v-if="currentTab === 'lounge'" class="tab-content">
        <div class="section-title">
          <span>🏠 社区客厅</span>
          <span class="online-count">{{ onlineUsers.length }} 位邻居在线</span>
        </div>

        <div class="chat-list">
          <div
            v-for="room in chatRooms"
            :key="room.id"
            class="chat-item"
            @click="enterChatRoom(room)"
          >
            <div class="chat-avatar" :style="{ background: room.bg_color }">
              <span class="chat-emoji">{{ room.emoji }}</span>
            </div>
            <div class="chat-info">
              <span class="chat-name">{{ room.name }}</span>
              <span class="chat-desc">{{ room.description }}</span>
            </div>
            <div class="chat-stats">
              <span class="member-count">{{ room.members }}人</span>
              <span v-if="room.today_messages > 0" class="message-badge">
                {{ room.today_messages }}条新消息
              </span>
            </div>
          </div>
        </div>

        <!-- 在线邻居 -->
        <div class="section-title">
          <span>👥 在线邻居</span>
        </div>
        <div class="online-users">
          <div
            v-for="user in onlineUsers"
            :key="user.id"
            class="online-user"
          >
            <img :src="user.avatar || '/placeholder.jpg'" :alt="user.nickname" class="user-avatar" />
            <span class="user-name">{{ user.nickname }}</span>
            <span class="user-badge" v-if="user.is_verified">✓</span>
          </div>
        </div>
      </div>

      <!-- 活动中心 -->
      <div v-if="currentTab === 'activities'" class="tab-content">
        <div class="section-title">
          <span>🎉 活动中心</span>
          <button class="create-btn" @click="goToCreateActivity">
            发起活动
          </button>
        </div>

        <div class="activity-list">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-card"
            @click="goToActivityDetail(activity.id)"
          >
            <div class="activity-header">
              <div class="activity-emoji">{{ activity.emoji }}</div>
              <div class="activity-info">
                <span class="activity-name">{{ activity.name }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
              <div class="activity-status" :class="activity.status">
                {{ getStatusText(activity.status) }}
              </div>
            </div>
            <p class="activity-desc">{{ activity.description }}</p>
            <div class="activity-footer">
              <div class="creator-info">
                <img :src="activity.creator?.avatar || '/placeholder.jpg'" class="creator-avatar" />
                <span class="creator-name">{{ activity.creator?.nickname }}</span>
              </div>
              <div class="activity-right">
                <span class="participants-count">
                  {{ activity.current_participants }}/{{ activity.max_participants || '不限' }} 人
                </span>
                <button
                  class="join-btn"
                  :class="{ joined: activity.is_participant }"
                  :disabled="activity.status !== 'upcoming' && activity.status !== 'ongoing'"
                  @click.stop="toggleJoinActivity(activity)"
                >
                  {{ activity.is_participant ? '已参加' : '参加' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 兴趣小组 -->
      <div v-if="currentTab === 'groups'" class="tab-content">
        <div class="section-title">
          <span>🎯 兴趣小组</span>
        </div>

        <div class="groups-grid">
          <div
            v-for="group in interestGroups"
            :key="group.id"
            class="group-card"
            @click="toggleGroupJoin(group)"
          >
            <div class="group-cover" :style="{ background: group.bg_color }">
              <span class="group-emoji">{{ group.emoji }}</span>
            </div>
            <div class="group-info">
              <span class="group-name">{{ group.name }}</span>
              <span class="group-members">{{ group.members }} 人</span>
            </div>
            <div class="group-action">
              <span :class="group.is_joined ? 'action-joined' : 'action-join'">
                {{ group.is_joined ? '已加入' : '加入' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div v-if="currentTab === 'rankings'" class="tab-content">
        <div class="section-title">
          <span>🏆 活跃邻居</span>
        </div>

        <div class="leaderboard-list">
          <div
            v-for="(leader, index) in leaderboard"
            :key="leader.id"
            class="leader-item"
          >
            <div class="leader-rank" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </div>
            <img :src="leader.avatar || '/placeholder.jpg'" class="leader-avatar" />
            <div class="leader-info">
              <span class="leader-name">{{ leader.nickname }}</span>
              <span class="leader-score">信用积分: {{ leader.credit_score }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { neighborhoodApi } from '../../utils/api'
import { toastSuccess, toastError } from '../../utils/toast'

// 该页面已被屏蔽
const isBlocked = true

const router = useRouter()

const currentTab = ref('lounge')
const tabs = [
  { key: 'lounge', name: '客厅', icon: '🏠' },
  { key: 'activities', name: '活动', icon: '🎉' },
  { key: 'groups', name: '小组', icon: '🎯' },
  { key: 'rankings', name: '排行', icon: '🏆' }
]

// Mock data
const chatRooms = ref([
  { id: '1', name: '宝爸宝妈群', emoji: '👶', description: '育儿经验分享', members: 234, today_messages: 89, bg_color: '#FFE0B2' },
  { id: '2', name: '宠物交流群', emoji: '🐕', description: '遛狗、宠物用品', members: 189, today_messages: 67, bg_color: '#C8E6C9' },
  { id: '3', name: '美食烹饪群', emoji: '🍳', description: '私房菜、烘焙', members: 312, today_messages: 123, bg_color: '#BBDEFB' },
  { id: '4', name: '运动健身群', emoji: '🏃', description: '跑步、瑜伽、健身', members: 145, today_messages: 45, bg_color: '#F8BBD9' }
])

const onlineUsers = ref([
  { id: '1', nickname: '阳光小李', avatar: '', is_verified: true, credit_score: 95 },
  { id: '2', nickname: '热心张阿姨', avatar: '', is_verified: true, credit_score: 90 },
  { id: '3', nickname: '社区志愿者小王', avatar: '', is_verified: false, credit_score: 85 }
])

const activities = ref([
  {
    id: '1',
    name: '周末亲子烘焙',
    emoji: '🧁',
    time: '本周六 14:00',
    description: '欢迎带孩子一起来做蛋糕和饼干',
    status: 'upcoming',
    max_participants: 20,
    current_participants: 12,
    is_participant: false,
    creator: { nickname: '烘焙达人', avatar: '' }
  },
  {
    id: '2',
    name: '邻里足球赛',
    emoji: '⚽',
    time: '本周日 09:00',
    description: '周末足球友谊赛，欢迎报名',
    status: 'upcoming',
    max_participants: 22,
    current_participants: 18,
    is_participant: true,
    creator: { nickname: '足球爱好者', avatar: '' }
  }
])

const interestGroups = ref([
  { id: '1', name: '萌宠联盟', members: 234, emoji: '🐕', bg_color: '#E8F5E9', is_joined: true },
  { id: '2', name: '美食烹饪', members: 456, emoji: '🍳', bg_color: '#FFF3E0', is_joined: false },
  { id: '3', name: '运动健身', members: 189, emoji: '🏃', bg_color: '#E3F2FD', is_joined: true },
  { id: '4', name: '读书会', members: 123, emoji: '📚', bg_color: '#FCE4EC', is_joined: false }
])

const leaderboard = ref([
  { id: '1', nickname: '阳光小李', avatar: '', credit_score: 98 },
  { id: '2', nickname: '热心张阿姨', avatar: '', credit_score: 95 },
  { id: '3', nickname: '社区志愿者小王', avatar: '', credit_score: 92 }
])

function switchTab(tabKey: string) {
  currentTab.value = tabKey
}

function goToCreateActivity() {
  router.push('/pages/activities/create')
}

function goToActivityDetail(id: string) {
  router.push(`/pages/activities/detail?id=${id}`)
}

function enterChatRoom(room: any) {
  toastSuccess(`进入 ${room.name}`)
}

function toggleJoinActivity(activity: any) {
  activity.is_participant = !activity.is_participant
  activity.current_participants += activity.is_participant ? 1 : -1
  toastSuccess(activity.is_participant ? '报名成功' : '已取消报名')
}

function toggleGroupJoin(group: any) {
  group.is_joined = !group.is_joined
  group.members += group.is_joined ? 1 : -1
  toastSuccess(group.is_joined ? '加入成功' : '已退出小组')
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

onMounted(async () => {
  // Load data
  try {
    const [topics, chat, groups] = await Promise.all([
      neighborhoodApi.getTopics(),
      neighborhoodApi.getChatRooms(),
      neighborhoodApi.getInterestGroups()
    ])
    // Update with real data if available
  } catch (error) {
    console.error('Failed to load neighborhood data:', error)
  }
})
</script>

<style scoped>
/* 屏蔽提示样式 */
.blocked-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #F5F5F0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.blocked-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.blocked-icon {
  font-size: 64px;
}

.blocked-text {
  font-size: 16px;
  color: #666;
}

.page {
  min-height: 100vh;
  background: #F5F5F0;
  padding-top: 120px;
  padding-bottom: 80px;
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
  padding: 16px;
  background: linear-gradient(135deg, #FF8C42, #FF6B35);
}

.nav-title {
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.2);
  border: none;
  padding: 8px 12px;
  border-radius: 16px;
  cursor: pointer;
  color: #FFFFFF;
}

.nav-icon {
  font-size: 14px;
}

.nav-btn-text {
  font-size: 13px;
}

/* 标签栏 */
.tab-bar {
  display: flex;
  background: #FFFFFF;
  padding: 0 8px;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item.active {
  border-bottom-color: #FF8C42;
  color: #FF8C42;
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.tab-text {
  font-size: 12px;
}

/* 内容区域 */
.content-area {
  padding: 16px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 通用标题 */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
}

.online-count {
  font-size: 13px;
  font-weight: normal;
  color: #4CAF50;
}

/* 聊天室列表 */
.chat-list {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F5F5F0;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-item:hover {
  background: #FAFAFA;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.chat-emoji {
  font-size: 24px;
}

.chat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.chat-desc {
  font-size: 13px;
  color: #9A9A8A;
}

.chat-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.member-count {
  font-size: 13px;
  color: #9A9A8A;
}

.message-badge {
  background: #FF8C42;
  color: #FFFFFF;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 在线邻居 */
.online-users {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 16px;
  margin-bottom: 24px;
}

.online-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #F5F5F0;
}

.user-name {
  font-size: 13px;
  color: #1A1A1A;
}

.user-badge {
  color: #4CAF50;
  font-weight: bold;
}

/* 活动列表 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s;
}

.activity-card:hover {
  transform: translateY(-2px);
}

.activity-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.activity-emoji {
  font-size: 40px;
  margin-right: 12px;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 13px;
  color: #9A9A8A;
}

.activity-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.activity-status.upcoming {
  background: #E3F2FD;
  color: #1976D2;
}

.activity-status.ongoing {
  background: #E8F5E9;
  color: #388E3C;
}

.activity-status.completed {
  background: #F5F5F0;
  color: #9A9A8A;
}

.activity-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F5F5F0;
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
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.join-btn:hover {
  transform: scale(1.05);
}

.join-btn.joined {
  background: #E8E8E0;
  color: #7A7A6A;
}

.join-btn:disabled {
  background: #E8E8E0;
  color: #9A9A8A;
  cursor: not-allowed;
}

/* 兴趣小组 */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.group-card {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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
.leaderboard-list {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.leader-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 12px;
  background: #F5F5F0;
}

.leader-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.leader-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.leader-score {
  font-size: 13px;
  color: #9A9A8A;
}

.create-btn {
  padding: 6px 16px;
  background: #FF8C42;
  color: #FFFFFF;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}
</style>
