<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="nav-content">
        <span class="nav-back" @click="goBack">‹</span>
        <span class="nav-title">消息</span>
        <span class="nav-right"></span>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'tasks' }"
        @click="switchTab('tasks')"
      >
        <span class="tab-icon">📋</span>
        <span class="tab-text">任务通知</span>
        <span class="unread-dot" v-if="taskUnread > 0"></span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'private' }"
        @click="switchTab('private')"
      >
        <span class="tab-icon">💬</span>
        <span class="tab-text">私信</span>
        <span class="unread-badge" v-if="privateUnread > 0">{{ privateUnread > 99 ? '99+' : privateUnread }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'group' }"
        @click="switchTab('group')"
      >
        <span class="tab-icon">👥</span>
        <span class="tab-text">群聊</span>
        <span class="unread-badge" v-if="groupUnread > 0">{{ groupUnread > 99 ? '99+' : groupUnread }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <span class="loading-text">加载中...</span>
      </div>
    </div>

    <!-- 未登录提示 -->
    <div class="not-logged-in-container" v-else-if="!isLoggedIn">
      <div class="not-logged-in">
        <div class="not-logged-in-icon">🔒</div>
        <div class="not-logged-in-title">请先登录</div>
        <div class="not-logged-in-desc">登录后可查看消息通知和聊天记录</div>
        <div class="login-btn" @click="goToLogin">
          立即登录
        </div>
      </div>
    </div>

    <!-- 任务通知列表 -->
    <div class="message-list" v-show="activeTab === 'tasks' && !loading && isLoggedIn">
      <div 
        class="message-item task-notification"
        :class="{ 'is-unread': item.unread }"
        v-for="item in taskNotifications" 
        :key="item.id"
        @click="handleTaskNotification(item)"
      >
        <div class="message-avatar-wrap">
          <img class="message-avatar" :src="item.avatar" />
          <span class="type-badge" :class="getTaskBadgeClass(item.type)">
            {{ getTaskBadgeText(item.type) }}
          </span>
          <span class="unread-indicator" v-if="item.unread"></span>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-title">{{ item.title }}</span>
            <span class="message-time">{{ formatTime(item.time) }}</span>
          </div>
          <div class="message-preview">{{ item.content }}</div>
          <div class="task-meta" v-if="item.taskId">
            <span class="meta-tag reward-tag">💰 {{ item.reward }}元</span>
            <span class="meta-tag location-tag">📍 {{ item.location }}</span>
          </div>
        </div>
        <div class="unread-bar" v-if="item.unread"></div>
      </div>

      <div class="empty-state" v-if="taskNotifications.length === 0 && !loading">
        <div class="empty-illustration">🔔</div>
        <div class="empty-title">暂无任务通知</div>
        <div class="empty-desc">任务相关的通知会在这里显示</div>
      </div>
    </div>

    <!-- 私信列表 -->
    <div class="message-list" v-show="activeTab === 'private' && !loading && isLoggedIn">
      <div 
        class="message-item" 
        :class="{ 'is-unread': item.unread > 0 }"
        v-for="item in privateMessages" 
        :key="item.id"
        @click="goToChat(item)"
      >
        <div class="message-avatar-wrap">
          <img class="message-avatar" :src="item.avatar" />
          <span class="type-badge private-badge">私信</span>
          <span class="unread-count" v-if="item.unread > 0">{{ item.unread > 9 ? '9+' : item.unread }}</span>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-title" :class="{ 'unread-text': item.unread > 0 }">{{ item.name }}</span>
            <span class="message-time">{{ formatTime(item.lastTime) }}</span>
          </div>
          <div class="message-preview">{{ item.lastMessage }}</div>
        </div>
        <div class="unread-bar" v-if="item.unread > 0"></div>
      </div>

      <div class="empty-state" v-if="privateMessages.length === 0 && !loading && isLoggedIn">
        <div class="empty-illustration">💬</div>
        <div class="empty-title">暂无私信消息</div>
        <div class="empty-desc">和其他邻居开始对话吧</div>
      </div>
    </div>

    <!-- 群聊列表 -->
    <div class="message-list" v-show="activeTab === 'group' && !loading && isLoggedIn">
      <div 
        class="message-item" 
        :class="{ 'is-unread': item.unread > 0 }"
        v-for="item in groupChats" 
        :key="item.id"
        @click="goToGroup(item)"
      >
        <div class="message-avatar-wrap">
          <img class="message-avatar" :src="item.avatar" />
          <span class="type-badge group-badge">群聊</span>
          <span class="unread-count" v-if="item.unread > 0">{{ item.unread > 9 ? '9+' : item.unread }}</span>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-title" :class="{ 'unread-text': item.unread > 0 }">{{ item.name }}</span>
            <span class="message-time">{{ formatTime(item.lastTime) }}</span>
          </div>
          <div class="message-preview">{{ item.lastMessage }}</div>
          <div class="group-members">
            <span class="member-icon">👥</span>
            <span class="member-count">{{ item.memberCount }}人</span>
          </div>
        </div>
        <div class="unread-bar" v-if="item.unread > 0"></div>
      </div>

      <div class="empty-state" v-if="groupChats.length === 0 && !loading && isLoggedIn">
        <div class="empty-illustration">👥</div>
        <div class="empty-title">暂无群聊消息</div>
        <div class="empty-desc">加入社区群组，和邻居聊天吧</div>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateBack, navigateTo } from '../../utils/router'
import { useAuth } from '../../store'
import { toastInfo } from '../../utils/toast'

interface Message {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastTime: string
  unread: number
  type: 'private' | 'group'
  memberCount?: number
}

interface TaskNotification {
  id: string
  title: string
  content: string
  time: string
  unread: boolean
  type: 'new_task' | 'task_accepted' | 'task_completed' | 'task_confirmed'
  taskId?: string
  reward?: number
  location?: string
  avatar?: string
}

const statusBarHeight = ref(20)
const activeTab = ref<'tasks' | 'private' | 'group'>('tasks')
const loading = ref(true)

const taskNotifications = ref<TaskNotification[]>([])
const privateMessages = ref<Message[]>([])
const groupChats = ref<Message[]>([])

const { isLoggedIn } = useAuth()

const taskUnread = computed(() => taskNotifications.value.filter(n => n.unread).length)
const privateUnread = computed(() => privateMessages.value.reduce((sum, m) => sum + m.unread, 0))
const groupUnread = computed(() => groupChats.value.reduce((sum, m) => sum + m.unread, 0))

const formatTime = (timeStr: string) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time.toLocaleDateString()
}

const switchTab = (tab: 'tasks' | 'private' | 'group') => {
  activeTab.value = tab
}

const getTaskBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    new_task: 'task-badge-new',
    task_accepted: 'task-badge-accepted',
    task_completed: 'task-badge-completed',
    task_confirmed: 'task-badge-confirmed'
  }
  return map[type] || 'task-badge-new'
}

const getTaskBadgeText = (type: string) => {
  const map: Record<string, string> = {
    new_task: '新任务',
    task_accepted: '已接单',
    task_completed: '待确认',
    task_confirmed: '已完成'
  }
  return map[type] || '通知'
}

const goToLogin = () => {
  navigateTo('/pages/login/index')
}

const loadMessages = () => {
  loading.value = true
  
  // 检查是否已登录
  if (!isLoggedIn.value) {
    setTimeout(() => {
      loading.value = false
    }, 500)
    return
  }
  
  // 获取用户专属的存储键
function getUserStorageKey(baseKey: string): string {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    return `${baseKey}_${user.phone}`
  }
  return baseKey
}

// 模拟加载延迟
setTimeout(() => {
  // 使用用户专属键加载任务通知
  const userNotifKey = getUserStorageKey('linli_task_notifications')
  const storedNotifications = localStorage.getItem(userNotifKey)
  if (storedNotifications) {
    taskNotifications.value = JSON.parse(storedNotifications)
  } else {
    // 新用户没有通知数据
    taskNotifications.value = []
    saveTaskNotifications()
  }

  // 使用用户专属键加载私信
  const userMsgKey = getUserStorageKey('linli_messages')
  const stored = localStorage.getItem(userMsgKey)
  if (stored) {
    const data = JSON.parse(stored)
    privateMessages.value = data.private || []
    groupChats.value = data.group || []
  } else {
    // 新用户没有消息数据
    privateMessages.value = []
    groupChats.value = []
    saveMessages()
  }
  
  loading.value = false
  }, 800)
}

const saveTaskNotifications = () => {
  const userNotifKey = getUserStorageKey('linli_task_notifications')
  localStorage.setItem(userNotifKey, JSON.stringify(taskNotifications.value))
}

const saveMessages = () => {
  const userMsgKey = getUserStorageKey('linli_messages')
  localStorage.setItem(userMsgKey, JSON.stringify({
    private: privateMessages.value,
    group: groupChats.value
  }))
}

const handleTaskNotification = (item: TaskNotification) => {
  if (!isLoggedIn.value) {
    toastInfo('请先登录')
    goToLogin()
    return
  }
  // 标记为已读
  if (item.unread) {
    item.unread = false
    saveTaskNotifications()
  }
  
  // 跳转到任务详情
  if (item.taskId) {
    navigateTo(`/pages/ai-helper/detail?id=${item.taskId}`)
  }
}

const goBack = () => {
  navigateBack()
}

const goToChat = (item: Message) => {
  if (!isLoggedIn.value) {
    toastInfo('请先登录')
    goToLogin()
    return
  }
  // 将未读数清零
  item.unread = 0
  saveMessages()
  navigateTo(`/pages/messages/chat?id=${item.id}&name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar)}`)
}

const goToGroup = (item: Message) => {
  if (!isLoggedIn.value) {
    toastInfo('请先登录')
    goToLogin()
    return
  }
  item.unread = 0
  saveMessages()
  navigateTo(`/pages/messages/group?id=${item.id}&name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar)}&members=${item.memberCount}`)
}

onMounted(() => {
  statusBarHeight.value = 20
  loadMessages()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.nav-header {
  background: var(--color-bg-secondary);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
}

.nav-back {
  font-size: 28px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.nav-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.nav-right {
  width: 28px;
}

/* 标签页 */
.tabs {
  display: flex;
  background: var(--color-bg-secondary);
  padding: 0 var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 52px;
  z-index: var(--z-sticky);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-md) 0;
  color: var(--color-text-tertiary);
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.tab-icon {
  font-size: 14px;
}

.tab-text {
  font-size: var(--font-size-sm);
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-item.active .tab-text {
  font-weight: var(--font-weight-semibold);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: var(--color-primary-gradient);
  border-radius: 2px;
  animation: tabSlideIn var(--transition-smooth);
}

@keyframes tabSlideIn {
  from { width: 0; }
  to { width: 32px; }
}

.unread-dot {
  position: absolute;
  top: 12px;
  right: calc(50% - 8px);
  width: 8px;
  height: 8px;
  background: var(--color-error);
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 2px var(--color-bg-secondary);
}

.unread-badge {
  position: absolute;
  top: 10px;
  right: calc(50% - 12px);
  background: var(--color-error);
  color: var(--color-text-white);
  font-size: 10px;
  font-weight: var(--font-weight-medium);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* 加载状态 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.spinner-ring {
  width: 44px;
  height: 44px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* 消息列表 */
.message-list {
  padding: var(--spacing-md) var(--spacing-lg);
}

/* 消息卡片 */
.message-item {
  display: flex;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.message-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.message-item:hover {
  border-color: var(--color-primary-soft);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.message-item:hover::before {
  opacity: 1;
}

.message-item:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* 未读消息高亮 */
.message-item.is-unread {
  background: var(--color-primary-gradient-soft);
  border-color: var(--color-primary-soft);
}

.message-item.is-unread::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

.unread-bar {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 2px var(--color-bg-secondary);
}

.message-avatar-wrap {
  position: relative;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.message-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

.type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 9px;
  font-weight: var(--font-weight-medium);
  padding: 2px 5px;
  border-radius: var(--radius-sm);
  color: var(--color-text-white);
  border: 1.5px solid var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
}

.private-badge {
  background: linear-gradient(135deg, var(--color-success), #22c55e);
}

.group-badge {
  background: linear-gradient(135deg, var(--color-info), #60a5fa);
}

.task-badge-new {
  background: var(--color-primary-gradient);
}

.task-badge-accepted {
  background: linear-gradient(135deg, var(--color-success), #22c55e);
}

.task-badge-completed {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
}

.task-badge-confirmed {
  background: linear-gradient(135deg, var(--color-info), #60a5fa);
}

.unread-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-error);
  color: var(--color-text-white);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--color-bg-secondary);
  box-shadow: var(--shadow-md);
}

.unread-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--color-error);
  border-radius: 50%;
  border: 2px solid var(--color-bg-secondary);
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 2px var(--color-bg-secondary);
}

.message-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.message-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: var(--spacing-sm);
}

.message-title.unread-text {
  font-weight: var(--font-weight-bold);
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.message-preview {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.meta-tag {
  font-size: var(--font-size-xs);
  padding: 3px 8px;
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.reward-tag {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  font-weight: var(--font-weight-medium);
}

.location-tag {
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

.group-members {
  display: flex;
  align-items: center;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.member-icon {
  margin-right: 4px;
}

.member-count {
  background: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  animation: fadeInUp var(--transition-slow) ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-illustration {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  animation: float 3s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.empty-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  text-align: center;
}

/* 未登录提示 */
.not-logged-in-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.not-logged-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.not-logged-in-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}

.not-logged-in-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.not-logged-in-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-xl);
}

.not-logged-in .login-btn {
  background: var(--color-primary-gradient);
  color: white;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-smooth);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.not-logged-in .login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
}

.not-logged-in .login-btn:active {
  transform: translateY(0);
}

.safe-area-bottom {
  height: var(--safe-area-bottom);
  padding-bottom: var(--safe-area-bottom);
}
</style>
