<template>
  <div class="search-page">
    <div class="search-header">
      <div class="search-back" @click="goBack">
        <span>‹</span>
      </div>
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
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
        <div class="section-title">🔥 热门搜索</div>
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

      <div v-else-if="hasSearched && searchResults.length === 0" class="search-empty">
        <span class="empty-icon">🔍</span>
        <span class="empty-text">没有找到相关内容</span>
      </div>

      <div v-else-if="hasSearched && searchResults.length > 0" class="search-results">
        <div v-if="resultActivities.length > 0" class="result-section">
          <div class="result-section-title">📋 活动</div>
          <div
            class="result-card"
            v-for="activity in resultActivities"
            :key="activity.id"
            @click="goToActivity(activity.id)"
          >
            <div class="result-icon" :style="{ background: getActivityCoverBg(activity.category) }">
              {{ getActivityEmoji(activity.category) }}
            </div>
            <div class="result-content">
              <div class="result-title">{{ activity.title }}</div>
              <div class="result-desc">{{ activity.location }} · {{ formatShortTime(activity.start_time) }}</div>
            </div>
          </div>
        </div>

        <div v-if="resultTasks.length > 0" class="result-section">
          <div class="result-section-title">🤝 互助</div>
          <div
            class="result-card"
            v-for="task in resultTasks"
            :key="task.id"
            @click="goToTask(task.id)"
          >
            <div class="result-icon" :style="{ background: '#E8F5E9' }">🤝</div>
            <div class="result-content">
              <div class="result-title">{{ task.title }}</div>
              <div class="result-desc">{{ task.category }} · {{ task.reward }}积分</div>
            </div>
          </div>
        </div>

        <div v-if="resultPosts.length > 0" class="result-section">
          <div class="result-section-title">📖 动态</div>
          <div
            class="result-card"
            v-for="post in resultPosts"
            :key="post.id"
            @click="goToPost(post)"
          >
            <img class="result-avatar" :src="post.user?.avatar || 'https://via.placeholder.com/40'" />
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
import { postsApi, activitiesApi, type Post, type Activity } from '../../utils/api'
import { navigateTo } from '../../utils/router'
import { toastInfo } from '../../utils/toast'

const searchText = ref('')
const hasSearched = ref(false)
const searchResults = ref<any[]>([])
const searchInput = ref<HTMLInputElement>()

const hotSearches = ref(['邻里集市', '志愿者', '老人关怀', '社区活动', '健身'])

const resultActivities = ref<Activity[]>([])
const resultTasks = ref<any[]>([])
const resultPosts = ref<Post[]>([])

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
  if (!searchText.value.trim()) {
    toastInfo('请输入搜索内容')
    return
  }
  hasSearched.value = true
  try {
    await Promise.all([searchActivities(), searchTasks(), searchPosts()])
  } catch (err) {
    console.error('搜索失败:', err)
  }
}

async function searchActivities() {
  try {
    const response = await activitiesApi.getActivities({ limit: 20 })
    resultActivities.value = response.items.filter(activity =>
      activity.title.toLowerCase().includes(searchText.value.toLowerCase())
    )
  } catch (err) {
    console.error('搜索活动失败:', err)
  }
}

async function searchTasks() {
  resultTasks.value = []
  const mockTasks = [
    { id: '1', title: '帮我取个快递', category: '跑腿', reward: 20 },
    { id: '2', title: '求助电脑维修', category: '技术', reward: 50 },
    { id: '3', title: '需要帮忙遛狗', category: '宠物', reward: 30 }
  ]
  resultTasks.value = mockTasks.filter(task =>
    task.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
    task.category.toLowerCase().includes(searchText.value.toLowerCase())
  )
}

async function searchPosts() {
  try {
    const response = await postsApi.getPosts({ limit: 50 })
    resultPosts.value = response.items.filter(post =>
      post.content.toLowerCase().includes(searchText.value.toLowerCase()) ||
      (post.user?.nickname && post.user.nickname.toLowerCase().includes(searchText.value.toLowerCase()))
    )
  } catch (err) {
    console.error('搜索动态失败:', err)
  }
}

function goToActivity(id: string) {
  navigateTo('/pages/activities/detail?id=' + id)
}

function goToTask(id: string) {
  navigateTo('/pages/ai-helper/detail?id=' + id)
}

function goToPost(post: Post) {
  toastInfo('查看详情功能开发中')
}

function formatShortTime(timestamp: number) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}月${day}日`
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

onMounted(() => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
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
