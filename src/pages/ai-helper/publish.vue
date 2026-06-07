<template>
  <div class="page">
    <div class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <div class="header-content">
        <span class="back-btn" @click="goBack">‹</span>
        <span class="header-title">发布任务</span>
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
            class="category-item" 
            :class="{ active: form.category === 'delivery' }"
            @click="form.category = 'delivery'"
          >
            <span class="category-icon">📦</span>
            <span class="category-text">快递取送</span>
          </div>
          <div 
            class="category-item" 
            :class="{ active: form.category === 'shopping' }"
            @click="form.category = 'shopping'"
          >
            <span class="category-icon">🛒</span>
            <span class="category-text">代购</span>
          </div>
          <div 
            class="category-item" 
            :class="{ active: form.category === 'help' }"
            @click="form.category = 'help'"
          >
            <span class="category-icon">🤝</span>
            <span class="category-text">帮忙</span>
          </div>
          <div 
            class="category-item" 
            :class="{ active: form.category === 'companionship' }"
            @click="form.category = 'companionship'"
          >
            <span class="category-icon">👥</span>
            <span class="category-text">陪护</span>
          </div>
          <div 
            class="category-item" 
            :class="{ active: form.category === 'other' }"
            @click="form.category = 'other'"
          >
            <span class="category-icon">📝</span>
            <span class="category-text">其他</span>
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
            type="text" 
            v-model="form.reward" 
            placeholder="请输入报酬（如：5积分、10元红包等）"
          />
        </div>
      </div>

      <div class="form-section">
        <div class="form-label">截止时间（可选）</div>
        <div class="form-input" @click="showDatePicker">
          <input 
            type="text" 
            v-model="form.deadline" 
            placeholder="选择截止时间"
            disabled
          />
          <span class="arrow-icon">›</span>
        </div>
      </div>

      <div class="ai-match-section">
        <div class="ai-header">
          <span class="ai-icon">🤖</span>
          <span class="ai-title">AI智能推荐</span>
        </div>
        <div class="ai-desc">开启AI推荐，系统将为您匹配合适的帮助者</div>
        <div class="ai-toggle">
          <switch :checked="form.enableAI" @change="(e: any) => form.enableAI = e.detail.value" color="#FF8C42" />
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
import { tasksApi } from '../../utils/api'
import { navigateTo } from '../../utils/router'
import { toastSuccess, toastInfo } from '../../utils/toast'

const statusBarHeight = ref(20)

const form = ref({
  title: '',
  description: '',
  category: 'help',
  location: '',
  reward: '',
  deadline: '',
  enableAI: true
})

const canSubmit = computed(() => {
  return form.value.title.trim().length >= 10 && 
         form.value.description.trim().length >= 50 &&
         form.value.location.trim().length > 0
})

const showDatePicker = () => {
  const now = new Date()
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  uni.showDatePicker({
    mode: 'date',
    title: '选择截止时间',
    success: (res: any) => {
      const selectedDate = new Date(res.value)
      if (selectedDate < now) {
        toastInfo('截止时间不能早于当前时间')
        return
      }
      form.value.deadline = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}

const submitTask = async () => {
  if (!canSubmit.value) {
    toastInfo('请完善任务信息')
    return
  }

  try {
    await tasksApi.createTask({
      title: form.value.title,
      description: form.value.description,
      category: form.value.category as any,
      location: form.value.location,
      reward: form.value.reward || undefined,
      deadline: form.value.deadline || undefined
    })
    
    toastSuccess('任务发布成功')
    setTimeout(() => {
      navigateTo('/pages/ai-helper/index')
    }, 1500)
  } catch (error) {
    console.error('发布任务失败:', error)
    toastInfo('发布失败，请重试')
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-color);
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.header-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  color: white;
}

.back-btn {
  font-size: 28px;
  font-weight: 300;
  margin-right: var(--spacing-md);
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.content {
  padding: var(--spacing-lg);
}

.form-section {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.form-input {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
}

.form-input input {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
}

.form-input input::placeholder {
  color: var(--text-muted);
}

.location-input {
  position: relative;
}

.location-icon {
  font-size: 18px;
  color: var(--text-muted);
}

.arrow-icon {
  font-size: 18px;
  color: var(--text-muted);
}

.form-textarea {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.form-textarea textarea {
  width: 100%;
  font-size: 15px;
  color: var(--text-primary);
  border: none;
  resize: none;
  line-height: 1.5;
}

.form-textarea textarea::placeholder {
  color: var(--text-muted);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.category-item {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.category-item.active {
  border-color: var(--primary-color);
  background: #FFF8F0;
}

.category-icon {
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

.category-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.category-item.active .category-text {
  color: var(--primary-color);
  font-weight: 500;
}

.ai-match-section {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
}

.ai-header {
  display: flex;
  align-items: center;
  margin-right: var(--spacing-sm);
}

.ai-icon {
  font-size: 20px;
}

.ai-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.ai-desc {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.submit-btn.disabled {
  background: #CCC;
  cursor: not-allowed;
}
</style>
