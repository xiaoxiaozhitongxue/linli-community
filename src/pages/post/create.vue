<template>
  <div class="page">
    <div class="nav-header">
      <div class="nav-bar">
        <div class="nav-back" @click="goBack">
          <span class="nav-back-icon">‹</span>
        </div>
        <span class="nav-title">发布动态</span>
        <div class="nav-dummy"></div>
      </div>
    </div>

    <div class="content">
      <div class="form-section">
        <div class="user-info">
          <img 
            class="user-avatar" 
            :src="userInfo?.avatar || 'https://via.placeholder.com/48'" 
            alt="avatar"
          />
          <div class="user-detail">
            <span class="user-name">{{ userInfo?.nickname || '邻居' }}</span>
            <span class="user-community">{{ userInfo?.community || '阳光社区' }}</span>
          </div>
        </div>

        <div class="text-input-wrapper">
          <textarea 
            class="text-input" 
            v-model="content" 
            placeholder="分享你的社区生活..." 
            :maxlength="500"
          ></textarea>
          <div class="char-count">{{ content.length }}/500</div>
        </div>

        <div class="images-section">
          <div class="image-grid">
            <div 
              class="image-item" 
              v-for="(img, index) in images" 
              :key="index"
            >
              <img class="image-preview" :src="img" alt="preview" />
              <div class="image-remove" @click="removeImage(index)">
                <span class="remove-icon">✕</span>
              </div>
            </div>
            <div 
              v-if="images.length < 9" 
              class="image-add" 
              @click="chooseImage"
            >
              <span class="add-icon">+</span>
              <span class="add-text">添加图片</span>
            </div>
          </div>
        </div>

        <div class="category-section">
          <div class="section-label">
            <span class="label-text">分类</span>
          </div>
          <div class="category-grid">
            <div 
              class="category-item" 
              :class="{ active: selectedCategory === category.id }"
              v-for="category in categories" 
              :key="category.id"
              @click="selectCategory(category)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </div>

        <div class="location-section">
          <div class="section-label">
            <span class="label-text">位置</span>
          </div>
          <div class="location-input" @click="openLocationInput">
            <span class="location-icon">📍</span>
            <span class="location-text" :class="{ placeholder: !location }">
              {{ location || '添加位置让更多邻居看到' }}
            </span>
            <span class="location-arrow">›</span>
          </div>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-actions">
        <div class="bottom-action" @click="chooseImage">
          <span class="action-icon">📷</span>
          <span class="action-label">图片</span>
        </div>
        <div class="bottom-action" @click="openLocationInput">
          <span class="action-icon">📍</span>
          <span class="action-label">位置</span>
        </div>
      </div>
      <div 
        class="publish-btn" 
        :class="{ disabled: !canPublish || publishing }"
        @click="publishPost"
      >
        <span v-if="!publishing">发布</span>
        <div v-else class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>

    <!-- 地点输入弹窗 -->
    <div v-if="showLocationModal" class="modal-overlay" @click.self="showLocationModal = false">
      <div class="location-modal">
        <div class="location-modal-header">
          <span class="modal-cancel" @click="showLocationModal = false">取消</span>
          <span class="modal-title">输入位置</span>
          <span class="modal-confirm" @click="confirmLocation">确定</span>
        </div>
        <div class="location-modal-body">
          <input
            class="location-input-field"
            v-model="tempLocation"
            placeholder="请输入位置名称"
            @keyup.enter="confirmLocation"
          />
        </div>
      </div>
    </div>

    <!-- 登录提示弹窗 -->
    <div v-if="showLoginModal" class="modal-overlay">
      <div class="confirm-modal">
        <div class="confirm-modal-body">
          <span class="confirm-title">提示</span>
          <span class="confirm-text">请先登录</span>
        </div>
        <div class="confirm-modal-footer">
          <span class="confirm-btn" @click="goToLogin">确定</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postsApi } from '../../utils/api'
import { useAuth } from '../../store'
import { navigateBack } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'

const router = useRouter()
const { userInfo, isLoggedIn, initAuth } = useAuth()

const content = ref('')
const images = ref<string[]>([])
const location = ref('')
const selectedCategory = ref('daily')
const publishing = ref(false)
const showLoginModal = ref(false)
const showLocationModal = ref(false)
const tempLocation = ref('')

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
    showLoginModal.value = true
    return
  }
})

function goBack() {
  if (content.value.trim() || images.value.length > 0) {
    if (window.confirm('内容未保存，确定要离开吗？')) {
      navigateBack()
    }
  } else {
    navigateBack()
  }
}

function goToLogin() {
  showLoginModal.value = false
  router.push('/pages/login/index')
}

function chooseImage() {
  const remaining = 9 - images.value.length
  if (remaining <= 0) {
    toastError('最多上传9张图片')
    return
  }

  const mockImages = [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'
  ]
  const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)]
  images.value.push(randomImg)
  toastSuccess('图片已添加（模拟）')
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

function selectCategory(category: any) {
  selectedCategory.value = category.id
}

function openLocationInput() {
  tempLocation.value = location.value
  showLocationModal.value = true
}

function confirmLocation() {
  location.value = tempLocation.value.trim()
  showLocationModal.value = false
}

async function publishPost() {
  if (!canPublish.value) return

  publishing.value = true

  try {
    const imageUrls = images.value

    await postsApi.createPost({
      content: content.value.trim(),
      images: imageUrls,
      location: location.value || undefined,
      visibility: 'public'
    })

    toastSuccess('发布成功')

    setTimeout(() => {
      navigateBack()
    }, 1500)
  } catch (err) {
    console.error('发布失败:', err)
    toastError('发布失败，请稍后重试')
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color, #F5F5F0);
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--card-bg, #FFFFFF);
  border-bottom: 1px solid var(--border-color, #E8E8E8);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 var(--spacing-lg, 16px);
  padding-top: env(safe-area-inset-top);
}

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
}

.nav-back-icon {
  font-size: 32px;
  color: var(--text-primary, #333333);
  font-weight: 300;
  line-height: 1;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #333333);
}

.nav-dummy {
  width: 40px;
}

.content {
  padding-top: 60px;
  padding-top: calc(60px + env(safe-area-inset-top));
  min-height: 100vh;
  padding-bottom: 70px;
}

.form-section {
  padding: var(--spacing-lg, 16px);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg, 16px);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: var(--spacing-md, 12px);
  background: #f0f0f0;
  object-fit: cover;
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #333333);
  margin-bottom: 2px;
}

.user-community {
  font-size: 13px;
  color: var(--text-muted, #999999);
}

.text-input-wrapper {
  background: var(--card-bg, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 16px);
  margin-bottom: var(--spacing-md, 12px);
}

.text-input {
  width: 100%;
  min-height: 120px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary, #333333);
  border: none;
  outline: none;
  resize: vertical;
  background: transparent;
  font-family: inherit;
}

.text-input::placeholder {
  color: var(--text-muted, #999999);
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: var(--text-muted, #999999);
  margin-top: var(--spacing-sm, 8px);
}

.images-section {
  background: var(--card-bg, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 16px);
  margin-bottom: var(--spacing-md, 12px);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md, 12px);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  object-fit: cover;
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
  cursor: pointer;
}

.remove-icon {
  color: white;
  font-size: 14px;
  line-height: 1;
}

.image-add {
  aspect-ratio: 1;
  border: 1px dashed var(--border-color, #E8E8E8);
  border-radius: var(--radius-md, 12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-color, #F5F5F0);
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-add:hover {
  border-color: #FF8C42;
}

.add-icon {
  font-size: 28px;
  color: var(--text-muted, #999999);
  line-height: 1;
  margin-bottom: 4px;
}

.add-text {
  font-size: 12px;
  color: var(--text-muted, #999999);
}

.category-section {
  background: var(--card-bg, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 16px);
  margin-bottom: var(--spacing-md, 12px);
}

.section-label {
  margin-bottom: var(--spacing-md, 12px);
}

.label-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #333333);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md, 12px);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md, 12px);
  border: 1px solid var(--border-color, #E8E8E8);
  border-radius: var(--radius-md, 12px);
  background: var(--bg-color, #F5F5F0);
  transition: all 0.2s;
  cursor: pointer;
}

.category-item.active {
  border-color: #FF8C42;
  background: rgba(255, 140, 66, 0.1);
}

.category-item:hover {
  border-color: #FF8C42;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.category-name {
  font-size: 13px;
  color: var(--text-primary, #333333);
  font-weight: 500;
}

.location-section {
  background: var(--card-bg, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 16px);
  margin-bottom: var(--spacing-md, 12px);
}

.location-input {
  display: flex;
  align-items: center;
  padding: var(--spacing-md, 12px);
  background: var(--bg-color, #F5F5F0);
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
}

.location-icon {
  font-size: 18px;
  margin-right: var(--spacing-sm, 8px);
}

.location-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary, #333333);
}

.location-text.placeholder {
  color: var(--text-muted, #999999);
}

.location-arrow {
  font-size: 20px;
  color: var(--text-muted, #999999);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg, #FFFFFF);
  border-top: 1px solid var(--border-color, #E8E8E8);
  padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.bottom-actions {
  display: flex;
  gap: var(--spacing-xl, 24px);
}

.bottom-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.action-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.action-label {
  font-size: 11px;
  color: var(--text-secondary, #666666);
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
  cursor: pointer;
  transition: opacity 0.2s;
}

.publish-btn:hover {
  opacity: 0.9;
}

.publish-btn.disabled {
  background: #B0C4DE;
  box-shadow: none;
  cursor: default;
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

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-modal {
  width: 90%;
  max-width: 400px;
  background: #FFFFFF;
  border-radius: 16px;
  animation: fadeInScale 0.2s ease;
}

.location-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #F0F0E8;
}

.modal-cancel {
  font-size: 15px;
  color: #9A9A8A;
  cursor: pointer;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
}

.modal-confirm {
  font-size: 15px;
  color: #FF8C42;
  font-weight: 500;
  cursor: pointer;
}

.location-modal-body {
  padding: 16px;
}

.location-input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E8E8E0;
  border-radius: 12px;
  font-size: 15px;
  color: #1A1A1A;
  outline: none;
  background: #F9F9F5;
}

.location-input-field:focus {
  border-color: #FF8C42;
  background: #FFFFFF;
}

.location-input-field::placeholder {
  color: #9A9A8A;
}

.confirm-modal {
  width: 80%;
  max-width: 300px;
  background: #FFFFFF;
  border-radius: 16px;
  animation: fadeInScale 0.2s ease;
}

.confirm-modal-body {
  padding: 24px 16px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirm-title {
  font-size: 17px;
  font-weight: 600;
  color: #1A1A1A;
}

.confirm-text {
  font-size: 15px;
  color: #4A4A3A;
}

.confirm-modal-footer {
  border-top: 1px solid #F0F0E8;
  text-align: center;
}

.confirm-btn {
  display: block;
  padding: 14px;
  font-size: 16px;
  color: #FF8C42;
  font-weight: 500;
  cursor: pointer;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>