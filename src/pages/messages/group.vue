<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="nav-content">
        <span class="nav-back" @click="goBack">‹</span>
        <div class="nav-group" @click="showMembers = true">
          <span class="nav-name">{{ groupInfo.name }}</span>
          <span class="nav-members">{{ groupInfo.memberCount }}人 ›</span>
        </div>
        <span class="nav-right"></span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="chat-list" ref="chatListRef">
      <div 
        class="message-item"
        :class="{ 'message-self': msg.isSelf, 'message-other': !msg.isSelf, 'message-system': msg.isSystem }"
        v-for="(msg, index) in messages" 
        :key="index"
      >
        <template v-if="msg.isSystem">
          <div class="system-message">{{ msg.content }}</div>
        </template>
        <template v-else>
          <img 
            class="chat-avatar" 
            :src="msg.isSelf ? myAvatar : msg.avatar" 
          />
          <div class="message-body">
            <div class="message-sender" v-if="!msg.isSelf">{{ msg.senderName }}</div>
            <div class="message-bubble" :class="{ 'bubble-self': msg.isSelf, 'bubble-other': !msg.isSelf }">
              <div class="bubble-content">{{ msg.content }}</div>
              <div class="bubble-time">{{ formatTime(msg.time) }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <input 
          class="message-input" 
          v-model="inputText" 
          placeholder="输入群消息..."
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
          发送
        </button>
      </div>
    </div>

    <!-- 群成员弹窗 -->
    <div class="members-overlay" v-if="showMembers" @click="showMembers = false">
      <div class="members-panel" @click.stop>
        <div class="panel-header">
          <span class="panel-title">群成员</span>
          <span class="panel-close" @click="showMembers = false">×</span>
        </div>
        <div class="members-list">
          <div class="member-item" v-for="member in members" :key="member.id">
            <img class="member-avatar" :src="member.avatar" />
            <div class="member-info">
              <span class="member-name">{{ member.name }}</span>
              <span class="member-role" v-if="member.role">{{ member.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { navigateBack } from '../../utils/router'
import { useRoute } from 'vue-router'
import { loadUserData, saveUserData, loadUserInfo } from '../../utils/storage'

interface GroupMessage {
  id: string
  senderId: string
  senderName: string
  avatar: string
  content: string
  time: string
  isSelf: boolean
  isSystem?: boolean
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  role?: string
}

const route = useRoute()
const statusBarHeight = ref(20)
const chatListRef = ref<HTMLElement | null>(null)
const showMembers = ref(false)

const groupInfo = ref({
  id: '',
  name: '',
  avatar: '',
  memberCount: 0
})

const myAvatar = ref('https://i.pravatar.cc/100?img=10')
const myName = ref('我')
const inputText = ref('')
const messages = ref<GroupMessage[]>([])

const members = ref<GroupMember[]>([])

const formatTime = (timeStr: string) => {
  const time = new Date(timeStr)
  return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  })
}

const getGroupKey = () => `linli_group_${groupInfo.value.id}`

const loadGroupChat = () => {
  const groupId = route.query.id as string
  groupInfo.value = {
    id: groupId,
    name: decodeURIComponent(route.query.name as string || '群聊'),
    avatar: decodeURIComponent(route.query.avatar as string || 'https://i.pravatar.cc/100?img=50'),
    memberCount: parseInt(route.query.members as string) || 0
  }

  // 加载我的信息（统一入口，按用户隔离）
  const savedUser = loadUserInfo()
  if (savedUser) {
    myAvatar.value = savedUser.avatar || myAvatar.value
    myName.value = savedUser.nickname || '我'
  }

  // 加载群成员
  members.value = [
    { id: '1', name: '张大爷', avatar: 'https://i.pravatar.cc/100?img=60', role: '群主' },
    { id: '2', name: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=21' },
    { id: '3', name: '李姐', avatar: 'https://i.pravatar.cc/100?img=25' },
    { id: '4', name: '刘叔', avatar: 'https://i.pravatar.cc/100?img=35' },
    { id: '5', name: '赵妹', avatar: 'https://i.pravatar.cc/100?img=30' }
  ]

  // 群聊记录按"当前用户 + 群"隔离
  const stored = loadUserData<GroupMessage[] | null>(getGroupKey(), null)
  if (stored) {
    messages.value = stored
  } else {
    const now = Date.now()
    messages.value = [
      {
        id: '1',
        senderId: '1',
        senderName: '张大爷',
        avatar: 'https://i.pravatar.cc/100?img=60',
        content: '大家好，欢迎来到邻里互助群！',
        time: new Date(now - 7200000).toISOString(),
        isSelf: false,
        isSystem: false
      },
      {
        id: '2',
        senderId: '2',
        senderName: '王阿姨',
        avatar: 'https://i.pravatar.cc/100?img=21',
        content: '群主好！以后多多关照',
        time: new Date(now - 7100000).toISOString(),
        isSelf: false
      },
      {
        id: '3',
        senderId: '3',
        senderName: '李姐',
        avatar: 'https://i.pravatar.cc/100?img=25',
        content: '有人知道附近哪有便宜的菜市场吗？',
        time: new Date(now - 3600000).toISOString(),
        isSelf: false
      },
      {
        id: '4',
        senderId: '4',
        senderName: '刘叔',
        avatar: 'https://i.pravatar.cc/100?img=35',
        content: '小区东门外面有一个，每天早上7点前去最便宜',
        time: new Date(now - 3500000).toISOString(),
        isSelf: false
      },
      {
        id: '5',
        senderId: '2',
        senderName: '王阿姨',
        avatar: 'https://i.pravatar.cc/100?img=21',
        content: '太好了，谢谢刘叔！',
        time: new Date(now - 3400000).toISOString(),
        isSelf: false
      }
    ]
    saveMessages()
  }
}

const saveMessages = () => {
  saveUserData<GroupMessage[]>(getGroupKey(), messages.value)
}

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text) return

  const newMsg: GroupMessage = {
    id: Date.now().toString(),
    senderId: 'me',
    senderName: myName.value,
    avatar: myAvatar.value,
    content: text,
    time: new Date().toISOString(),
    isSelf: true
  }

  messages.value.push(newMsg)
  inputText.value = ''
  saveMessages()
  scrollToBottom()

  // 模拟其他群成员回复
  setTimeout(() => {
    const replies = [
      { name: '王阿姨', avatar: 'https://i.pravatar.cc/100?img=21', content: '收到！' },
      { name: '李姐', avatar: 'https://i.pravatar.cc/100?img=25', content: '好的，明白了' },
      { name: '刘叔', avatar: 'https://i.pravatar.cc/100?img=35', content: '没问题' }
    ]
    const reply = replies[Math.floor(Math.random() * replies.length)]
    const replyMsg: GroupMessage = {
      id: (Date.now() + 1).toString(),
      senderId: 'other',
      senderName: reply.name,
      avatar: reply.avatar,
      content: reply.content,
      time: new Date().toISOString(),
      isSelf: false
    }
    messages.value.push(replyMsg)
    saveMessages()
    scrollToBottom()
  }, 1500 + Math.random() * 1000)
}

const goBack = () => {
  navigateBack()
}

onMounted(() => {
  statusBarHeight.value = 20
  loadGroupChat()
  scrollToBottom()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.nav-header {
  background: var(--color-bg-secondary);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.nav-back {
  font-size: 28px;
  color: var(--color-text-primary);
  cursor: pointer;
  width: 60px;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back:hover {
  background-color: var(--color-bg-tertiary);
}

.nav-group {
  flex: 1;
  text-align: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  padding: 4px 8px;
  border-radius: var(--radius-md);
}

.nav-group:hover {
  background-color: var(--color-bg-tertiary);
}

.nav-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.nav-members {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.nav-right {
  width: 60px;
}

.chat-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 0;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-self {
  flex-direction: row-reverse;
}

.message-other {
  flex-direction: row;
}

.message-system {
  justify-content: center;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.message-body {
  max-width: 70%;
  margin: 0 8px;
}

.message-sender {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-bottom: 2px;
  margin-left: 12px;
}

.message-self .message-sender {
  text-align: right;
  margin-right: 12px;
  margin-left: 0;
}

.message-bubble {
  display: flex;
  flex-direction: column;
}

.message-self .message-bubble {
  align-items: flex-end;
}

.bubble-content {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
}

.bubble-self .bubble-content {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-bottom-right-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.bubble-other .bubble-content {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-bottom-left-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.bubble-time {
  font-size: 10px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.system-message {
  font-size: 12px;
  color: var(--color-text-tertiary);
  background: var(--color-bg-tertiary);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}

.input-area {
  background: var(--color-bg-secondary);
  padding: 12px 16px;
  flex-shrink: 0;
  border-top: 1px solid var(--color-border-light);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-full);
  font-size: 15px;
  outline: none;
  background: var(--color-bg-tertiary);
  transition: all var(--transition-normal);
}

.message-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  background: var(--color-bg-secondary);
}

.send-btn {
  width: 64px;
  height: 40px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border: none;
  border-radius: var(--radius-full);
  font-size: 15px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-smooth);
}

.send-btn:hover:not(:disabled) {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

/* 群成员弹窗 */
.members-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-overlay);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.members-panel {
  width: 100%;
  max-height: 70vh;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.panel-close {
  font-size: 28px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.panel-close:hover {
  background-color: var(--color-bg-tertiary);
}

.members-list {
  max-height: calc(70vh - 60px);
  overflow-y: auto;
  padding: 8px 16px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
  transition: background-color var(--transition-fast);
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.member-item:hover {
  background-color: var(--color-bg-tertiary);
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  object-fit: cover;
  margin-right: 12px;
}

.member-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-size: 15px;
  color: var(--color-text-primary);
}

.member-role {
  font-size: 10px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.safe-area-bottom {
  height: 20px;
}
</style>
