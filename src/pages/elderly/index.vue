<template>
  <view class="page">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <text class="header-title">👴 老人关怀</text>
        <text class="header-subtitle">邻里相助，温情常在</text>
      </view>
    </view>

    <scroll-view class="content" scroll-y>
      <!-- 紧急求助 -->
      <view class="emergency-section">
        <view class="emergency-btn" @click="triggerEmergency">
          <text class="emergency-icon">🆘</text>
          <text class="emergency-text">紧急求助</text>
        </view>
        <text class="emergency-hint">点击按钮，一键呼叫志愿者</text>
      </view>

      <!-- 快捷服务 -->
      <view class="services-grid">
        <view class="service-card" v-for="service in services" :key="service.id" @click="useService(service)">
          <view class="service-icon" :style="{ background: service.bgColor }">
            <text>{{ service.icon }}</text>
          </view>
          <text class="service-name">{{ service.name }}</text>
          <text class="service-desc">{{ service.desc }}</text>
        </view>
      </view>

      <!-- 帮扶记录 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📋 最近帮扶</text>
          <text class="section-more">查看全部 ></text>
        </view>
        <view class="record-list">
          <view class="record-item" v-for="record in recentRecords" :key="record.id">
            <view class="record-icon" :style="{ background: record.bgColor }">
              <text>{{ record.icon }}</text>
            </view>
            <view class="record-info">
              <text class="record-type">{{ record.type }}</text>
              <text class="record-date">{{ record.date }}</text>
            </view>
            <view class="record-status" :class="'status-' + record.status">
              {{ getStatusName(record.status) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 志愿者招募 -->
      <view class="volunteer-section">
        <view class="volunteer-header">
          <view class="volunteer-title">
            <text>❤️ 志愿者招募</text>
          </view>
          <text class="volunteer-subtitle">join us</text>
        </view>
        <view class="volunteer-content">
          <view class="volunteer-stats">
            <view class="stat-item">
              <text class="stat-value">{{ volunteerStats. volunteers }}</text>
              <text class="stat-label">志愿者</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ volunteerStats.hours }}</text>
              <text class="stat-label">服务时长</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ volunteerStats.seniors }}</text>
              <text class="stat-label">关怀老人</text>
            </view>
          </view>
          <view class="volunteer-join" @click="joinVolunteer">
            <text>成为志愿者</text>
          </view>
        </view>
      </view>

      <!-- 定期探访计划 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📅 定期探访</text>
        </view>
        <view class="visit-plan">
          <view class="visit-header">
            <image class="elder-avatar" :src="currentElder.avatar" mode="aspectFill" />
            <view class="elder-info">
              <text class="elder-name">{{ currentElder.name }}</text>
              <text class="elder-info-text">{{ currentElder.address }}</text>
            </view>
            <view class="visit-status">
              <text class="visit-next">下次探访</text>
              <text class="visit-date">{{ currentElder.nextVisit }}</text>
            </view>
          </view>
          <view class="visit-schedule">
            <view class="schedule-item" v-for="(item, index) in visitSchedule" :key="index">
              <view class="schedule-dot" :class="{ completed: item.completed }"></view>
              <view class="schedule-content">
                <text class="schedule-title">{{ item.title }}</text>
                <text class="schedule-date">{{ item.date }}</text>
              </view>
              <text class="schedule-status" v-if="item.completed">✅</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 关怀技巧 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📚 关怀技巧</text>
        </view>
        <view class="tips-list">
          <view class="tip-card" v-for="tip in careTips" :key="tip.id" @click="goToTipDetail(tip)">
            <view class="tip-cover" :style="{ background: tip.bgColor }">
              <text class="tip-icon">{{ tip.icon }}</text>
            </view>
            <view class="tip-content">
              <text class="tip-title">{{ tip.title }}</text>
              <text class="tip-desc">{{ tip.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const statusBarHeight = ref(20)

const services = ref([
  { 
    id: '1', 
    name: '帮买菜', 
    icon: '🛒', 
    desc: '代购生活用品',
    bgColor: '#E8F5E9'
  },
  { 
    id: '2', 
    name: '陪诊服务', 
    icon: '🏥', 
    desc: '陪同就医',
    bgColor: '#E3F2FD'
  },
  { 
    id: '3', 
    name: '暖心陪聊', 
    icon: '💬', 
    desc: '视频/语音陪伴',
    bgColor: '#FFF3E0'
  },
  { 
    id: '4', 
    name: '家政服务', 
    icon: '🧹', 
    desc: '打扫卫生',
    bgColor: '#FCE4EC'
  },
  { 
    id: '5', 
    name: '代取快递', 
    icon: '📦', 
    desc: '帮忙取件',
    bgColor: '#F3E5F5'
  },
  { 
    id: '6', 
    name: '维修服务', 
    icon: '🔧', 
    desc: '小修小补',
    bgColor: '#E0F2F1'
  }
])

const recentRecords = ref([
  { 
    id: '1', 
    type: '帮买菜', 
    icon: '🛒',
    date: '今天 10:30', 
    status: 'completed',
    bgColor: '#E8F5E9'
  },
  { 
    id: '2', 
    type: '陪诊服务', 
    icon: '🏥',
    date: '昨天 14:00', 
    status: 'completed',
    bgColor: '#E3F2FD'
  },
  { 
    id: '3', 
    type: '定期探访', 
    icon: '👵',
    date: '3天前', 
    status: 'completed',
    bgColor: '#FFF3E0'
  }
])

const volunteerStats = ref({
  volunteers: 89,
  hours: 1560,
  seniors: 234
})

const currentElder = ref({
  name: '张奶奶',
  avatar: 'https://i.pravatar.cc/100?img=8',
  address: '阳光社区 5号楼 301',
  nextVisit: '6月10日'
})

const visitSchedule = ref([
  { title: '日常探访', date: '6月1日', completed: true },
  { title: '帮买药品', date: '6月3日', completed: true },
  { title: '陪聊服务', date: '6月5日', completed: true },
  { title: '定期探访', date: '6月10日', completed: false }
])

const careTips = ref([
  {
    id: '1',
    title: '如何与老人有效沟通',
    desc: '倾听、耐心、尊重是沟通的关键...',
    icon: '💡',
    bgColor: '#FFF9C4'
  },
  {
    id: '2',
    title: '老人心理关怀要点',
    desc: '关注情绪变化，及时疏导...',
    icon: '🧠',
    bgColor: '#E1BEE7'
  },
  {
    id: '3',
    title: '急救知识科普',
    desc: '心肺复苏、海姆立克急救法...',
    icon: '🏥',
    bgColor: '#FFCCBC'
  }
])

const triggerEmergency = () => {
  uni.showModal({
    title: '紧急求助',
    content: '确定要发起紧急求助吗？志愿者会立即收到通知。',
    confirmText: '确认求助',
    confirmColor: '#F44336',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ 
          title: '已通知志愿者', 
          icon: 'success',
          duration: 3000
        })
      }
    }
  })
}

const useService = (service: any) => {
  uni.navigateTo({ 
    url: `/pages/elderly/service-request?type=${service.id}&name=${service.name}` 
  })
}

const joinVolunteer = () => {
  uni.navigateTo({ url: '/pages/elderly/become-volunteer' })
}

const goToTipDetail = (tip: any) => {
  uni.navigateTo({ url: `/pages/elderly/tip-detail?id=${tip.id}` })
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    ongoing: '进行中',
    pending: '待处理'
  }
  return map[status] || status
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, #E91E63, #F48FB1);
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
  margin-bottom: var(--spacing-xs);
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
}

.content {
  height: calc(100vh);
}

/* 紧急求助 */
.emergency-section {
  padding: var(--spacing-xl);
  text-align: center;
}

.emergency-btn {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F44336, #E53935);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  box-shadow: 0 8px 32px rgba(244, 67, 54, 0.4);
}

.emergency-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
}

.emergency-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.emergency-hint {
  font-size: 13px;
  color: var(--text-muted);
}

/* 服务网格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
}

.service-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto var(--spacing-sm);
}

.service-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.service-desc {
  font-size: 11px;
  color: var(--text-muted);
}

/* 区块 */
.section {
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-more {
  font-size: 12px;
  color: var(--text-muted);
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.record-item {
  background: var(--card-bg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: var(--spacing-md);
}

.record-info {
  flex: 1;
}

.record-type {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.record-date {
  font-size: 12px;
  color: var(--text-muted);
}

.record-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 10px;
}

.status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-ongoing {
  background: #FFF3E0;
  color: #FF9800;
}

.status-pending {
  background: #E3F2FD;
  color: #2196F3;
}

/* 志愿者招募 */
.volunteer-section {
  margin: var(--spacing-lg);
  background: linear-gradient(135deg, #FF5252, #FF4081);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  color: white;
}

.volunteer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.volunteer-title {
  font-size: 18px;
  font-weight: 600;
}

.volunteer-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.volunteer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.volunteer-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  display: block;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.volunteer-join {
  background: white;
  color: #E91E63;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 20px;
  font-weight: 500;
}

/* 探访计划 */
.visit-plan {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.visit-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.elder-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
}

.elder-info {
  flex: 1;
}

.elder-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.elder-info-text {
  font-size: 12px;
  color: var(--text-muted);
}

.visit-status {
  text-align: right;
}

.visit-next {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
}

.visit-date {
  font-size: 14px;
  font-weight: 500;
  color: #E91E63;
}

.visit-schedule {
  display: flex;
  flex-direction: column;
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.schedule-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--border-color);
  margin-right: var(--spacing-md);
}

.schedule-dot.completed {
  background: #4CAF50;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-size: 14px;
  color: var(--text-primary);
  display: block;
}

.schedule-date {
  font-size: 12px;
  color: var(--text-muted);
}

.schedule-status {
  font-size: 16px;
}

/* 关怀技巧 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tip-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.tip-cover {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
}

.tip-icon {
  font-size: 28px;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.tip-desc {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
