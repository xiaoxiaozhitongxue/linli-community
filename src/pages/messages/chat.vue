<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="nav-content">
        <span class="nav-back" @click="goBack">‹</span>
        <div class="nav-user">
          <div class="avatar-wrap" v-if="chatUser.avatar">
            <img class="nav-avatar" :src="chatUser.avatar" />
          </div>
          <div v-else class="nav-avatar avatar-placeholder">{{ (chatUser.name || '邻').charAt(0) }}</div>
          <span class="nav-name">{{ chatUser.name }}</span>
        </div>
        <span class="nav-right"></span>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="chat-list" ref="chatListRef">
      <div 
        class="message-item"
        :class="{ 'message-self': msg.isSelf, 'message-other': !msg.isSelf }"
        v-for="(msg, index) in messages" 
        :key="index"
      >
        <template v-if="!msg.isSystem">
          <div class="avatar-wrap" v-if="msg.isSelf ? myAvatar : chatUser.avatar">
            <img class="chat-avatar" :src="msg.isSelf ? myAvatar : chatUser.avatar" />
          </div>
          <div v-else class="chat-avatar avatar-placeholder">{{ (msg.isSelf ? '我' : chatUser.name || '邻').charAt(0) }}</div>
        </template>
        <div class="message-bubble" :class="{ 'bubble-self': msg.isSelf, 'bubble-other': !msg.isSelf }" v-if="!msg.isSystem">
          <div class="bubble-content">{{ msg.content }}</div>
          <div class="bubble-time">{{ formatTime(msg.time) }}</div>
        </div>
        <div class="system-message" v-else>
          {{ msg.content }}
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <input 
          class="message-input" 
          v-model="inputText" 
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
          发送
        </button>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { navigateBack } from '../../utils/router'
import { useRoute } from 'vue-router'

interface ChatMessage {
  id: string
  content: string
  time: string
  isSelf: boolean
  isSystem?: boolean
}

const route = useRoute()
const statusBarHeight = ref(20)
const chatListRef = ref<HTMLElement | null>(null)

const chatUser = ref({
  id: '',
  name: '',
  avatar: ''
})

const myAvatar = ref('')
const inputText = ref('')
const messages = ref<ChatMessage[]>([])

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

const getChatKey = () => `linli_chat_${chatUser.value.id}`

const loadMessages = () => {
  const chatId = route.query.id as string
  chatUser.value = {
    id: chatId,
    name: decodeURIComponent(route.query.name as string || '未知用户'),
    avatar: decodeURIComponent(route.query.avatar as string || '')
  }

  // 加载我的头像
  const storedUser = localStorage.getItem('linli_user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    myAvatar.value = user.avatar || myAvatar.value
  }

  const stored = localStorage.getItem(getChatKey())
  if (stored) {
    messages.value = JSON.parse(stored)
  } else {
    // Mock 初始消息
    messages.value = [
      {
        id: '1',
        content: '你好啊，最近怎么样？',
        time: new Date(Date.now() - 3600000).toISOString(),
        isSelf: false
      },
      {
        id: '2',
        content: '挺好的，谢谢关心！',
        time: new Date(Date.now() - 3500000).toISOString(),
        isSelf: true
      },
      {
        id: '3',
        content: '那就好，有空一起吃饭啊',
        time: new Date(Date.now() - 3400000).toISOString(),
        isSelf: false
      }
    ]
  }
}

const saveMessages = () => {
  localStorage.setItem(getChatKey(), JSON.stringify(messages.value))
}

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text) return

  const newMsg: ChatMessage = {
    id: Date.now().toString(),
    content: text,
    time: new Date().toISOString(),
    isSelf: true
  }

  messages.value.push(newMsg)
  inputText.value = ''
  saveMessages()
  scrollToBottom()

  // 模拟对方回复
  setTimeout(() => {
    const replies = [
      '好的，收到！',
      '嗯嗯，明白了',
      '哈哈，太有趣了',
      '没问题！',
      '太好了！'
    ]
    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: replies[Math.floor(Math.random() * replies.length)],
      time: new Date().toISOString(),
      isSelf: false
    }
    messages.value.push(replyMsg)
    saveMessages()
    scrollToBottom()
  }, 1000 + Math.random() * 1000)
}

const goBack = () => {
  navigateBack()
}

onMounted(() => {
  statusBarHeight.value = 20
  loadMessages()
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

.nav-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.nav-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.nav-right {
  width: 60px;
  text-align: right;
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
  align-items: flex-end;
}

.message-self {
  flex-direction: row-reverse;
}

.message-other {
  flex-direction: row;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  margin: 0 8px;
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
  text-align: right;
}

.bubble-other .bubble-time {
  text-align: left;
}

.system-message {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-tertiary);
  padding: 8px 0;
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

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft, rgba(255,107,53,0.1));
  color: var(--color-primary, #FF6B35);
  font-size: 14px;
  font-weight: 600;
}

.safe-area-bottom {
  height: 20px;
}
</style>
