<template>
  <div class="admin-page">
    <div class="header">
      <span class="back" @click="goBack">‹</span>
      <span class="title">后台管理</span>
      <span class="placeholder"></span>
    </div>

    <!-- 登录验证 -->
    <div class="login-section" v-if="!isAuthenticated">
      <div class="login-card">
        <div class="login-title">管理员登录</div>
        <div class="login-hint">请输入管理员手机号验证身份</div>
        <input v-model="phoneInput" class="login-input" placeholder="管理员手机号" type="tel" />
        <div class="login-btn" @click="verifyAdmin">验证身份</div>
        <div class="login-error" v-if="loginError">{{ loginError }}</div>
      </div>
    </div>

    <!-- 仪表盘 -->
    <div class="dashboard" v-else>
      <!-- 统计概览 -->
      <div class="stats-row">
        <div class="stat-card" @click="activeSection = 'users'">
          <div class="stat-num">{{ stats.userCount }}</div>
          <div class="stat-label">用户总数</div>
        </div>
        <div class="stat-card" @click="activeSection = 'posts'">
          <div class="stat-num">{{ stats.postCount }}</div>
          <div class="stat-label">帖子总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ stats.taskCount }}</div>
          <div class="stat-label">任务总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">{{ stats.activityCount }}</div>
          <div class="stat-label">活动总数</div>
        </div>
      </div>

      <!-- 标签页切换 -->
      <div class="tabs">
        <div class="tab" :class="{ active: activeSection === 'users' }" @click="activeSection = 'users'">用户列表</div>
        <div class="tab" :class="{ active: activeSection === 'posts' }" @click="activeSection = 'posts'">帖子管理</div>
      </div>

      <!-- 用户列表 -->
      <div class="section" v-if="activeSection === 'users'">
        <div class="section-header">
          <span class="section-title">用户列表（{{ users.length }}）</span>
          <input v-model="userSearch" class="search-input" placeholder="搜索昵称/手机号" />
        </div>
        <div class="data-table">
          <div class="table-header">
            <span class="col-id">ID</span>
            <span class="col-name">昵称</span>
            <span class="col-phone">手机号</span>
            <span class="col-community">社区</span>
            <span class="col-role">角色</span>
            <span class="col-verified">认证</span>
            <span class="col-time">注册时间</span>
          </div>
          <div class="table-body">
            <div class="table-row" v-for="user in filteredUsers" :key="user.id">
              <span class="col-id" :title="user.id">{{ user.id.slice(0, 8) }}...</span>
              <span class="col-name">{{ user.nickname }}</span>
              <span class="col-phone">{{ user.phone }}</span>
              <span class="col-community">{{ user.community }}</span>
              <span class="col-role">{{ user.role }}</span>
              <span class="col-verified">
                <span :class="user.is_verified ? 'badge-verified' : 'badge-unverified'">
                  {{ user.is_verified ? '已认证' : '未认证' }}
                </span>
              </span>
              <span class="col-time">{{ formatTime(user.created_at) }}</span>
            </div>
            <div class="empty-row" v-if="filteredUsers.length === 0">暂无用户数据</div>
          </div>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="section" v-if="activeSection === 'posts'">
        <div class="section-header">
          <span class="section-title">帖子管理（{{ posts.length }}）</span>
        </div>
        <div class="data-table">
          <div class="table-header">
            <span class="col-id">ID</span>
            <span class="col-author">作者</span>
            <span class="col-content">内容摘要</span>
            <span class="col-likes">点赞</span>
            <span class="col-comments">评论</span>
            <span class="col-visibility">可见性</span>
            <span class="col-time">发布时间</span>
          </div>
          <div class="table-body">
            <div class="table-row" v-for="post in posts" :key="post.id">
              <span class="col-id" :title="post.id">{{ post.id.slice(0, 8) }}...</span>
              <span class="col-author">{{ post.author || '未知' }}</span>
              <span class="col-content">{{ (post.content || '').slice(0, 30) }}{{ (post.content || '').length > 30 ? '...' : '' }}</span>
              <span class="col-likes">{{ post.like_count || 0 }}</span>
              <span class="col-comments">{{ post.comment_count || 0 }}</span>
              <span class="col-visibility">{{ post.visibility }}</span>
              <span class="col-time">{{ formatTime(post.created_at) }}</span>
            </div>
            <div class="empty-row" v-if="posts.length === 0">暂无帖子数据</div>
          </div>
        </div>
      </div>
    </div>

    <div class="safe-area-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { request } from '../../utils/request'
import { navigateBack } from '../../utils/router'

const phoneInput = ref('')
const isAuthenticated = ref(false)
const loginError = ref('')
const activeSection = ref<'users' | 'posts'>('users')
const userSearch = ref('')

interface UserItem {
  id: string
  nickname: string
  phone: string
  community: string
  role: string
  is_verified: number
  created_at: number
}

interface PostItem {
  id: string
  author: string
  content: string
  like_count: number
  comment_count: number
  visibility: string
  created_at: number
}

interface Stats {
  userCount: number
  postCount: number
  taskCount: number
  activityCount: number
}

const users = ref<UserItem[]>([])
const posts = ref<PostItem[]>([])
const stats = ref<Stats>({ userCount: 0, postCount: 0, taskCount: 0, activityCount: 0 })

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.nickname.toLowerCase().includes(q) || u.phone.includes(q)
  )
})

function formatTime(ts: number): string {
  if (!ts) return '-'
  const d = new Date(ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function verifyAdmin() {
  const phone = phoneInput.value.trim()
  if (!phone) {
    loginError.value = '请输入手机号'
    return
  }
  loginError.value = ''
  try {
    const res = await request({
      url: '/api/admin/verify',
      method: 'POST',
      data: { phone },
      showError: false,
      showLoading: false
    })
    if (res.success) {
      isAuthenticated.value = true
      await loadData()
    } else {
      loginError.value = res.message || '验证失败，无管理员权限'
    }
  } catch (e: any) {
    loginError.value = e?.message || '验证失败'
  }
}

async function loadData() {
  try {
    const [usersRes, postsRes] = await Promise.all([
      request({ url: '/api/admin/users', method: 'GET', showError: false, showLoading: false }),
      request({ url: '/api/admin/posts', method: 'GET', showError: false, showLoading: false })
    ])
    if (usersRes.success) {
      users.value = usersRes.data?.users || []
      stats.value.userCount = usersRes.data?.total || users.value.length
      stats.value.taskCount = usersRes.data?.taskCount || 0
      stats.value.activityCount = usersRes.data?.activityCount || 0
    }
    if (postsRes.success) {
      posts.value = postsRes.data?.posts || []
      stats.value.postCount = postsRes.data?.total || posts.value.length
    }
  } catch {
    // 加载失败静默处理
  }
}

function goBack() {
  navigateBack()
}

onMounted(() => {
  // 尝试自动恢复登录态（通过本地存储的 admin_token）
  const savedToken = localStorage.getItem('admin_token')
  if (savedToken) {
    isAuthenticated.value = true
    loadData()
  }
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  padding-top: calc(var(--spacing-lg) + 20px);
  background: var(--color-primary-gradient);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back {
  font-size: 28px;
  cursor: pointer;
  line-height: 1;
  width: 40px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.placeholder {
  width: 40px;
}

/* 登录 */
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: var(--color-bg-secondary);
  padding: 32px 24px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  text-align: center;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.login-hint {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.login-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 16px;
  outline: none;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  box-sizing: border-box;
  margin-bottom: 16px;
}

.login-input:focus {
  border-color: var(--color-primary);
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary-gradient);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-error {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 12px;
}

/* 仪表盘 */
.dashboard {
  padding: var(--spacing-lg);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--color-bg-secondary);
  padding: 16px 12px;
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 0;
}

.tab {
  padding: 10px 20px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.search-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: 13px;
  outline: none;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  width: 180px;
}

.search-input:focus {
  border-color: var(--color-primary);
}

/* 数据表格 */
.data-table {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: flex;
  background: var(--color-bg-tertiary);
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  gap: 8px;
}

.table-row {
  display: flex;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
  gap: 8px;
  transition: background 0.15s;
}

.table-row:hover {
  background: var(--color-bg-tertiary);
}

.table-row:last-child {
  border-bottom: none;
}

.empty-row {
  padding: 32px 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}

.col-id { width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.col-name { width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.col-phone { width: 120px; flex-shrink: 0; }
.col-community { width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.col-role { width: 60px; flex-shrink: 0; }
.col-verified { width: 60px; flex-shrink: 0; }
.col-time { flex: 1; text-align: right; }
.col-author { width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
.col-content { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-likes { width: 50px; text-align: center; flex-shrink: 0; }
.col-comments { width: 50px; text-align: center; flex-shrink: 0; }
.col-visibility { width: 60px; text-align: center; flex-shrink: 0; }

.badge-verified {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: var(--color-success-soft);
  color: var(--color-success);
}

.badge-unverified {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

.safe-area-bottom {
  height: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
}
</style>
