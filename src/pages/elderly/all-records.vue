<template>
  <div class="page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">帮扶记录</span>
    </div>

    <div class="content">
      <div class="record-list">
        <div class="record-item" v-for="record in records" :key="record.id">
          <div class="record-icon" :style="{ background: record.bgColor }">
            <span>{{ record.icon }}</span>
          </div>
          <div class="record-info">
            <span class="record-type">{{ record.type }}</span>
            <span class="record-date">{{ record.date }}</span>
          </div>
          <div class="record-status" :class="'status-' + normalizeStatus(record.status)">
            {{ getStatusName(record.status) }}
          </div>
        </div>
      </div>

      <div class="empty" v-if="records.length === 0">暂无帮扶记录</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import { INITIAL_RECORDS } from '../../constants/elderlyData'

const { getCurrentPhone } = useAuth()
const records = ref<any[]>([])

// 状态归一化，避免历史脏值导致 class 拼错
const normalizeStatus = (status: string) => {
  const map: Record<string, string> = {
    completed: 'completed',
    ongoing: 'ongoing',
    pending: 'pending',
    doing: 'ongoing',
    wait: 'pending'
  }
  return map[status] || 'pending'
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    ongoing: '进行中',
    pending: '待处理'
  }
  return map[normalizeStatus(status)] || status
}

const goBack = () => navigateBackSmart('/pages/elderly/index')

onMounted(() => {
  records.value = localStore.getArray('elderly_records', INITIAL_RECORDS as any, getCurrentPhone() || undefined)
})
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); }
.header { display: flex; align-items: center; gap: 8px; padding: var(--spacing-lg); padding-top: calc(var(--spacing-lg) + 20px); background: linear-gradient(135deg, #E91E63, #F48FB1); color: #fff; }
.back { font-size: 28px; cursor: pointer; line-height: 1; }
.title { font-size: 18px; font-weight: 600; }
.content { padding: var(--spacing-lg); }
.record-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.record-item { background: var(--color-bg-secondary); padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--radius-md); display: flex; align-items: center; box-shadow: var(--shadow-sm); }
.record-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-right: var(--spacing-md); flex-shrink: 0; }
.record-info { flex: 1; }
.record-type { font-size: 14px; font-weight: 500; color: var(--color-text-primary); display: block; margin-bottom: 2px; }
.record-date { font-size: 12px; color: var(--color-text-muted); }
.record-status { font-size: 12px; padding: 4px 10px; border-radius: 10px; flex-shrink: 0; }
.status-completed { background: #E8F5E9; color: #4CAF50; }
.status-ongoing { background: #FFF3E0; color: #FF9800; }
.status-pending { background: #E3F2FD; color: #2196F3; }
.empty { text-align: center; color: var(--color-text-muted); padding-top: 60px; font-size: 14px; }
</style>
