<template>
  <div class="page">
    <NavBar title="发布动态" :fixed="true" />

    <div class="content">
      <div class="form-section">
        <div class="user-info">
          <div 
            class="user-avatar-wrap"
          >
            <img 
              v-if="user?.avatar"
              class="user-avatar" 
              :src="user?.avatar" 
              alt="avatar"
            />
            <span v-else class="user-avatar-placeholder">{{ user?.nickname?.charAt(0) || '邻' }}</span>
          </div>
          <div class="user-detail">
            <span class="user-name">{{ user?.nickname || '邻居' }}</span>
            <span class="user-community">{{ user?.community || '阳光社区' }}</span>
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
              <AppIcon :name="category.icon" class="category-icon" />
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </div>

        <div class="location-section">
          <div class="section-label">
            <span class="label-text">位置</span>
          </div>
          <LocationPicker
            v-model="locationForm"
            :error-text="locationError"
          />
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-actions">
        <div class="bottom-action" @click="chooseImage">
          <AppIcon name="camera" class="action-icon" />
          <span class="action-label">图片</span>
        </div>
        <div class="bottom-action" @click="scrollToLocation">
          <AppIcon name="map-pin" class="action-icon" />
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
import { postService } from '../../services/postService'
import { useAuth } from '../../store'
import { navigateBack } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { setLoginRedirect } from '../../utils/auth'
import { getLocation } from '../../utils/location'
import { useLocationForm } from '../../composables/useLocationForm'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'
import LocationPicker from '../../components/LocationPicker.vue'

const router = useRouter()
const { user, isLoggedIn, initAuth } = useAuth()

const content = ref('')
const images = ref<string[]>([])
const selectedCategory = ref('daily')
const publishing = ref(false)
const showLoginModal = ref(false)

// 使用 LocationPicker + useLocationForm
const { form: locationForm, getSubmitValue, autoFill } = useLocationForm()
const locating = ref(false)
const locationError = ref('')

const categories = [
  { id: 'daily', name: '日常', icon: 'home' },
  { id: 'help', name: '求助', icon: 'help-circle' },
  { id: 'activity', name: '活动', icon: 'star' },
  { id: 'recommend', name: '推荐', icon: 'heart' },
  { id: 'notice', name: '公告', icon: 'megaphone' },
  { id: 'other', name: '其他', icon: 'bookmark' }
]

const canPublish = computed(() => {
  return content.value.trim().length > 0 && !publishing.value
})

onMounted(async () => {
  initAuth()

  if (!isLoggedIn.value) {
    setLoginRedirect('/pages/post/create')
    showLoginModal.value = true
    return
  }

  // 自动定位填充
  locating.value = true
  locationError.value = ''
  try {
    const result = await getLocation({ forceRefresh: false })
    if (result) {
      autoFill(result)
    }
  } catch (e: any) {
    console.warn('[createPost] 定位失败:', e)
    locationError.value = '定位失败，请手动选择'
  } finally {
    locating.value = false
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
          images.value.push(reader.result)
        }
      }
      reader.readAsDataURL(file)
    })
    if (files.length > remaining) {
      toastError('最多上传9张图片，已忽略多余图片')
    } else {
      toastSuccess('图片已添加')
    }
  }
  input.click()
}

function removeImage(index: number) {
  images.value.splice(index, 1)
}

function selectCategory(category: any) {
  selectedCategory.value = category.id
}

function scrollToLocation() {
  const el = document.querySelector('.location-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

async function publishPost() {
  if (!canPublish.value) return

  publishing.value = true

  try {
    const imageUrls = images.value

    await postService.createPost({
      content: content.value.trim(),
      images: imageUrls,
      location: getSubmitValue() || undefined,
      visibility: 'public'
    })

    toastSuccess('发布成功')

    setTimeout(() => {
      navigateBack()
    }, 1500)
  } catch {
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

.content {
  padding-top: 56px;
  padding-top: calc(56px + env(safe-area-inset-top));
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
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
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

@media (min-width: 1024px) {
  .bottom-bar {
    left: var(--nav-sidebar-width, 220px);
  }

  .modal-overlay {
    left: var(--nav-sidebar-width, 220px);
  }
}
</style>
