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
        :class="{ active: activeTab === 'private' }"
        @click="activeTab = 'private'"
      >
        私信
        <span class="unread-dot" v-if="privateUnread > 0"></span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'group' }"
        @click="activeTab = 'group'"
      >
        群聊
        <span class="unread-badge" v-if="groupUnread > 0">{{ groupUnread > 99 ? '99+' : groupUnread }}</span>
      </div>
    </div>

    <!-- 私信列表 -->
    <div class="message-list" v-show="activeTab === 'private'">
      <div 
        class="message-item" 
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
            <span class="message-name">{{ item.name }}</span>
            <span class="message-time">{{ formatTime(item.lastTime) }}</span>
          </div>
          <div class="message-preview">{{ item.lastMessage }}</div>
        </div>
      </div>

      <div class="empty-state" v-if="privateMessages.length === 0">
        <span class="empty-icon">💬</span>
        <span class="empty-text">暂无私信消息</span>
      </div>
    </div>

    <!-- 群聊列表 -->
    <div class="message-list" v-show="activeTab === 'group'">
      <div 
        class="message-item" 
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
            <span class="message-name">{{ item.name }}</span>
            <span class="message-time">{{ formatTime(item.lastTime) }}</span>
          </div>
          <div class="message-preview">{{ item.lastMessage }}</div>
          <div class="group-members">
            <span class="member-icon">👥</span>
            <span class="member-count">{{ item.memberCount }}人</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-if="groupChats.length === 0">
        <span class="empty-icon">👥</span>
        <span class="empty-text">暂无群聊消息</span>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateBack, navigateTo } from '../../utils/router'

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

const statusBarHeight = ref(20)
const activeTab = ref<'private' | 'group'>('private')

const privateMessages = ref<Message[]>([])
const groupChats = ref<Message[]>([])

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

const loadMessages = () => {
  const stored = localStorage.getItem('linli_messages')
  if (stored) {
    const data = JSON.parse(stored)
    privateMessages.value = data.private || []
    groupChats.value = data.group || []
  } else {
    // Mock 数据 - 3条私信
    privateMessages.value = [
      {
        id: 'p1',
        name: '王阿姨',
        avatar: 'https://i.pravatar.cc/100?img=20',
        lastMessage: '明天一起去买菜吗？',
        lastTime: new Date(Date.now() - 1800000).toISOString(),
        unread: 2,
        type: 'private'
      },
      {
        id: 'p2',
        name: '李叔叔',
        avatar: 'https://i.pravatar.cc/100?img=33',
        lastMessage: '活动已经开始了，你到哪了？',
        lastTime: new Date(Date.now() - 7200000).toISOString(),
        unread: 0,
        type: 'private'
      },
      {
        id: 'p3',
        name: '物业小张',
        avatar: 'https://i.pravatar.cc/100?img=8',
        lastMessage: '您的报修单已处理完成',
        lastTime: new Date(Date.now() - 86400000).toISOString(),
        unread: 1,
        type: 'private'
      }
    ]

    // Mock 数据 - 2个群聊
    groupChats.value = [
      {
        id: 'g1',
        name: '邻里互助群',
        avatar: 'https://i.pravatar.cc/100?img=50',
        lastMessage: '张大爷：谁能帮忙带袋米？',
        lastTime: new Date(Date.now() - 600000).toISOString(),
        unread: 5,
        type: 'group',
        memberCount: 128
      },
      {
        id: 'g2',
        name: '广场舞爱好者',
        avatar: 'https://i.pravatar.cc/100?img=45',
        lastMessage: '李姐：明天早上7点老地方见',
        lastTime: new Date(Date.now() - 3600000).toISOString(),
        unread: 0,
        type: 'group',
        memberCount: 45
      }
    ]

    saveMessages()
  }
}

const saveMessages = () => {
  localStorage.setItem('linli_messages', JSON.stringify({
    private: privateMessages.value,
    group: groupChats.value
  }))
}

const goBack = () => {
  navigateBack()
}

const goToChat = (item: Message) => {
  // 将未读数清零
  item.unread = 0
  saveMessages()
  navigateTo(`/pages/messages/chat?id=${item.id}&name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar)}`)
}

const goToGroup = (item: Message) => {
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
  background-color: var(--bg-color);
}

.nav-header {
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.nav-back {
  font-size: 28px;
  color: var(--text-primary);
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-right {
  width: 28px;
}

.tabs {
  display: flex;
  background: var(--card-bg);
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 15px;
  color: var(--text-muted);
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
}

.unread-dot {
  position: absolute;
  top: 8px;
  right: calc(50% - 20px);
  width: 8px;
  height: 8px;
  background: #F44336;
  border-radius: 50%;
}

.unread-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 24px);
  background: #F44336;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.message-list {
  padding: 8px 16px;
}

.message-item {
  display: flex;
  padding: 12px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.message-avatar-wrap {
  position: relative;
  margin-right: 12px;
}

.message-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}

.type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 4px;
  color: white;
}

.private-badge {
  background: #4CAF50;
}

.group-badge {
  background: #2196F3;
}

.unread-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #F44336;
  color: white;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
}

.message-preview {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-members {
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.member-icon {
  margin-right: 2px;
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
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

.safe-area-bottom {
  height: 20px;
}
</style>
