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
            placeholder="请输入任务标题（至少2个字）"
            maxlength="30"
          />
        </div>
        <div class="form-hint">
          <span class="char-count" :class="{ valid: form.title.trim().length >= 2 }">
            {{ form.title.trim().length }}/30
          </span>
        </div>
      </div>

      <div class="form-section">
        <div class="form-label">任务描述</div>
        <div class="form-textarea">
          <textarea 
            v-model="form.description" 
            placeholder="请详细描述任务内容（至少5个字）"
            maxlength="200"
            rows="4"
          ></textarea>
        </div>
        <div class="form-hint">
          <span class="char-count" :class="{ valid: form.description.trim().length >= 5 }">
            {{ form.description.trim().length }}/200
          </span>
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

      <div class="submit-section">
        <div class="submit-progress" v-if="!canSubmit">
          <div class="progress-title">请完善以下信息：</div>
          <div class="progress-item" :class="{ completed: form.title.trim().length >= 2 }">
            <span class="progress-icon">{{ form.title.trim().length >= 2 ? '✓' : '○' }}</span>
            <span>任务标题（至少2字）</span>
          </div>
          <div class="progress-item" :class="{ completed: form.description.trim().length >= 5 }">
            <span class="progress-icon">{{ form.description.trim().length >= 5 ? '✓' : '○' }}</span>
            <span>任务描述（至少5字）</span>
          </div>
          <div class="progress-item" :class="{ completed: form.location.trim().length > 0 }">
            <span class="progress-icon">{{ form.location.trim().length > 0 ? '✓' : '○' }}</span>
            <span>服务地点</span>
          </div>
        </div>
        <div class="submit-btn" @click="submitTask" :class="{ disabled: !canSubmit }">
          {{ canSubmit ? '发布任务' : '请完善信息' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { navigateTo, navigateBackSmart, getUserStorageKey } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'
import { useAuth } from '../../store/index'

const STORAGE_KEY = 'ai_helper_tasks'
const MY_CREATED_TASKS_KEY = 'ai_helper_my_created_tasks'

// 默认模拟任务数据
const defaultTasks = [
  {
    id: '1',
    type: 'delivery',
    title: '帮忙取个快递',
    description: '菜鸟驿站，3个包裹，有密码，取件码1234',
    reward: 5,
    distance: 150,
    responses: 3,
    creatorName: '小红',
    creatorAvatar: 'https://i.pravatar.cc/100?img=4',
    createTime: '10分钟前',
    status: 'open',
    creatorRating: 4.8,
    creatorTasks: 23,
    location: '阳光社区 菜鸟驿站'
  },
  {
    id: '2',
    type: 'shopping',
    title: '帮忙带份早餐',
    description: '永和大王，豆浆油条套餐，加个煎蛋',
    reward: 8,
    distance: 200,
    responses: 5,
    creatorName: '上班族小王',
    creatorAvatar: 'https://i.pravatar.cc/100?img=5',
    createTime: '20分钟前',
    status: 'open',
    creatorRating: 4.5,
    creatorTasks: 12,
    location: '永和大王 阳光社区店'
  },
  {
    id: '3',
    type: 'pet',
    title: '代遛金毛半小时',
    description: '金毛很温顺，就在楼下花园，疫苗已打',
    reward: 15,
    distance: 80,
    responses: 2,
    creatorName: '铲屎官小刘',
    creatorAvatar: 'https://i.pravatar.cc/100?img=6',
    createTime: '1小时前',
    status: 'ongoing',
    creatorRating: 4.9,
    creatorTasks: 56,
    location: '阳光社区 花园'
  },
  {
    id: '4',
    type: 'child',
    title: '帮忙接孩子',
    description: '阳光小学门口，4点15分，两个孩子，一个书包',
    reward: 25,
    distance: 300,
    responses: 1,
    creatorName: '双职工家庭',
    creatorAvatar: 'https://i.pravatar.cc/100?img=7',
    createTime: '2小时前',
    status: 'open',
    creatorRating: 4.6,
    creatorTasks: 8,
    location: '阳光小学 门口'
  }
]

const defaultMyCreatedTasks = [
  { id: '1', title: '取快递', reward: 5, status: 'ongoing', updateTime: '进行中' },
  { id: '2', title: '带早餐', reward: 8, status: 'completed', updateTime: '已完成' }
]

const { user } = useAuth()

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
  return form.value.title.trim().length >= 2 && 
         form.value.description.trim().length >= 5 &&
         form.value.location.trim().length > 0
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
  navigateBackSmart()
}

const submitTask = async () => {
  if (!canSubmit.value) {
    if (form.value.title.trim().length < 2) {
      toastInfo('请输入任务标题（至少2个字）')
    } else if (form.value.description.trim().length < 5) {
      toastInfo('请详细描述任务内容（至少5个字）')
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
    creatorName: user.value?.nickname || '邻里用户',
    creatorAvatar: user.value?.avatar || 'https://i.pravatar.cc/100?img=8',
    createTime: '刚刚',
    status: 'open',
    creatorRating: user.value?.credit_score ? Number((user.value.credit_score / 20).toFixed(1)) : 4.5,
    creatorTasks: 10,
    location: form.value.location
  }

  // 使用用户专属键保存
  const userTaskKey = getUserStorageKey('ai_helper_tasks')
  const userCreatedKey = getUserStorageKey('ai_helper_my_created_tasks')

  // 保存到任务列表
  const tasks = loadFromStorage(userTaskKey, [])
  tasks.unshift(newTask)
  saveToStorage(userTaskKey, tasks)

  // 保存到我的发起任务
  const myCreatedTasks = loadFromStorage(userCreatedKey, [])
  myCreatedTasks.unshift({
    id: newTask.id,
    title: newTask.title,
    reward: newTask.reward,
    status: newTask.status,
    updateTime: '刚刚'
  })
  saveToStorage(userCreatedKey, myCreatedTasks)

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

.form-hint {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.char-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.char-count.valid {
  color: var(--color-success);
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

.submit-section {
  margin-top: 32px;
}

.submit-progress {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-item.completed {
  color: var(--color-success);
}

.progress-icon {
  font-size: 14px;
  width: 20px;
}
</style>
