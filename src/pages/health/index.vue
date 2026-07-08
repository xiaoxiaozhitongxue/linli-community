<template>
  <div class="page">
    <NavBar title="健康打卡" type="gradient" />

    <div class="content">
      <SkeletonLoader v-if="loading" type="card" :count="1" />

      <template v-else>
        <EmptyState v-if="!isLoggedIn" icon="activity" title="登录后可打卡" description="登录即可记录每日健康打卡" />

        <template v-else>
          <div class="stats-card">
            <div class="stat-item">
              <span class="stat-value">{{ streak }}</span>
              <span class="stat-label">连续打卡天数</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">{{ totalDays }}</span>
              <span class="stat-label">累计打卡次数</span>
            </div>
          </div>

          <div class="check-section">
            <div class="today-status" :class="{ checked: todayChecked }">
              <span v-if="!todayChecked">今日未打卡</span>
              <span v-else>✓ 今日已完成打卡</span>
            </div>

            <button
              class="check-btn"
              :class="{ checked: todayChecked }"
              @click="submitCheckIn"
              :disabled="todayChecked || submitting"
            >
              {{ submitting ? '打卡中...' : todayChecked ? '已打卡' : '立即打卡' }}
            </button>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { navigateBack } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { healthService } from '../../services/healthService'
import type { HealthRecord } from '../../types/models'
import { useAuth } from '../../store'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import AppIcon from '../../components/AppIcon.vue'
import NavBar from '../../components/NavBar.vue'

const { isLoggedIn } = useAuth()

const statusBarHeight = ref(20)
const records = ref<HealthRecord[]>([])
const loading = ref(true)
const submitting = ref(false)

const today = ref('')
const todayChecked = ref(false)

const streak = computed(() => {
  let count = 0
  let checkDate = new Date()

  while (true) {
    const dateStr = formatDateKey(checkDate)
    const hasRecord = records.value.some(r => r.date === dateStr)
    if (hasRecord) {
      count++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return count
})

const totalDays = computed(() => records.value.length)

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function loadRecords() {
  loading.value = true
  if (!isLoggedIn.value) {
    records.value = []
    checkTodayStatus()
    loading.value = false
    return
  }

  try {
    const res = await healthService.getRecords()
    records.value = (res && res.items) || []
  } catch (e: any) {
    records.value = []
  }
  checkTodayStatus()
  loading.value = false
}

function checkTodayStatus() {
  today.value = formatDateKey(new Date())
  todayChecked.value = records.value.some(r => r.date === today.value)
}

async function submitCheckIn() {
  if (todayChecked.value || submitting.value) return
  if (!isLoggedIn.value) {
    toastError('请先登录后再打卡')
    return
  }

  submitting.value = true
  try {
    const record = await healthService.addRecord({
      health_status: 'good'
    })
    records.value.unshift(record)
    checkTodayStatus()
    toastSuccess('打卡成功！')
  } catch (e: any) {
    // 错误提示已由 request.ts 处理
  } finally {
    submitting.value = false
  }
}

function goBack() {
  navigateBack()
}

onMounted(() => {
  statusBarHeight.value = 20
  loadRecords()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.content {
  padding: var(--spacing-xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.stats-card {
  background: var(--color-primary-gradient);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  color: var(--color-text-white);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.3);
}

.check-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.today-status {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.today-status.checked {
  color: var(--color-success);
  background: var(--color-success-soft);
}

.check-btn {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border: none;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: var(--shadow-xl), 0 0 40px rgba(255, 107, 53, 0.3);
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;
}

.check-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left var(--transition-slow);
}

.check-btn:hover::before {
  left: 100%;
}

.check-btn:active:not(:disabled) {
  transform: scale(0.95);
  box-shadow: var(--shadow-lg);
}

.check-btn.checked {
  background: linear-gradient(135deg, var(--color-success) 0%, #22c55e 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  cursor: not-allowed;
}
</style>
