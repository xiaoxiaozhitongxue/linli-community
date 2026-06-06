<template>
  <view class="page">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <text class="header-title">🤝 AI互助</text>
        <text class="header-subtitle">快速匹配，邻里互帮</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 快速发起 -->
      <view class="quick-post">
        <view class="quick-post-header">
          <text class="quick-post-icon">✨</text>
          <text class="quick-post-title">一句话发布互助任务</text>
        </view>
        <view class="input-box">
          <textarea 
            class="input-textarea" 
            v-model="taskInput" 
            placeholder="如：帮忙取个快递，有偿5元"
            :maxlength="200"
          />
        </view>
        <view class="quick-post-footer">
          <view class="task-types">
            <view 
              class="task-type" 
              :class="{ active: selectedType === 'delivery' }"
              @click="selectType('delivery')"
            >
              📦 取快递
            </view>
            <view 
              class="task-type" 
              :class="{ active: selectedType === 'shopping' }"
              @click="selectType('shopping')"
            >
              🛒 帮买菜
            </view>
            <view 
              class="task-type" 
              :class="{ active: selectedType === 'pet' }"
              @click="selectType('pet')"
            >
              🐕 代遛狗
            </view>
            <view 
              class="task-type" 
              :class="{ active: selectedType === 'child' }"
              @click="selectType('child')"
            >
              👶 接孩子
            </view>
          </view>
          <view class="post-actions">
            <view class="reward-input">
              <text class="reward-label">悬赏</text>
              <input 
                class="reward-field" 
                type="number" 
                v-model="rewardAmount" 
                placeholder="0"
              />
              <text class="reward-unit">元</text>
            </view>
            <view class="submit-btn" @click="submitTask">
              <text>发布任务</text>
            </view>
          </view>
        </view>
      </view>

      <!-- AI匹配动画 -->
      <view class="ai-matching" v-if="isMatching">
        <view class="matching-animation">
          <view class="matching-circle"></view>
          <view class="matching-circle circle-2"></view>
          <view class="matching-circle circle-3"></view>
          <view class="matching-center">
            <text class="matching-emoji">🔍</text>
          </view>
        </view>
        <text class="matching-text">AI正在为您匹配最佳邻居...</text>
        <view class="matching-progress">
          <view class="progress-bar" :style="{ width: matchingProgress + '%' }"></view>
        </view>
        <text class="matching-count">已匹配 {{ matchedCount }} 位邻居</text>
      </view>

      <!-- 匹配结果 -->
      <view class="match-results" v-if="matchResults.length > 0">
        <view class="results-header">
          <text class="results-title">🎯 智能匹配结果</text>
          <text class="results-subtitle">根据您的位置、信誉、距离综合推荐</text>
        </view>
        <view class="results-list">
          <view 
            class="result-card" 
            v-for="(match, index) in matchResults" 
            :key="match.id"
          >
            <view class="result-rank">{{ index + 1 }}</view>
            <image class="result-avatar" :src="match.avatar" mode="aspectFill" />
            <view class="result-info">
              <view class="result-name-row">
                <text class="result-name">{{ match.name }}</text>
                <view class="result-badge" v-if="match.isVerified">已认证</view>
              </view>
              <view class="result-stats">
                <text class="result-stat">⭐ {{ match.rating }}</text>
                <text class="result-stat">📍 {{ match.distance }}m</text>
                <text class="result-stat">✅ {{ match.completedTasks }}单</text>
              </view>
              <view class="result-tags">
                <text class="result-tag" v-for="tag in match.tags" :key="tag">{{ tag }}</text>
              </view>
            </view>
            <view class="result-action">
              <view class="invite-btn" @click="inviteMatch(match)">邀请</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 任务广场 -->
      <view class="task-square">
        <view class="square-header">
          <text class="square-title">📋 任务广场</text>
          <view class="square-filters">
            <view 
              class="filter-btn" 
              :class="{ active: taskFilter === 'all' }"
              @click="filterTasks('all')"
            >
              全部
            </view>
            <view 
              class="filter-btn" 
              :class="{ active: taskFilter === 'nearby' }"
              @click="filterTasks('nearby')"
            >
              距离近
            </view>
            <view 
              class="filter-btn" 
              :class="{ active: taskFilter === 'highReward' }"
              @click="filterTasks('highReward')"
            >
              悬赏高
            </view>
          </view>
        </view>

        <view class="task-list">
          <view 
            class="task-card" 
            v-for="task in filteredTasks" 
            :key="task.id"
            @click="goToTaskDetail(task)"
          >
            <view class="task-header">
              <image class="task-creator-avatar" :src="task.creatorAvatar" mode="aspectFill" />
              <view class="task-creator-info">
                <text class="task-creator-name">{{ task.creatorName }}</text>
                <text class="task-create-time">{{ task.createTime }}</text>
              </view>
              <view class="task-type-tag" :class="'type-' + task.type">
                {{ getTypeName(task.type) }}
              </view>
            </view>
            <view class="task-content">
              <text class="task-title">{{ task.title }}</text>
              <text class="task-desc">{{ task.description }}</text>
            </view>
            <view class="task-footer">
              <view class="task-reward">
                <text class="reward-icon">💰</text>
                <text class="reward-value">{{ task.reward }}元</text>
              </view>
              <view class="task-meta">
                <text class="task-distance">📍 {{ task.distance }}m</text>
                <text class="task-responses">👥 {{ task.responses }}人已响应</text>
              </view>
            </view>
            <view class="task-action-bar">
              <view class="respond-btn" @click.stop="respondToTask(task)">
                我来帮忙
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 我的任务 -->
      <view class="my-tasks">
        <view class="my-tasks-header">
          <text class="my-tasks-title">📁 我的任务</text>
        </view>
        <view class="my-tasks-tabs">
          <view 
            class="my-task-tab" 
            :class="{ active: myTaskTab === 'created' }"
            @click="switchMyTaskTab('created')"
          >
            我发起 ({{ myCreatedTasks.length }})
          </view>
          <view 
            class="my-task-tab" 
            :class="{ active: myTaskTab === 'accepted' }"
            @click="switchMyTaskTab('accepted')"
          >
            我接单 ({{ myAcceptedTasks.length }})
          </view>
          <view 
            class="my-task-tab" 
            :class="{ active: myTaskTab === 'history' }"
            @click="switchMyTaskTab('history')"
          >
            已完成
          </view>
        </view>

        <view class="my-task-list">
          <view 
            class="my-task-item" 
            v-for="task in currentMyTasks" 
            :key="task.id"
          >
            <view class="my-task-status" :class="'status-' + task.status">
              {{ getStatusName(task.status) }}
            </view>
            <view class="my-task-content">
              <text class="my-task-title">{{ task.title }}</text>
              <text class="my-task-time">{{ task.updateTime }}</text>
            </view>
            <text class="my-task-reward">{{ task.reward }}元</text>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const statusBarHeight = ref(20)
const taskInput = ref('')
const selectedType = ref('')
const rewardAmount = ref(0)
const isMatching = ref(false)
const matchingProgress = ref(0)
const matchedCount = ref(0)
const matchResults = ref<any[]>([])
const taskFilter = ref('all')
const myTaskTab = ref('created')

// 匹配结果模拟数据
const mockMatchResults = [
  { 
    id: '1', 
    name: '王阿姨', 
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 4.9,
    distance: 120,
    completedTasks: 89,
    isVerified: true,
    tags: ['热心肠', '时间灵活']
  },
  { 
    id: '2', 
    name: '小李', 
    avatar: 'https://i.pravatar.cc/100?img=2',
    rating: 4.8,
    distance: 200,
    completedTasks: 56,
    isVerified: true,
    tags: ['效率高', '好沟通']
  },
  { 
    id: '3', 
    name: '老张', 
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 4.7,
    distance: 350,
    completedTasks: 123,
    isVerified: false,
    tags: ['经验丰富']
  }
]

// 任务广场数据
const tasks = ref([
  {
    id: '1',
    type: 'delivery',
    title: '帮忙取个快递',
    description: '菜鸟驿站，3个包裹，有密码',
    reward: 5,
    distance: 150,
    responses: 3,
    creatorName: '小红',
    creatorAvatar: 'https://i.pravatar.cc/100?img=4',
    createTime: '10分钟前',
    status: 'open'
  },
  {
    id: '2',
    type: 'shopping',
    title: '帮忙带份早餐',
    description: '永和大王，豆浆油条套餐',
    reward: 8,
    distance: 200,
    responses: 5,
    creatorName: '上班族小王',
    creatorAvatar: 'https://i.pravatar.cc/100?img=5',
    createTime: '20分钟前',
    status: 'open'
  },
  {
    id: '3',
    type: 'pet',
    title: '代遛狗半小时',
    description: '金毛，很温顺，就在楼下花园',
    reward: 15,
    distance: 80,
    responses: 2,
    creatorName: '铲屎官小刘',
    creatorAvatar: 'https://i.pravatar.cc/100?img=6',
    createTime: '1小时前',
    status: 'open'
  },
  {
    id: '4',
    type: 'child',
    title: '帮忙接孩子',
    description: '阳光小学门口，4点15分，两个孩子',
    reward: 30,
    distance: 300,
    responses: 1,
    creatorName: '双职工家庭',
    creatorAvatar: 'https://i.pravatar.cc/100?img=7',
    createTime: '2小时前',
    status: 'open'
  }
])

// 我的任务
const myCreatedTasks = ref([
  { id: '1', title: '取快递', reward: 5, status: 'ongoing', updateTime: '进行中' },
  { id: '2', title: '带早餐', reward: 8, status: 'completed', updateTime: '已完成' }
])

const myAcceptedTasks = ref([
  { id: '3', title: '帮取快递', reward: 5, status: 'ongoing', updateTime: '进行中' }
])

const filteredTasks = computed(() => {
  let result = [...tasks.value]
  if (taskFilter.value === 'nearby') {
    result.sort((a, b) => a.distance - b.distance)
  } else if (taskFilter.value === 'highReward') {
    result.sort((a, b) => b.reward - a.reward)
  }
  return result
})

const currentMyTasks = computed(() => {
  if (myTaskTab.value === 'created') return myCreatedTasks.value
  if (myTaskTab.value === 'accepted') return myAcceptedTasks.value
  return []
})

const selectType = (type: string) => {
  selectedType.value = selectedType.value === type ? '' : type
}

const submitTask = () => {
  if (!taskInput.value.trim()) {
    uni.showToast({ title: '请描述您的需求', icon: 'none' })
    return
  }
  
  isMatching.value = true
  matchingProgress.value = 0
  matchedCount.value = 0
  matchResults.value = []
  
  // 模拟AI匹配过程
  let progress = 0
  const interval = setInterval(() => {
    progress += 10
    matchingProgress.value = progress
    if (progress <= 60) {
      matchedCount.value = Math.floor(Math.random() * 3) + 1
    }
    
    if (progress >= 100) {
      clearInterval(interval)
      isMatching.value = false
      matchResults.value = mockMatchResults
      uni.showToast({ title: '匹配成功！', icon: 'success' })
    }
  }, 200)
}

const inviteMatch = (match: any) => {
  uni.showModal({
    title: '确认邀请',
    content: `确定邀请 ${match.name} 帮助您完成任务吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已发送邀请', icon: 'success' })
      }
    }
  })
}

const filterTasks = (filter: string) => {
  taskFilter.value = filter
}

const switchMyTaskTab = (tab: string) => {
  myTaskTab.value = tab
}

const goToTaskDetail = (task: any) => {
  uni.navigateTo({ url: `/pages/ai-helper/detail?id=${task.id}` })
}

const respondToTask = (task: any) => {
  uni.showModal({
    title: '确认接单',
    content: '确定要接下这个任务吗？',
    success: (res) => {
      if (res.confirm) {
        task.responses++
        uni.showToast({ title: '接单成功', icon: 'success' })
      }
    }
  })
}

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    delivery: '取快递',
    shopping: '帮买菜',
    pet: '代遛狗',
    child: '接孩子'
  }
  return map[type] || type
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    open: '待接单',
    ongoing: '进行中',
    completed: '已完成'
  }
  return map[status] || status
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, #4CAF50, #81C784);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.header-content {
  text-align: center;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}

.content {
  height: calc(100vh);
}

/* 快速发起 */
.quick-post {
  background: var(--card-bg);
  margin: var(--spacing-lg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.quick-post-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.quick-post-icon {
  font-size: 20px;
  margin-right: var(--spacing-sm);
}

.quick-post-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.input-box {
  background: var(--bg-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.input-textarea {
  width: 100%;
  min-height: 80px;
  font-size: 14px;
  color: var(--text-primary);
  border: none;
  background: transparent;
}

.quick-post-footer {
  
}

.task-types {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.task-type {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  background: var(--bg-color);
  color: var(--text-secondary);
}

.task-type.active {
  background: #E8F5E9;
  color: #4CAF50;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.reward-input {
  display: flex;
  align-items: center;
  background: var(--bg-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}

.reward-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-right: var(--spacing-sm);
}

.reward-field {
  width: 50px;
  font-size: 15px;
  font-weight: 500;
  color: var(--primary-color);
  text-align: center;
  border: none;
  background: transparent;
}

.reward-unit {
  font-size: 13px;
  color: var(--text-muted);
}

.submit-btn {
  flex: 1;
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 500;
}

/* AI匹配 */
.ai-matching {
  background: var(--card-bg);
  margin: var(--spacing-lg);
  padding: var(--spacing-xxl);
  border-radius: var(--radius-lg);
  text-align: center;
}

.matching-animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-lg);
}

.matching-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #4CAF50;
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

.circle-2 {
  animation-delay: 0.5s;
}

.circle-3 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.matching-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.matching-emoji {
  font-size: 28px;
}

.matching-text {
  font-size: 14px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: var(--spacing-md);
}

.matching-progress {
  height: 4px;
  background: var(--bg-color);
  border-radius: 2px;
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.matching-count {
  font-size: 12px;
  color: var(--text-muted);
}

/* 匹配结果 */
.match-results {
  margin: var(--spacing-lg);
}

.results-header {
  margin-bottom: var(--spacing-md);
}

.results-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.results-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-card {
  background: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.result-rank {
  width: 24px;
  height: 24px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: var(--spacing-md);
}

.result-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
}

.result-info {
  flex: 1;
}

.result-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.result-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.result-badge {
  font-size: 11px;
  background: #E8F5E9;
  color: #4CAF50;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: var(--spacing-sm);
}

.result-stats {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: 4px;
}

.result-stat {
  font-size: 12px;
  color: var(--text-muted);
}

.result-tags {
  display: flex;
  gap: var(--spacing-xs);
}

.result-tag {
  font-size: 11px;
  background: var(--bg-color);
  color: var(--text-secondary);
  padding: 2px 6px;
  border-radius: 10px;
}

.invite-btn {
  background: #4CAF50;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
}

/* 任务广场 */
.task-square {
  padding: var(--spacing-lg);
}

.square-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.square-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.square-filters {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-btn {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: var(--bg-color);
  color: var(--text-secondary);
}

.filter-btn.active {
  background: #E8F5E9;
  color: #4CAF50;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.task-card {
  background: var(--card-bg);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.task-creator-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: var(--spacing-sm);
}

.task-creator-info {
  flex: 1;
}

.task-creator-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
}

.task-create-time {
  font-size: 11px;
  color: var(--text-muted);
}

.task-type-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.type-delivery {
  background: #E3F2FD;
  color: #2196F3;
}

.type-shopping {
  background: #FFF3E0;
  color: #FF9800;
}

.type-pet {
  background: #F3E5F5;
  color: #9C27B0;
}

.type-child {
  background: #FCE4EC;
  color: #E91E63;
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.task-desc {
  font-size: 13px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: var(--spacing-md);
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.task-reward {
  display: flex;
  align-items: center;
}

.reward-icon {
  font-size: 14px;
  margin-right: 4px;
}

.reward-value {
  font-size: 16px;
  font-weight: 600;
  color: #4CAF50;
}

.task-meta {
  display: flex;
  gap: var(--spacing-md);
}

.task-distance,
.task-responses {
  font-size: 12px;
  color: var(--text-muted);
}

.task-action-bar {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.respond-btn {
  width: 100%;
  background: #4CAF50;
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 500;
}

/* 我的任务 */
.my-tasks {
  padding: var(--spacing-lg);
}

.my-tasks-header {
  margin-bottom: var(--spacing-md);
}

.my-tasks-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.my-tasks-tabs {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.my-task-tab {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm);
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.my-task-tab.active {
  background: #E8F5E9;
  color: #4CAF50;
  font-weight: 500;
}

.my-task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.my-task-item {
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
}

.my-task-status {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 11px;
  margin-right: var(--spacing-md);
}

.status-open {
  background: #E3F2FD;
  color: #2196F3;
}

.status-ongoing {
  background: #FFF3E0;
  color: #FF9800;
}

.status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.my-task-content {
  flex: 1;
}

.my-task-title {
  font-size: 14px;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.my-task-time {
  font-size: 12px;
  color: var(--text-muted);
}

.my-task-reward {
  font-size: 14px;
  font-weight: 500;
  color: #4CAF50;
}
</style>
