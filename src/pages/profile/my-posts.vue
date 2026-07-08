<template>
  <div class="page">
    <NavBar title="我的发布" actionText="发布" @action-click="goPublish" />

    <div class="scroll-content" ref="scrollRef" @scroll="onScroll">
      <!-- 空状态 -->
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <AppIcon name="edit" class="empty-icon" />
        <span class="empty-text">暂无动态</span>
        <div class="btn btn-primary" style="margin-top: 24px;" @click="goPublish">
          发布第一条动态
        </div>
      </div>

      <!-- 动态列表 -->
      <div v-else class="post-list">
        <div class="post-card" v-for="post in posts" :key="post.id" @click="goToPostDetail(post)">
          <div class="post-header">
            <div class="avatar-wrap" v-if="post.user?.avatar">
              <img class="post-avatar" :src="post.user?.avatar" alt="头像" />
            </div>
            <div v-else class="post-avatar avatar-placeholder">{{ (post.user?.nickname || '邻').charAt(0) }}</div>
            <div class="post-user-info">
              <span class="post-username">{{ post.user?.nickname }}</span>
              <span class="post-time">{{ formatTime(post.created_at) }}</span>
            </div>
          </div>

          <div class="post-content">
            <span class="post-text">{{ post.content }}</span>
          </div>

          <div v-if="post.images && post.images.length > 0" class="post-images">
            <img
              v-for="(img, index) in post.images.slice(0, 9)"
              :key="index"
              class="post-image"
              :src="img"
              alt="图片"
              :class="{ 'single-image': post.images.length === 1 }"
            />
          </div>

          <div class="post-footer">
            <div class="post-action">
              <span class="action-icon">❤️</span>
              <span class="action-text">{{ post.like_count }}</span>
            </div>
            <div class="post-action">
              <AppIcon name="message-circle" class="action-icon" />
              <span class="action-text">{{ post.comment_count }}</span>
            </div>
            <div class="post-action">
              <AppIcon name="calendar" class="action-icon" />
              <span class="action-text">{{ getVisibilityText(post.visibility) }}</span>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="loading" class="loading-more">
          <span>加载中...</span>
        </div>

        <div v-if="!hasMore && posts.length > 0" class="no-more">
          <span>没有更多了</span>
        </div>

        <!-- 下拉刷新提示 -->
        <div v-if="refreshing" class="refresh-indicator">
          <div class="loading-spinner small"></div>
          <span>刷新中...</span>
        </div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userService } from '../../services/userService'
import { navigateBackSmart, navigateTo } from '../../utils/router'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'

const statusBarHeight = ref(20)
const loading = ref(false)
const posts = ref<any[]>([])
const hasMore = ref(true)
const scrollRef = ref<HTMLElement | null>(null)
const refreshing = ref(false)

// B9: 真实分页参数，替代原先 limit:200 全量拉取 + 前端过滤
const page = ref(1)
const PAGE_SIZE = 10

onMounted(async () => {
  statusBarHeight.value = 20
  await loadPosts(false)
})

const goBack = () => {
  navigateBackSmart()
}

const goPublish = () => {
  navigateTo('/pages/post/create')
}

const goToPostDetail = (post: any) => {
  navigateTo(`/pages/post/detail?id=${post.id}`)
}

const loadPosts = async (append = false) => {
  if (loading.value) return
  try {
    loading.value = true
    const nextPage = append ? page.value + 1 : 1
    // 直接使用后端「我的动态」分页接口，按当前登录用户过滤
    const res = await userService.getMyPosts({ page: nextPage, limit: PAGE_SIZE })
    const items: any[] = (res && (res as any).items) || []
    if (append) {
      posts.value = [...posts.value, ...items]
    } else {
      posts.value = items
    }
    page.value = nextPage
    // 依据后端返回的 total 判断是否还有更多
    const total = (res && (res as any).total) || 0
    hasMore.value = posts.value.length < total && items.length === PAGE_SIZE
  } catch {
    if (!append) posts.value = []
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  // 下拉刷新：回到第 1 页
  await loadPosts(false)
  scrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const onScroll = () => {
  if (!scrollRef.value) return
  const el = scrollRef.value
  if (el.scrollTop <= -60 && !refreshing.value) {
    onRefresh()
  }
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100 && !loading.value && hasMore.value) {
    // 上拉加载更多：追加下一页（修复原先重复加载第 1 页的 bug）
    loadPosts(true)
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

const getVisibilityText = (visibility: string) => {
  const map: Record<string, string> = {
    public: '公开',
    community: '社区可见',
    private: '仅自己可见'
  }
  return map[visibility] || '公开'
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
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

.btn {
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all var(--transition-smooth);
}

.btn-primary {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 下拉刷新 */
.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 动态列表 */
.post-list {
  padding: 12px;
}

.post-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  margin-right: 12px;
  object-fit: cover;
}

.post-user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-username {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.post-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.post-content {
  margin-bottom: 12px;
}

.post-text {
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.6;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  background: var(--color-bg-tertiary);
  object-fit: cover;
}

.post-image.single-image {
  grid-column: span 3;
  max-width: 240px;
  aspect-ratio: 4/3;
}

.post-footer {
  display: flex;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}

.post-action {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.action-icon {
  font-size: 16px;
  margin-right: 4px;
}

.action-text {
  font-size: 13px;
  color: var(--color-text-secondary);
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

/* 加载状态 */
.loading-more,
.no-more {
  text-align: center;
  padding: 24px;
  color: var(--color-text-tertiary);
  font-size: 14px;
}
</style>