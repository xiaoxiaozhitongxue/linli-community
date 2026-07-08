<template>
  <div class="page">
    <div class="home-header">
      <NavBar :showBack="false">
        <div class="status-content">
          <div class="location">
            <AppIcon class="location-icon" :name="locating ? 'activity' : 'map-pin'" :size="16" />
            <span class="location-text" :class="{ locating }">{{ locating ? '定位中' : cityDistrict }}</span>
          </div>
          <div class="search-bar" @click="goToSearch">
            <AppIcon class="search-icon" name="search" :size="16" />
            <span class="search-placeholder">搜索邻里、活动...</span>
          </div>
        </div>
      </NavBar>
    </div>

    <div v-if="showRefreshIndicator" class="refresh-indicator">
      <div class="refresh-content">
        <div class="loading-spinner" :class="{ spinning: refreshing }"></div>
        <span>{{ refreshing ? '正在刷新...' : '下拉刷新' }}</span>
      </div>
    </div>

    <div class="content" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="page-wrapper">
        <div class="banner-section">
          <div class="banner-swiper" @touchstart="onBannerTouchStart" @touchmove="onBannerTouchMove" @touchend="onBannerTouchEnd">
            <div class="banner-item" v-for="(banner, index) in banners" :key="index" :class="{ active: currentBanner === index, prev: currentBanner === (index + 1) % banners.length, next: currentBanner === (index - 1 + banners.length) % banners.length }" :style="{ background: banner.bgColor, transform: getBannerTransform(index) }">
              <div class="banner-content">
                <span class="banner-title">{{ banner.title }}</span>
                <span class="banner-desc">{{ banner.desc }}</span>
              </div>
              <div class="banner-deco">
                <AppIcon :name="banner.icon" :size="48" color="rgba(255,255,255,0.2)" />
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
                <AppIcon class="quick-icon" :name="action.icon" :size="24" />
                <span class="quick-name">{{ action.name }}</span>
              </div>
              <div class="quick-card-foot">
                <span class="quick-hint">{{ action.id === 'health' ? healthBadge : action.hint }}</span>
                <span class="quick-badge" v-if="action.id === 'help' && helpBadge">{{ helpBadge }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 统一 feed 筛选栏 · 小红书胶囊风格 -->
        <div class="feed-filter-bar">
          <div
            class="feed-filter-btn"
            :class="{ active: feedFilter === 'all' }"
            @click="feedFilter = 'all'"
          >全部</div>
          <div
            class="feed-filter-btn"
            :class="{ active: feedFilter === 'activity' }"
            @click="feedFilter = 'activity'"
          >活动</div>
          <div
            class="feed-filter-btn"
            :class="{ active: feedFilter === 'post' }"
            @click="feedFilter = 'post'"
          >动态</div>
        </div>

        <!-- 统一 feed 列表 -->
        <div class="section">
          <SkeletonLoader v-if="loading && unifiedFeed.length === 0" type="list" :count="3" />

          <ErrorBoundary v-else-if="error && unifiedFeed.length === 0" :message="error" @retry="handleRefresh" />

          <EmptyState v-else-if="!loading && unifiedFeed.length === 0" icon="book-open" title="暂无动态" description="社区还没有动态，快来发第一条吧" />

          <div v-else class="feed-list">
            <template v-for="(item, index) in unifiedFeed" :key="item.id + '-' + item._type">
              <!-- 活动卡片（小红书风格） -->
              <div
                v-if="item._type === 'activity'"
                class="feed-card activity-feed-card animate-fadeIn"
                :style="{ animationDelay: (index * 0.05) + 's' }"
                @click="goToActivityDetail(item._raw.id)"
              >
                <div class="activity-feed-deco" :style="{ background: getActivityGradient(item._raw.category) }"></div>
                <div class="activity-feed-row">
                  <div class="activity-feed-icon" :style="{ background: getActivityCoverBg(item._raw.category) }">
                    <AppIcon :name="getActivityIcon(item._raw.category)" :size="22" :color="getActivityIconColor(item._raw.category)" />
                  </div>
                  <div class="activity-feed-body">
                    <div class="activity-feed-top">
                      <span class="feed-type-badge type-activity">活动</span>
                      <span class="activity-feed-title">{{ item.title }}</span>
                    </div>
                    <div class="activity-feed-meta">
                      <span>{{ formatShortTime(item._raw.start_time) }}</span>
                      <span class="meta-dot">·</span>
                      <span>{{ item._raw.current_participants }}人关注</span>
                      <span v-if="item._raw.location" class="meta-dot">·</span>
                      <span v-if="item._raw.location">{{ item._raw.location }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 动态卡片 · 小红书双列风格 -->
              <div
                v-else
                class="feed-card post-feed-card animate-fadeIn"
                :class="{ 'no-image': !item._raw.images || item._raw.images.length === 0 }"
                :style="{ animationDelay: (index * 0.05) + 's' }"
                @click="goToPostDetail(item._raw)"
              >
                <!-- 封面图（有图时） -->
                <div v-if="item._raw.images && item._raw.images.length > 0" class="post-cover" @click.stop="previewImage(item._raw.images, 0)">
                  <img class="post-cover-img" :src="item._raw.images[0]" />
                  <span v-if="item._raw.images.length > 1" class="post-cover-count">
                    <AppIcon name="image" :size="10" /> {{ item._raw.images.length }}
                  </span>
                </div>
                <div v-else class="post-cover post-cover-placeholder">
                  <AppIcon name="file-text" :size="32" />
                </div>

                <!-- 文字内容 -->
                <div class="post-body">
                  <p class="post-title">{{ item._raw.content }}</p>

                  <!-- 底部：作者+互动 -->
                  <div class="post-footer">
                    <div class="post-author">
                      <img v-if="item._raw.user?.avatar" class="post-author-avatar" :src="item._raw.user.avatar" @error="onAvatarError" />
                      <div v-else class="post-author-avatar post-author-placeholder">{{ getInitial(item._raw.user?.nickname) }}</div>
                      <span class="post-author-name">{{ item._raw.user?.nickname || '邻居' }}</span>
                    </div>
                    <div class="post-like" :class="{ liked: item._raw.is_liked }" @click.stop="handleLikePost(item._raw)">
                      <AppIcon class="post-like-icon" :class="{ 'heart-beat': item._raw.is_liked }" name="heart" :size="12" :filled="item._raw.is_liked" />
                      <span>{{ item._raw.like_count || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-if="hasMore && posts.length > 0" class="load-more-wrapper">
            <span v-if="!loadingMore" class="load-more-btn" @click="handleLoadMore">加载更多</span>
            <div v-else class="loading-more">
              <div class="loading-spinner small"></div>
              <span>加载中...</span>
            </div>
          </div>

          <div v-if="!hasMore && posts.length > 0 && feedFilter !== 'activity'" class="no-more">
            <span class="no-more-text">— 没有更多了 —</span>
          </div>

          <div class="safe-area-bottom"></div>
        </div>
      </div>
    </div>

    <div v-if="showCommentModal" class="comment-mask" @click="hideComments">
      <div class="comment-panel" @click.stop>
        <div class="comment-header">
          <span class="comment-title">评论 ({{ currentPost?.comment_count || 0 }})</span>
          <span class="comment-close" @click="hideComments"><AppIcon name="close" :size="20" /></span>
        </div>

        <div class="comment-list">
          <div v-if="commentLoading && comments.length === 0" class="comment-loading">
            <div class="loading-spinner small"></div>
          </div>
          <EmptyState v-else-if="comments.length === 0" icon="message-circle" title="暂无评论" description="快来抢沙发吧！" />
          <div v-else class="comment-item" v-for="comment in comments" :key="comment.id">
            <img v-if="comment.user?.avatar" class="comment-avatar" :src="comment.user.avatar" @error="onAvatarError" />
            <div v-else class="comment-avatar comment-avatar-placeholder">{{ getInitial(comment.user?.nickname) }}</div>
            <div class="comment-content">
              <span class="comment-user">{{ comment.user?.nickname || '邻居' }}</span>
              <span class="comment-text">{{ comment.content }}</span>
              <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="comment-input-wrapper">
          <input class="comment-input" v-model="commentText" placeholder="说点什么..." :disabled="!isLoggedIn" @keyup.enter="handleSubmitComment" />
          <div class="comment-submit" :class="{ disabled: !commentText.trim() || !isLoggedIn }" @click="handleSubmitComment">
            <span>发送</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showImagePreview" class="image-preview-mask" @click="closeImagePreview">
      <div class="image-preview-container" @click.stop>
        <div class="image-preview-close" @click="closeImagePreview"><AppIcon name="close" :size="20" /></div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Post, Comment, Activity } from '../../types/models'
import { activityService } from '../../services/activityService'
import { taskService } from '../../services/taskService'
import { healthService } from '../../services/healthService'
import { useAuth } from '../../store'
import { toastSuccess, toastInfo } from '../../utils/toast'
import { navigateTo, switchTab } from '../../utils/router'
import { showLoginGuide, setLoginRedirect } from '../../utils/auth'
import { usePosts } from '../../composables/usePosts'
import { useLocation } from '../../composables/useLocation'
import { getLocation } from '../../utils/location'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorBoundary from '../../components/ErrorBoundary.vue'
import AppIcon from '../../components/AppIcon.vue'
import NavBar from '../../components/NavBar.vue'

const { initAuth, isLoggedIn, user } = useAuth()
const {
  posts,
  loading,
  error,
  hasMore,
  currentPage,
  fetchPosts,
  loadMorePosts,
  refreshPosts,
  likePost,
  submitComment,
  loadComments
} = usePosts()
const {
  communityName,
  locating,
  chooseLocation,
  locationResult,
  cityDistrict,
  startAutoLocate,
  cleanup: cleanupLocation
} = useLocation()

const statusBarHeight = ref(20)
let pageHiddenAt = 0

const refreshing = ref(false)
const loadingMore = ref(false)
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
  { title: '周末邻里集市', desc: '欢迎来摆摊、淘宝、串门', bgColor: 'linear-gradient(135deg, #FF8C42, #FFB380)', icon: 'activity' },
  { title: '老人关怀计划', desc: '志愿者招募中，邀请您加入', bgColor: 'linear-gradient(135deg, #4CAF50, #81C784)', icon: 'heart' },
  { title: '社区创业沙龙', desc: '把兴趣变成生意，邻居先成为客户', bgColor: 'linear-gradient(135deg, #2196F3, #64B5F6)', icon: 'star' }
])

const quickActions = ref([
  { id: 'health', name: '健康打卡', icon: 'heart', path: '/pages/health/index', hint: '记录每日状态', badge: '未打卡' },
  { id: 'help', name: '邻里互助', icon: 'handshake', path: '/pages/ai-helper/index', hint: '发布/接单', badge: '' }
])

const healthBadge = ref('未打卡')
const helpBadge = ref('')
async function loadQuickBadges() {
  try {
    if (isLoggedIn.value) {
      const res = await healthService.getRecords()
      const records = (res && res.items) || []
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const hasChecked = records.some((r: any) => r.date === todayStr)
      healthBadge.value = hasChecked ? '已打卡' : '去打卡'
    } else {
      healthBadge.value = '去打卡'
    }
  } catch (e) {
    healthBadge.value = '去打卡'
  }

  try {
    const res: any = await taskService.getTasks()
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

const feedFilter = ref<'all' | 'activity' | 'post'>('all')

const activities = ref<Activity[]>([])
const hotActivities = ref<Activity[]>([])
const recentActivities = ref<Activity[]>([])

/** 合并活动 + 动态的统一 feed */
const unifiedFeed = computed(() => {
  const items: Array<{
    id: string
    _type: 'activity' | 'post'
    _raw: any
    title: string
    sortTime: number
  }> = []

  // 添加活动项（用 hotActivities 作为活动数据源）
  if (feedFilter.value === 'all' || feedFilter.value === 'activity') {
    for (const act of hotActivities.value) {
      items.push({
        id: 'act-' + act.id,
        _type: 'activity',
        _raw: act,
        title: act.title,
        sortTime: -(act.current_participants * 100000 + (act.start_time || 0))
      })
    }
  }

  // 添加动态项
  if (feedFilter.value === 'all' || feedFilter.value === 'post') {
    for (const post of posts.value) {
      items.push({
        id: 'post-' + post.id,
        _type: 'post',
        _raw: post,
        title: post.content || '',
        sortTime: -(post.created_at || 0)
      })
    }
  }

  // 按时间倒序（活动按参与热度+时间综合排序）
  items.sort((a, b) => b.sortTime - a.sortTime)
  return items
})

async function fetchActivities() {
  try {
    const response = await activityService.getActivities({ limit: 20 })
    activities.value = response.items

    hotActivities.value = [...activities.value]
      .sort((a, b) => b.current_participants - a.current_participants)
      .slice(0, 4)

    recentActivities.value = [...activities.value]
      .sort((a, b) => a.start_time - b.start_time)
      .slice(0, 3)
  } catch (err) {
    // 静默处理
  }
}

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
    handleRefresh()
  }
  pullDistance = 0
  setTimeout(() => {
    if (!refreshing.value) {
      showRefreshIndicator.value = false
    }
  }, 300)
}

async function handleRefresh() {
  refreshing.value = true
  showRefreshIndicator.value = true
  await Promise.all([refreshPosts(), fetchActivities()])
  refreshing.value = false
  showRefreshIndicator.value = false
}

async function handleLoadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  await loadMorePosts()
  loadingMore.value = false
}

async function handleLikePost(post: Post) {
  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }
  await likePost(post)
}

async function showComments(post: Post) {
  currentPost.value = post
  showCommentModal.value = true
  commentText.value = ''
  comments.value = []
  await handleLoadComments(post.id)
}

function hideComments() {
  showCommentModal.value = false
  currentPost.value = null
  comments.value = []
  commentText.value = ''
}

async function handleLoadComments(postId: string) {
  commentLoading.value = true
  comments.value = await loadComments(postId)
  commentLoading.value = false
}

async function handleSubmitComment() {
  if (!commentText.value.trim() || !currentPost.value) return

  if (!isLoggedIn.value) {
    setLoginRedirect(window.location.hash.replace('#', '') || '/pages/index/index')
    showLoginGuide()
    return
  }

  const result = await submitComment(currentPost.value.id, commentText.value.trim())
  if (result) {
    comments.value = [result, ...comments.value]
    commentText.value = ''
  }
}

function formatTime(timestamp: number | string): string {
  const now = Date.now()
  // 后端时间戳为秒（<1e12），前端 Date.now() 为毫秒，统一转毫秒比较
  const ms = typeof timestamp === 'number'
    ? (timestamp > 1e12 ? timestamp : timestamp * 1000)
    : new Date(timestamp).getTime()
  const diff = now - ms

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
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000)
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
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}`
}

function getActivityIcon(category: string): string {
  const map: Record<string, string> = {
    sports: 'activity',
    culture: 'book-open',
    charity: 'heart',
    party: 'star',
    other: 'megaphone'
  }
  return map[category] || 'megaphone'
}

function getActivityIconColor(category: string): string {
  const map: Record<string, string> = {
    sports: '#2E7D32',
    culture: '#7B1FA2',
    charity: '#D64545',
    party: '#E8830C',
    other: '#2563C9'
  }
  return map[category] || '#2563C9'
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

function getActivityGradient(category: string): string {
  const map: Record<string, string> = {
    sports: 'linear-gradient(180deg, #4CAF50, #81C784)',
    culture: 'linear-gradient(180deg, #9C27B0, #CE93D8)',
    charity: 'linear-gradient(180deg, #F44336, #EF9A9A)',
    party: 'linear-gradient(180deg, #FF9800, #FFB74D)',
    other: 'linear-gradient(180deg, #2196F3, #64B5F6)'
  }
  return map[category] || 'linear-gradient(180deg, #2196F3, #64B5F6)'
}

function getInitial(nickname?: string): string {
  return (nickname?.[0] || '邻').toUpperCase()
}

function onAvatarError(e: Event) {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
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

function goToPostDetail(post: Post) {
  navigateTo(`/pages/post/detail?id=${post.id}`)
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
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toastSuccess('链接已复制到剪贴板')
    }).catch(() => {})
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
    if (currentPreviewIndex.value < previewImages.value.length - 1) {
      currentPreviewIndex.value++
    }
  } else {
    if (currentPreviewIndex.value > 0) {
      currentPreviewIndex.value--
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
  Promise.all([fetchPosts(1, true), fetchActivities(), loadQuickBadges()])
  startBannerAutoPlay()

  const runAutoLocate = () => {
    startAutoLocate(user.value?.community)
  }
  const autoTimer = setTimeout(runAutoLocate, 600)

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

  ;(window as any).__indexCleanup = () => {
    clearTimeout(autoTimer)
    document.removeEventListener('visibilitychange', onVisibility)
    cleanupLocation()
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

.home-header {
  background: var(--theme-home-gradient);
  padding-top: env(safe-area-inset-top, 0px);
  position: relative;
  z-index: 1;
}

.home-header :deep(.navbar) {
  background: transparent !important;
  border-bottom: none !important;
}

.home-header :deep(.navbar-inner) {
  padding-top: 0;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.location {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: 6px 0;
}

.location-icon {
  color: rgba(255, 255, 255, 0.95);
  margin-right: 4px;
}

.location-text {
  color: var(--color-text-white);
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
}

.location-text.locating {
  animation: locatingPulse 1.5s ease-in-out infinite;
}

@keyframes locatingPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
  color: rgba(255, 255, 255, 0.9);
  margin-right: 8px;
}

.search-placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.refresh-indicator {
  position: fixed;
  top: 88px;
  left: 0;
  right: 0;
  z-index: 101;
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
  overscroll-behavior: contain;
  width: 100%;
}

.page-wrapper {
  width: 100%;
  margin: 0 auto;
}

.banner-section {
  padding: var(--spacing-md) var(--spacing-lg);
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
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.4s var(--transition-spring);
}

.banner-content {
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.banner-deco {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  pointer-events: none;
}

.banner-title {
  color: var(--color-text-white);
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  margin-bottom: 4px;
}

.banner-desc {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
}

.banner-dots {
  position: absolute;
  bottom: 8px;
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
  padding: 6px;
  background-clip: content-box;
}

.banner-dot.active {
  width: 18px;
  border-radius: var(--radius-full);
  background: var(--color-text-white);
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  align-items: stretch;
}

.quick-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 14px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  display: flex;
  align-items: center;
  overflow: hidden;
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
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.quick-card-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.quick-icon {
  line-height: 1;
  color: var(--color-primary);
  flex-shrink: 0;
}

.quick-health .quick-icon {
  color: var(--color-success);
}

.quick-name {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 6px;
}

.quick-hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-badge {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  white-space: nowrap;
}

.section {
  padding: var(--spacing-md) var(--spacing-lg);
}

.section:first-of-type {
  padding-top: var(--spacing-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 17px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title-icon {
  color: var(--color-primary);
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
  width: 200px;
  margin-right: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  padding: 0 0 var(--spacing-md);
  box-shadow: var(--shadow-sm);
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
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-emoji {
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
  gap: 8px;
  font-size: 12px;
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
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
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
  color: var(--color-text-tertiary);
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
  color: var(--color-text-secondary);
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

/* ---- 统一 Feed 卡片 · 小红书风格 ---- */

.feed-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 var(--spacing-lg);
  box-sizing: border-box;
}

/* 桌面端大屏：3列 */
@media (min-width: 1024px) {
  .feed-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    max-width: 900px;
    margin: 0 auto;
  }
}

/* ============ 基础卡片 ============ */
.feed-card {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
  overflow: hidden;
  position: relative;
}

.feed-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.10);
  transform: translateY(-2px);
}

.feed-card:active {
  transform: scale(0.99);
}

/* ============ 帖子卡片 ============ */
.post-feed-card {
  padding: 12px 0 0 0;
}

/* ============ 帖子卡片 - 小红书双列风格 ============ */
.post-feed-card {
  padding: 0;
  overflow: hidden;
  break-inside: avoid;
}

/* 封面图 */
.post-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.post-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-feed-card:hover .post-cover-img {
  transform: scale(1.04);
}

.post-cover-count {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* 无图占位 */
.post-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
  background: linear-gradient(135deg, #f8f9fa 0%, #eef0f5 100%);
  aspect-ratio: 4 / 3;
}

/* 文本区 */
.post-body {
  padding: 10px 12px 12px;
}

.post-title {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 10px 0;
}

/* 底部栏 */
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.post-author-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--color-bg-tertiary);
}

.post-author-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.post-author-name {
  font-size: 11px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-like {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  cursor: pointer;
}

.post-like.liked {
  color: var(--color-error);
}

.post-like-icon {
  line-height: 1;
}

.heart-beat {
  animation: heartBeat 0.3s ease;
}

/* ============ 活动卡片 - 网格风格 ============ */
.activity-feed-card {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.activity-feed-deco {
  height: 3px;
  flex-shrink: 0;
}

.activity-feed-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}

.activity-feed-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-feed-body {
  flex: 1;
  min-width: 0;
}

.activity-feed-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.feed-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
}

.feed-type-badge.type-activity {
  background: var(--theme-activity-soft);
  color: var(--theme-activity);
}

.activity-feed-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-feed-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  flex-wrap: wrap;
}

.meta-dot {
  color: var(--color-text-muted);
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

/* ---- 统一 feed 筛选栏 · 小红书胶囊风格 ---- */
.feed-filter-bar {
  display: flex;
  gap: 8px;
  padding: var(--spacing-sm) var(--spacing-lg);
}

.feed-filter-btn {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 36px;
  display: flex;
  align-items: center;
  border: none;
  user-select: none;
}

.feed-filter-btn.active {
  background: var(--color-primary);
  color: var(--color-text-white);
  font-weight: var(--font-weight-semibold);
}

.feed-filter-btn:active {
  transform: scale(0.95);
}

/* ---- 活动紧凑卡片 · 小红书视觉化 ---- */
.activity-feed-card {
  padding: 0 !important;
  border-radius: 16px !important;
  display: flex;
  align-items: stretch;
  overflow: hidden;
}

.activity-feed-deco {
  width: 6px;
  flex-shrink: 0;
  border-radius: 16px 0 0 16px;
}

.activity-feed-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 14px 16px;
  flex: 1;
  min-width: 0;
}

.activity-feed-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-feed-body {
  flex: 1;
  min-width: 0;
}

.activity-feed-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.feed-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.feed-type-badge.type-activity {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.activity-feed-title {
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-feed-meta {
  font-size: 12px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.meta-dot {
  color: var(--color-border-light);
}

/* ---- 加载更多 / 没有更多 ---- */
.load-more-wrapper {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-lg);
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: var(--font-weight-medium);
  padding: 8px 24px;
  border-radius: 20px;
  background: var(--color-primary-soft);
  transition: all var(--transition-fast);
  min-height: 40px;
}

.load-more-btn:hover {
  background: var(--color-primary);
  color: var(--color-text-white);
}

.load-more-btn:active {
  transform: scale(0.97);
}

.no-more {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xl);
}

.no-more-text {
  font-size: 12px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
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

.comment-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
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
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0.3;
    transform: translateY(10px);
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
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-close {
  position: absolute;
  top: max(20px, env(safe-area-inset-top));
  right: 20px;
  z-index: 10;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-swiper {
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.image-preview-wrapper {
  display: flex;
  transition: transform 0.3s ease;
  width: 100%;
  height: 100%;
}

.image-preview-item {
  min-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.image-preview-img {
  max-width: 100%;
  max-height: 80%;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.image-preview-counter {
  position: absolute;
  bottom: max(20px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 16px;
  border-radius: var(--radius-full);
}
</style>
