<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="navbar-content">
        <div class="back-btn" @click="goBack">
          <span>←</span>
        </div>
        <span class="navbar-title">我的收藏</span>
        <div class="placeholder"></div>
      </div>
    </div>

    <div class="scroll-content" ref="scrollRef" @scroll="onScroll">
      <!-- 空状态 -->
      <div v-if="!loading && favorites.length === 0" class="empty-state">
        <span class="empty-icon">⭐</span>
        <span class="empty-text">暂无收藏</span>
      </div>

      <!-- 收藏列表 -->
      <div v-else class="favorite-list">
        <div class="favorite-card" v-for="item in favorites" :key="item.id">
          <div class="favorite-header">
            <div class="type-tag" :class="item.target_type">
              {{ getTypeText(item.target_type) }}
            </div>
            <span class="favorite-time">{{ formatTime(item.created_at) }}</span>
          </div>

          <div v-if="item.target" class="favorite-content">
            <!-- 动态类型 -->
            <div v-if="item.target_type === 'post'" class="post-preview">
              <span class="post-preview-text">{{ item.target.content }}</span>
              <div v-if="item.target.images && item.target.images.length > 0" class="post-preview-images">
                <img
                  v-for="(img, index) in item.target.images.slice(0, 3)"
                  :key="index"
                  class="preview-image"
                  :src="img"
                  alt="图片"
                />
              </div>
              <div class="post-preview-meta">
                <div class="meta-item">
                  <span class="meta-icon">❤️</span>
                  <span class="meta-text">{{ item.target.like_count }}</span>
                </div>
                <div class="meta-item">
                  <AppIcon name="message-circle" class="meta-icon" />
                  <span class="meta-text">{{ item.target.comment_count }}</span>
                </div>
              </div>
            </div>

            <!-- 活动类型 -->
            <div v-if="item.target_type === 'activity'" class="activity-preview">
              <div class="preview-cover">
                <img
                  v-if="item.target.images && item.target.images.length > 0"
                  class="cover-img"
                  :src="item.target.images[0]"
                  alt="活动封面"
                />
                <div v-else class="cover-placeholder">
                  <AppIcon :name="getCategoryIcon(item.target.category)" />
                </div>
              </div>
              <div class="preview-info">
                <span class="preview-title">{{ item.target.title }}</span>
                <span class="preview-desc">{{ item.target.location }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="loading" class="loading-more">
          <span>加载中...</span>
        </div>

        <div v-if="!hasMore && favorites.length > 0" class="no-more">
          <span>没有更多了</span>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateBackSmart } from '../../utils/router'
import { request } from '../../utils/request'
import { useAuth } from '../../store'
import { localStore } from '../../services/localStore'
import AppIcon from '../../components/AppIcon.vue'

const statusBarHeight = ref(20)
const loading = ref(false)
const favorites = ref<any[]>([])
const hasMore = ref(true)
const scrollRef = ref<HTMLElement | null>(null)

const { isLoggedIn, getCurrentPhone } = useAuth()

/** 未登录 / 接口异常时读取本地收藏 */
const loadLocalFavorites = (): any[] => {
  const phone = getCurrentPhone() || undefined
  return localStore.getArray('favorites', [], phone)
}

onMounted(() => {
  statusBarHeight.value = 20
  loadFavorites()
})

const goBack = () => {
  navigateBackSmart()
}

const loadFavorites = async () => {
  if (loading.value) return
  loading.value = true
  try {
    if (isLoggedIn.value) {
      const res = await request<{ items: any[] }>({
        url: '/api/user/favorites',
        method: 'GET',
        data: { page: 1, limit: 50 },
        showError: false
      })
      favorites.value = (res?.data?.items || []).map((it: any) => ({
        id: it.id,
        target_type: it.target_type,
        created_at: it.created_at,
        target: it.target || null
      }))
    } else {
      favorites.value = loadLocalFavorites()
    }
    hasMore.value = false
  } catch {
    // 接口异常时降级为本地收藏，保证页面可用
    favorites.value = loadLocalFavorites()
  } finally {
    loading.value = false
  }
}

const onScroll = () => {
  if (!scrollRef.value) return
  const el = scrollRef.value
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
    loadFavorites()
  }
}

const formatTime = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 2592000) return Math.floor(diff / 86400) + '天前'

  const date = new Date(timestamp * 1000)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    post: '动态',
    comment: '评论',
    activity: '活动'
  }
  return map[type] || '内容'
}

const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    sports: 'target',
    culture: 'settings',
    charity: 'heart',
    party: 'star',
    other: 'bookmark'
  }
  return map[category] || 'bookmark'
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

/* 导航栏 */
.navbar {
  background: var(--color-bg-secondary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 44px;
}

.back-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.back-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.placeholder {
  width: 44px;
}

.scroll-content {
  overflow-y: auto;
  height: calc(100vh - 60px);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--color-text-tertiary);
}

/* 收藏列表 */
.favorite-list {
  padding: 12px;
}

.favorite-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.favorite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.type-tag {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.type-tag.post {
  background: #E3F2FD;
  color: #2196F3;
}

.type-tag.comment {
  background: #F3E5F5;
  color: #9C27B0;
}

.type-tag.activity {
  background: #FFF3E0;
  color: #FF9800;
}

.favorite-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.favorite-content {
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}

/* 动态预览 */
.post-preview {
}

.post-preview-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.post-preview-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
  object-fit: cover;
}

.post-preview-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-icon {
  font-size: 14px;
  margin-right: 4px;
}

.meta-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 活动预览 */
.activity-preview {
  display: flex;
  gap: 12px;
}

.preview-cover {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  font-size: 32px;
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.preview-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载状态 */
.loading-more,
.no-more {
  text-align: center;
  padding: 24px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}
</style>