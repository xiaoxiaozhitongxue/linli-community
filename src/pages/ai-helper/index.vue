<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <div class="header-main">
          <span class="header-icon">🤝</span>
          <div class="header-text">
            <span class="header-title">AI互助</span>
            <span class="header-subtitle">快速匹配，邻里互帮</span>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">128</span>
            <span class="stat-label">今日互助</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">96%</span>
            <span class="stat-label">完成率</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <!-- 快速发起 -->
      <div class="quick-post">
        <div class="quick-post-header">
          <span class="quick-post-icon">✨</span>
          <span class="quick-post-title">发布互助任务</span>
        </div>
        
        <!-- 任务类型快速选择 -->
        <div class="type-selector">
          <div
            class="type-chip"
            :class="{ active: selectedType === 'delivery' }"
            @click="selectType('delivery')"
          >
            <span class="type-emoji">📦</span>
            <span class="type-name">取快递</span>
          </div>
          <div
            class="type-chip"
            :class="{ active: selectedType === 'shopping' }"
            @click="selectType('shopping')"
          >
            <span class="type-emoji">🛒</span>
            <span class="type-name">帮买菜</span>
          </div>
          <div
            class="type-chip"
            :class="{ active: selectedType === 'pet' }"
            @click="selectType('pet')"
          >
            <span class="type-emoji">🐕</span>
            <span class="type-name">代遛狗</span>
          </div>
          <div
            class="type-chip"
            :class="{ active: selectedType === 'child' }"
            @click="selectType('child')"
          >
            <span class="type-emoji">👶</span>
            <span class="type-name">接孩子</span>
          </div>
        </div>

        <!-- 任务描述输入 -->
        <div class="input-box">
          <textarea
            class="input-textarea"
            v-model="taskInput"
            placeholder="描述一下您的需求，如：帮忙取个快递，菜鸟驿站3号货架"
            :maxlength="200"
            rows="3"
          />
          <div class="input-hint">{{ taskInput.length }}/200</div>
        </div>

        <!-- 悬赏金额和时间 -->
        <div class="post-options">
          <div class="option-group">
            <span class="option-label">💰 悬赏金额</span>
            <div class="reward-input-wrapper">
              <input
                class="reward-field"
                type="number"
                v-model="rewardAmount"
                placeholder="0"
                min="0"
              />
              <span class="reward-unit">元</span>
            </div>
          </div>
          <div class="option-group">
            <span class="option-label">🕐 发布时间</span>
            <div class="time-selector">
              <select class="time-select" v-model="publishTime">
                <option value="now">立即发布</option>
                <option value="1h">1小时后</option>
                <option value="2h">2小时后</option>
                <option value="tomorrow">明天</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 发布按钮 -->
        <div class="submit-btn" @click="submitTask" :class="{ disabled: !canSubmit }">
          <span class="btn-icon">🚀</span>
          <span class="btn-text">发布任务</span>
          <span class="btn-hint" v-if="selectedType && rewardAmount > 0">AI将自动匹配</span>
        </div>
      </div>

      <!-- AI匹配动画 -->
      <div class="ai-matching" v-if="isMatching">
        <div class="matching-animation">
          <div class="matching-circle"></div>
          <div class="matching-circle circle-2"></div>
          <div class="matching-circle circle-3"></div>
          <div class="matching-center">
            <span class="matching-emoji">🔍</span>
          </div>
        </div>
        <span class="matching-text">AI正在为您匹配最佳邻居...</span>
        <div class="matching-progress">
          <div class="progress-bar" :style="{ width: matchingProgress + '%' }"></div>
        </div>
        <span class="matching-count">已匹配 {{ matchedCount }} 位邻居</span>
      </div>

      <!-- 匹配结果 -->
      <div class="match-results" v-if="matchResults.length > 0">
        <div class="results-header">
          <span class="results-title">🎯 智能匹配结果</span>
          <span class="results-subtitle">根据您的位置、信誉、距离综合推荐</span>
        </div>
        <div class="results-list">
          <div
            class="result-card"
            v-for="(match, index) in matchResults"
            :key="match.id"
          >
            <div class="result-rank">{{ index + 1 }}</div>
            <img class="result-avatar" :src="match.avatar" />
            <div class="result-info">
              <div class="result-name-row">
                <span class="result-name">{{ match.name }}</span>
                <div class="result-badge" v-if="match.isVerified">已认证</div>
              </div>
              <div class="result-stats">
                <span class="result-stat">⭐ {{ match.rating }}</span>
                <span class="result-stat">📍 {{ match.distance }}m</span>
                <span class="result-stat">✅ {{ match.completedTasks }}单</span>
              </div>
              <div class="result-tags">
                <span class="result-tag" v-for="tag in match.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="result-action">
              <div class="invite-btn" @click="inviteMatch(match)">邀请</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务广场 -->
      <div class="task-square">
        <div class="square-header">
          <span class="square-title">📋 任务广场</span>
          <div class="square-filters">
            <div
              class="filter-btn"
              :class="{ active: taskFilter === 'all' }"
              @click="filterTasks('all')"
            >
              全部
            </div>
            <div
              class="filter-btn"
              :class="{ active: taskFilter === 'nearby' }"
              @click="filterTasks('nearby')"
            >
              距离近
            </div>
            <div
              class="filter-btn"
              :class="{ active: taskFilter === 'highReward' }"
              @click="filterTasks('highReward')"
            >
              悬赏高
            </div>
          </div>
        </div>

        <div class="task-list">
          <div
            class="task-card"
            v-for="task in filteredTasks"
            :key="task.id"
            @click="goToTaskDetail(task)"
          >
            <!-- 卡片头部：状态标签 + 类型标签 -->
            <div class="task-top-bar">
              <div class="task-status-badge" :class="'status-' + task.status">
                <span class="status-dot"></span>
                {{ getStatusName(task.status) }}
              </div>
              <div class="task-type-tag" :class="'type-' + task.type">
                {{ getTypeName(task.type) }}
              </div>
            </div>

            <!-- 任务主体 -->
            <div class="task-body">
              <div class="task-creator">
                <img class="task-creator-avatar" :src="task.creatorAvatar" />
                <div class="task-creator-info">
                  <span class="task-creator-name">{{ task.creatorName }}</span>
                  <div class="task-creator-meta">
                    <span class="creator-rating">⭐ {{ task.creatorRating }}</span>
                    <span class="creator-tasks">已帮助 {{ task.creatorTasks }} 次</span>
                  </div>
                </div>
              </div>

              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-desc">{{ task.description }}</p>

              <div class="task-location">
                <span class="location-icon">📍</span>
                <span class="location-text">{{ task.location }}</span>
              </div>
            </div>

            <!-- 任务底部 -->
            <div class="task-footer">
              <div class="task-reward-block">
                <span class="reward-label">悬赏</span>
                <span class="reward-value">{{ task.reward }}</span>
                <span class="reward-unit">元</span>
              </div>
              <div class="task-meta">
                <span class="meta-item">
                  <span class="meta-icon">📍</span>
                  {{ task.distance }}m
                </span>
                <span class="meta-item">
                  <span class="meta-icon">👥</span>
                  {{ task.responses }}人响应
                </span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="task-action-bar" v-if="task.status === 'open'">
              <div class="respond-btn" @click.stop="respondToTask(task)">
                <span class="btn-icon">🤝</span>
                <span>我来帮忙</span>
              </div>
            </div>
            <div class="task-action-bar disabled" v-else-if="task.status === 'ongoing'">
              <div class="respond-btn ongoing">
                <span class="btn-icon">⏳</span>
                <span>进行中</span>
              </div>
            </div>
            <div class="task-action-bar completed" v-else>
              <div class="respond-btn done">
                <span class="btn-icon">✅</span>
                <span>已完成</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的任务 -->
      <div class="my-tasks">
        <div class="my-tasks-header">
          <span class="my-tasks-title">📁 我的任务</span>
        </div>
        <div class="my-tasks-tabs">
          <div
            class="my-task-tab"
            :class="{ active: myTaskTab === 'created' }"
            @click="switchMyTaskTab('created')"
          >
            我发起 ({{ myCreatedTasks.length }})
          </div>
          <div
            class="my-task-tab"
            :class="{ active: myTaskTab === 'accepted' }"
            @click="switchMyTaskTab('accepted')"
          >
            我接单 ({{ myAcceptedTasks.length }})
          </div>
          <div
            class="my-task-tab"
            :class="{ active: myTaskTab === 'history' }"
            @click="switchMyTaskTab('history')"
          >
            已完成
          </div>
        </div>

        <div class="my-task-list">
          <div
            class="my-task-item"
            v-for="task in currentMyTasks"
            :key="task.id"
          >
            <div class="my-task-status" :class="'status-' + task.status">
              {{ getStatusName(task.status) }}
            </div>
            <div class="my-task-content">
              <span class="my-task-title">{{ task.title }}</span>
              <span class="my-task-time">{{ task.updateTime }}</span>
            </div>
            <span class="my-task-reward">{{ task.reward }}元</span>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateTo } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const STORAGE_KEY = 'ai_helper_tasks'

const statusBarHeight = ref(20)
const taskInput = ref('')
const selectedType = ref('')
const rewardAmount = ref(0)
const publishTime = ref('now')
const isMatching = ref(false)
const matchingProgress = ref(0)
const matchedCount = ref(0)
const matchResults = ref<any[]>([])
const taskFilter = ref('all')
const myTaskTab = ref('created')

// 是否可以提交
const canSubmit = computed(() => {
  return taskInput.value.trim().length > 0 && selectedType.value !== ''
})

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

// 扩展的任务广场数据（8个不同状态的任务）
const defaultTasks = [
  {
    id: '1',
    type: 'delivery',
    title: '帮忙取个快递',
    description: '菜鸟驿站，3个包裹，有密码，取件码1234',
    reward: 5,
    distance: 150,
    responses: 3,
    creatorName: '小红',
    creatorAvatar: 'https://i.pravatar.cc/100?img=4',
    createTime: '10分钟前',
    status: 'open',
    creatorRating: 4.8,
    creatorTasks: 23,
    location: '阳光社区 菜鸟驿站'
  },
  {
    id: '2',
    type: 'shopping',
    title: '帮忙带份早餐',
    description: '永和大王，豆浆油条套餐，加个煎蛋',
    reward: 8,
    distance: 200,
    responses: 5,
    creatorName: '上班族小王',
    creatorAvatar: 'https://i.pravatar.cc/100?img=5',
    createTime: '20分钟前',
    status: 'open',
    creatorRating: 4.5,
    creatorTasks: 12,
    location: '永和大王 阳光社区店'
  },
  {
    id: '3',
    type: 'pet',
    title: '代遛金毛半小时',
    description: '金毛很温顺，就在楼下花园，疫苗已打',
    reward: 15,
    distance: 80,
    responses: 2,
    creatorName: '铲屎官小刘',
    creatorAvatar: 'https://i.pravatar.cc/100?img=6',
    createTime: '1小时前',
    status: 'ongoing',
    creatorRating: 4.9,
    creatorTasks: 56,
    location: '阳光社区 花园'
  },
  {
    id: '4',
    type: 'child',
    title: '帮忙接孩子',
    description: '阳光小学门口，4点15分，两个孩子，一个书包',
    reward: 30,
    distance: 300,
    responses: 1,
    creatorName: '双职工家庭',
    creatorAvatar: 'https://i.pravatar.cc/100?img=7',
    createTime: '2小时前',
    status: 'completed',
    creatorRating: 4.6,
    creatorTasks: 8,
    location: '阳光小学 门口'
  },
  {
    id: '5',
    type: 'delivery',
    title: '急！取文件快递',
    description: '顺丰快递，生鲜文件，需今天送到家',
    reward: 10,
    distance: 250,
    responses: 4,
    creatorName: '白领张小姐',
    creatorAvatar: 'https://i.pravatar.cc/100?img=9',
    createTime: '30分钟前',
    status: 'open',
    creatorRating: 4.7,
    creatorTasks: 35,
    location: '顺丰速递 社区店'
  },
  {
    id: '6',
    type: 'shopping',
    title: '代买感冒药',
    description: '楼下药店，买感康两盒，可报销',
    reward: 12,
    distance: 50,
    responses: 6,
    creatorName: '独居老人家属',
    creatorAvatar: 'https://i.pravatar.cc/100?img=10',
    createTime: '15分钟前',
    status: 'ongoing',
    creatorRating: 4.3,
    creatorTasks: 5,
    location: '阳光大药房'
  },
  {
    id: '7',
    type: 'pet',
    title: '临时照看猫咪',
    description: '英短蓝猫，2岁，乖巧可爱，需出差3天',
    reward: 80,
    distance: 100,
    responses: 0,
    creatorName: '爱猫人士小林',
    creatorAvatar: 'https://i.pravatar.cc/100?img=11',
    createTime: '3小时前',
    status: 'open',
    creatorRating: 4.8,
    creatorTasks: 42,
    location: '阳光社区 3栋'
  },
  {
    id: '8',
    type: 'child',
    title: '兴趣班接送',
    description: '每周六下午3点，舞蹈班，4点接回',
    reward: 25,
    distance: 400,
    responses: 2,
    creatorName: '辣妈小美',
    creatorAvatar: 'https://i.pravatar.cc/100?img=12',
    createTime: '5小时前',
    status: 'completed',
    creatorRating: 4.9,
    creatorTasks: 67,
    location: '青少年宫'
  }
]

// 从 localStorage 加载任务数据
function loadTasks(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载任务数据失败:', e)
  }
  return [...defaultTasks]
}

// 保存任务数据到 localStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
  } catch (e) {
    console.error('保存任务数据失败:', e)
  }
}

const tasks = ref<any[]>(loadTasks())

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
    toastInfo('请描述您的需求')
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

      // 将新任务添加到任务广场
      const newTask = {
        id: Date.now().toString(),
        type: selectedType.value || 'delivery',
        title: taskInput.value.trim(),
        description: taskInput.value.trim(),
        reward: Number(rewardAmount.value) || 5,
        distance: Math.floor(Math.random() * 500) + 50,
        responses: 0,
        creatorName: '我',
        creatorAvatar: 'https://i.pravatar.cc/100?img=8',
        createTime: '刚刚',
        status: 'open',
        creatorRating: 4.5,
        creatorTasks: 10,
        location: '阳光社区'
      }
      tasks.value.unshift(newTask)
      saveTasks()

      toastSuccess('匹配成功！')
    }
  }, 200)
}

const inviteMatch = (match: any) => {
  if (window.confirm(`确定邀请 ${match.name} 帮助您完成任务吗？`)) {
    toastSuccess('已发送邀请')
  }
}

const filterTasks = (filter: string) => {
  taskFilter.value = filter
}

const switchMyTaskTab = (tab: string) => {
  myTaskTab.value = tab
}

const goToTaskDetail = (task: any) => {
  navigateTo(`/pages/ai-helper/detail?id=${task.id}`)
}

const respondToTask = (task: any) => {
  if (window.confirm('确定要接下这个任务吗？')) {
    task.responses++
    saveTasks()
    toastSuccess('接单成功')
  }
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

onMounted(() => {
  // 页面加载时确保数据从 localStorage 中读取
  tasks.value = loadTasks()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xxl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main {
  display: flex;
  align-items: center;
}

.header-icon {
  font-size: 32px;
  margin-right: var(--spacing-md);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.header-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
}

.header-stats {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 var(--spacing-sm);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.stat-label {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.3);
}

.content {
  height: calc(100vh - 100px);
  overflow-y: auto;
  margin-top: -20px;
  border-radius: 24px 24px 0 0;
  background: var(--bg-color);
  position: relative;
  z-index: 1;
}

/* 快速发起 */
.quick-post {
  background: var(--card-bg);
  margin: var(--spacing-lg);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.quick-post-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.quick-post-icon {
  font-size: 22px;
  margin-right: var(--spacing-sm);
}

.quick-post-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 类型选择器 */
.type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.type-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-sm);
  border-radius: var(--radius-md);
  background: var(--bg-color);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.type-chip .type-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.type-chip .type-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.type-chip.active {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-color: #4CAF50;
}

.type-chip.active .type-name {
  color: #2E7D32;
  font-weight: 500;
}

.input-box {
  background: var(--bg-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  position: relative;
}

.input-textarea {
  width: 100%;
  min-height: 80px;
  font-size: 14px;
  color: var(--text-primary);
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  line-height: 1.6;
}

.input-hint {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: var(--text-muted);
}

/* 发布选项 */
.post-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.option-group {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.reward-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.reward-field {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #4CAF50;
  text-align: center;
  border: none;
  background: transparent;
  outline: none;
  width: 60px;
}

.reward-unit {
  font-size: 14px;
  color: var(--text-muted);
}

.time-selector {
  background: var(--bg-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.time-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 14px;
  color: var(--text-primary);
  border: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

/* 发布按钮 */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn.disabled::before {
  display: none;
}

.submit-btn .btn-icon {
  font-size: 18px;
}

.submit-btn .btn-text {
  font-size: 16px;
  font-weight: 600;
}

.submit-btn .btn-hint {
  font-size: 11px;
  opacity: 0.8;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 10px;
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
  flex-shrink: 0;
}

.result-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  object-fit: cover;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
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
  cursor: pointer;
}

/* 任务广场 */
.task-square {
  padding: var(--spacing-lg);
}

.square-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.square-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.square-filters {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-btn {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.filter-btn.active {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  color: #2E7D32;
  border-color: #4CAF50;
  font-weight: 500;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* 任务卡片 */
.task-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.task-card:hover {
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
  transform: translateY(-2px);
}

.task-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid var(--border-color);
}

.task-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-status-badge .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-open {
  background: #E3F2FD;
  color: #1976D2;
}

.status-open .status-dot {
  background: #1976D2;
  animation: blink 1.5s infinite;
}

.status-ongoing {
  background: #FFF3E0;
  color: #F57C00;
}

.status-ongoing .status-dot {
  background: #F57C00;
}

.status-completed {
  background: #E8F5E9;
  color: #388E3C;
}

.status-completed .status-dot {
  background: #388E3C;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.task-type-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-delivery {
  background: #E3F2FD;
  color: #1976D2;
}

.type-shopping {
  background: #FFF3E0;
  color: #F57C00;
}

.type-pet {
  background: #F3E5F5;
  color: #7B1FA2;
}

.type-child {
  background: #FCE4EC;
  color: #C2185B;
}

.task-body {
  padding: var(--spacing-lg);
}

.task-creator {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.task-creator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: var(--spacing-sm);
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #E8F5E9;
}

.task-creator-info {
  flex: 1;
}

.task-creator-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.task-creator-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 11px;
  color: var(--text-muted);
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.task-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.task-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-color);
  padding: 6px 10px;
  border-radius: 8px;
  width: fit-content;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

.task-reward-block {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.task-reward-block .reward-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-right: 4px;
}

.task-reward-block .reward-value {
  font-size: 22px;
  font-weight: 700;
  color: #4CAF50;
}

.task-reward-block .reward-unit {
  font-size: 13px;
  color: var(--text-muted);
}

.task-meta {
  display: flex;
  gap: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-icon {
  font-size: 12px;
}

.task-action-bar {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.respond-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.respond-btn:active {
  transform: scale(0.98);
}

.respond-btn.ongoing {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.respond-btn.done {
  background: linear-gradient(135deg, #9E9E9E, #757575);
}

.respond-btn .btn-icon {
  font-size: 16px;
}

/* 我的任务 */
.my-tasks {
  padding: var(--spacing-lg);
  padding-bottom: 100px;
}

.my-tasks-header {
  margin-bottom: var(--spacing-md);
}

.my-tasks-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.my-tasks-tabs {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.my-task-tab {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 13px;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.my-task-tab.active {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.my-task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.my-task-item {
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}

.my-task-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.my-task-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-right: var(--spacing-md);
}

.status-open {
  background: #E3F2FD;
  color: #1976D2;
}

.status-ongoing {
  background: #FFF3E0;
  color: #F57C00;
}

.status-completed {
  background: #E8F5E9;
  color: #388E3C;
}

.my-task-content {
  flex: 1;
}

.my-task-title {
  font-size: 14px;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.my-task-time {
  font-size: 12px;
  color: var(--text-muted);
}

.my-task-reward {
  font-size: 16px;
  font-weight: 600;
  color: #4CAF50;
}

.safe-area-bottom {
  height: 20px;
}
</style>