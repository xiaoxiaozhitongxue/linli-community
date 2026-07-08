<template>
  <div class="page">
    <NavBar title="忘记密码" />

    <div class="content">
      <!-- 步骤提示 -->
      <div class="step-indicator">
        <div class="step-item" :class="{ active: step === 1, done: step > 1 }">
          <div class="step-circle">
            <span v-if="step === 1">1</span>
            <span v-else class="step-check">✓</span>
          </div>
          <span class="step-label">验证身份</span>
        </div>
        <div class="step-line" :class="{ done: step > 1 }"></div>
        <div class="step-item" :class="{ active: step === 2 }">
          <div class="step-circle">2</div>
          <span class="step-label">重置密码</span>
        </div>
      </div>

      <!-- 步骤1：验证手机号 -->
      <div v-if="step === 1" class="form-card">
        <div class="card-header">
          <h2 class="card-title">验证身份</h2>
          <p class="card-desc">请输入您注册时使用的手机号</p>
        </div>

        <div class="input-group" :class="{ error: phoneError }">
          <label class="input-label">手机号</label>
          <div class="input-wrapper" :class="{ focused: phoneFocused }">
            <input
              v-model="phone"
              type="tel"
              maxlength="11"
              placeholder="请输入注册手机号"
              @focus="phoneFocused = true"
              @blur="phoneFocused = false"
              @input="onPhoneInput"
              class="input-field"
            />
          </div>
          <span v-if="phoneError" class="error-text">{{ phoneError }}</span>
        </div>

        <div
          class="submit-btn"
          :class="{ disabled: !phoneValid }"
          @click="handleVerifyPhone"
        >
          <span>下一步</span>
        </div>
      </div>

      <!-- 步骤2：重置密码 -->
      <div v-if="step === 2" class="form-card">
        <div class="card-header">
          <h2 class="card-title">重置密码</h2>
          <p class="card-desc">请设置您的新密码</p>
        </div>

        <!-- 新密码 -->
        <div class="input-group" :class="{ error: newPasswordError }">
          <label class="input-label">新密码</label>
          <div class="input-wrapper" :class="{ focused: newPasswordFocused }">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="请输入新密码（至少6位）"
              maxlength="20"
              @focus="newPasswordFocused = true"
              @blur="newPasswordFocused = false"
              @input="newPasswordError = ''"
              class="input-field"
            />
            <span class="toggle-btn" @click="showNewPassword = !showNewPassword">
              <AppIcon :name="showNewPassword ? 'eye' : 'eye-off'" class="toggle-icon" />
            </span>
          </div>
          <span v-if="newPasswordError" class="error-text">{{ newPasswordError }}</span>
        </div>

        <!-- 确认新密码 -->
        <div class="input-group" :class="{ error: confirmPasswordError }">
          <label class="input-label">确认新密码</label>
          <div class="input-wrapper" :class="{ focused: confirmPasswordFocused }">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入新密码"
              maxlength="20"
              @focus="confirmPasswordFocused = true"
              @blur="confirmPasswordFocused = false"
              @input="confirmPasswordError = ''"
              class="input-field"
            />
            <span class="toggle-btn" @click="showConfirmPassword = !showConfirmPassword">
              <AppIcon :name="showConfirmPassword ? 'eye' : 'eye-off'" class="toggle-icon" />
            </span>
          </div>
          <span v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</span>
        </div>

        <div
          class="submit-btn"
          :class="{ loading: isLoadingStep2, disabled: !canReset }"
          @click="handleResetPassword"
        >
          <span v-if="!isLoadingStep2">确认重置</span>
          <span v-else class="loading-text">
            <span class="spinner"></span>
            重置中...
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toastSuccess, toastError } from '../../utils/toast'
import { navigateTo } from '../../utils/router'
import { post } from '../../utils/request'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'

// 步骤
const step = ref(1)

// 步骤1 数据
const phone = ref('')
const phoneFocused = ref(false)
const phoneError = ref('')

// 步骤2 数据
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const newPasswordFocused = ref(false)
const confirmPasswordFocused = ref(false)
const newPasswordError = ref('')
const confirmPasswordError = ref('')
const isLoadingStep2 = ref(false)

// 验证
const phoneValid = computed(() => phone.value.length === 11 && /^1[3-9]\d{9}$/.test(phone.value))
const newPasswordValid = computed(() => newPassword.value.length >= 6)
const confirmPasswordValid = computed(() => confirmPassword.value === newPassword.value && confirmPassword.value.length > 0)
const canReset = computed(() => newPasswordValid.value && confirmPasswordValid.value && !isLoadingStep2.value)

// 手机号输入
const onPhoneInput = () => {
  phone.value = phone.value.replace(/\D/g, '')
  if (phoneError.value) phoneError.value = ''
}

// 步骤1：验证手机号（仅前端校验格式，无需调用后端）
const handleVerifyPhone = () => {
  phoneError.value = ''

  if (!phone.value) {
    phoneError.value = '请输入手机号'
    return
  }
  if (!phoneValid.value) {
    phoneError.value = '手机号格式不正确'
    return
  }

  // 验证通过，进入步骤2
  step.value = 2
}

// 步骤2：重置密码
const handleResetPassword = async () => {
  newPasswordError.value = ''
  confirmPasswordError.value = ''

  if (!newPassword.value) {
    newPasswordError.value = '请输入新密码'
    return
  }
  if (newPassword.value.length < 6) {
    newPasswordError.value = '新密码至少6位'
    return
  }
  if (!confirmPassword.value) {
    confirmPasswordError.value = '请确认新密码'
    return
  }
  if (confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = '两次输入的密码不一致'
    return
  }

  try {
    isLoadingStep2.value = true

    await post('/api/auth/reset-password', {
      phone: phone.value,
      newPassword: newPassword.value
    }, { showError: true })

    toastSuccess('密码重置成功')
    setTimeout(() => {
      navigateTo('/pages/login/index')
    }, 800)
  } catch (error: any) {
    // 错误已由 request.ts 的 showError 自动处理
    console.error('Reset password error:', error)
  } finally {
    isLoadingStep2.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}

.content {
  padding: var(--spacing-lg);
  max-width: 420px;
  margin: 0 auto;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg) 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
  transition: all var(--transition-smooth);
}

.step-item.active .step-circle {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.step-item.done .step-circle {
  background: var(--color-success);
  color: white;
}

.step-check {
  font-size: 16px;
}

.step-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  transition: color var(--transition-smooth);
}

.step-item.active .step-label {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--color-border-light);
  margin: 0 var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  transition: background var(--transition-smooth);
}

.step-line.done {
  background: var(--color-success);
}

/* 表单卡片 */
.form-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
}

.card-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* 输入组 */
.input-group {
  margin-bottom: var(--spacing-lg);
}

.input-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
  border: 2px solid transparent;
  transition: all var(--transition-smooth);
}

.input-wrapper.focused {
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}

.input-group.error .input-wrapper {
  border-color: var(--color-error);
}

.input-field {
  flex: 1;
  height: 48px;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  border: none;
  background: transparent;
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text-placeholder);
}

.toggle-btn {
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.toggle-btn:hover {
  opacity: 1;
}

.toggle-icon {
  font-size: 18px;
  display: flex;
}

/* 错误文本 */
.error-text {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-top: var(--spacing-xs);
  animation: fadeIn 0.2s ease-out;
}

/* 提交按钮 */
.submit-btn {
  background: var(--color-primary-gradient);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-smooth);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  margin-top: var(--spacing-lg);
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left var(--transition-slow);
}

.submit-btn:hover:not(.disabled):not(.loading)::before {
  left: 100%;
}

.submit-btn:hover:not(.disabled):not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.submit-btn:active:not(.disabled):not(.loading) {
  transform: translateY(0) scale(0.98);
}

.submit-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-text-muted);
  box-shadow: none;
}

.submit-btn.loading {
  pointer-events: none;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
