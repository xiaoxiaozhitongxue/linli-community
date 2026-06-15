<template>
  <div class="page">
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <span class="logo-emoji">🏘️</span>
        </div>
        <span class="app-name">邻里社区</span>
        <span class="app-slogan">连接邻里，共建美好社区</span>
      </div>

      <!-- 登录表单 -->
      <div class="form-section" :class="{ shake: isShaking }">
        <!-- 手机号输入 -->
        <div class="input-group" :class="{ error: phoneError }">
          <div class="input-label">手机号</div>
          <div class="input-row" :class="{ focused: phoneFocused }">
            <input 
              class="input-field" 
              type="tel" 
              v-model="phone" 
              placeholder="请输入手机号"
              maxlength="11"
              @focus="onPhoneFocus"
              @blur="onPhoneBlur"
              @input="onPhoneInput"
            />
            <span class="input-icon" :class="{ valid: phoneValid }">✓</span>
          </div>
          <div class="error-text" v-if="phoneError">{{ phoneError }}</div>
        </div>

        <!-- 密码输入 -->
        <div class="input-group" :class="{ error: passwordError }">
          <div class="input-label">密码</div>
          <div class="input-row" :class="{ focused: passwordFocused }">
            <input 
              class="input-field" 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="请输入密码（至少6位）"
              maxlength="20"
              @focus="onPasswordFocus"
              @blur="onPasswordBlur"
              @input="onPasswordInput"
            />
            <span class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>
          <div class="error-text" v-if="passwordError">{{ passwordError }}</div>
        </div>

        <!-- 登录按钮 -->
        <div 
          class="login-btn" 
          :class="{ loading: isLoading, disabled: !canLogin }"
          @click="handleLogin"
        >
          <span v-if="!isLoading">登录</span>
          <span v-else class="loading-text">
            <span class="spinner"></span>
            登录中...
          </span>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？<span class="link-text" @click="showRegisterModal = true">立即注册</span>
        </div>
      </div>

      <!-- 全局错误提示 -->
      <Transition name="toast">
        <div v-if="globalError" class="global-error">
          <span class="error-icon">⚠️</span>
          {{ globalError }}
          <span v-if="globalError === '该手机号未注册'" class="register-link-in-error" @click="showRegisterModal = true">去注册</span>
        </div>
      </Transition>

      <!-- 注册弹窗 -->
      <Transition name="modal">
        <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <span class="modal-title">注册账号</span>
              <span class="modal-close" @click="showRegisterModal = false">×</span>
            </div>
            <div class="modal-body">
              <div class="input-group" :class="{ error: registerPhoneError }">
                <div class="input-label">手机号</div>
                <input 
                  class="input-field" 
                  type="tel" 
                  v-model="registerPhone" 
                  placeholder="请输入手机号"
                  maxlength="11"
                  @input="registerPhoneError = ''"
                />
                <div class="error-text" v-if="registerPhoneError">{{ registerPhoneError }}</div>
              </div>
              <div class="input-group" :class="{ error: registerPasswordError }">
                <div class="input-label">密码</div>
                <input 
                  class="input-field" 
                  type="password" 
                  v-model="registerPassword" 
                  placeholder="请输入密码（至少6位）"
                  maxlength="20"
                  @input="registerPasswordError = ''"
                />
                <div class="error-text" v-if="registerPasswordError">{{ registerPasswordError }}</div>
              </div>
              <div class="input-group" :class="{ error: registerNicknameError }">
                <div class="input-label">昵称</div>
                <input 
                  class="input-field" 
                  type="text" 
                  v-model="registerNickname" 
                  placeholder="请输入昵称"
                  maxlength="20"
                  @input="registerNicknameError = ''"
                />
                <div class="error-text" v-if="registerNicknameError">{{ registerNicknameError }}</div>
              </div>
              <div class="input-group" :class="{ error: registerCommunityError }">
                <div class="input-label">所属社区</div>
                <input 
                  class="input-field" 
                  type="text" 
                  v-model="registerCommunity" 
                  placeholder="请输入所属社区"
                  maxlength="50"
                  @input="registerCommunityError = ''"
                />
                <div class="error-text" v-if="registerCommunityError">{{ registerCommunityError }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="modal-btn cancel" @click="showRegisterModal = false">取消</div>
              <div 
                class="modal-btn confirm" 
                :class="{ loading: isRegisterLoading }"
                @click="handleRegister"
              >
                <span v-if="!isRegisterLoading">注册</span>
                <span v-else>注册中...</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { toastSuccess, toastError, toastInfo } from '../../utils/toast'
import { navigateTo, switchTab, redirectTo } from '../../utils/router'
import { showLoading, hideLoading } from '../../utils/ui'
import { useAuth } from '../../store'
import { authApi } from '../../utils/api'
import { getAndClearLoginRedirect } from '../../utils/auth'

const { setUser } = useAuth()

// 表单数据
const phone = ref('')
const password = ref('')
const showPassword = ref(false)

// 注册表单数据
const showRegisterModal = ref(false)
const registerPhone = ref('')
const registerPassword = ref('')
const registerNickname = ref('')
const registerCommunity = ref('')
const isRegisterLoading = ref(false)
const registerPhoneError = ref('')
const registerPasswordError = ref('')
const registerNicknameError = ref('')
const registerCommunityError = ref('')

// UI状态
const counting = ref(false)
const countdown = ref(60)
const isLoading = ref(false)
const isShaking = ref(false)

// 聚焦状态
const phoneFocused = ref(false)
const passwordFocused = ref(false)

// 错误状态
const phoneError = ref('')
const passwordError = ref('')
const globalError = ref('')

let countdownTimer: number | null = null
let shakeTimer: number | null = null
let globalErrorTimer: number | null = null

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (shakeTimer) clearTimeout(shakeTimer)
  if (globalErrorTimer) clearTimeout(globalErrorTimer)
})

// 验证状态
const phoneValid = computed(() => {
  return phone.value.length === 11 && /^1\d{10}$/.test(phone.value)
})

// 密码验证
const passwordValid = computed(() => {
  return password.value.length >= 6
})

const canLogin = computed(() => phoneValid.value && passwordValid.value && !isLoading.value)

// 聚焦/失焦处理
const onPhoneFocus = () => { phoneFocused.value = true }
const onPhoneBlur = () => { 
  phoneFocused.value = false
  validatePhone()
}
const onPasswordFocus = () => { passwordFocused.value = true }
const onPasswordBlur = () => { 
  passwordFocused.value = false
  validatePassword()
}

// 输入处理
const onPhoneInput = () => {
  // 清除错误
  if (phoneError.value) phoneError.value = ''
}

const onPasswordInput = () => {
  // 清除错误
  if (passwordError.value) passwordError.value = ''
}

// 验证
const validatePhone = () => {
  if (!phone.value) {
    phoneError.value = '请输入手机号'
    return false
  }
  if (phone.value.length !== 11) {
    phoneError.value = '手机号格式不正确'
    return false
  }
  if (!/^1\d{10}$/.test(phone.value)) {
    phoneError.value = '手机号格式不正确'
    return false
  }
  phoneError.value = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '请输入密码'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = '密码至少6位'
    return false
  }
  passwordError.value = ''
  return true
}

// 触发shake动画
const triggerShake = () => {
  isShaking.value = true
  if (shakeTimer) clearTimeout(shakeTimer)
  shakeTimer = window.setTimeout(() => {
    isShaking.value = false
  }, 500)
}

// 显示全局错误
const showGlobalError = (message: string) => {
  globalError.value = message
  if (globalErrorTimer) clearTimeout(globalErrorTimer)
  globalErrorTimer = window.setTimeout(() => {
    globalError.value = ''
  }, 5000)
}

// 处理登录
const handleLogin = async () => {
  // 清除之前的错误
  phoneError.value = ''
  passwordError.value = ''

  // 验证所有字段
  const valid = validatePhone() && validatePassword()
  if (!valid) {
    triggerShake()
    return
  }

  try {
    isLoading.value = true
    showLoading('登录中...')

    const result: any = await authApi.login({
      phone: phone.value,
      password: password.value
    })
    setUser(result.user, result.token, result.userData)

    hideLoading()
    toastSuccess('登录成功')

    // 登录成功后，检查是否有重定向路径
    setTimeout(() => {
      const redirectPath = getAndClearLoginRedirect()
      if (redirectPath) {
        // 使用replace确保正确跳转
        window.location.hash = '#' + redirectPath
        window.location.reload()
      } else {
        // 使用replace确保正确跳转
        window.location.hash = '#/pages/index/index'
        window.location.reload()
      }
    }, 500)
  } catch (e: any) {
    hideLoading()
    isLoading.value = false
    const message = e?.message || '登录失败'
    showGlobalError(message)
    triggerShake()
  }
}

// 处理注册
const handleRegister = async () => {
  // 验证输入
  registerPhoneError.value = ''
  registerPasswordError.value = ''
  registerNicknameError.value = ''
  registerCommunityError.value = ''

  if (!registerPhone.value) {
    registerPhoneError.value = '请输入手机号'
    return
  }
  if (registerPhone.value.length !== 11 || !/^1\d{10}$/.test(registerPhone.value)) {
    registerPhoneError.value = '手机号格式不正确'
    return
  }
  if (!registerPassword.value) {
    registerPasswordError.value = '请输入密码'
    return
  }
  if (registerPassword.value.length < 6) {
    registerPasswordError.value = '密码至少6位'
    return
  }
  if (!registerNickname.value) {
    registerNicknameError.value = '请输入昵称'
    return
  }
  if (registerNickname.value.length < 2) {
    registerNicknameError.value = '昵称至少2位'
    return
  }
  if (!registerCommunity.value) {
    registerCommunityError.value = '请输入所属社区'
    return
  }

  try {
    isRegisterLoading.value = true
    showLoading('注册中...')

    const result: any = await authApi.register({
      phone: registerPhone.value,
      password: registerPassword.value,
      nickname: registerNickname.value,
      community: registerCommunity.value
    })
    setUser(result.user, result.token, result.userData)

    hideLoading()
    isRegisterLoading.value = false
    showRegisterModal.value = false
    toastSuccess('注册成功')

    // 注册成功后跳转到首页
    setTimeout(() => {
      switchTab('/pages/index/index')
    }, 800)
  } catch (e: any) {
    hideLoading()
    isRegisterLoading.value = false
    const message = e?.message || '注册失败'
    toastError(message)
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-primary-gradient-soft);
}

.login-container {
  padding: var(--spacing-lg);
  padding-top: 60px;
  max-width: 400px;
  margin: 0 auto;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  animation: fadeInDown var(--transition-slow) ease-out;
}

.logo {
  width: 88px;
  height: 88px;
  background: var(--color-primary-gradient);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  box-shadow: var(--shadow-glow);
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

.logo-emoji {
  font-size: 44px;
  position: relative;
  z-index: 1;
}

.app-name {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
}

.app-slogan {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* 表单区域 */
.form-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  animation: fadeInUp var(--transition-slow) ease-out 0.1s both;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.form-section:hover::before {
  opacity: 1;
}

/* Shake动画 */
.form-section.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

/* 输入组 */
.input-group {
  margin-bottom: var(--spacing-lg);
  transition: transform var(--transition-fast);
}

.input-group.error {
  animation: inputShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.input-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.input-row {
  display: flex;
  align-items: center;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 2px solid transparent;
  transition: all var(--transition-smooth);
}

.input-row.focused {
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 4px var(--color-primary-soft), var(--shadow-sm);
}

.input-field {
  flex: 1;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  border: none;
  background: transparent;
  outline: none;
}

.select-field {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.5L2 4.5h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

.input-field::placeholder {
  color: var(--color-text-placeholder);
}

.input-icon {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  background: var(--color-text-muted);
  opacity: 0;
  transform: scale(0);
  transition: all var(--transition-smooth);
}

.input-icon.valid {
  opacity: 1;
  transform: scale(1);
  background: var(--color-success);
  animation: iconPop 0.3s var(--transition-spring);
}

.password-toggle {
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.password-toggle:hover {
  opacity: 1;
}

/* 错误文本 */
.error-text {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-top: var(--spacing-xs);
  opacity: 0;
  transform: translateY(-5px);
  transition: all var(--transition-normal);
}

.input-group.error .error-text,
.agreement-error {
  opacity: 1;
  transform: translateY(0);
}

/* 验证码行 */
.code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
}

.code-row .error-text {
  flex: 1;
  margin-top: 0;
  margin-right: var(--spacing-md);
}

.code-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-gradient);
  color: white;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-smooth);
  min-width: 90px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25);
  position: relative;
  overflow: hidden;
}

.code-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-slow);
}

.code-btn:hover:not(.disabled)::before {
  left: 100%;
}

.code-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.35);
}

.code-btn:active:not(.disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.25);
}

.code-btn.disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.code-btn.loading {
  pointer-events: none;
}

.countdown {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 协议 */
.agreement {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
}

.agreement.error {
  margin-bottom: 0;
}

.agreement-check {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-sm);
  margin-right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  flex-shrink: 0;
  margin-top: 1px;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.agreement-check.checked {
  background: var(--color-primary-gradient);
  border-color: var(--color-primary);
  transform: scale(1);
}

.agreement-check.bounce {
  animation: checkBounce 0.3s var(--transition-spring);
}

.agreement-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  line-height: 1.6;
}

.agreement-link {
  color: var(--color-primary);
  cursor: pointer;
  transition: color var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.agreement-link:hover {
  color: var(--color-primary-dark);
}

.agreement-error {
  margin-top: var(--spacing-xs);
}

/* 登录按钮 */
.login-btn {
  background: var(--color-primary-gradient);
  color: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-smooth);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left var(--transition-slow);
}

.login-btn:hover:not(.disabled):not(.loading)::before {
  left: 100%;
}

.login-btn:hover:not(.disabled):not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.login-btn:active:not(.disabled):not(.loading) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.25);
}

.login-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-text-muted);
  box-shadow: none;
}

.login-btn.loading {
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

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.link-text {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  margin-left: 4px;
  transition: color var(--transition-smooth);
}

.link-text:hover {
  color: var(--color-primary-dark);
}

/* 全局错误提示 */
.global-error {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-error);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-xl);
  z-index: 10000;
  max-width: 90%;
}

.error-icon {
  font-size: 16px;
}

/* Toast过渡动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-smooth);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* 动画 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }
}

@keyframes inputShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes checkBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes iconPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

/* 响应式布局 */
@media (max-width: 480px) {
  .login-container {
    padding-top: 40px;
  }
  
  .logo {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-lg);
  }
  
  .logo-emoji {
    font-size: 36px;
  }
  
  .app-name {
    font-size: 24px;
  }
  
  .form-section {
    padding: var(--spacing-lg);
  }
}
</style>
