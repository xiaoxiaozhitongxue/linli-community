import { ref } from 'vue'
import { tasksApi, type Task } from '../utils/api'

export function useTasks() {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')
  const hasMore = ref(true)
  const currentPage = ref(1)

  async function fetchTasks(page: number = 1, isRefresh: boolean = false) {
    if (isRefresh) {
      error.value = ''
    }

    loading.value = true

    try {
      const response = await tasksApi.getTasks({ page, limit: 10 })

      if (isRefresh) {
        tasks.value = response.items
      } else {
        tasks.value = [...tasks.value, ...response.items]
      }

      currentPage.value = page
      hasMore.value = page * 10 < response.total
    } catch (err) {
      if (isRefresh) {
        error.value = '加载失败，请稍后重试'
      }
      console.error('获取任务失败:', err)
    } finally {
      loading.value = false
    }
  }

  async function refreshTasks() {
    hasMore.value = true
    await fetchTasks(1, true)
  }

  async function loadMoreTasks() {
    if (loading.value || !hasMore.value) return

    await fetchTasks(currentPage.value + 1)
  }

  return {
    tasks,
    loading,
    error,
    hasMore,
    currentPage,
    fetchTasks,
    refreshTasks,
    loadMoreTasks
  }
}
