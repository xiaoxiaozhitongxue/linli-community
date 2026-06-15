<template>
  <div class="page">
    <div class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="status-content">
        <div class="location" @click="chooseLocation">
          <span class="location-icon">{{ locating ? '⏳' : '📍' }}</span>
          <span class="location-text">{{ locating ? '定位中...' : communityName }}</span>
          <span class="location-arrow">▼</span>
        </div>
        <div class="search-bar" @click="goToSearch">
          <span class="search-icon">🔍</span>
          <span class="search-placeholder">搜索邻里、活动...</span>
        </div>
      </div>
    </div>

    <div v-if="showRefreshIndicator" class="refresh-indicator" :style="{ top: (statusBarHeight + 60) + 'px' }">
      <div class="refresh-content">
        <div class="loading-spinner" :class="{ spinning: refreshing }"></div>
        <span>{{ refreshing ? '正在刷新...' : '下拉刷新' }}</span>
      </div>
    </div>

    <div class="content" :style="{ paddingTop: (statusBarHeight + 60) + 'px' }" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="page-wrapper">
        <div class="banner-section">
          <div class="banner-swiper" @touchstart="onBannerTouchStart" @touchmove="onBannerTouchMove" @touchend="onBannerTouchEnd">
            <div class="banner-item" v-for="(banner, index) in banners" :key="index" :class="{ active: currentBanner === index, prev: currentBanner === (index + 1) % banners.length, next: currentBanner === (index - 1 + banners.length) % banners.length }" :style="{ background: banner.bgColor, transform: getBannerTransform(index) }">
              <div class="banner-content">
                <span class="banner-title">{{ banner.title }}</span>
                <span class="banner-desc">{{ banner.desc }}</span>
              </div>
            </div>
            <div class="banner-dots">
              <div v-for="(banner, index) in banners" :key="index" class="banner-dot" :class="{ active: currentBanner === index }" @click.stop="goToBanner(index)"></div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <div
            class="quick-card"
            v-for="action in quickActions"
            :key="action.id"
            :class="'quick-' + action.id"
            @click="handleQuickAction(action)"
          >
            <div class="quick-card-inner">
              <div class="quick-card-head">
                <span class="quick-icon">{{ action.icon }}</span>
                <span class="quick-name">{{ action.name }}</span>
              </div>
              <div class="quick-card-foot">
                <span class="quick-hint">{{ action.id === 'health' ? healthBadge : action.hint }}</span>
                <span class="quick-badge" v-if="action.id === 'help' && helpBadge">{{ helpBadge }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-title">🔥 热门活动</span>
            <span class="section-more" @click="goToActivities">查看更多 ›</span>
          </div>
          <div class="activity-scroll">
            <div class="activity-card" v-for="activity in hotActivities" :key="activity.id" @click="goToActivityDetail(activity.id)">
              <div class="activity-cover" :style="{ background: getActivityCoverBg(activity.category) }">
                <span class="activity-emoji">{{ getActivityEmoji(activity.category) }}</span>
              </div>
              <div class="activity-info">
                <span class="activity-name">{{ activity.title }}</span>
                <div class="activity-meta">
                  <span class="activity-time">{{ formatShortTime(activity.start_time) }}</span>
                  <span class="activity-join">{{ activity.current_participants }}人参与</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-title">🎯 近期活动</span>
            <span class="section-more" @click="goToActivities">查看更多 ›</span>
          </div>
          <div class="recent-activity-scroll">
            <div class="recent-activity-card" v-for="activity in recentActivities" :key="activity.id" @click="goToActivityDetail(activity.id)">
              <div class="recent-activity-cover" :style="{ background: getActivityCoverBg(activity.category) }">
                <span class="recent-activity-icon">{{ getActivityEmoji(activity.category) }}</span>
                <div class="recent-activity-badge">即将开始</div>
              </div>
              <div class="recent-activity-content">
                <span class="recent-activity-name">{{ activity.title }}</span>
                <div class="recent-activity-info">
                  <div class="recent-activity-info-item">
                    <span class="info-icon">📅</span>
                    <span class="info-text">{{ formatFullDate(activity.start_time) }}</span>
                  </div>
                </div>
                <div class="recent-activity-info">
                  <div class="recent-activity-info-item">
                    <span class="info-icon">📍</span>
                    <span class="info-text">{{ activity.location }}</span>
                  </div>
                </div>
                <div class="recent-activity-footer">
                  <div class="recent-activity-participants">
                    <span class="participant-icon">👥</span>
                    <span class="participant-count">{{ activity.current_participants }}人已报名</span>
                  </div>
                  <div class="recent-activity-join-btn">立即报名</div>
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
            <div class="feed-card animate-fadeIn" v-for="(post, index) in feedList" :key="post.id" :style="{ animationDelay: (index * 0.1) + 's' }">
              <div class="feed-header">
                <img class="feed-avatar" :src="post.user?.avatar || 'https://via.placeholder.com/40'" />
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
                  <img class="feed-image" v-for="(img, imgIndex) in post.images" :key="imgIndex" :src="img" @click="previewImage(post.images, imgIndex)" />
                </div>
              </div>

              <div class="feed-actions">
                <div class="feed-action" :class="{ liked: post.is_liked }" @click="likePost(post, $event)">
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
            <img class="comment-avatar" :src="comment.user?.avatar || 'https://via.placeholder.com/36'" />
            <div class="comment-content">
              <span class="comment-user">{{ comment.user?.nickname || '邻居' }}</span>
              <span class="comment-text">{{ comment.content }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="comment-input-wrapper">
          <input class="comment-input" v-model="commentText" placeholder="说点什么..." :disabled="!isLoggedIn" @keyup.enter="submitComment" />
          <div class="comment-submit" :class="{ disabled: !commentText.trim() || !isLoggedIn }" @click="submitComment">
            <span>发送</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showImagePreview" class="image-preview-mask" @click="closeImagePreview">
      <div class="image-preview-container" @click.stop>
        <div class="image-preview-close" @click="closeImagePreview">✕</div>
        <div class="image-preview-swiper" @touchstart="onImagePreviewTouchStart" @touchmove="onImagePreviewTouchMove" @touchend="onImagePreviewTouchEnd">
          <div class="image-preview-wrapper" :style="{ transform: 'translateX(' + (-currentPreviewIndex * 100) + '%)' }">
            <div v-for="(img, index) in previewImages" :key="index" class="image-preview-item">
              <img :src="img" class="image-preview-img" />
            </div>
          </div>
        </div>
        <div class="image-preview-counter">{{ currentPreviewIndex + 1 }} / {{ previewImages.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { postsApi, activitiesApi, tasksApi, type Post, type Comment, type Activity } from '../../utils/api'
import { useAuth } from '../../store'
import { toastSuccess, toastError, toastInfo } from '../../utils/toast'
import { navigateTo, switchTab } from '../../utils/router'
import { showLoginGuide, setLoginRedirect } from '../../utils/auth'
import { loadHealthRecords } from '../../utils/storage'
import { getLocation, pickDisplayCommunity } from '../../utils/location'
import type { LocationResult } from '../../utils/location'

const { initAuth, isLoggedIn, user } = useAuth()

const statusBarHeight = ref(20)
const communityName = ref('点击定位')
const locating = ref(false)
const locationResult = ref<LocationResult | null>(null)
let lastAutoLocateAt = 0          // 上次自动定位的时间戳（用于去抖）
let hardResetTimer: any = null    // 组件级硬重置（20s 还没完成则强制恢复）
let pageHiddenAt = 0              // visibilitychange 时记住页面什么时候隐藏的

async function chooseLocation(opts: { auto?: boolean } = {}) {
  // 1) 已经在定位中：直接 skip（防止重复触发）
  if (locating.value) return

  // 2) 自动定位的 60 秒去抖
  const now = Date.now()
  if (opts.auto && now - lastAutoLocateAt < 60 * 1000) {
    return
  }
  lastAutoLocateAt = now

  locating.value = true

  // 3) 组件级 20 秒硬重置：
  //    如果底层任何一个 Promise 都永远不 resolve，这里兜底强制把 locating 复位，
  //    并保留当前的 communityName（不回退成"点击定位"）
  if (hardResetTimer) clearTimeout(hardResetTimer)
  hardResetTimer = setTimeout(() => {
    console.warn('[index] 定位超过 20 秒仍未返回 — 已强制复位')
    if (locating.value) {
      locating.value = false
      // 没有定位到新地址的情况下：如果之前有地址就保留，否则显示"点击定位"
      if (!communityName.value || communityName.value === '点击定位') {
        communityName.value = '点击定位'
      }
      toastInfo('定位超时，稍后点击地址栏重试')
    }
  }, 20000)

  try {
    const result = await getLocation({ forceRefresh: true })
    locationResult.value = result
    // 展示策略：优先展示真实城市·区域；注册社区仅在拿不到地理编码时作为兜底
    const display = pickDisplayCommunity(result, user.value?.community)
    communityName.value = display
    const place = (result.city && result.district)
      ? `${result.city} ${result.district}`
      : (result.address || display)
    toastSuccess(`已定位到 ${place}`)
    console.log('[index] chooseLocation 完成, result =', result, 'display =', display)
  } catch (err: any) {
    // 失败不覆盖已有的社区名 — 用户可能之前已经定位成功过
    const msg = err?.message || '定位失败，请稍后重试'
    console.warn('[index] 定位失败:', err)
    if (!opts.auto) toastInfo(msg)
  } finally {
    locating.value = false
    if (hardResetTimer) {
      clearTimeout(hardResetTimer)
      hardResetTimer = null
    }
  }
}
const refreshing = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const hasMore = ref(true)
const currentPage = ref(1)
const currentBanner = ref(0)
let bannerTimer: any = null
const showRefreshIndicator = ref(false)

let touchStartY = 0
let touchMoveY = 0
let pullDistance = 0

let bannerTouchStartX = 0
let bannerTouchMoveX = 0

const showImagePreview = ref(false)
const previewImages = ref<string[]>([])
const currentPreviewIndex = ref(0)
let imagePreviewTouchStartX = 0
let imagePreviewTouchMoveX = 0

const banners = ref([
  { title: '周末邻里集市', desc: '欢迎来摆摊、淘宝、串门', bgColor: 'linear-gradient(135deg, #FF8C42, #FFB380)' },
  { title: '老人关怀计划', desc: '志愿者招募中，邀请您加入', bgColor: 'linear-gradient(135deg, #4CAF50, #81C784)' },
  { title: '社区创业沙龙', desc: '把兴趣变成生意，邻居先成为客户', bgColor: 'linear-gradient(135deg, #2196F3, #64B5F6)' }
])

const quickActions = ref([
  { id: 'health', name: '健康打卡', icon: '❤️', path: '/pages/health/index', hint: '记录每日状态', badge: '未打卡' },
  { id: 'help', name: '邻里互助', icon: '🤝', path: '/pages/ai-helper/index', hint: '发布/接单', badge: '' }
])

const healthBadge = ref('未打卡')
const helpBadge = ref('')
async function loadQuickBadges() {
  // 健康打卡状态 - 使用统一存储层
  try {
    const records: any[] = loadHealthRecords() || []
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const hasChecked = records.some((r: any) => r.date === todayStr)
    healthBadge.value = hasChecked ? '已打卡' : '去打卡'
  } catch (e) {
    healthBadge.value = '去打卡'
  }

  // 互助任务数量 - 使用统一 API 层
  try {
    const res: any = await tasksApi.getTasks()
    const items: any[] = (res && res.items) || (Array.isArray(res) ? (res as any) : [])
    const pendingCount = items.filter((t: any) => {
      const s = (t.status || '').toLowerCase()
      return s === 'open' || s === 'pending'
    }).length
    helpBadge.value = pendingCount > 0 ? `${pendingCount}单待接` : ''
  } catch (e) {
    helpBadge.value = ''
  }
}

const activities = ref<Activity[]>([])
const hotActivities = ref<Activity[]>([])
const recentActivities = ref<Activity[]>([])

const feedList = ref<Post[]>([])

const showCommentModal = ref(false)
const currentPost = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const commentText = ref('')
const commentLoading = ref(false)

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
      currentBanner.value = (currentBanner.value + 1) % banners.value.length
    } else {
      currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
    }
  }
  startBannerAutoPlay()
}

function onTouchStart(e: TouchEvent) {
  touchStartY = e.touches[0].clientY
  touchMoveY = touchStartY
}

function onTouchMove(e: TouchEvent) {
  touchMoveY = e.touches[0].clientY
  pullDistance = touchMoveY - touchStartY

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

async function fetchActivities() {
  try {
    const response = await activitiesApi.getActivities({ limit: 20 })
    activities.value = response.items
    
    hotActivities.value = [...activities.value]
      .sort((a, b) => b.current_participants - a.current_participants)
      .slice(0, 4)
    
    recentActivities.value = [...activities.value]
      .sort((a, b) => a.start_time - b.start_time)
      .slice(0, 3)
  } catch (err) {
    console.error('获取活动失败:', err)
  }
}

async function onRefresh() {
  refreshing.value = true
  showRefreshIndicator.value = true
  currentPage.value = 1
  hasMore.value = true
  await Promise.all([fetchPosts(1, true), fetchActivities()])
}

async function loadMorePosts() {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  await fetchPosts(currentPage.value + 1)
}

async function likePost(post: Post, event?: MouseEvent) {
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }

  const index = feedList.value.findIndex(p => p.id === post.id)
  if (index === -1) return

  const originalLiked = post.is_liked
  const originalCount = post.like_count

  feedList.value[index].is_liked = !originalLiked
  feedList.value[index].like_count = originalCount + (!originalLiked ? 1 : -1)

  try {
    const response = await postsApi.likePost(post.id)
    feedList.value[index].is_liked = response.liked
    feedList.value[index].like_count = response.like_count
  } catch (err) {
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
  if (!commentText.value.trim() || !currentPost.value) return

  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
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

function formatShortTime(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else if (days === 1) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `明天 ${hours}:${minutes}`
  } else if (days > 0 && days < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${weekdays[date.getDay()]} ${hours}:${minutes}`
  } else {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}月${day}日`
  }
}

function formatFullDate(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}`
}

function getActivityEmoji(category: string) {
  const map: Record<string, string> = {
    sports: '⚽',
    culture: '🎨',
    charity: '💝',
    party: '🎉',
    other: '📌'
  }
  return map[category] || '📌'
}

function getActivityCoverBg(category: string) {
  const map: Record<string, string> = {
    sports: '#C8E6C9',
    culture: '#F3E5F5',
    charity: '#E8F5E9',
    party: '#FFE0B2',
    other: '#E3F2FD'
  }
  return map[category] || '#F5F5F0'
}

function goToSearch() {
  navigateTo('/pages/search/index')
}

function handleQuickAction(action: any) {
  if (action.path === '/pages/health/index') {
    navigateTo(action.path)
  } else {
    switchTab(action.path)
  }
}

function goToActivityDetail(id: string) {
  navigateTo(`/pages/activities/detail?id=${id}`)
}

function goToActivities() {
  navigateTo('/pages/activities/index')
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
  previewImages.value = images
  currentPreviewIndex.value = index
  showImagePreview.value = true
  document.body.style.overflow = 'hidden'
}

function closeImagePreview() {
  showImagePreview.value = false
  document.body.style.overflow = ''
}

function onImagePreviewTouchStart(e: TouchEvent) {
  imagePreviewTouchStartX = e.touches[0].clientX
}

function onImagePreviewTouchMove(e: TouchEvent) {
  imagePreviewTouchMoveX = e.touches[0].clientX
}

function onImagePreviewTouchEnd() {
  const diff = imagePreviewTouchStartX - imagePreviewTouchMoveX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      if (currentPreviewIndex.value < previewImages.value.length - 1) {
        currentPreviewIndex.value++
      }
    } else {
      if (currentPreviewIndex.value > 0) {
        currentPreviewIndex.value--
      }
    }
  }
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
  Promise.all([fetchPosts(1, true), fetchActivities(), loadQuickBadges()])
  startBannerAutoPlay()

  // 每次进入首页自动定位一次（稍延迟，等首屏资源加载完毕后再触发）
  const runAutoLocate = () => {
    chooseLocation({ auto: true }).catch((err) => {
      console.warn('[index] 自动定位出错（非阻塞错误）:', err)
    })
  }
  const autoTimer = setTimeout(runAutoLocate, 600)

  // visibilitychange：页面从不可见切回可见时定位
  // — 只有页面隐藏超过 30 秒才重新定位
  // — 且遵守 60s 全局去抖
  // — 避免每次切回首页时触发新地址
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      pageHiddenAt = Date.now()
      return
    }
    if (document.visibilityState === 'visible') {
      if (pageHiddenAt > 0 && (Date.now() - pageHiddenAt > 30 * 1000)) {
        setTimeout(runAutoLocate, 300)
      }
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  // 记录清理标记
  ;(window as any).__indexCleanup = () => {
    clearTimeout(autoTimer)
    document.removeEventListener('visibilitychange', onVisibility)
    if (hardResetTimer) {
      clearTimeout(hardResetTimer)
      hardResetTimer = null
    }
  }
})

onUnmounted(() => {
  stopBannerAutoPlay()
  if (showImagePreview.value) {
    document.body.style.overflow = ''
  }
  if (typeof (window as any).__indexCleanup === 'function') {
    ;(window as any).__indexCleanup()
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: var(--color-primary-gradient);
  padding-bottom: 12px;
}

.status-content {
  padding: 0 var(--spacing-lg);
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.location {
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 44px;
}

.location-icon {
  font-size: 14px;
}

.location-text {
  color: var(--color-text-white);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
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
  border-radius: var(--radius-full);
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  min-height: var(--touch-min-size);
}

.search-bar:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.2);
}

.search-icon {
  font-size: 14px;
  margin-right: 8px;
}

.search-placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.refresh-indicator {
  position: fixed;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
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
  color: var(--color-text-white);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--color-text-white);
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
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.page-wrapper {
  max-width: 100%;
  margin: 0 auto;
}

.banner-section {
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.banner-swiper {
  height: 140px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.banner-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 140px;
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  transition: transform 0.4s var(--transition-spring);
}

.banner-content {
  display: flex;
  flex-direction: column;
}

.banner-title {
  color: var(--color-text-white);
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.banner-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

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
  transition: all 0.3s var(--transition-smooth);
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-dot::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s var(--transition-smooth);
}

.banner-dot.active::after {
  width: 18px;
  border-radius: var(--radius-full);
  background: var(--color-text-white);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.quick-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  min-height: 96px;
  display: flex;
  align-items: center;
}

.quick-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-md);
}

.quick-health {
  background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%);
}

.quick-help {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%);
}

.quick-card-inner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
}

.quick-card-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.quick-icon {
  font-size: 22px;
  line-height: 1;
}

.quick-name {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.quick-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quick-hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.quick-badge {
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.section {
  padding: var(--spacing-xl) var(--spacing-lg);
  padding-left: 0;
  padding-right: 0;
}

.section:first-of-type {
  padding-top: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
  box-sizing: content-box;
}

.section-title {
  font-size: 17px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.section-more {
  font-size: 14px;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
  min-height: 44px;
  display: flex;
  align-items: center;
}

.section-more:hover {
  color: var(--color-primary-dark);
}

.activity-scroll {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

.activity-scroll::-webkit-scrollbar {
  display: none;
}

.activity-card {
  display: inline-block;
  width: 160px;
  margin-right: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  scroll-snap-align: start;
  flex-shrink: 0;
}

.activity-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
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
  transition: transform var(--transition-spring);
}

.activity-card:hover .activity-emoji {
  transform: scale(1.15);
}

.activity-info {
  padding: var(--spacing-md);
}

.activity-name {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 4px;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
}

.activity-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.activity-join {
  font-size: 11px;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.recent-activity-scroll {
  display: flex;
  gap: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-md);
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

.recent-activity-scroll::-webkit-scrollbar {
  display: none;
}

.recent-activity-card {
  flex-shrink: 0;
  width: 220px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  scroll-snap-align: start;
}

.recent-activity-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.recent-activity-card:active {
  transform: scale(0.97);
}

.recent-activity-cover {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-activity-icon {
  font-size: 48px;
  transition: transform var(--transition-spring);
}

.recent-activity-card:hover .recent-activity-icon {
  transform: scale(1.12);
}

.recent-activity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-error);
  color: var(--color-text-white);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.recent-activity-content {
  padding: var(--spacing-md);
}

.recent-activity-name {
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.recent-activity-info {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.recent-activity-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-icon {
  font-size: 12px;
}

.info-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.recent-activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
}

.recent-activity-participants {
  display: flex;
  align-items: center;
  gap: 4px;
}

.participant-icon {
  font-size: 14px;
}

.participant-count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.recent-activity-join-btn {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  transition: transform 0.15s, box-shadow var(--transition-fast);
  box-shadow: var(--shadow-sm);
  min-height: 32px;
  display: flex;
  align-items: center;
}

.recent-activity-join-btn:active {
  transform: scale(0.95);
  box-shadow: none;
}

.skeleton-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.skeleton-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.skeleton-lines {
  flex: 1;
}

.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.skeleton-line.short {
  width: 45%;
  height: 12px;
}

.skeleton-line.medium {
  width: 70%;
  height: 16px;
}

.skeleton-line.tiny {
  width: 25%;
  height: 10px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
  box-sizing: border-box;
}

.feed-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.feed-card:hover {
  box-shadow: var(--shadow-md);
}

.feed-card:active {
  transform: scale(0.995);
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.feed-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  background: var(--color-bg-tertiary);
  object-fit: cover;
}

.feed-user-info {
  flex: 1;
}

.feed-username {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
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
  color: var(--color-text-tertiary);
}

.feed-location {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.feed-content {
  margin-bottom: var(--spacing-md);
}

.feed-text {
  font-size: 15px;
  color: var(--color-text-primary);
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
  background: var(--color-bg-tertiary);
  object-fit: cover;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.feed-image:hover {
  transform: scale(1.02);
}

.feed-actions {
  display: flex;
  border-top: 1px solid var(--color-border-light);
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
  transition: transform 0.15s, background-color var(--transition-fast);
  border-radius: var(--radius-md);
  min-height: var(--touch-min-size);
}

.feed-action:hover {
  background-color: var(--color-primary-soft);
}

.feed-action:active {
  transform: scale(0.95);
}

.feed-action.liked .action-icon {
  color: var(--color-error);
}

.action-icon {
  font-size: 18px;
  transition: transform 0.3s var(--transition-spring);
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
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-primary-soft);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--spacing-md);
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.error-icon {
  font-size: 40px;
  margin-bottom: var(--spacing-md);
}

.error-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.retry-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: var(--shadow-sm);
  min-height: var(--touch-min-size);
  display: flex;
  align-items: center;
}

.retry-btn:active {
  transform: scale(0.98);
  box-shadow: none;
}

.load-more,
.no-more {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
}

.load-more span {
  cursor: pointer;
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.load-more span:hover {
  color: var(--color-primary-dark);
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
  background: var(--color-bg-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-end;
}

.comment-panel {
  background: var(--color-bg-secondary);
  width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.comment-title {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.comment-close {
  font-size: 20px;
  color: var(--color-text-muted);
  padding: 4px;
  cursor: pointer;
  transition: color var(--transition-fast);
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-close:hover {
  color: var(--color-text-secondary);
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
  padding: var(--spacing-2xl) 0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-muted);
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
  background: var(--color-bg-tertiary);
  flex-shrink: 0;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
  display: block;
  margin-bottom: 4px;
}

.comment-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.comment-input-wrapper {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom));
}

.comment-input {
  flex: 1;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 15px;
  border: none;
  outline: none;
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast);
  min-height: var(--touch-min-size);
}

.comment-input:focus {
  background: var(--color-primary-soft);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.comment-submit {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-xl);
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  min-height: var(--touch-min-size);
}

.comment-submit:active {
  transform: scale(0.95);
  box-shadow: none;
}

.comment-submit.disabled {
  background: var(--color-border-light);
  cursor: not-allowed;
}

.animate-fadeIn {
  animation: slideUp var(--transition-smooth) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-preview-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-preview-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: background-color 0.3s;
}

.image-preview-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.image-preview-swiper {
  width: 100%;
  height: 80vh;
  overflow: hidden;
}

.image-preview-wrapper {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
}

.image-preview-item {
  min-width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.image-preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.image-preview-counter {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
}

/* ========================================
   响应式优化
   ======================================== */
@media (min-width: 500px) {
  .page-wrapper {
    max-width: 500px;
  }
  
  .status-content {
    max-width: 500px;
  }
}

@media (min-width: 768px) {
  .page-wrapper {
    max-width: 600px;
  }
  
  .status-content {
    max-width: 600px;
  }
  
  .banner-section {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
  
  .banner-swiper {
    height: 160px;
    border-radius: var(--radius-xl);
  }
  
  .banner-item {
    height: 160px;
    padding: var(--spacing-2xl);
  }
  
  .banner-title {
    font-size: 22px;
  }
  
  .banner-desc {
    font-size: 15px;
  }
  
  .quick-actions {
    max-width: 600px;
    margin: 0 auto var(--spacing-xl);
  }

  .quick-card {
    min-height: 108px;
    padding: var(--spacing-xl);
  }

  .quick-name {
    font-size: 16px;
  }

  .quick-icon {
    font-size: 26px;
  }

  .section-header {
    padding: 0;
  }
  
  .activity-scroll {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
    overflow-x: visible;
    padding-left: 0;
    padding-right: 0;
  }
  
  .activity-card {
    width: 100% !important;
    margin-right: 0 !important;
  }
  
  .activity-cover {
    height: 100px;
  }
  
  .activity-emoji {
    font-size: 44px;
  }
  
  .recent-activity-scroll {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
    overflow-x: visible;
    padding-left: 0;
    padding-right: 0;
  }
  
  .recent-activity-card {
    width: 100%;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .feed-list {
    padding: 0;
  }
  
  .feed-card {
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
  }
  
  .feed-avatar {
    width: 48px;
    height: 48px;
  }
}

@media (min-width: 1024px) {
  .page-wrapper {
    max-width: 900px;
  }
  
  .status-content {
    max-width: 900px;
  }
  
  .status-bar {
    left: var(--nav-sidebar-width, 220px);
  }
  
  .banner-section {
    padding: var(--spacing-xl);
  }
  
  .banner-swiper {
    height: 180px;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
    max-width: 900px;
    margin: 0 auto var(--spacing-xl);
  }
  
  .activity-scroll {
    grid-template-columns: repeat(4, 1fr);
    max-width: 900px;
    margin: 0 auto;
  }
  
  .recent-activity-scroll {
    grid-template-columns: repeat(3, 1fr);
    max-width: 900px;
    margin: 0 auto;
  }
  
  .section-header {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .feed-list {
    max-width: 900px;
    margin: 0 auto;
    padding: 0;
  }
  
  .feed-card {
    padding: var(--spacing-2xl);
  }
}

@media (min-width: 1440px) {
  .page-wrapper {
    max-width: 1000px;
  }
  
  .status-content {
    max-width: 1000px;
  }
  
  .banner-swiper {
    max-width: 1000px;
    height: 200px;
  }
  
  .quick-actions {
    max-width: 1000px;
    margin: 0 auto var(--spacing-xl);
  }
  
  .section-header {
    max-width: 1000px;
  }
  
  .activity-scroll {
    max-width: 1000px;
  }
  
  .recent-activity-scroll {
    max-width: 1000px;
  }
  
  .feed-list {
    max-width: 1000px;
    padding: 0;
  }
}
</style>
