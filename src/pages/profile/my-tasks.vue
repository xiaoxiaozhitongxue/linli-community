<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">←</span>
        <span class="header-title">我的任务</span>
        <span class="placeholder"></span>
      </div>
      <div class="tab-bar">
        <div 
          class="tab-item" 
          :class="{ active: currentTab === 'published' }"
          @click="switchTab('published')"
        >
          我发布的
          <span class="tab-count" v-if="publishedTasks.length > 0">{{ publishedTasks.length }}</span>
        </div>
        <div 
          class="tab-item" 
          :class="{ active: currentTab === 'accepted' }"
          @click="switchTab('accepted')"
        >
          我接的单
          <span class="tab-count" v-if="acceptedTasks.length > 0">{{ acceptedTasks.length }}</span>
        </div>
      </div>
    </div>

    <div class="content">
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
          :class="{ active: statusFilter === 'open' }"
          @click="statusFilter = 'open'"
        >
          待接单
        </div>
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'ongoing' }"
          @click="statusFilter = 'ongoing'"
        >
          进行中
        </div>
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'pending_confirm' }"
          @click="statusFilter = 'pending_confirm'"
        >
          待确认
        </div>
        <div 
          class="filter-item" 
          :class="{ active: statusFilter === 'completed' }"
          @click="statusFilter = 'completed'"
        >
          已完成
        </div>
      </div>

      <div class="task-list" v-if="filteredTasks.length > 0">
        <div class="task-card" v-for="task in filteredTasks" :key="task.id" @click="goToTaskDetail(task.id)">
          <div class="task-header">
            <span class="task-category" :class="'category-' + task.type">
              {{ getCategoryName(task.type) }}
            </span>
            <span class="task-status" :class="'status-' + task.status">
              {{ getStatusName(task.status) }}
            </span>
          </div>
          <div class="task-title">{{ task.title }}</div>
          <div class="task-desc">{{ task.description }}</div>
          <div class="task-footer">
            <div class="task-location">
              <span>📍 {{ task.location || '未指定地点' }}</span>
            </div>
            <div class="task-reward" v-if="task.reward">
              <span class="reward-icon">💰</span>
              <span class="reward-text">¥{{ task.reward }}</span>
            </div>
          </div>
          
          <!-- 发布人的操作按钮 -->
          <div class="task-actions" v-if="currentTab === 'published' && task.status === 'pending_confirm'">
            <div class="action-btn confirm-btn" @click.stop="confirmTask(task)">
              <span>✅</span> 确认完成
            </div>
          </div>
          
          <!-- 接单人的操作按钮 -->
          <div class="task-actions" v-if="currentTab === 'accepted' && task.status === 'ongoing'">
            <div class="action-btn complete-btn" @click.stop="completeTask(task)">
              <span>🎯</span> 确认完成
            </div>
          </div>
          
          <div class="task-time">
            <span>{{ task.updateTime || task.createTime || '刚刚' }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <span class="empty-icon">📋</span>
        <span class="empty-text">{{ getEmptyText() }}</span>
        <div class="btn btn-primary" @click="goToHelperPage" v-if="currentTab === 'accepted'">
          去任务广场看看
        </div>
      </div>
      
      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateTo, navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const STORAGE_KEY = 'ai_helper_tasks'
const MY_CREATED_TASKS_KEY = 'ai_helper_my_created_tasks'
const MY_ACCEPTED_TASKS_KEY = 'ai_helper_my_accepted_tasks'

const statusBarHeight = ref(20)
const currentTab = ref('published')
const statusFilter = ref('all')

const publishedTasks = ref<any[]>([])
const acceptedTasks = ref<any[]>([])

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

function saveToStorage(key: string, data: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`保存数据失败: ${key}`, e)
  }
}

function loadTasks() {
  publishedTasks.value = loadFromStorage(MY_CREATED_TASKS_KEY, [])
  acceptedTasks.value = loadFromStorage(MY_ACCEPTED_TASKS_KEY, [])
  
  // 同时从任务广场加载数据
  const allTasks = loadFromStorage(STORAGE_KEY, [])
  
  // 合并数据，确保显示最新状态
  allTasks.forEach(task => {
    // 更新我发布的任务状态
    const publishedIndex = publishedTasks.value.findIndex(t => t.id === task.id)
    if (publishedIndex !== -1) {
      publishedTasks.value[publishedIndex] = {
        ...publishedTasks.value[publishedIndex],
        ...task
      }
    }
    
    // 更新我接受的任务状态
    const acceptedIndex = acceptedTasks.value.findIndex(t => t.id === task.id)
    if (acceptedIndex !== -1) {
      acceptedTasks.value[acceptedIndex] = {
        ...acceptedTasks.value[acceptedIndex],
        ...task
      }
    }
  })
}

const currentTasks = computed(() => {
  if (currentTab.value === 'published') {
    return publishedTasks.value
  }
  return acceptedTasks.value
})

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') {
    return currentTasks.value
  }
  return currentTasks.value.filter(t => t.status === statusFilter.value)
})

const getEmptyText = () => {
  if (currentTab.value === 'published') {
    if (statusFilter.value === 'all') return '暂无发布的任务'
    return `暂无${getStatusName(statusFilter.value)}的任务`
  } else {
    if (statusFilter.value === 'all') return '还没有接过任务哦'
    return `暂无${getStatusName(statusFilter.value)}的任务`
  }
}

const getCategoryName = (category: string) => {
  const map: Record<string, string> = {
    shopping: '代购',
    delivery: '快递',
    pet: '宠物',
    child: '儿童',
    other: '其他'
  }
  return map[category] || '其他'
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

const switchTab = (tab: string) => {
  currentTab.value = tab
  statusFilter.value = 'all'
  loadTasks()
}

// 接单人完成任务
const completeTask = (task: any) => {
  if (window.confirm('确定要提交完成申请吗？')) {
    // 更新任务状态为待确认
    const taskIndex = acceptedTasks.value.findIndex(t => t.id === task.id)
    if (taskIndex !== -1) {
      acceptedTasks.value[taskIndex].status = 'pending_confirm'
      acceptedTasks.value[taskIndex].updateTime = '刚刚'
      saveToStorage(MY_ACCEPTED_TASKS_KEY, acceptedTasks.value)
      
      // 同时更新任务广场的数据
      const allTasks = loadFromStorage(STORAGE_KEY, [])
      const allTaskIndex = allTasks.findIndex(t => t.id === task.id)
      if (allTaskIndex !== -1) {
        allTasks[allTaskIndex].status = 'pending_confirm'
        allTasks[allTaskIndex].updateTime = '刚刚'
        saveToStorage(STORAGE_KEY, allTasks)
      }
      
      toastSuccess('已提交完成申请，等待发布人确认')
      
      // 刷新数据
      loadTasks()
    }
  }
}

// 发布人确认完成
const confirmTask = (task: any) => {
  if (window.confirm('确认任务已完成吗？')) {
    // 更新任务状态为已完成
    const taskIndex = publishedTasks.value.findIndex(t => t.id === task.id)
    if (taskIndex !== -1) {
      publishedTasks.value[taskIndex].status = 'completed'
      publishedTasks.value[taskIndex].updateTime = '刚刚'
      saveToStorage(MY_CREATED_TASKS_KEY, publishedTasks.value)
      
      // 同时更新任务广场的数据
      const allTasks = loadFromStorage(STORAGE_KEY, [])
      const allTaskIndex = allTasks.findIndex(t => t.id === task.id)
      if (allTaskIndex !== -1) {
        allTasks[allTaskIndex].status = 'completed'
        allTasks[allTaskIndex].updateTime = '刚刚'
        saveToStorage(STORAGE_KEY, allTasks)
      }
      
      toastSuccess('任务已完成！感谢互帮互助')
      
      // 刷新数据
      loadTasks()
    }
  }
}

const goBack = () => {
  navigateBackSmart()
}

const goToTaskDetail = (id: string) => {
  navigateTo(`/pages/ai-helper/detail?id=${id}`)
}

const goToHelperPage = () => {
  navigateTo('/pages/ai-helper/index')
}

onMounted(() => {
  statusBarHeight.value = 20
  loadTasks()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.header {
  background: var(--color-primary-gradient);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  color: var(--color-text-white);
}

.back-btn {
  font-size: 28px;
  font-weight: 300;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
  padding: 4px;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.placeholder {
  width: 28px;
}

.tab-bar {
  display: flex;
  padding: 0 20px;
  padding-bottom: 12px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  cursor: pointer;
  position: relative;
  transition: all var(--transition-normal);
}

.tab-item.active {
  color: var(--color-text-white);
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
  background: var(--color-text-white);
  border-radius: var(--radius-sm);
}

.tab-count {
  display: inline-block;
  background: rgba(255, 255, 255, 0.3);
  color: var(--color-text-white);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-left: 4px;
}

.content {
  padding: 20px;
}

.filter-bar {
  display: flex;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.filter-item {
  flex: 1;
  min-width: 60px;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.filter-item:hover {
  background-color: var(--color-bg-tertiary);
}

.filter-item.active {
  background: var(--color-primary);
  color: var(--color-text-white);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.task-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.category-shopping {
  background: #E3F2FD;
  color: #2196F3;
}

.category-delivery {
  background: #FCE4EC;
  color: #E91E63;
}

.category-pet {
  background: #F3E5F5;
  color: #9C27B0;
}

.category-child {
  background: #FCE4EC;
  color: #C2185B;
}

.category-other {
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

.task-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.status-open {
  background: #E3F2FD;
  color: #1976D2;
}

.status-ongoing {
  background: #FFF3E0;
  color: #FF9800;
}

.status-pending_confirm {
  background: #F3E5F5;
  color: #9C27B0;
}

.status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.task-desc {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-location {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.task-reward {
  display: flex;
  align-items: center;
}

.reward-icon {
  font-size: 12px;
}

.reward-text {
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn:active {
  transform: scale(0.98);
}

.complete-btn {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  box-shadow: var(--shadow-sm);
}

.confirm-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: var(--color-text-white);
  box-shadow: var(--shadow-sm);
}

.task-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
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
  color: var(--color-text-tertiary);
  margin-bottom: 16px;
  text-align: center;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

.safe-area-bottom {
  height: 100px;
}
</style>
