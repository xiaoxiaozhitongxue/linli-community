<template>
  <view class="page">
    <view class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">发布活动</text>
        <view class="nav-right" @click="submitActivity" :class="{ disabled: !canSubmit }">
          <text class="nav-right-text">发布</text>
        </view>
      </view>
    </view>

    <scroll-view class="content" scroll-y :style="{ paddingTop: (statusBarHeight + 56) + 'px' }">
      <view class="form-section">
        <view class="form-item">
          <view class="form-label">活动标题</view>
          <input 
            class="form-input" 
            v-model="form.title" 
            placeholder="请输入活动标题" 
            maxlength="50"
          />
          <text class="form-count">{{ form.title.length }}/50</text>
        </view>

        <view class="form-item">
          <view class="form-label">活动分类</view>
          <view class="category-grid">
            <view 
              v-for="cat in categories" 
              :key="cat.value"
              class="category-item"
              :class="{ active: form.category === cat.value }"
              @click="selectCategory(cat.value)"
            >
              <text class="category-emoji">{{ cat.emoji }}</text>
              <text class="category-name">{{ cat.label }}</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">活动图片</view>
          <view class="image-upload">
            <view 
              v-for="(img, index) in form.images" 
              :key="index"
              class="image-item"
            >
              <image class="image-preview" :src="img" mode="aspectFill" />
              <view class="image-delete" @click="removeImage(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
            <view 
              v-if="form.images.length < 6"
              class="image-add"
              @click="chooseImage"
            >
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
          <text class="form-tip">最多上传6张图片</text>
        </view>

        <view class="form-item">
          <view class="form-label">活动描述</view>
          <textarea 
            class="form-textarea" 
            v-model="form.description" 
            placeholder="请输入活动描述，详细介绍活动内容、注意事项等"
            maxlength="500"
            :auto-height="true"
          />
          <text class="form-count">{{ form.description.length }}/500</text>
        </view>

        <view class="form-item">
          <view class="form-label">活动时间</view>
          <view class="form-row" @click="showStartPicker = true">
            <text class="row-label">开始时间</text>
            <text class="row-value">{{ formatDateTime(form.startTime) }}</text>
            <text class="row-arrow">›</text>
          </view>
          <view class="form-row" @click="showEndPicker = true">
            <text class="row-label">结束时间</text>
            <text class="row-value">{{ formatDateTime(form.endTime) }}</text>
            <text class="row-arrow">›</text>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">活动地点</view>
          <view class="form-row" @click="chooseLocation">
            <text class="row-label">选择位置</text>
            <text class="row-value" :class="{ placeholder: !form.location }">
              {{ form.location || '请选择活动地点' }}
            </text>
            <text class="row-arrow">›</text>
          </view>
        </view>

        <view class="form-item">
          <view class="form-label">参与人数</view>
          <view class="form-row">
            <text class="row-label">上限人数</text>
            <view class="number-picker">
              <view 
                class="picker-btn" 
                :class="{ disabled: form.maxParticipants <= 1 }"
                @click="changeNumber(-1)"
              >
                -
              </view>
              <text class="picker-value">{{ form.maxParticipants }}</text>
              <view class="picker-btn" @click="changeNumber(1)">+</view>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>

    <!-- 开始时间选择器 -->
    <picker 
      v-if="showStartPicker"
      mode="multiSelector" 
      :range="datetimeRange" 
      :value="startPickerValue"
      @change="onStartDateChange"
      @cancel="showStartPicker = false"
    />

    <!-- 结束时间选择器 -->
    <picker 
      v-if="showEndPicker"
      mode="multiSelector" 
      :range="datetimeRange" 
      :value="endPickerValue"
      @change="onEndDateChange"
      @cancel="showEndPicker = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { activitiesApi } from '../../utils/api'

const statusBarHeight = ref(20)

const form = ref({
  title: '',
  category: 'party',
  images: [] as string[],
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  maxParticipants: 20
})

const showStartPicker = ref(false)
const showEndPicker = ref(false)
const startPickerValue = ref([0, 0, 0, 0, 0])
const endPickerValue = ref([0, 0, 0, 0, 0])

const categories = [
  { value: 'sports', label: '运动健身', emoji: '🏃' },
  { value: 'culture', label: '文化艺术', emoji: '🎨' },
  { value: 'charity', label: '公益活动', emoji: '💝' },
  { value: 'party', label: '聚会派对', emoji: '🎉' },
  { value: 'other', label: '其他', emoji: '📌' }
]

const datetimeRange = ref<any[][]>([[], [], [], [], []])

const canSubmit = computed(() => {
  return (
    form.value.title.trim().length > 0 &&
    form.value.description.trim().length > 0 &&
    form.value.startTime &&
    form.value.endTime &&
    form.value.location
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

const initDateTimeRange = () => {
  const now = new Date()
  const years: string[] = []
  const months: string[] = []
  const days: string[] = []
  const hours: string[] = []
  const minutes: string[] = []

  const currentYear = now.getFullYear()
  for (let i = 0; i < 2; i++) {
    years.push(String(currentYear + i) + '年')
  }

  for (let i = 1; i <= 12; i++) {
    months.push(String(i) + '月')
  }

  for (let i = 1; i <= 31; i++) {
    days.push(String(i) + '日')
  }

  for (let i = 0; i <= 23; i++) {
    hours.push(String(i).padStart(2, '0') + '时')
  }

  for (let i = 0; i <= 59; i += 5) {
    minutes.push(String(i).padStart(2, '0') + '分')
  }

  datetimeRange.value = [years, months, days, hours, minutes]

  const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const defaultEnd = new Date(defaultStart.getTime() + 3 * 60 * 60 * 1000)

  form.value.startTime = defaultStart.toISOString()
  form.value.endTime = defaultEnd.toISOString()

  startPickerValue.value = [
    defaultStart.getFullYear() - currentYear,
    defaultStart.getMonth(),
    defaultStart.getDate() - 1,
    defaultStart.getHours(),
    Math.floor(defaultStart.getMinutes() / 5)
  ]

  endPickerValue.value = [
    defaultEnd.getFullYear() - currentYear,
    defaultEnd.getMonth(),
    defaultEnd.getDate() - 1,
    defaultEnd.getHours(),
    Math.floor(defaultEnd.getMinutes() / 5)
  ]
}

const selectCategory = (value: string) => {
  form.value.category = value
}

const chooseImage = () => {
  uni.chooseImage({
    count: 6 - form.value.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.images.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}

const onStartDateChange = (e: any) => {
  const [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex] = e.detail.value
  const now = new Date()
  const selectedDate = new Date(
    now.getFullYear() + yearIndex,
    monthIndex,
    dayIndex + 1,
    hourIndex,
    minuteIndex * 5
  )
  form.value.startTime = selectedDate.toISOString()
  startPickerValue.value = e.detail.value
  showStartPicker.value = false
}

const onEndDateChange = (e: any) => {
  const [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex] = e.detail.value
  const now = new Date()
  const selectedDate = new Date(
    now.getFullYear() + yearIndex,
    monthIndex,
    dayIndex + 1,
    hourIndex,
    minuteIndex * 5
  )
  form.value.endTime = selectedDate.toISOString()
  endPickerValue.value = e.detail.value
  showEndPicker.value = false
}

const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      form.value.location = res.name || res.address
    }
  })
}

const changeNumber = (delta: number) => {
  const newValue = form.value.maxParticipants + delta
  if (newValue >= 1 && newValue <= 999) {
    form.value.maxParticipants = newValue
  }
}

const goBack = () => {
  uni.navigateBack()
}

const submitActivity = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完善信息',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: '发布中...' })

  try {
    const data = {
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      location: form.value.location,
      start_time: form.value.startTime,
      end_time: form.value.endTime,
      max_participants: form.value.maxParticipants,
      images: form.value.images
    }

    await activitiesApi.createActivity(data)

    uni.hideLoading()
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    })
  }
}

onMounted(() => {
  initDateTimeRange()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #F5F5F0;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.nav-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-icon {
  font-size: 24px;
  color: #1A1A1A;
  line-height: 1;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
}

.nav-right {
  padding: 6px 16px;
  background: linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%);
  border-radius: 16px;
}

.nav-right.disabled {
  background: #E8E8E0;
}

.nav-right-text {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
}

.nav-right.disabled .nav-right-text {
  color: #9A9A8A;
}

.content {
  height: 100vh;
}

.form-section {
  padding: 12px 16px;
}

.form-item {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12px;
}

.form-input {
  width: 100%;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 1.5;
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 1.6;
}

.form-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #9A9A8A;
  margin-top: 8px;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #9A9A8A;
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
  background: #F9F9F5;
  border-radius: 12px;
  border: 2px solid transparent;
}

.category-item.active {
  background: #FFF3E0;
  border-color: #FF8C42;
}

.category-emoji {
  font-size: 28px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  color: #4A4A3A;
}

.category-item.active .category-name {
  color: #FF8C42;
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
  border-radius: 12px;
}

.image-delete {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  font-size: 18px;
  color: #FFFFFF;
  line-height: 1;
}

.image-add {
  width: 100px;
  height: 100px;
  border: 2px dashed #D8D8D0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 28px;
  color: #9A9A8A;
  line-height: 1;
  margin-bottom: 4px;
}

.add-text {
  font-size: 12px;
  color: #9A9A8A;
}

.form-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F5F5F0;
}

.form-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-label {
  font-size: 15px;
  color: #4A4A3A;
  flex: 1;
}

.row-value {
  font-size: 15px;
  color: #1A1A1A;
  margin-right: 8px;
}

.row-value.placeholder {
  color: #9A9A8A;
}

.row-arrow {
  font-size: 18px;
  color: #C8C8B8;
}

.number-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.picker-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F5F5F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #4A4A3A;
}

.picker-btn.disabled {
  color: #C8C8B8;
}

.picker-value {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  min-width: 40px;
  text-align: center;
}

.safe-area-bottom {
  height: 40px;
}
</style>
