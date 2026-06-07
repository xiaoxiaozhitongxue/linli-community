<template>
  <div class="page">
    <div class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="status-content">
        <div class="location" @click="chooseLocation">
          <span class="location-icon">📍</span>
          <span class="location-text">{{ communityName }}</span>
          <span class="location-arrow">▼</span>
        </div>
        <div class="search-bar" @click="goToSearch">
          <span class="search-icon">🔍</span>
          <span class="search-placeholder">搜索邻里、活动...</span>
        </div>
      </div>
    </div>

    <!-- 下拉刷新指示器 -->
    <div v-if="showRefreshIndicator" class="refresh-indicator" :style="{ top: (statusBarHeight + 60) + 'px' }">
      <div class="refresh-content">
        <div class="loading-spinner" :class="{ spinning: refreshing }"></div>
        <span>{{ refreshing ? '正在刷新...' : '下拉刷新' }}</span>
      </div>
    </div>

    <div
      class="content"
      :style="{ paddingTop: (statusBarHeight + 60) + 'px' }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="banner-section">
        <div class="banner-swiper" @touchstart="onBannerTouchStart" @touchmove="onBannerTouchMove" @touchend="onBannerTouchEnd">
          <div
            class="banner-item"
            v-for="(banner, index) in banners"
            :key="index"
            :class="{ active: currentBanner === index, prev: currentBanner === (index + 1) % banners.length, next: currentBanner === (index - 1 + banners.length) % banners.length }"
            :style="{ background: banner.bgColor, transform: getBannerTransform(index) }"
          >
            <div class="banner-content">
              <span class="banner-title">{{ banner.title }}</span>
              <span class="banner-desc">{{ banner.desc }}</span>
            </div>
          </div>
          <!-- 轮播指示器 -->
          <div class="banner-dots">
            <div
              v-for="(banner, index) in banners"
              :key="index"
              class="banner-dot"
              :class="{ active: currentBanner === index }"
              @click.stop="goToBanner(index)"
            ></div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <div
          class="quick-item"
          v-for="action in quickActions"
          :key="action.id"
          @click="handleQuickAction(action)"
        >
          <div class="quick-icon" :style="{ background: action.bgColor }">
            <span>{{ action.icon }}</span>
          </div>
          <span class="quick-text">{{ action.name }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-title">🔥 热门活动</span>
          <span class="section-more" @click="goToActivities">查看更多 ›</span>
        </div>
        <div class="activity-scroll">
          <div
            class="activity-card"
            v-for="activity in hotActivities"
            :key="activity.id"
            @click="goToActivityDetail(activity.id)"
          >
            <div class="activity-cover" :style="{ background: activity.coverBg }">
              <span class="activity-emoji">{{ activity.emoji }}</span>
            </div>
            <div class="activity-info">
              <span class="activity-name">{{ activity.name }}</span>
              <div class="activity-meta">
                <span class="activity-time">{{ activity.time }}</span>
                <span class="activity-join">{{ activity.joined }}人参与</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-title">📖 邻里动态</span>
        </div>

        <div v-if="loading && feedList.length === 0" class="loading-container">
          <div class="skeleton-card" v-for="i in 3" :key="i">
            <div class="skeleton-header">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-lines">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line tiny"></div>
              </div>
            </div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>

        <div v-else-if="error && feedList.length === 0" class="error-container">
          <span class="error-icon">😢</span>
          <span class="error-text">{{ error }}</span>
          <div class="retry-btn" @click="onRefresh">
            <span>重试</span>
          </div>
        </div>

        <div v-else class="feed-list">
          <div
            class="feed-card animate-fadeIn"
            v-for="(post, index) in feedList"
            :key="post.id"
            :style="{ animationDelay: (index * 0.1) + 's' }"
          >
            <div class="feed-header">
              <img
                class="feed-avatar"
                :src="post.user?.avatar || 'https://via.placeholder.com/40'"
              />
              <div class="feed-user-info">
                <span class="feed-username">{{ post.user?.nickname || '邻居' }}</span>
                <div class="feed-meta">
                  <span class="feed-time">{{ formatTime(post.created_at) }}</span>
                  <span v-if="post.location" class="feed-location">• {{ post.location }}</span>
                </div>
              </div>
            </div>

            <div class="feed-content">
              <span class="feed-text">{{ post.content }}</span>
              <div v-if="post.images && post.images.length > 0" class="feed-images" :class="'images-' + post.images.length">
                <img
                  class="feed-image"
                  v-for="(img, imgIndex) in post.images"
                  :key="imgIndex"
                  :src="img"
                  @click="previewImage(post.images, imgIndex)"
                />
              </div>
            </div>

            <div class="feed-actions">
              <div
                class="feed-action"
                :class="{ liked: post.is_liked }"
                @click="likePost(post, $event)"
              >
                <span class="action-icon" :class="{ 'heart-beat': post.is_liked }">{{ post.is_liked ? '❤️' : '🤍' }}</span>
                <span class="action-count">{{ post.like_count || 0 }}</span>
              </div>
              <div class="feed-action" @click="showComments(post)">
                <span class="action-icon">💬</span>
                <span class="action-count">{{ post.comment_count || 0 }}</span>
              </div>
              <div class="feed-action" @click="sharePost(post)">
                <span class="action-icon">🔗</span>
                <span class="action-count">分享</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasMore && feedList.length > 0" class="load-more">
          <span v-if="!loadingMore" @click="loadMorePosts">加载更多</span>
          <div v-else class="loading-more">
            <div class="loading-spinner small"></div>
            <span>加载中...</span>
          </div>
        </div>

        <div v-if="!hasMore && feedList.length > 0" class="no-more">
          <span>— 没有更多了 —</span>
        </div>

        <div class="safe-area-bottom"></div>
      </div>
    </div>

    <div class="fab-btn" @click="goToCreate">
      <span class="fab-icon">✏️</span>
      <span class="fab-text">发布</span>
    </div>

    <div v-if="showCommentModal" class="comment-mask" @click="hideComments">
      <div class="comment-panel" @click.stop>
        <div class="comment-header">
          <span class="comment-title">评论 ({{ currentPost?.comment_count || 0 }})</span>
          <span class="comment-close" @click="hideComments">✕</span>
        </div>

        <div class="comment-list">
          <div v-if="commentLoading && comments.length === 0" class="comment-loading">
            <div class="loading-spinner small"></div>
          </div>
          <div v-else-if="comments.length === 0" class="comment-empty">
            <span class="empty-icon">💬</span>
            <span class="empty-text">暂无评论，快来抢沙发吧！</span>
          </div>
          <div v-else class="comment-item" v-for="comment in comments" :key="comment.id">
            <img
              class="comment-avatar"
              :src="comment.user?.avatar || 'https://via.placeholder.com/32'"
            />
            <div class="comment-content">
              <span class="comment-user">{{ comment.user?.nickname || '邻居' }}</span>
              <span class="comment-text">{{ comment.content }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="comment-input-wrapper">
          <input
            class="comment-input"
            v-model="commentText"
            placeholder="说点什么..."
            :disabled="!isLoggedIn"
            @keyup.enter="submitComment"
          />
          <div
            class="comment-submit"
            :class="{ disabled: !commentText.trim() || !isLoggedIn }"
            @click="submitComment"
          >
            <span>发送</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { postsApi, type Post, type Comment } from '../../utils/api'
import { useAuth } from '../../store'
import { toastSuccess, toastError, toastInfo } from '../../utils/toast'
import { navigateTo, switchTab } from '../../utils/router'

const { initAuth, isLoggedIn } = useAuth()

const statusBarHeight = ref(20)
const communityName = ref('阳光社区')
const refreshing = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const hasMore = ref(true)
const currentPage = ref(1)
const currentBanner = ref(0)
let bannerTimer: any = null
const showRefreshIndicator = ref(false)

// 下拉刷新相关
let touchStartY = 0
let touchMoveY = 0
let pullDistance = 0

// 轮播图滑动相关
let bannerTouchStartX = 0
let bannerTouchMoveX = 0

const banners = ref([
  {
    title: '周末邻里集市',
    desc: '欢迎来摆摊、淘宝、串门',
    bgColor: 'linear-gradient(135deg, #FF8C42, #FFB380)'
  },
  {
    title: '老人关怀计划',
    desc: '志愿者招募中，邀请您加入',
    bgColor: 'linear-gradient(135deg, #4CAF50, #81C784)'
  },
  {
    title: '社区创业沙龙',
    desc: '把兴趣变成生意，邻居先成为客户',
    bgColor: 'linear-gradient(135deg, #2196F3, #64B5F6)'
  }
])

const quickActions = ref([
  { id: 'neighbor', name: '社区客厅', icon: '🏠', bgColor: '#FFF3E0', path: '/pages/neighborhood/index' },
  { id: 'help', name: 'AI互助', icon: '🤝', bgColor: '#E8F5E9', path: '/pages/ai-helper/index' },
  { id: 'business', name: '创业', icon: '💰', bgColor: '#E3F2FD', path: '/pages/business/index' },
  { id: 'elderly', name: '老人关怀', icon: '👴', bgColor: '#FCE4EC', path: '/pages/elderly/index' }
])

const hotActivities = ref([
  { id: '1', name: '周末亲子烘焙', emoji: '🧁', time: '本周六 14:00', joined: 23, coverBg: '#FFE0B2' },
  { id: '2', name: '邻里足球赛', emoji: '⚽', time: '本周日 09:00', joined: 45, coverBg: '#C8E6C9' },
  { id: '3', name: '便民义诊', emoji: '🏥', time: '下周三 08:00', joined: 67, coverBg: '#BBDEFB' },
  { id: '4', name: '广场舞活动', emoji: '💃', time: '每天 19:00', joined: 89, coverBg: '#F8BBD9' }
])

const feedList = ref<Post[]>([])

const showCommentModal = ref(false)
const currentPost = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const commentText = ref('')
const commentLoading = ref(false)

// 轮播图变换
function getBannerTransform(index: number) {
  const diff = index - currentBanner.value
  return `translateX(${diff * 100}%)`
}

function goToBanner(index: number) {
  stopBannerAutoPlay()
  currentBanner.value = index
  startBannerAutoPlay()
}

function onBannerTouchStart(e: TouchEvent) {
  bannerTouchStartX = e.touches[0].clientX
  stopBannerAutoPlay()
}

function onBannerTouchMove(e: TouchEvent) {
  bannerTouchMoveX = e.touches[0].clientX
}

function onBannerTouchEnd() {
  const diff = bannerTouchStartX - bannerTouchMoveX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      // 左滑 - 下一张
      currentBanner.value = (currentBanner.value + 1) % banners.value.length
    } else {
      // 右滑 - 上一张
      currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
    }
  }
  startBannerAutoPlay()
}

// 下拉刷新触摸事件
function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
  touchMoveY = touchStartY
}

function onTouchMove(e: TouchEvent) {
  touchMoveY = e.touches[0].clientY
  pullDistance = touchMoveY - touchStartY

  // 只有顶部区域下拉才显示刷新指示器
  if (pullDistance > 30 && !refreshing.value) {
    showRefreshIndicator.value = true
  }
}

function onTouchEnd() {
  if (pullDistance > 80 && !refreshing.value) {
    onRefresh()
  }
  pullDistance = 0
  setTimeout(() => {
    if (!refreshing.value) {
      showRefreshIndicator.value = false
    }
  }, 300)
}

async function fetchPosts(page: number = 1, isRefresh: boolean = false) {
  if (isRefresh) {
    error.value = ''
  }

  try {
    const response = await postsApi.getPosts({ page, limit: 10 })

    if (isRefresh) {
      feedList.value = response.items
    } else {
      feedList.value = [...feedList.value, ...response.items]
    }

    currentPage.value = page
    hasMore.value = page < response.total_pages
  } catch (err) {
    if (isRefresh) {
      error.value = '加载失败，请稍后重试'
    }
    console.error('获取动态失败:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
    refreshing.value = false
    showRefreshIndicator.value = false
  }
}

async function onRefresh() {
  refreshing.value = true
  showRefreshIndicator.value = true
  currentPage.value = 1
  hasMore.value = true
  await fetchPosts(1, true)
}

async function loadMorePosts() {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  await fetchPosts(currentPage.value + 1)
}

async function likePost(post: Post, event?: MouseEvent) {
  if (!isLoggedIn.value) {
    toastError('请先登录')
    return
  }

  const index = feedList.value.findIndex(p => p.id === post.id)
  if (index === -1) return

  const originalLiked = post.is_liked
  const originalCount = post.like_count

  // 乐观更新
  feedList.value[index].is_liked = !originalLiked
  feedList.value[index].like_count = originalCount + (!originalLiked ? 1 : -1)

  try {
    const response = await postsApi.likePost(post.id)
    feedList.value[index].is_liked = response.liked
    feedList.value[index].like_count = response.like_count
  } catch (err) {
    // 回滚
    feedList.value[index].is_liked = originalLiked
    feedList.value[index].like_count = originalCount
    toastError('操作失败')
  }
}

async function showComments(post: Post) {
  currentPost.value = post
  showCommentModal.value = true
  commentText.value = ''
  comments.value = []
  await loadComments(post.id)
}

function hideComments() {
  showCommentModal.value = false
  currentPost.value = null
  comments.value = []
  commentText.value = ''
}

async function loadComments(postId: string) {
  commentLoading.value = true
  try {
    const response = await postsApi.getComments(postId, { limit: 50 })
    comments.value = response.items
  } catch (err) {
    toastError('加载评论失败')
  } finally {
    commentLoading.value = false
  }
}

async function submitComment() {
  if (!commentText.value.trim() || !isLoggedIn.value || !currentPost.value) return

  if (!isLoggedIn.value) {
    toastError('请先登录')
    return
  }

  try {
    const newComment = await postsApi.createComment(currentPost.value.id, {
      content: commentText.value.trim()
    })

    comments.value = [newComment, ...comments.value]

    const postIndex = feedList.value.findIndex(p => p.id === currentPost.value!.id)
    if (postIndex !== -1) {
      feedList.value[postIndex].comment_count = (feedList.value[postIndex].comment_count || 0) + 1
    }

    commentText.value = ''
    toastSuccess('评论成功')
  } catch (err) {
    toastError('评论失败')
  }
}

function formatTime(timestamp: number | string): string {
  const now = Date.now()
  const date = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const diff = now - date

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前'
  } else {
    return Math.floor(diff / month) + '个月前'
  }
}

function chooseLocation() {
  toastInfo('选择位置功能开发中')
}

function goToSearch() {
  toastInfo('搜索功能开发中')
}

function handleQuickAction(action: any) {
  switchTab(action.path)
}

function goToActivityDetail(id: string) {
  toastInfo('活动详情开发中')
}

function goToActivities() {
  switchTab('/pages/neighborhood/index')
}

function sharePost(post: Post) {
  if (navigator.share) {
    navigator.share({
      title: '邻里社区',
      text: post.content,
      url: window.location.href
    }).catch(console.error)
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toastSuccess('链接已复制到剪贴板')
    }).catch(() => {
      toastInfo('分享功能开发中')
    })
  }
}

function previewImage(images: string[], index: number) {
  toastInfo('预览图片功能开发中')
}

function goToCreate() {
  navigateTo('/pages/post/create')
}

function startBannerAutoPlay() {
  stopBannerAutoPlay()
  bannerTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.value.length
  }, 4000)
}

function stopBannerAutoPlay() {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

onMounted(() => {
  initAuth()
  statusBarHeight.value = 20
  loading.value = true
  fetchPosts(1, true)
  startBannerAutoPlay()
})

onUnmounted(() => {
  stopBannerAutoPlay()
})
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
  background: linear-gradient(135deg, #0066CC, #0052A3);
  padding-bottom: 12px;
}

.status-content {
  padding: 0 var(--spacing-lg);
}

.location {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.location-icon {
  font-size: 14px;
}

.location-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
}

.location-arrow {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  margin-left: 4px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
}

.search-icon {
  font-size: 14px;
  margin-right: 8px;
}

.search-placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* 下拉刷新指示器 */
.refresh-indicator {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99;
  display: flex;
  justify-content: center;
  padding: 12px 0;
  animation: pullDown 0.3s ease-out;
}

@keyframes pullDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.refresh-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
}

.loading-spinner.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.content {
  min-height: 100vh;
  overflow-y: auto;
}

.banner-section {
  padding: var(--spacing-lg);
}

.banner-swiper {
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  position: relative;
}

.banner-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  transition: transform 0.4s ease;
}

.banner-content {
  display: flex;
  flex-direction: column;
}

.banner-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.banner-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

/* 轮播指示器 */
.banner-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.banner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
  cursor: pointer;
}

.banner-dot.active {
  width: 18px;
  border-radius: 3px;
  background: white;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-lg);
  background: var(--card-bg);
  margin: 0 var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.quick-item:active {
  transform: scale(0.95);
}

.quick-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.quick-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.section {
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-more {
  font-size: 14px;
  color: #0066CC;
  cursor: pointer;
}

.activity-scroll {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.activity-scroll::-webkit-scrollbar {
  display: none;
}

.activity-card {
  display: inline-block;
  width: 150px;
  margin-right: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform 0.2s;
}

.activity-card:active {
  transform: scale(0.97);
}

.activity-cover {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-emoji {
  font-size: 40px;
}

.activity-info {
  padding: var(--spacing-md);
}

.activity-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
}

.activity-time {
  font-size: 11px;
  color: var(--text-muted);
}

.activity-join {
  font-size: 11px;
  color: #0066CC;
  font-weight: 500;
}

/* 骨架屏加载 */
.skeleton-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.skeleton-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-right: var(--spacing-md);
}

.skeleton-lines {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 40%;
}

.skeleton-line.medium {
  width: 60%;
}

.skeleton-line.tiny {
  width: 30%;
  height: 10px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feed-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.feed-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  background: #f0f0f0;
  object-fit: cover;
}

.feed-user-info {
  flex: 1;
}

.feed-username {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.feed-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.feed-time {
  font-size: 12px;
  color: var(--text-muted);
}

.feed-location {
  font-size: 12px;
  color: var(--text-muted);
}

.feed-content {
  margin-bottom: var(--spacing-md);
}

.feed-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
}

.feed-images {
  display: grid;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.feed-images.images-1 {
  grid-template-columns: 1fr;
}

.feed-images.images-1 .feed-image {
  max-height: 300px;
}

.feed-images.images-2,
.feed-images.images-4 {
  grid-template-columns: repeat(2, 1fr);
}

.feed-images.images-3,
.feed-images.images-5,
.feed-images.images-6,
.feed-images.images-7,
.feed-images.images-8,
.feed-images.images-9 {
  grid-template-columns: repeat(3, 1fr);
}

.feed-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: #f0f0f0;
  object-fit: cover;
  cursor: pointer;
}

.feed-actions {
  display: flex;
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.feed-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 0;
  cursor: pointer;
  transition: transform 0.15s;
}

.feed-action:active {
  transform: scale(0.95);
}

.feed-action.liked .action-icon {
  color: #E63946;
}

.action-icon {
  font-size: 18px;
  transition: transform 0.3s;
}

.action-icon.heart-beat {
  animation: heartBeat 0.4s ease;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.action-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) 0;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: #0066CC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
}

.error-icon {
  font-size: 40px;
  margin-bottom: var(--spacing-md);
}

.error-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.retry-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: #0066CC;
  color: white;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.load-more,
.no-more {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-muted);
  font-size: 14px;
}

.load-more span {
  cursor: pointer;
  color: #0066CC;
  font-weight: 500;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.comment-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.comment-panel {
  background: var(--card-bg);
  width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.comment-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-close {
  font-size: 20px;
  color: var(--text-muted);
  padding: 4px;
  cursor: pointer;
}

.comment-list {
  flex: 1;
  padding: var(--spacing-lg);
  max-height: 40vh;
  overflow-y: auto;
}

.comment-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.comment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xxl) 0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
}

.comment-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  display: block;
  margin-bottom: 4px;
}

.comment-time {
  font-size: 12px;
  color: var(--text-muted);
}

.comment-input-wrapper {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  padding-bottom: calc(var(--spacing-lg) + constant(safe-area-inset-bottom));
  padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom));
}

.comment-input {
  flex: 1;
  background: var(--bg-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 14px;
  border: none;
  outline: none;
}

.comment-submit {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: #0066CC;
  color: white;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-submit:active {
  transform: scale(0.95);
}

.comment-submit.disabled {
  background: #B0C4DE;
  cursor: not-allowed;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fab-btn {
  position: fixed;
  right: var(--spacing-lg);
  bottom: 90px;
  z-index: 99;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF8C42, #FF7733);
  color: white;
  border-radius: 28px;
  box-shadow: 0 4px 16px rgba(255, 140, 66, 0.4);
  transition: all 0.2s;
  cursor: pointer;
}

.fab-btn:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 18px;
}

.fab-text {
  font-size: 15px;
  font-weight: 600;
}
</style>