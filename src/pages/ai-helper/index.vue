<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <div class="header-main">
          <div class="header-icon-wrap">
            <span class="header-icon">🤝</span>
          </div>
          <div class="header-text">
            <span class="header-title">互助</span>
            <span class="header-subtitle">邻里互帮，传递温暖</span>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ openTaskCount }}</span>
            <span class="stat-label">待接单</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ todayCount }}</span>
            <span class="stat-label">今日</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="content-inner">
        <!-- 任务广场 -->
        <div class="task-square">
          <!-- 任务分类筛选 -->
          <div class="category-bar">
            <div class="category-scroll">
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'all' }"
                @click="selectCategory('all')"
              >
                <span class="category-icon">📋</span>
                <span class="category-name">全部</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'delivery' }"
                @click="selectCategory('delivery')"
              >
                <span class="category-icon">📦</span>
                <span class="category-name">取快递</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'shopping' }"
                @click="selectCategory('shopping')"
              >
                <span class="category-icon">🛒</span>
                <span class="category-name">买菜</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'pet' }"
                @click="selectCategory('pet')"
              >
                <span class="category-icon">🐕</span>
                <span class="category-name">遛狗</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'child' }"
                @click="selectCategory('child')"
              >
                <span class="category-icon">👶</span>
                <span class="category-name">接孩子</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'other' }"
                @click="selectCategory('other')"
              >
                <span class="category-icon">📝</span>
                <span class="category-name">其他</span>
              </div>
            </div>
          </div>

          <!-- 状态筛选 -->
          <div class="status-filter-bar">
            <div class="status-filters">
              <div
                class="status-filter-btn"
                :class="{ active: statusFilter === 'open' }"
                @click="setStatusFilter('open')"
              >
                <span class="status-dot open-dot"></span>
                待接单
                <span class="status-count" v-if="getCategoryOpenCount(selectedCategory) > 0">
                  {{ getCategoryOpenCount(selectedCategory) }}
                </span>
              </div>
              <div
                class="status-filter-btn"
                :class="{ active: statusFilter === 'all' }"
                @click="setStatusFilter('all')"
              >
                全部任务
              </div>
            </div>
            <div class="filter-hint" v-if="statusFilter === 'open'">
              只显示可接的任务
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="task-list" v-if="filteredTasks.length > 0">
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
                <div class="respond-btn" @click.stop="respondToTask(task, $event)">
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
              <div class="task-action-bar completed" v-else-if="task.status === 'pending_confirm'">
                <div class="respond-btn pending">
                  <span class="btn-icon">🎯</span>
                  <span>待确认</span>
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

          <!-- 空状态 -->
          <div class="empty-state" v-else>
            <span class="empty-icon">🔍</span>
            <span class="empty-text">暂无{{ getCategoryName(selectedCategory) }}任务</span>
            <span class="empty-hint">试试其他分类或切换到全部任务</span>
          </div>

          <div class="safe-area-bottom"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateTo, getUserStorageKey } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const STORAGE_KEY = 'ai_helper_tasks'
const MY_CREATED_TASKS_KEY = 'ai_helper_my_created_tasks'
const MY_ACCEPTED_TASKS_KEY = 'ai_helper_my_accepted_tasks'

const statusBarHeight = ref(20)
const selectedCategory = ref('all')  // 默认选择全部分类
const statusFilter = ref('open')     // 默认只显示待接单任务

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
    reward: 25,
    distance: 300,
    responses: 1,
    creatorName: '双职工家庭',
    creatorAvatar: 'https://i.pravatar.cc/100?img=7',
    createTime: '2小时前',
    status: 'open',
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
    status: 'open',
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
    status: 'open',
    creatorRating: 4.9,
    creatorTasks: 67,
    location: '青少年宫'
  }
]

const defaultMyCreatedTasks = [
  { id: '1', title: '取快递', reward: 5, status: 'ongoing', updateTime: '进行中' },
  { id: '2', title: '带早餐', reward: 8, status: 'completed', updateTime: '已完成' }
]

const defaultMyAcceptedTasks = [
  { id: '3', title: '帮取快递', reward: 5, status: 'ongoing', updateTime: '进行中' }
]

// 获取用户数据键名
function getUserDataKey(prefix: string): string {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    return `${prefix}_${user.phone}`
  }
  return prefix
}

// 从 localStorage 加载数据
function loadFromStorage(key: string, defaultValue: any[]) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error(`加载数据失败: ${key}`, e)
  }
  return [...defaultValue]
}

// 保存数据到 localStorage
function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`保存数据失败: ${key}`, e)
  }
}

const tasks = ref<any[]>([])
const myCreatedTasks = ref<any[]>([])
const myAcceptedTasks = ref<any[]>([])

// 规范化状态值：后端可能用 pending/in_progress/completed 等
function normalizeStatus(status: string): string {
  if (!status) return 'open'
  const s = String(status).toLowerCase()
  if (s === 'open' || s === 'pending') return 'open'
  if (s === 'in_progress' || s === 'ongoing' || s === 'accepted') return 'ongoing'
  if (s === 'completed' || s === 'done') return 'completed'
  return 'open'
}

// 把后端 API 返回的任务对象映射到前端 UI 字段
function mapApiTask(t: any): any {
  return {
    id: t.id,
    type: t.category || t.type || 'other',
    title: t.title || '任务详情',
    description: t.description || '',
    reward: Number(t.reward) || 0,
    distance: t.distance || 0,
    responses: t.responses || 0,
    creatorName: t.creator?.nickname || t.creatorName || '邻居',
    creatorAvatar: t.creator?.avatar || t.creatorAvatar || '',
    createTime: t.created_at || t.createTime || Date.now(),
    status: normalizeStatus(t.status),
    creatorRating: t.creator?.credit_score || t.creatorRating || 4.8,
    creatorTasks: t.creator?.completed_count || t.creatorTasks || 0,
    location: t.location || ''
  }
}

// 尝试从后端获取任务列表
async function fetchTasksFromApi(): Promise<any[] | null> {
  try {
    const res = await fetch('/functions/api/tasks?limit=20&sort=created_at')
    if (!res.ok) return null
    const json = await res.json()
    if (json && Array.isArray(json.data)) {
      return json.data.map(mapApiTask)
    }
    if (json && json.data && Array.isArray(json.data.items)) {
      return json.data.items.map(mapApiTask)
    }
  } catch (e) {
    // ignore, fallback to local
  }
  return null
}

// 统计数据
const openTaskCount = computed(() => {
  return tasks.value.filter(t => t.status === 'open').length
})

const todayCount = computed(() => {
  // 简化统计：今天发布的任务数
  return tasks.value.filter(t => {
    return t.status === 'open' || t.status === 'ongoing'
  }).length
})

// 获取分类名称
const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    all: '',
    delivery: '取快递',
    shopping: '买菜',
    pet: '遛狗',
    child: '接孩子',
    other: '其他'
  }
  return map[category] || ''
}

// 获取某个分类的待接单任务数量
const getCategoryOpenCount = (category: string) => {
  if (category === 'all') {
    return openTaskCount.value
  }
  return tasks.value.filter(t => 
    t.type === category && t.status === 'open'
  ).length
}

// 筛选任务
const filteredTasks = computed(() => {
  let result = [...tasks.value]
  
  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(t => t.type === selectedCategory.value)
  }
  
  // 按状态筛选（默认只显示待接单）
  if (statusFilter.value !== 'all') {
    result = result.filter(t => t.status === statusFilter.value)
  }
  
  // 按时间排序（最新的在前）
  result.sort((a, b) => {
    const timeA = new Date(a.createTime).getTime() || 0
    const timeB = new Date(b.createTime).getTime() || 0
    return timeB - timeA
  })
  
  return result
})

// 选择分类
const selectCategory = (category: string) => {
  selectedCategory.value = category
}

// 设置状态筛选
const setStatusFilter = (status: string) => {
  statusFilter.value = status
}

const goToTaskDetail = (task: any) => {
  navigateTo(`/pages/ai-helper/detail?id=${task.id}`)
}

const respondToTask = (task: any, event: Event) => {
  event.stopPropagation()
  if (window.confirm('确定要接下这个任务吗？')) {
    const userTaskKey = getUserStorageKey('ai_helper_tasks')
    const userAcceptedKey = getUserStorageKey('ai_helper_my_accepted_tasks')

    // 更新任务列表
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value[index].responses++
      tasks.value[index].status = 'ongoing'
      saveToStorage(userTaskKey, tasks.value)

      // 添加到我的接单任务
      const myNewAcceptedTask = {
        id: task.id,
        title: task.title,
        reward: task.reward,
        status: 'ongoing',
        updateTime: '刚刚'
      }
      myAcceptedTasks.value.unshift(myNewAcceptedTask)
      saveToStorage(userAcceptedKey, myAcceptedTasks.value)

      toastSuccess('接单成功')
    }
  }
}

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    delivery: '取快递',
    shopping: '买菜',
    pet: '遛狗',
    child: '接孩子',
    other: '其他'
  }
  return map[type] || type
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    open: '待接单',
    ongoing: '进行中',
    pending_confirm: '待确认',
    completed: '已完成'
  }
  return map[status] || status
}

onMounted(async () => {
  // 优先尝试从 API 获取任务
  const apiTasks = await fetchTasksFromApi()
  if (apiTasks && apiTasks.length > 0) {
    tasks.value = apiTasks
  } else {
    // 页面加载时使用用户专属键读取数据（localStorage 回退）
    const userTaskKey = getUserStorageKey('ai_helper_tasks')
    const userCreatedKey = getUserStorageKey('ai_helper_my_created_tasks')
    const userAcceptedKey = getUserStorageKey('ai_helper_my_accepted_tasks')

    tasks.value = loadFromStorage(userTaskKey, [])
    myCreatedTasks.value = loadFromStorage(userCreatedKey, [])
    myAcceptedTasks.value = loadFromStorage(userAcceptedKey, [])
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  width: 100%;
}

.header {
  background: var(--color-primary-gradient);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-2xl);
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-main {
  display: flex;
  align-items: center;
}

.header-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  margin-right: var(--spacing-md);
  backdrop-filter: blur(10px);
}

.header-icon {
  font-size: 28px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-white);
  margin-bottom: 2px;
}

.header-subtitle {
  font-size: var(--font-size-sm);
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
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-white);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: rgba(255,255,255,0.8);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.3);
}

.content {
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  margin-top: -20px;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  background: var(--color-bg-primary);
  position: relative;
  z-index: 1;
  width: 100%;
}

.content-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* 任务广场 */
.task-square {
  padding: var(--spacing-lg);
  padding-top: var(--spacing-xl);
}

/* 分类标签栏 */
.category-bar {
  margin-bottom: var(--spacing-lg);
}

.category-scroll {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-smooth);
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.category-item.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.category-icon {
  font-size: 18px;
}

.category-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* 状态筛选栏 */
.status-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.status-filters {
  display: flex;
  gap: var(--spacing-sm);
}

.status-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.status-filter-btn.active {
  background: var(--color-info-soft);
  color: var(--color-info);
  font-weight: var(--font-weight-medium);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.open-dot {
  background: var(--color-info);
}

.status-count {
  background: var(--color-info);
  color: var(--color-text-white);
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
}

.filter-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .task-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .task-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .task-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 任务卡片 */
.task-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-smooth);
  border: 1px solid var(--color-border-light);
}

.task-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.task-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border-light);
}

.task-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.task-status-badge .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-open {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.status-open .status-dot {
  background: var(--color-info);
  animation: blink 1.5s infinite;
}

.status-ongoing {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.status-ongoing .status-dot {
  background: var(--color-warning);
}

.status-pending_confirm {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.status-pending_confirm .status-dot {
  background: var(--color-primary);
}

.status-completed {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.status-completed .status-dot {
  background: var(--color-success);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.task-type-tag {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.type-delivery {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.type-shopping {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.type-pet {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.type-child {
  background: var(--color-error-soft);
  color: var(--color-error);
}

.type-other {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
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
  border: 2px solid var(--color-primary-soft);
}

.task-creator-info {
  flex: 1;
}

.task-creator-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.task-creator-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.task-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.task-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.task-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-tertiary);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  width: fit-content;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-tertiary);
  border-top: 1px solid var(--color-border-light);
}

.task-reward-block {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.task-reward-block .reward-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-right: 4px;
}

.task-reward-block .reward-value {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.task-reward-block .reward-unit {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.task-meta {
  display: flex;
  gap: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.meta-icon {
  font-size: var(--font-size-xs);
}

.task-action-bar {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.respond-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.respond-btn:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-1px);
}

.respond-btn:active {
  transform: scale(0.98);
}

.respond-btn.ongoing {
  background: linear-gradient(135deg, var(--color-warning), #F57C00);
}

.respond-btn.pending {
  background: linear-gradient(135deg, var(--color-primary), #E55A2B);
}

.respond-btn.done {
  background: linear-gradient(135deg, var(--color-success), #22c55e);
}

.respond-btn .btn-icon {
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.empty-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  opacity: 0.7;
}

.safe-area-bottom {
  height: 100px;
}
</style>
