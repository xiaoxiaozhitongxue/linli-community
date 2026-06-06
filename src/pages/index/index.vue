<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="status-content">
        <view class="location" @click="chooseLocation">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ communityName }}</text>
          <text class="location-arrow">▼</text>
        </view>
        <view class="search-bar" @click="goToSearch">
          <text class="search-icon">🔍</text>
          <text class="search-placeholder">搜索邻里、活动...</text>
        </view>
      </view>
    </view>

    <scroll-view 
      class="content" 
      scroll-y 
      :style="{ paddingTop: (statusBarHeight + 60) + 'px' }"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMorePosts"
    >
      <view class="banner-section">
        <swiper class="banner-swiper" circular autoplay :interval="4000" :duration="500">
          <swiper-item v-for="(banner, index) in banners" :key="index">
            <view class="banner-item" :style="{ background: banner.bgColor }">
              <view class="banner-content">
                <text class="banner-title">{{ banner.title }}</text>
                <text class="banner-desc">{{ banner.desc }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <view class="quick-actions">
        <view 
          class="quick-item" 
          v-for="action in quickActions" 
          :key="action.id"
          @click="handleQuickAction(action)"
        >
          <view class="quick-icon" :style="{ background: action.bgColor }">
            <text>{{ action.icon }}</text>
          </view>
          <text class="quick-text">{{ action.name }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">🔥 热门活动</text>
          <text class="section-more" @click="goToActivities">查看更多 ›</text>
        </view>
        <scroll-view class="activity-scroll" scroll-x>
          <view 
            class="activity-card" 
            v-for="activity in hotActivities" 
            :key="activity.id"
            @click="goToActivityDetail(activity.id)"
          >
            <view class="activity-cover" :style="{ background: activity.coverBg }">
              <text class="activity-emoji">{{ activity.emoji }}</text>
            </view>
            <view class="activity-info">
              <text class="activity-name">{{ activity.name }}</text>
              <view class="activity-meta">
                <text class="activity-time">{{ activity.time }}</text>
                <text class="activity-join">{{ activity.joined }}人参与</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">📖 邻里动态</text>
        </view>

        <view v-if="loading && feedList.length === 0" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <view v-else-if="error && feedList.length === 0" class="error-container">
          <text class="error-icon">😢</text>
          <text class="error-text">{{ error }}</text>
          <view class="retry-btn" @click="onRefresh">
            <text>重试</text>
          </view>
        </view>

        <view v-else class="feed-list">
          <view 
            class="feed-card animate-fadeIn" 
            v-for="(post, index) in feedList" 
            :key="post.id"
            :style="{ animationDelay: (index * 0.1) + 's' }"
          >
            <view class="feed-header">
              <image 
                class="feed-avatar" 
                :src="post.user?.avatar || 'https://via.placeholder.com/40'" 
                mode="aspectFill" 
              />
              <view class="feed-user-info">
                <text class="feed-username">{{ post.user?.nickname || '邻居' }}</text>
                <view class="feed-meta">
                  <text class="feed-time">{{ formatTime(post.created_at) }}</text>
                  <text v-if="post.location" class="feed-location">• {{ post.location }}</text>
                </view>
              </view>
            </view>

            <view class="feed-content">
              <text class="feed-text">{{ post.content }}</text>
              <view v-if="post.images && post.images.length > 0" class="feed-images" :class="'images-' + post.images.length">
                <image 
                  class="feed-image" 
                  v-for="(img, imgIndex) in post.images" 
                  :key="imgIndex"
                  :src="img" 
                  mode="aspectFill"
                  @click="previewImage(post.images, imgIndex)"
                />
              </view>
            </view>

            <view class="feed-actions">
              <view 
                class="feed-action" 
                :class="{ liked: post.is_liked }"
                @click="likePost(post)"
              >
                <text class="action-icon">{{ post.is_liked ? '❤️' : '🤍' }}</text>
                <text class="action-count">{{ post.like_count || 0 }}</text>
              </view>
              <view class="feed-action" @click="showComments(post)">
                <text class="action-icon">💬</text>
                <text class="action-count">{{ post.comment_count || 0 }}</text>
              </view>
              <view class="feed-action" @click="sharePost(post)">
                <text class="action-icon">🔗</text>
                <text class="action-count">分享</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="hasMore && feedList.length > 0" class="load-more">
          <text v-if="!loadingMore" @click="loadMorePosts">加载更多</text>
          <view v-else class="loading-more">
            <view class="loading-spinner small"></view>
            <text>加载中...</text>
          </view>
        </view>

        <view v-if="!hasMore && feedList.length > 0" class="no-more">
          <text>没有更多了</text>
        </view>

        <view class="safe-area-bottom"></view>
      </view>
    </scroll-view>

    <view class="fab-btn" @click="goToCreate">
      <text class="fab-icon">✏️</text>
      <text class="fab-text">发布</text>
    </view>

    <view v-if="showCommentModal" class="comment-mask" @click="hideComments">
      <view class="comment-panel" @click.stop>
        <view class="comment-header">
          <text class="comment-title">评论 ({{ currentPost?.comment_count || 0 }})</text>
          <text class="comment-close" @click="hideComments">✕</text>
        </view>

        <scroll-view class="comment-list" scroll-y>
          <view v-if="commentLoading && comments.length === 0" class="comment-loading">
            <view class="loading-spinner small"></view>
          </view>
          <view v-else-if="comments.length === 0" class="comment-empty">
            <text class="empty-icon">💬</text>
            <text class="empty-text">暂无评论，快来抢沙发吧！</text>
          </view>
          <view v-else class="comment-item" v-for="comment in comments" :key="comment.id">
            <image 
              class="comment-avatar" 
              :src="comment.user?.avatar || 'https://via.placeholder.com/32'" 
              mode="aspectFill" 
            />
            <view class="comment-content">
              <text class="comment-user">{{ comment.user?.nickname || '邻居' }}</text>
              <text class="comment-text">{{ comment.content }}</text>
              <text class="comment-time">{{ formatTime(comment.created_at) }}</text>
            </view>
          </view>
        </scroll-view>

        <view class="comment-input-wrapper">
          <input 
            class="comment-input" 
            v-model="commentText" 
            placeholder="说点什么..."
            :disabled="!isLoggedIn"
          />
          <view 
            class="comment-submit" 
            :class="{ disabled: !commentText.trim() || !isLoggedIn }"
            @click="submitComment"
          >
            <text>发送</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { postsApi, type Post, type Comment } from '../../utils/api'
import { useAuth } from '../../store'

const { initAuth, isLoggedIn } = useAuth()

const statusBarHeight = ref(20)
const communityName = ref('阳光社区')
const refreshing = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const hasMore = ref(true)
const currentPage = ref(1)

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
  }
}

async function onRefresh() {
  refreshing.value = true
  currentPage.value = 1
  hasMore.value = true
  await fetchPosts(1, true)
}

async function loadMorePosts() {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  await fetchPosts(currentPage.value + 1)
}

async function likePost(post: Post) {
  if (!isLoggedIn.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
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
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
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
    uni.showToast({
      title: '加载评论失败',
      icon: 'none'
    })
  } finally {
    commentLoading.value = false
  }
}

async function submitComment() {
  if (!commentText.value.trim() || !isLoggedIn.value || !currentPost.value) return
  
  if (!isLoggedIn.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
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
    uni.showToast({
      title: '评论成功',
      icon: 'success'
    })
  } catch (err) {
    uni.showToast({
      title: '评论失败',
      icon: 'none'
    })
  }
}

function formatTime(timestamp: string): string {
  const now = Date.now()
  const date = new Date(timestamp).getTime()
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
  uni.chooseLocation({
    success: (res) => {
      communityName.value = res.name || '我的社区'
    }
  })
}

function goToSearch() {
  uni.showToast({
    title: '搜索功能开发中',
    icon: 'none'
  })
}

function handleQuickAction(action: any) {
  uni.switchTab({
    url: action.path
  })
}

function goToActivityDetail(id: string) {
  uni.showToast({
    title: '活动详情开发中',
    icon: 'none'
  })
}

function goToActivities() {
  uni.switchTab({
    url: '/pages/neighborhood/index'
  })
}

function sharePost(post: Post) {
  uni.showShareMenu()
}

function previewImage(images: string[], index: number) {
  uni.previewImage({
    urls: images,
    current: index
  })
}

function goToCreate() {
  uni.navigateTo({
    url: '/pages/post/create'
  })
}

onMounted(() => {
  initAuth()
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loading.value = true
  fetchPosts(1, true)
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
}

.search-icon {
  font-size: 14px;
  margin-right: 8px;
}

.search-placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.content {
  height: calc(100vh - 60px);
}

.banner-section {
  padding: var(--spacing-lg);
}

.banner-swiper {
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.banner-item {
  height: 120px;
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
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
}

.activity-scroll {
  white-space: nowrap;
}

.activity-card {
  display: inline-block;
  width: 150px;
  margin-right: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
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
}

.feed-action.liked .action-icon {
  color: #E63946;
}

.action-icon {
  font-size: 18px;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: var(--text-muted);
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
}

.load-more,
.no-more {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-muted);
  font-size: 14px;
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
}

.comment-list {
  flex: 1;
  padding: var(--spacing-lg);
  max-height: 40vh;
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
}

.comment-submit.disabled {
  background: #B0C4DE;
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
}

.fab-icon {
  font-size: 18px;
}

.fab-text {
  font-size: 15px;
  font-weight: 600;
}
</style>
