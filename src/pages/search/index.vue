<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-back" @click="goBack">
        <span>‹</span>
      </div>
      <div class="search-input-wrapper">
        <span class="search-icon"><AppIcon name="search" :size="14" /></span>
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索活动、互助、动态..."
          ref="searchInput"
          @keyup.enter="doSearch"
        />
        <span v-if="searchText" class="search-clear" @click="clearSearch">✕</span>
      </div>
      <div class="search-cancel" @click="doSearch" v-if="searchText">搜索</div>
    </div>

    <div class="search-content">
      <div v-if="!hasSearched && hotSearches.length > 0" class="hot-search-section">
        <div class="section-title"><AppIcon name="flame" :size="18" />热门搜索</div>
        <div class="hot-search-tags">
          <span
            class="hot-search-tag"
            v-for="(tag, index) in hotSearches"
            :key="index"
            @click="searchTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div v-if="!hasSearched && searchHistory.length > 0" class="history-section">
        <div class="section-title-row">
          <span class="section-title"><AppIcon name="activity" :size="18" />最近搜索</span>
          <span class="history-clear" @click="clearHistory">清空</span>
        </div>
        <div class="hot-search-tags">
          <span
            class="hot-search-tag"
            v-for="(tag, i) in searchHistory"
            :key="i"
            @click="searchTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <SkeletonLoader v-if="searching" type="list" :count="5" />

      <EmptyState v-else-if="hasSearched && !searching && resultActivities.length === 0 && resultTasks.length === 0 && resultPosts.length === 0" icon="search" title="没有找到相关内容" />

      <div v-else-if="hasSearched && !searching" class="search-results">
        <div v-if="resultActivities.length > 0" class="result-section">
          <div class="result-section-title"><AppIcon name="bookmark" :size="16" /> 活动</div>
          <div
            class="result-card"
            v-for="activity in resultActivities"
            :key="activity.id"
            @click="goToActivity(activity.id)"
          >
            <div class="result-icon" :style="{ background: getActivityCoverBg(activity.category) }">
              <AppIcon :name="getActivityEmoji(activity.category)" :size="24" />
            </div>
            <div class="result-content">
              <div class="result-title">{{ activity.title }}</div>
              <div class="result-desc">{{ activity.location }} · {{ formatShortTime(activity.start_time) }}</div>
            </div>
          </div>
        </div>

        <div v-if="resultTasks.length > 0" class="result-section">
          <div class="result-section-title"><AppIcon name="handshake" :size="16" /> 互助</div>
          <div
            class="result-card"
            v-for="task in resultTasks"
            :key="task.id"
            @click="goToTask(task.id)"
          >
            <div class="result-icon" :style="{ background: '#E8F5E9' }"><AppIcon name="handshake" :size="24" /></div>
            <div class="result-content">
              <div class="result-title">{{ task.title }}</div>
              <div class="result-desc">{{ task.category }} · {{ task.reward }}积分</div>
            </div>
          </div>
        </div>

        <div v-if="resultPosts.length > 0" class="result-section">
          <div class="result-section-title"><AppIcon name="book-open" :size="16" /> 动态</div>
          <div
            class="result-card"
            v-for="post in resultPosts"
            :key="post.id"
            @click="goToPost(post)"
          >
            <div class="result-avatar-wrap">
              <img v-if="post.user?.avatar" class="result-avatar" :src="post.user?.avatar" />
              <span v-else class="result-avatar-placeholder">{{ post.user?.nickname?.charAt(0) || '邻' }}</span>
            </div>
            <div class="result-content">
              <div class="result-title">{{ post.user?.nickname || '邻居' }}</div>
              <div class="result-desc">{{ post.content.substring(0, 50) }}{{ post.content.length > 50 ? '...' : '' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateTo } from '../../utils/router'
import { toastInfo } from '../../utils/toast'
import { request } from '../../utils/request'
import AppIcon from '../../components/AppIcon.vue'
import EmptyState from '../../components/EmptyState.vue'
import SkeletonLoader from '../../components/SkeletonLoader.vue'

const HISTORY_KEY = 'linli_search_history'

const searchText = ref('')
const hasSearched = ref(false)
const searching = ref(false)
const searchInput = ref<HTMLInputElement>()

const hotSearches = ref(['邻里集市', '志愿者', '老人关怀', '社区活动', '健身'])
const searchHistory = ref<string[]>([])

const resultActivities = ref<any[]>([])
const resultTasks = ref<any[]>([])
const resultPosts = ref<any[]>([])

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    searchHistory.value = raw ? JSON.parse(raw) : []
  } catch {
    searchHistory.value = []
  }
}

function saveHistory(keyword: string) {
  const k = keyword.trim()
  if (!k) return
  const next = [k, ...searchHistory.value.filter((h) => h !== k)].slice(0, 10)
  searchHistory.value = next
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    /* 忽略 */
  }
}

function clearHistory() {
  searchHistory.value = []
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    /* 忽略 */
  }
}

function goBack() {
  window.history.back()
}

function clearSearch() {
  searchText.value = ''
  hasSearched.value = false
  resultActivities.value = []
  resultTasks.value = []
  resultPosts.value = []
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

function searchTag(tag: string) {
  searchText.value = tag
  doSearch()
}

async function doSearch() {
  const keyword = searchText.value.trim()
  if (!keyword) {
    toastInfo('请输入搜索内容')
    return
  }
  hasSearched.value = true
  searching.value = true
  try {
    // B4: 统一调用后端 /api/search 聚合查询，取代此前 3 次独立拉取 + 前端过滤
    const res = await request({
      url: '/api/search',
      method: 'GET',
      data: { q: keyword },
      showLoading: false,
      showError: true
    })
    const data = (res.data as any) || {}
    resultActivities.value = data.activities || []
    resultTasks.value = data.tasks || []
    resultPosts.value = (data.posts || []).map((p: any) => ({
      ...p,
      user: { nickname: p.author, avatar: p.author_avatar }
    }))
    saveHistory(keyword)
  } catch (e: any) {
    toastInfo(e?.message || '搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

function goToActivity(id: string) {
  navigateTo('/pages/activities/detail?id=' + id)
}

function goToTask(id: string) {
  navigateTo('/pages/ai-helper/detail?id=' + id)
}

function goToPost(post: any) {
  navigateTo('/pages/post/detail?id=' + post.id)
}

function formatShortTime(timestamp: number) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}月${day}日`
}

function getActivityEmoji(category: string) {
  const map: Record<string, string> = {
    sports: 'activity',
    culture: 'book-open',
    charity: 'heart',
    party: 'star',
    other: 'bookmark'
  }
  return map[category] || 'bookmark'
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

onMounted(() => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
  loadHistory()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.search-header {
  position: sticky;
  top: 0;
  background: var(--color-bg-secondary);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.search-back {
  font-size: 28px;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-bg-tertiary);
  border-radius: 20px;
  padding: 8px 12px;
  gap: 8px;
}

.search-icon {
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  color: var(--color-text-primary);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-clear {
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
}

.search-cancel {
  font-size: 15px;
  color: var(--color-primary);
  cursor: pointer;
  white-space: nowrap;
}

.search-content {
  padding: 16px;
}

.hot-search-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.hot-search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-search-tag {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border: 1px solid var(--color-border-light);
  transition: all 0.2s;
}

.hot-search-tag:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.history-section {
  margin-bottom: 20px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-clear {
  font-size: 13px;
  color: var(--color-text-muted);
  cursor: pointer;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  color: var(--color-text-muted);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.result-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  background: var(--color-bg-tertiary);
}

.result-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.result-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
