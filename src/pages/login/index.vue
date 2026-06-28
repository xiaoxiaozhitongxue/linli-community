<template>
  <div class="page">
    <div class="auth-container">
      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
      </div>

      <!-- 主内容区 -->
      <div class="auth-card">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo-wrapper">
            <div class="logo">
              <span class="logo-emoji">🏘️</span>
            </div>
          </div>
          <h1 class="app-title">邻里社区</h1>
          <p class="app-subtitle">连接邻里，共建美好社区</p>
        </div>

        <!-- 标签切换 -->
        <div class="tab-switch">
          <div 
            class="tab-item" 
            :class="{ active: currentTab === 'login' }"
            @click="switchTab('login')"
          >
            <span class="tab-icon">🔐</span>
            <span class="tab-text">登录</span>
          </div>
          <div 
            class="tab-item" 
            :class="{ active: currentTab === 'register' }"
            @click="switchTab('register')"
          >
            <span class="tab-icon">📝</span>
            <span class="tab-text">注册</span>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="form-content">
          <!-- 登录表单 -->
          <Transition name="slide-fade">
            <div v-if="currentTab === 'login'" key="login" class="form-panel">
              <!-- 手机号输入 -->
              <div class="input-group" :class="{ error: loginForm.phoneError }">
                <label class="input-label">
                  <span class="label-icon">📱</span>
                  手机号
                </label>
                <div class="input-wrapper" :class="{ focused: loginForm.phoneFocused }">
                  <input 
                    v-model="loginForm.phone"
                    type="tel"
                    maxlength="11"
                    placeholder="请输入手机号"
                    @focus="loginForm.phoneFocused = true"
                    @blur="validateLoginPhone"
                    @input="loginForm.phoneError = ''"
                    class="input-field"
                  />
                  <span v-if="isLoginPhoneValid" class="input-valid">✓</span>
                </div>
                <span v-if="loginForm.phoneError" class="error-hint">{{ loginForm.phoneError }}</span>
              </div>

              <!-- 密码输入 -->
              <div class="input-group" :class="{ error: loginForm.passwordError }">
                <label class="input-label">
                  <span class="label-icon">🔑</span>
                  密码
                </label>
                <div class="input-wrapper" :class="{ focused: loginForm.passwordFocused }">
                  <input 
                    v-model="loginForm.password"
                    :type="loginForm.showPassword ? 'text' : 'password'"
                    maxlength="20"
                    placeholder="请输入密码"
                    @focus="loginForm.passwordFocused = true"
                    @blur="validateLoginPassword"
                    @input="loginForm.passwordError = ''"
                    class="input-field"
                  />
                  <span 
                    class="toggle-password" 
                    @click="loginForm.showPassword = !loginForm.showPassword"
                  >
                    {{ loginForm.showPassword ? '🙈' : '👁️' }}
                  </span>
                </div>
                <span v-if="loginForm.passwordError" class="error-hint">{{ loginForm.passwordError }}</span>
              </div>

              <!-- 登录按钮 -->
              <button 
                class="submit-btn"
                :class="{ loading: loginForm.isLoading, disabled: !canLogin }"
                @click="handleLogin"
              >
                <span v-if="!loginForm.isLoading">登录</span>
                <span v-else class="loading-indicator">
                  <span class="spinner"></span>
                  登录中...
                </span>
              </button>

              <!-- 忘记密码 -->
              <div class="forgot-password">
                <span @click="showForgotPassword = true">忘记密码？</span>
              </div>
            </div>
          </Transition>

          <!-- 注册表单 -->
          <Transition name="slide-fade">
            <div v-if="currentTab === 'register'" key="register" class="form-panel">
              <!-- 手机号输入 -->
              <div class="input-group" :class="{ error: registerForm.phoneError }">
                <label class="input-label">
                  <span class="label-icon">📱</span>
                  手机号
                </label>
                <div class="input-wrapper" :class="{ focused: registerForm.phoneFocused }">
                  <input 
                    v-model="registerForm.phone"
                    type="tel"
                    maxlength="11"
                    placeholder="请输入手机号"
                    @focus="registerForm.phoneFocused = true"
                    @blur="validateRegisterPhone"
                    @input="registerForm.phoneError = ''"
                    class="input-field"
                  />
                  <span v-if="isRegisterPhoneValid" class="input-valid">✓</span>
                </div>
                <span v-if="registerForm.phoneError" class="error-hint">{{ registerForm.phoneError }}</span>
              </div>

              <!-- 密码输入 -->
              <div class="input-group" :class="{ error: registerForm.passwordError }">
                <label class="input-label">
                  <span class="label-icon">🔑</span>
                  密码
                </label>
                <div class="input-wrapper" :class="{ focused: registerForm.passwordFocused }">
                  <input 
                    v-model="registerForm.password"
                    :type="registerForm.showPassword ? 'text' : 'password'"
                    maxlength="20"
                    placeholder="请输入密码（至少6位）"
                    @focus="registerForm.passwordFocused = true"
                    @blur="validateRegisterPassword"
                    @input="registerForm.passwordError = ''"
                    class="input-field"
                  />
                  <span 
                    class="toggle-password" 
                    @click="registerForm.showPassword = !registerForm.showPassword"
                  >
                    {{ registerForm.showPassword ? '🙈' : '👁️' }}
                  </span>
                </div>
                <span v-if="registerForm.passwordError" class="error-hint">{{ registerForm.passwordError }}</span>
              </div>

              <!-- 昵称输入 -->
              <div class="input-group" :class="{ error: registerForm.nicknameError }">
                <label class="input-label">
                  <span class="label-icon">👤</span>
                  昵称
                </label>
                <div class="input-wrapper" :class="{ focused: registerForm.nicknameFocused }">
                  <input 
                    v-model="registerForm.nickname"
                    type="text"
                    maxlength="20"
                    placeholder="请输入昵称"
                    @focus="registerForm.nicknameFocused = true"
                    @blur="validateRegisterNickname"
                    @input="registerForm.nicknameError = ''"
                    class="input-field"
                  />
                  <span v-if="isRegisterNicknameValid" class="input-valid">✓</span>
                </div>
                <span v-if="registerForm.nicknameError" class="error-hint">{{ registerForm.nicknameError }}</span>
              </div>

              <!-- 社区选择 -->
              <div class="input-group" :class="{ error: registerForm.communityError }">
                <label class="input-label">
                  <span class="label-icon">🏠</span>
                  所在社区
                </label>
                <div class="input-wrapper select-wrapper" :class="{ focused: registerForm.communityFocused }">
                  <select 
                    v-model="registerForm.community"
                    @focus="registerForm.communityFocused = true"
                    @blur="validateRegisterCommunity"
                    @input="registerForm.communityError = ''"
                    class="input-field select-field"
                  >
                    <option value="" disabled>请选择社区</option>
                    <option v-for="community in communities" :key="community" :value="community">
                      {{ community }}
                    </option>
                  </select>
                </div>
                <span v-if="registerForm.communityError" class="error-hint">{{ registerForm.communityError }}</span>
              </div>

              <!-- 用户协议 -->
              <div class="agreement-group">
                <label class="agreement-label">
                  <input 
                    type="checkbox" 
                    v-model="registerForm.agreed"
                    @change="registerForm.agreementError = ''"
                  />
                  <span class="checkmark"></span>
                  <span class="agreement-text">
                    我已阅读并同意
                    <span class="link-text">《用户协议》</span>
                    和
                    <span class="link-text">《隐私政策》</span>
                  </span>
                </label>
                <span v-if="registerForm.agreementError" class="error-hint agreement-error">{{ registerForm.agreementError }}</span>
              </div>

              <!-- 注册按钮 -->
              <button 
                class="submit-btn"
                :class="{ loading: registerForm.isLoading, disabled: !canRegister }"
                @click="handleRegister"
              >
                <span v-if="!registerForm.isLoading">注册</span>
                <span v-else class="loading-indicator">
                  <span class="spinner"></span>
                  注册中...
                </span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- 底部提示 -->
        <div class="bottom-hint">
          <span v-if="currentTab === 'login'">还没有账号？</span>
          <span v-else>已有账号？</span>
          <span class="link-text" @click="switchTab(currentTab === 'login' ? 'register' : 'login')">
            {{ currentTab === 'login' ? '立即注册' : '立即登录' }}
          </span>
        </div>
      </div>

      <!-- 全局错误提示 -->
      <Transition name="toast">
        <div v-if="globalError" class="global-error">
          <span class="error-icon">⚠️</span>
          {{ globalError }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toastSuccess, toastError } from '../../utils/toast'
import { showLoading, hideLoading } from '../../utils/ui'
import { useAuth } from '../../store'
import { authService } from '../../services/authService'
import { getAndClearLoginRedirect } from '../../utils/auth'

const { setUser } = useAuth()

// 社区列表
const communities = [
  '阳光社区',
  '幸福社区',
  '花园社区',
  '和平社区',
  '东风社区',
  '向日葵小镇'
]

// 当前标签
const currentTab = ref<'login' | 'register'>('login')

// 全局错误
const globalError = ref('')
let globalErrorTimer: number | null = null

// 登录表单
const loginForm = reactive({
  phone: '',
  password: '',
  showPassword: false,
  phoneFocused: false,
  passwordFocused: false,
  phoneError: '',
  passwordError: '',
  isLoading: false
})

// 注册表单
const registerForm = reactive({
  phone: '',
  password: '',
  nickname: '',
  community: '',
  showPassword: false,
  phoneFocused: false,
  passwordFocused: false,
  nicknameFocused: false,
  communityFocused: false,
  phoneError: '',
  passwordError: '',
  nicknameError: '',
  communityError: '',
  agreementError: '',
  agreed: false,
  isLoading: false
})

// 忘记密码弹窗
const showForgotPassword = ref(false)

// 验证状态
const isLoginPhoneValid = computed(() => loginForm.phone.length === 11 && /^1[3-9]\d{9}$/.test(loginForm.phone))
const isLoginPasswordValid = computed(() => loginForm.password.length >= 6)
const canLogin = computed(() => isLoginPhoneValid.value && isLoginPasswordValid.value && !loginForm.isLoading)

const isRegisterPhoneValid = computed(() => registerForm.phone.length === 11 && /^1[3-9]\d{9}$/.test(registerForm.phone))
const isRegisterPasswordValid = computed(() => registerForm.password.length >= 6)
const isRegisterNicknameValid = computed(() => registerForm.nickname.trim().length >= 2)
const isRegisterCommunityValid = computed(() => registerForm.community.trim().length > 0)
const canRegister = computed(() => 
  isRegisterPhoneValid.value && 
  isRegisterPasswordValid.value && 
  isRegisterNicknameValid.value && 
  isRegisterCommunityValid.value && 
  registerForm.agreed && 
  !registerForm.isLoading
)

// 切换标签
const switchTab = (tab: 'login' | 'register') => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  // 清除错误
  if (tab === 'login') {
    loginForm.phoneError = ''
    loginForm.passwordError = ''
  } else {
    registerForm.phoneError = ''
    registerForm.passwordError = ''
    registerForm.nicknameError = ''
    registerForm.communityError = ''
    registerForm.agreementError = ''
  }
  globalError.value = ''
}

// 显示全局错误
const showGlobalError = (message: string) => {
  globalError.value = message
  if (globalErrorTimer) clearTimeout(globalErrorTimer)
  globalErrorTimer = window.setTimeout(() => {
    globalError.value = ''
  }, 5000)
}

// 登录验证
const validateLoginPhone = () => {
  loginForm.phoneFocused = false
  if (!loginForm.phone) {
    loginForm.phoneError = '请输入手机号'
    return false
  }
  if (loginForm.phone.length !== 11 || !/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    loginForm.phoneError = '手机号格式不正确'
    return false
  }
  loginForm.phoneError = ''
  return true
}

const validateLoginPassword = () => {
  loginForm.passwordFocused = false
  if (!loginForm.password) {
    loginForm.passwordError = '请输入密码'
    return false
  }
  if (loginForm.password.length < 6) {
    loginForm.passwordError = '密码至少6位'
    return false
  }
  loginForm.passwordError = ''
  return true
}

// 注册验证
const validateRegisterPhone = () => {
  registerForm.phoneFocused = false
  if (!registerForm.phone) {
    registerForm.phoneError = '请输入手机号'
    return false
  }
  if (registerForm.phone.length !== 11 || !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    registerForm.phoneError = '手机号格式不正确'
    return false
  }
  registerForm.phoneError = ''
  return true
}

const validateRegisterPassword = () => {
  registerForm.passwordFocused = false
  if (!registerForm.password) {
    registerForm.passwordError = '请输入密码'
    return false
  }
  if (registerForm.password.length < 6) {
    registerForm.passwordError = '密码至少6位'
    return false
  }
  registerForm.passwordError = ''
  return true
}

const validateRegisterNickname = () => {
  registerForm.nicknameFocused = false
  if (!registerForm.nickname.trim()) {
    registerForm.nicknameError = '请输入昵称'
    return false
  }
  if (registerForm.nickname.trim().length < 2) {
    registerForm.nicknameError = '昵称至少2个字符'
    return false
  }
  registerForm.nicknameError = ''
  return true
}

const validateRegisterCommunity = () => {
  registerForm.communityFocused = false
  if (!registerForm.community.trim()) {
    registerForm.communityError = '请选择所在社区'
    return false
  }
  registerForm.communityError = ''
  return true
}

// 处理登录
const router = useRouter()

const handleLogin = async () => {
  loginForm.phoneError = ''
  loginForm.passwordError = ''

  const valid = validateLoginPhone() && validateLoginPassword()
  if (!valid) return

  try {
    loginForm.isLoading = true
    showLoading('登录中...')

    const result: any = await authService.login({
      phone: loginForm.phone,
      password: loginForm.password
    })
    
    if (!result.token || !result.user) {
      throw new Error('登录数据异常')
    }
    
    setUser(result.user, result.token, result.userData)
    
    localStorage.setItem('token', result.token)
    localStorage.setItem('userInfo', JSON.stringify(result.user))
    
    hideLoading()
    loginForm.isLoading = false
    
    toastSuccess('登录成功')
    
    const redirectPath = getAndClearLoginRedirect()
    const targetPath = redirectPath || '/pages/index/index'
    
    setTimeout(async () => {
      await router.replace(targetPath)
    }, 300)
    
  } catch (e: any) {
    hideLoading()
    loginForm.isLoading = false
    const message = e?.message || '登录失败'
    showGlobalError(message)
  }
}

// 处理注册
const handleRegister = async () => {
  registerForm.phoneError = ''
  registerForm.passwordError = ''
  registerForm.nicknameError = ''
  registerForm.communityError = ''
  registerForm.agreementError = ''

  const valid = validateRegisterPhone() && validateRegisterPassword() && validateRegisterNickname() && validateRegisterCommunity()
  if (!valid) return

  if (!registerForm.agreed) {
    registerForm.agreementError = '请先同意用户协议'
    return
  }

  try {
    registerForm.isLoading = true
    showLoading('注册中...')

    const result: any = await authService.register({
      phone: registerForm.phone,
      password: registerForm.password,
      nickname: registerForm.nickname,
      community: registerForm.community
    })
    setUser(result.user, result.token, result.userData)

    hideLoading()
    registerForm.isLoading = false
    toastSuccess('注册成功')

    setTimeout(async () => {
      await router.replace('/pages/index/index')
    }, 500)
  } catch (e: any) {
    hideLoading()
    registerForm.isLoading = false
    const message = e?.message || '注册失败'
    toastError(message)
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--color-primary-gradient-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  position: relative;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(60px);
}

.bg-circle-1 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  top: -100px;
  right: -100px;
}

.bg-circle-2 {
  width: 300px;
  height: 300px;
  background: var(--color-secondary);
  bottom: -50px;
  left: -50px;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  background: var(--color-accent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 主卡片 */
.auth-card {
  background: var(--color-bg-secondary);
  border-radius: 24px;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.logo-wrapper {
  display: inline-block;
  padding: 4px;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 183, 77, 0.1));
  border-radius: 24px;
  margin-bottom: var(--spacing-md);
}

.logo {
  width: 80px;
  height: 80px;
  background: var(--color-primary-gradient);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 40px;
  position: relative;
  z-index: 1;
}

.app-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs);
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* 标签切换 */
.tab-switch {
  display: flex;
  background: var(--color-bg-tertiary);
  border-radius: 16px;
  padding: 4px;
  margin-bottom: var(--spacing-xl);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition-smooth);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.tab-item.active {
  background: var(--color-primary-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transform: translateY(-1px);
}

.tab-icon {
  font-size: 18px;
}

.tab-text {
  font-size: var(--font-size-sm);
}

/* 表单内容 */
.form-content {
  min-height: 280px;
}

.form-panel {
  animation: fadeInUp 0.3s ease-out;
}

/* 输入组 */
.input-group {
  margin-bottom: var(--spacing-lg);
}

.input-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.label-icon {
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  background: var(--color-bg-tertiary);
  border-radius: 12px;
  padding: 0 var(--spacing-md);
  border: 2px solid transparent;
  transition: all var(--transition-smooth);
}

.input-wrapper.focused {
  border-color: var(--color-primary);
  background: var(--color-bg-secondary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}

.select-wrapper {
  padding: 0;
}

.input-field {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
}

.select-field {
  cursor: pointer;
  appearance: none;
  padding: 0 var(--spacing-md);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23999' d='M7 10L3 6h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.input-field::placeholder {
  color: var(--color-text-placeholder);
}

.toggle-password {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.toggle-password:hover {
  opacity: 1;
}

.input-valid {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-success);
  font-weight: bold;
  font-size: 16px;
}

.error-hint {
  display: block;
  font-size: 12px;
  color: var(--color-error);
  margin-top: 6px;
  animation: fadeIn 0.2s ease-out;
}

.agreement-error {
  margin-top: 0;
}

/* 用户协议 */
.agreement-group {
  margin-bottom: var(--spacing-lg);
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.agreement-label input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-medium);
  border-radius: 4px;
  margin-top: 2px;
  flex-shrink: 0;
  position: relative;
  transition: all var(--transition-smooth);
}

.agreement-label input:checked + .checkmark {
  background: var(--color-primary-gradient);
  border-color: var(--color-primary);
}

.agreement-label input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

.agreement-text {
  font-size: 12px;
  color: var(--color-text-tertiary);
  line-height: 1.5;
}

.link-text {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.link-text:hover {
  color: var(--color-primary-dark);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-smooth);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
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

.loading-indicator {
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

/* 忘记密码 */
.forgot-password {
  text-align: right;
  margin-top: var(--spacing-sm);
}

.forgot-password span {
  font-size: 12px;
  color: var(--color-primary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.forgot-password span:hover {
  color: var(--color-primary-dark);
}

/* 底部提示 */
.bottom-hint {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.bottom-hint .link-text {
  margin-left: 4px;
}

/* 全局错误提示 */
.global-error {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-error);
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-xl);
  z-index: 10000;
  max-width: 90%;
}

.error-icon {
  font-size: 18px;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* 响应式 */
@media (max-width: 480px) {
  .page {
    padding: var(--spacing-md);
  }

  .auth-card {
    padding: var(--spacing-xl);
    border-radius: 20px;
  }

  .logo {
    width: 68px;
    height: 68px;
    border-radius: 16px;
  }

  .logo-emoji {
    font-size: 34px;
  }

  .app-title {
    font-size: 24px;
  }

  .submit-btn {
    height: 44px;
  }
}
</style>
