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
import { setLoginRedirect } from '../../utils/auth'

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
    setLoginRedirect('/pages/post/create')
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
  background-color: var(--color-bg-primary);
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 var(--spacing-lg);
  padding-top: env(safe-area-inset-top);
}

.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.nav-back:hover {
  background-color: var(--color-bg-tertiary);
}

.nav-back-icon {
  font-size: 32px;
  color: var(--color-text-primary);
  font-weight: 300;
  line-height: 1;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  border-radius: var(--radius-full);
  margin-right: var(--spacing-md);
  background: var(--color-bg-tertiary);
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
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.user-community {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.text-input-wrapper {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.text-input-wrapper:focus-within {
  box-shadow: var(--shadow-md);
}

.text-input {
  width: 100%;
  min-height: 120px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-primary);
  border: none;
  outline: none;
  resize: vertical;
  background: transparent;
  font-family: inherit;
}

.text-input::placeholder {
  color: var(--color-text-placeholder);
}

.char-count {
  text-align: right;
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-sm);
}

.images-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  background: var(--color-bg-tertiary);
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 4px;
  right: 4px;
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

.image-remove:hover {
  transform: scale(1.1);
}

.remove-icon {
  color: var(--color-text-white);
  font-size: 14px;
  line-height: 1;
}

.image-add {
  aspect-ratio: 1;
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
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

.category-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.section-label {
  margin-bottom: var(--spacing-md);
}

.label-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.category-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.category-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.category-name {
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.category-item.active .category-name {
  color: var(--color-primary);
}

.location-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.location-input {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.location-input:hover {
  background: var(--color-primary-soft);
}

.location-icon {
  font-size: 18px;
  margin-right: var(--spacing-sm);
}

.location-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
}

.location-text.placeholder {
  color: var(--color-text-placeholder);
}

.location-arrow {
  font-size: 20px;
  color: var(--color-text-muted);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  box-shadow: var(--shadow-lg);
}

.bottom-actions {
  display: flex;
  gap: var(--spacing-xl);
}

.bottom-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.bottom-action:hover {
  background-color: var(--color-bg-tertiary);
}

.action-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

.action-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.publish-btn {
  padding: 10px 32px;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  font-size: 15px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  min-width: 90px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.publish-btn:hover:not(.disabled) {
  box-shadow: var(--shadow-hover);
  transform: translateY(-1px);
}

.publish-btn.disabled {
  background: var(--color-text-muted);
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
  border-radius: var(--radius-full);
  background: var(--color-text-white);
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
  background: var(--color-bg-overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-modal {
  width: 90%;
  max-width: 400px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: fadeInScale var(--transition-smooth) ease;
  box-shadow: var(--shadow-2xl);
}

.location-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.modal-cancel {
  font-size: 15px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.modal-cancel:hover {
  color: var(--color-text-secondary);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.modal-confirm {
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.modal-confirm:hover {
  color: var(--color-primary-dark);
}

.location-modal-body {
  padding: 16px;
}

.location-input-field {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  font-size: 15px;
  color: var(--color-text-primary);
  outline: none;
  background: var(--color-bg-tertiary);
  transition: all var(--transition-normal);
}

.location-input-field:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.location-input-field::placeholder {
  color: var(--color-text-placeholder);
}

.confirm-modal {
  width: 80%;
  max-width: 300px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: fadeInScale var(--transition-smooth) ease;
  box-shadow: var(--shadow-2xl);
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
  color: var(--color-text-primary);
}

.confirm-text {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.confirm-modal-footer {
  border-top: 1px solid var(--color-border-light);
  text-align: center;
}

.confirm-btn {
  display: block;
  padding: 14px;
  font-size: 16px;
  color: var(--color-primary);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

.confirm-btn:hover {
  background-color: var(--color-primary-soft);
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