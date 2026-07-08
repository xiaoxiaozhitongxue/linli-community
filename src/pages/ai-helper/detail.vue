<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-nav">
        <span class="back-btn" @click="goBack">←</span>
        <span class="header-title">任务详情</span>
        <span class="placeholder"></span>
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="card" :count="2" />

    <EmptyState v-else-if="!task" icon="help-circle" title="未找到该任务" />

    <div v-else class="content">
      <div class="task-card">
        <div class="task-top">
          <span class="task-type-tag" :class="'type-' + task.type">{{ getTypeName(task.type) }}</span>
          <span class="task-status-badge" :class="'status-' + task.status">{{ getStatusName(task.status) }}</span>
          <!-- 操作按钮：仅作者可见 -->
          <span class="action-btn-area" v-if="isOwner && !editing">
            <span class="action-btn edit-btn" @click="startEdit"><AppIcon name="edit" :size="14" /> 编辑</span>
            <span class="action-btn delete-btn" @click="confirmDelete"><AppIcon name="trash" :size="14" /> 删除</span>
          </span>
        </div>

        <!-- 编辑模式 -->
        <template v-if="editing">
          <div class="edit-field">
            <label class="edit-label">标题</label>
            <input v-model="editTitle" class="edit-input" placeholder="请输入任务标题" />
          </div>
          <div class="edit-field">
            <label class="edit-label">描述</label>
            <textarea v-model="editDescription" class="edit-textarea" rows="4" placeholder="请输入任务描述"></textarea>
          </div>
          <div class="edit-actions">
            <span class="cancel-btn" @click="cancelEdit">取消</span>
            <span class="save-btn" @click="saveEdit">保存</span>
          </div>
        </template>

        <!-- 展示模式 -->
        <template v-else>
          <h1 class="task-title">{{ task.title }}</h1>
          <p class="task-desc">{{ task.description }}</p>

          <div class="task-reward" v-if="task.reward">
            <span class="reward-label">悬赏</span>
            <span class="reward-value">¥{{ task.reward }}</span>
          </div>
        </template>
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
            <span class="info-value"><AppIcon name="map-pin" :size="14" /> {{ task.location }}</span>
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
          :class="{ disabled: task.status !== 'open' }"
          @click="handleAccept"
        >
          <span>{{ acceptButtonText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart, getUserStorageKey } from '../../utils/router'
import { toastSuccess, toastError, toastInfo } from '../../utils/toast'
import { taskService } from '../../services/taskService'
import type { Task } from '../../types/models'
import { useAuth } from '../../store'
import { showLoginGuide, setLoginRedirect } from '../../utils/auth'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import AppIcon from '../../components/AppIcon.vue'

const { isLoggedIn, user } = useAuth()

const STORAGE_KEY = 'ai_helper_tasks'
const MY_CREATED_TASKS_KEY = 'ai_helper_my_created_tasks'
const MY_ACCEPTED_TASKS_KEY = 'ai_helper_my_accepted_tasks'

const route = useRoute()
const statusBarHeight = ref(20)
const loading = ref(true)

interface TaskDetail {
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
  creatorId: string
  creatorRating?: number
  creatorTasks?: number
  status: 'open' | 'ongoing' | 'completed' | 'cancelled'
}

const task = ref<TaskDetail | null>(null)

// 编辑状态
const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')

/** 当前登录用户是否为任务发布者 */
const isOwner = computed(() => {
  if (!user.value || !task.value) return false
  return task.value.creatorId === user.value.id
})

const acceptButtonText = computed(() => {
  if (!task.value) return ''
  switch (task.value.status) {
    case 'open':
      return '接下这个任务'
    case 'ongoing':
      return '任务进行中'
    case 'completed':
      return '任务已完成'
    case 'cancelled':
      return '任务已取消'
    default:
      return '接下这个任务'
  }
})

function normalizeStatus(rawStatus: string): 'open' | 'ongoing' | 'completed' | 'cancelled' {
  const s = String(rawStatus || '').toLowerCase()
  if (s === 'open' || s === 'pending') return 'open'
  if (s === 'in_progress' || s === 'ongoing' || s === 'accepted') return 'ongoing'
  if (s === 'completed' || s === 'done') return 'completed'
  if (s === 'cancelled' || s === 'canceled') return 'cancelled'
  return 'open'
}

function mapApiTaskToLocal(apiTask: Task): TaskDetail {
  return {
    id: apiTask.id || '',
    type: apiTask.category || (apiTask as any).type || 'other',
    title: apiTask.title || '任务详情',
    description: apiTask.description || '暂无详细描述',
    reward: Number(apiTask.reward) || 0,
    location: apiTask.location || '',
    createTime: apiTask.created_at || Date.now(),
    creatorName: apiTask.creator?.nickname || '邻居',
    creatorAvatar: apiTask.creator?.avatar || '',
    creatorId: apiTask.creator?.id || apiTask.user_id || '',
    creatorRating: apiTask.creator?.credit_score ? Number((apiTask.creator.credit_score / 20).toFixed(1)) : undefined,
    creatorTasks: undefined,
    status: normalizeStatus(apiTask.status)
  }
}

function getTypeName(type: string): string {
  const map: Record<string, string> = {
    delivery: '配送',
    shopping: '购物',
    pet: '宠物',
    child: '育儿',
    help: '帮忙',
    companionship: '陪伴',
    other: '其他'
  }
  return map[type] || '其他'
}

function getStatusName(status: string): string {
  const map: Record<string, string> = {
    open: '待接单',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

function formatTime(time: string | number): string {
  if (!time) return ''
  const date = new Date(Number(time))
  if (isNaN(date.getTime())) return String(time)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

function loadFromStorage(key: string, defaultValue: any[]) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    // ignore storage errors
  }
  return defaultValue
}

async function handleAccept() {
  const t = task.value
  if (!t) return

  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/ai-helper/detail')
    showLoginGuide()
    return
  }

  if (t.status !== 'open') {
    toastError('此任务当前不可接单')
    return
  }
  try {
    await taskService.acceptTask(t.id)
    task.value = { ...t, status: 'ongoing' }
    toastSuccess('接单成功')
  } catch (e: any) {
    const msg = e?.message || '接单失败，请稍后重试'
    toastError(msg)
  }
}

/** 进入编辑模式 */
function startEdit() {
  if (!task.value) return
  editTitle.value = task.value.title
  editDescription.value = task.value.description
  editing.value = true
}

/** 取消编辑 */
function cancelEdit() {
  editing.value = false
  editTitle.value = ''
  editDescription.value = ''
}

/** 保存编辑 */
async function saveEdit() {
  if (!task.value) return
  const title = editTitle.value.trim()
  const description = editDescription.value.trim()
  if (!title) {
    toastError('标题不能为空')
    return
  }
  if (!description) {
    toastError('描述不能为空')
    return
  }
  try {
    await taskService.updateTask(task.value.id, { title, description } as any)
    task.value.title = title
    task.value.description = description
    editing.value = false
    toastSuccess('编辑成功')
  } catch (e: any) {
    const msg = e?.message || '编辑失败，请稍后重试'
    toastError(msg)
  }
}

/** 确认删除 */
async function confirmDelete() {
  if (!task.value) return
  if (!confirm('确定删除这个任务吗？')) return
  try {
    await taskService.deleteTask(task.value.id)
    toastSuccess('删除成功')
    goBack()
  } catch (e: any) {
    const msg = e?.message || '删除失败，请稍后重试'
    toastError(msg)
  }
}

function goBack() {
  navigateBackSmart()
}

onMounted(async () => {
  const taskId = (route.query.id as string) || (route.query.taskId as string)
  if (!taskId) {
    toastError('缺少任务ID')
    loading.value = false
    return
  }
  await fetchTask(taskId)
})

async function fetchTask(id: string) {
  loading.value = true
  task.value = null
  try {
    const apiTask = await taskService.getTask(id)
    if (apiTask) {
      task.value = mapApiTaskToLocal(apiTask)
      loading.value = false
      return
    }
  } catch (e: any) {
    // API 失败，尝试从 localStorage 加载
  }

  try {
    const storageKey = getUserStorageKey(STORAGE_KEY)
    const createdKey = getUserStorageKey(MY_CREATED_TASKS_KEY)
    const acceptedKey = getUserStorageKey(MY_ACCEPTED_TASKS_KEY)

    const tasks = loadFromStorage(storageKey, [])
    let found = tasks.find((t: any) => t.id === id)

    if (!found) {
      const myCreatedTasks = loadFromStorage(createdKey, [])
      found = myCreatedTasks.find((t: any) => t.id === id)
    }

    if (!found) {
      const myAcceptedTasks = loadFromStorage(acceptedKey, [])
      found = myAcceptedTasks.find((t: any) => t.id === id)
    }

    if (found) {
      task.value = {
        id: found.id || id,
        type: found.type || 'other',
        title: found.title || '任务详情',
        description: found.description || '暂无详细描述',
        reward: found.reward || 0,
        location: found.location || '',
        distance: found.distance || 0,
        responses: found.responses || 0,
        createTime: found.createTime || '',
        creatorName: found.creatorName || '',
        creatorAvatar: found.creatorAvatar || '',
        creatorId: found.creatorId || found.user_id || '',
        creatorRating: found.creatorRating || 0,
        creatorTasks: found.creatorTasks || 0,
        status: normalizeStatus(found.status)
      }
      loading.value = false
      return
    }
  } catch (storageError) {
    // ignore storage errors
  }

  task.value = {
    id: id,
    type: 'other',
    title: '任务详情',
    description: '该任务可能已下架或不存在，您可以返回任务列表查看其他任务。',
    reward: 0,
    location: '未知地点',
    distance: 0,
    responses: 0,
    createTime: Date.now(),
    creatorName: '邻里社区',
    creatorAvatar: '',
    creatorId: '',
    creatorRating: 5.0,
    creatorTasks: 0,
    status: 'open'
  }
  loading.value = false
}

watch(
  () => route.query.id,
  (newId) => {
    if (newId) {
      fetchTask(newId as string)
    }
  }
)
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

/* 操作按钮 */
.action-btn-area {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

.action-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.edit-btn {
  background: var(--color-primary-soft, rgba(255,107,53,0.1));
  color: var(--color-primary, #FF6B35);
}

.delete-btn {
  background: rgba(255,77,79,0.1);
  color: #ff4d4f;
}

/* 编辑模式 */
.edit-field {
  margin-bottom: 14px;
}

.edit-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: var(--color-primary);
}

.edit-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.edit-textarea:focus {
  border-color: var(--color-primary);
}

.edit-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.cancel-btn {
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 6px 16px;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.cancel-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.save-btn {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  padding: 6px 16px;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.save-btn:hover {
  opacity: 0.9;
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
    max-width: 900px;
    margin: 0 auto;
  }
  .bottom-action {
    max-width: 900px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (min-width: 1024px) {
  .content {
    max-width: 1100px;
  }
  .bottom-action {
    left: var(--nav-sidebar-width, 220px);
    right: auto;
    transform: none;
    max-width: 1100px;
    margin: 0 auto;
  }
}
</style>
