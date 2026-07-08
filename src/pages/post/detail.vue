<template>
  <div class="page">
    <NavBar title="帖子详情" type="gradient" />

    <SkeletonLoader v-if="loading" type="card" :count="2" />

    <div class="content" v-if="post" v-show="!loading">
      <!-- 作者信息 -->
      <div class="post-header">
        <img v-if="post.user?.avatar" class="avatar" :src="post.user.avatar" @error="onImgError" />
        <div v-else class="avatar avatar-placeholder">{{ getInitial(post.user?.nickname) }}</div>
        <div class="user-info">
          <span class="username">{{ post.user?.nickname || '邻居' }}</span>
          <span class="meta">
            {{ formatTime(post.created_at) }}
            <span v-if="post.location">• {{ post.location }}</span>
          </span>
        </div>
      </div>

      <!-- 操作按钮：仅作者可见 -->
      <div class="post-actions" v-if="isOwner">
        <span class="action-btn edit-btn" @click="startEdit"><AppIcon name="edit" :size="16" /> 编辑</span>
        <span class="action-btn delete-btn" @click="confirmDelete"><AppIcon name="trash" :size="16" /> 删除</span>
      </div>

      <!-- 正文 / 编辑模式 -->
      <div class="post-body">
        <textarea v-if="editing" v-model="editContent" class="edit-textarea" rows="5"></textarea>
        <p v-else class="post-text">{{ post.content }}</p>
        <div class="edit-actions" v-if="editing">
          <span class="cancel-btn" @click="cancelEdit">取消</span>
          <span class="save-btn" @click="saveEdit">保存</span>
        </div>
        <div v-if="!editing && post.images && post.images.length" class="post-images" :class="'images-' + post.images.length">
          <img
            v-for="(img, i) in post.images"
            :key="i"
            class="post-image"
            :src="img"
            @click="previewImage(post.images, i)"
            @error="onImgError"
          />
        </div>
      </div>

      <!-- 互动数据 -->
      <div class="post-stats">
        <span><AppIcon name="heart" :size="16" color="#FF6B35" :filled="true" /> {{ post.like_count || 0 }}</span>
        <span><AppIcon name="message-circle" /> {{ post.comment_count || 0 }} 条评论</span>
      </div>

      <!-- 评论区 -->
      <div class="comments">
        <div class="comments-title">全部评论（{{ comments.length }}）</div>
        <div class="comment-item" v-for="c in comments" :key="c.id">
          <img v-if="c.user?.avatar" class="c-avatar" :src="c.user.avatar" @error="onImgError" />
          <div v-else class="c-avatar c-avatar-placeholder">{{ getInitial(c.user?.nickname) }}</div>
          <div class="c-body">
            <span class="c-name">{{ c.user?.nickname || '邻居' }}</span>
            <span class="c-text">{{ c.content }}</span>
            <span class="c-time">{{ formatTime(c.created_at) }}</span>
          </div>
        </div>
        <div class="empty" v-if="comments.length === 0">还没有评论，快来抢沙发~</div>
      </div>

      <div class="safe-area-bottom"></div>
    </div>

    <div class="content empty" v-else-if="!loading">
      <p>未找到该帖子。</p>
    </div>

    <!-- 底部评论输入框 -->
    <div class="comment-bar" v-if="post">
      <input
        v-model="commentText"
        class="comment-input"
        placeholder="说点什么吧…"
        @keyup.enter="submitComment"
      />
      <span class="send-btn" @click="submitComment">发送</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { navigateBackSmart } from '../../utils/router'
import { toastSuccess, toastError } from '../../utils/toast'
import { postService } from '../../services/postService'
import { useAuth } from '../../store'
import SkeletonLoader from '../../components/SkeletonLoader.vue'
import AppIcon from '../../components/AppIcon.vue'
import NavBar from '../../components/NavBar.vue'

interface Post {
  id: string
  user_id?: string
  content?: string
  images?: string[]
  location?: string
  like_count?: number
  comment_count?: number
  created_at?: number
  user?: { nickname?: string; avatar?: string }
}
interface Comment {
  id: string
  content: string
  created_at?: number
  user?: { nickname?: string; avatar?: string }
}

const route = useRoute()
const router = useRouter()
const { isLoggedIn, user } = useAuth()

const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const commentText = ref('')
const loading = ref(true)
const editing = ref(false)
const editContent = ref('')

const isOwner = computed(() => post.value?.user_id && user.value?.id && post.value.user_id === user.value.id)

const goBack = () => navigateBackSmart('/pages/index/index')

const getInitial = (name?: string) => (name || '邻').charAt(0)
const formatTime = (ts?: number) => {
  if (!ts) return ''
  const now = Math.floor(Date.now() / 1000)
  const diff = now - ts
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
  return new Date(ts * 1000).toLocaleDateString()
}
const onImgError = (e: any) => { if (e?.target) e.target.style.display = 'none' }
const previewImage = (images: string[], index: number) => {
  // 简单全屏预览：用新窗口打开图片
  if (images && images[index]) window.open(images[index], '_blank')
}

const loadPost = async () => {
  const id = route.query.id as string
  if (!id) return
  try {
    post.value = await postService.getPost(id)
    const res = await postService.getComments(id, { page: 1, limit: 50 })
    comments.value = (res as any).items || []
  } catch (err) {
    toastError('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  editContent.value = post.value?.content || ''
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  editContent.value = ''
}

const saveEdit = async () => {
  const text = editContent.value.trim()
  if (!text || !post.value) return
  try {
    await postService.updatePost(post.value.id, { content: text })
    post.value.content = text
    editing.value = false
    toastSuccess('编辑成功')
  } catch (err) {
    toastError('编辑失败，请重试')
  }
}

const confirmDelete = async () => {
  if (!post.value) return
  if (!confirm('确定删除这条动态吗？')) return
  try {
    await postService.deletePost(post.value.id)
    toastSuccess('删除成功')
    goBack()
  } catch (err) {
    toastError('删除失败，请重试')
  }
}

const submitComment = async () => {
  const text = commentText.value.trim()
  if (!text) return
  if (!isLoggedIn.value) return toastError('请先登录后再评论')
  const id = route.query.id as string
  try {
    const created = await postService.createComment(id, { content: text })
    comments.value.unshift(created as any)
    if (post.value) post.value.comment_count = (post.value.comment_count || 0) + 1
    commentText.value = ''
    toastSuccess('评论成功')
  } catch (err) {
    toastError('评论失败，请重试')
  }
}

onMounted(loadPost)
</script>

<style scoped>
.page { min-height: 100vh; background: var(--color-bg-primary); padding-bottom: 64px; }
.content { padding: var(--spacing-lg); }
.post-header { display: flex; align-items: center; gap: 10px; margin-bottom: var(--spacing-md); }
.avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { display: flex; align-items: center; justify-content: center; background: var(--color-primary-soft, rgba(255,107,53,0.1)); color: var(--color-primary, #FF6B35); font-weight: 600; }
.user-info { display: flex; flex-direction: column; }
.username { font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.meta { font-size: 12px; color: var(--color-text-muted); }
.post-body { background: var(--color-bg-secondary); border-radius: var(--radius-md); padding: var(--spacing-md); }
.post-text { font-size: 15px; line-height: 1.7; color: var(--color-text-primary); margin: 0 0 var(--spacing-md); white-space: pre-wrap; }
.post-images { display: grid; gap: 6px; grid-template-columns: repeat(3, 1fr); }
.post-image { width: 100%; height: 100px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; }
.post-stats { display: flex; gap: var(--spacing-lg); padding: var(--spacing-md) 0; font-size: 13px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border-light); }
.comments { margin-top: var(--spacing-md); }
.comments-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--spacing-md); }
.comment-item { display: flex; gap: 10px; margin-bottom: var(--spacing-md); }
.c-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.c-avatar-placeholder { display: flex; align-items: center; justify-content: center; background: var(--color-primary-soft, rgba(255,107,53,0.1)); color: var(--color-primary, #FF6B35); font-size: 13px; font-weight: 600; }
.c-body { display: flex; flex-direction: column; }
.c-name { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }
.c-text { font-size: 14px; color: var(--color-text-primary); line-height: 1.6; margin: 2px 0; }
.c-time { font-size: 11px; color: var(--color-text-muted); }
.empty { text-align: center; color: var(--color-text-muted); font-size: 13px; padding: var(--spacing-lg) 0; }
.comment-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 8px; padding: 10px var(--spacing-lg); background: var(--color-bg-secondary); border-top: 1px solid var(--color-border-light); }
.comment-input { flex: 1; border: 1px solid var(--color-border-light); border-radius: 20px; padding: 8px 14px; font-size: 14px; outline: none; background: var(--color-bg-primary); color: var(--color-text-primary); }
.send-btn { color: #fff; background: var(--color-primary); border-radius: 20px; padding: 0 18px; display: flex; align-items: center; font-size: 14px; cursor: pointer; }
.post-actions { display: flex; gap: 12px; padding: var(--spacing-sm) 0; margin-bottom: var(--spacing-sm); }
.action-btn { font-size: 13px; padding: 4px 12px; border-radius: 12px; cursor: pointer; }
.edit-btn { background: var(--color-primary-soft, rgba(255,107,53,0.1)); color: var(--color-primary, #FF6B35); }
.delete-btn { background: rgba(255,77,79,0.1); color: #ff4d4f; }
.edit-textarea { width: 100%; border: 1px solid var(--color-border-light); border-radius: var(--radius-md); padding: 10px; font-size: 14px; line-height: 1.7; resize: vertical; background: var(--color-bg-primary); color: var(--color-text-primary); }
.edit-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.cancel-btn { font-size: 13px; color: var(--color-text-muted); cursor: pointer; padding: 4px 12px; }
.save-btn { font-size: 13px; color: #fff; background: var(--color-primary); border-radius: 12px; padding: 4px 12px; cursor: pointer; }
.safe-area-bottom { height: var(--spacing-lg); }
</style>
