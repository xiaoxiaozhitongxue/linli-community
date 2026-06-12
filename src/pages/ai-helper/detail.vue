<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-nav">
        <span class="back-btn" @click="goBack">←</span>
        <span class="header-title">{{ taskNotFound ? '任务详情' : '任务详情' }}</span>
        <span class="placeholder"></span>
      </div>
    </div>

    <div v-if="taskNotFound" class="empty-wrap">
      <div class="empty-state">
        <span class="empty-icon">🤷</span>
        <span class="empty-title">任务已完成或不存在</span>
        <span class="empty-desc">可能是任务状态变化，或者你从其他地方访问了这个任务</span>
        <div class="empty-action" @click="goBack">返回任务广场</div>
      </div>
    </div>

    <div v-else class="content" style="overflow-y: auto; padding-bottom: 100px;">
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

      <div class="section" v-if="task.responses > 0 && task.status === 'open'">
        <div class="section-title">已响应 ({{ task.responses }})</div>
        <div class="responders-list">
          <div v-for="responder in responders" :key="responder.id" class="responder-item">
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

    <div v-if="!taskNotFound" class="bottom-action">
      <div class="action-buttons">
        <div class="contact-btn" @click="contactCreator">
          <span>💬</span>
          <span>联系发布者</span>
        </div>
        <div
          class="accept-btn"
          :class="{ completed: task.status === 'completed' }"
          @click="handleAction"
          v-if="task.status !== 'completed' || isAccepted"
        >
          <span>{{ actionButtonText }}</span>
        </div>
        <div
          class="accept-btn completed"
          v-else
        >
          <span>任务已完成</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateBackSmart, getUserStorageKey } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const STORAGE_KEY = 'ai_helper_tasks'
const MY_CREATED_TASKS_KEY = 'ai_helper_my_created_tasks'
const MY_ACCEPTED_TASKS_KEY = 'ai_helper_my_accepted_tasks'

const route = useRoute()
const statusBarHeight = ref(20)

const task = ref({
  id: '',
  type: 'other',
  title: '加载中...',
  description: '',
  reward: 0,
  location: '',
  distance: 0,
  responses: 0,
  createTime: '',
  creatorName: '',
  creatorAvatar: '',
  creatorRating: 0,
  creatorTasks: 0,
  status: 'open' as 'open' | 'ongoing' | 'completed' | ''
})

const responders = ref<any[]>([])

const isAccepted = ref(false)
const taskNotFound = ref(false)

const actionButtonText = computed(() => {
  if (task.value.status === 'completed') return '任务已完成'
  if (isAccepted.value) return '完成任务'
  return '接单'
})

// 默认种子任务（用于首次进入应用、或从外部链接点进来时，确保 ID 可找到）
const SEED_TASKS = [
  { id: '1', type: 'delivery', title: '帮忙取个快递', description: '菜鸟驿站，3个包裹，有密码，取件码1234', reward: 5, distance: 150, responses: 3, creatorName: '小红', creatorAvatar: 'https://i.pravatar.cc/100?img=4', createTime: '10分钟前', status: 'open', creatorRating: 4.8, creatorTasks: 23, location: '阳光社区 菜鸟驿站' },
  { id: '2', type: 'shopping', title: '帮忙带份早餐', description: '永和大王，豆浆油条套餐，加个煎蛋', reward: 8, distance: 200, responses: 5, creatorName: '上班族小王', creatorAvatar: 'https://i.pravatar.cc/100?img=5', createTime: '20分钟前', status: 'open', creatorRating: 4.5, creatorTasks: 12, location: '永和大王 阳光社区店' },
  { id: '3', type: 'pet', title: '代遛金毛半小时', description: '金毛很温顺，就在楼下花园，疫苗已打', reward: 15, distance: 80, responses: 2, creatorName: '铲屎官小刘', creatorAvatar: 'https://i.pravatar.cc/100?img=6', createTime: '1小时前', status: 'ongoing', creatorRating: 4.9, creatorTasks: 56, location: '阳光社区 花园' },
  { id: '4', type: 'child', title: '帮忙接孩子', description: '阳光小学门口，4点15分，两个孩子，一个书包', reward: 25, distance: 300, responses: 1, creatorName: '双职工家庭', creatorAvatar: 'https://i.pravatar.cc/100?img=7', createTime: '2小时前', status: 'open', creatorRating: 4.6, creatorTasks: 8, location: '阳光小学 门口' },
  { id: '5', type: 'delivery', title: '急！取文件快递', description: '顺丰快递，生鲜文件，需今天送到家', reward: 10, distance: 250, responses: 4, creatorName: '白领张小姐', creatorAvatar: 'https://i.pravatar.cc/100?img=9', createTime: '30分钟前', status: 'open', creatorRating: 4.7, creatorTasks: 35, location: '顺丰速递 社区店' },
  { id: '6', type: 'shopping', title: '代买感冒药', description: '楼下药店，买感康两盒，可报销', reward: 12, distance: 50, responses: 6, creatorName: '独居老人家属', creatorAvatar: 'https://i.pravatar.cc/100?img=10', createTime: '15分钟前', status: 'open', creatorRating: 4.3, creatorTasks: 5, location: '阳光大药房' },
  { id: '7', type: 'pet', title: '临时照看猫咪', description: '英短蓝猫，2岁，乖巧可爱，需出差3天', reward: 80, distance: 100, responses: 0, creatorName: '爱猫人士小林', creatorAvatar: 'https://i.pravatar.cc/100?img=11', createTime: '3小时前', status: 'open', creatorRating: 4.8, creatorTasks: 42, location: '阳光社区 3栋' },
  { id: '8', type: 'child', title: '兴趣班接送', description: '每周六下午3点，舞蹈班，4点接回', reward: 25, distance: 400, responses: 2, creatorName: '辣妈小美', creatorAvatar: 'https://i.pravatar.cc/100?img=12', createTime: '5小时前', status: 'open', creatorRating: 4.9, creatorTasks: 67, location: '青少年宫' }
]

function loadFromStorage(key: string, defaultValue: any[]) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
    // 没有数据 → 写入种子任务
    const seeded = [...(defaultValue.length > 0 ? defaultValue : SEED_TASKS)]
    localStorage.setItem(key, JSON.stringify(seeded))
    return seeded
  } catch (e) {
    console.error(`加载数据失败: ${key}`, e)
  }
  return [...(defaultValue.length > 0 ? defaultValue : SEED_TASKS)]
}

function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`保存数据失败: ${key}`, e)
  }
}

function updateTaskStatus(taskId: string, newStatus: string) {
  const tasks = loadFromStorage(getUserStorageKey(STORAGE_KEY), [])
  const index = tasks.findIndex((t: any) => t.id === taskId)
  if (index !== -1) {
    tasks[index].status = newStatus
    saveToStorage(getUserStorageKey(STORAGE_KEY), tasks)
    task.value.status = newStatus
  }
}

function updateMyTaskStatus(taskId: string, newStatus: string, storageKey: string) {
  const myTasks = loadFromStorage(storageKey, [])
  const index = myTasks.findIndex((t: any) => t.id === taskId)
  if (index !== -1) {
    myTasks[index].status = newStatus
    myTasks[index].updateTime = newStatus === 'completed' ? '已完成' : '进行中'
    saveToStorage(storageKey, myTasks)
  }
}

onMounted(() => {
  const taskId = (route.query.id as string) || ''

  if (!taskId) {
    console.warn('[详情页] 未传入任务ID')
    taskNotFound.value = true
    return
  }

  const storageKey = getUserStorageKey(STORAGE_KEY)
  const createdKey = getUserStorageKey(MY_CREATED_TASKS_KEY)
  const acceptedKey = getUserStorageKey(MY_ACCEPTED_TASKS_KEY)

  // 1. 优先从任务广场主存储加载（包含完整任务数据）
  //    如果主存储为空，注入种子任务（避免首页点进来就看到空）
  let tasks = loadFromStorage(storageKey, SEED_TASKS)
  let found = tasks.find((t: any) => t.id === taskId)

  // 2. 回退到"我的发布"存储
  if (!found) {
    const myCreatedTasks = loadFromStorage(createdKey, [])
    found = myCreatedTasks.find((t: any) => t.id === taskId)
  }

  // 3. 再回退到"我的接单"存储
  if (!found) {
    const myAcceptedTasks = loadFromStorage(acceptedKey, [])
    found = myAcceptedTasks.find((t: any) => t.id === taskId)
  }

  // 4. 用找到的数据更新 task；否则标记为不存在
  if (found) {
    task.value = {
      id: found.id || taskId,
      type: found.type || 'other',
      title: found.title || '任务详情',
      description: found.description || '暂无详细描述',
      reward: found.reward || 0,
      location: found.location || '未知',
      distance: found.distance || 0,
      responses: found.responses || 0,
      createTime: found.createTime || '刚刚',
      creatorName: found.creatorName || '邻居',
      creatorAvatar: found.creatorAvatar || 'https://i.pravatar.cc/100?img=1',
      creatorRating: found.creatorRating || 4.8,
      creatorTasks: found.creatorTasks || 0,
      status: found.status || 'open'
    }
    taskNotFound.value = false
  } else {
    console.warn('[详情页] 未找到任务，taskId:', taskId)
    taskNotFound.value = true
  }
})

const goBack = () => {
  navigateBackSmart()
}

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    delivery: '取快递',
    shopping: '帮买菜',
    pet: '代遛狗',
    child: '接孩子',
    help: '帮忙',
    companionship: '陪护',
    other: '其他'
  }
  return map[type] || '其他'
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
    toastSuccess('已选择帮助者')
  }
}

const handleAction = () => {
  if (task.value.status === 'completed') {
    toastInfo('该任务已完成')
    return
  }

  if (isAccepted.value) {
    if (window.confirm('确定标记此任务为已完成吗？')) {
      task.value.status = 'completed'
      isAccepted.value = false

      updateTaskStatus(task.value.id, 'completed')
      updateMyTaskStatus(task.value.id, 'completed', getUserStorageKey(MY_CREATED_TASKS_KEY))
      updateMyTaskStatus(task.value.id, 'completed', getUserStorageKey(MY_ACCEPTED_TASKS_KEY))

      toastSuccess('任务已完成')
      setTimeout(() => {
        navigateBackSmart()
      }, 1500)
    }
  } else {
    if (window.confirm('确定要接下这个任务吗？')) {
      isAccepted.value = true
      task.value.status = 'ongoing'
      task.value.responses++

      const tasks = loadFromStorage(getUserStorageKey(STORAGE_KEY), [])
      const index = tasks.findIndex((t: any) => t.id === task.value.id)
      if (index !== -1) {
        tasks[index].status = 'ongoing'
        tasks[index].responses++
        saveToStorage(getUserStorageKey(STORAGE_KEY), tasks)
      }

      const myAcceptedTasks = loadFromStorage(getUserStorageKey(MY_ACCEPTED_TASKS_KEY), [])
      myAcceptedTasks.unshift({
        id: task.value.id,
        title: task.value.title,
        reward: task.value.reward,
        status: 'ongoing',
        updateTime: '刚刚'
      })
      saveToStorage(getUserStorageKey(MY_ACCEPTED_TASKS_KEY), myAcceptedTasks)

      toastSuccess('接单成功')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.empty-wrap {
  padding: 80px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
}

.empty-state .empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.empty-state .empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-state .empty-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.empty-action {
  padding: 10px 24px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.empty-action:active {
  transform: scale(0.97);
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
  margin-left: -8px;
}

.back-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.back-btn:active {
  background-color: var(--color-border-medium);
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.placeholder {
  width: 20px;
}

.content {
  height: calc(100vh);
  overflow-y: auto;
  padding: 20px;
}

.task-card {
  background: var(--color-bg-secondary);
  padding: 24px;
  border-radius: var(--radius-xl);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.task-card:hover {
  box-shadow: var(--shadow-md);
}

.task-type-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  margin-bottom: 16px;
  font-weight: 500;
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

.type-help {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.type-companionship {
  background: var(--color-accent-soft);
  color: #f59e0b;
}

.type-other {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.task-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 12px;
}

.task-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 20px;
  line-height: 1.6;
}

.task-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: var(--color-error);
}

.section {
  background: var(--color-bg-secondary);
  padding: 20px;
  margin-bottom: 16px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.section:hover {
  box-shadow: var(--shadow-md);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.creator-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.creator-avatar {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 4px;
}

.creator-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-primary);
}

.status-badge.status-open {
  color: var(--color-info);
  background: var(--color-info-soft);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.status-badge.status-ongoing {
  color: var(--color-warning);
  background: var(--color-warning-soft);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.status-badge.status-completed {
  color: var(--color-success);
  background: var(--color-success-soft);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.responders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.responder-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.responder-item:hover {
  background: var(--color-bg-tertiary);
}

.responder-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  margin-right: 12px;
  object-fit: cover;
}

.responder-info {
  flex: 1;
}

.responder-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 4px;
}

.responder-stats {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.select-btn {
  padding: 8px 20px;
  background: var(--color-primary);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.select-btn:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  box-shadow: var(--shadow-lg);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.contact-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  font-size: 15px;
  color: var(--color-text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.contact-btn:hover {
  background: var(--color-border-light);
}

.accept-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  padding: 14px;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.accept-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.accept-btn.completed {
  background: var(--color-text-muted);
  cursor: default;
  box-shadow: none;
}
</style>
