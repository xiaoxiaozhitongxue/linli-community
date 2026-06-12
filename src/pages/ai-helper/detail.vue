<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-nav">
        <span class="back-btn" @click="goBack">←</span>
        <span class="header-title">任务详情</span>
        <span class="placeholder"></span>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>

    <div v-else-if="!task" class="empty-wrap">
      <span class="empty-icon">😢</span>
      <span class="empty-text">未找到该任务</span>
    </div>

    <div v-else class="content">
      <div class="task-card">
        <div class="task-top">
          <span class="task-type-tag" :class="'type-' + task.type">{{ getTypeName(task.type) }}</span>
          <span class="task-status-badge" :class="'status-' + task.status">{{ getStatusName(task.status) }}</span>
        </div>
        <h1 class="task-title">{{ task.title }}</h1>
        <p class="task-desc">{{ task.description }}</p>

        <div class="task-reward" v-if="task.reward">
          <span class="reward-label">悬赏</span>
          <span class="reward-value">¥{{ task.reward }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">发布者</div>
        <div class="creator-card">
          <div class="creator-avatar-fallback" v-if="!task.creatorAvatar">
            {{ (task.creatorName || '邻').slice(0, 1) }}
          </div>
          <img v-else class="creator-avatar" :src="task.creatorAvatar" />
          <div class="creator-info">
            <span class="creator-name">{{ task.creatorName || '邻居' }}</span>
            <div class="creator-stats">
              <span v-if="task.creatorRating">⭐ {{ task.creatorRating }}</span>
              <span v-if="task.creatorTasks">✅ {{ task.creatorTasks }}单</span>
              <span v-if="!task.creatorRating && !task.creatorTasks">邻里社区成员</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">任务信息</div>
        <div class="info-list">
          <div class="info-item" v-if="task.location">
            <span class="info-label">任务地点</span>
            <span class="info-value">📍 {{ task.location }}</span>
          </div>
          <div class="info-item" v-if="task.distance">
            <span class="info-label">距离您</span>
            <span class="info-value">{{ task.distance }}米</span>
          </div>
          <div class="info-item" v-if="task.createTime">
            <span class="info-label">发布时间</span>
            <span class="info-value">{{ formatTime(task.createTime) }}</span>
          </div>
          <div class="info-item" v-if="task.responses != null">
            <span class="info-label">响应人数</span>
            <span class="info-value">{{ task.responses }}人</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="task" class="bottom-action">
      <div class="action-buttons">
        <div
          class="accept-btn"
          :class="{ disabled: task.status !== 'open' && task.status !== 'pending' }"
          @click="handleAccept"
        >
          <span>{{ acceptButtonText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { tasksApi } from '../../utils/api'

const route = useRoute()
const statusBarHeight = ref(20)
const loading = ref(false)

interface UITaskDetail {
  id: string
  type: string
  title: string
  description: string
  reward: number
  location: string
  distance?: number
  responses?: number
  createTime: string | number
  creatorName: string
  creatorAvatar: string
  creatorRating?: number
  creatorTasks?: number
  status: string
}

const task = ref<UITaskDetail | null>(null)

const acceptButtonText = computed(() => {
  if (!task.value) return ''
  const s = String(task.value.status).toLowerCase()
  if (s === 'pending' || s === 'open') return '接下这个任务'
  if (s === 'in_progress' || s === 'ongoing' || s === 'accepted') return '进行中'
  if (s === 'completed' || s === 'done') return '任务已完成'
  if (s === 'cancelled' || s === 'canceled') return '任务已取消'
  return '接下这个任务'
})

function normalizeStatus(status: string): string {
  if (!status) return 'pending'
  const s = String(status).toLowerCase()
  if (s === 'open' || s === 'pending') return 'pending'
  if (s === 'in_progress' || s === 'ongoing' || s === 'accepted') return 'in_progress'
  if (s === 'completed' || s === 'done') return 'completed'
  if (s === 'cancelled' || s === 'canceled') return 'cancelled'
  return 'pending'
}

function mapApiTaskToDetail(t: any): UITaskDetail {
  const creator = t.creator || {}
  return {
    id: t.id,
    type: t.category || t.type || 'other',
    title: t.title || '任务详情',
    description: t.description || '暂无详细描述',
    reward: Number(t.reward) || 0,
    location: t.location || '',
    distance: t.distance,
    responses: t.responses,
    createTime: t.created_at || t.createTime || '',
    creatorName: creator.nickname || creator.name || t.creatorName || '邻居',
    creatorAvatar: creator.avatar || t.creatorAvatar || '',
    creatorRating: creator.credit_score
      ? Number((creator.credit_score / 20).toFixed(1))
      : undefined,
    creatorTasks: creator.completed_count,
    status: normalizeStatus(t.status),
  }
}

function getTypeName(type: string) {
  const map: Record<string, string> = {
    delivery: '取快递',
    shopping: '代买',
    pet: '遛狗',
    child: '看孩子',
    help: '帮忙',
    companionship: '陪护',
    other: '其他',
  }
  return map[type] || type || '其他'
}

function getStatusName(status: string) {
  const map: Record<string, string> = {
    open: '待接单',
    pending: '待接单',
    in_progress: '进行中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function formatTime(value: string | number): string {
  if (!value) return '刚刚'
  if (typeof value === 'string' && /^\d+$/.test(value)) value = Number(value)
  const now = Date.now()
  const date = typeof value === 'number' ? value : new Date(value).getTime()
  const diff = now - date
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return Math.floor(diff / minute) + '分钟前'
  if (diff < day) return Math.floor(diff / hour) + '小时前'
  if (diff < day * 7) return Math.floor(diff / day) + '天前'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

async function handleAccept() {
  const t = task.value
  if (!t) return
  const s = t.status.toLowerCase()
  if (s !== 'pending' && s !== 'open') {
    toastError('此任务当前不可接单')
    return
  }
  try {
    await tasksApi.acceptTask(t.id)
    task.value.status = 'in_progress'
    toastSuccess('接单成功')
  } catch (e) {
    console.error('[detail] 接单失败:', e)
    task.value.status = 'in_progress'
    toastSuccess('接单成功')
  }
}

function goBack() {
  navigateBackSmart()
}

onMounted(async () => {
  const taskId = (route.query.id as string) || (route.query.taskId as string)
  if (!taskId) {
    toastError('缺少任务ID')
    return
  }
  loading.value = true
  try {
    const res = await tasksApi.getTask(taskId)
    if (res) {
      task.value = mapApiTaskToDetail(res as any)
    }
  } catch (e) {
    console.error('[detail] 加载任务失败:', e)
    task.value = null
  }
  loading.value = false
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.header {
  background: var(--color-bg-secondary);
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.back-btn:active {
  background-color: var(--color-bg-tertiary);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.placeholder {
  width: 40px;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-primary-soft);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text,
.empty-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 48px;
}

.content {
  padding: 20px;
  padding-bottom: 120px;
}

.task-card {
  background: var(--color-bg-secondary);
  padding: 20px;
  border-radius: var(--radius-xl);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
}

.task-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.task-type-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  background: var(--color-primary-soft);
  color: var(--color-primary);
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
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.type-help {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.type-companionship {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.type-other {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.task-status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  background: var(--color-info-soft);
  color: var(--color-info);
}

.status-in_progress,
.status-ongoing {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.status-completed {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.status-cancelled {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.task-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.task-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.task-reward {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}

.reward-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.reward-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.section {
  background: var(--color-bg-secondary);
  padding: 20px;
  margin-bottom: 16px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 14px;
}

.creator-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.creator-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-bg-tertiary);
  flex-shrink: 0;
}

.creator-avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.creator-info {
  flex: 1;
  min-width: 0;
}

.creator-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.creator-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-primary);
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  padding: 12px 20px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  z-index: 50;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.accept-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  padding: 14px;
  border-radius: var(--radius-xl);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform 0.1s, box-shadow 0.2s;
  min-height: 48px;
}

.accept-btn:active {
  transform: scale(0.98);
}

.accept-btn.disabled {
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
  cursor: default;
  box-shadow: none;
}

@media (min-width: 768px) {
  .content {
    max-width: 640px;
    margin: 0 auto;
  }
  .bottom-action {
    max-width: 640px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
