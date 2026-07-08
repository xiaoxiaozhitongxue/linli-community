<template>
  <div class="page">
    <NavBar title="修改密码" />

    <div class="content">
      <div class="form-card">
        <!-- 当前密码 -->
        <div class="input-group" :class="{ error: currentPasswordError }">
          <label class="input-label">当前密码</label>
          <div class="input-wrapper" :class="{ focused: currentPasswordFocused }">
            <input
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="请输入当前密码"
              maxlength="20"
              @focus="currentPasswordFocused = true"
              @blur="currentPasswordFocused = false"
              @input="currentPasswordError = ''"
              class="input-field"
            />
            <span class="toggle-btn" @click="showCurrentPassword = !showCurrentPassword">
              <AppIcon :name="showCurrentPassword ? 'eye' : 'eye-off'" class="toggle-icon" />
            </span>
          </div>
          <span v-if="currentPasswordError" class="error-text">{{ currentPasswordError }}</span>
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

        <!-- 密码强度提示 -->
        <div v-if="newPassword && !newPasswordError" class="strength-bar">
          <div class="strength-track">
            <div class="strength-fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
          </div>
          <span class="strength-text" :class="strengthClass">{{ strengthLabel }}</span>
        </div>

        <!-- 提交按钮 -->
        <div
          class="submit-btn"
          :class="{ loading: isLoading, disabled: !canSubmit }"
          @click="handleSubmit"
        >
          <span v-if="!isLoading">确认修改</span>
          <span v-else class="loading-text">
            <span class="spinner"></span>
            修改中...
          </span>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-tip">
        <AppIcon name="help-circle" class="tip-icon" />
        <span class="tip-text">为了账号安全，请勿使用与其他网站相同的密码</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toastSuccess, toastError } from '../../utils/toast'
import { navigateBackSmart } from '../../utils/router'
import { put } from '../../utils/request'
import NavBar from '../../components/NavBar.vue'
import AppIcon from '../../components/AppIcon.vue'

// 表单数据
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 密码可见性
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 聚焦状态
const currentPasswordFocused = ref(false)
const newPasswordFocused = ref(false)
const confirmPasswordFocused = ref(false)

// 错误状态
const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')

// 提交状态
const isLoading = ref(false)

// 验证
const isCurrentPasswordValid = computed(() => currentPassword.value.length >= 6)
const isNewPasswordValid = computed(() => newPassword.value.length >= 6)
const isConfirmPasswordValid = computed(() => confirmPassword.value === newPassword.value && confirmPassword.value.length > 0)
const canSubmit = computed(() =>
  isCurrentPasswordValid.value &&
  isNewPasswordValid.value &&
  isConfirmPasswordValid.value &&
  !isLoading.value
)

// 密码强度
const strengthPercent = computed(() => {
  const pwd = newPassword.value
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score += 20
  if (pwd.length >= 10) score += 10
  if (/[a-z]/.test(pwd)) score += 15
  if (/[A-Z]/.test(pwd)) score += 15
  if (/\d/.test(pwd)) score += 15
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 25
  return Math.min(100, score)
})

const strengthClass = computed(() => {
  const pct = strengthPercent.value
  if (pct < 30) return 'weak'
  if (pct < 60) return 'medium'
  if (pct < 80) return 'strong'
  return 'very-strong'
})

const strengthLabel = computed(() => {
  const pct = strengthPercent.value
  if (pct < 30) return '弱'
  if (pct < 60) return '中等'
  if (pct < 80) return '强'
  return '非常强'
})

// 提交
const handleSubmit = async () => {
  // 验证
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''

  if (!currentPassword.value) {
    currentPasswordError.value = '请输入当前密码'
    return
  }
  if (currentPassword.value.length < 6) {
    currentPasswordError.value = '当前密码至少6位'
    return
  }
  if (!newPassword.value) {
    newPasswordError.value = '请输入新密码'
    return
  }
  if (newPassword.value.length < 6) {
    newPasswordError.value = '新密码至少6位'
    return
  }
  if (newPassword.value === currentPassword.value) {
    newPasswordError.value = '新密码不能与当前密码相同'
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
    isLoading.value = true

    await put('/api/user/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, { showError: true })

    toastSuccess('密码修改成功')
    setTimeout(() => {
      navigateBackSmart()
    }, 800)
  } catch (error: any) {
    toastError(error?.message || '密码修改失败')
  } finally {
    isLoading.value = false
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

/* 表单卡片 */
.form-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
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

/* 密码强度 */
.strength-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.strength-track {
  flex: 1;
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: all var(--transition-smooth);
}

.strength-fill.weak {
  background: var(--color-error);
}

.strength-fill.medium {
  background: #FF9800;
}

.strength-fill.strong {
  background: #4CAF50;
}

.strength-fill.very-strong {
  background: var(--color-primary);
}

.strength-text {
  font-size: var(--font-size-xs);
  white-space: nowrap;
  min-width: 40px;
  text-align: right;
}

.strength-text.weak {
  color: var(--color-error);
}

.strength-text.medium {
  color: #FF9800;
}

.strength-text.strong {
  color: #4CAF50;
}

.strength-text.very-strong {
  color: var(--color-primary);
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

/* 安全提示 */
.security-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
}

.tip-icon {
  font-size: 16px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.tip-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
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
