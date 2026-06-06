<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-bar">
        <view class="nav-back" @click="goBack">
          <text class="nav-back-icon">‹</text>
        </view>
        <view class="nav-title">发布动态</view>
        <view class="nav-dummy"></view>
      </view>
    </view>

    <scroll-view 
      class="content" 
      scroll-y 
      :style="{ paddingTop: (statusBarHeight + 60) + 'px' }"
    >
      <view class="form-section">
        <view class="user-info">
          <image 
            class="user-avatar" 
            :src="userInfo?.avatar || 'https://via.placeholder.com/48'" 
            mode="aspectFill" 
          />
          <view class="user-detail">
            <text class="user-name">{{ userInfo?.nickname || '邻居' }}</text>
            <text class="user-community">{{ userInfo?.community || '阳光社区' }}</text>
          </view>
        </view>

        <view class="text-input-wrapper">
          <textarea 
            class="text-input" 
            v-model="content" 
            placeholder="分享你的社区生活..." 
            :maxlength="500"
            :auto-height="true"
          />
          <view class="char-count">{{ content.length }}/500</view>
        </view>

        <view class="images-section">
          <view class="image-grid">
            <view 
              class="image-item" 
              v-for="(img, index) in images" 
              :key="index"
            >
              <image class="image-preview" :src="img" mode="aspectFill" />
              <view class="image-remove" @click="removeImage(index)">
                <text class="remove-icon">✕</text>
              </view>
            </view>
            <view 
              v-if="images.length < 9" 
              class="image-add" 
              @click="chooseImage"
            >
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>

        <view class="category-section">
          <view class="section-label">
            <text class="label-text">分类</text>
          </view>
          <view class="category-grid">
            <view 
              class="category-item" 
              :class="{ active: selectedCategory === category.id }"
              v-for="category in categories" 
              :key="category.id"
              @click="selectCategory(category)"
            >
              <text class="category-icon">{{ category.icon }}</text>
              <text class="category-name">{{ category.name }}</text>
            </view>
          </view>
        </view>

        <view class="location-section">
          <view class="section-label">
            <text class="label-text">位置</text>
          </view>
          <view class="location-input" @click="chooseLocation">
            <text class="location-icon">📍</text>
            <text class="location-text" :class="{ placeholder: !location }">
              {{ location || '添加位置让更多邻居看到' }}
            </text>
            <text class="location-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="safe-area-bottom"></view>
    </scroll-view>

    <view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
      <view class="bottom-actions">
        <view class="bottom-action" @click="chooseImage">
          <text class="action-icon">📷</text>
          <text class="action-label">图片</text>
        </view>
        <view class="bottom-action" @click="chooseLocation">
          <text class="action-icon">📍</text>
          <text class="action-label">位置</text>
        </view>
      </view>
      <view 
        class="publish-btn" 
        :class="{ disabled: !canPublish || publishing }"
        @click="publishPost"
      >
        <text v-if="!publishing">发布</text>
        <view v-else class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { postsApi } from '../../utils/api'
import { useAuth } from '../../store'

const { userInfo, isLoggedIn, initAuth } = useAuth()

const statusBarHeight = ref(20)
const safeAreaBottom = ref(0)
const content = ref('')
const images = ref<string[]>([])
const location = ref('')
const selectedCategory = ref('daily')
const publishing = ref(false)

const categories = [
  { id: 'daily', name: '日常', icon: '🏠' },
  { id: 'help', name: '求助', icon: '🆘' },
  { id: 'activity', name: '活动', icon: '🎉' },
  { id: 'recommend', name: '推荐', icon: '👍' },
  { id: 'notice', name: '公告', icon: '📢' },
  { id: 'other', name: '其他', icon: '📦' }
]

const canPublish = computed(() => {
  return content.value.trim().length > 0 && !publishing.value
})

onMounted(() => {
  initAuth()
  
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        uni.navigateTo({
          url: '/pages/login/index'
        })
      }
    })
    return
  }

  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  safeAreaBottom.value = systemInfo.safeArea?.bottom ? (systemInfo.screenHeight - systemInfo.safeArea.bottom) : 0
})

function goBack() {
  if (content.value.trim() || images.value.length > 0) {
    uni.showModal({
      title: '提示',
      content: '内容未保存，确定要离开吗？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

function chooseImage() {
  const remaining = 9 - images.value.length
  if (remaining <= 0) {
    uni.showToast({
      title: '最多上传9张图片',
      icon: 'none'
    })
    return
  }

  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

function selectCategory(category: any) {
  selectedCategory.value = category.id
}

function chooseLocation() {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name || res.address || ''
    }
  })
}

async function publishPost() {
  if (!canPublish.value) return

  publishing.value = true

  try {
    // 这里需要上传图片到服务器，现在先用本地路径代替
    // 实际项目中应该先上传图片获取 URL
    const imageUrls = images.value

    await postsApi.createPost({
      content: content.value.trim(),
      images: imageUrls,
      location: location.value || undefined,
      visibility: 'public'
    })

    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
      // 通知首页刷新
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && (prevPage as any).onRefresh) {
        ;(prevPage as any).onRefresh()
      }
    }, 1500)
  } catch (err) {
    console.error('发布失败:', err)
    uni.showToast({
      title: '发布失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 var(--spacing-lg);
}

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.nav-back-icon {
  font-size: 32px;
  color: var(--text-primary);
  font-weight: 300;
  line-height: 1;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-dummy {
  width: 40px;
}

.content {
  height: calc(100vh - 60px - 70px);
}

.form-section {
  padding: var(--spacing-lg);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  background: #f0f0f0;
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.user-community {
  font-size: 13px;
  color: var(--text-muted);
}

.text-input-wrapper {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.text-input {
  width: 100%;
  min-height: 120px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: var(--spacing-sm);
}

.images-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.image-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  color: white;
  font-size: 14px;
  line-height: 1;
}

.image-add {
  aspect-ratio: 1;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.add-icon {
  font-size: 28px;
  color: var(--text-muted);
  line-height: 1;
  margin-bottom: 4px;
}

.add-text {
  font-size: 12px;
  color: var(--text-muted);
}

.category-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.section-label {
  margin-bottom: var(--spacing-md);
}

.label-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-color);
  transition: all 0.2s;
}

.category-item.active {
  border-color: #FF8C42;
  background: rgba(255, 140, 66, 0.1);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.category-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.location-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.location-input {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-color);
  border-radius: var(--radius-md);
}

.location-icon {
  font-size: 18px;
  margin-right: var(--spacing-sm);
}

.location-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.location-text.placeholder {
  color: var(--text-muted);
}

.location-arrow {
  font-size: 20px;
  color: var(--text-muted);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.bottom-actions {
  display: flex;
  gap: var(--spacing-xl);
}

.bottom-action {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.action-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.publish-btn {
  padding: 10px 32px;
  background: linear-gradient(135deg, #FF8C42, #FF7733);
  color: white;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
  min-width: 90px;
  text-align: center;
}

.publish-btn.disabled {
  background: #B0C4DE;
  box-shadow: none;
}

.loading-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: dotPulse 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.safe-area-bottom {
  height: 70px;
}
</style>
