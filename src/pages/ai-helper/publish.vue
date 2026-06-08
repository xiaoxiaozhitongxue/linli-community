<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">←</span>
        <span class="header-title">发布任务</span>
        <span class="placeholder"></span>
      </div>
    </div>

    <div class="content">
      <div class="form-section">
        <div class="form-label">任务标题</div>
        <div class="form-input">
          <input 
            type="text" 
            v-model="form.title" 
            placeholder="请输入任务标题（10-30字）"
            maxlength="30"
          />
        </div>
      </div>

      <div class="form-section">
        <div class="form-label">任务描述</div>
        <div class="form-textarea">
          <textarea 
            v-model="form.description" 
            placeholder="请详细描述任务内容（50-200字）"
            maxlength="200"
            rows="4"
          ></textarea>
        </div>
      </div>

      <div class="form-section">
        <div class="form-label">任务类型</div>
        <div class="category-grid">
          <div 
            v-for="cat in categories"
            :key="cat.value"
            class="category-item" 
            :class="{ active: form.category === cat.value }"
            @click="form.category = cat.value"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-text">{{ cat.label }}</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-label">服务地点</div>
        <div class="form-input location-input">
          <input 
            type="text" 
            v-model="form.location" 
            placeholder="请输入详细地址"
          />
          <span class="location-icon">📍</span>
        </div>
      </div>

      <div class="form-section">
        <div class="form-label">任务报酬</div>
        <div class="form-input">
          <input 
            type="number" 
            v-model="form.reward" 
            placeholder="请输入报酬金额"
            min="0"
          />
          <span class="reward-unit">元</span>
        </div>
      </div>

      <div class="ai-match-section">
        <div class="ai-header">
          <span class="ai-icon">🤖</span>
          <span class="ai-title">AI智能推荐</span>
        </div>
        <div class="ai-desc">开启AI推荐，系统将为您匹配合适的帮助者</div>
        <div class="ai-toggle">
          <div 
            class="toggle-switch"
            :class="{ active: form.enableAI }"
            @click="form.enableAI = !form.enableAI"
          >
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>

      <div class="submit-btn" @click="submitTask" :class="{ disabled: !canSubmit }">
        发布任务
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo, navigateBack } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const STORAGE_KEY = 'ai_helper_tasks'
const MY_CREATED_TASKS_KEY = 'ai_helper_my_created_tasks'

const statusBarHeight = ref(20)

const categories = [
  { value: 'delivery', label: '快递取送', icon: '📦' },
  { value: 'shopping', label: '代购', icon: '🛒' },
  { value: 'help', label: '帮忙', icon: '🤝' },
  { value: 'companionship', label: '陪护', icon: '👥' },
  { value: 'pet', label: '宠物', icon: '🐕' },
  { value: 'child', label: '儿童', icon: '👶' },
  { value: 'other', label: '其他', icon: '📝' }
]

const form = ref({
  title: '',
  description: '',
  category: 'delivery',
  location: '',
  reward: 0,
  enableAI: true
})

const canSubmit = computed(() => {
  return form.value.title.trim().length >= 5 && 
         form.value.description.trim().length >= 10 &&
         form.value.location.trim().length > 0 &&
         form.value.reward >= 0
})

function saveToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`保存数据失败: ${key}`, e)
  }
}

function loadFromStorage(key: string, defaultValue: any[]) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error(`加载数据失败: ${key}`, e)
  }
  return [...defaultValue]
}

const goBack = () => {
  navigateBack()
}

const submitTask = async () => {
  if (!canSubmit.value) {
    if (form.value.title.trim().length < 5) {
      toastInfo('请输入任务标题（至少5字）')
    } else if (form.value.description.trim().length < 10) {
      toastInfo('请详细描述任务内容（至少10字）')
    } else if (!form.value.location.trim()) {
      toastInfo('请输入服务地点')
    } else {
      toastInfo('请完善任务信息')
    }
    return
  }

  // 创建新任务
  const newTask = {
    id: Date.now().toString(),
    type: form.value.category,
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    reward: Number(form.value.reward) || 0,
    distance: Math.floor(Math.random() * 500) + 50,
    responses: 0,
    creatorName: '我',
    creatorAvatar: 'https://i.pravatar.cc/100?img=8',
    createTime: '刚刚',
    status: 'open',
    creatorRating: 4.5,
    creatorTasks: 10,
    location: form.value.location
  }

  // 保存到任务列表
  const tasks = loadFromStorage(STORAGE_KEY, [])
  tasks.unshift(newTask)
  saveToStorage(STORAGE_KEY, tasks)

  // 保存到我的发起任务
  const myCreatedTasks = loadFromStorage(MY_CREATED_TASKS_KEY, [])
  myCreatedTasks.unshift({
    id: newTask.id,
    title: newTask.title,
    reward: newTask.reward,
    status: newTask.status,
    updateTime: '刚刚'
  })
  saveToStorage(MY_CREATED_TASKS_KEY, myCreatedTasks)

  toastSuccess('任务发布成功')
  setTimeout(() => {
    navigateTo('/pages/ai-helper/index')
  }, 1500)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.header {
  background: var(--color-primary-gradient);
  padding: 16px 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--color-text-white);
}

.back-btn {
  font-size: 28px;
  font-weight: 300;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.placeholder {
  width: 28px;
}

.content {
  padding: 20px;
  padding-bottom: 100px;
}

.form-section {
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.form-input {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-normal);
}

.form-input:focus-within {
  border: 1px solid var(--color-primary);
  box-shadow: var(--shadow-md);
}

.form-input input {
  flex: 1;
  font-size: 15px;
  color: var(--color-text-primary);
  border: none;
  background: transparent;
  outline: none;
}

.form-input input::placeholder {
  color: var(--color-text-placeholder);
}

.reward-unit {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.location-input {
  position: relative;
}

.location-icon {
  font-size: 18px;
  color: var(--color-text-tertiary);
}

.form-textarea {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.form-textarea:focus-within {
  border: 1px solid var(--color-primary);
  box-shadow: var(--shadow-md);
}

.form-textarea textarea {
  width: 100%;
  font-size: 15px;
  color: var(--color-text-primary);
  border: none;
  background: transparent;
  resize: none;
  line-height: 1.5;
  outline: none;
}

.form-textarea textarea::placeholder {
  color: var(--color-text-placeholder);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.category-item {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.category-item:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-soft);
}

.category-item.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.category-item.active .category-text {
  color: var(--color-primary);
  font-weight: 500;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.category-text {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.ai-match-section {
  background: var(--color-info-soft);
  border-radius: var(--radius-xl);
  padding: 16px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ai-icon {
  font-size: 20px;
}

.ai-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.ai-desc {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.ai-toggle {
  flex-shrink: 0;
}

.toggle-switch {
  width: 48px;
  height: 28px;
  background: var(--color-text-muted);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: background var(--transition-normal);
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background: var(--color-text-white);
  border-radius: var(--radius-full);
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.toggle-switch.active .toggle-thumb {
  left: 22px;
}

.submit-btn {
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  padding: 16px;
  border-radius: var(--radius-lg);
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-smooth);
  box-shadow: var(--shadow-sm);
}

.submit-btn:hover:not(.disabled) {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn.disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}
</style>
