<template>
  <div class="page">
    <NavBar title="创建活动" :fixed="true" :action-text="submitting ? '发布中...' : '发布'" @action-click="submitActivity" />

    <div class="content">
      <div class="form-section">
        <div class="form-item">
          <div class="form-label">活动标题</div>
          <input 
            class="form-input" 
            v-model="form.title" 
            placeholder="请输入活动标题" 
            maxlength="50"
          />
          <span class="form-count">{{ form.title.length }}/50</span>
        </div>

        <div class="form-item">
          <div class="form-label">活动分类</div>
          <div class="category-grid">
            <div 
              v-for="cat in categories" 
              :key="cat.value"
              class="category-item"
              :class="{ active: form.category === cat.value }"
              @click="selectCategory(cat.value)"
            >
              <AppIcon class="category-emoji" :name="cat.icon" :size="28" />
              <span class="category-name">{{ cat.label }}</span>
            </div>
          </div>
        </div>

        <div class="form-item">
          <div class="form-label">活动图片</div>
          <div class="image-upload">
            <div 
              v-for="(img, index) in form.images" 
              :key="index"
              class="image-item"
            >
              <img class="image-preview" :src="img" alt="preview" />
              <div class="image-delete" @click="removeImage(index)">
                <span class="delete-icon">×</span>
              </div>
            </div>
            <div 
              v-if="form.images.length < 6"
              class="image-add"
              @click="chooseImage"
            >
              <span class="add-icon">+</span>
              <span class="add-text">添加图片</span>
            </div>
          </div>
          <span class="form-tip">最多上传6张图片（模拟上传）</span>
        </div>

        <div class="form-item">
          <div class="form-label">活动描述</div>
          <textarea 
            class="form-textarea" 
            v-model="form.description" 
            placeholder="请输入活动描述，详细介绍活动内容、注意事项等"
            maxlength="500"
          ></textarea>
          <span class="form-count">{{ form.description.length }}/500</span>
        </div>

        <div class="form-item">
          <div class="form-label">活动时间</div>
          <div class="form-row" @click="openDateTimePicker('start')">
            <span class="row-label">开始时间</span>
            <span class="row-value">{{ formatDateTime(form.startTime) }}</span>
            <span class="row-arrow">›</span>
          </div>
          <div class="form-row" @click="openDateTimePicker('end')">
            <span class="row-label">结束时间</span>
            <span class="row-value">{{ formatDateTime(form.endTime) }}</span>
            <span class="row-arrow">›</span>
          </div>
        </div>

        <div class="form-item">
          <div class="form-label">活动地点</div>
          <LocationPicker
            v-model="locationForm"
            :error-text="locationError"
          />
        </div>

        <div class="form-item">
          <div class="form-label">参与人数</div>
          <div class="form-row">
            <span class="row-label">上限人数</span>
            <div class="number-picker">
              <div 
                class="picker-btn" 
                :class="{ disabled: form.maxParticipants <= 1 }"
                @click="changeNumber(-1)"
              >
                −
              </div>
              <span class="picker-value">{{ form.maxParticipants }}</span>
              <div class="picker-btn" @click="changeNumber(1)">+</div>
            </div>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>

    <!-- 日期时间选择器弹窗 -->
    <div v-if="showDateTimePicker" class="picker-overlay" @click.self="showDateTimePicker = false">
      <div class="picker-modal">
        <div class="picker-header">
          <span class="picker-cancel" @click="showDateTimePicker = false">取消</span>
          <span class="picker-title">{{ datePickerType === 'start' ? '选择开始时间' : '选择结束时间' }}</span>
          <span class="picker-confirm" @click="confirmDateTime">确定</span>
        </div>
        <div class="picker-body">
          <div class="picker-column">
            <div class="picker-column-title">年</div>
            <div class="picker-list">
              <div
                v-for="(year, idx) in yearOptions"
                :key="idx"
                class="picker-item"
                :class="{ active: tempPickerYear === idx }"
                @click="tempPickerYear = idx"
              >{{ year }}</div>
            </div>
          </div>
          <div class="picker-column">
            <div class="picker-column-title">月</div>
            <div class="picker-list">
              <div
                v-for="(month, idx) in 12"
                :key="idx"
                class="picker-item"
                :class="{ active: tempPickerMonth === idx }"
                @click="tempPickerMonth = idx"
              >{{ idx + 1 }}月</div>
            </div>
          </div>
          <div class="picker-column">
            <div class="picker-column-title">日</div>
            <div class="picker-list">
              <div
                v-for="(day, idx) in tempPickerDays"
                :key="idx"
                class="picker-item"
                :class="{ active: tempPickerDay === idx }"
                @click="tempPickerDay = idx"
              >{{ day }}日</div>
            </div>
          </div>
          <div class="picker-column">
            <div class="picker-column-title">时</div>
            <div class="picker-list">
              <div
                v-for="(hour, idx) in 24"
                :key="idx"
                class="picker-item"
                :class="{ active: tempPickerHour === idx }"
                @click="tempPickerHour = idx"
              >{{ String(idx).padStart(2, '0') }}时</div>
            </div>
          </div>
          <div class="picker-column">
            <div class="picker-column-title">分</div>
            <div class="picker-list">
              <div
                v-for="(min, idx) in 12"
                :key="idx"
                class="picker-item"
                :class="{ active: tempPickerMinute === idx }"
                @click="tempPickerMinute = idx"
              >{{ String(idx * 5).padStart(2, '0') }}分</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { activityService } from '../../services/activityService'
import { navigateBack } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { getLocation } from '../../utils/location'
import { useLocationForm } from '../../composables/useLocationForm'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'
import LocationPicker from '../../components/LocationPicker.vue'

const form = ref({
  title: '',
  category: 'party',
  images: [] as string[],
  description: '',
  startTime: '',
  endTime: '',
  maxParticipants: 20
})

// 使用 LocationPicker + useLocationForm
const { form: locationForm, getSubmitValue, autoFill } = useLocationForm()
const locating = ref(false)
const locationError = ref('')

const submitting = ref(false)

// 日期时间选择器
const showDateTimePicker = ref(false)
const datePickerType = ref<'start' | 'end'>('start')
const tempPickerYear = ref(0)
const tempPickerMonth = ref(0)
const tempPickerDay = ref(0)
const tempPickerHour = ref(9)
const tempPickerMinute = ref(0)

const yearOptions = ref<string[]>([])
const tempPickerDays = ref<number[]>([])

const categories = [
  { value: 'sports', label: '运动健身', icon: 'activity' },
  { value: 'culture', label: '文化艺术', icon: 'book-open' },
  { value: 'charity', label: '公益活动', icon: 'heart' },
  { value: 'party', label: '聚会派对', icon: 'star' },
  { value: 'other', label: '其他', icon: 'megaphone' }
]

const canSubmit = computed(() => {
  return (
    form.value.title.trim().length > 0 &&
    form.value.description.trim().length > 0 &&
    form.value.startTime &&
    form.value.endTime &&
    locationForm.value.province &&
    locationForm.value.district &&
    !submitting.value
  )
})

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hours}:${minutes}`
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const computeTempDays = () => {
  const currentYear = new Date().getFullYear()
  const year = currentYear + tempPickerYear.value
  const days = getDaysInMonth(year, tempPickerMonth.value)
  tempPickerDays.value = Array.from({ length: days }, (_, i) => i + 1)
  if (tempPickerDay.value >= days) {
    tempPickerDay.value = days - 1
  }
}

const openDateTimePicker = (type: 'start' | 'end') => {
  datePickerType.value = type
  const targetDate = type === 'start' ? form.value.startTime : form.value.endTime
  const date = targetDate ? new Date(targetDate) : new Date(Date.now() + 24 * 60 * 60 * 1000)
  const currentYear = new Date().getFullYear()
  
  tempPickerYear.value = date.getFullYear() - currentYear
  tempPickerMonth.value = date.getMonth()
  tempPickerDay.value = date.getDate() - 1
  tempPickerHour.value = date.getHours()
  tempPickerMinute.value = Math.floor(date.getMinutes() / 5)
  
  computeTempDays()
  showDateTimePicker.value = true
}

const confirmDateTime = () => {
  const currentYear = new Date().getFullYear()
  const selectedDate = new Date(
    currentYear + tempPickerYear.value,
    tempPickerMonth.value,
    tempPickerDay.value + 1,
    tempPickerHour.value,
    tempPickerMinute.value * 5
  )
  
  if (datePickerType.value === 'start') {
    form.value.startTime = selectedDate.toISOString()
  } else {
    form.value.endTime = selectedDate.toISOString()
  }
  
  showDateTimePicker.value = false
}

const initDateTimeOptions = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  yearOptions.value = Array.from({ length: 2 }, (_, i) => `${currentYear + i}年`)

  const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const defaultEnd = new Date(defaultStart.getTime() + 3 * 60 * 60 * 1000)

  form.value.startTime = defaultStart.toISOString()
  form.value.endTime = defaultEnd.toISOString()
}

const selectCategory = (value: string) => {
  form.value.category = value
}

const chooseImage = () => {
  const remaining = 6 - form.value.images.length
  if (remaining <= 0) {
    toastError('最多上传6张图片')
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = () => {
    const files = Array.from(input.files || [])
    const toAdd = files.slice(0, remaining)
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          form.value.images.push(reader.result)
        }
      }
      reader.readAsDataURL(file)
    })
    if (files.length > remaining) {
      toastError('最多上传6张图片，已忽略多余图片')
    } else {
      toastSuccess('图片已添加')
    }
  }
  input.click()
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

const changeNumber = (delta: number) => {
  const newValue = form.value.maxParticipants + delta
  if (newValue >= 1 && newValue <= 999) {
    form.value.maxParticipants = newValue
  }
}

const goBack = () => {
  navigateBack()
}

const submitActivity = async () => {
  if (submitting.value) return

  if (!canSubmit.value) {
    toastError('请完善信息')
    return
  }

  submitting.value = true

  try {
    const data = {
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      location: getSubmitValue(),
      start_time: form.value.startTime,
      end_time: form.value.endTime,
      max_participants: form.value.maxParticipants,
      images: form.value.images
    }

    await activityService.createActivity(data)
    toastSuccess('发布成功')

    setTimeout(() => {
      navigateBack()
    }, 1500)
  } catch (error) {
    toastError('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  initDateTimeOptions()

  // 自动定位填充
  locating.value = true
  locationError.value = ''
  try {
    const result = await getLocation({ forceRefresh: false })
    if (result) {
      autoFill(result)
    }
  } catch (e: any) {
    console.warn('[createActivity] 定位失败:', e)
    locationError.value = '定位失败，请手动选择'
  } finally {
    locating.value = false
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.content {
  padding-top: 56px;
  padding-top: calc(56px + env(safe-area-inset-top));
  min-height: 100vh;
}

.form-section {
  padding: 12px 16px;
}

.form-item {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.form-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.form-input {
  width: 100%;
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.5;
  border: none;
  outline: none;
  background: transparent;
}

.form-input::placeholder {
  color: var(--color-text-placeholder);
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.6;
  border: none;
  outline: none;
  resize: vertical;
  background: transparent;
  font-family: inherit;
}

.form-textarea::placeholder {
  color: var(--color-text-placeholder);
}

.form-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.category-item.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.category-item:hover {
  background: var(--color-primary-soft);
}

.category-emoji {
  font-size: 28px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.category-item.active .category-name {
  color: var(--color-primary);
  font-weight: 500;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
  object-fit: cover;
}

.image-delete {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: var(--color-bg-overlay);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.image-delete:hover {
  transform: scale(1.1);
}

.delete-icon {
  font-size: 18px;
  color: var(--color-text-white);
  line-height: 1;
}

.image-add {
  width: 100px;
  height: 100px;
  border: 2px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.image-add:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.add-icon {
  font-size: 28px;
  color: var(--color-text-tertiary);
  line-height: 1;
  margin-bottom: 4px;
}

.add-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.form-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-bg-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-radius: var(--radius-sm);
}

.form-row:hover {
  background-color: var(--color-bg-tertiary);
  margin: 0 -16px;
  padding: 12px 16px;
}

.form-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-label {
  font-size: 15px;
  color: var(--color-text-secondary);
  flex: 1;
}

.row-value {
  font-size: 15px;
  color: var(--color-text-primary);
  margin-right: 8px;
}

.row-value.placeholder {
  color: var(--color-text-tertiary);
}

.row-arrow {
  font-size: 18px;
  color: var(--color-text-muted);
}

.number-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.picker-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-fast);
}

.picker-btn:hover:not(.disabled) {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.picker-btn.disabled {
  color: var(--color-text-muted);
  cursor: default;
}

.picker-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  min-width: 40px;
  text-align: center;
}

.safe-area-bottom {
  height: 40px;
}

/* 日期选择器弹窗 */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-overlay);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.picker-modal {
  width: 100%;
  max-width: 500px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  animation: slideUp var(--transition-smooth) ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.picker-cancel {
  font-size: 15px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.picker-cancel:hover {
  color: var(--color-text-secondary);
}

.picker-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.picker-confirm {
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.picker-confirm:hover {
  color: var(--color-primary-dark);
}

.picker-body {
  display: flex;
  height: 220px;
  overflow: hidden;
}

.picker-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.picker-column-title {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-tertiary);
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.picker-list {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.picker-list::-webkit-scrollbar {
  display: none;
}

.picker-item {
  padding: 10px 8px;
  text-align: center;
  font-size: 15px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
  border-radius: var(--radius-sm);
  margin: 2px 8px;
}

.picker-item:hover {
  background: var(--color-bg-tertiary);
}

.picker-item.active {
  color: var(--color-primary);
  font-weight: 600;
  background: var(--color-primary-soft);
}
</style>
