<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">‹</span>
        <span class="header-title">我的任务</span>
      </div>
      <div class="tab-bar">
        <div 
          class="tab-item" 
          :class="{ active: currentTab === 'published' }"
          @click="switchTab('published')"
        >
          我发布的
        </div>
        <div 
          class="tab-item" 
          :class="{ active: currentTab === 'accepted' }"
          @click="switchTab('accepted')"
        >
          我接受的
        </div>
      </div>
    </div>

    <div class="content" scroll-y>
      <!-- 任务状态筛选 -->
      <div class="filter-bar">
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          全部
        </div>
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'pending' }"
          @click="statusFilter = 'pending'"
        >
          待接单
        </div>
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'in_progress' }"
          @click="statusFilter = 'in_progress'"
        >
          进行中
        </div>
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'completed' }"
          @click="statusFilter = 'completed'"
        >
          已完成
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="task-list" v-if="filteredTasks.length > 0">
        <div class="task-card" v-for="task in filteredTasks" :key="task.id" @click="goToTaskDetail(task.id)">
          <div class="task-header">
            <span class="task-category" :class="'category-' + task.category">
              {{ getCategoryName(task.category) }}
            </span>
            <span class="task-status" :class="'status-' + task.status">
              {{ getStatusName(task.status) }}
            </span>
          </div>
          <div class="task-title">{{ task.title }}</div>
          <div class="task-desc">{{ task.description }}</div>
          <div class="task-footer">
            <div class="task-location">
              <span>📍 {{ task.location }}</span>
            </div>
            <div class="task-reward" v-if="task.reward">
              <span class="reward-icon">🎁</span>
              <span class="reward-text">{{ task.reward }}</span>
            </div>
          </div>
          <div class="task-time">
            {{ formatTime(task.created_at) }}
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <span class="empty-icon">📋</span>
        <span class="empty-text">暂无任务</span>
        <div class="btn btn-primary" @click="goToPublishTask">
          发布任务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { tasksApi, Task } from '../../utils/api'
import { navigateTo } from '../../utils/router'
import { toastInfo } from '../../utils/toast'

const statusBarHeight = ref(20)
const currentTab = ref('published')
const statusFilter = ref('all')
const loading = ref(false)

const tasks = ref<Task[]>([])

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(t => t.status === statusFilter.value)
})

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    shopping: '代购',
    delivery: '快递',
    help: '帮忙',
    companionship: '陪护',
    other: '其他'
  }
  return map[category] || '其他'
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待接单',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return Math.floor(diff / 86400000) + '天前'
}

const switchTab = (tab: string) => {
  currentTab.value = tab
  statusFilter.value = 'all'
  loadTasks()
}

const loadTasks = async () => {
  try {
    loading.value = true
    const res = await tasksApi.getMyTasks({ 
      type: currentTab.value as 'published' | 'accepted' | 'all'
    }) as any
    tasks.value = res.items || []
  } catch (error) {
    console.error('加载任务失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const goToTaskDetail = (id: string) => {
  navigateTo(`/pages/ai-helper/detail?id=${id}`)
}

const goToPublishTask = () => {
  navigateTo('/pages/ai-helper/publish')
}

onMounted(() => {
  statusBarHeight.value = 20
  loadTasks()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.header-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  color: white;
}

.back-btn {
  font-size: 28px;
  font-weight: 300;
  margin-right: var(--spacing-md);
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.tab-bar {
  display: flex;
  padding: 0 var(--spacing-lg);
  padding-bottom: var(--spacing-md);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm) 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: white;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: white;
  border-radius: 2px;
}

.content {
  padding: var(--spacing-lg);
}

.filter-bar {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-sm) 0;
  font-size: 13px;
  color: var(--text-muted);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.filter-item.active {
  background: var(--primary-color);
  color: white;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.task-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.task-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
}

.category-shopping {
  background: #E3F2FD;
  color: #2196F3;
}

.category-delivery {
  background: #FCE4EC;
  color: #E91E63;
}

.category-help {
  background: #E8F5E9;
  color: #4CAF50;
}

.category-companionship {
  background: #FFF3E0;
  color: #FF9800;
}

.category-other {
  background: #F5F5F5;
  color: #9E9E9E;
}

.task-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
}

.status-pending {
  background: #FFF3E0;
  color: #FF9800;
}

.status-in_progress {
  background: #E3F2FD;
  color: #2196F3;
}

.status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-cancelled {
  background: #FFEBEE;
  color: #F44336;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.task-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.task-location {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-reward {
  display: flex;
  align-items: center;
}

.reward-icon {
  font-size: 12px;
}

.reward-text {
  font-size: 13px;
  color: #FF8C42;
  font-weight: 500;
}

.task-time {
  font-size: 11px;
  color: var(--text-muted);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}
</style>
