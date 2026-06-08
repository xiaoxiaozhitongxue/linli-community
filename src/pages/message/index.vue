<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="header-title">💬 消息</span>
      </div>
    </div>

    <div class="content">
      <!-- 消息列表 -->
      <div class="message-list">
        <div
          class="message-item"
          v-for="msg in messages"
          :key="msg.id"
          @click="openChat(msg)"
        >
          <div class="message-avatar-wrapper">
            <img class="message-avatar" :src="msg.avatar" />
            <span class="message-badge" v-if="msg.unread > 0">{{ msg.unread }}</span>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-name">{{ msg.name }}</span>
              <span class="message-time">{{ msg.time }}</span>
            </div>
            <span class="message-preview">{{ msg.preview }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="messages.length === 0">
        <span class="empty-icon">💬</span>
        <span class="empty-text">暂无消息</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusBarHeight = ref(20)

const messages = ref([
  {
    id: '1',
    name: '王阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1',
    preview: '好的，我下午三点可以帮你取快递',
    time: '10分钟前',
    unread: 2
  },
  {
    id: '2',
    name: '小李',
    avatar: 'https://i.pravatar.cc/100?img=2',
    preview: '谢谢你的帮助！',
    time: '30分钟前',
    unread: 0
  },
  {
    id: '3',
    name: '系统通知',
    avatar: 'https://i.pravatar.cc/100?img=10',
    preview: '您的任务已被接单',
    time: '1小时前',
    unread: 1
  }
])

const openChat = (msg: any) => {
  msg.unread = 0
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.header {
  background: linear-gradient(135deg, #2196F3, #64B5F6);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.header-content {
  text-align: center;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  display: block;
}

.content {
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.message-list {
  padding: var(--spacing-md);
}

.message-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.message-item:hover {
  background: var(--color-bg-tertiary);
}

.message-avatar-wrapper {
  position: relative;
  margin-right: var(--spacing-md);
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.message-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  background: #F44336;
  color: white;
  border-radius: 9px;
  font-size: 11px;
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
  font-weight: 500;
  color: var(--color-text-primary);
}

.message-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

.message-preview {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
