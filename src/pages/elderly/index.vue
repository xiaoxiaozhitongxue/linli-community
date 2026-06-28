<template>
  <div class="page">
    <!-- 顶部区域 -->
    <div class="header">
      <div class="header-content">
        <span class="header-title">👴 老人关怀</span>
        <span class="header-subtitle">邻里相助，温情常在</span>
      </div>
    </div>

    <div class="content" style="overflow-y: auto; height: calc(100vh - 120px);">
      <!-- 紧急求助 -->
      <div class="emergency-section">
        <div class="emergency-btn" @click="triggerEmergency">
          <span class="emergency-icon">🆘</span>
          <span class="emergency-text">紧急求助</span>
        </div>
        <span class="emergency-hint">点击按钮，一键呼叫志愿者</span>
      </div>

      <!-- 快捷服务 -->
      <div class="services-grid">
        <div class="service-card" v-for="service in services" :key="service.id" @click="useService(service)">
          <div class="service-icon" :style="{ background: service.bgColor }">
            <span>{{ service.icon }}</span>
          </div>
          <span class="service-name">{{ service.name }}</span>
          <span class="service-desc">{{ service.desc }}</span>
        </div>
      </div>

      <!-- 帮扶记录 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">📋 最近帮扶</span>
          <span class="section-more" @click="goToAllRecords">查看全部 ></span>
        </div>
        <div class="record-list">
          <div class="record-item" v-for="record in recentRecords" :key="record.id">
            <div class="record-icon" :style="{ background: record.bgColor }">
              <span>{{ record.icon }}</span>
            </div>
            <div class="record-info">
              <span class="record-type">{{ record.type }}</span>
              <span class="record-date">{{ record.date }}</span>
            </div>
            <div class="record-status" :class="'status-' + record.status">
              {{ getStatusName(record.status) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 志愿者招募 -->
      <div class="volunteer-section">
        <div class="volunteer-header">
          <div class="volunteer-title">
            <span>❤️ 志愿者招募</span>
          </div>
          <span class="volunteer-subtitle">join us</span>
        </div>
        <div class="volunteer-content">
          <div class="volunteer-stats">
            <div class="stat-item">
              <span class="stat-value">{{ volunteerStats.volunteers }}</span>
              <span class="stat-label">志愿者</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ volunteerStats.hours }}</span>
              <span class="stat-label">服务时长</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ volunteerStats.seniors }}</span>
              <span class="stat-label">关怀老人</span>
            </div>
          </div>
          <div class="volunteer-join" @click="joinVolunteer">
            <span>成为志愿者</span>
          </div>
        </div>
      </div>

      <!-- 定期探访计划 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">📅 定期探访</span>
        </div>
        <div class="visit-plan">
          <div class="visit-header">
            <div class="avatar-wrap" v-if="currentElder.avatar">
              <img class="elder-avatar" :src="currentElder.avatar" alt="老人头像" />
            </div>
            <div v-else class="elder-avatar avatar-placeholder">{{ (currentElder.name || '邻').charAt(0) }}</div>
            <div class="elder-info">
              <span class="elder-name">{{ currentElder.name }}</span>
              <span class="elder-info-text">{{ currentElder.address }}</span>
            </div>
            <div class="visit-status">
              <span class="visit-next">下次探访</span>
              <span class="visit-date">{{ currentElder.nextVisit }}</span>
            </div>
          </div>
          <div class="visit-schedule">
            <div class="schedule-item" v-for="(item, index) in visitSchedule" :key="index">
              <div class="schedule-dot" :class="{ completed: item.completed }"></div>
              <div class="schedule-content">
                <span class="schedule-title">{{ item.title }}</span>
                <span class="schedule-date">{{ item.date }}</span>
              </div>
              <span class="schedule-status" v-if="item.completed">✅</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 关怀技巧 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">📚 关怀技巧</span>
        </div>
        <div class="tips-list">
          <div class="tip-card" v-for="tip in careTips" :key="tip.id" @click="goToTipDetail(tip)">
            <div class="tip-cover" :style="{ background: tip.bgColor }">
              <span class="tip-icon">{{ tip.icon }}</span>
            </div>
            <div class="tip-content">
              <span class="tip-title">{{ tip.title }}</span>
              <span class="tip-desc">{{ tip.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 志愿者风采 -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">🌟 志愿者风采</span>
        </div>
        <div class="volunteer-list">
          <div class="volunteer-card" v-for="v in topVolunteers" :key="v.id">
            <div class="avatar-wrap" v-if="v.avatar">
              <img class="volunteer-avatar" :src="v.avatar" alt="志愿者头像" />
            </div>
            <div v-else class="volunteer-avatar avatar-placeholder">{{ (v.name || '邻').charAt(0) }}</div>
            <span class="volunteer-name">{{ v.name }}</span>
            <span class="volunteer-hours">{{ v.hours }}小时</span>
            <div class="volunteer-tag">{{ v.tag }}</div>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '../../utils/router'
import { toastInfo, toastSuccess } from '../../utils/toast'
import { showModal } from '../../utils/ui'

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
  },
  {
    id: '7',
    name: '代缴水电',
    icon: '💡',
    desc: '生活缴费',
    bgColor: '#FFF9C4'
  },
  {
    id: '8',
    name: '理发服务',
    icon: '💇',
    desc: '上门理发',
    bgColor: '#FFE0B2'
  },
  {
    id: '9',
    name: '送餐服务',
    icon: '🍱',
    desc: '爱心送餐',
    bgColor: '#F8BBD0'
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
  },
  {
    id: '4',
    type: '家政服务',
    icon: '🧹',
    date: '本周一',
    status: 'ongoing',
    bgColor: '#FCE4EC'
  },
  {
    id: '5',
    type: '代取快递',
    icon: '📦',
    date: '6月3日',
    status: 'pending',
    bgColor: '#F3E5F5'
  }
])

const volunteerStats = ref({
  volunteers: 89,
  hours: 1560,
  seniors: 234
})

const currentElder = ref({
  name: '张奶奶',
  avatar: '',
  address: '阳光社区 5号楼 301',
  nextVisit: '6月10日'
})

const visitSchedule = ref([
  { title: '日常探访', date: '6月1日', completed: true },
  { title: '帮买药品', date: '6月3日', completed: true },
  { title: '陪聊服务', date: '6月5日', completed: true },
  { title: '定期探访', date: '6月10日', completed: false },
  { title: '健康检查', date: '6月15日', completed: false }
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
  },
  {
    id: '4',
    title: '老人防跌倒指南',
    desc: '居家安全改造、防滑措施...',
    icon: '🦯',
    bgColor: '#C8E6C9'
  }
])

const topVolunteers = ref([
  {
    id: '1',
    name: '王大哥',
    avatar: '',
    hours: 120,
    tag: '热心达人'
  },
  {
    id: '2',
    name: '李阿姨',
    avatar: '',
    hours: 98,
    tag: '爱心天使'
  },
  {
    id: '3',
    name: '小张',
    avatar: '',
    hours: 85,
    tag: '优秀青年'
  },
  {
    id: '4',
    name: '赵大姐',
    avatar: '',
    hours: 76,
    tag: '贴心好邻'
  }
])

const triggerEmergency = () => {
  showModal({
    title: '紧急求助',
    content: '确定要发起紧急求助吗？志愿者会立即收到通知，请确保您确实需要帮助。',
    confirmText: '确认求助',
    success: (res: any) => {
      if (res.confirm) {
        toastSuccess('已通知志愿者，请保持电话畅通')
      }
    }
  })
}

const useService = (service: any) => {
  navigateTo(`/pages/elderly/service-request?type=${service.id}&name=${service.name}`)
}

const joinVolunteer = () => {
  navigateTo('/pages/elderly/become-volunteer')
}

const goToTipDetail = (tip: any) => {
  navigateTo(`/pages/elderly/tip-detail?id=${tip.id}`)
}

const goToAllRecords = () => {
  navigateTo('/pages/elderly/all-records')
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
  background-color: var(--color-bg-primary);
}

.header {
  background: linear-gradient(135deg, #E91E63, #F48FB1);
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
  padding-top: calc(var(--spacing-lg) + 20px);
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
  overflow-y: auto;
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
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 8px 48px rgba(244, 67, 54, 0.7);
  }
}

.emergency-btn:active {
  transform: scale(0.95);
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
  color: var(--color-text-muted);
}

/* 服务网格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
}

.service-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s;
}

.service-card:active {
  transform: scale(0.95);
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
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.service-desc {
  font-size: 11px;
  color: var(--color-text-muted);
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
  color: var(--color-text-primary);
}

.section-more {
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.record-item {
  background: var(--color-bg-secondary);
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
  flex-shrink: 0;
}

.record-info {
  flex: 1;
}

.record-type {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.record-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.record-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 10px;
  flex-shrink: 0;
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
  cursor: pointer;
  transition: transform 0.2s;
}

.volunteer-join:active {
  transform: scale(0.95);
}

/* 探访计划 */
.visit-plan {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.visit-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.elder-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  object-fit: cover;
  flex-shrink: 0;
}

.elder-info {
  flex: 1;
}

.elder-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.elder-info-text {
  font-size: 12px;
  color: var(--color-text-muted);
}

.visit-status {
  text-align: right;
}

.visit-next {
  font-size: 11px;
  color: var(--color-text-muted);
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
  background: var(--color-border-light);
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.schedule-dot.completed {
  background: #4CAF50;
}

.schedule-content {
  flex: 1;
}

.schedule-title {
  font-size: 14px;
  color: var(--color-text-primary);
  display: block;
}

.schedule-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.schedule-status {
  font-size: 16px;
  flex-shrink: 0;
}

/* 关怀技巧 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tip-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s;
}

.tip-card:active {
  transform: scale(0.98);
}

.tip-cover {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.tip-icon {
  font-size: 28px;
}

.tip-content {
  flex: 1;
  min-width: 0;
}

.tip-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.tip-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 志愿者风采 */
.volunteer-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.volunteer-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.volunteer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: var(--spacing-sm);
  object-fit: cover;
}

.volunteer-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 2px;
}

.volunteer-hours {
  font-size: 11px;
  color: var(--color-text-muted);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.volunteer-tag {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #FFF3E0;
  color: #FF9800;
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
  height: calc(var(--spacing-lg) + 20px);
}
</style>