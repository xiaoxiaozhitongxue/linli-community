<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-nav">
        <span class="back-btn" @click="goBack">←</span>
        <span class="header-title">任务详情</span>
        <span class="more-btn">⋮</span>
      </div>
    </div>

    <div class="content" style="overflow-y: auto; padding-bottom: 80px;">
      <!-- 任务信息 -->
      <div class="task-card">
        <div class="task-type-tag" :class="'type-' + task.type">
          {{ getTypeName(task.type) }}
        </div>
        <span class="task-title">{{ task.title }}</span>
        <span class="task-desc">{{ task.description }}</span>

        <div class="task-reward">
          <span class="reward-label">悬赏金额</span>
          <span class="reward-value">¥{{ task.reward }}</span>
        </div>
      </div>

      <!-- 发布者信息 -->
      <div class="section">
        <div class="section-title">发布者</div>
        <div class="creator-card">
          <img class="creator-avatar" :src="task.creatorAvatar" />
          <div class="creator-info">
            <span class="creator-name">{{ task.creatorName }}</span>
            <div class="creator-stats">
              <span>⭐ {{ task.creatorRating }}</span>
              <span>✅ {{ task.creatorTasks }}单完成</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 任务信息 -->
      <div class="section">
        <div class="section-title">任务信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">发布时间</span>
            <span class="info-value">{{ task.createTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">任务地点</span>
            <span class="info-value">📍 {{ task.location }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">距离您</span>
            <span class="info-value">{{ task.distance }}米</span>
          </div>
          <div class="info-item">
            <span class="info-label">响应人数</span>
            <span class="info-value">{{ task.responses }}人</span>
          </div>
          <div class="info-item" v-if="task.status">
            <span class="info-label">任务状态</span>
            <span class="info-value status-badge" :class="'status-' + task.status">
              {{ getStatusName(task.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 已响应的人 -->
      <div class="section" v-if="task.responses > 0">
        <div class="section-title">已响应 ({{ task.responses }})</div>
        <div class="responders-list">
          <div class="responder-item" v-for="responder in responders" :key="responder.id">
            <img class="responder-avatar" :src="responder.avatar" />
            <div class="responder-info">
              <span class="responder-name">{{ responder.name }}</span>
              <span class="responder-stats">⭐ {{ responder.rating }} · {{ responder.completedTasks }}单</span>
            </div>
            <div class="select-btn" @click="selectResponder(responder)">选择</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-action">
      <div class="action-buttons">
        <div class="contact-btn" @click="contactCreator">
          <span>💬</span>
          <span>联系发布者</span>
        </div>
        <div
          class="accept-btn"
          :class="{ completed: task.status === 'completed' }"
          @click="handleAction"
        >
          <span>{{ actionButtonText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBack } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const STORAGE_KEY = 'ai_helper_tasks'

const route = useRoute()
const statusBarHeight = ref(20)

const task = ref({
  id: '1',
  type: 'delivery',
  title: '帮忙取个快递',
  description: '菜鸟驿站，3个包裹，有密码。取件码：12-3-5678',
  reward: 5,
  location: '阳光社区 菜鸟驿站',
  distance: 150,
  responses: 3,
  createTime: '10分钟前',
  creatorName: '小红',
  creatorAvatar: 'https://i.pravatar.cc/100?img=4',
  creatorRating: 4.8,
  creatorTasks: 23,
  status: 'open'
})

const responders = ref([
  {
    id: '1',
    name: '王阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 4.9,
    completedTasks: 89
  },
  {
    id: '2',
    name: '小李',
    avatar: 'https://i.pravatar.cc/100?img=2',
    rating: 4.8,
    completedTasks: 56
  }
])

// 是否已接单
const isAccepted = ref(false)

const actionButtonText = computed(() => {
  if (task.value.status === 'completed') return '任务已完成'
  if (isAccepted.value) return '完成任务'
  return '接单'
})

function loadTasks(): any[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载任务数据失败:', e)
  }
  return []
}

function saveTasks(tasks: any[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('保存任务数据失败:', e)
  }
}

onMounted(() => {
  // 从 URL 参数获取任务 ID
  const taskId = (route.query.id as string) || '1'

  // 从 localStorage 加载任务数据
  const tasks = loadTasks()
  const found = tasks.find(t => t.id === taskId)
  if (found) {
    task.value = { ...task.value, ...found }
  }
})

const goBack = () => {
  navigateBack()
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

const contactCreator = () => {
  toastInfo('联系功能开发中')
}

const selectResponder = (responder: any) => {
  if (window.confirm(`确定选择 ${responder.name} 来完成此任务吗？`)) {
    toastSuccess('已选择')
  }
}

const handleAction = () => {
  if (task.value.status === 'completed') {
    toastInfo('该任务已完成')
    return
  }

  if (isAccepted.value) {
    // 完成任务
    if (window.confirm('确定标记此任务为已完成吗？')) {
      task.value.status = 'completed'
      isAccepted.value = false

      // 更新 localStorage 中的任务状态
      const tasks = loadTasks()
      const index = tasks.findIndex(t => t.id === task.value.id)
      if (index !== -1) {
        tasks[index].status = 'completed'
        saveTasks(tasks)
      }

      toastSuccess('任务已完成')
      setTimeout(() => {
        navigateBack()
      }, 1500)
    }
  } else {
    // 接单
    if (window.confirm('确定要接下这个任务吗？')) {
      isAccepted.value = true
      task.value.status = 'ongoing'
      task.value.responses++

      // 更新 localStorage 中的任务状态
      const tasks = loadTasks()
      const index = tasks.findIndex(t => t.id === task.value.id)
      if (index !== -1) {
        tasks[index].status = 'ongoing'
        tasks[index].responses = task.value.responses
        saveTasks(tasks)
      }

      toastSuccess('接单成功')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 20px;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.more-btn {
  font-size: 18px;
  cursor: pointer;
}

.content {
  height: calc(100vh);
  overflow-y: auto;
}

.task-card {
  background: var(--card-bg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

.task-type-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: var(--spacing-md);
}

.type-delivery {
  background: #E3F2FD;
  color: #2196F3;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.task-desc {
  font-size: 14px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.task-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.reward-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.reward-value {
  font-size: 24px;
  font-weight: 600;
  color: #F44336;
}

.section {
  background: var(--card-bg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.creator-card {
  display: flex;
  align-items: center;
}

.creator-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  object-fit: cover;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.creator-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 12px;
  color: var(--text-muted);
}

.info-list {
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--text-muted);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
}

.status-badge.status-open {
  color: #2196F3;
}

.status-badge.status-ongoing {
  color: #FF9800;
}

.status-badge.status-completed {
  color: #4CAF50;
}

.responders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.responder-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-md);
}

.responder-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  object-fit: cover;
}

.responder-info {
  flex: 1;
}

.responder-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.responder-stats {
  font-size: 12px;
  color: var(--text-muted);
}

.select-btn {
  padding: 6px 16px;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  padding-bottom: calc(var(--spacing-md) + constant(safe-area-inset-bottom));
  padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.contact-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--text-primary);
  cursor: pointer;
}

.accept-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.accept-btn.completed {
  background: var(--text-muted);
  cursor: default;
}
</style>