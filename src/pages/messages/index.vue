<template>
  <div class="page">
    <NavBar title="消息" type="white" />

    <!-- 标签页 -->
    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'tasks' }"
        @click="switchTab('tasks')"
      >
        <AppIcon class="tab-icon" name="bookmark" :size="14" />
        <span class="tab-text">任务通知</span>
        <span class="unread-dot" v-if="taskUnread > 0"></span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'private' }"
        @click="switchTab('private')"
      >
        <AppIcon class="tab-icon" name="message-circle" :size="14" />
        <span class="tab-text">私信</span>
        <span class="unread-badge" v-if="privateUnread > 0">{{ privateUnread > 99 ? '99+' : privateUnread }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'group' }"
        @click="switchTab('group')"
      >
        <AppIcon class="tab-icon" name="users" :size="14" />
        <span class="tab-text">群聊</span>
        <span class="unread-badge" v-if="groupUnread > 0">{{ groupUnread > 99 ? '99+' : groupUnread }}</span>
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="5" />

    <!-- 未登录提示 -->
    <div class="not-logged-in-container" v-else-if="!isLoggedIn">
      <div class="not-logged-in">
        <AppIcon class="not-logged-in-icon" name="lock" :size="64" />
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
            <span class="meta-tag reward-tag"><AppIcon name="activity" :size="14" /> {{ item.reward }}元</span>
            <span class="meta-tag location-tag"><AppIcon name="map-pin" :size="14" /> {{ item.location }}</span>
          </div>
        </div>
        <div class="unread-bar" v-if="item.unread"></div>
      </div>

      <EmptyState v-if="taskNotifications.length === 0 && !loading" icon="bell" title="暂无任务通知" description="任务相关的通知会在这里显示" />
    </div>

    <!-- 私信列表 -->
    <div class="message-list" v-show="activeTab === 'private' && !loading && isLoggedIn">
      <!-- 发起新私聊 -->
      <div class="new-conversation-bar" @click="startNewPrivateChat">
        <AppIcon name="message-circle" :size="18" />
        <span>发起新私聊</span>
      </div>

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

      <EmptyState v-if="privateMessages.length === 0 && !loading && isLoggedIn" icon="message-circle" title="暂无私信消息" description="和其他邻居开始对话吧" />
    </div>

    <!-- 群聊列表 -->
    <div class="message-list" v-show="activeTab === 'group' && !loading && isLoggedIn">
      <!-- 创建新群聊 -->
      <div class="new-conversation-bar" @click="startNewGroup">
        <AppIcon name="users" :size="18" />
        <span>创建新群聊</span>
      </div>

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
            <AppIcon class="member-icon" name="users" :size="14" />
            <span class="member-count">{{ item.memberCount }}人</span>
          </div>
        </div>
        <div class="unread-bar" v-if="item.unread > 0"></div>
      </div>

      <EmptyState v-if="groupChats.length === 0 && !loading && isLoggedIn" icon="users" title="暂无群聊消息" description="加入社区群组，和邻居聊天吧" />
    </div>

    <!-- 发起私聊弹窗 -->
    <div class="dialog-overlay" v-if="showNewPrivateDialog" @click="showNewPrivateDialog = false">
      <div class="dialog-panel" @click.stop>
        <div class="dialog-header">
          <span class="dialog-title">发起私聊</span>
          <span class="dialog-close" @click="showNewPrivateDialog = false">×</span>
        </div>
        <div class="dialog-body">
          <input v-model="newChatPhone" class="dialog-input" placeholder="输入对方手机号或用户ID" @keyup.enter="createPrivateChat" />
        </div>
        <div class="dialog-footer">
          <span class="dialog-btn cancel" @click="showNewPrivateDialog = false">取消</span>
          <span class="dialog-btn confirm" @click="createPrivateChat" :class="{ disabled: !newChatPhone.trim() }">开始聊天</span>
        </div>
      </div>
    </div>

    <!-- 创建群聊弹窗 -->
    <div class="dialog-overlay" v-if="showNewGroupDialog" @click="showNewGroupDialog = false">
      <div class="dialog-panel" @click.stop>
        <div class="dialog-header">
          <span class="dialog-title">创建群聊</span>
          <span class="dialog-close" @click="showNewGroupDialog = false">×</span>
        </div>
        <div class="dialog-body">
          <input v-model="newGroupName" class="dialog-input" placeholder="群聊名称（可选）" />
          <textarea v-model="newGroupMembers" class="dialog-textarea" placeholder="输入成员手机号或用户ID，每行一个" rows="4"></textarea>
        </div>
        <div class="dialog-footer">
          <span class="dialog-btn cancel" @click="showNewGroupDialog = false">取消</span>
          <span class="dialog-btn confirm" @click="createGroup">创建群聊</span>
        </div>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { navigateBack, navigateTo } from '../../utils/router'
import { useAuth } from '../../store'
import { toastInfo, toastSuccess, toastError } from '../../utils/toast'
import { localStore } from '../../services/localStore'
import { messageService } from '../../services/messageService'
import type { Conversation } from '../../services/messageService'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'

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

const { isLoggedIn, getCurrentPhone } = useAuth()

// 私聊弹窗
const showNewPrivateDialog = ref(false)
const newChatPhone = ref('')

// 群聊弹窗
const showNewGroupDialog = ref(false)
const newGroupName = ref('')
const newGroupMembers = ref('')

const taskUnread = computed(() => taskNotifications.value.filter(n => n.unread).length)
const privateUnread = computed(() => privateMessages.value.reduce((sum, m) => sum + m.unread, 0))
const groupUnread = computed(() => groupChats.value.reduce((sum, m) => sum + m.unread, 0))

const formatTime = (timeStr: string | number) => {
  if (!timeStr) return ''
  const now = new Date()
  const time = new Date(typeof timeStr === 'number' ? timeStr * 1000 : timeStr)
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

const loadMessages = async () => {
  loading.value = true

  // 未登录：直接展示空态
  if (!isLoggedIn.value) {
    loading.value = false
    return
  }

  const phone = getCurrentPhone() || undefined
  taskNotifications.value = localStore.getArray<TaskNotification>('task_notifications', [], phone)

  // 从后端加载会话列表
  try {
    const conversations = await messageService.getConversations()
    const privateConvs: Message[] = []
    const groupConvs: Message[] = []

    for (const conv of conversations) {
      const msg: Message = {
        id: conv.id,
        name: conv.name || (conv.type === 'private' ? '邻居' : '群聊'),
        avatar: conv.avatar || '',
        lastMessage: conv.lastMessage || '',
        lastTime: conv.lastMessageAt ? String(conv.lastMessageAt) : String(conv.created_at),
        unread: 0,
        type: conv.type as 'private' | 'group',
        memberCount: conv.memberCount || 0
      }
      if (conv.type === 'private') {
        privateConvs.push(msg)
      } else {
        groupConvs.push(msg)
      }
    }

    if (privateConvs.length > 0) {
      privateMessages.value = privateConvs
    } else {
      // 回退到本地存储
      const msgData = localStore.getObject<{ private: Message[]; group: Message[] }>(
        'messages',
        { private: [], group: [] },
        phone
      )
      privateMessages.value = msgData.private || []
    }

    if (groupConvs.length > 0) {
      groupChats.value = groupConvs
    } else {
      const msgData = localStore.getObject<{ private: Message[]; group: Message[] }>(
        'messages',
        { private: [], group: [] },
        phone
      )
      groupChats.value = msgData.group || []
    }
  } catch (e) {
    // API 失败，回退到本地存储
    const msgData = localStore.getObject<{ private: Message[]; group: Message[] }>(
      'messages',
      { private: [], group: [] },
      phone
    )
    privateMessages.value = msgData.private || []
    groupChats.value = msgData.group || []
  }

  loading.value = false
}

const saveTaskNotifications = () => {
  const phone = getCurrentPhone() || undefined
  localStore.setArray('task_notifications', taskNotifications.value, phone)
}

const saveMessages = () => {
  const phone = getCurrentPhone() || undefined
  localStore.setObject(
    'messages',
    { private: privateMessages.value, group: groupChats.value },
    phone
  )
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

/** 发起私聊 */
const startNewPrivateChat = () => {
  if (!isLoggedIn.value) {
    toastInfo('请先登录')
    goToLogin()
    return
  }
  showNewPrivateDialog.value = true
  newChatPhone.value = ''
}

/** 创建私聊 */
const createPrivateChat = async () => {
  const identifier = newChatPhone.value.trim()
  if (!identifier) {
    toastError('请输入对方手机号或用户ID')
    return
  }
  try {
    const result = await messageService.createConversation({
      type: 'private',
      member_ids: [identifier]
    })
    showNewPrivateDialog.value = false
    toastSuccess('会话已创建')
    // 获取对方信息
    const convDetail = await messageService.getConversation(result.id)
    const otherUser = convDetail.members.find(m => m.id !== result.created_by)
    const otherName = otherUser?.nickname || '邻居'
    const otherAvatar = otherUser?.avatar || ''
    navigateTo(`/pages/messages/chat?id=${result.id}&name=${encodeURIComponent(otherName)}&avatar=${encodeURIComponent(otherAvatar)}`)
  } catch (e: any) {
    toastError(e?.message || '创建会话失败')
  }
}

/** 发起创建群聊 */
const startNewGroup = () => {
  if (!isLoggedIn.value) {
    toastInfo('请先登录')
    goToLogin()
    return
  }
  showNewGroupDialog.value = true
  newGroupName.value = ''
  newGroupMembers.value = ''
}

/** 创建群聊 */
const createGroup = async () => {
  const members = newGroupMembers.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
  if (members.length === 0) {
    toastError('请至少添加一个成员')
    return
  }
  try {
    const result = await messageService.createConversation({
      type: 'group',
      name: newGroupName.value.trim() || undefined,
      member_ids: members
    })
    showNewGroupDialog.value = false
    toastSuccess('群聊已创建')
    navigateTo(`/pages/messages/group?id=${result.id}&name=${encodeURIComponent(newGroupName.value.trim() || '群聊')}&members=${members.length + 1}`)
  } catch (e: any) {
    toastError(e?.message || '创建群聊失败')
  }
}

onMounted(() => {
  statusBarHeight.value = 20
  loadMessages()
})

watch(isLoggedIn, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    loadMessages()
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
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

/* 新建会话栏 */
.new-conversation-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: 500;
  border: 1px dashed var(--color-primary-soft);
  transition: all var(--transition-fast);
}

.new-conversation-bar:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.new-conversation-bar:active {
  transform: scale(0.98);
}

/* 消息卡片 */
.message-item {
  display: flex;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
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
  transform: scale(0.99);
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
  border-radius: 12px;
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

/* 弹窗 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-overlay, rgba(0,0,0,0.4));
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dialog-panel {
  width: 100%;
  max-width: 380px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog-close {
  font-size: 28px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.dialog-close:hover {
  background-color: var(--color-bg-tertiary);
}

.dialog-body {
  padding: 16px 20px;
}

.dialog-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 15px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}

.dialog-input:focus {
  border-color: var(--color-primary);
}

.dialog-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 15px;
  line-height: 1.5;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  outline: none;
  resize: vertical;
  margin-top: 12px;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}

.dialog-textarea:focus {
  border-color: var(--color-primary);
}

.dialog-footer {
  display: flex;
  gap: 10px;
  padding: 12px 20px 20px;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dialog-btn.cancel {
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
}

.dialog-btn.confirm {
  color: #fff;
  background: var(--color-primary);
}

.dialog-btn.confirm.disabled {
  opacity: 0.5;
  cursor: default;
}

.dialog-btn:active:not(.disabled) {
  transform: scale(0.96);
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
}
</style>
