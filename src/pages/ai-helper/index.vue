<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header" style="background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFA07A 100%);">
      <div class="header-content">
        <div class="header-main">
          <div class="header-icon-wrap">
            <AppIcon class="header-icon" name="handshake" :size="28" />
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
                <AppIcon class="category-icon" name="bookmark" :size="18" />
                <span class="category-name">全部</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'delivery' }"
                @click="selectCategory('delivery')"
              >
                <AppIcon class="category-icon" name="bookmark" :size="18" />
                <span class="category-name">取快递</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'shopping' }"
                @click="selectCategory('shopping')"
              >
                <AppIcon class="category-icon" name="activity" :size="18" />
                <span class="category-name">买菜</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'pet' }"
                @click="selectCategory('pet')"
              >
                <AppIcon class="category-icon" name="users" :size="18" />
                <span class="category-name">遛狗</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'child' }"
                @click="selectCategory('child')"
              >
                <AppIcon class="category-icon" name="user" :size="18" />
                <span class="category-name">接孩子</span>
              </div>
              <div
                class="category-item"
                :class="{ active: selectedCategory === 'other' }"
                @click="selectCategory('other')"
              >
                <AppIcon class="category-icon" name="edit" :size="18" />
                <span class="category-name">其他</span>
              </div>
            </div>
          </div>

          <!-- 状态筛选 -->
          <div class="status-filter-bar">
            <div class="status-filters">
              <div
                class="status-filter-btn"
                :class="{ active: statusFilter === 'pending' }"
                @click="setStatusFilter('pending')"
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

          <!-- 加载状态 -->
          <SkeletonLoader v-if="loading" type="card" :count="3" />

          <!-- 错误状态 -->
          <ErrorBoundary
            v-else-if="error"
            :message="error"
            @retry="refreshTasks"
          />

          <!-- 任务列表 -->
          <div class="task-list" v-else-if="displayTasks.length > 0">
            <div
              class="task-card"
              v-for="task in displayTasks"
              :key="task.id"
              :class="{ 'status-open': task.status === 'pending' }"
              @click="goToTaskDetail(task)"
            >
              <div class="task-card-row">
                <!-- 左侧类型图标 -->
                <div class="task-type-icon" :class="'type-icon-' + task.type">
                  <AppIcon :name="getTypeIcon(task.type)" :size="22" />
                </div>

                <!-- 中间文字信息 -->
                <div class="task-card-body">
                  <div class="task-card-top">
                    <span class="task-card-title">{{ task.title }}</span>
                    <span class="task-type-tag" :class="'type-' + task.type">{{ getTypeName(task.type) }}</span>
                  </div>
                  <div class="task-card-meta">
                    <span class="task-meta-item" v-if="task.location">
                      <AppIcon name="map-pin" :size="12" />
                      {{ task.location }}
                    </span>
                    <span class="task-meta-divider" v-if="task.location && task.reward">·</span>
                    <span class="task-meta-item task-reward" v-if="task.reward">
                      ¥{{ task.reward }}
                    </span>
                    <span class="task-meta-divider" v-if="task.reward">·</span>
                    <span class="task-meta-item task-status-badge" :class="'status-' + task.status">
                      {{ getStatusName(task.status) }}
                    </span>
                  </div>
                </div>

                <!-- 右侧响应按钮（待接单） -->
                <div class="task-card-action" v-if="task.status === 'pending'" @click.stop="respondToTask(task, $event)">
                  <div class="respond-compact-btn">接单</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <EmptyState v-else icon="search" :title="'暂无' + getCategoryName(selectedCategory) + '任务'" description="试试其他分类或切换到全部任务" />

          <div class="safe-area-bottom"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateTo } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'
import { taskService } from '../../services/taskService'
import { useTasks } from '../../composables/useTasks'
import type { Task } from '../../types/models'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorBoundary from '../../components/ErrorBoundary.vue'
import AppIcon from '../../components/AppIcon.vue'
import {
  getTaskStatusLabel,
  normalizeTaskStatus
} from '../../constants/status'

const selectedCategory = ref<string>('all')
const statusFilter = ref<string>('pending')

const { tasks: apiTasks, loading, error, refreshTasks } = useTasks()

/**
 * 归一化任务状态到标准 key（pending / pending_confirm / in_progress / completed / cancelled）。
 * 统一委托给 constants/status.ts，消除此前 open/pending 命名不一致的问题。
 * 注意：DB 的 pending 表示「待接单」，归一到标准 key pending。
 */
function normalizeStatus(status: string): string {
  return normalizeTaskStatus(status)
}

function mapTaskToDisplay(t: Task) {
  return {
    id: t.id,
    type: t.category || 'other',
    title: t.title || '任务详情',
    description: t.description || '',
    reward: Number(t.reward) || 0,
    distance: (t as any).distance || 0,
    responses: (t as any).responses || 0,
    creatorName: t.creator?.nickname || '邻居',
    creatorAvatar: t.creator?.avatar || '',
    createTime: t.created_at || Date.now(),
    status: normalizeStatus(t.status),
    creatorRating: t.creator?.credit_score || 4.8,
    creatorTasks: (t as any).completed_count || 0,
    location: t.location || ''
  }
}

const displayTasks = computed(() => {
  const mapped = apiTasks.value.map(mapTaskToDisplay)
  let result = [...mapped]

  if (selectedCategory.value !== 'all') {
    result = result.filter(t => t.type === selectedCategory.value)
  }

  if (statusFilter.value !== 'all') {
    result = result.filter(t => t.status === statusFilter.value)
  }

  result.sort((a, b) => {
    const timeA = new Date(a.createTime).getTime() || 0
    const timeB = new Date(b.createTime).getTime() || 0
    return timeB - timeA
  })

  return result
})

const openTaskCount = computed(() => {
  return displayTasks.value.filter(t => t.status === 'pending').length
})

const todayCount = computed(() => {
  return displayTasks.value.filter(t => {
    return t.status === 'pending' || t.status === 'in_progress'
  }).length
})

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

const getCategoryOpenCount = (category: string) => {
  if (category === 'all') {
    return openTaskCount.value
  }
  return displayTasks.value.filter(t =>
    t.type === category && t.status === 'pending'
  ).length
}

const selectCategory = (category: string) => {
  selectedCategory.value = category
}

const setStatusFilter = (status: string) => {
  statusFilter.value = status
}

const goToTaskDetail = (task: any) => {
  navigateTo(`/pages/ai-helper/detail?id=${task.id}`)
}

const respondToTask = async (task: any, event: Event) => {
  event.stopPropagation()
  if (!window.confirm('确定要接下这个任务吗？')) return
  try {
    await taskService.acceptTask(task.id)
    toastSuccess('接单成功')
    await refreshTasks()
  } catch (e: any) {
    const msg = e?.message || '接单失败，请稍后重试'
    toastInfo(msg)
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

const getTypeIcon = (type: string) => {
  const map: Record<string, string> = {
    delivery: 'package',
    shopping: 'activity',
    pet: 'users',
    child: 'user',
    other: 'bookmark'
  }
  return map[type] || 'bookmark'
}

const getStatusName = (status: string): string => getTaskStatusLabel(status)

onMounted(async () => {
  await refreshTasks()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  width: 100%;
}

.header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFA07A 100%);
  background: var(--color-primary-gradient, linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFA07A 100%));
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-2xl);
  padding-top: calc(20px + var(--spacing-lg));
  width: 100%;
  min-height: 120px;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  padding: 0 var(--spacing-lg);
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
  width: 100%;
  max-width: 100%;
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

/* 任务卡片 - 紧凑版 */
.task-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.task-card.status-open {
  border-color: var(--color-primary-soft);
}

.task-card-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  gap: var(--spacing-md);
  min-height: 60px;
}

/* 左侧类型图标 */
.task-type-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-icon-delivery { background: var(--color-info-soft); color: var(--color-info); }
.type-icon-shopping { background: var(--color-warning-soft); color: var(--color-warning); }
.type-icon-pet { background: var(--color-primary-soft); color: var(--color-primary); }
.type-icon-child { background: var(--color-error-soft); color: var(--color-error); }
.type-icon-other { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }

/* 中间文字 */
.task-card-body {
  flex: 1;
  min-width: 0;
}

.task-card-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.task-card-title {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-type-tag {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
  white-space: nowrap;
}

.type-delivery { background: var(--color-info-soft); color: var(--color-info); }
.type-shopping { background: var(--color-warning-soft); color: var(--color-warning); }
.type-pet { background: var(--color-primary-soft); color: var(--color-primary); }
.type-child { background: var(--color-error-soft); color: var(--color-error); }
.type-other { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }

.task-card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  flex-wrap: wrap;
}

.task-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.task-meta-divider {
  color: var(--color-border-light);
}

.task-reward {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.task-status-badge {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.status-pending { background: var(--color-info-soft); color: var(--color-info); }
.status-in_progress { background: var(--color-warning-soft); color: var(--color-warning); }
.status-completed { background: var(--color-success-soft); color: var(--color-success); }
.status-pending_confirm { background: var(--color-primary-soft); color: var(--color-primary); }
.status-cancelled { background: var(--color-bg-tertiary); color: var(--color-text-muted); }

/* 右侧接单按钮 */
.task-card-action {
  flex-shrink: 0;
}

.respond-compact-btn {
  padding: 6px 14px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
}

.respond-compact-btn:active {
  transform: scale(0.95);
  box-shadow: none;
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
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
}
</style>
