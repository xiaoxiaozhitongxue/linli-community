<template>
  <view class="page">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-nav">
        <text class="back-btn" @click="goBack">←</text>
        <text class="header-title">任务详情</text>
        <text class="more-btn">⋮</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 任务信息 -->
      <view class="task-card">
        <view class="task-type-tag" :class="'type-' + task.type">
          {{ getTypeName(task.type) }}
        </view>
        <text class="task-title">{{ task.title }}</text>
        <text class="task-desc">{{ task.description }}</text>
        
        <view class="task-reward">
          <text class="reward-label">悬赏金额</text>
          <text class="reward-value">¥{{ task.reward }}</text>
        </view>
      </view>

      <!-- 发布者信息 -->
      <view class="section">
        <view class="section-title">发布者</view>
        <view class="creator-card">
          <image class="creator-avatar" :src="task.creatorAvatar" mode="aspectFill" />
          <view class="creator-info">
            <text class="creator-name">{{ task.creatorName }}</text>
            <view class="creator-stats">
              <text>⭐ {{ task.creatorRating }}</text>
              <text>✅ {{ task.creatorTasks }}单完成</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 任务信息 -->
      <view class="section">
        <view class="section-title">任务信息</view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">发布时间</text>
            <text class="info-value">{{ task.createTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">任务地点</text>
            <text class="info-value">📍 {{ task.location }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">距离您</text>
            <text class="info-value">{{ task.distance }}米</text>
          </view>
          <view class="info-item">
            <text class="info-label">响应人数</text>
            <text class="info-value">{{ task.responses }}人</text>
          </view>
        </view>
      </view>

      <!-- 已响应的人 -->
      <view class="section" v-if="task.responses > 0">
        <view class="section-title">已响应 ({{ task.responses }})</view>
        <view class="responders-list">
          <view class="responder-item" v-for="responder in responders" :key="responder.id">
            <image class="responder-avatar" :src="responder.avatar" mode="aspectFill" />
            <view class="responder-info">
              <text class="responder-name">{{ responder.name }}</text>
              <text class="responder-stats">⭐ {{ responder.rating }} · {{ responder.completedTasks }}单</text>
            </view>
            <view class="select-btn" @click="selectResponder(responder)">选择</view>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action">
        <view class="action-buttons">
          <view class="contact-btn" @click="contactCreator">
            <text>💬</text>
            <text>联系发布者</text>
          </view>
          <view class="accept-btn" @click="acceptTask">
            <text>接单</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(20)

const task = ref({
  id: '1',
  type: 'delivery',
  title: '帮忙取个快递',
  description: '菜鸟驿站，3个包裹，有密码。取件码：12-3-5678',
  reward: 5,
  location: '阳光社区 菜鸟驿站',
  distance: 150,
  responses: 3,
  createTime: '10分钟前',
  creatorName: '小红',
  creatorAvatar: 'https://i.pravatar.cc/100?img=4',
  creatorRating: 4.8,
  creatorTasks: 23
})

const responders = ref([
  {
    id: '1',
    name: '王阿姨',
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 4.9,
    completedTasks: 89
  },
  {
    id: '2',
    name: '小李',
    avatar: 'https://i.pravatar.cc/100?img=2',
    rating: 4.8,
    completedTasks: 56
  }
])

onMounted(() => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    if (currentPage.options && currentPage.options.id) {
      task.value.id = currentPage.options.id
    }
  }
})

const goBack = () => {
  uni.navigateBack()
}

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    delivery: '取快递',
    shopping: '帮买菜',
    pet: '代遛狗',
    child: '接孩子'
  }
  return map[type] || type
}

const contactCreator = () => {
  uni.showToast({ title: '联系功能开发中', icon: 'none' })
}

const selectResponder = (responder: any) => {
  uni.showModal({
    title: '确认选择',
    content: `确定选择 ${responder.name} 来完成此任务吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已选择', icon: 'success' })
      }
    }
  })
}

const acceptTask = () => {
  uni.showModal({
    title: '确认接单',
    content: '确定要接下这个任务吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '接单成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-size: 20px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
}

.more-btn {
  font-size: 18px;
}

.content {
  height: calc(100vh);
  padding-bottom: 80px;
}

.task-card {
  background: var(--card-bg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

.task-type-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-bottom: var(--spacing-md);
}

.type-delivery {
  background: #E3F2FD;
  color: #2196F3;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.task-desc {
  font-size: 14px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.task-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.reward-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.reward-value {
  font-size: 24px;
  font-weight: 600;
  color: #F44336;
}

.section {
  background: var(--card-bg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.creator-card {
  display: flex;
  align-items: center;
}

.creator-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.creator-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 12px;
  color: var(--text-muted);
}

.info-list {
  
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--text-muted);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
}

.responders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.responder-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-md);
}

.responder-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
}

.responder-info {
  flex: 1;
}

.responder-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.responder-stats {
  font-size: 12px;
  color: var(--text-muted);
}

.select-btn {
  padding: 6px 16px;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  font-size: 13px;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.contact-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--text-primary);
}

.accept-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
}
</style>
