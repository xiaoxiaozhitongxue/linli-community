import { ref, computed } from 'vue'
import { postsApi, type Post, type Comment } from '../utils/api'
import { toastError, toastSuccess } from '../utils/toast'

export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref('')
  const hasMore = ref(true)
  const currentPage = ref(1)

  async function fetchPosts(page: number = 1, isRefresh: boolean = false) {
    if (isRefresh) {
      error.value = ''
    }

    loading.value = true

    try {
      const response = await postsApi.getPosts({ page, limit: 10 })

      if (isRefresh) {
        posts.value = response.items
      } else {
        posts.value = [...posts.value, ...response.items]
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
    }
  }

  async function loadMorePosts() {
    if (loading.value || !hasMore.value) return

    await fetchPosts(currentPage.value + 1)
  }

  async function refreshPosts() {
    hasMore.value = true
    await fetchPosts(1, true)
  }

  async function likePost(post: Post) {
    const index = posts.value.findIndex(p => p.id === post.id)
    if (index === -1) return

    const originalLiked = post.is_liked
    const originalCount = post.like_count

    posts.value[index].is_liked = !originalLiked
    posts.value[index].like_count = originalCount + (!originalLiked ? 1 : -1)

    try {
      const response = await postsApi.likePost(post.id)
      posts.value[index].is_liked = response.liked
      posts.value[index].like_count = response.like_count
    } catch (err) {
      posts.value[index].is_liked = originalLiked
      posts.value[index].like_count = originalCount
      toastError('操作失败')
    }
  }

  async function loadComments(postId: string): Promise<Comment[]> {
    try {
      const response = await postsApi.getComments(postId, { limit: 50 })
      return response.items
    } catch (err) {
      toastError('加载评论失败')
      return []
    }
  }

  async function submitComment(postId: string, content: string): Promise<Comment | null> {
    if (!content.trim()) return null

    try {
      const newComment = await postsApi.createComment(postId, {
        content: content.trim()
      })

      const postIndex = posts.value.findIndex(p => p.id === postId)
      if (postIndex !== -1) {
        posts.value[postIndex].comment_count = (posts.value[postIndex].comment_count || 0) + 1
      }

      toastSuccess('评论成功')
      return newComment
    } catch (err) {
      toastError('评论失败')
      return null
    }
  }

  return {
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
  }
}
