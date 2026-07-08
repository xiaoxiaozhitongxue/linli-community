<template>
  <div class="page">
    <NavBar title="我的任务" />
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
          <div class="task-desc">{{ task.description || '暂无描述' }}</div>
          <div class="task-footer">
            <div class="task-location">
              <AppIcon name="map-pin" :size="12" /> {{ task.location || '未指定地点' }}
            </div>
            <div class="task-reward" v-if="task.reward > 0">
              <AppIcon name="activity" class="reward-icon" />
              <span class="reward-text">¥{{ task.reward }}</span>
            </div>
          </div>
          
          <!-- 发布人的操作按钮 -->
          <div class="task-actions" v-if="currentTab === 'published' && task.status === 'in_progress'">
            <div class="action-btn confirm-btn" @click.stop="confirmTask(task)">
              <span>✅</span> 确认完成
            </div>
          </div>
          
          <!-- 接单人的操作按钮 -->
          <div class="task-actions" v-if="currentTab === 'accepted' && task.status === 'in_progress'">
            <div class="action-btn complete-btn" @click.stop="completeTask(task)">
              <AppIcon name="target" /> 确认完成
            </div>
          </div>
          
          <div class="task-time">
            <span>{{ task.createTime ? formatTimestamp(task.createTime) : '刚刚' }}</span>
          </div>
        </div>
      </div>

      <div class="loading-state" v-else-if="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div class="empty-state" v-else>
        <AppIcon name="bookmark" class="empty-icon" />
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
import { useRoute } from 'vue-router'
import { navigateTo, navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'
import { taskService } from '../../services/taskService'
import { getTaskStatusLabel, normalizeTaskStatus } from '../../constants/status'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'

const statusBarHeight = ref(20)
const currentTab = ref('published')
const statusFilter = ref('all')
const loading = ref(false)

const publishedTasks = ref<any[]>([])
const acceptedTasks = ref<any[]>([])

function mapTask(t: any): any {
  return {
    id: t.id,
    type: t.category || t.type || 'other',
    title: t.title || '任务详情',
    description: t.description || '',
    reward: Number(t.reward) || 0,
    location: t.location || '',
    status: normalizeStatus(t.status),
    createTime: t.created_at || Date.now(),
    updateTime: t.updated_at || t.created_at || Date.now()
  }
}

function normalizeStatus(status: string): string {
  return normalizeTaskStatus(status)
}

async function loadTasks() {
  loading.value = true
  try {
    const result = await taskService.getMyTasks()
    publishedTasks.value = (result.published || []).map(mapTask)
    acceptedTasks.value = (result.accepted || []).map(mapTask)
  } catch {
    toastInfo('加载任务失败')
  } finally {
    loading.value = false
  }
}

const currentTasks = computed(() => {
  if (currentTab.value === 'published') return publishedTasks.value
  return acceptedTasks.value
})

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') return currentTasks.value
  return currentTasks.value.filter((t: any) => t.status === statusFilter.value)
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
    delivery: '快递取送',
    help: '帮忙',
    companionship: '陪护',
    pet: '宠物',
    child: '儿童',
    other: '其他'
  }
  return map[category] || '其他'
}

const getStatusName = (status: string) => getTaskStatusLabel(status)

function formatTimestamp(ts: number): string {
  const d = new Date(ts > 1e12 ? ts : ts * 1000)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const switchTab = (tab: string) => {
  currentTab.value = tab
  statusFilter.value = 'all'
  loadTasks()
}

const completeTask = async (task: any) => {
  if (!window.confirm('确定要提交完成申请吗？')) return
  try {
    await taskService.completeTask(task.id)
    toastSuccess('已提交完成申请')
    await loadTasks()
  } catch (e: any) {
    toastInfo(e?.message || '操作失败，请稍后重试')
  }
}

const confirmTask = async (task: any) => {
  if (!window.confirm('确认任务已完成吗？')) return
  try {
    await taskService.completeTask(task.id)
    toastSuccess('任务已完成！感谢互帮互助')
    await loadTasks()
  } catch (e: any) {
    toastInfo(e?.message || '操作失败，请稍后重试')
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

onMounted(async () => {
  statusBarHeight.value = 20
  const route = useRoute()
  // 读取URL参数：?type=published|accepted 切换tab
  const typeParam = route.query.type as string
  if (typeParam === 'accepted') {
    currentTab.value = 'accepted'
  }
  // 读取URL参数：?status=pending|in_progress|completed 切换筛选
  const statusParam = route.query.status as string
  if (['pending', 'in_progress', 'completed'].includes(statusParam)) {
    statusFilter.value = statusParam
  }
  await loadTasks()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.tab-bar {
  display: flex;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
  padding: 0 20px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  color: var(--color-text-tertiary);
  font-size: 15px;
  cursor: pointer;
  position: relative;
  transition: all var(--transition-normal);
}

.tab-item.active {
  color: var(--color-primary);
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
  background: var(--color-primary);
  border-radius: var(--radius-sm);
}

.tab-count {
  display: inline-block;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
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

.category-help {
  background: #FFF3E0;
  color: #FF9800;
}

.category-companionship {
  background: #E8F5E9;
  color: #4CAF50;
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

.status-pending {
  background: #E3F2FD;
  color: #1976D2;
}

.status-in_progress {
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

.status-cancelled {
  background: #ECEFF1;
  color: #607D8B;
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
  background: var(--theme-activity-gradient);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: 60px 20px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
