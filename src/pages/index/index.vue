<template>
  <div class="page">
    <NavBar type="gradient" :showBack="false">
      <div class="status-content">
        <div class="location" @click="openLocationPicker">
          <AppIcon class="location-icon" :name="locating ? 'activity' : 'map-pin'" :size="16" />
          <span class="location-text" :class="{ locating }">{{ locating ? '定位中' : communityName }}</span>
          <span class="location-arrow">▼</span>
        </div>
        <div class="search-bar" @click="goToSearch">
          <AppIcon class="search-icon" name="search" :size="16" />
          <span class="search-placeholder">搜索邻里、活动...</span>
        </div>
      </div>
    </NavBar>

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

        <!-- 统一 feed 筛选栏 -->
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
              <!-- 活动卡片（紧凑） -->
              <div
                v-if="item._type === 'activity'"
                class="feed-card activity-feed-card animate-fadeIn"
                :style="{ animationDelay: (index * 0.05) + 's' }"
                @click="goToActivityDetail(item._raw.id)"
              >
                <div class="activity-feed-row">
                  <div class="activity-feed-icon" :style="{ background: getActivityCoverBg(item._raw.category) }">
                    <AppIcon :name="getActivityIcon(item._raw.category)" :size="24" :color="getActivityIconColor(item._raw.category)" />
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

              <!-- 动态卡片 -->
              <div
                v-else
                class="feed-card animate-fadeIn"
                :style="{ animationDelay: (index * 0.05) + 's' }"
                @click="goToPostDetail(item._raw)"
              >
                <div class="feed-header">
                  <img v-if="item._raw.user?.avatar" class="feed-avatar" :src="item._raw.user.avatar" @error="onAvatarError" />
                  <div v-else class="feed-avatar feed-avatar-placeholder">{{ getInitial(item._raw.user?.nickname) }}</div>
                  <div class="feed-user-info">
                    <span class="feed-username">{{ item._raw.user?.nickname || '邻居' }}</span>
                    <div class="feed-meta">
                      <span class="feed-time">{{ formatTime(item._raw.created_at) }}</span>
                      <span v-if="item._raw.location" class="feed-location">• {{ item._raw.location }}</span>
                    </div>
                  </div>
                </div>

                <div class="feed-content">
                  <span class="feed-text">{{ item._raw.content }}</span>
                  <div v-if="item._raw.images && item._raw.images.length > 0" class="feed-images" :class="'images-' + item._raw.images.length">
                    <img class="feed-image" v-for="(img, imgIndex) in item._raw.images" :key="imgIndex" :src="img" @click.stop="previewImage(item._raw.images, imgIndex)" />
                  </div>
                </div>

                <div class="feed-actions">
                  <div class="feed-action" :class="{ liked: item._raw.is_liked }" @click.stop="handleLikePost(item._raw)">
                    <AppIcon class="action-icon" :class="{ 'heart-beat': item._raw.is_liked }" name="heart" :size="20" :filled="item._raw.is_liked" />
                    <span class="action-count">{{ item._raw.like_count || 0 }}</span>
                  </div>
                  <div class="feed-action" @click.stop="showComments(item._raw)">
                    <AppIcon class="action-icon" name="comment" :size="20" />
                    <span class="action-count">{{ item._raw.comment_count || 0 }}</span>
                  </div>
                  <div class="feed-action" @click.stop="sharePost(item._raw)">
                    <AppIcon class="action-icon" name="share" :size="20" />
                    <span class="action-count">分享</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-if="hasMore && posts.length > 0" class="load-more">
            <span v-if="!loadingMore" @click="handleLoadMore">加载更多</span>
            <div v-else class="loading-more">
              <div class="loading-spinner small"></div>
              <span>加载中...</span>
            </div>
          </div>

          <div v-if="!hasMore && posts.length > 0 && feedFilter !== 'activity'" class="no-more">
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

    <!-- 位置选择器 -->
    <div v-if="showLocationPicker" class="location-picker-mask" @click="closeLocationPicker">
      <div class="location-picker-panel" @click.stop>
        <div class="location-picker-header">
          <span class="location-picker-title">选择位置</span>
          <span class="location-picker-close" @click="closeLocationPicker"><AppIcon name="close" :size="20" /></span>
        </div>

        <div class="location-picker-body">
          <!-- 手动输入 -->
          <div class="location-input-group">
            <label class="location-input-label">手动输入地址</label>
            <div class="location-input-wrapper">
              <AppIcon name="map-pin" :size="16" color="var(--color-text-placeholder)" />
              <input
                class="location-input"
                v-model="manualAddress"
                placeholder="输入地址，如：浦东新区张江镇"
                @input="onManualInput"
              />
              <span v-if="manualAddress" class="location-input-clear" @click="manualAddress = ''">
                <AppIcon name="close" :size="14" color="var(--color-text-placeholder)" />
              </span>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="location-divider">
            <span class="location-divider-line"></span>
            <span class="location-divider-text">或者</span>
            <span class="location-divider-line"></span>
          </div>

          <!-- 自动定位 -->
          <div class="location-auto-group">
            <label class="location-input-label">自动定位</label>
            <div class="location-auto-card" @click="locateAndSelect">
              <div class="location-auto-left">
                <div class="location-auto-icon">
                  <AppIcon :name="locating ? 'activity' : 'map-pin'" :size="20" color="var(--color-primary)" />
                </div>
                <div class="location-auto-info">
                  <span class="location-auto-status">{{ locating ? '正在定位...' : (autoLocatedAddress || '点击获取当前位置') }}</span>
                  <span v-if="autoLocatedAddress && !locating" class="location-auto-sub">{{ autoLocatedDetail }}</span>
                </div>
              </div>
              <div v-if="locating" class="location-auto-loading">
                <div class="loading-spinner small"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 确认按钮 -->
        <div class="location-picker-footer">
          <div class="location-picker-btn location-picker-btn-cancel" @click="closeLocationPicker">取消</div>
          <div class="location-picker-btn location-picker-btn-confirm" :class="{ disabled: !selectedAddress }" @click="confirmLocation">确认</div>
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
  startAutoLocate,
  cleanup: cleanupLocation
} = useLocation()

const showLocationPicker = ref(false)
const manualAddress = ref('')
const autoLocatedAddress = ref('')
const autoLocatedDetail = ref('')

const selectedAddress = computed(() => manualAddress.value.trim() || autoLocatedAddress.value)

function openLocationPicker() {
  showLocationPicker.value = true
  manualAddress.value = ''
  autoLocatedAddress.value = ''
  autoLocatedDetail.value = ''
  // 自动开始定位
  autoLocateForPicker()
}

function closeLocationPicker() {
  showLocationPicker.value = false
}

async function autoLocateForPicker() {
  locating.value = true
  try {
    const result = await getLocation({ forceRefresh: true })
    if (result) {
      autoLocatedAddress.value = result.address || result.community
      autoLocatedDetail.value = result.city && result.district ? `${result.city} ${result.district}` : ''
    }
  } catch (e) {
    console.warn('[locationPicker] 定位失败:', e)
    autoLocatedAddress.value = '定位失败，请重试'
  } finally {
    locating.value = false
  }
}

function onManualInput() {
  // 用户手动输入时，清除自动定位选择
  if (manualAddress.value.trim()) {
    // 不做额外操作，selectedAddress会自动切换到手动输入的地址
  }
}

function confirmLocation() {
  const addr = selectedAddress.value
  if (!addr) return
  communityName.value = addr
  showLocationPicker.value = false
  toastSuccess(`已定位到 ${addr}`)
}

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


.status-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 100%;
}

.location {
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 44px;
  padding: 6px 0;
  transition: opacity var(--transition-fast);
}

.location:active {
  opacity: 0.8;
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

.location-arrow {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  margin-left: 6px;
  transition: transform var(--transition-fast);
}

.location:active .location-arrow {
  transform: scale(0.9);
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
}

.quick-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 14px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  min-height: 72px;
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
  padding: var(--spacing-lg);
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.feed-card:hover {
  box-shadow: var(--shadow-md);
}

.feed-card:active {
  transform: scale(0.99);
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.feed-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: var(--spacing-md);
  background: var(--color-bg-tertiary);
  object-fit: cover;
  flex-shrink: 0;
}

.feed-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.feed-user-info {
  flex: 1;
}

.feed-username {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: 1px;
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
  margin-bottom: 12px;
}

.feed-text {
  font-size: 14px;
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
  gap: 24px;
  border-top: 1px solid var(--color-border-light);
  padding-top: 12px;
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
  font-size: 12px;
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

/* ---- 统一 feed 筛选栏 ---- */
.feed-filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg) 0;
}

.feed-filter-btn {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 36px;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-light);
}

.feed-filter-btn.active {
  background: var(--color-primary);
  color: var(--color-text-white);
  border-color: var(--color-primary);
}

.feed-filter-btn:active {
  transform: scale(0.96);
}

/* ---- 活动紧凑卡片 ---- */
.activity-feed-card {
  padding: var(--spacing-md) var(--spacing-lg) !important;
}

.activity-feed-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.activity-feed-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
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
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
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

.load-more,
.no-more {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
  background: transparent;
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
    padding: var(--spacing-md) var(--spacing-xl);
  }

  .banner-swiper {
    height: 140px;
    border-radius: var(--radius-xl);
  }

  .banner-item {
    height: 140px;
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .banner-title {
    font-size: 20px;
  }

  .banner-desc {
    font-size: 14px;
  }

  .quick-actions {
    max-width: 600px;
    margin: 0 auto var(--spacing-lg);
  }

  .quick-card {
    min-height: 80px;
    padding: var(--spacing-lg);
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
    width: 100%;
    max-width: 100%;
    padding: 0 var(--spacing-2xl);
  }

  .status-content {
    width: 100%;
    max-width: 100%;
    padding: 0 var(--spacing-2xl);
  }

  .status-bar {
    left: var(--nav-sidebar-width, 220px);
    right: 0;
    width: auto;
  }

  .banner-section {
    padding: var(--spacing-2xl) 0;
  }

  .banner-swiper {
    height: 280px;
    width: 100%;
    max-width: 100%;
    border-radius: var(--radius-2xl);
  }

  .banner-item {
    height: 280px;
  }

  .banner-title {
    font-size: 24px;
  }

  .banner-desc {
    font-size: 15px;
  }

  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    max-width: 100%;
    gap: var(--spacing-xl);
    padding: 0;
  }

  .quick-card {
    min-height: 120px;
    padding: var(--spacing-xl);
  }

  .quick-icon {
    font-size: 28px;
  }

  .quick-name {
    font-size: 16px;
  }

  .section {
    padding: var(--spacing-2xl) 0;
  }

  .section-header {
    width: 100%;
    max-width: 100%;
    margin-bottom: var(--spacing-xl);
  }

  .section-title {
    font-size: 20px;
  }

  .section-more {
    font-size: 15px;
  }

  .activity-scroll {
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    max-width: 100%;
    gap: var(--spacing-xl);
    padding: 0;
  }

  .activity-card {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .activity-cover {
    height: 120px;
  }

  .activity-emoji {
    font-size: 48px;
  }

  .recent-activity-scroll {
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    max-width: 100%;
    gap: var(--spacing-xl);
    padding: 0;
  }

  .recent-activity-card {
    width: 100%;
  }

  .feed-list {
    width: 100%;
    max-width: 100%;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
  }

  .feed-card {
    padding: var(--spacing-2xl);
    border-radius: var(--radius-2xl);
  }

  .feed-avatar {
    width: 52px;
    height: 52px;
  }

  .feed-username {
    font-size: 16px;
  }

  .feed-text {
    font-size: 15px;
    line-height: 1.7;
  }

  .refresh-indicator {
    left: var(--nav-sidebar-width, 220px);
    right: 0;
  }
}

@media (min-width: 1440px) {
  .page-wrapper {
    padding: 0 var(--spacing-3xl);
  }

  .status-content {
    padding: 0 var(--spacing-3xl);
  }

  .banner-section {
    padding: var(--spacing-2xl) 0;
  }

  .banner-swiper {
    height: 340px;
    border-radius: var(--radius-2xl);
  }

  .banner-item {
    height: 340px;
  }

  .banner-title {
    font-size: 28px;
  }

  .quick-actions {
    grid-template-columns: repeat(6, 1fr);
    gap: var(--spacing-2xl);
  }

  .activity-scroll {
    grid-template-columns: repeat(6, 1fr);
    gap: var(--spacing-2xl);
  }

  .recent-activity-scroll {
    grid-template-columns: repeat(6, 1fr);
    gap: var(--spacing-2xl);
  }

  .feed-list {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-2xl);
  }

  .feed-card {
    padding: var(--spacing-2xl);
  }
}

/* ========== 位置选择器 ========== */
.location-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.2s ease;
}

.location-picker-panel {
  width: 100%;
  max-height: 70vh;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s var(--transition-spring);
  overflow: hidden;
}

.location-picker-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  flex-shrink: 0;
}

.location-picker-title {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.location-picker-close {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.location-picker-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.location-input-group,
.location-auto-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.location-input-label {
  font-size: 13px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.location-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  transition: border-color 0.2s;
}

.location-input-wrapper:focus-within {
  border-color: var(--color-primary);
}

.location-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.location-input::placeholder {
  color: var(--color-text-placeholder);
}

.location-input-clear {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;
}

.location-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xs) 0;
}

.location-divider-line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.location-divider-text {
  font-size: 12px;
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.location-auto-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s;
}

.location-auto-card:active {
  background: var(--color-bg-tertiary);
}

.location-auto-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.location-auto-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary-bg, rgba(37, 99, 201, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-auto-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.location-auto-status {
  font-size: 14px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-auto-sub {
  font-size: 12px;
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-auto-loading {
  flex-shrink: 0;
}

.location-picker-footer {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.location-picker-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.location-picker-btn-cancel {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.location-picker-btn-confirm {
  background: var(--color-primary);
  color: var(--color-text-white);
}

.location-picker-btn-confirm.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
