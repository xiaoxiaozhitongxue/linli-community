<template>
  <div class="page">
    <NavBar title="聊天" type="white" />

    <!-- 消息列表 -->
    <div class="chat-list" ref="chatListRef">
      <div class="load-more" v-if="hasMore" @click="loadMoreMessages">加载更多…</div>
      <div 
        class="message-item"
        :class="{ 'message-self': msg.isSelf, 'message-other': !msg.isSelf }"
        v-for="(msg, index) in messages" 
        :key="msg.id || index"
      >
        <template v-if="!msg.isSystem">
          <div class="avatar-wrap" v-if="msg.isSelf ? myAvatar : chatUser.avatar">
            <img class="chat-avatar" :src="msg.isSelf ? myAvatar : chatUser.avatar" />
          </div>
          <div v-else class="chat-avatar avatar-placeholder">{{ (msg.isSelf ? '我' : chatUser.name || '邻').charAt(0) }}</div>
        </template>
        <div class="message-bubble" :class="{ 'bubble-self': msg.isSelf, 'bubble-other': !msg.isSelf }" v-if="!msg.isSystem">
          <div class="bubble-content">{{ msg.content }}</div>
          <div class="bubble-time">{{ formatTime(msg.time || msg.createdAt || 0) }}</div>
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
        <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || sending">
          发送
        </button>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { navigateBack } from '../../utils/router'
import { useRoute } from 'vue-router'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { messageService } from '../../services/messageService'
import type { MessageItem } from '../../services/messageService'
import NavBar from '../../components/NavBar.vue'

interface ChatMessage {
  id: string
  content: string
  time: string | number
  createdAt?: number
  isSelf: boolean
  isSystem?: boolean
}

const route = useRoute()
const { user } = useAuth()
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
const sending = ref(false)
const currentPage = ref(1)
const hasMore = ref(false)

const formatTime = (timeStr: string | number) => {
  if (!timeStr) return ''
  const time = new Date(typeof timeStr === 'number' ? timeStr * 1000 : timeStr)
  return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  })
}

const chatId = ref('')
const getChatKey = () => `chat_${chatId.value}`

const loadMessages = async () => {
  chatId.value = (route.query.id as string) || ''
  chatUser.value = {
    id: chatId.value,
    name: decodeURIComponent((route.query.name as string) || '未知用户'),
    avatar: decodeURIComponent((route.query.avatar as string) || '')
  }

  // 加载我的头像（与登录态一致，从 auth store 读取）
  myAvatar.value = user.value?.avatar || ''

  // 优先从后端加载
  if (chatId.value) {
    try {
      const result = await messageService.getMessages(chatId.value, 1, 50)
      if (result.items && result.items.length > 0) {
        messages.value = result.items.map((msg: MessageItem) => ({
          id: msg.id,
          content: msg.content,
          time: msg.createdAt,
          createdAt: msg.createdAt,
          isSelf: msg.isSelf,
          isSystem: false
        }))
        hasMore.value = result.total > result.items.length
        currentPage.value = 1
        scrollToBottom()
        startPolling()
        return
      }
    } catch (e) {
      // API 失败，回退到本地存储
    }
  }

  // 回退到 localStorage
  const stored = localStore.getArray<ChatMessage>(getChatKey(), [])
  if (stored.length > 0) {
    messages.value = stored
  } else {
    // 初始示例消息
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
    localStore.setArray(getChatKey(), messages.value)
  }
  scrollToBottom()
}

const loadMoreMessages = async () => {
  if (!chatId.value || !hasMore.value) return
  try {
    const nextPage = currentPage.value + 1
    const result = await messageService.getMessages(chatId.value, nextPage, 50)
    if (result.items && result.items.length > 0) {
      const olderMessages = result.items.map((msg: MessageItem) => ({
        id: msg.id,
        content: msg.content,
        time: msg.createdAt,
        createdAt: msg.createdAt,
        isSelf: msg.isSelf,
        isSystem: false
      }))
      messages.value = [...olderMessages, ...messages.value]
      currentPage.value = nextPage
      hasMore.value = result.total > nextPage * result.limit
    } else {
      hasMore.value = false
    }
  } catch (e) {
    // ignore
  }
}

const saveMessages = () => {
  localStore.setArray(getChatKey(), messages.value)
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || sending.value) return

  sending.value = true

  // 乐观更新
  const tempId = Date.now().toString()
  const newMsg: ChatMessage = {
    id: tempId,
    content: text,
    time: new Date().toISOString(),
    isSelf: true
  }
  messages.value.push(newMsg)
  inputText.value = ''
  scrollToBottom()

  // 尝试发送到后端
  if (chatId.value) {
    try {
      const sent = await messageService.sendMessage(chatId.value, text)
      // 用服务器返回的消息替换临时消息
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx >= 0) {
        messages.value[idx] = {
          id: sent.id,
          content: sent.content,
          time: sent.createdAt,
          createdAt: sent.createdAt,
          isSelf: true
        }
      }
      saveMessages()
    } catch (e) {
      // 发送失败但保留本地消息
      saveMessages()
    }
  } else {
    saveMessages()
  }
  sending.value = false
}

// ============ 实时轮询（每5秒拉取最新消息）============
const POLL_INTERVAL = 5000
let pollTimer = 0

function startPolling() {
  stopPolling()
  pollTimer = window.setInterval(async () => {
    if (!chatId.value) return
    try {
      // 取最新消息的时间戳作为 before 参数，避免重复
      const latestMsg = messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
      const before = latestMsg?.createdAt || latestMsg?.time || 0
      const result = await messageService.getMessages(chatId.value, 1, 10)
      if (result.items && result.items.length > 0) {
        // 只追加比最新消息更新的消息
        const existingIds = new Set(messages.value.map(m => m.id))
        const newMsgs = result.items
          .filter(msg => !existingIds.has(msg.id))
          .map(msg => ({
            id: msg.id,
            content: msg.content,
            time: msg.createdAt,
            createdAt: msg.createdAt,
            isSelf: msg.isSelf,
            isSystem: false
          }))
        if (newMsgs.length > 0) {
          // 轮询返回的是最新的在前，需要反转
          newMsgs.reverse()
          messages.value.push(...newMsgs)
          saveMessages()
          scrollToBottom()
        }
      }
    } catch {
      // 轮询失败静默忽略
    }
  }, POLL_INTERVAL)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = 0
  }
}

const goBack = () => {
  navigateBack()
}

onMounted(() => {
  statusBarHeight.value = 20
  loadMessages()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
}

.chat-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  min-height: 0;
}

.load-more {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  cursor: pointer;
}

.load-more:hover {
  color: var(--color-primary);
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
